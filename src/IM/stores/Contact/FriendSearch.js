/**
 * Created by yqf on 2017/11/1.
 */


import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';


import {Chat}  from '../../utils/chat';
import {IM}  from '../../utils/data-access/im';



export default  class FriendSearch{



    @observable KKContactMap={isOpen:true,KKContact:[]}
    @observable KKGroupMap={isOpen:true,KKGroup:[]}


    //这是营业员特有
    @observable KKColleagueMap={isOpen:true,KKColleague:[]}
    @observable KKCustomMap={isOpen:true,KKCustom:[]}

    //这是散客特有
    @observable KKGuwenMap={isOpen:true,KKGuwen:[]}


    @observable  contact = {

        LocalContact:[],
        LocalCustom:[],
        LocalColleague:[],
        LocalGroup:[],
    };  //通讯里面的数据。1我的好友 2我的客户 3我的同事 4我的群组






    @observable MaxItemCount  =5;

    @observable title;//标题

    @observable type;//类型 （联系人中的好友，群组， 搜索好友）

    @observable isLoading = false;判断是否要显示加载

    @observable isEmpty = false;//判断是否为空页面

    @observable Users = [];//数组

    @observable keyWord = null;//搜索关键词

    @computed get getDataSource(){
        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.Users.slice());

    }

    //好友
    @computed get getContactDataSource(){
        ds1 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        var length  = this.KKContactMap.KKContact.length > this.MaxItemCount ? this.MaxItemCount : this.KKContactMap.KKContact.length
        var currentArray =  this.KKContactMap.isOpen==true ?  this.KKContactMap.KKContact :  this.KKContactMap.KKContact.slice(0,length);
        return ds1.cloneWithRows(currentArray.slice());

    }

    //客户
    @computed get getCustomDataSource(){
        ds2 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        var length  = this.KKCustomMap.KKCustom.length > this.MaxItemCount ? this.MaxItemCount :  this.KKCustomMap.KKCustom.length
        var currentArray =  this.KKCustomMap.isOpen==true ?   this.KKCustomMap.KKCustom:   this.KKCustomMap.KKCustom.slice(0,length);
        return ds2.cloneWithRows(currentArray.slice());    }

    //同事
    @computed get getColleagueDataSource(){
        ds3 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        var length  = this.KKColleagueMap.KKColleague.length > this.MaxItemCount ? this.MaxItemCount : this.KKColleagueMap.KKColleague.length;
        var currentArray =  this.KKColleagueMap.isOpen==true ?  this.KKColleagueMap.KKColleague :  this.KKColleagueMap.KKColleague.slice(0,length);
        return ds3.cloneWithRows(currentArray.slice());
    }

    //群组
    @computed get getGroupDataSource(){
        ds4= new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});

        var length  = this.KKGroupMap.KKGroup.length > 5 ? 5 : this.KKGroupMap.KKGroup.length
        var currentArray =  this.KKGroupMap.isOpen==true ?  this.KKGroupMap.KKGroup :  this.KKGroupMap.KKGroup.slice(0,length);
        return ds4.cloneWithRows(currentArray.slice());
    }

    //顾问
    @computed get getGuwenDataSource(){
        ds5 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        var length  = this.KKGuwenMap.KKGuwen.length > this.MaxItemCount ? this.MaxItemCount : this.KKGuwenMap.KKGuwen.length;
        var currentArray =  this.KKGuwenMap.isOpen==true ?  this.KKGuwenMap.KKGuwen :  this.KKGuwenMap.KKGuwen.slice(0,length);
        return ds5.cloneWithRows(currentArray.slice());
    }





}
