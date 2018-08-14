/**
 * Created by yqf on 2017/10/30.
 */


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


import {IM} from '../../utils/data-access/im';
import contactList from '../../stores/Contact/ContactList';
import Colors from '../../Themes/Colors';
import Avatar from '../../components/SessionAvatar';
import AvatarGroup from '../../components/AvatarGroup';
import Badge from '../../components/badge';
import YQFNavBar from '../../components/yqfNavBar';
import EmptyView from '../../components/EmptyView';
import ChatUserInfo from '../Chat/ChatUserInfo';
import {Chat} from '../../utils/chat';

let window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}


let ContactComponent={

    margin:10,
    iconW:44,
    fontSize:14,

};




@observer

export default class ContactList extends Component{

    constructor(props){
        super(props);

        this.store = new contactList();
        this.store.title = this.props.title ? this.props.title : '群组';
        this.store.type = this.props.type ? this.props.type : 'Group';
        this.store.ContactList = this.props.datas? this.props.datas : [];

    }

    componentDidMount(){

        this.listener = RCTDeviceEventEmitter.addListener('KickOff',()=>{

            this.props.navigator.popToTop();

        });

        this._fetchData();


    }

    componentWillUnmount(){

        this.listener && this.listener.remove();

    }

   async _fetchData(){

if(this.store.type == 'Group'){


    var temp = Chat.obj.Contacts.Groups.filter(this._FileterGroup);
    var Groups = temp.reverse();

    this.store.ContactList = Groups;

}

    }


    _ToChatUserInfo(item){


        var Peer;
        var User;
        var isContact=false;

        switch (this.store.type){

            case "Contact":

                Peer= item.User.IMNr;
                User = item.User;
                isContact = true;

                break;

            case "Advisor":

                Peer= item.User.IMNr;
                User = item.User;
                isContact = true;

                break;



            case "Custom":



                Peer= item.User.IMNr;
                User = item.User;
                isContact=item.IsContact;

                break;

            case "Colleague":

                Peer= item.IMNr;
                User=null;
                isContact = true;

                break;
            default:

                Peer= item.User.IMNr;
                User = item.User;
                isContact = true;

                break;

        }

        this.props.navigator.push({

            component:ChatUserInfo,
            passProps:{
                Peer:Peer,
                User:User,
                isContact:isContact
            }
        })

    }

    _FileterGroup(Group){

       return Group.Members.length>1;

    }

    //返回用户名
     _IMGetUserName(User){

        return  User && User.Name ? User.Name : User.IMNr;

    };

    //返回群名
     _IMGetGroupName(group){
        //有群名
        var Name;
        if(group && group.Name)
        {
            Name= group.Name;
        }

        //没有群名字
        else
        {
            var name='';

            for (var i = 0,len=group.Members.length; i < len; i++) {

                var Member = group.Members[i];

                var memberName = this._IMGetUserName(Member); //群成员的名字

                name = name+memberName+',';
            }

            Name=name;

        }

        return Name;

    }

//获取头像
     getFaceUrlPath = (url) => {
        if (!url)
            return "https://img2.yiqifei.com/face.png!80";
        else
            return "https://img2.yiqifei.com" + url + "!80";
    }



    _IMGetContactInfoByUser(data){


        var FaceUrlPath;
        var isShowAvatar;
        var FaceUrlPaths;


        if(data && data.FaceUrlPath){

            FaceUrlPath = this.getFaceUrlPath(data.FaceUrlPath);
            isShowAvatar = false;
            FaceUrlPaths = undefined;
        }
        else {

            var tempFaceUrlPaths=[];

            for (var i = 0; i < data.Members.length; i++) {

                var Member = data.Members[i];
                tempFaceUrlPaths.push(Member.FaceUrlPath);
            }

            isShowAvatar = true;
            FaceUrlPath=undefined;
            FaceUrlPaths = tempFaceUrlPaths;

        }

        //获取群名字
       var Name = this._IMGetGroupName(data);


        var result = {

            FaceUrlPath:FaceUrlPath,
            isShowAvatar:isShowAvatar,
            FaceUrlPaths:FaceUrlPaths,
            Name:Name,

        };


        return result;
    }


    _renderName(Name){
        return(
            <View style={[{marginRight:20,flex:1,justifyContent:'center',}]}>

                <Text numberOfLines={1}
                      style={{fontSize:15,color:'rgb(51,51,51)',marginRight:10}}>{Name}</Text>
            </View>

        )

    }

    _renderLine(){

        return(
            <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>
        )
    }

    _renderAvatar(dataInfo){




        if(dataInfo.isShowAvatar){

            return(


                <View style={{margin:10}}>

                <AvatarGroup faceUrlPathsArray={dataInfo.FaceUrlPaths}/>

                </View>


            )
        }
        return(


            <Image
                style={{margin:ContactComponent.margin,resizeMode:'cover',width:ContactComponent.iconW,height:ContactComponent.iconW,borderRadius:ContactComponent.iconW/2}}
                source={{uri:dataInfo.FaceUrlPath}}>

            </Image>
        )



    }



    _ToChatRoom(data,ConversationType){


        //名字可能为空，可能长度为0
        if(!data.Name || data.Name.length<=0){
            data.Name = this._IMGetGroupName(data)
        }

        // console.dir(data)

        Chat.createConversation(this.props.navigator,data.IMNr,data.Name,ConversationType);


    }

    renderRow(data){

        var iconW=50;
        var margin=10;
        var ContentW = Chat.window.width - iconW -margin-100;


        //群
        if(this.store.type =='Group'){

            var dataInfo = this._IMGetContactInfoByUser(data);
            return(

                <TouchableOpacity onPress={()=>{

                    this._ToChatRoom(data,'Group');


                }}>
                    <View style={{flexDirection:'row',backgroundColor:'rgb(255,255,255)',flex:1}}>

                        {this._renderAvatar(dataInfo)}
                        {this._renderName(dataInfo.Name)}
                    </View>

                    {this._renderLine()}
                </TouchableOpacity>
            )

        }

         var uri,name;

        if(this.store.type  == "Colleague"){
            uri=Chat.getFaceUrlPath(data.IconFile);
            name = data.AliasName;
        }else {
            uri = Chat.getFaceUrlPath(data.User.FaceUrlPath)
            name = data.User.Name;
        }

        //其他
        return(


            <TouchableOpacity onPress={()=>{


                    this._ToChatUserInfo(data);



                }}>
            <View style={{backgroundColor:'rgb(255,255,255)'}}>

                <View style={{flexDirection:'row',alignItems:'center'}}>

                    <Image
                        style={{margin:Chat.ContactComponent.margin,resizeMode:'cover',width:Chat.ContactComponent.iconW,height:Chat.ContactComponent.iconW,borderRadius:Chat.ContactComponent.iconW/2}}
                        source={{uri: uri}}>

                    </Image>



                    <View style={{backgroundColor:'white',width:ContentW,margin:10,marginLeft:0, justifyContent:'space-between'}}>


                        <Text numberOfLines={1}
                              style={{fontSize:15,color:Colors.colors.Chat_Color51,marginRight:10}}>{name}</Text>

                        {
                          this.store.type =="Colleague"?

                                <Text style={{color:Colors.colors.Chat_Color102,fontSize:16,marginTop:5}}>{data.DepartmentName+'>'+data.TeamName}</Text>
                                :
                                null


                        }

                    </View>
                </View>

                {this._renderLine()}
            </View>
            </TouchableOpacity>

        );

    }


    _getTitleAndIcon(type){

        var dict={};
        var title,icon;

        if(type == 'Group'){

            title = '您还没有群聊';
            icon = '0xe17b';
        }

        else  if(type == 'WorkMake'){

            title = '您还没有同事';
            icon = '0xe17a';
        }

        else  if(type == 'Customer'){

            title = '您还没有顾问';
            icon = '0xe10c';
        }
        else {

            title = 'Bug';
            icon = '0xe10c';
        }

        dict={
            title:title,
            icon:icon
        }

        return dict;

    }

    _renderNav(){

        return(
            <YQFNavBar  title={this.store.title} leftIcon={'0xe183'}

                               onLeftClick={()=>{
            this.props.navigator.pop();

                                  }}

            />
        )
    }


    _renderContent(){


        var icon;
        var title;

        if(this.store.type == 'Group'){

            title = '您还没有群聊';
            icon = '0xe17b';
        }

        else  if(this.store.type == 'WorkMake'){

            title = '您还没有同事';
            icon = '0xe17a';
        }

        else  if(this.store.type == 'Customer'){

            title = '您还没有顾问';
            icon = '0xe10c';
        }


        if(this.store.ContactList && this.store.ContactList.length>0){

            return(

                <ListView
                    dataSource={this.store.getDataSource}
                    enableEmptySections={true}
                    renderRow={this.renderRow.bind(this)}
                    removeClippedSubviews={false}

                ></ListView>
            )

        }

        return(

            <EmptyView icon={icon} title={title} />

        );


    }



    render(){

        const {type} = this.props;
        var EmptyDict = this._getTitleAndIcon(type);




            return(
                <View style={[styles.flex,{backgroundColor:'rgb(245,245,245)'}]}>

                    {this._renderNav()}
                    {this._renderContent()}


                </View>

            )

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

        badgeView: {
            minWidth: 18,
            paddingVertical: 2,
            paddingHorizontal: 5,
            top: -8, right: -8,
            overflow: 'hidden'
        },

    });


