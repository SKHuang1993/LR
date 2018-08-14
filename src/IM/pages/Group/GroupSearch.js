/**
 * Created by yqf on 2017/10/30.
 */


//群搜索组件

import { observer } from 'mobx-react/native';

import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'

import {
    TouchableOpacity,
    StyleSheet,
    Image,
    ListView,
    Text,
    View,
    RefreshControl,
    Dimensions

} from 'react-native';

import groupSearch from '../../stores/Group/GroupSearch';

import NavBar from '../../components/yqfNavBar';

import EmptyView  from '../../components/EmptyView';
import SessionAvatar  from '../../components/AvatarGroup';


import GroupApplication from './GroupApplication'
import {IM} from '../../utils/data-access/im';
import {Chat} from '../../utils/chat';


import Colors from '../../Themes/Colors';

@observer
export  default class GroupSearch extends Component
{

    constructor(props)
    {
        super(props);
        this.store = new groupSearch();
    }

    componentDidMount()
    {
        this._fetchData();
    }


    //通过传入群资料
    _getMyGroupFromGroup(group,index,IsInGroup){

        var Name;//名字
        var Intro;//群介绍
        var FaceUrlPath;//头像
        var isShowAvatar;//是否显示钉钉头像
        var level;

        //有群名
        if(group.Name)
        {
            Name= group.Name;
        }

        //没有群名字
        else
        {

            var name='';

            for (var i = 0; i < group.Members.length; i++) {

                var Member = group.Members[i];

                var memberName; //群成员的名字

                if(Member.Name ==null || Member.Name ==undefined)
                {
                    memberName = Member.IMNr;
                }
                else
                {
                    memberName = Member.Name;
                }

                name = name+memberName+',';
            }

            Name=name;

        }


        //有群介绍
        if(group.Intro)
        {
            Intro= group.Intro;
        }
        else {

            Intro=group.MemberCount+'人';
        }

        //有群头像
        if(group.FaceUrlPath)
        {

            FaceUrlPath=Chat.getFaceUrlPath(group.FaceUrlPath);

            isShowAvatar = false;

        }

        //没有群头像，需要去拼接
        else
        {

            var tempFaceUrlPaths=[];
            for (var i = 0; i < group.Members.length; i++) {

                var Member = group.Members[i];
                tempFaceUrlPaths.push(Member.FaceUrlPath);
            }
            isShowAvatar = true;
        }


        var myGroup={


            IMNr:group.IMNr,//群id
            Name:Name,//群名字
            Intro:Intro,//群介绍
            FaceUrlPath:FaceUrlPath,//群头像
            isShowAvatar:isShowAvatar,
            FaceUrlPaths:tempFaceUrlPaths,//群头像数组
            Owner:group.Owner,
            OwnerName:group.OwnerName,
            Members:group.Members,
            isMembersOfTheGroup:IsInGroup
        };


        if(index){

            myGroup.level = index;
        }

        return myGroup;

    }



  async  _fetchData()
    {

        var Param={

            Qty:5,
            MaxGroupMemberCount:4
        };

        var myGroups=[];

        var response =await IM.getLivelyGroups(Param);

        // console.log('getLivelyGroups -- 活跃数组')
        // console.dir(response);

        var Groups = response.Groups;

        for(var i=0;i<Groups.length;i++){

            var group = this._getMyGroupFromGroup(Groups[i],i+1);

            myGroups.push(group);
        }

        this.store.isLoading = false;
        this.store.Groups = myGroups;


    }

    //TODO  搜索群 ---这里面需要修改
  async  _searchGroup(keywords)
    {

        // console.log("这是要搜索的群 key")
        // console.dir(keywords)

        //点击搜索群的时候将之前的数据清空
        this.store.Groups = [];

        //后期这里需要修改成异步，可以传入当前登陆人的账号

        var Param = {

            Keywords:keywords,
            Owner:Chat.userInfo.User.IMNr,
            PageSize:100,
        };

        var SearchedGroups=[];
        var response = await IM.getSearchGroups(Param);

        // console.log('getSearchGroups -- 结果')
        // console.dir(response);


        if(response.TotalResults == 0){

            this.store.isLoading = false
        }

        else {


            for(var i=0;i<response.SearchedGroups.length;i++){

                var Group = response.SearchedGroups[i].Group;



                if(Group.Members.length>2 && response.SearchedGroups[i].IsInGroup == false){

                    SearchedGroups.push( this._getMyGroupFromGroup(response.SearchedGroups[i].Group,null,SearchedGroups[i].IsInGroup));
                }



            }


            //这里应该要隐藏
            if(SearchedGroups.length==0){

                this.store.isLoading = true;

            }

            else {

                this.store.isLoading = false;
                this.store.Groups = SearchedGroups;

            }


        }


    }

    _search(){


        console.log('搜索群')


        var key = this.refs._nav.state.value;


        if(key==undefined ||  key.length<=0){

            return;

        }

        else {

            this._searchGroup(key);
        }


    }


    _ToGroupDetail=(data)=>{

        this._CheckJumpToApplicationOrGroupDetail(data)

    }


    _CheckJumpToApplicationOrGroupDetail = (data)=>{

        //点击的话，是去到群详情。
        //分两种情况。
        // 1.如果是群成员的话，通过群号码去找对应的conversation。接着跳转到ChatDetail里面去
        //2.如果不是群成员的话，则跳转到群申请界面去

        //如果是群成员，不让其操作
        if(data.isMembersOfTheGroup == true){

            Chat.createConversation(this.props.navigator,data.IMNr,data.Name,'Group');

        }
        //在这里处理处理群的申请
        else {
            this.props.navigator.push({

                component:GroupApplication,
                passProps:{

                    GroupIMNr:data.IMNr

                },
            })
        }

    }


    _renderRow(data)
    {



        var margin=10;
        var iconW = 50;
        var iconH = iconW;

        var images = [require('../../image/gold.png'),
            require('../../image/iron.png'),
            require('../../image/cuprum.png'),];

        return(


            <TouchableOpacity onPress={()=>{

                this._ToGroupDetail(data);




            }}>


                <View style={{backgroundColor:Colors.colors.white}}>

                    <View style={[styles.row,{backgroundColor:'white'}]}>

                        {
                            data.level && data.level>=0 ?
                                <View style={[styles.center,{marginLeft:10}]}>
                                    {
                                        (data.level >= 1 && data.level <= 3) ?
                                            <Image
                                                style={{resizeMode:'cover',width:20,height:24,}}
                                                source={images[data.level-1]}>

                                            </Image> :


                                            <View style={[{borderColor:'rgb(204,204,204)',borderWidth:0.5,borderRadius:10,width:20,height:20,},styles.center]}>
                                                <Text style={{color:Colors.colors.Chat_Color153}}>{data.level}</Text>
                                            </View>


                                    }




                                </View>
                                :
                                null

                        }


                        {
                            data.isShowAvatar ?

                                <View style={{margin:10}}>
                                    <SessionAvatar faceUrlPathsArray={data.FaceUrlPaths}>

                                    </SessionAvatar>
                                </View>


                                :

                                <Image style={{margin:margin,resizeMode:'cover',width:iconW,height:iconH,borderRadius:iconW/2}}
                                       source={{uri:data.FaceUrlPath}}>

                                </Image>

                        }

                        <View style={[{margin:10,marginLeft:0,marginRight:0, backgroundColor:'white',flex:1,},styles.row]}>

                            <View style={{flex:6,backgroundColor:'white',justifyContent:'space-around'}}>



                                <Text numberOfLines={1}  style={{color:Colors.colors.Chat_Color51,fontSize:16,marginTop:0,}}>{data.Name}</Text>
                                <Text style={{color:Colors.colors.Chat_Color102,fontSize:14,marginTop:0}}>{data.Intro}</Text>


                            </View>


                            <View style={[{flex:1,backgroundColor:'white'},styles.center]}>



                                <View style={[styles.row,{},{margin:5}]}>



                                    <Text style={{fontSize:16,fontFamily:'iconfontim',color:Colors.colors.Chat_Color153,margin:2,marginRight:0,marginLeft:3}}>{String.fromCharCode('0xe177')}</Text>



                                </View>

                            </View>



                        </View>


                    </View>


                    <View style={{backgroundColor:Colors.colors.Chat_Color235,height:0.5}}></View>



                </View>



            </TouchableOpacity>


        );



    }

    render()
    {
        return(

            <View style={{backgroundColor:Colors.colors.Chat_BackgroundColor,flex:1}}>

                <NavBar ref="_nav"
                                  placeholder={'请输入群名称'}
                                  type={'search'}
                                  onpressLeft={()=>{this.props.navigator.pop()}}
                                  onpressRight={this._search.bind(this)}

                />



                {
                    this.store.isLoading == true ?

                        <EmptyView title={'搜索不到对应的群，请修改搜索关键词'} icon={'0xe15c'}/>

                        :

                        <ListView style={{flex:1}}
                                  dataSource={this.store.getDataSource}
                                  renderRow={this._renderRow.bind(this)}

                        >
                        </ListView>

                }
            </View>
        );
    }

}



const styles = StyleSheet.create(
    {


        flex:{
            flex:1,
        },

        row:{

            flexDirection:'row',
        },

        center: {

            justifyContent: 'center',
            alignItems: 'center',

        },

    });
