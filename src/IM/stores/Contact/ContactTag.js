/**
 * Created by yqf on 2017/11/8.
 */
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';



export default  class ContactTag{

    @observable isLoading = true;

    @observable Tags = [];

    @computed get getDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.Tags.slice());

    }


}
