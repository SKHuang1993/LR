/**
 * Created by yqf on 2017/10/31.
 */

//聊天详情View

//这个页面用于聊天详情／聊天信息/群消息

//conversation ->
//通过传入ChatMessageType来判断。'C2C'＝单聊。'Group'=群聊。    'GroupInfo'=群消息(暂不考虑)

//都可以置顶聊天，消息免打扰，聊天文件，清空聊天记录，
//'C2C'，可以在成员列表那里加入邀请其他人创建群聊，但是会建立一个新的组
//'Group',可以编辑群聊名称，群介绍，如果是管理员的话，则可以增加成员，删除成员。尾部都有'删除并退出'功能。如果是管理员则解散该群，如果是群成员，则移初该群
//管理员有增加成员，删除成员的功能
//'GroupInfo'仅显示群成员列表，群名字，群介绍。以及当前登录用户在与这个群的状态（退出群，申请中，加入群...）



import { observer } from 'mobx-react/native';
import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';

import {
    TouchableOpacity,
    StyleSheet,
    Image,
    ListView,
    Text,
    View,
    RefreshControl,
    Dimensions,
    ScrollView,
    Alert,

} from 'react-native';


import Colors from '../../Themes/Colors';

import chatDetail  from '../../stores/Chat/ChatDetail';
import ChatFile from './ChatFile';
import YQFLeftTitleRightTextArrow from '../../components/YQFLeftTitleRightTextArrow';
import YQFProgressHUD from '../../components/YQFProgressHUD';
import YQFAlertMessage from '../../components/YQFAlertMessage';


import YQFNavBar from '../../components/yqfNavBar';

import {IM} from '../../utils/data-access/im';
import {Chat} from '../../utils/chat';
import Button from '../../components/Button'
import EditData from '../../components/editData'
import Enumerable from 'linq';
import ContactSelect  from '../Contact/ContactSelect'
import ChatUserInfo  from './ChatUserInfo'


let window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}

let margin = 10;

@observer

export default class ChatDetail extends Component{

    constructor(props){

        super(props);

        this.store = new chatDetail();


        // console.log("这是传递过来的conversation")
        // console.dir(props.conversation)

        this.store.conversation = props.conversation;

        this.store.Peer = this.store.conversation.IMNr;

        this.store.ConversationType =this.store.conversation.ConversationType;

        if(this.store.conversation.Stick){
            this.store.isSticky = true;
        }

        if(this.store.conversation.Disturb){
            this.store.isDisturb = true;
        }



    }



    componentDidMount() {


        this._fetchData();
    }


   async _fetchData(){


        var loginResult =  Chat.userInfo;
        this.store.LoginIMNr =loginResult.User.IMNr;//如果用户点太快，有可能拿不到用户资料而crash

       var userNrs = [this.store.conversation.IMNr];

       if(this.store.ConversationType == 'C2C'){

           let usersInfo = await IM.getUserOrGroups({
               "UserNrs": userNrs
           });

           var User = usersInfo.Users[0];


           this.store.User = User;
       }


       else {

           let usersInfo = await IM.GetGroupDetails({
               "IMNr": this.store.conversation.IMNr
           });

           //var Group = usersInfo.Groups[0];
           var Group = usersInfo.Group

           // console.log('ChatDetail---群详情');
           // console.dir(usersInfo);

           this.store.Group = Group;

           this.store.conversation.Name = Group.Name ?  Group.Name :Chat._IMGetGroupName(Group);
           this.store.conversation.Intro = Group.Intro ?  Group.Intro : "没有介绍";

       }

        //每次进来都去获取最新的。从房间号进入会话页面仅传一个房间好Peer足够

       var LoginIMNr = this.store.LoginIMNr;

       var Peer = this.store.Peer;

       var ConversationType = this.store.ConversationType;


       //如果是群主的话，则有增加，删除群成员的权限
       //如果是单聊的话，则只有加人的功能
       var types=[];
       var Members=[];

       if(ConversationType == 'C2C'){
           types.push({type: 'add'});

           var User = this.store.User;
           Members = [User];
           this.store.Members=Members.concat(types);

       }
       else if(ConversationType == 'Group'){

           types.push({type: 'add'});
           types.push({type: 'delete'});

           //群主-》具备+ - 功能
           if(LoginIMNr == this.store.Group.Owner){

               this.store.Members = this.store.Group.Members.concat(types);

               this.store.isOwner = true;


           }
           else {
               this.store.Members = this.store.Group.Members;
               this.store.isOwner = false;
           }

           // console.log('现在的群详情');
           // console.dir(this.store.Members);
       }else {
           types=[];
       }


    }








    //聊天文件
    async  _JumpToChatFile()
    {

        let Files = Enumerable.from(this.store.conversation.Messages).where(o=>o.ChatMessage && o.ChatMessage.MessageType=="Image").toArray();

        // console.log('当前的Files')
        // console.dir(Files);

        this.props.navigator.push({

            component:ChatFile,
            passProps:{
                Files:Files,
            }

        })

    };

   //清空聊天记录
    _clearChatLog(){

        var currentError={
            isHidden:false,
            title:'确定要清空聊天记录吗？',
            content:'',
        };


      //  this.MyAlert.showError(currentError);

        this.store.isShowChatAlert = true;
        this.store.isShowGroupAlert = false;

    }


    _AlertConfirm(){

        //清除聊天记录
        if(this.store.isShowChatAlert){

            this._TestClearChats();

            //弹出提示框，显示聊天记录已经清空
            console.warn('弹出提示框，显示聊天记录已经清空');

            var Param={
                isHidden:false,
                title:'聊天记录已清空'
            }
            this.YQFProgressHUD.showHUD(Param);

        }

        //退出群聊
        if(this.store.isShowGroupAlert){

            var message={
                GroupIMNr:this.store.conversation.IMNr,
            };

            //群主，解散群
            if(this.store.isOwner)
            {

                Chat.DismissGroup(message,(success)=>{

                    this.props.navigator.pop();
                },(error)=>{


                    alert('解散群失败，请稍后重试');

                })


            }


            //群成员，退群
            else
            {

                Chat.ExitGroup(message,(success)=>{



                    this.props.navigator.pop();
                },(error)=>{


                    alert('退出群失败，请稍后重试');

                })





            }

        }




    }

    _SimpleClearChat(){

        var conversations = Chat.obj.conversations.slice();

        let index = conversations.findIndex(o => o.IMNr == this.store.conversation.IMNr);

        //找不到对应的窗口，需要自己制造
        if(index == -1){

        }
        else {

            var conversation = conversations[index];
            conversation.Messages=[];
            conversation._Messages=[];
            conversation.LatestMessage='';

            conversations[index] = conversation;
            Chat.obj.conversations = conversations.slice();
            Chat.saveConversationList(Chat.obj.conversations);
            //如果是清空聊天记录的话。这时候应该是自动返回到上一级把

            this.props.navigator.pop()


        }



    }


    _TestClearChats(){

        this.store.conversation.Messages = [];
        this.store.conversation.LatestMessage = '';

    }

    //修改群名字
    _UpdateGroupName(){



        if(this.store.isOwner)
        {

            this.props.navigator.push({
                component:EditData,
                passProps:{

                    defaultValue:this.store.conversation.Name,
                    placeholder:'请输入群名称',
                    title:'编辑群名称',

                    getDetail:(Name)=>{

                        var message={

                            GroupIMNr:this.store.conversation.IMNr,
                            Name:Name,
                            Intro:this.store.conversation.Intro,
                        };


                        Chat.ModifyGroupInfo(message,(response)=>{

                            console.log("来到这里说明群名称已经修改了",Name)

                         // this.store.conversation.Name = Name;


                        },(failure)=>{


                        });

                    }

                }
            })

        }

    }

    _UpdateGroupIntro(){


        if(this.store.isOwner)
        {

            this.props.navigator.push({
                component:EditData,
                passProps:{

                    defaultValue:this.store.conversation.Intro,
                    placeholder:'请输入群介绍',
                    title:'编辑群介绍',

                    getDetail:(detail)=>{

                        var message={

                            GroupIMNr:this.store.conversation.IMNr,
                            Intro:detail,
                            Name:this.store.conversation.Name

                        };

                        //在这里发送请求给服务器，修改群资料。//修改后要更新本地数据库的资料
                        Chat.ModifyGroupInfo(message,(response)=>{

                       //  this.store.conversation.Intro = detail;

                            // this.store.conversation.Intro = detail;

                        },(failure)=>{

                        });





                    }

                }
            })

        }


    }

    _renderNav(){

        return(
            <YQFNavBar title={'聊天详情'}  leftIcon={'0xe183'} onLeftClick={()=>{this.props.navigator.pop()}}/>
        )

    }


    _renderMembers(){

        return(
            <ListView
                initialListSize={100}
                contentContainerStyle={styles.list}
                      showsVerticalScrollIndicator={false}
                      dataSource={this.store.getDataSource}
                      renderRow={this._renderRow.bind(this)}
                removeClippedSubviews={false}>

            </ListView>
        )
    }

    _renderGroupName(){

        if(this.store.ConversationType == 'Group'){


            return(

                <YQFLeftTitleRightTextArrow style={{marginTop:10}}
                                            leftTitle={'群名称'}
                                            isShowArrow={this.store.isOwner}
                                            rightTitle={this.store.conversation.Name}
                                            onPress={()=>{this._UpdateGroupName();
                    }}/>
            )
        }

        return null

    }


    _renderGroupInfo(){

        if(this.store.ConversationType == 'Group'){

            var  Intro = this.store.conversation.Intro? this.store.conversation.Intro : '没有介绍';


            return(

                <YQFLeftTitleRightTextArrow style={{marginTop:10}}
                                            leftTitle={'群介绍'}
                                            isShowArrow={this.store.isOwner}
                                            rightTitle={this.store.conversation.Intro}
                                            onPress={()=>{this._UpdateGroupIntro();
                                            }}/>
            )


            /*
            return(

                <YQFTopTitleBottomText  topTitle={'群介绍'} bottomTitle={Intro} onPress={()=>{

                    this._UpdateGroupIntro();

                            }}/>

            )
            */
        }

        return null

    }

    _renderSticky(){

        return(
            <YQFLeftTitleRightTextArrow style={{marginTop:margin}}
                                        leftTitle={'置顶聊天'}
                                        type={'switch'}
                                        value={this.store.isSticky}
                                        myOnValueChange={(newValue)=>{



                                           this.store.isSticky = newValue;
                                           Chat.toggleStick111(this.store.conversation,newValue);


                    }}/>
        )
    }

    _renderMessageFree(){

        return(
            <YQFLeftTitleRightTextArrow style={{}}
                                        leftTitle={'消息免打扰'}
                                        type={'switch'}
                                        value={this.store.isDisturb}
                                        myOnValueChange={(newValue)=>{

                                       this.store.isDisturb = newValue;
                                      // this.store.conversation.Disturb = newValue;
                                       Chat.toggleDisturb111(this.store.conversation,newValue);

                    }}/>
        )
    }

    _renderChatFile(){

        return(
            <YQFLeftTitleRightTextArrow style={{marginTop:margin}}
                                        leftTitle={'聊天文件'}
                                        onPress={this._JumpToChatFile.bind(this)}/>
        )

    }

    _renderClearChat(){

        return(
            <YQFLeftTitleRightTextArrow isShowArrow={false} leftTitle={'清空聊天记录'}
                                        onPress={()=>{

                                           // this._SimpleClearChat();

                                            this.store.isShowClearChat=true;


                                        }}/>
        )
    }

    _renderButton(){

        if(this.store.ConversationType =='Group'){

            return(

                <View style={{margin:20}}>
                <Button onPress={()=>{

                    this.store.isShowDeleteAndExitGroup=true;



                        }} borderRadius={5} backgroundColor={Colors.colors.Chat_ThemeColor} height={45}
                                 title={'删除并退出'} titleColor={'white'}></Button>
                </View>
                )


        }

        return null;


    }


    //退出群聊
    _GroupDismissOrExit = ()=>{

        //退出群聊

            var message={
                GroupIMNr:this.store.conversation.IMNr,
            };

            //群主，解散群
            if(this.store.isOwner)
            {

                Chat.DismissGroup(message,(success)=>{

                    console.log('解散群成功，返回到首页');
                    Alert.alert('你已经解散群')
                    this.props.navigator.popToTop();

                    //这里解散了群。

                },(error)=>{

                    Alert.alert('解散群失败，请稍后重试')
                    console.log('解散群失败，请稍后重试。');


                 //   alert('解散群失败，请稍后重试');
                })
            }

            //群成员，退群
            else
            {

                Chat.ExitGroup(message,(success)=>{
                    console.log('退出群成功，返回到首页')
                    Alert.alert('你已退出该群')

                    this.props.navigator.popToTop();
                },(error)=>{

                    Alert.alert('退出群失败，请稍后重试')
                    console.log('退出群失败，请稍后重试');
                    this.props.navigator.popToTop();


                })





            }



    }


    _renderProgressHUD(){

        return(

            <YQFProgressHUD type={'Success'} ref={(YQFProgressHUD)=>{this.YQFProgressHUD=YQFProgressHUD}}/>
        )


    }



    _renderDeleteAndExitGroup = ()=>{

        if(this.store.isShowDeleteAndExitGroup){

            return(

                <View style={{position:'absolute',top:0,bottom:0,left:0,right:0,
                    backgroundColor:'rgba(0,0,0,0)'}}>


                    <TouchableOpacity style={{position:'absolute',top:0,bottom:0,left:0,right:0,
                        backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>{

                        this.store.isShowDeleteAndExitGroup=false;
                    }
                    }>

                    </TouchableOpacity>



                    <View  style={{justifyContent:'center',position:'absolute',left:0,right:0,bottom:0,height:135,backgroundColor:'rgba(255,255,255,0.7)'}}>


                        <View style={{height:45,alignItems:'center',justifyContent:'center',backgroundColor:'#fff'}}>
                            <Text style={{padding:10,color:'rgb(153,153,153)',fontSize:12}}>{'退出后不会通知群聊中其他成员,且不会再接收此群聊消息'}</Text>
                        </View>


                        <View style={{height:0.5,backgroundColor:'rgb(240,240,240)'}}></View>

                        <TouchableOpacity style={{height:45,alignItems:'center',justifyContent:'center',backgroundColor:'#fff'}} onPress={()=>{
                            this.store.isShowDeleteAndExitGroup=false;

                            //alert('执行群解散或者退群的操作')

                           this._GroupDismissOrExit();


                        }}>
                            <Text style={{padding:10,color:'rgb(244,72,72)',fontSize:18}}>{'确定'}</Text>
                        </TouchableOpacity>


                        <TouchableOpacity style={{marginTop:10, height:45,alignItems:'center',justifyContent:'center',backgroundColor:'#fff'}}  onPress={()=>{
                            this.store.isShowDeleteAndExitGroup=false;
                        }}>
                            <Text style={{padding:10,color:'rgb(51,51,51)',fontSize:18}}>{'取消'}</Text>
                        </TouchableOpacity>


                    </View>

                </View>

            )
        }

        return null

    }


    //弹出清空聊天记录的窗口
    _renderAlert = ()=>{

        if(this.store.isShowClearChat){

            return(

                <View style={{position:'absolute',top:0,bottom:0,left:0,right:0,
                    backgroundColor:'rgba(0,0,0,0)'}}>


                    <TouchableOpacity style={{position:'absolute',top:0,bottom:0,left:0,right:0,
                        backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>{

                            this.store.isShowClearChat=false;
                    }
                    }>

                    </TouchableOpacity>



                <View  style={{justifyContent:'center',position:'absolute',left:0,right:0,bottom:0,height:100,backgroundColor:'rgba(255,255,255,0.7)'}}>

                    <TouchableOpacity style={{height:45,alignItems:'center',justifyContent:'center',backgroundColor:'#fff'}} onPress={()=>{
                        this.store.isShowClearChat=false;

                        this._SimpleClearChat()
                    }}>
                        <Text style={{padding:10,color:'rgb(244,72,72)',fontSize:18}}>{'清空聊天记录'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{marginTop:10, height:45,alignItems:'center',justifyContent:'center',backgroundColor:'#fff'}}  onPress={()=>{                            this.store.isShowClearChat=false;
                    }}>
                        <Text style={{padding:10,color:'rgb(51,51,51)',fontSize:18}}>{'取消'}</Text>
                    </TouchableOpacity>


                </View>

                </View>

            )
        }

        return null



    }


    _renderAlert111(){







        return(

      <YQFAlertMessage ref={(MyAlert)=>{this.MyAlert=MyAlert}} confirm={()=>{

          console.log('999');

          alert('清空聊天记录，---或者退出群聊-----');

this._AlertConfirm();

      }} cancel={()=>{

                            }}


                            />
        )
  }






    _renderRow(data,sectionId,rowId)
    {


        return(

            <MemberItem {...this.props}  ConversationType={this.store.ConversationType} index={rowId} data = {data}   onPress={()=>{


                //添加群成员
    if(data.type =='add')
        {
            //这是创建新的群聊，将当前两个用户加进去
            if(this.store.ConversationType == 'C2C')
                {


          var Members = [

              {IMNr:this.store.conversation.IMNr},
              {IMNr:Chat.userInfo.User.IMNr}


          ];



    this.props.navigator.push({

                component:ContactSelect,

                passProps:{
                    type:'CreateNewGroup',//创建新的群聊
                    Members:Members,//将这个页面的两个人一起传过去。
                    },
            })


                }
                //这是添加其他成员进来
                else
                    {

           this.props.navigator.push({

                component:ContactSelect,
                passProps:{

                    type:'AddGroupMember',

                    Members:this.store.Group.Members,
                    GroupIMNr:this.store.Peer,

  callback:(aa)=>{

                        this.props.navigator.pop();

                   },
                }

            })
}
        }

        //移除群成员
        else if(data.type =='delete')
        {
            this.props.navigator.push({

                component:ContactSelect,

                passProps:{

                    type:'RemoveGroupMember',
                    Members:this.store.Group.Members,
                    GroupIMNr:this.store.Peer,

                   callback:(aa)=>{
                        this.props.navigator.pop();

                   },

                }

            })



        }

        //跳到群成员资料页面
        else
           {

if(this.store.ConversationType){

      this.props.navigator.push({

                   component:ChatUserInfo,
                   passProps:{


                       Peer:data.IMNr,


                   }
               })
}



          }




}}/>

        )

    }


    render(){

        return(

            <View style={{flex:1,backgroundColor:'rgb(240,240,240)'}}>
                {this._renderNav()}
                <ScrollView>

                    {this._renderMembers()}
                    {this._renderGroupName()}
                    {this._renderGroupInfo()}
                    {this._renderSticky()}
                    {this._renderMessageFree()}
                    {this._renderChatFile()}
                    {this._renderClearChat()}
                    {this._renderButton()}
                </ScrollView>

                {this._renderProgressHUD()}
                {this._renderAlert()}
                {this._renderDeleteAndExitGroup()}




            </View>


        );
    }


}


@observer

class MemberItem extends  Component
{



    render()
    {

        var margin=10;
        var number = 6;

        var iconW = (window.width - margin *number*2)/number;

        var editIconW = iconW+5;

        if(this.props.data.type == 'add' || this.props.data.type == 'delete' )
        {

            return(

                <TouchableOpacity onPress={this.props.onPress}>

                    <View style={{alignItems:'center',margin:margin,marginBottom:15, borderWidth:1,borderColor:'white'}}>


                        {
                            this.props.data.type == 'add' ?
                                <Text style={{color:'rgb(220,220,220)',fontSize:editIconW, fontFamily:'iconfontim'}} >{String.fromCharCode('0xe119')}</Text>

                                :
                                <Text style={{color:'rgb(220,220,220)',fontSize:editIconW, fontFamily:'iconfontim'}} >{String.fromCharCode('0xe137')}</Text>

                        }

                    </View>
                </TouchableOpacity>


            )

        }


        var FaceUrlPath=Chat.getFaceUrlPath(this.props.data.FaceUrlPath);



        return(


            <TouchableOpacity onPress={this.props.onPress}>


                <View style={{alignItems:'center',margin:margin,backgroundColor:'white'}}>


                    <View style={{backgroundColor:'white',alignItems:'center'}}>



                        {
                            this.props.index == 0 && this.props.ConversationType != 'C2C'  ?

                                <Image style={{position:'absolute',top:-margin,right:-2,width:margin*2,height:margin*2}} source={require('../../image/aaa.png')}>

                                </Image>
                                :
                                null


                        }

                        <Image style={{width:iconW,height:iconW,resizeMode:'cover',borderRadius:iconW/2}} source={{uri:FaceUrlPath}}>


                        </Image>

                        <Text numberOfLines={1} style={{fontSize:10,color:Colors.colors.Chat_Color153,marginTop:5,maxWidth:iconW}}>{this.props.data.Name}</Text>


                    </View>


                </View>

            </TouchableOpacity>

        )



    }

}



@observer
class YQFTopTitleBottomText extends Component
{


    constructor(props)
    {

        super(props);

        // console.log("传递过来的群介绍")
        // console.dir(props.bottomTitle)


        this.state={


            isShowLine:this.props.isShowLine ? this.props.isShowLine : true,
            isShowArrow:this.props.isShowArrow ? this.props.isShowArrow : true,

            topTitleStyle: {


                color: this.props.topTitleColor ? this.props.topTitleColor :'rgb(51,51,51)' ,
                fontSize: this.props.topTitleFont ? this.props.topTitleFont:16,
                textAlign: 'left',
                margin: 10,

            },


            bottomTitleStyle:{


                color: this.props.bottomTitleColor ? this.props.bottomTitleColor :'rgb(102,102,102)' ,
                fontSize: this.props.bottomTitleFont? this.props.bottomTitleFont : 15,
                marginTop:0,

                marginLeft:10,
                marginBottom:10,
                marginRight:10,
                // backgroundColor:'yellow',


            },

            lineStyle:{

                height:0.5,
                backgroundColor:'rgb(235,235,235)',
                marginLeft:10,

            },
            containerStyle:{

                backgroundColor:'white'

            }


        }




    }

    render()
    {

        return(


            <View>


                <View style={[this.state.containerStyle]}>


                    <Text style={[this.state.topTitleStyle]}>{this.props.topTitle}</Text>


                    <TouchableOpacity onPress={this.props.onPress}>
                        <Text style={[this.state.bottomTitleStyle]}>{this.props.bottomTitle}</Text>
                    </TouchableOpacity>

                </View>



            </View>

        );

    }




}



const styles = StyleSheet.create({


    list: {

        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        backgroundColor:'white',
    },

    row: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        margin: 3,
    },
    image: {

        width: 60,
        height: 60,
        margin:10,
        resizeMode: 'cover',
        borderRadius:30,
        borderWidth:1,

    },

    text: {

        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        color: 'white',
        backgroundColor: 'rgba(255,255,255,0)'
    },

});