//通讯录

import { observer } from 'mobx-react/native';
import {observable, autorun,computed,action} from 'mobx'
import React, { PropTypes } from 'react';
import {Component} from 'react';
import Swipeout from 'react-native-swipeout';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import ContactCustom from './ContactCustom'

import ContactTag from './ContactTag';

import FriendSearch from './FriendSearch'
import ActivityIndicator from '../../components/activity-indicator/index'

import {
    TouchableHighlight,
    TouchableOpacity,
    StyleSheet,
    Image,
    ListView,
    Text,
    View, RefreshControl,
    BackHandler

} from 'react-native';

import FriendRecommend from './FriendRecommend';
import FriendPending from './FriendPending';


import contacts from '../../stores/Contact/Contacts';

import YQFNavBar from '../../components/yqfNavBar';
import Icon from '../../components/icon';

import {IM} from '../../utils/data-access/im';
import Chat_Util from '../../utils/Chat_Util';

import  Colors from '../../Themes/Colors';
 import ContactList from './ContactList';
import ContactOrganization from './ContactOrganization';

import {Chat} from '../../utils/chat';
import ChatUserInfo from '../Chat/ChatUserInfo';


let margin=10;
let iconW = 38;
let fontSize=14;


@observer

export default class Contacts extends Component{

    constructor(props){

        super(props);
        this.store =new contacts();
        this.state={

            json:null
        }

    }


    componentWillUnmount = ()=>{

        if(Chat.isAndroid()) {
            BackHandler.removeEventListener('hardwareBackPress', ()=>{});
        }

    }

    _handleAndroidBack = ()=>{
        // let _this = this;

        // BackHandler.addEventListener('hardwareBackPress', function () {

        //     if (_this.props.navigator && _this.props.navigator.getCurrentRoutes().length > 1) {

        //         _this.props.navigator.pop();

        //         return true;
        //     } else {

        //         BackHandler.exitApp();
        //         return false;
        //     }
        // });
    }

    componentDidMount = ()=>{


        if(Chat.isAndroid()){
            this._handleAndroidBack();

        }



        this._DealData()


    }


    //处理数据
    _DealData = async()=>{


        //这里最好还是要去缓存里面获取。否则的话每次会被卡到

        var Users  =Chat.obj.Contacts.Users;


        for(var i=0; i<Users.length;i++)
        {

            var user = Users[i];
            //所属分类分组ID，1-同事，2-客户，3-旅行顾问，4-好友

            for(var j=0 ;j<user.Catagories.length;j++)
            {

                var  catagory = user.Catagories[j];

                //同事
                if(catagory == 1)
                {

                    this.store.addressList.WorkMake.datas.push(user);
                }

                //2-客户
                if(catagory == 2)
                {

                    this.store.addressList.Customer.datas.push(user);
                }

                //3-旅行顾问
                if(catagory == 3)
                {
                    this.store.addressList.Advisor.datas.push(user);
                }

                //4-好友
                if(catagory == 4)
                {
                    this.store.addressList.Friend.datas.push(user);

                }


            }

        }


    }


    _back = ()=>{

        //如果是我去过，则需要返回到上一级
        if(Chat.obj.Source == '我去过'){
            Chat.showCount();

            this.props.navigator.popToTop();

        }

        else {

            //  this.props.navigator.popToTop();

        }

    }

    _ToChatUserInfo(data){

        this.props.navigator.push({

            component:ChatUserInfo,
            passProps:{
                Peer:data.User.IMNr,
                User:data.User,
                isContact:true
            }
        })

    }



    DeleteFriend(data,sectionID,rowID){



        //显示loading
this.store.isLoading=true;



        var Message = {
            FriendIMNr:data.User.IMNr
        }

        //主动删除
        Chat.DeleteFriend(Message,(response)=>{

            //删除好友成功。刷新通讯录
            console.log('服务器已经将数据删除，同时也已经更新了,调用当前的一个方法去更新数据');

            //这里已经删除完成了。将loading去掉
            this.store.isLoading=false;




        },(failure)=>{

            //删除好友失败，刷新通讯录
            alert('删除好友失败，请稍候重试')
        });

    }


    _renderMyGroup(){

        var Group = {Name:'我的群组'};

        return(
            <MessageSystem data={Group} onPress={()=>{

                       this.props.navigator.push({

                           component:ContactList,
                       passProps:{
                             type:'Group',

                           }
                       })


                }}/>
        )
    }

    _renderOrganization(){

        var Group = {Name:'组织架构'};

        if(Chat.loginUserResult.DetailInfo.OrganizaType &&  Chat.loginUserResult.DetailInfo.OrganizaType=="INCU"){

            return(
                <MessageSystem data={Group} onPress={()=>{



                       this.props.navigator.push({

                           component:ContactOrganization,
                       passProps:{
type:1,
title:'组织架构'

                           }
                       })


                }}/>
            )
        }
        return null;



    }

    _renderNewFriend(){

        var NewFriendData = {Name:'新朋友'};

        return(
            <MessageSystem data={NewFriendData}  tipsNumber={Chat.obj.totalFriendPendingCount} onPress={()=>{

                       this.props.navigator.push({

                           component:FriendPending,
                       })

                }}/>
        )

    }

    _renderWorkMate(){

        if(Chat.loginUserResult.DetailInfo.OrganizaType=="INCU"  && this.store.addressList.WorkMake.datas.length>0){

            return(<MessageSystem data={this.store.addressList.WorkMake} onPress={()=>{

                       this.props.navigator.push({

                           component:ContactList,
                           passProps:{
                               title:this.store.addressList.WorkMake.Name,
                               type:'WorkMake',
                               datas:this.store.addressList.WorkMake.datas,
                           }

                       })




                    }
                    }></MessageSystem>)
        }
        return null;

    }

    _renderTag(){

        var Group = {Name:'标签联系人'};


        return(

            <MessageSystem data={Group} onPress={()=>{

                       this.props.navigator.push({

                           component:ContactTag,
                       passProps:{

                           }
                       })


                }}/>
        )

        return null;
    }

    //顾问（仅针对非营业员）
    _renderGuwen = ()=>{

        if(Chat.loginUserResult.DetailInfo.OrganizaType!=="INCU"  && this.store.addressList.Advisor.datas.length>0){

            return(<MessageSystem data={this.store.addressList.Advisor} onPress={()=>{

                this.props.navigator.push({

                    component:ContactList,
                    passProps:{
                        title:this.store.addressList.Advisor.Name,
                        type:'Advisor',
                        datas:this.store.addressList.Advisor.datas,
                    }

                })
            }
            }></MessageSystem>)
        }
        return null;

    }

    _renderCustomer(){

        //如果登录的是

        if(Chat.loginUserResult.DetailInfo.OrganizaType=="INCU" && this.store.addressList.Customer.datas.length>0){

            return(

                <MessageSystem data={this.store.addressList.Customer} onPress={()=>{


                    this.props.navigator.push({
                        component:ContactCustom,
                        passProps:{

                        }
                    })
                    }
                    }>

                </MessageSystem>
            )
        }
        return null;

    }

    _renderHeader(){

        return(

            <View>

                <TouchableOpacity onPress={()=>{
                    this.props.navigator.push({

                        component:FriendSearch,
                        passProps:{
                            type:'Contact'
                        }
                    })


                }} style={{backgroundColor:Colors.colors.Chat_Color230,flex:1,height:50}}>


                    <View style={{flex:1,margin:8,borderRadius:3, backgroundColor:'white', justifyContent:'center',alignItems:'center',flexDirection:'row'}}>

                        <Icon size={13} color={Colors.colors.Chat_Color153} icon={0xe171} style={{marginRight:3}}/>

                        <Text style={[{fontSize:17,marginLeft:3,color:Colors.colors.Chat_Color153}]}>
                            {'搜索'}
                        </Text>


                    </View>


                </TouchableOpacity>


                {this._renderNewFriend()}
                {this._renderMyGroup()}
                {this._renderOrganization()}
                {this._renderWorkMate()}
                {this._renderCustomer()}
                {this._renderGuwen()}
                {this._renderTag()}



            </View>

        );
    }

    _renderSectionHeader(data,sectionID)
    {

        return(

            <View style={{backgroundColor:'rgb(244,244,244)',height:20,justifyContent:'center'}}>

                <Text style={[{marginLeft:10,color:Colors.colors.Chat_Color102}]}>
                    {sectionID.toLocaleUpperCase()}
                </Text>

            </View>

        );


    }

    _renderNav(){

        if(Chat.obj.Source =='我去过'){

            return(
                <YQFNavBar  leftIcon={'0xe183'} rightText={'添加好友'} title={'通讯录'}

                            onLeftClick={()=>{
                                   this._back();

                                  }}
                            onRightClick={()=>{

                         this.props.navigator.push({

                                           component:FriendRecommend,//跳到添加好友
                                       });

                                   }}
                />
            )
        }
        else {

            return(
                <YQFNavBar   rightText={'添加好友'} title={'通讯录'}

                             onRightClick={()=>{

                         this.props.navigator.push({
                                           component:FriendRecommend,//跳到添加好友
                                       });

                                   }}
                />
            )

        }


    }

    _renderListView(){


        return(
            <ListView
                dataSource={this.store.getDataSource}
                enableEmptySections={true}
                renderRow={this._renderRow.bind(this)}
                renderHeader={this._renderHeader.bind(this)}
                renderSectionHeader={this._renderSectionHeader.bind(this)}
                removeClippedSubviews={false}
            ></ListView>
        )
    }

    renderLoading() {

        if (this.store.isLoading) {

            return <ActivityIndicator toast text={this.store.loadingText} animating={this.store.isLoading}/>

        }

        return null;

    }

    render(){

        return(

            <View style={[{flex:1,backgroundColor:'white'}]}>

                {this._renderNav()}

                {this._renderListView()}

                {this.renderLoading()}



            </View>

        )


    }


        _renderRow(data,sectionID,rowID)
        {


            // console.log('data')
            // console.dir(data);


           var swipeoutBtns = [
                {
                    text: '删除',
                    backgroundColor:'red',

                    onPress:()=>{

                        this.DeleteFriend(data,sectionID,rowID);

                    }
                }
            ];

            var margin=Chat.ContactComponent.margin/2;
            var iconW = Chat.ContactComponent.iconW;

            return(


                <Swipeout right={swipeoutBtns}>

                    <TouchableOpacity onPress={()=>{

                        this._ToChatUserInfo(data);

            }}>

                        <View style={[styles.row,{backgroundColor:'white'}]}>

                            <Image style={{margin:margin*2,resizeMode:'cover',width:iconW,height:iconW,borderRadius:iconW/2}}
                                   source={{uri:Chat.getFaceUrlPath(data.User.FaceUrlPath) }}>

                            </Image>

                            <View style={[styles.center,{}]}>

                                <Text style={{fontSize:Chat.ContactComponent.fontSize,color:Colors.colors.Chat_Color51}}>
                                    {data.User.Name}
                                </Text>

                            </View>


                        </View>
                        <View style={{backgroundColor:Colors.colors.Chat_Color235,height:0.5,}}></View>

                    </TouchableOpacity>
                </Swipeout>


            );

        }



}


class MessageSystem extends Component
{

    render()
    {

        var  data = this.props.data;

        var icon='';
        var backgroundColor='';

        var Name=this.props.data.Name;


        if(Name == '同事'){

            backgroundColor = 'rgb(74,207,82)';
            icon = '0xe17a';
        }
        else if(Name == '客户'){
            backgroundColor = 'rgb(126,164,230)';
            icon = '0xe10c';
        }
        else if(Name == '顾问'){
            backgroundColor = 'rgb(74,207,82)';
            icon = '0xe17a';
        }

        else if(Name == '新朋友'){
            backgroundColor = 'rgb(190,188,88)';
            icon = '0xe17a';
        }


        else if(Name == '相互关注'){
            backgroundColor = 'rgb(244,120,164)';
            icon = '0xe694';
        }


        else if(Name == '群组'){
            backgroundColor = 'rgb(126,164,230)';
            icon = '0xe17b';
        }
        else if(Name == '组织架构'){

            backgroundColor = '#FFA544';
            icon = '0xe6bd';

        }
        else if(Name == '标签联系人'){

            backgroundColor = '#dc84f5';
            icon = '0xe61d';

        }

        else {
            backgroundColor = 'rgb(245,206,70)';
            icon = '0xe17b';

        }



        var iconH = iconW;

        var margin=7;

        return(


            <View>
                <TouchableOpacity onPress={this.props.onPress} style={[styles.row, {alignItems:'center',backgroundColor:'white'}]}>


                    <View style={[styles.center,{margin:margin,marginLeft:margin*2, width:iconW,height:iconW,borderRadius:iconW, backgroundColor:backgroundColor}]}>

                        <Icon size={22} color={'white'} icon={icon}/>

                    </View>


                    <View style={[{flex:1,backgroundColor:'white'}]}>
                        <View style={[styles.row,styles.flex, {justifyContent:'space-between',alignItems:'center',backgroundColor:'white'}]}>
                            <Text style={{color:Colors.colors.Chat_Color51,fontSize:fontSize,margin:0,marginLeft:0}}>
                                {this.props.data.Name}
                            </Text>


                            <View style={{flexDirection:'row'}}>

                                {
                                    this.props.tipsNumber &&  this.props.tipsNumber>0?

                                        <View style={[styles.center,{alignItems:'center', backgroundColor:'red',width:15,height:15,borderRadius:10}]}>
                                            <Text style={{color:'white',fontSize:8}}>{this.props.tipsNumber}</Text>
                                        </View>
                                        :
                                        null
                                }

                                <Icon size={16} color={'rgb(204,204,204)'} icon={'0xe177'} style={{marginRight:10,marginLeft:5}}/>


                            </View>



                        </View>
                    </View>




                </TouchableOpacity>

                {
                    this.props.data.Name !=='相互关注' ?    <View style={{height:0.5,backgroundColor:Colors.colors.Chat_Color235,marginLeft:margin}}></View>

                        :null
                }


            </View>


        );
    }

}



const styles = StyleSheet.create({

    row:{

        flexDirection:'row',

    },
    center: {

        justifyContent: 'center',
        alignItems: 'center',

    },

    flex:{
        backgroundColor:'rgb(248,248,248)',
        flex:1,
    },

    flex1:{
        flex:1,
    }


});

