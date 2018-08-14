/**
 * Created by yqf on 2017/11/8.
 */
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';



export default  class TagAdd{

    @observable TagName = null;//便签名字 add update

    @observable Tags = {};

    @observable type = null;//类型 add update

    @observable title = null;//标题
    @observable SelectArray = [];
    @computed get getDataSource(){

        ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2
        });

        return ds.cloneWithRowsAndSections(toJS(this.Tags));

    }


}
