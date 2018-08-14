/**
 * Created by yqf on 2017/10/30.
 */


//聊天文件
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';

export default  class ChatFile{


    @observable Files = [];

    @computed get getDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.Files.slice());

    }


}
