/**
 * Created by yqf on 2017/10/31.
 */


//用户资料页面

/**
 * Peer -》账号(必填)
 * User->用户资料。如果有传，则直接用。没有的话，则需要去获取
 * isContact->是否为好友。最好是传过来。如果没有传，则需要去通讯录中判断
 *Wording ->有传则代表验证页面
 *
 *
 *
 * */



import { observer } from 'mobx-react/native';
import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';

import { extendObservable, toJS } from 'mobx';



import React, { PropTypes } from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import YQFNavBar from '../../components/yqfNavBar';
import Icon from '../../components/icon';

import Button from '../../components/Button';

import LoadingView from '../../components/LoadingView';
import LeftTitleCenterTitle from '../../components/LeftTitleCenterTitle';
import Colors from '../../Themes/Colors';

import {IM} from '../../utils/data-access/im';
import {Chat} from '../../utils/chat';

import chatUserInfo from '../../stores/Chat/ChatUserInfo';
import Enumerable from 'linq';

import FriendApplication from '../Contact/FriendApplication';
import {ServingClient,RestAPI} from '../../utils/yqfws';
import ChatRoom from '../../pages/Chat/ChatRoom';
import ServiceLog from './serviceLog';
import ChatTag from './ChatTag';

//xg
import MyWebView from '../../components/webview1';
import ImageViewer from 'react-native-image-zoom-viewer';


import Flight from '../../../pages/flight/'
import Hotels from '../../../pages/hotels'
import Trains from '../../../pages/trains'
import ActivityIndicator from '../../components/activity-indicator'



let window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}

let margin=10;
let imageW = 50;
let iconW = 70;



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
    InteractionManager,
    NativeModules,
    Platform,
    Modal,
    Alert


} from 'react-native';



class ChatUserInfoModel extends  Component{




    @observable isAdding = false;//是否正在添加好友

    @observable tag = '';//标签-》进入这页面之后需要调接口去获取

    @observable LoginIMNr=null;//当前登陆用户

    @observable title=null;//判断要显示为详细资料

    @observable Images=[];//我去过图片

    @observable Wording=null;//申请说明

    @observable isContact=null;//是否为好友


    @observable isLoading=true;//是否加载

    @observable User =null;//用户资料

    @observable Tag='Tag--后期需要修改成从通讯录中获取';//标签

}


@observer
export  default class ChatUserInfo extends Component{

    constructor(props){
        super(props);

        this.store = new ChatUserInfoModel();

        this.store.Peer = this.props.Peer;

        this.store.LoginIMNr = Chat.getLoginInfo().User.IMNr;

        console.log("chatuserinfo 这个页面的数据  props")
      //  console.dir(this.props)

        console.log("chatuserinfo 这个页面的数据  store")
      //  console.dir(this.store)

        //如果isContact 有传递过来。可能是true，也可能是false
        if(this.props.isContact !==null){
            this.store.isContact = this.props.isContact
        }
        //如果User有传递过来。则直接赋值
        if(this.props.User !==null){
            this.store.User = this.props.props
        }


        this.state={
            imageViewer: false,
        }


    }

    componentDidMount(){

        this.listener = RCTDeviceEventEmitter.addListener('KickOff',()=>{

            this.props.navigator.popToTop();

        });

        this._fetchData();
    }



    componentWillUnmount(){

        this.listener &&this.listener.remove();


    }

   async _fetchData(){


       var title;

        //如果没有传用户资料过来
        if(!this.store.User){

            var Param = {UserNrs: [this.store.Peer]};
            var result = await IM.getUserOrGroups(Param);
            if(result){
                this.store.User = result.Users[0];
                this.store.isLoading = false;

            }
        }



        //如果没有传是否为联系人，需要去获取。
       if(this.store.isContact == null){


            console.log("这是没有显示isContact的")


            var result = await IM.getContacts({Owner:Chat.getLoginInfo().User.IMNr});

                var index = result.Users.findIndex((object)=>{
                    return object.User.IMNr ==this.store.Peer;
                })

                if(index == -1){
                    this.store.isContact = false;
                }

                else {

                    this.store.isContact = true;
            }

       }



//图片地址（后期需要修改成调用老接口获取）
       var Param = {

           UserCode: this.store.User.UserCode,
           ArticleAccessAuthorityIDs: '1',
           PageCount:1,
           PageSize:4,
           ArticleCategoryID:['6'],
       };

       RestAPI.invoke('Knowledge.ArticleListGetForMobile',Param,(success)=>{

           var Images=[];

           for(var i=0;i<success.Result.ArticleList.length;i++){

               var article = success.Result.ArticleList[i];

               if(article.Images){

                   Images = Images.concat(article.Images);
               }

           }


           this.store.Images =Images;


       });






       var tempTags =[];
       //请求标签
       var resultTag =await IM.getIMSystemUserTagByIMNr({
           IMNr:Chat.userInfo.User.IMNr
       });

       if( resultTag.IMUserTags && resultTag.IMUserTags.length>0){


         var totalTags= resultTag.IMUserTags;


           // console.log('getIMSystemUserTagByIMNr');
           // console.dir(totalTags);

           var Peer = this.store.Peer;

           //在这里面去寻找对应的那人

           for(var i=0;i<totalTags.length;i++){

               var tag = totalTags[i];

               for(var j=0;j<tag.Members.length;j++){

                   var member = tag.Members[j];

                   if(member.IMNr == Peer){
                       tempTags.push(tag);
                       break;
                   }

               }

           }



           var str = this._getTagStr(tempTags);




       }




   }


   _getTagStr = (Tags)=>{

       var str='';
       Enumerable.from(Tags).where((o)=>{

           str+=o.Name+','
       })

       return str;

   }

    _ToChatRoom=()=>{


       var Name=this.store.User.Name;
       //这里需要严格判断这个名字。有可能这个名字为空
        if(this.store.User.Name==null){
            Name = this.store.User.IMNr;
        }

       Chat.createConversation(this.props.navigator,this.store.User.IMNr,Name,'C2C');



    }

    _ToCallPhone=(phone)=>{

       if(phone){

           NativeModules.MyNativeModule.callPhone(phone);
       }

    }

    _ToWoquguoHome = ()=>{


        // alert('_ToWoquguoHome，跳到我去过个人主页');

        if(this.store.User.RoleType == 'INCU')
        {

            var webUrl='http://3g.yiqifei.com/i/'+this.store.User.UserCode;
            InteractionManager.runAfterInteractions(() => {
                this.props.navigator.push({
                    name:'MyWebView',
                    component:MyWebView,
                    passProps:{
                        webUrl:webUrl,
                    },

                })
            })
        }

        else
        {

            InteractionManager.runAfterInteractions(() => {
                this.props.navigator.push({
                    name:'ArticleAuthor',
                    component:ArticleAuthor,
                    passProps:{
                        articleItem:this.props.articleItem,
                        loginUserCode:this.state.UserCode,
                        //fromType:this.state.isSelf ? 'selfAuthor':'otherArticle',
                        fromType:'selfAuthor',
                        isSelef:false,



                    }
                })
            })
        }




    }

    _ToServiceLog =()=>{


        this.props.navigator.push({

            component:ServiceLog,
            passProps:{

            }
        })


    }

    _ToFriendApplication = ()=>{

        this.store.isAdding = true

//添加好友前先发送这个消息，如果对方允许任何人添加，则直接添加好友成功；如果对方需要验证，则继续发送 AddFriend 消息进行下一步的好友验证；如果对方拒绝添加任何人，则添加还有失败。

        var message={
            FriendIMNr:this.store.User.IMNr,//好友id
        };

        console.log('message'+message);

        Chat.PreAddFriend(message,(response)=>{

            this.store.isAdding = false;
            var FriendAllowType = response.FriendAllowType;

            if(FriendAllowType == 'AllowAny'){

                //既然允许被任何人加好友
                this.store.isContact=true


                this._ToChatRoom();


            }else if(FriendAllowType=='DenyAny'){

                Alert.alert('该好友拒绝被其他人添加')


            }else if(FriendAllowType=='NeedConfirm'){

                //需要验证
                //跳到好友验证页面。回调回来的时候需要将状态处理回来
                this.props.navigator.push({

                    component:FriendApplication,
                    passProps:{
                        User:this.store.User,
                    }
                })

            }


        },(error)=>{

            console.log('FriendCommand error')
            // console.dir(error);
            Alert.alert('请求失败，请稍后重试');

        });














        /*
         //console.warn('点击跳到好友申请页面,传递ID过去');
         //跳到好友验证页面。回调回来的时候需要将状态处理回来
         this.props.navigator.push({

             component:FriendApplication,
             passProps:{
                 User:this.store.User
             }
         })
         */



    }



    _ToChatTag = ()=>{

        this.props.navigator.push({

            component:ChatTag,
            passProps:{

                tag:this.store.tag,
                getTag:((tagString)=>{

                    // console.log('设置标签后的回调');
                    // console.dir(tagString);
                    this.store.tag = tagString;

                })

            }

        })

    }


    toggle = () => {
        this.setState({
            imageViewer: !this.state.imageViewer
        })
    }


    //导航栏
    _renderNav(){

        return(
            <YQFNavBar title={'详细资料'} leftIcon={'0xe183'} onLeftClick={()=>{this.props.navigator.pop() }} />
        )
    }


    //头部
    _renderAvatar(){

//Todo
       // console.log('可以获取到Rank和性别，后期加上');
       var Gender = this.store.User.Gender == 'Female' ? '女' : '男';

        return(
            <View
                style={[{padding:margin,backgroundColor:'white',marginTop:margin},styles.row]}>


                <TouchableOpacity onPress={()=>{this.toggle()}}>

                <Image
                    style={{width:iconW,height:iconW,resizeMode:'cover',borderRadius:5}}
                    source={{uri:Chat.getFaceUrlPath(this.store.User.FaceUrlPath)}}>

                </Image>
                </TouchableOpacity>



                    <View style={{flexDirection:'row',justifyContent:'space-around'}}>

                        <View style={{marginLeft:margin,justifyContent:'space-around',}}>

                            <View style={{flexDirection:'row',alignItems:'center'}}>

                                <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:0}}>{'账号:' + this.store.User.IMNr}</Text>

                                <Icon style={{marginLeft:5}} size={14} color={Gender=='女' ?'red' : 'blue'} icon={'0xe15c'}/>

                            </View>


                        <Text
                            style={{color:Colors.colors.Chat_Color153,fontSize:13,}}>{'昵称:' + this.store.User.Name}</Text>

                            {
                                this.store.User.Rank ?

                                    <Text
                                        style={{color:Colors.colors.Chat_Color153,fontSize:13,}}>{'Rank:' + this.store.User.Rank}</Text>
                                    :
                                    null
                            }


                        </View>





                    </View>






            </View>
        )

    }

    //申请说明
    _renderWording(){

        // if(this.store.Wording && this.store.Wording.length>0){
        //
        //     return(
        //         <View style={{padding:20,backgroundColor:Colors.colors.Chat_Color240}}>
        //
        //             <Text style={{color:Colors.colors.Chat_Color102}}>{'申请说明:'+this.store.Wording}</Text>
        //
        //         </View>
        //     )
        // }

        return null;

    }

    //电话
    _renderPhone(){

        var phone=null;
        if(this.store.User && this.store.User.CustomerService && this.store.User.CustomerService.WorkPhone){
            phone = this.store.User.CustomerService.WorkPhone;
        }else if(this.store.User && this.store.User.Phone){
            phone = this.store.User.Phone;
        }else {
            phone = null;
        }

        return(
            <View>
                {phone ?
                    <LeftTitleCenterTitle style={{marginTop:margin}} leftTitle={'电话号码'}
                                          rightTitle={phone}
                                          rightTitleColor={Colors.colors.Chat_ThemeColor}
                                          isShowArrow={false}
                                          rightTitleStyle={{marginRight:20}}
                                          onPress={()=>{

                                              this._ToCallPhone(phone);
                                          }}/>
                    :
                    null
                }
            </View>


        )
    }

    //标签
    _renderTag(){


        //如果这个用户有标签，则直接拿出来，如果没有。则是空白，点击过去跳转

        return null;

/*
        return(

            <LeftTitleCenterTitle style={{marginTop:0}} leftTitle={'标签'}
                                     rightTitle={this.store.tag}
                                     isShowArrow={true}
                                     onPress={()=>{

                                        this._ToChatTag();
                    }}/>
            )
*/



    }

    //地区
    _renderAddress(){

        if(this.store.User && this.store.User.CustomerService && this.store.User.CustomerService.Address){

            return(
                <LeftTitleCenterTitle style={{marginTop:margin}} leftTitle={'地区'}
                                      rightTitle={this.store.User.CustomerService.Address}
                                      isShowArrow={false}
                                      onPress={()=>{

                    }}/>
                )

        }

        return null

    }

    //个性签名
    _renderIntro(){

        if(this.store.User && this.store.User.CustomerService && this.store.User.CustomerService.Intro){

            return(
                <LeftTitleCenterTitle style={{marginTop:0}} leftTitle={'个性签名'}
                                      rightTitle={this.store.User.CustomerService.Intro}
                                      isShowArrow={false}
                                      onPress={()=>{

                    }}/>

            )

        }

        return null


    }

    //个人相册
    _renderImage(){
        var Images = Enumerable.from(this.store.Images).takeFromLast(4).toArray();

if(Images && Images.length>0){

    return(

        <TouchableOpacity  onPress={()=>{


//员工账号(点击图片跳到对应的链接去)

                    this._ToWoquguoHome()


            }} style={{backgroundColor:'white',flexDirection:'row',alignItems:'center',marginTop:margin}}>


            <Text style={{color:'rgb(51,51,51)',fontSize:16,margin: 10,marginTop:35,marginLeft:20, marginBottom:35}}>{'个人相册'}</Text>

            <View style={{flexDirection:'row-reverse',alignItems:'center',}}>

                <View style={{flexDirection:'row',margin:15,backgroundColor:'white'}}>

                    {

                        Images.map((value,i)=>{

                            var path = 'http://img8.yiqifei.com'+value.Path;

                            return(

                                <Image style={{width:imageW,height:imageW,marginRight:10}}
                                       source={{uri:path}}>
                                </Image>


                            );

                        })





                    }






                </View>



            </View>

        </TouchableOpacity>


    );

}
return null;






    }


    //显示添加到通讯录按钮(只要双方不是好友关系，则显示)
    _renderAddToContactButton = ()=>{

        if(this.store.isContact==false){
            return(

                <View style={{margin:5}}>
                    <Button onPress={()=>{this._ToFriendApplication()}}
                            borderRadius={5}
                            backgroundColor={Colors.colors.Chat_ThemeColor}
                            height={47}
                            titleFont={20}
                            title={"添加到通讯录"}
                            titleColor={'white'}></Button>
                </View>
            )
        }
        return null


    }

    //"发消息"按钮
    _renderSendMessageButton = () =>{



        //如果是营业员的话，不管其他人是谁，都可以显示电话
        if(Chat.loginUserResult.DetailInfo.OrganizaType=="INCU"){

            return(
                <View style={{margin:5}}>
                    <Button onPress={()=>{this._ToChatRoom()}}
                            borderRadius={5}
                            backgroundColor={Colors.colors.Chat_ThemeColor}
                            height={47}
                            titleFont={20}
                            title={"发消息"}
                            titleColor={'white'}></Button>
                </View>
            )

        }else {

            //这里是其他账号登录了。如果这个人的资料角色是INCU的话，则可以显示发消息按钮
            if(this.store.User.RoleType == "INCU"){

                return(
                    <View style={{margin:5}}>
                        <Button onPress={()=>{this._ToChatRoom()}}
                                borderRadius={5}
                                backgroundColor={Colors.colors.Chat_ThemeColor}
                                height={47}
                                titleFont={20}
                                title={"发消息"}
                                titleColor={'white'}></Button>
                    </View>
                )
            }

            return null

        }



    }

    //打电话按钮
    _renderPhoneButton =()=>{


        var phone;
        if(this.store.User && this.store.User.CustomerService && this.store.User.CustomerService.WorkPhone){
            phone = this.store.User.CustomerService.WorkPhone;
        }else if(this.store.User && this.store.User.Phone){
            phone = this.store.User.Phone;
        }else {
            phone = null;
        }








       //这个人有电话了
      if (phone) {

          //只要两个人中有一个人为INCU就可以显示电话
          if (Chat.loginUserResult.DetailInfo.OrganizaType == "INCU" || this.store.User.RoleType == "INCU") {
              return(
                  <View style={{margin:5}}>
                      <Button onPress={()=>{this._ToCallPhone(phone)}}
                              borderRadius={5}
                              backgroundColor={Colors.colors.Chat_ThemeColor}
                              height={47}
                              titleFont={20}
                              title={"打电话"}
                              titleColor={'white'}></Button>
                  </View>
              )

          }
      }
      return null

    }

    _renderService(){


       // console.warn('_renderService部分需要将读取网络服务记录的接口，下周做')

        return null;

/*
        return(

            <TouchableOpacity  onPress={()=>{


this._ToServiceLog();

            }} style={{backgroundColor:'white',flexDirection:'row',alignItems:'center',marginTop:margin}}>


                <Text style={{color:'rgb(51,51,51)',fontSize:13,margin: 10,marginTop:35,marginBottom:35}}>{'服务记录'}</Text>


                <View style={{flexDirection:'row-reverse',alignItems:'center',}}>

                    <View style={{margin:15,backgroundColor:'white'}}>

                        {

                            ['1','2','3'].map((value,i)=>{

                                return(

                                    <Text numberOfLines={1} style={{margin:5,color:'rgb(102,102,102)'}}>
                                        {'服务记录（等黄璡接口）'}
                                    </Text>

                                );

                            })





                        }






                    </View>



                </View>

            </TouchableOpacity>

        )
        */

    }


    ToProduct =async(product)=>{


        var Param = {UserNrs: [this.store.Peer]};
        var result = await IM.getUserOrGroups(Param);


        if(result.Users){

            var userInfo = result.Users[0];

            if(product.title =='机票'){

                this.props.navigator.push({
                    component:Flight,
                    passProps:{
                        booker:userInfo
                    }
                })

            }else if(product.title =='全球酒店'){

                this.props.navigator.push({
                    component:Hotels,
                    passProps:{
                        booker:userInfo
                    }
                })



            }else if(product.title =='火车票'){

                this.props.navigator.push({
                    component:Trains,
                    passProps:{
                        booker:userInfo
                    }
                })
            }else  if(product.title =='目的地产品'){

            }else{

            }



        }






    }

    //为其预订
    _renderOrder =() =>{

        var array=  [
            { title: '机票', icon: '0xe67c', color: '#FD5451', number: 0, uri: 'Flight', action: () => { } },
            { title: '全球酒店', icon: '0xe695', color: '#1CC55E', number: 0, uri: 'Hotels', action: () => { } },
            { title: '火车票', icon: '0xe662', color: '#FBA222', number: 0, uri: 'Trains', action: () => { } },
            { title: '目的地产品', icon: '0xe694', color: '#FBA222', number: 0, uri: 'TravelProduct', action: () => { } },
        ];


        if(Chat.obj.Source == '抢单'){

            return(

                <View style={{ backgroundColor: 'rgb(255,255,255)', marginTop: 10 }}>

                    <Text style={{ margin: 10, color: Colors.colors.Chat_Color153, fontSize: 16 }}>{'为其预订'}</Text>
                    <View style={[styles.searchExtra]}>
                        {array.map((v, i) => {
                            return <TouchableOpacity activeOpacity={.7} key={i} onPress={() => this.ToProduct(v)} style={styles.actionItem}>

                                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: v.color, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={styles.actionIcon}>{String.fromCharCode(v.icon)}</Text>
                                </View>

                                <Text style={styles.actionText}>{v.title}</Text>

                            </TouchableOpacity>

                        })}
                    </View>
                </View>

            )

        }
        return null

    }


    _renderContent(){


        if(this.store.isLoading == true){

            return(

                <LoadingView backgroundColor={'rgb(230,230,230)'} title={'正在加载中...'}/>
            )

        }
        else {

            return(

                <ScrollView>

                    {this._renderAvatar()}
                    {this._renderWording()}
                    {this._renderPhone()}
                    {this._renderTag()}
                    {this._renderAddress()}
                    {this._renderIntro()}
                    {this._renderImage()}
                    {this._renderService()}


                    {this._renderAddToContactButton()}
                    {this._renderSendMessageButton()}
                    {this._renderPhoneButton()}

                    {this._renderOrder()}

                </ScrollView>

            )
        }

    }

    _renderIsAdding = ()=>{

        if(this.store.isAdding){
            return <ActivityIndicator toast text={'正在添加好友...'} animating={this.store.isAdding}/>
        }
        return null;
    }

    render(){

        return(

            <View style={{flex:1,backgroundColor:'rgb(240,240,240)'}}>

                {this._renderNav()}

                {this._renderContent()}

                {this._renderIsAdding()}


            </View>

            )


    }

}


const styles = StyleSheet.create({

    searchExtra: {

        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        backgroundColor: 'rgb(255,255,255)',
        paddingLeft: 0,
        paddingTop: 10,
        paddingBottom: 20,
        alignItems: 'center',
        //borderTopColor: '#ddd',
        // borderTopWidth: 1 / FLEXBOX.pixel,
        // height: 220,

    },
    actionItem: {

        alignItems: 'center',
        justifyContent: "center",
        width: window.width / 4,
        marginBottom: 10,
    },

    actionIcon: {

        fontFamily: 'iconfontim',
        fontSize: 20,
        color: '#fff'

    },
    actionText: {
        fontSize: 15,
        color: 'rgb(51,51,51)',
        marginTop: 10
    },



    row: {
      flexDirection:'row'
    },

});