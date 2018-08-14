

import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';

import {Chat}  from '../../utils/chat';


export default  class ChatList{


    @observable isShowMenu = false;
    @observable isLoading = true;
    @observable conversationList = [];

    @computed get getDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});

        return ds.cloneWithRows(Chat.obj.conversations.slice());

    }


}
