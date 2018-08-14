import signalr from 'react-native-signalr';
import { IM, Knowledge } from './data-access/';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import Enumerable from 'linq';
import moment from 'moment';
import React, { Component } from 'react';
import { extendObservable, action, computed, toJS, observable, autorun } from 'mobx';
import { observer } from 'mobx-react/native';
import { ServingClient } from './yqfws';
import uuid from 'react-native-uuid';
import deepDiffer from 'deepDiffer';
import ChatRoom from '../im1/chatRoom';
import { NativeModules, Alert, NetInfo, Platform } from 'react-native';
import { Storage } from '../im1/libs/storage';

@observer
export class Chat extends Component {
    @observable static obj = {
        conversations: [],
        conversationHeaders: [{
            Name: "系统通知",
            FaceUrlPath: [],
            UnreadCount: 0,
            ConversationType: "System"
        }],
        isFinish: false,
        totalUnReadMessage: 0,//消息未读数
        Source: "差旅宝",
        Platform: "MobileDevice",
        isLogout: false,
        connectionState: 0 //0:连接中 1:已连接 3:已断开
    };
    static usersInfo = [];

    //初始化（连接IM服务器）
    static init = async (userCode, kickOff) => {
        //已连接状态不再进行连接
        if (Chat.obj.connectionState == 1)
            return;
        //初始化SQLite
        Storage.openDataBase(userCode);
        let result = await IM.getToken({
            "Platform": Chat.obj.Platform,
            "UserCode": userCode,
            "Source": Chat.obj.Source
        });
        Chat.userInfo = result;
        Chat.obj.connectionState = 0;
        //监听网络连接
        NetInfo.isConnected.addEventListener('change', (isConnected) => {
            if (isConnected) Chat.obj.connectionState = 1;
            else Chat.obj.connectionState = 3;
        });
        console.log(result);
        //定时获取系统通知
        Chat.getMsgCount();
        if (Chat.interval) clearInterval(Chat.interval);
        Chat.interval = setInterval(() => {
            Chat.getMsgCount();
        }, 10000);
        Chat.connection = signalr.hubConnection('https://im.yiqifei.com', {
            qs: 'token=' + result.Token,
        });
        Chat.obj.isLogout = false;
        Chat.connection.logging = true;
        Chat.connection.disconnectTimeout = 100;
        Chat.proxy = Chat.connection.createHubProxy('Chat');
        Chat.proxy.on('OnChat', (message) => {
            //console.log(message);
            Chat.insertConversation(message);
        });
        Chat.proxy.on('OnKickOff', (message) => {
            Chat.logout();
            Alert.alert('', "当前账户已在其它设备上登录", [
                {
                    text: '确定', onPress: () => {
                        if (kickOff) kickOff();
                    }
                }
            ]);
        });
        Chat.connection.start().done(() => {
            Chat.getConversations();
            //注册极光推送
            if (NativeModules.MyNativeModule.setTagsWithAlias) {
                NativeModules.MyNativeModule.setTagsWithAlias([userCode, result.User.PersonCode], Chat.userInfo.User.IMNr);
            }
            autorun(() => {
                Chat.obj.totalUnReadMessage = Enumerable.from(Chat.obj.conversations).where(o => !o.Disturb).sum(o => o.UnreadCount) + Chat.obj.conversationHeaders[0].UnreadCount;
                //设置角标
                if (NativeModules.MyNativeModule.setBadge) {
                    NativeModules.MyNativeModule.setBadge(Chat.obj.totalUnReadMessage);
                }
            })
        }).fail(() => {
            Chat.obj.connectionState = 3;
            console.log('Failed');
        });

        Chat.connection.error((error) => {
            Chat.obj.connectionState = 3;
            console.log(error);
        });

        Chat.connection.connectionSlow(() => {
            console.log('We are currently experiencing difficulties with the connection.')
        });

        Chat.connection.reconnecting(function () {
            console.log('Connection reconnecting');
        });

        Chat.connection.reconnected(function () {
            Chat.obj.connectionState = Chat.connection.state;
            console.log('Connection reconnected');
        });

        Chat.connection.disconnected(function () {
            console.log('Connection disconnected');
            if (!Chat.obj.isLogout)
                Chat.init(userCode);
        });
    }

    //获取会话列表（合并缓存会话列表）
    static getConversations = async (owner) => {
        Chat.obj.connectionState = 0;
        let unreadMessages = await IM.getUnreadMessages({
            "Owner": Chat.userInfo.User.IMNr,
            "Platform": Chat.obj.Platform
        });
        let conversations = await Chat.setConversations(unreadMessages.UnreadMessages);
        for (let item of conversations) {
            for (let msg of item.Messages) {
                Storage.insertMessage(item.IMNr, msg);
            }
        }
        try {
            let conversationList = await global.storage.load({ key: Chat.userInfo.User.IMNr });
            conversations = Enumerable.from(conversations.concat(conversationList)).distinct(a => a.IMNr + a.ConversationType).toArray();
            Enumerable.from(conversations).join(conversationList, a => a.IMNr + a.ConversationType, b => b.IMNr + b.ConversationType, (a, b) => {
                a.Stick = b.Stick ? b.Stick : false;
                a.Disturb = b.Disturb ? b.Disturb : false;
                Storage.selectMessage(b.IMNr, 0, 1, (messages) => {
                    if (messages.length > 0) {
                        a.LatestMessage = Chat.getLatestMessage(messages[messages.length - 1].ChatMessage);
                        a.LatestTime = messages[messages.length - 1].CreateTime;
                    }
                });
            }).toArray();
            conversations = Enumerable.from(conversationList).where(o => o.Stick).concat(Enumerable.from(conversations).where(o => !o.Stick).orderByDescending(o => o.LatestTime)).toArray();
        } catch (err) { console.log("当前没有本地会话列表") }
        Chat.obj.conversations = conversations;
        //console.log(conversations);
        if (Chat.obj.conversations.length > 0) {
            RCTDeviceEventEmitter.emit("UpdateConversation", Chat.obj.conversations);
        }
        Chat.obj.isFinish = true;
        Chat.obj.connectionState = Chat.connection.state;
        return Chat.conversations;
    }

    //移除会话
    static removeConversations = (IMNr, conversationType) => {
        let item = Chat.obj.conversations.find(o => o.ConversationType == conversationType && o.IMNr == IMNr);
        if (item) {
            Chat.obj.conversations.remove(item);
            Chat.saveConversationList(Chat.obj.conversations);
            Storage.removeMessage(IMNr);
        }
    }

    //通过未读信息生成会话列表
    static setConversations = async (messages) => {
        messages = Enumerable.from(messages).where(o => o.Peer != Chat.userInfo.User.IMNr).toArray();
        let conversations = [];
        let unreadMessages = Enumerable.from(messages).groupBy(o => o.ConversationType).toArray();
        for (let group of unreadMessages) {
            let items = group.getSource();
            if (group.key() === "Group") {
                let result = Enumerable.from(items).groupBy(o => o.Peer).toArray();
                let groupNrs = Enumerable.from(result).select(o => o.key()).toArray();
                console.log("获取群信息");
                let groupsInfo = await IM.getUserOrGroups({
                    "GroupNrs": groupNrs
                });
                Enumerable.from(groupsInfo.Groups).join(result, "$.IMNr", "$.key()", (a, b) => {
                    let messages = b.getSource();
                    a.LatestMessage = Chat.getLatestMessage(messages[messages.length - 1].ChatMessage);
                    a.ConversationType = "Group";
                    a.Stick = a.Disturb = false;
                    a.FaceUrlPath = Enumerable.from(a.Members).take(4).select(o => Chat.getFaceUrlPath(o.FaceUrlPath)).toArray();
                    Enumerable.from(messages).join(a.Members, "$.Sender", "$.IMNr", (a, b) => {
                        a.Status = 0;
                        a.Name = b.Name;
                        a.FaceUrlPath = Chat.getFaceUrlPath(b.FaceUrlPath);
                        if (a.Sender == Chat.userInfo.User.IMNr) {
                            a.IsSender = true;
                            a.FaceUrlPath = Chat.getFaceUrlPath(Chat.userInfo.User.FaceUrlPath);
                        }
                    }).toArray();
                    a._Messages = messages;
                    a.Messages = Chat.insertDateMessages(Enumerable.from(messages).takeFromLast(15).toArray());
                    a.Name = Enumerable.from(a.Members).select(o => o.Name).toArray().join(',');
                    a.UnreadCount = messages.length;
                    a.LatestTime = messages[messages.length - 1].CreateTime;

                }).toArray();
                conversations = conversations.concat(groupsInfo.Groups);
            }
            else if (group.key() === "C2C") {
                let result = Enumerable.from(items).groupBy(o => o.Peer).toArray();
                let userNrs = Enumerable.from(result).select(o => o.key()).toArray();
                console.log("获取用户信息");
                let usersInfo = await IM.getUserOrGroups({
                    "UserNrs": userNrs
                });

                Enumerable.from(usersInfo.Users).join(result, "$.IMNr", "$.key()", (a, b) => {
                    let messages = b.getSource();
                    a.LatestMessage = Chat.getLatestMessage(messages[messages.length - 1].ChatMessage);
                    a.ConversationType = "C2C";
                    a.Stick = a.Disturb = false;
                    a.FaceUrlPath = [Chat.getFaceUrlPath(a.FaceUrlPath)];
                    Enumerable.from(messages).join(usersInfo.Users, "$.Peer", "$.IMNr", (a, b) => {
                        a.Name = b.Name;
                        a.FaceUrlPath = b.FaceUrlPath[0];
                        a.Status = 0;
                        if (a.Sender == Chat.userInfo.User.IMNr) {
                            a.IsSender = true;
                            a.FaceUrlPath = Chat.getFaceUrlPath(Chat.userInfo.User.FaceUrlPath);
                        }
                    }).toArray();
                    a._Messages = messages;
                    a.Messages = Chat.insertDateMessages(Enumerable.from(messages).takeFromLast(15).toArray());
                    a.UnreadCount = messages.length;
                    a.LatestTime = messages[messages.length - 1].CreateTime;

                }).toArray();
                conversations = conversations.concat(usersInfo.Users);
            }
        }
        console.log(conversations);
        return conversations;
    }

    //插入通知消息
    static insertNotificationMessage = async (IMNr, conversationType, content) => {
        let id = uuid.v1();
        let obj = {
            Status: 0,
            Peer: IMNr,
            CreateTime: moment().format(),
            ConversationType: conversationType,
            ChatMessage: {
                MessageType: 'Notify',
                NotifyContent: {
                    Notify: content,
                }
            },
            MessageId: id
        }
        let target = Chat.obj.conversations.find(o => o.ConversationType == conversationType && o.IMNr == IMNr);
        if (target) {
            target.LatestMessage = content;
            target.LatestTime = moment().format();
            target.UnreadCount += 1;
            target.Messages.push(obj);
            target._Messages.push(obj);
        } else {
            let msg = await Chat.setConversations([obj]);
            if (msg.length > 0)
                Chat.obj.conversations.unshift(msg[0]);
        }
        Storage.insertMessage(IMNr, obj);
        Chat.saveConversationList(Chat.obj.conversations);
    }

    //插入文本消息(未完成)
    static insertTextMessage = async (conversation, content, isSender = true, save = true) => {
        let id = uuid.v1();
        let obj = {
            Status: 0,
            IsSender: isSender,
            Peer: conversation.IMNr,
            Name: isSender ? Chat.userInfo.User.Name : conversation.Name,
            FaceUrlPath: isSender ? Chat.getFaceUrlPath(Chat.userInfo.User.FaceUrlPath) : null,
            CreateTime: moment().format(),
            ConversationType: conversation.ConversationType,
            ChatMessage: {
                MessageType: 'Text',
                TextContent: {
                    Content: content,
                }
            },
            MessageId: id
        };
        let target = Chat.obj.conversations.find(o => o.ConversationType == conversation.ConversationType && o.IMNr == conversation.IMNr);
        if (target) {
            conversation.LatestMessage = content;
            conversation.LatestTime = moment().format();
            conversation.Messages.push(obj);
            conversation._Messages.push(obj);
        } else {
            await Chat.updateConversation(obj, conversation);
            conversation.UnreadCount = 0;
            Chat.obj.conversations.unshift(conversation);
        }
        Chat.saveConversationList(Chat.obj.conversations);
    }

    //发送文本消息
    static sendTextMessage = async (conversation, content) => {
        conversation.LatestMessage = content;
        conversation.UnreadCount = 0;
        conversation.LatestTime = moment().format();
        let obj = {
            Status: 3,
            IsSender: true,
            Peer: conversation.IMNr,
            Name: Chat.userInfo.User.Name,
            FaceUrlPath: Chat.getFaceUrlPath(Chat.userInfo.User.FaceUrlPath),
            CreateTime: moment().format(),
            ConversationType: conversation.ConversationType,
            ChatMessage: {
                MessageType: 'Text',
                TextContent: {
                    Content: content,
                }
            }
        };
        Chat.insertDateMessage(conversation.Messages, obj);

        conversation.Messages.push(obj);
        let val = Chat.isExist(obj, conversation.Messages);
        if (val) conversation._Messages.push(val);

        let index = Chat.obj.conversations.findIndex(o => o.ConversationType == conversation.ConversationType && o.IMNr == conversation.IMNr);
        if (index != -1) {
            Chat.updateConversations(index, conversation, Chat.obj.conversations);
        }
        Chat.sendMessage(val, conversation);
    }


    //发送图文消息
    static sendNewsMessage = async (conversation, articles) => {
        conversation.LatestMessage = "[图文消息]";
        conversation.UnreadCount = 0;
        conversation.LatestTime = moment().format();
        let obj = {
            Status: 3,
            IsSender: true,
            Peer: conversation.IMNr,
            Name: Chat.userInfo.User.Name,
            FaceUrlPath: Chat.getFaceUrlPath(Chat.userInfo.User.FaceUrlPath),
            CreateTime: moment().format(),
            ConversationType: conversation.ConversationType,
            ChatMessage: {
                MessageType: 'News',
                NewsContent: {
                    Articles: articles,
                }
            }
        };
        Chat.insertDateMessage(conversation.Messages, obj);

        conversation.Messages.push(obj);
        let val = Chat.isExist(obj, conversation.Messages);
        if (val) conversation._Messages.push(val);

        let index = Chat.obj.conversations.findIndex(o => o.ConversationType == conversation.ConversationType && o.IMNr == conversation.IMNr);
        if (index != -1) {
            Chat.updateConversations(index, conversation, Chat.obj.conversations);
        }
        Chat.sendMessage(val, conversation);
    }

    //发送图片消息
    static sendImageMessage = async (conversation, content) => {
        conversation.LatestMessage = "[图片]";
        conversation.UnreadCount = 0;
        conversation.LatestTime = moment().format();
        let obj = {
            Status: 3,
            IsSender: true,
            Peer: conversation.IMNr,
            Name: Chat.userInfo.User.Name,
            FaceUrlPath: Chat.getFaceUrlPath(Chat.userInfo.User.FaceUrlPath),
            CreateTime: moment().format(),
            ConversationType: conversation.ConversationType,
            ChatMessage: {
                MessageType: 'Image',
                ImageContent: {
                    Url: content.Url,
                    Width: content.Width,
                    Height: content.Height,
                }
            }
        };
        Chat.insertDateMessage(conversation.Messages, obj);

        conversation.Messages.push(obj);
        let val = Chat.isExist(obj, conversation.Messages);
        if (val) conversation._Messages.push(val);

        let index = Chat.obj.conversations.findIndex(o => o.ConversationType == conversation.ConversationType && o.IMNr == conversation.IMNr);
        if (index != -1) {
            Chat.updateConversations(index, conversation, Chat.obj.conversations);
        }
        let param = {
            BucketName: 'yqf-imres',
            ImageBytes: content.Base64
        }
        let result = await ServingClient.execute("Base.ImageUpload", param);
        if (result && result.Path) {
            let path = "https://res.im.yiqifei.com" + result.Path;
            val.ChatMessage.ImageContent.Url = path;
            Chat.sendMessage(val, conversation, content.Base64);
        } else {
            let id = uuid.v1();
            val.MessageId = id;
            val.Status = 1;
            if (base64) val.ChatMessage.ImageContent.Base64 = base64;
            Chat.saveConversationList(Chat.obj.conversations);
        }
    }

    //消息列表中是否存在目标消息
    static isExist = (obj, arr) => {
        let val = arr.find(o => {
            let o2 = { ...obj };
            delete o2.position;

            let o1 = toJS(o);
            delete o1.position;
            return !deepDiffer(o1, o2);
        });
        return val;
    }

    //断开连接
    static logout = () => {
        if (Chat.connection && !Chat.obj.isLogout) {
            Chat.obj.isLogout = true;
            Chat.connection.stop();
            Chat.obj.connectionState = 3;
            if (Chat.interval) clearInterval(Chat.interval);
            //移除别名
            if (NativeModules.MyNativeModule.deleteAlias)
                NativeModules.MyNativeModule.deleteAlias();
            //移除标签
            if (NativeModules.MyNativeModule.cleanTags)
                NativeModules.MyNativeModule.cleanTags();
        }
    }

    //创建会话
    static createConversation(navigator, IMNr, name, conversationType, callback) {
        let target = Chat.obj.conversations.find(o => o.ConversationType == conversationType && o.IMNr == IMNr);
        if (target) {
            Storage.selectMessage(target.IMNr, 0, 15, (messages) => {
                target.Messages = Chat.insertDateMessages(messages);
            });
            if (navigator) {
                navigator.push({
                    component: ChatRoom,
                    passProps: { conversation: target }
                });
            }
        } else {
            let obj = {
                ConversationType: conversationType,
                Name: name,
                IMNr: IMNr,
                Messages: [],
                _Messages: [],
                LatestMessage: null,
                UnreadCount: 0,
                LatestTime: moment().format(),
                FaceUrlPath: [],
                Rank: null
            };
            let conversation = observable(obj);
            Chat.obj.conversations.push(conversation);
            setTimeout(() =>
                Chat.updateConversation({
                    Peer: IMNr,
                    ConversationType: conversationType,
                    ChatMessage: {
                        MessageType: 'Image'
                    }
                }, conversation));
            if (callback) {
                callback(conversation);
            }
            if (navigator) {
                navigator.push({
                    component: ChatRoom,
                    passProps: {
                        conversation: conversation
                    }
                });
            }
        }
    }

    static updateConversation = async (message, target) => {
        let msg = await Chat.setConversations([message]);
        if (msg.length > 0) {
            msg = msg[0];
            target.FaceUrlPath = msg.FaceUrlPath;
            target.Rank = msg.Rank;
            Chat.saveConversationList(Chat.obj.conversations);
        }
    }

    //设置头像
    static updateFaceUrlPath = async (message, target) => {
        let msg = await Chat.setConversations([message]);
        if (msg.length > 0) {
            msg = msg[0];
            target.FaceUrlPath = msg.FaceUrlPath;
        }
    }

    //发送消息（设置发送状态）
    static sendMessage = (obj, conversation, base64) => {
        try {
            Chat.proxy.invoke('SendChat', obj).done((messageID) => {
                obj.MessageId = messageID;
                obj.Status = 0;
                Storage.insertMessage(conversation.IMNr, obj);
                Chat.saveConversationList(Chat.obj.conversations);
            }).fail((error) => {
                let id = uuid.v1();
                obj.MessageId = id;
                obj.Status = 1;
                if (base64) obj.ChatMessage.ImageContent.Base64 = base64;
                Storage.insertMessage(conversation.IMNr, obj);
                Chat.saveConversationList(Chat.obj.conversations);
            });
        } catch (err) {
            let id = uuid.v1();
            obj.MessageId = id;
            obj.Status = 1;
            if (base64) obj.ChatMessage.ImageContent.Base64 = base64;
            Storage.insertMessage(conversation.IMNr, obj);
            Chat.saveConversationList(Chat.obj.conversations);
        }
    }

    //设置会话日期显示方式
    static getTimeStamp = (time) => {
        let date = moment(time);
        let now = moment();
        if (date.format("YYYY-MM-DD") == moment().format("YYYY-MM-DD"))
            return date.format("HH:mm");
        else if (now.year() != date.year())
            return date.format("YYYY-MM-DD");
        else if (now.month() == date.month() && now.date() - date.date() < 7) {
            if (now.date() - date.date() == 1)
                return "昨天";
            else
                return date.format("dddd");
        }
        else
            return date.format("MM-DD");
        //return date.fromNow();
    }

    static getFaceUrlPath = (url) => {
        if (!url)
            return "https://img2.yiqifei.com/face.png!60";
        else
            return "https://img2.yiqifei.com" + url + "!60";
    }

    //将信息放入对应的会话中
    static insertConversation = async (message) => {
        let conversationList = Chat.obj.conversations.slice();
        let index = conversationList.findIndex(o => o.ConversationType == message.ConversationType && o.IMNr == message.Peer);
        if (index != -1) {
            let target = conversationList[index];
            let msg = await Chat.setConversations([message]);
            if (msg.length > 0) {
                msg = msg[0];
                Storage.insertMessage(target.IMNr, msg.Messages[0]);
                target.LatestMessage = msg.LatestMessage;
                if (message.Sender != Chat.userInfo.User.IMNr)
                    target.UnreadCount += 1;
                target.LatestTime = msg.CreateTime;
                target.Name = msg.Name;
                target.FaceUrlPath = msg.FaceUrlPath;
                Chat.insertDateMessage(target.Messages, msg.Messages[0]);
                target.Messages.push(msg.Messages[0]);
                target._Messages.push(target.Messages[target.Messages.length - 1]);
                msg.Messages = target.Messages;
                msg._Messages = target._Messages;
                Chat.updateConversations(index, target, conversationList);
            }
        } else {
            let msg = await Chat.setConversations([message]);
            if (msg.length > 0) {
                Storage.insertMessage(msg[0].IMNr, msg[0].Messages[0]);
                Chat.updateConversations(-1, msg[0], conversationList);
            }
        }
        Chat.obj.conversations = conversationList;
        Chat.saveConversationList(Chat.obj.conversations);
        RCTDeviceEventEmitter.emit('OnChat', message);
    }

    //保存会话列表
    static saveConversationList = async (conversationList) => {
        let conversations = toJS(conversationList);
        conversations = Enumerable.from(conversations).doAction(o => {
            o._Messages = Enumerable.from(o._Messages).takeFromLast(1).toArray();
        }).toArray();
        global.storage.save({
            key: Chat.userInfo.User.IMNr,
            rawData: conversations
        });
    }

    //设置消息列表中的日期显示
    static insertDateMessages(messages) {
        let msgs = [];
        if (messages.length > 0) {
            for (let i = 0; i < messages.length - 1; i++) {
                if (moment(messages[i + 1].CreateTime).diff(moment(messages[i].CreateTime), 'm') > 3) {
                    msgs.push({
                        NoteText: messages[i + 1].CreateTime,
                        MessageType: "Time"
                    })
                }
                msgs.push(messages[i]);
            }
            msgs.push(messages[messages.length - 1]);
        }
        return msgs;
    }

    static insertDateMessage(messages, o1) {
        if (messages.length > 0 && moment(o1.CreateTime).diff(moment(messages[messages.length - 1].CreateTime), 'm') > 3) {
            messages.push({
                NoteText: o1.CreateTime,
                MessageType: "Time"
            });
        }
    }

    //将消息设置为已读
    static setReadMessage = (conversation) => {
        conversation.UnreadCount = 0;
        try {
            var obj = {
                ConversationType: conversation.ConversationType,
                Peer: conversation.IMNr
            };
            Chat.proxy.invoke('SetReadMessage', obj).done(() => {
                //console.log("SetReadMessage");
            }).fail((err) => {
                console.log(err);
            });
        } catch (err) {
            console.log(err);
        }
    }

    //根据消息的类型显示对应的文字
    static getLatestMessage(msg) {
        if (msg.MessageType == "Text")
            return msg.TextContent.Content;
        else if (msg.MessageType == "Image")
            return '[图片]';
        else if (msg.MessageType == "Voice")
            return '[语音]';
        else if (msg.MessageType == "File")
            return '[文件]';
        else if (msg.MessageType == "Notify")
            return msg.NotifyContent.Notify;
        else if (msg.MessageType == "News")
            return "[图文消息]";
        else
            return '[未知消息类型]';
    }

    //统计系统通知未读数
    static getMsgCount = async () => {
        let param = {
            "RecipientUserCode": Chat.userInfo.User.UserCode,
            "BusinessTypeID": 109,
            "MsgTypeID": 13
        }
        let result = await Knowledge.getMsgCount(param);
        if (result && result.Code == 0) {
            Chat.obj.conversationHeaders[0].UnreadCount = result.Result.MsgTotalCount;
            Chat.obj.totalUnReadMessage = Chat.obj.totalUnReadMessage = Enumerable.from(Chat.obj.conversations).where(o => !o.Disturb).sum(o => o.UnreadCount) + Chat.obj.conversationHeaders[0].UnreadCount;;
            if (NativeModules.MyNativeModule.setBadge) {
                NativeModules.MyNativeModule.setBadge(Chat.obj.totalUnReadMessage);
            }
        };
    }

    //置顶(取消置顶)会话
    static toggleStick = (conversation) => {
        if (!conversation.Stick) {
            Chat.obj.conversations.remove(conversation);
            Chat.obj.conversations.unshift(conversation);
            conversation.Stick = true;
        } else {
            conversation.Stick = false;
            Chat.obj.conversations = Enumerable.from(Chat.obj.conversations).orderByDescending(o => o.Stick).toArray();
        }
        Chat.saveConversationList(Chat.obj.conversations);
    }

    //设置(取消)会话免打扰
    static toggleDisturb = (conversation) => {
        conversation.Disturb = !conversation.Disturb;
    }

    //更新会话列表
    static updateConversations = (position, conversation, conversations) => {
        if (!conversation.Stick) {
            if (position != -1)
                conversations.splice(position, 1);
            let index = Enumerable.from(conversations).lastIndexOf(o => o.Stick);
            if (index != -1) {
                conversations.splice(index + 1, 0, conversation);
            } else {
                conversations.unshift(conversation);
            }
        }
    }
}