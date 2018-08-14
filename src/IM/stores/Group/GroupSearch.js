/**
 * Created by yqf on 2017/10/30.
 */


import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';


export default  class GroupCreate{

    @observable text = null;

    @observable Groups=[];

    @observable isLoading = true;


    @computed get getDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.Groups.slice());

    }


}
