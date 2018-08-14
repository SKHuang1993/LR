import { extendObservable, action, computed, toJS, observable, autorun } from 'mobx';
import { Alert, NativeModules, ListView, StatusBar } from 'react-native';
import Enumerable from 'linq';
import moment from 'moment';
import deepDiffer from 'deepDiffer';
import { Chat } from '../../utils/chat';
import { observer } from 'mobx-react/native';
import ImagePicker from 'react-native-image-picker';
import { IM } from '../../utils/data-access';
import { ServingClient } from '../../utils/yqfws';
import { COLORS, FLEXBOX } from '../../styles/commonStyle';

export default class ChatRoom {

    isLoading = false;
    @observable conversation = {};
    @observable text = "";
    @observable pageIndex = 1;
    @observable ImageIndex = 0;
    @observable ImagesUrl = [];

    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.conversation.Messages.slice());
    }

    photoOptions = {
        quality: 0.70,
        allowsEditing: false,
        noData: false,
        maxWidth: FLEXBOX.width * FLEXBOX.pixel,
        maxHeight: FLEXBOX.height * FLEXBOX.pixel,
        storageOptions: {
            skipBackup: true,
            path: 'images'
        }
    }

    //会话页面日期的显示格式
    getTimeStamp = (time) => {
        let date = moment(time);
        let now = moment();
        if (date.format("YYYY-MM-DD") == moment().format("YYYY-MM-DD"))
            return date.format("HH:mm");
        else if (now.year() != date.year())
            return date.format("YYYY-MM-DD HH:mm");
        else if (now.month() == date.month() && now.date() - date.date() < 7) {
            if (now.date() - date.date() == 1)
                return "昨天" + " " + date.format("HH:mm");
            else
                return date.format("dddd") + " " + date.format("HH:mm");
        }
        else
            return date.format("MM-DD") + " " + date.format("HH:mm");
    }

    launchCamera = (callback) => {
        ImagePicker.launchCamera(this.photoOptions, (response) => {
            //console.log(response);
            if (response.data) {
                let param = {
                    Url: "data:image/png;base64," + response.data,
                    Base64: response.data,
                    Width: response.width,
                    Height: response.height,
                }
                Chat.sendImageMessage(this.conversation, param);
                if (callback)
                    callback();
            }
        });
    }

    launchImageLibrary = (callback) => {
        StatusBar.setBarStyle("default");
        ImagePicker.launchImageLibrary(this.photoOptions, (response) => {
            StatusBar.setBarStyle("light-content");
            //console.log(response);
            if (response.data) {
                let param = {
                    Url: "data:image/png;base64," + response.data,
                    Base64: response.data,
                    Width: response.width,
                    Height: response.height,
                }
                Chat.sendImageMessage(this.conversation, param);
                if (callback)
                    callback();
            }
        });
    }

    //消息发送失败时进行重发
    reSend = async (message) => {
        if (message) {
            if (message.ChatMessage.MessageType == "Text") {
                message.Status = 3;
                Chat.sendMessage(message, this.conversation);
            } if (message.ChatMessage.MessageType == "Image") {
                message.Status = 3;
                let param = {
                    BucketName: 'yqf-imres',
                    ImageBytes: message.ChatMessage.ImageContent.Base64
                }
                let result = await ServingClient.execute("Base.ImageUpload", param);
                if (result && result.Path) {
                    message.ChatMessage.ImageContent.Url = "https://res.im.yiqifei.com" + result.Path;
                    delete message.ChatMessage.ImageContent.Base64;
                }
                Chat.sendMessage(message, this.conversation, message.ChatMessage.ImageContent.Base64);
            }
        }
    }

    //初始化ImageViewer
    initImageViewer = (obj) => {
        let images = Enumerable.from(this.conversation.Messages).where(o => o.ChatMessage && o.ChatMessage.MessageType == "Image").toArray();
        this.ImagesUrl = Enumerable.from(images).select(o => { return { url: o.ChatMessage.ImageContent.Url } }).toArray();
        let index = images.findIndex(o => {
            let o2 = { ...obj };
            delete o2.position;

            let o1 = toJS(o);
            delete o1.position;
            return !deepDiffer(o1, o2);
        });
        if (index != -1) {
            this.ImageIndex = index;
        }
    }
}