/**
 * Created by yqf on 2017/10/27.
 */





//发现群

import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';


export default  class GroupDiscover{



    @observable isLoading = true;
    @observable LivelyGroups=[];//活跃的群组列表
    @observable RecommandGroups=[];//推荐的的群组列表
    @observable NewRecommandGroups=[];//最新群组列表

    @observable selectIndex = 0;


    @observable titleArray=[
        {name:'热门',select:true},
        {name:'最新',select:false},
    ];

    @computed get getTitleDataSource(){

        ds5 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds5.cloneWithRows(this.titleArray.slice());
    }


    //活跃的群组列表
    @computed get getLivelyGroups(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.LivelyGroups.slice());

    }

    //推荐的的群组列表
    @computed get getRecommandGroups(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});

        return ds.cloneWithRows(this.RecommandGroups.slice());
    }

    //最新群组列表
    @computed get getNewRecommandGroups(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.NewRecommandGroups.slice());

    }



}
