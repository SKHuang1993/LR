import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import moment from 'moment';
import deepDiffer from 'deepDiffer';
import { Chat } from '../../utils/chat';
import { Knowledge } from '../../utils/data-access';

export default class ChatList {
    @observable isLoading = true;
    @observable conversationList = [];
    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(Chat.obj.conversations.slice());
    }
}