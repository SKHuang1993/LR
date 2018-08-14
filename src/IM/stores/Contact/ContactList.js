/**
 * Created by yqf on 2017/10/30.
 */


//联系人列表模型

import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'


import {Chat}  from '../../utils/chat';
import {IM}  from '../../utils/data-access/im';



export default  class contactList{


    @observable title;//标题

    @observable type;//类型 同事，客户，还有群组，组织架构，标签联系人


    @observable isLoading = true;

    @observable ContactList = [];

    @computed get getDataSource(){

        // console.log('contactList--')

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.ContactList.slice());

    }


}
