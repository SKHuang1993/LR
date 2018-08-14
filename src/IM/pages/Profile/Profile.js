/**
 * Created by yqf on 2017/11/11.
 */



 

import { observer } from 'mobx-react/native';

import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import DeviceInfo from 'react-native-device-info';
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
    BackHandler,
} from  'react-native';

import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import profile from '../../stores/Profile/Profile';

import Icon from '../../components/icon';
import Colors from '../../Themes/Colors';

import {FLEXBOX} from '../../styles/commonStyle';

import YQFNavBar from '../../components/yqfNavBar';

import {IM} from '../../utils/data-access/im';
import {Chat} from '../../utils/chat';
import Login from '../../../Login';

import MyOrder from '../../../pages/account/myOrder';

import MyWebView from '../../../IM/components/webview1';

import {RestAPI} from '../../utils/yqfws'

import CustomerReview from './CustomerReview';
import MyCustomer from './MyCustomer';
import VideoList from '../Professional/VideoList';
// import VideoPicture from './VideoPicture';


@observer


export default class Profile extends React.Component{
    // 构造
    constructor(props) {
        super(props);

        this.store = new profile();

        // 初始状态
        this.state = {

            dataSource:new ListView.DataSource({
                rowHasChanged:(r1,r2) => r1!==r2,
                sectionHeaderHasChanged:(s1,s2) => s1!==s2
            }),
            datas:[
                {title:'我的客户',url:'http://mlr.yiqifei.com/Customer',icon:'0xe17b'},
                {title:'我的上级下线',url:'http://mlr.yiqifei.com/EmployIntention',icon:'0xe6c1'},
                {title:'客户对我的评价',url:'http://mlr.yiqifei.com/Member/CustomerAssess',icon:'0xe6dd'},
                {title:'我的视频收藏',url:'https://abs.yiqifei.com/Profile/VideoCollect/MCollection',icon:'0xe752'},
                {title:'目的地',url:'http://mddtest.yiqifei.com:88/index/home',icon:'0xe752'},

            ],
            isOpen:Chat.obj.isReceiveOrder,
        };
    }


    fetchData = async() =>{


        this.store.loginUserResult = Chat.loginUserResult;


    }

    _handleAndroidBack = ()=>{
        let _this = this;

        BackHandler.addEventListener('hardwareBackPress', function () {

            if (_this.props.navigator && _this.props.navigator.getCurrentRoutes().length > 1) {

                _this.props.navigator.pop();

                return true;
            } else {

                BackHandler.exitApp();
                return false;
            }
        });
    }

    componentDidMount() {


        // if(Chat.isAndroid()){
        //     this._handleAndroidBack();

        // }


        this.fetchData();

        // this.testReceiveOrder();


    }

    componentWillUnmount() {

    }


    ToWebView=()=>{

        this.props.navigator.push({
            name:'MyWebView',
            component:MyWebView,
            passProps:{
                webUrl:'http://3g.yiqifei.com/i/'+this.store.loginUserResult.AccountNo,
                fromType:'my'

            },

        })

    }

    renderListView =()=>{
        return(
            <ListView initialListSize={12}
                      renderHeader={this.renderHead.bind(this)}
                      dataSource={this.state.dataSource.cloneWithRows(this.state.datas)}
                      renderRow={this.renderItem.bind(this)}
                      renderFooter={this.renderFoot}
            >
            </ListView>
        )

    }


    renderNav = ()=>{

        return(
            <YQFNavBar
                title={'个人中心'}
            />
        )

    }

    render = ()=>{

        return(
            <View style={{flex:1,backgroundColor:Colors.colors.Chat_Color230}}>

                {this.renderNav()}
                {this.renderListView()}
            </View>
        )

    }


    testReceiveOrder = () =>{

        setInterval(()=>{

            //判断有没有成员登陆

            if(this.store.loginUserResult)
            {
                var orderReceivingStatus=this.state.isOpen ? 1:0;
                var method='Messaging.SendOrderReceivingStatus';
                var paramter={
                    UserCode:this.store.loginUserResult.AccountNo,
                    OrderReceivingStatus:orderReceivingStatus,
                    ClientType:1,
                };

                RestAPI.invoke(method,paramter,(success)=>{


                })

            }


        },15000)

    }


    renderOrderTalking = () =>{

        return(

            <View style={{   padding:15, height:50,backgroundColor:'#fff',justifyContent:'space-between',flexDirection:'row',alignItems:'center'}}>
                <Text style={{ fontSize:18,marginLeft:5,}}>接单</Text>


                <Switch
                        onValueChange={(isOpen)=>{

                            this.setState({
                                isOpen : isOpen
                            });

                            Chat.obj.isReceiveOrder = isOpen

                            Chat.getMsgCount();

                            //调用接单的方法
                        //    this.testReceiveOrder();


                        }}

                        value={this.state.isOpen}


                >
                </Switch>







            </View>
        )


    }

    renderTitle = ()=>{


        return null;


    }


    renderText = (text)=>{

        return(

            <Text style={{margin:2,color:'rgb(255,255,255)',fontSize:14}}>{text}</Text>
        )

    }


    renderHead()
    {

        if(this.store.loginUserResult){

            var DetailInfo = this.store.loginUserResult.DetailInfo;

            var FaceUrlPath ='http://m.yiqifei.com/userimg/'+ DetailInfo.AccountNo+'/2';
            var LoginName = DetailInfo.LoginName;//HS010135
            var AccountNo = DetailInfo.AccountNo;//"VBL00T54"
            var Names = DetailInfo.Names;//"黄松凯"
            var DepartmentName = DetailInfo.DepartmentName;//"网络中心"
            var Department = DetailInfo.Department;//"3007F0N"
            var CompanyName = DetailInfo.CompanyName;//""广州市中航服商务管理有限公司""
            var CompanyCode = DetailInfo.CompanyCode;//"""3007F"""

            return(

                <View style={{backgroundColor:Colors.colors.LR_Color,marginBottom:10}}>
                <TouchableOpacity onPress={()=>{this.ToWebView()}}>


                        {this.renderTitle()}

                        <View style={{flexDirection:'row',marginBottom:20}}>

                            <Image style={styles.headImg}
                                   source={{uri:FaceUrlPath}}
                            >

                            </Image>

                            <View>

                                {this.renderText(Names)}
                                {this.renderText(LoginName)}
                                {this.renderText(AccountNo)}
                                {this.renderText(DepartmentName+'('+Department+')')}
                                {this.renderText(CompanyName+'('+CompanyCode+')')}
                            </View>

                        </View>



                </TouchableOpacity>

                    {this.renderOrderTalking()}

                </View>


            )



        }

        return null





    }




   static exitLogin = (props,store) =>{


       //1.清除用户userAgent
       if(Platform.OS =='ios'){

           Chat.setUserAgent('',(success)=>{

           },(fauilure)=>{

           })

       } else {
           console.log('需要处理安卓的清掉userAgent方法');
       }


        //当点击了退出登陆，这时候需要将登陆用户的Account消息清

       if(store) {

           let m_MyInfo = {

               UserName: store.loginUserResult.UserName,
               isCheck: store.loginUserResult.isCheck,
               password: store.loginUserResult.password,
           }
           // console.log('m_MyInfo -m_MyInfo')
           // console.dir(m_MyInfo);


           //存新数据。仅仅将数据存进来
           Chat.storage.save({
               key: 'ACCOUNTNO',
               rawData: m_MyInfo
           })
       }


       //调用IM,.connction。stop
        Chat.logout();

        const {navigator} = props;

        if(navigator) {
            navigator.resetTo({
                name: 'Login',
                component: Login,
            })
        }
    }

    ToUrl = (data)=>{
        if(data.title =='图片与视频合并'){
            // this.props.navigator.push({
            //     name: 'VideoPicture',
            //     component: VideoPicture,
            //     // passProps:{
            //     //     ActiveKeyNum:1,
            //     //     AccountNo: this.store.loginUserResult.AccountNo
            //     // }
            // });
        }else if(data.title =='我的视频收藏'){
            this.props.navigator.push({
                name:'VideoList',
                component:VideoList,
                passProps:{
                    type:'VideoCollection',
                },
            })
        }
        else {
            this.props.navigator.push({
                name:'MyWebView',
                component:MyWebView,
                passProps:{
                    webUrl:data.url,
                    fromType:'my'
                },
            })
        }





        /*
        //客户对我的评价，原生
        if(data.title=='客户对我的评价'){

            this.props.navigator.push({
                component:CustomerReview,
                passProps:{
                    Account:this.store.loginUserResult.AccountNo
                },

            })

        }
      else  if(data.title=='我的客户'){

            this.props.navigator.push({
                component:MyCustomer,
                passProps:{
                    Account:this.store.loginUserResult.AccountNo
                },

            })

        }

        else {

            this.props.navigator.push({
                name:'MyWebView',
                component:MyWebView,
                passProps:{
                    webUrl:data.url,
                    fromType:'my'
                },

            })
        }

*/


    }



    renderFoot=()=> {
        return(

            <TouchableOpacity onPress={()=>{Profile.exitLogin(this.props,this.store)}} >

            <View style={{backgroundColor:Colors.colors.Chat_Color230,marginTop:20}}>

                <View style={[styles.item]}>

                    <Text style={[styles.itemLeft]}>{String.fromCharCode('0xe750')}</Text>
                    <Text style={[styles.itemInfo]}>{'退出登录'}</Text>

                </View>

                <View style={styles.foot}>
                    <Text style={styles.footInfo}>问题反馈QQ群:325394148</Text>
                    <Text style={styles.footInfo}>{'当前版本'+DeviceInfo.getVersion()}</Text>
                </View>



            </View>
            </TouchableOpacity>

        )



    }

    renderItem(data)
    {
        return <TouchableOpacity style={styles.item}
                                 onPress={()=>{

                                       this.ToUrl(data);

                                 }}
        >
            <Text style={styles.itemLeft}>{String.fromCharCode(data.icon)}</Text>
            <Text style={styles.itemInfo}>{data.title}</Text>
            <Text style={styles.itemRight}>{String.fromCharCode('0xe177')}</Text>
        </TouchableOpacity>
    }

}

var styles = StyleSheet.create({

    page:{
        backgroundColor:'rgb(245,245,245)',
        height:window.height,


    },




    navigatorBar:{
        position:'absolute',
        top:0,
        left:0,
        right:0,
        height:64,

        backgroundColor:Colors.colors.LR_Color,
        paddingLeft:66,
    },
    navigatorBack:{
        position:'absolute',
        top:10,
        left:0,
        paddingTop:12,
        paddingLeft:10,
        width:66,
        height:66,
        backgroundColor:'rgba(0,0,0,0)',


    },
    navigatorTitle:{
        top:22,
        height:40,
        fontSize:16,
        textAlign:'center',
        paddingTop:12,
        width:window.width-66-44,
        color:'white',
    },
    navigatorBackItem:{
        paddingTop:13,
        fontSize:18,
        color:'white',
        fontFamily:'iconfont',
    },

    navigatorRight:{

        position:'absolute',
        top:22,
        right:0,
        width:50,
        height:44,
        backgroundColor:'rgba(0,0,0,0)',
        justifyContent:'center',
    },


    navigatorRightItem:{
        fontSize:18,
        color:'white',
        paddingRight:10,
        fontFamily:'iconfont',
        textAlign:'right',

    },


    main:{
        top:64,
        left:0,
        right:0,

    },
    item:{

        flexDirection:'row',
        backgroundColor:'white',
        borderWidth:1/FLEXBOX.pixel,
        borderColor: '#dededf',
        padding:15,
        alignItems:'center',
        //justifyContent:'flex-start',

    },
    itemLeft:{

        fontFamily:'iconfontim',
        fontSize:18,
        marginLeft:5,

    },
    itemInfo:{
        fontSize:16,
        marginLeft:15,
    },


    itemRight:{

        fontFamily:'iconfontim',
        position:'absolute',
        right:10,
        top:10,
        fontSize:20,
        color:'#ccc',
    },
    foot:{
        backgroundColor:"#ebebeb",
        padding:10,


    },
    footInfo:{
        color:'#999',
        textAlign:'center',
        fontSize:14,
    },
    head:{
        flexDirection:'row',
        // justifyContent:'center',
        alignItems:'center',
        backgroundColor:Colors.colors.LR_Color,


    },
    headImg:{
        width:80,
        height:80,
        borderRadius:40,
        margin:10,
    },
    headCenter:{

    },
    headCenterInfo:{
        color:'white',
    },
    headRight:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgb(245,178,54)',
        borderRadius:10,
        right:75,
        padding:2,
    },
    headRightInfo:{
        color:'white'
    },
    headRightIcon:{
        color:'white',
        fontSize:20,
        fontFamily:'iconfont',
    }



})















