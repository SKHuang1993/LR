/**
 * Created by yqf on 2017/10/30.
 */


//添加好友 推荐

import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';


import {Chat}  from '../../utils/chat';
import {IM}  from '../../utils/data-access/im';


export default  class FriendRecommend{


    @observable isLoading = true;

    @observable Users = [];

    @computed get getDataSource(){


        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.Users.slice());

    }


}
