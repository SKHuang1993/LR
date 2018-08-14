import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import moment from 'moment';
import deepDiffer from 'deepDiffer';
import { Chat } from '../../utils/chat';
import { Knowledge } from '../../utils/data-access';

export default class NotificationList {
    @observable isLoading = true;
    @observable isFinish = false;
    @observable messageList = [];
    PageIndex = 1;
    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.messageList.slice());
    }

    getMsgList = async () => {
        try {
            this.isLoading = true;
            let param = {
                "CompanyCode": null,
                "RecipientUserCode": Chat.userInfo.User.UserCode,
                "StatusID": 1,
                "BusinessTypeID": 109,
                "MsgTypeID": 13,
                "Effectiveness": true,
                "PageIndex": this.PageIndex++,
                "PageSize": 15
            }
            let result = await Knowledge.getMsgList(param);
            Enumerable.from(result.Result.MessageList).doAction(o => {
                o.ReadDate = o.ReadDate ? o.ReadDate : null;
                let title = o.ContentRawData.match(/<Title>(.+)<\/Title>/);
                if (title && title.length > 1) o.Title = title[1];
                let orderId = o.ContentRawData.match(/<OrderID>(.+)<\/OrderID>/);
                if (orderId && orderId.length > 1) o.OrderID = orderId[1];
                let bookerID = o.ContentRawData.match(/<BookerID>(.+)<\/BookerID>/);
                if (bookerID && bookerID.length > 1) o.BookerID = bookerID[1];
            }).toArray();
            this.messageList = this.messageList.concat(result.Result.MessageList);
            this.isLoading = false;
            if (this.messageList.length == result.Result.RowCount)
                this.isFinish = true;
            //console.log(this.messageList);
        }
        catch (err) {
            this.isLoading = false;
            console.log(err);
        }
    }

    setMsgListRead = async (id) => {
        // "RecipientUserCode": Chat.userInfo.User.UserCode,
        let param = {
            "IDs": [
                id
            ]
        }
        let result = await Knowledge.setMsgListRead(param);
        //console.log(result);
    }

}