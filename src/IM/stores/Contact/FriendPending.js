/**
 * Created by yqf on 2017/10/30.
 */


import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import {Chat} from '../../utils/chat'

export default  class FriendPending{

    @observable isLoading = true;

    @observable  FriendItems= [];

    @computed get getDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.FriendItems.slice());
    }

    // @computed get getDataSource(){
    //
    //     ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
    //     return ds.cloneWithRows(Chat.obj.FriendItems.slice());
    // }

}
