/**
 * Created by yqf on 2018/1/21.
 */

//我的客户



import { observer } from 'mobx-react/native';
import {observable, autorun,computed,action} from 'mobx'
import React, { PropTypes } from 'react';
import {Component} from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';

import YQFNavBar from '../../components/yqfNavBar';
import Icon from '../../components/icon';

// import Icon from '../../components/';


import Colors from '../../Themes/Colors';
import {Chat} from '../../utils/chat'
import {RestAPI, ServingClient} from '../../utils/yqfws';
import ChatUserInfo from '../Chat/ChatUserInfo';
import FriendSearch from './FriendSearch'
import {
    View,
    Text,
    Image,
    StyleSheet,
    ListView,
    ScrollView,
    TouchableWithoutFeedback,
    InteractionManager,
    StatusBar,
    WebView,
    AsyncStorage,
    TouchableOpacity,
    Modal,
    DeviceEventEmitter,
    ActivityIndicator,
    Switch,
    Platform,
    Dimensions,
    RefreshControl

} from  'react-native';

const window = {

    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
}


class  ContactCustomModel extends  Component{

    @observable SortByCreate = false;//按上传时间排序
    @observable PageSize = 5;//数目
    @observable PageCount = 1;//页码
    @observable isVideoRefreshing = false;//是否刷新
    @observable RowCount = 0;
    @observable isLoading =true;//是否显示loading
    @observable selectIndex = 0;
    @observable Users = [];

    @observable titleArray=[
        {name:'销售过的',select:true},
        {name:'服务过的',select:false},
    ];

    @computed get getTitleDataSource(){

        ds1 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds1.cloneWithRows(this.titleArray.slice());
    }


    @computed get getDataSource(){

        ds2 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds2.cloneWithRows(this.Users.slice());
    }

}



@observer

export  default class  ContactCustom extends  Component{

    constructor(props){
        super(props);
        this.store = new ContactCustomModel();

    }

    componentDidMount = ()=>{
        this._fetchData();
    }


    _fetchData = async()=>{

        this.store.isLoading = true;


        var param;

        //服务销售过的
        if(this.store.selectIndex == 1){


            //这里是否要存到内存里面去
            let param = {

               "UserCode": Chat.loginUserResult.AccountNo,
                "PageSize": 100,//#TODO 服务销售过的 现在每次是搜索找100条记录，应该不太懂
                "PageCount": this.passengers_sell_index++
            }

            let result = await RestAPI.execute("CRM.ClientManByUserCode", param);

            if(result && result.Result && result.Result.ServiceStaffs && result.Result.ServiceStaffs.length>0){

                this.store.isLoading = false;
                this.store.isEmpty = false;
                this.store.Users = result.Result.ServiceStaffs.slice();

                if(Chat.obj.Custom.ServiceStaffs && Chat.obj.Custom.ServiceStaffs.length>0){

                    Chat.obj.Custom.ServiceStaffs = Chat.obj.Custom.ServiceStaffs.concat(result.Result.ServiceStaffs);

                }else {
                    Chat.obj.Custom.ServiceStaffs =  result.Result.ServiceStaffs;
                }


            }


            else {
                this.store.isLoading = false;
                this.store.isEmpty = true;
            }



            // console.log(' 最近销售过的result')
            // console.dir(result);




        }else {
            //最近联系的  IM.GetRecentlyContacts

            //CRM.SalesPersonByUserCode 我销售过的客户
            param ={
                UserCode:Chat.userInfo.User.UserCode
            };


            var result = await  ServingClient.execute('CRM.SalesPersonByUserCode',param);
            this.store.isLoading = false;

            if(result && result.Customers && result.Customers.length>0){


                this.store.isLoading = false;
                this.store.isEmpty = false;
                this.store.Users = result.Customers.slice();

                // console.log('this.store.Users ---- 这里是销售过的')
                // console.dir(result.Customers);

            }

            else {
                this.store.isLoading = false;
                this.store.isEmpty = true;
            }


        }



    }



    _ClickTitleItem = (data,rowId)=>{


        var temp = this.store.titleArray;

        for(var i=0;i<temp.length;i++){
            temp[i].select = false;
        }
        temp[rowId].select=true;
        this.store.selectIndex  =rowId;

        this.store.titleArray=temp.slice();
        this.store.Users=[].slice();
        this._fetchData();

    }


    _renderTitleItem = (data,sectionId,rowId)=>{

        var titleColorStyle;
        if(data.select == true){
            titleColorStyle ={
                color:Colors.colors.LR_Color,
                fontSize:16
            }
        }else {
            titleColorStyle ={
                color:Colors.colors.Chat_Color51,
                fontSize:15
            }
        }

        return(


            <TouchableOpacity style={{}} onPress={()=>{this._ClickTitleItem(data,rowId)}}>
                <Text style={[{margin:10,},titleColorStyle]}>{data.name}</Text>
                {
                    data.select == true?

                        <View style={{backgroundColor:Colors.colors.LR_Color,height:2,position:'absolute',bottom:0,left:0,right:0}}></View>

                        :
                        null

                }

            </TouchableOpacity>

        )

    }



    _ToChatUserInfo=async(data)=>{

        if(this.store.selectIndex==0){

            //调用接口，获取用户的详细资料  IM.CreateUser
            var  createUserParam ={

                UserCode:data.UserCode,
                StaffCode:data.PersonCode,
                Name:data.CustomerName,
                RoleType:data.OrganizaType,
                Gender:data.Sex
            };

            var result = await ServingClient.execute('IM.CreateUser',createUserParam);


            // console.log("我销售过的人制造后的result")
            // console.dir(result)


            this.props.navigator.push({

                component:ChatUserInfo,
                passProps:{
                    Peer:result.User.IMNr,
                    User:result.User,
                    // isContact:true
                }
            })




        }else {


            //调用接口，获取用户的详细资料  IM.CreateUser
          var  createUserParam ={

              UserCode:data.UserCode,
              StaffCode:data.PersonCode,
              Name:data.Name,
              RoleType:data.CustomerTypeCode,
              Gender:data.Sex
            };

            var result = await ServingClient.execute('IM.CreateUser',createUserParam);


            this.props.navigator.push({

                component:ChatUserInfo,
                passProps:{
                    Peer:result.User.IMNr,
                    User:result.User,
                    // isContact:true
                }
            })


        }




    }

    _renderRow = (data,sectionID,rowID)=>{


        //最近联系的
        if(this.store.selectIndex == 0){

            return(

                <TouchableOpacity onPress={()=>{


                    this._ToChatUserInfo(data);

                }}>
                    <View style={{backgroundColor:'rgb(255,255,255)'}}>

                        <View style={{flexDirection:'row',alignItems:'center'}}>

                            <Image
                                style={{margin:Chat.ContactComponent.margin,resizeMode:'cover',width:Chat.ContactComponent.iconW,height:Chat.ContactComponent.iconW,borderRadius:Chat.ContactComponent.iconW/2}}
                                source={{uri:Chat.getFaceUrlPath(data.FaceUrlPath)}}>

                            </Image>


                            <Text numberOfLines={1}
                                  style={{fontSize:15,color:Colors.colors.Chat_Color51,marginRight:10}}>{data.CustomerName}</Text>

                        </View>

                        <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>
                    </View>
                </TouchableOpacity>

            );

        }else{

            return(

                <TouchableOpacity onPress={()=>{


                    this._ToChatUserInfo(data);

                }}>
                    <View style={{backgroundColor:'rgb(255,255,255)'}}>

                        <View style={{flexDirection:'row',alignItems:'center'}}>


                            <Text numberOfLines={1}
                                  style={{margin:15, fontSize:15,color:Colors.colors.Chat_Color51,marginRight:10}}>{data.Name}</Text>


                            <Text numberOfLines={1}
                                  style={{fontSize:15,color:Colors.colors.Chat_Color51,marginRight:10}}>{data.Phone ? data.Phone : '' }</Text>


                        </View>

                        <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>
                    </View>
                </TouchableOpacity>

            );



        }






    }







    _renderLine(){


        return(
            <View style={{backgroundColor:'rgb(235,235,235)',height:1,marginLeft:10}}></View>
        )
    }

    _renderNav(){
        return(
            <YQFNavBar title={'我的客户'}
                       leftIcon={'0xe183'}

                       onLeftClick={()=>{this.props.navigator.pop()}} />
        )
    }


    _renderTitleItem = (data,sectionId,rowId)=>{

        var titleColorStyle;
        if(data.select == true){
            titleColorStyle ={
                color:Colors.colors.LR_Color,
                fontSize:16
            }
        }else {
            titleColorStyle ={
                color:Colors.colors.Chat_Color51,
                fontSize:15
            }
        }

        return(



            <TouchableOpacity style={{width:window.width/2,alignItems:'center',justifyContent:'center'}} onPress={()=>{this._ClickTitleItem(data,rowId)}}>
                <Text style={[{margin:10,},titleColorStyle]}>{data.name}</Text>
                {
                    data.select == true?

                        <View style={{backgroundColor:Colors.colors.LR_Color,height:2,position:'absolute',bottom:0,left:0,right:0}}></View>

                        :
                        null

                }

            </TouchableOpacity>

        )

    }

    _renderLoading(){

        if(this.store.isLoading){

            return <ActivityIndicator toast text={'正在加载数据...'} animating={this.store.isLoading}/>
        }
        return null;


    }



    renderTitleView = ()=>{

        var contentViewStyle={
            flexDirection:'row',
        }



        var height =  window.width * (43 / 375);


        return(

            <View style={{height:height,backgroundColor:'white'}}>

                <ListView
                    ref={(titleListview)=>{this.titleListview = titleListview}}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    renderRow={this._renderTitleItem}
                    dataSource={this.store.getTitleDataSource}
                    removeClippedSubviews={false}
                    initialListSize={10}

                    contentContainerStyle={contentViewStyle}>

                </ListView>

            </View>
        )
    }

    _renderListView(){

        if(this.store.Users && this.store.Users.length>0){

            return(
                <ListView
                    style={{marginTop:5,backgroundColor:'#fff'}}
                    renderRow={this._renderRow}
                    dataSource={this.store.getDataSource}
                  >


                </ListView>
            )
        }

        return null


    }

    _renderSearchBar = ()=>{

        return(

        <TouchableOpacity onPress={()=>{
            this.props.navigator.push({

                component:FriendSearch,
                passProps:{
                    type:'Contact'
                }

            })


        }} style={{backgroundColor:Colors.colors.Chat_Color230,height:40}}>

            <View style={{flex:1,margin:8,borderRadius:3, backgroundColor:'white', justifyContent:'center',alignItems:'center',flexDirection:'row'}}>

                <Icon size={13} color={Colors.colors.Chat_Color153} icon={0xe171} style={{marginRight:3}}/>

                <Text style={[{fontSize:13,marginLeft:3,color:Colors.colors.Chat_Color153}]}>
                    {'搜索'}
                </Text>


            </View>


        </TouchableOpacity>
        )

    }

    render() {

        return(

            <View style={{backgroundColor:'rgb(235,235,235)',flex:1}}>

                {this._renderNav()}
                {this._renderSearchBar()}

                {this.renderTitleView()}
                {this._renderListView()}
                {this._renderLoading()}


            </View>



        );

    }



}


