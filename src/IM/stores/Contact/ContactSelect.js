/**
 * Created by yqf on 2017/11/2.
 */






import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';

export default class Contacts {


    @observable type = null;//类型

    @observable LocalContacts={};

    @observable Contact={};

    @observable Users=[];

    @observable  SelectList = [];


    @computed get getContactDataSource(){

        ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2
        });

        return ds.cloneWithRowsAndSections(toJS(this.Contact));

    }

    @computed get getUsersDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.Users.slice());

    }




}