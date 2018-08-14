import signalr from 'react-native-signalr';
import Storage from 'react-native-storage';
import {IM} from './data-access/im';
import Enumerable from 'linq';
import {ServingClient, RestAPI} from './yqfws'
import React, {Component} from 'react';
import {extendObservable, action, computed, toJS, observable, autorun} from 'mobx';
import {observer} from 'mobx-react/native';
import moment from 'moment';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import deepDiffer from 'deepDiffer'
import uuid from 'react-native-uuid';
import ChatRoom from '../pages/Chat/ChatRoom';
import Profile from '../pages/Profile/Profile'
import DeviceInfo from 'react-native-device-info';

import {

    Dimensions,
    StyleSheet,
    Platform,
    NativeModules,
    AsyncStorage,
    DeviceEventEmitter,
    Alert,
    NetInfo,
    CameraRoll

} from 'react-native';

@observer

export class Chat extends Component {

    static storage = new Storage({

        size: 1000,
        defaultExpires: null,
        enableCache: true,
        storageBackend: AsyncStorage,
    });

    static StorageKey: {
        Contacts:'Contacts',
        YQFWoquguoIMNr:'YQFWoquguoIMNr',
    };

    // static  getBundleId

    @observable static obj = {


        conversations: [],//会话的
        isFinish: false,
        totalUnReadMessage: 0,//总的未读数
        isLogout: false,
        connectionState: 0,//0:连接中 1:已连接 3:已断开
        Source: DeviceInfo.getBundleId() == 'com.yiqifei.LR' || DeviceInfo.getBundleId() == 'com.yiqifei_mlr' ? '抢单' : '我去过',
        Platform: "MobileDevice",
        Contacts: {
            Users:[],

        },//通讯录数据(处理方式和会话一样);;这里将Users提前赋值为空，为了不导致出错

        FriendItems: [],//好友请求的(与conversation)
        totalFriendPendingCount: 0,
        isReceiveOrder: true,//是否接单
        LabelInfoResult: null,//素材库的数据
        IMNrBySubType:null,//IM 组织架构内的人事
        Custom:{
            ServiceStaffs:[],
            RecentlyContacts:[]
        }  //当前登录用户的客户（分服务销售过的和最近联系过的）
    };

    //后期这里改成从本地获取
    static userInfo = [];
    static loginUserResult = {};//登陆用户的详细资料


    //获取通讯录数据。如果有缓存数据，先拿缓存。这里只是将最终的值直接赋值给Chat.obj.Contacts
    static  im_getContacts = async()=>{

        var key = Chat.userInfo.User.IMNr + 'Contacts';

        Chat.storage.load({
            key: key
        }).then((ret) => {
            Chat.obj.Contacts = ret;

        }, (error) => {

        })




    }


    //从远程获取通讯录数据，接着更新
    static AsyncGetContactFromServer = async() =>{

       result =await IM.getContacts({Owner: Chat.userInfo.User.IMNr});

       // console.log(Chat.userInfo.User.IMNr+"这个人的通讯录")
       // console.dir(result)

        Chat.obj.Contacts = result
        Chat._SaveContacts(result)
    }


    //初始化（连接IM服务器）（这是原始的方法。主要是在通讯录获取上。以及组织架构获取上被卡）
    static  init = async(userCode, kickOff) => {

        if (Chat.obj.connectionState == 1) {
            //如果已经登陆过了，则直接return
            // console.log('如果已经登陆过了，则直接return');
            return;
        }
        let result = await IM.getToken({
            Platform: Chat.obj.Platform,
            UserCode: userCode,
            Source: Chat.obj.Source
        });

        if (result.IsSuccess !== true) {

            Alert.alert('IM.getToken 接口有问题，找刘宁');
            return;
        }

        Chat.userInfo = result;

        Chat.im_getContacts()


        Chat.obj.connectionState = 0;
        //监听网络连接
        NetInfo.isConnected.addEventListener('change', (isConnected) => {
            if (isConnected) Chat.obj.connectionState = 1;
            else Chat.obj.connectionState = 3;
        });


        if (Chat.obj.Source == '抢单') {
            //定时获取系统通知
            Chat.getMsgCount();
            if (Chat.interval) clearInterval(Chat.interval);
            Chat.interval = setInterval(() => {
                Chat.getMsgCount();
            }, 10000);
        }


        Chat.connection = signalr.hubConnection('https://im.yiqifei.com', {
            qs: 'token=' + result.Token,
        });
        Chat.obj.isLogout = false;
        Chat.connection.logging = true;
        Chat.connection.disconnectTimeout = 100;
        Chat.proxy = Chat.connection.createHubProxy('Chat');

       // console.log("现在准备连接im..."+Chat._getCurrentTime())

        //开始对话时发生
        Chat.proxy.on('OnChat', (message) => {

            // console.log('OnChat -- 收到消息----OnChat-')
            // console.dir(message);


            Chat.insertConversation(message);
        });

        //下线通知
        Chat.proxy.on('OnKickOff', (message) => {

            Chat.logout();

            Alert.alert('', "当前账户已在其它设备上登录", [
                {
                    text: '确定', onPress: () => {
                    if (kickOff) kickOff();
                }
                }
            ])

        });


        //系统通知
        Chat.proxy.on('OnSNSNotify', (OnSNSNotify) => {

            // console.log("OnSNSNotify")
            // console.dir(OnSNSNotify)

            Chat.ChatReceiveOnSNSNotify(OnSNSNotify);

        });

        //群通知
        Chat.proxy.on('OnGroupNotify', async(message) => {

            // console.log("OnGroupNotify这里接受到群通知...")
            // console.dir(message)

            let value = Enumerable.from(message).firstOrDefault(o => o.value && typeof o.value == "object", null).value;
            let IMNr = value.Group ? value.Group.IMNr : value.GroupIMNr;
            let target = Enumerable.from(Chat.obj.conversations).firstOrDefault(o => o.IMNr == IMNr, null);
            if (target) await Chat.updateConversation({
                ConversationType: "Group",
                Peer: IMNr,
                ChatMessage: {
                    MessageType: "Notify", NotifyContent: {
                        Notify: "",
                    }
                }
            }, target);

            //群主解散了群聊
            if(message.NotifyType=="GroupDelete"){

                //找到对应的群聊。将其status设置为2，好像

            }






        });


        //im 连接
        Chat.connection.start().done(() => {


            Chat.getConversations();
            if (NativeModules.MyNativeModule.setTagsWithAlias) {
                NativeModules.MyNativeModule.setTagsWithAlias([userCode, result.User.PersonCode], Chat.userInfo.User.IMNr);
            }
            autorun(() => {

                Chat.obj.totalUnReadMessage = Enumerable.from(Chat.obj.conversations).sum(o => o.UnreadCount);

                Chat.showCount();

                if (Platform.OS == 'ios' && NativeModules.MyNativeModule.setBadge ) {
                    NativeModules.MyNativeModule.setBadge(Chat.obj.totalUnReadMessage);
                }
            })



            //获取最新通讯录，用于同步更改最新通讯录
            Chat.AsyncGetContactFromServer()

            //获取未决好友并存到本地
            Chat._IMGetUnreadFriend();

            //获取最新组织架构
            Chat._getSystemUserIMNrBySubTypeCode();


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


    static initYJ = async (userCode, kickOff) => {
        //已连接状态不再进行连接
        if (Chat.obj.connectionState == 1)
            return;
        //初始化SQLite
      //  Storage.openDataBase(userCode);
        let result = await IM.getToken({
            "Platform": Chat.obj.Platform,
            "UserCode": "CMC01RAC",
           // "UserCode": userCode,

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



       alert("准备"+Chat._getCurrentTime())
        console.log("准备"+Chat._getCurrentTime())


        Chat.connection = signalr.hubConnection('https://im.yiqifei.com', {
            qs: 'token=' + result.Token,
        });
        Chat.obj.isLogout = false;
        Chat.connection.logging = true;
        Chat.connection.disconnectTimeout = 100;
        Chat.proxy = Chat.connection.createHubProxy('Chat');
        Chat.proxy.on('OnChat', (message) => {


            // console.log("收到消息....")
            // console.dir(message)

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
        Chat.proxy.on('OnGroupNotify', async (message) => {
            let value = Enumerable.from(message).firstOrDefault(o => o.value && typeof o.value == "object", null).value;
            let IMNr = value.Group ? value.Group.IMNr : value.GroupIMNr;
            let target = Enumerable.from(Chat.obj.conversations).firstOrDefault(o => o.IMNr == IMNr, null);
            if (target) await Chat.updateConversation({
                ConversationType: "Group",
                Peer: IMNr,
                ChatMessage: {
                    MessageType: "Notify", NotifyContent: {
                        Notify: "",
                    }
                }
            }, target);
        });
        Chat.connection.start().done(() => {


            alert("成功"+Chat._getCurrentTime())
            console.log("成功"+Chat._getCurrentTime())


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



    //获取未读消息和本地消息的结合
    static getConversations = async(owner) => {
        let unreadMessages = await IM.getUnreadMessages({
            "Owner": Chat.userInfo.User.IMNr,
            "Platform": Chat.obj.Platform
        });
        let conversations = await Chat.setConversations(unreadMessages.UnreadMessages);
        try {
            let conversationList = await Chat.storage.load({key: Chat.userInfo.User.IMNr});
            conversations = Enumerable.from(conversations.concat(conversationList)).distinct(a => a.IMNr + a.ConversationType).toArray();
            Enumerable.from(conversations).join(conversationList, a => a.IMNr + a.ConversationType, b => b.IMNr + b.ConversationType, (a, b) => {
                a.Stick = b.Stick ? b.Stick : false;
                a._Messages = Enumerable.from(b._Messages.concat(a._Messages)).where(o => o.MessageId).distinct(o => o.MessageId).toArray();
                if (a._Messages.length > 0) {
                    a.Messages = Chat.insertDateMessages(Enumerable.from(a._Messages).takeFromLast(15).toArray());
                    a.LatestMessage = Chat.getLatestMessage(a._Messages[a._Messages.length - 1].ChatMessage);
                    a.LatestTime = a._Messages[a._Messages.length - 1].CreateTime;
                }
            }).toArray();
        } catch (err) {
            console.log("当前没有本地会话列表")
        }
        conversations = Enumerable.from(conversations).where(o => o.Stick).concat(Enumerable.from(conversations).where(o => !o.Stick).orderByDescending(o => o.LatestTime)).toArray();
        Chat.obj.conversations = conversations;
        for (let item of Chat.obj.conversations) {
            let messages = item._Messages.slice();
            delete item._Messages;
            item._Messages = messages;
        }
        if (Chat.obj.conversations.length > 0) {
            RCTDeviceEventEmitter.emit("UpdateConversation", Chat.obj.conversations);
        }
        Chat.obj.isFinish = true;
        setTimeout(() =>
            Chat.obj.connectionState = Chat.connection.state, 1000);

        // console.dir(Chat.connections)

        return Chat.conversations;


    }


    //移除会话
    static removeConversations = (IMNr, conversationType) => {
        let item = Chat.obj.conversations.find(o => o.ConversationType == conversationType && o.IMNr == IMNr);
        if (item) {
            Chat.obj.conversations.remove(item);
            Chat.saveConversationList(Chat.obj.conversations);
        }
    }

    //通过未读信息生成会话列表
    static setConversations = async (messages, removeCache) => {
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
                }, removeCache);
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
                    a.Name = a.Name || Enumerable.from(a.Members).select(o => o.Name).toArray().join(',');
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

        //#TODO 这里是远江的学的Storage
       // Storage.insertMessage(IMNr, obj);

        Chat.saveConversationList(Chat.obj.conversations);
    }

    //插入文本消息(未完成)
    static insertTextMessage = async(conversation, content, isSender = true, save = true) => {
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
    static sendTextMessage = async(conversation, content) => {
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
    static sendNewsMessage = async(conversation, articles) => {

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
    static sendImageMessage = async(conversation, content) => {
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

            // console.dir(result.Path);
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
            let o2 = {...obj};
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

            if (Chat.obj.Source == '抢单') {

                if (Chat.interval) clearInterval(Chat.interval);
            }

            if( NativeModules.MyNativeModule.deleteAlias){
                NativeModules.MyNativeModule.deleteAlias();
            }
            if(NativeModules.MyNativeModule.cleanTags){
                NativeModules.MyNativeModule.cleanTags();
            }


        }
    }


    //创建会话
    static createConversation(navigator, IMNr, name, conversationType, callback) {

        //在conversations寻找是否存在过；如果存在的话，最好。如果不存在需要重新制造
        let target = Chat.obj.conversations.find(o => o.ConversationType == conversationType && o.IMNr == IMNr);

        if (target) {

            target.Messages = Chat.insertDateMessages(Enumerable.from(target._Messages).takeFromLast(15).toArray())

            // console.log("这是找到的对应的会话item")
            // console.dir(target)

            if (navigator) {
                navigator.push({
                    component: ChatRoom,
                    passProps: {conversation: target}
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
        let msg = await Chat.setConversations([message], true);
        if (msg.length > 0) {
            msg = msg[0];
            target.Name = msg.Name;
            target.Members = msg.Members;
            target.MemberCount = msg.MemberCount;
            target.Intro = msg.Intro;
            target.FaceUrlPath = msg.FaceUrlPath;
            target.Rank = msg.Rank;
            Chat.saveConversationList(Chat.obj.conversations);
        }
    }

    //设置头像
    static updateFaceUrlPath = async(message, target) => {
        let msg = await Chat.setConversations([message]);
        if (msg.length > 0) {
            msg = msg[0];
            target.FaceUrlPath = msg.FaceUrlPath;
        }
    }

    //发送消息（设置发送状态）
    static sendMessage = (obj, conversation, base64) => {


        // console.warn('远江调试图文消息，在sendMessage 这里发送测试消息');
        // Chat.TestSend();

        //#TODO 这里需要额外判断。如果


        try {
            Chat.proxy.invoke('SendChat', obj).done((messageID) => {
                obj.MessageId = messageID;
                obj.Status = 0;
                Chat.saveConversationList(Chat.obj.conversations);
            }).fail((error) => {
                let id = uuid.v1();
                obj.MessageId = id;
                obj.Status = 1;
                if (base64) obj.ChatMessage.ImageContent.Base64 = base64;
                Chat.saveConversationList(Chat.obj.conversations);
            });
        } catch (err) {
            let id = uuid.v1();
            obj.MessageId = id;
            obj.Status = 1;
            if (base64) obj.ChatMessage.ImageContent.Base64 = base64;
            Chat.saveConversationList(Chat.obj.conversations);
        }
    }

    static TestSend = () => {


        var obj = {

            Peer: '10325',
            ConversationType: 'C2C',
            ChatMessage: {
                MessageType: 'News',
                NewsContent: {
                    Articles: [
                        {

                            Title: '测试News',
                            PicUrl: 'https://publish-pic-cpu.baidu.com/d8e54319-e7ad-480c-bdef-f5c29b957934.jpeg@q_90,w_450',
                            Url: 'http://mlr.yiqifei.com/Poster'
                        },
                        {

                            Title: 'hhhh',
                            PicUrl: 'https://publish-pic-cpu.baidu.com/5e091891-2fd0-41b0-a393-abf274aca58d.jpeg@q_90,w_450',
                            Url: 'http://mlr.yiqifei.com/Poster'
                        },
                        {

                            Title: 'iiiiii',
                            PicUrl: 'https://publish-pic-cpu.baidu.com/5e091891-2fd0-41b0-a393-abf274aca58d.jpeg@q_90,w_450',
                            Url: 'http://mlr.yiqifei.com/Poster'
                        },
                        {

                            Title: 'kkkkkkk',
                            PicUrl: 'https://publish-pic-cpu.baidu.com/d0d81c02-3993-49cf-a28e-099403cd7e15.jpeg@q_90,w_450',
                            Url: 'http://mlr.yiqifei.com/Poster'
                        }
                    ]
                }
            }

        }
        try {

            Chat.proxy.invoke('SendChat', obj).done((messageID) => {

                console.log('图文发送成功');

            }).fail((error) => {

            });
        } catch (err) {

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


    static  getLRUserFaceUrl = ()=>{

        if(Chat.loginUserResult.DetailInfo && Chat.loginUserResult.DetailInfo.UserLogo){
            return "https://img2.yiqifei.com/" + Chat.loginUserResult.DetailInfo.UserLogo + "!80";
        }else {
            return "https://img2.yiqifei.com/face.png!60";
        }


    }

    static  getLRUserName = ()=>{

       return Chat.loginUserResult.DetailInfo && Chat.loginUserResult.DetailInfo.Names ? Chat.loginUserResult.DetailInfo.Names: Chat.userInfo.User.Name;

    }
    static getLRStaffWorkPhone = () =>{

      return  Chat.loginUserResult.DetailInfo &&  Chat.loginUserResult.DetailInfo.StaffWorkPhone ? Chat.loginUserResult.DetailInfo.StaffWorkPhone : '';

    }


    static getFaceUrlPath = (url) => {
        if (!url)
            return "https://img2.yiqifei.com/face.png!60";
        else
            return "https://img2.yiqifei.com" + url + "!60";
    }

    //将信息放入对应的会话中
    static insertConversation = async(message) => {


        let conversationList = Chat.obj.conversations.slice();
        let index = conversationList.findIndex(o => o.ConversationType == message.ConversationType && o.IMNr == message.Peer);
        if (index != -1) {
            let target = conversationList[index];
            let msg = await Chat.setConversations([message]);
            if (msg.length > 0) {
                msg = msg[0];
                target.LatestMessage = msg.LatestMessage;
                if (message.Sender != Chat.userInfo.User.IMNr)
                    target.UnreadCount += 1;
                target.LatestTime = msg.CreateTime;
                target.Name = msg.Name;

                //sk 新加
                target.Intro = msg.Intro;

                target.FaceUrlPath = msg.FaceUrlPath;
                Chat.insertDateMessage(target.Messages, msg.Messages[0]);
                target.Messages.push(msg.Messages[0]);
                target._Messages.push(target.Messages[target.Messages.length - 1]);
                msg.Messages = target.Messages;
                msg._Messages = target._Messages;

                // console.log('现在要更新的信息')
                // console.dir(target)

                Chat.updateConversations(index, target, conversationList);
            }
        } else {
            let msg = await Chat.setConversations([message]);
            if (msg.length > 0) {
                Chat.updateConversations(-1, msg[0], conversationList);
            }
        }
        Chat.obj.conversations = conversationList;
        Chat.saveConversationList(Chat.obj.conversations);
        RCTDeviceEventEmitter.emit('OnChat', message);
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


    //处理抢单是否接单
    static getMsgCount = async() => {

        // console.log('调用Messaging.SendOrderReceivingStatus')

        //判断有没有成员登陆
        if (Chat.userInfo && Chat.userInfo.User.UserCode) {
            var orderReceivingStatus = Chat.obj.isReceiveOrder == true ? 1 : 0;//0为不接单，1为接单
            var method = 'Messaging.SendOrderReceivingStatus';
            var paramter = {
                UserCode: Chat.userInfo.User.UserCode,
                OrderReceivingStatus: orderReceivingStatus,
                ClientType: 1,//0为pc，1为移动
            };
            RestAPI.invoke(method, paramter, (success) => {

                // console.log('发送了当前的接单状态去后台查看,这是对应的参数和状态')
                // console.dir(paramter);
                // console.dir(success);

            })

        }


    }


    static toggleStick111 = (conversation, value) => {

        // console.log('现在要设置的值');
        // console.dir(value);

        if (value) {
            Chat.obj.conversations.remove(conversation);
            Chat.obj.conversations.unshift(conversation);
            conversation.Stick = true;
            // console.log('现在的conversation')
            // console.dir(conversation);
        }
        else {

            console.log('conversation.Stick')
            conversation.Stick = false;
            // console.log('现在的conversation')
            // console.dir(conversation);
            Chat.obj.conversations = Enumerable.from(Chat.obj.conversations).orderByDescending(o => o.Stick).toArray();
        }

        // console.dir(Chat.obj.conversations)

        Chat.saveConversationList(Chat.obj.conversations);
    }

    //置顶(取消置顶)会话
    static toggleStick = (conversation) => {

        // console.log('toggleStick conversation');
        // console.dir(conversation);

        if (!conversation.Stick) {

            console.log('!conversation.Stick')

            Chat.obj.conversations.remove(conversation);
            Chat.obj.conversations.unshift(conversation);
            conversation.Stick = true;

        } else {

            console.log('conversation.Stick')
            conversation.Stick = false;
            Chat.obj.conversations = Enumerable.from(Chat.obj.conversations).orderByDescending(o => o.Stick).toArray();
        }


        // console.dir(Chat.obj.conversations)


        Chat.saveConversationList(Chat.obj.conversations);
    }


    //设置（取消）会话免打扰
    static toggleDisturb111 = (conversation, value) => {


        let index = Chat.obj.conversations.findIndex(o => o.ConversationType == conversation.ConversationType && o.IMNr == conversation.IMNr);

        if (index !== -1) {

            var tempConversation = Chat.obj.conversations[index];
            tempConversation.Disturb = value;
            Chat.obj.conversations[index] = tempConversation;
            Chat.saveConversationList(Chat.obj.conversations);

        }


    }

    //设置（取消）会话免打扰
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


    //保存会话列表
    static saveConversationList = async(conversationList) => {

        Chat.storage.save({
            key: Chat.userInfo.User.IMNr,
            rawData: conversationList
        })
    }


    /*-----------SK Method 操作------------------------------------------*/

    static getPosterUrl = (url) => {

        if (url) {
            return 'http://img0.yiqifei.com/' + url;
        }
        return "https://img2.yiqifei.com/face.png!60";

    }


    static  ChatReceiveOnSNSNotify = async(OnSNSNotify) => {

        // console.log('OnSNSNotify  收到系统通知')
        // console.dir(OnSNSNotify);

        //代表好友已经请求成功了....
        if (OnSNSNotify.NotifyType == 'AddFriend') {

            var IMNr = OnSNSNotify.AddFriendContent.UserIMNr;
            var userNrs = [IMNr]
            let usersInfo = await IM.getUserOrGroups({
                "UserNrs": userNrs
            });

            var name = usersInfo.Users[0].Name;
            Chat.createConversation(null, IMNr, name, 'C2C', (conversation) => {
                Chat.insertNotificationMessage(conversation, name + '已经是你的好友，开始聊天吧');
            })
            //刷新通讯录 #TODO 2018-08-14添加
           Chat.AsyncGetContactFromServer()

        }
        //有人请求为好友
        else if (OnSNSNotify.NotifyType == 'AddFriendReq') {

            //需要拼出这样的结构 CreateTime User Wording
            // console.log('OnSNSNotify')
            // console.dir(OnSNSNotify);

            Chat._IMGetUnreadFriend(Chat.userInfo.User.IMNr);

            /*
             var IMNr = OnSNSNotify.AddFriendReqContent.UserIMNr;
             var userNrs =[];
             userNrs.push(IMNr);

             var Param = {
             UserNrs:userNrs
             };

             var result =await IM.getUserOrGroups(Param)
             var User = result.Users[0];
             var Wording = OnSNSNotify.AddFriendReqContent.Wording;
             var CreateTime = OnSNSNotify.CreateTime;
             var FriendPending = {
             User:User,
             Wording:Wording,
             CreateTime:CreateTime,
             Status:1,
             };
             var localFriendPendings =Chat.obj.FriendItems;

             var array=[];
             //判断本地是否已有这个数据
             if(localFriendPendings.length>0){
             var index = localFriendPendings.findIndex((item)=>{
             return item.User.IMNr;
             })

             if(index ==-1){

             localFriendPendings.push(FriendPending);

             }else {

             localFriendPendings.splice(index,1);
             localFriendPendings.push(FriendPending);

             }

             // console.log('现在的未决好友');
             // console.dir(localFriendPendings);

             Chat.obj.FriendItems=localFriendPendings;

             await Chat._SaveFriendPending(localFriendPendings);

             }else {

             array.push(FriendPending);

             Chat.obj.FriendItems=localFriendPendings;

             await Chat._SaveFriendPending(localFriendPendings);
             }

             */


        }

    };



    //获取未决好友和本地好友的结合
    static _IMGetUnreadFriend = async(owner) => {


        let GetFutureFriends = await IM.getFutureFriends({
            FutureFlags: 'Unsettled',
            IMNr: Chat.userInfo.User.IMNr,
        });

        // console.log("GetFutureFriends")
        // console.dir(GetFutureFriends);


        var temp = [];

        for (var i = 0; i < GetFutureFriends.FriendItems.length; i++) {
            var FutureFriendItem = GetFutureFriends.FriendItems[i];
            if (!Chat._YQFCompareDayFromNow(FutureFriendItem.CreateTime)) {
                //可以添加进来
                FutureFriendItem.Status = 1;
                temp.push(FutureFriendItem);
            }
        }




        Chat.obj.FriendItems = temp;

        //在这里存好友请求。还是需要的。毕竟这里需要经常弄
        await Chat._SaveFriendPending(temp);


        var currentArray = Enumerable.from(temp).select(o => o.Status == 1).toArray();

        Chat.obj.totalFriendPendingCount = currentArray.length;

        Chat.showCount();

        // console.dir(Chat.obj.totalFriendPendingCount);


    }




    static getUserInfo = async() => {


        let result = await Chat.storage.load({
            key: 'YQFWoquguoIMNr',
        })

        // console.log('这是获取到的用户资料');
        // console.dir(result);

        return result;

    }


    //组织架构
    static _getSystemUserIMNrBySubTypeCode = async() => {


        var result = await IM.getUserIMNrBySubTypeCode();

        Chat.obj.IMNrBySubType = result;

        Chat.storage.save({
            key: 'getUserIMNrBySubTypeCode',
            rawData: result
        })

    }




    //保存联系人
    static  _SaveContacts = async(result) => {

        var imnr = Chat.userInfo.User.IMNr;
        var key = imnr + 'Contacts';
        // console.log('即将要存储的keykeykeykey数据---');
        // console.dir(key);

        Chat.storage.save({
            key: key,
            rawData: result
        })

    }

    //获取未决好友
    static _GetFriendPending = async() => {

        var imnr = Chat.userInfo.User.IMNr;
        var key = imnr + 'FriendPending';

        let ret = await Chat.storage.load({
            key: key
        });

        if (ret && ret.length > 0) {
            return ret;
        }
        return null;

    }

    //保存未决好友
    static _SaveFriendPending = async(result) => {


        // console.dir(result);
        var imnr = Chat.userInfo.User.IMNr;
        var key = imnr + 'FriendPending';
        // console.log('即将要存储的_SaveFriendPending');
        // console.dir(key);

        Chat.storage.save({
            key: key,
            rawData: result
        })

    }

    //普通登陆
    static getLRLoginUser = async() => {

        Chat.storage.load({
            key: 'ACCOUNTNO'
        }).then((ret) => {

            return ret;

        }, (error) => {

            // console.dir(error);
            return null;
        })


    }

    static  saveLRLoginUser = async(result) => {

        Chat.storage.save({
            key: 'ACCOUNTNO',
            rawData: result
        })

    }


    /*-----------IM相关消息操作------------------------------------------*/

    static _RefreshContact = async() => {

        var Contacts = await IM.getContacts({Owner: Chat.userInfo.User.IMNr});
        //将通讯录的数据绑定在
        Chat.obj.Contacts = Contacts;

        Chat._SaveContacts(Contacts);

        console.log('_RefreshContact _RefreshContact _RefreshContact 刷新通讯录')

    }

    //创建群聊
    static CreateGroup = (Message, CallBack) => {

        //是否可以在这里判断？-------如果还没有连接成功，则让其中断

        try {


            Chat.proxy.invoke('CreateGroup', Message)

                .done((response) => {


                    //刷新通讯录
                    Chat._RefreshContact();

                    CallBack(response);


                }).fail((error) => {


                CallBack(error);

            });
        } catch (error) {
            Chat.ShowAlertConncet();
        }

    }

    //添加群成员
    static AddGroupMember = (Message, SuccessCallBack, failureCallBack) => {


        try {


            Chat.proxy.invoke('AddGroupMember', Message)

                .done((response) => {


                    //修改群资料
                    Chat.updateContacts(Message.GroupIMNr);

                    //系统会自动插入对应的文字
                    SuccessCallBack(response);


                }).fail((error) => {

                failureCallBack(error);

            });
        } catch (error) {
            Chat.ShowAlertConncet();
        }

    }

    //移除群成员
    static RemoveGroupMember = (Message, SuccessCallBack, failureCallBack) => {

        try {
            Chat.proxy.invoke('RemoveGroupMember', Message)

                .done((response) => {

                    Chat.updateContacts(Message.GroupIMNr);

                    SuccessCallBack(response);


                }).fail((error) => {

                failureCallBack(error);

            });
        } catch (error) {
            Chat.ShowAlertConncet();
        }
    }

    //修改群信息
    static ModifyGroupInfo = (Message, SuccessCallBack, FailureCallBack) => {


        try {


            Chat.proxy.invoke('ModifyGroupInfo', Message)

                .done(() => {


                console.log("群介绍介绍已经远程修改了-----修改成功")

                    var Param = 'ModifyGroupInfo -- 成功';
                    //在这里新增一条群消息，我主动修改的应该不会收到群通知以及群事件


/*
                    let item = Chat.obj.conversations.find(o =>  o.IMNr == Message.GroupIMNr);
                    if (item) {
                        //在这里将对应的这个

                        Chat.saveConversationList(Chat.obj.conversations);
                    }
*/




                    SuccessCallBack(Param);

                }).fail((error) => {

                FailureCallBack(error);

            });
        } catch (error) {
            Chat.ShowAlertConncet();
        }
    }

    //退出群聊
    static ExitGroup = (Message, SuccessCallBack, FailureCallBack) => {

        try {


            Chat.proxy.invoke('ExitGroup', Message)

                .done(() => {

                    Chat.removeConversations(Message.GroupIMNr, 'Group');


                    SuccessCallBack();

                }).fail((error) => {

                FailureCallBack(error);

            });
        } catch (error) {
            Chat.ShowAlertConncet();
        }
    }

    //解散群聊
    static DismissGroup = (Message, SuccessCallBack, FailureCallBack) => {

        try {


            Chat.proxy.invoke('DismissGroup', Message)

                .done(() => {

                    Chat.removeConversations(Message.GroupIMNr, 'Group');

                    console.log('你解散了该群成功');

                    //再回调呼出去
                    SuccessCallBack();


                }).fail((error) => {

                FailureCallBack(error);

            });
        } catch (error) {
            Chat.ShowAlertConncet();
        }


    }

    //申请入群
    static JoinGroup = (Message, SuccessCallBack, FailureCallBack) => {

        // console.log('JoinGroup--参数')
        // console.dir(Message);


        try {

            Chat.proxy.invoke('JoinGroup', Message).done(() => {

                // console.log('申请加群---你的申请已发出--')

                var param = '申请加群---你的申请已发出';
                // response(param);
                SuccessCallBack(param);


            }).fail((error) => {

                var param = '申请加群---你的申请失败';
                // failure(param)
                FailureCallBack(param);

            });

        } catch (error) {

            Chat.ShowAlertConncet();

        }
        ;


    };



    //添加好友前先发送这个消息，如果对方允许任何人添加，则直接添加好友成功；如果对方需要验证，则继续发送 AddFriend 消息进行下一步的好友验证；如果对方拒绝添加任何人，则添加还有失败。

    static  PreAddFriend = (Message,SuccessCallBack, failureCallBack) =>{

        try {

            Chat.proxy.invoke('PreAddFriend', Message).done((FriendAllowResponse) => {



                // console.dir(FriendAllowResponse);

                if(FriendAllowResponse.FriendAllowType=='AllowAny'){

                    //刷新通讯录
                     Chat._RefreshContact();
                }

                SuccessCallBack(FriendAllowResponse);

            }).fail((error) => {

                failureCallBack(error)

            });


        } catch (error) {

            Chat.ShowAlertConncet();

        }


    }




    //添加好友
    static AddFriend = (Message, SuccessCallBack, failureCallBack) => {


        try {

            Chat.proxy.invoke('AddFriend', Message).done(() => {
                var param = 'AddFriend请求成功';
                //刷新通讯录
                Chat._RefreshContact();
                SuccessCallBack(param);

            }).fail((error) => {

                failureCallBack(error)

            });


        } catch (error) {


            Chat.ShowAlertConncet();

        }
        ;


    }



    //删除好友
    static DeleteFriend = (Message, CallBack, failureCallBack) => {

        try {

            Chat.proxy.invoke('DeleteFriend', Message).done((response) => {

                //这里有好友的IMNr。(直接将conversations对应的那个conversation删除掉，会直接将记录也清空)
                Chat.removeConversations(Message.FriendIMNr, 'C2C');


                //刷新通讯录
               Chat._RefreshContact();


                CallBack(response);

            }).fail((error) => {

                failureCallBack(error)

            });

        } catch (error) {


            Chat.ShowAlertConncet();

        }
        ;


    }

    //同意/拒绝 好友申请
    static FriendResponse = (Message, SuccessCallBack, FailureCallBack) => {

        try {

            Chat.proxy.invoke('FriendResponse', Message).done(() => {

                var param = 'FriendResponse';

                Chat.obj.totalFriendPendingCount -= 1;
                Chat.showCount();


                SuccessCallBack(param);

            }).fail((error) => {

                FailureCallBack(error)

            });

        } catch (error) {


            Chat.ShowAlertConncet();

        }
        ;


    }

    //同意/拒绝 好友申请
    static GroupResponse = (Message, SuccessCallBack, FailureCallBack) => {

        try {
            Chat.proxy.invoke('GroupResponse', Message).done(() => {

                var param = 'GroupResponse';

                SuccessCallBack(param);

            }).fail((error) => {

                FailureCallBack(error)

            });
        } catch (error) {

            Chat.ShowAlertConncet();

        }
        ;

    }


    /*-----------IM相关群相关操作------------------------------------------*/
    //创建群聊
    static _IMGroupCreate = (message, success) => {


        try {


            Chat.proxy.invoke('CreateGroup', message)

                .done((response) => {


                }).fail(() => {

            });
        } catch (error) {

            Chat.ShowAlertConncet();

        }
        ;

    };


    //修改群资料，并修改通讯录
    static updateContacts = async(IMNr) => {

        // console.log('updateContacts -- 要修改的群IMNr')
        // console.dir(IMNr);

        let groupNrs = [IMNr];
        let groupsInfo = await IM.getUserOrGroups({
            "GroupNrs": groupNrs
        });

        var Group = groupsInfo[0];
        // console.dir(Group);

        //var contacts = await Chat._GetContacts();
        var contacts = await Chat.obj.Contacts;

        var tempContacts = contacts;
        var Groups = contacts.Groups;

        var index = Groups.findIndex((o) => o.IMNr == IMNr);
        if (index == -1) {

        }
        else {

            Groups[index] = Group;
            tempContacts.Groups = Groups;

            Chat._SaveContacts(tempContacts);


        }


    }


    //找资料了

    static getGroup = async(IMNr) => {


       // var contacts = await Chat._GetContacts();
        var contacts = await Chat.obj.Contacts;

        // console.log('getGroup -getGroup-'+IMNr);
        // console.dir(contacts);

        var Groups = contacts.Groups;

        var index = Groups.findIndex((o) => o.IMNr == IMNr);

        // alert(index);

        if (index == -1) {

            let groupNrs = [IMNr];
            let groupsInfo = await IM.getUserOrGroups({
                "GroupNrs": groupNrs
            });
            // console.log('所有的群资料')
            // console.dir(groupsInfo);
            return groupsInfo[0];


        }
        else {
            return Groups[index];
        }


    };


    static getUserName = (User) => {

        return User && User.Name ? User.Name : User.IMNr;
    };

    //返回用户名
    static _IMGetUserName = (User) => {

        return User && User.Name ? User.Name : User.IMNr;

    };

    //返回群名
    static _IMGetGroupName = (group) => {


        //有群名
        var Name;
        if (group && group.Name) {
            Name = group.Name;
        }

        //没有群名字
        else {
            var name = '';

            for (var i = 0, len = group.Members.length; i < len; i++) {

                var Member = group.Members[i];

                var memberName = Chat._IMGetUserName(Member); //群成员的名字

                name = name + memberName + ',';
            }

            Name = name;

        }


        return Name;

    }


    //获取登陆用户
    static  getLoginInfo = () => {
        //获取存取的用户数据
        return Chat.userInfo;

    }

    //获取群组信息
    static _getMyGroupFromGroup = async(group) => {

        var IMNrResponse = Chat.getLoginInfo();

        var Name;//名字
        var Intro;//群介绍
        var FaceUrlPath;//头像
        var isShowAvatar;//是否显示钉钉头像
        var isMembersOfTheGroup = false;//是否为群成员
        var IMNr = IMNrResponse.User.IMNr;

        //判断我是否在群里面
        for (var i = 0; i < group.Members.length; i++) {

            var Member = group.Members[i];

            if (Member.IMNr == IMNr) {

                isMembersOfTheGroup = true;
                break;

            }

        }


        Name = Chat._getGroupName(group);

        var IMGetGroupFaceUrlPath = Chat._IMGetGroupFaceUrlPath(group);

        var myGroup = {

            IMNr: group.IMNr,//群id
            Name: Name,//群名字
            Intro: group.Intro,//群介绍
            FaceUrlPath: IMGetGroupFaceUrlPath.FaceUrlPath,//群头像
            isShowAvatar: IMGetGroupFaceUrlPath.isShowAvatar,
            FaceUrlPaths: IMGetGroupFaceUrlPath.FaceUrlPaths,//群头像数组
            Owner: group.Owner,
            OwnerName: group.OwnerName,
            Members: group.Members,
            isMembersOfTheGroup: isMembersOfTheGroup
        };

        console.log('_getMyGroupFromGroup --- myGroup');
        // console.dir(myGroup);

        return myGroup;

    }


    static _getGroupName = (group) => {

        var Name;
        //有群名
        if (group.Name && group.Name.length > 0) {
            Name = group.Name;
        }

        //没有群名字
        else {

            var name = '';

            for (var i = 0; i < group.Members.length; i++) {

                var Member = group.Members[i];

                var memberName; //群成员的名字

                if (Member.Name == null || Member.Name == undefined) {
                    memberName = Member.IMNr;
                }
                else {
                    memberName = Member.Name;
                }

                name = name + memberName + ',';
            }

            Name = name;

        }

        return Name;


    }

    static   _getCurrentTime = () => {

        var date = new Date().toISOString();
        return moment(date).format('YYYY-MM-DDTHH:mm:ss');

    };

    //返回群头像
    static _IMGetGroupFaceUrlPath = (group) => {


        var FaceUrlPath;
        var isShowAvatar;
        var FaceUrlPaths;

        if (group && group.FaceUrlPath) {

            FaceUrlPath = Chat.getFaceUrlPath(group.FaceUrlPath);
            isShowAvatar = false;
            FaceUrlPaths = undefined;
        }
        else {

            var tempFaceUrlPaths = [];

            for (var i = 0; i < group.Members.length; i++) {

                var Member = group.Members[i];
                tempFaceUrlPaths.push(Member.FaceUrlPath);
            }

            isShowAvatar = true;
            FaceUrlPath = undefined;
            FaceUrlPaths = tempFaceUrlPaths;

        }


        var result = {

            FaceUrlPath: FaceUrlPath,
            isShowAvatar: isShowAvatar,
            FaceUrlPaths: FaceUrlPaths,
        };

        return result;

    }

    static window = {

        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    }

    //联系人组件样式
    static ContactComponent = {

        margin: 10,
        iconW: 38,
        fontSize: 14,
    };


    //如果type有传则说明直接比较拼音。
    static pySegSort = (arr, success, failure) => {


        var temp = arr;

        var ccc = (arr.sort((obj1, obj2) => {


            var val1 = obj1.User.Pinyin.toUpperCase();
            var val2 = obj2.User.Pinyin.toUpperCase();


            if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }
        }));


        var dic = {};

        ccc.map((contact) => {


            var first = contact.User.Pinyin.toUpperCase().substring(0, 1);


            if (first == undefined) {
                alert('Pinyin')
            }

            if (dic[first] != undefined) {
                dic[first].push(contact);
            }
            else {
                var data = [];
                data.push(contact);
                dic[first] = data;
            }
        })


        if (dic) {
            success(dic);
        }

        else {
            failure();
        }


    };


    //与当前相隔天数
    static _YQFCompareDayFromNow = (fromDateString) => {


        var currentDateString = fromDateString.substring(0, 19);

        var nowTime = (new Date()).valueOf();//这是当前时间
        //   var fromDate=moment(fromDateString).valueOf();//xg
        var fromDate = moment(currentDateString).valueOf();

        var date3 = nowTime - fromDate;

        //距离今天有几天
        var days = Math.floor(date3 / (24 * 3600 * 1000));
        if (days > 3) {
            return true;
        }

        return false;
    };

    static showCount = async() => {


        /*
        //#TODO 我去过已经重构，这个方法kennel不会调用
        //如果是我去过，则需要调用去显示数字，LR不用，mobx已经处理。
        if (Chat.obj.Source == '我去过') {

            console.log('showCount -  showCount - showCount')

            Chat.obj.totalUnReadMessage = Enumerable.from(Chat.obj.conversations).sum(o => o.UnreadCount);
            Chat.showMessaeg({'unreadmessageCout': Chat.obj.totalUnReadMessage});
            Chat.showMessaeg({'unreadcontactCout': Chat.obj.totalFriendPendingCount});
        }
        */
    };

//设置webview与rn交互的userAgent
    static  setUserAgent = (userId, success, failCallback) => {



        // console.log('现在要将UserId存进userAgent里面去');
        // console.dir(userId);

        if (Platform.OS == 'ios') {

            NativeModules.MyNativeModule.setUserAgent(userId)
                .then((data) => {

                   // console.log('调用原生的setUserAgent 之后返回的data');
               //     console.dir(data);

                    success(data)

                }).catch((error) => {

                failCallback(error);
            });
        }


        //安卓的userAgent
        else {


        }

    };


//第三方分享
    static thirdShare = (shareType, title, content, thumbImage, url, success, failure) => {
        NativeModules.MyNativeModule.thirdShare(shareType, title, content, thumbImage, url).then((datas) => {
            success(datas);

        }).catch((error) => {

            failure(error);
        })

    }


    //这是新修改的第三方分享
    static ThirdShare = (shareType, title, content, thumbImage, Image, success, failure) => {

        // console.log('ThirdShare  Image ')
        // console.dir(Image);

        NativeModules.MyNativeModule.ThirdShare(shareType, title, content, thumbImage, Image).then((datas) => {

            success(datas);

        }).catch((error) => {
            failure(error);
        })

    }


//保存图片到本地
    static   saveImageToPhotos = (imageUrl, success, failCallback) => {

        // if(Platform.OS =='ios') {

        NativeModules.MyNativeModule.saveImageToPhotos(imageUrl)
            .then((data) => {

                // console.log('图片已保存到本地---')
                Alert.alert('图片已保存到本地')
                success(data);

            })
            .catch((error) => {
                failCallback(error);
            });

    }


    static  ShowAlertConncet = () => {

        Alert.alert(
            'IM连接中断，是否重新连接',
            '',
            [
                {
                    text: '重新连接', onPress: () => {

                    Chat.init(Chat.userInfo.User.UserCode, () => {


                        if (Chat.obj.Source == '抢单') {

                            console.log('这里是重新连接之后的回调抢单 --  被登陆 ---  返回到登陆页面');
                            Profile.exitLogin(this.props);

                        } else {

                            Chat.logout();
                        }


                    })

                }
                },
                {
                    text: '取消', onPress: () => {
                    console.log('点击取消')
                }
                }
            ]
        );

    }


    static isAndroid = () => {

        if (Platform.OS === 'android') {
            return true;
        }
        return false;


    }

    static getTimeHello = () => {

        var str;
        var now = new Date();
        var hour = now.getHours();
        if (hour < 6) {
            str = '凌晨好,';
        }
        else if (hour < 9) {
            str = '早上好,'
        }
        else if (hour < 12) {
            str = '上午好,'
        }
        else if (hour < 14) {
            str = '中午好,'
        }
        else if (hour < 17) {
            str = '下午好,'
        }
        else if (hour < 19) {
            str = '傍晚好,'
        }
        else if (hour < 22) {
            str = '晚上好,'
        }
        else {
            str = '夜里好,'
        }

        return str;

    }


    static getWoquguoCorverImagePath = (url) => {


        if (!url)
            return "https://img2.yiqifei.com/face.png!60";
        else
            return "http://img8.yiqifei.com" + url;
    }


    static getPosterImagePath = (url) => {

        if (!url)
            return "https://img2.yiqifei.com/face.png!60";
        else
            return "http://img0.yiqifei.com/" + url;
    }

    static showDate = (fromDateString) => {

        // console.warn('如果没有传入后一个时间，则默认以当前时间来比较');

        var currentDateString = fromDateString.substring(0, 19);

        // var nowTime = (new Date()).valueOf();//这是当前时间
        // var fromDate = moment(currentDateString).valueOf();
        // var date3 = nowTime - fromDate;
        //
        //
        // //距离今天有几天
        // var days = Math.floor(date3 / (24 * 3600 * 1000))
        //
        // var leave1 = date3 % (24 * 3600 * 1000)
        // var hours = Math.floor(leave1 / (3600 * 1000))
        //
        // var leave2 = leave1 % (3600 * 1000)
        // var minutes = Math.floor(leave2 / (60 * 1000))
        // var leave3 = leave2 % (60 * 1000)
        // var seconds = Math.round(leave3 / 1000)
        // var myText;
        //
        // if(days>0){
        //
        //     myText=days+'天前';
        //     //大于1天，全部显示为具体日期
        //     if(days>1)
        //     {
        //
        //         myText =moment(currentDateString).format('YYYY/MM/DD');
        //         //myText = week;
        //     }
        //
        //     //昨天
        //     else
        //     {
        //         myText = '昨天';
        //     }
        //
        // }
        //
        // else
        // {
        //     var today = new Date().getDate();
        //     if(day==today)
        //     {
        //         myText =(moment(currentDateString).format('HH:mm'));
        //     }
        //     else
        //     {
        //
        //         myText ='昨天';
        //     }
        //
        // }


        return (moment(currentDateString).format('YYYY.MM.DD HH:mm'));
    }


    //获取素材列表的数据
    static  getLabelInfos = async() => {


        var LabelInfoResult = await ServingClient.execute('Channel.LabelInfoGetAll', {});


        var tempLabelTypeInfo = [];

        for (var i = 0; i < LabelInfoResult.LabelTypeInfos.length; i++) {

            var LabelTypeInfo = LabelInfoResult.LabelTypeInfos[i];
            var LabelInfos = LabelTypeInfo.LabelInfos;

            var dict = {
                ID: 0,
                SourceTypeID: LabelTypeInfo.ID,
                LabelID: null,
                LabelName: '全部'
            };
            LabelInfos.splice(0, 0, dict);
            LabelTypeInfo.LabelInfos = LabelInfos;
            tempLabelTypeInfo[i] = LabelTypeInfo;

        }


        Chat.LabelInfoResult = LabelInfoResult;
        Chat.LabelInfoResult.LabelTypeInfos = tempLabelTypeInfo;

        // console.log('加上全部之后的素材')
        // console.dir(Chat.LabelInfoResult);


        var firstLabelTypeInfo = Chat.LabelInfoResult.LabelTypeInfos[0].LabelInfos;
        // console.log('firstLabelTypeInfo')
        // console.dir(firstLabelTypeInfo);

        for (var j = 0; j < Chat.LabelInfoResult.MLOfDistricts.length; j++) {

            firstLabelTypeInfo.push(Chat.LabelInfoResult.MLOfDistricts[j]);
        }

        Chat.LabelInfoResult.LabelTypeInfos[0].LabelInfos = firstLabelTypeInfo;



    }


}




