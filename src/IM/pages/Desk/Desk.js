/**
 * Created by yqf on 2017/11/11.
 */





import { observer } from 'mobx-react/native';
import { observable, autorun, computed, action } from 'mobx'
import { Component } from 'react';
import React, { PropTypes } from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import { COLORS, FLEXBOX } from '../../styles/commonStyle';
import { Chat } from '../../utils/chat';
import CodePush from "react-native-code-push";
import WebView from '../../components/webview1';

import moment from 'moment';
import { RestAPI } from '../../utils/yqfws';
import PictureTemplate from '../Poster/PictureTemplate';
import Simplewebview from '../Desk/Simplewebview';
import TPList from '../TravelPlan/TPList';
import TodayOrder from './TodayOrder'
import TravelCommentList from '../TravelPlan/TravelComent/travelCommentList';

import  GroupDiscover from '../Group/GroupDiscover'

import {

    StyleSheet,
    View,
    Image,
    Text,
    ListView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Dimensions,
    BackHandler
} from 'react-native';


import YQFNavBar from '../../components/yqfNavBar';

import Icon from '../../components/icon';
import Colors from '../../Themes/Colors';
import desk from '../../stores/Desk/Desk'

import Login from '../../../Login';
import DeviceInfo from 'react-native-device-info';
import TestWebView from './testwebview'
import PosterList from '../../pages/Poster/PosterList'

import PosterEntrance from '../../pages/Poster/PosterEntrance'
import VideoList from '../../pages/Professional/VideoList'
import Flight from '../../../pages/flight/'
import Hotels from '../../../pages/hotels'
import Trains from '../../../pages/trains'


const window = {

    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,

}

@observer


export default class Desk extends Component {

    constructor() {
        super();

        this.store = new desk();

        this.state = {

        }

        this.store.ScheduledEntrances =

            [
                { title: '机票', icon: '0xe67c', color: '#FD5451', number: 0, uri: 'Flight', action: () => { } },
            { title: '全球酒店', icon: '0xe695', color: '#1CC55E', number: 0, uri: 'Hotels', action: () => { } },
                { title: '火车票', icon: '0xe662', color: '#FBA222', number: 0, uri: 'Trains', action: () => { } },
            { title: '目的地产品', icon: '0xe694', color: '#FBA222', number: 0, uri: 'TravelProduct', action: () => { } },
            ];

        this.store.CommonApplications =

            [
                { title: '旅行方案', icon: '0xe668', color: '#5EE2BA', number: 0, uri: 'trip' },
                { title: '业务报表', icon: '0xe6d8', color: '#ABE24D', number: 0, uri: 'Order/CurrentDay' },
                { title: '分享行程单', icon: '0xe6da', color: '#F9C954', number: 0, uri: 'Trips/SearchTrips' },

                { title: '视频', icon: '0xe6dc', color: '#8CBEFE', number: 0, uri: 'https://abs.yiqifei.com/Profile/VideoCollect/MCollection' },
                { title: '支付中心', icon: '0xe6db', color: '#F68D85', number: 0, uri: 'PayCenter' },
                { title: '海报', icon: '0xe6d9', color: '#FC9EFD', number: 0, uri: 'Poster' },

                { title: '培训学院', icon: '0xe6de', color: '#fdab90', number: 0, uri: 'https://abs.yiqifei.com/Profile/Video/MIndex' },


            ];

        this.store.Tasks = [
            {
                color: 'rgb(90, 87, 186)',
                icon: '0xe6f4',
                title: '待付款订单',
                uri: 'Order/WaitPay',
                count: 0
            },
            {
                color: 'rgb(87, 178, 153)',
                icon: '0xe704',
                title: '未出票订单',
                uri: 'Order/NoTicket',
                count: 0
            },
            {
                color: 'rgb(252, 137, 44)',
                icon: '0xe6ff',
                title: '客户行程',
                uri: 'Trips',
                count: 0
            },
            {
                color: 'rgb(253, 179, 43)',
                icon: '0xe705',
                title: '待做',
                uri: 'Todo',
                count: 0

            },
        ];


    }


    /** -----------------------LifeStyle-------------------------------------------------**/

    //跳转页面
    ToProduct = (data) => {




        if (data.title == '发现群') {

            this.props.navigator.push({
                name: 'GroupDiscover',
                component: GroupDiscover,
                passProps: {
                },
            })
        }
       else if (data.title == '培训学院') {

            this.props.navigator.push({
                name: 'VideoList',
                component: VideoList,
                passProps: {
                },
            })
        } else if (data.title == '视频') {

            this.props.navigator.push({
                name: 'VideoList',
                component: VideoList,
                passProps: {
                    type: 'VideoCollection'
                },
            })
        }


        else if (data.title == '机票') {

            this.props.navigator.push({
                name: 'Flight',
                component: Flight,
                passProps: {

                },
            })
        }

        else if (data.title == '全球酒店') {

            this.props.navigator.push({
                name: 'Hotels',
                component: Hotels,
                passProps: {

                },
            })
        }

        else if (data.title == '火车票') {

            this.props.navigator.push({
                name: 'Trains',
                component: Trains,
                passProps: {

                },
            })
        }

        //   //随时要注释
          else if(data.title == '海报'){

              this.props.navigator.push({
                  name: 'PosterEntrance',
                  component:PosterEntrance,
                  passProps: {

                  },
              })
        }else if (data.title =='方案'){
            this.props.navigator.push({
                name: 'AddTravelComment',
                component:AddTravelComment,
                passProps: {

                },
            })

        }


        // else if(data.title == '旅行方案'){
        //
        //     this.props.navigator.push({
        //         name: 'TPList',
        //         component:TPList,
        //         passProps: {
        //
        //         },
        //     })
        // }



        else {



            var uri = 'http://mlr.yiqifei.com/' + data.uri;

            if (data.uri == 'TravelProduct') {
                uri = 'http://3g.yiqifei.com/TravelProduct';
                // uri = 'http://3gtest.yiqifei.com/TravelProduct';
            }
            else if (data.uri == 'trip') {
                uri = 'http://trip.yiqifei.com/'
            }
            //酒店
            else if (data.uri == 'http://3g.yiqifei.com/Hotel') {
                uri = 'http://3g.yiqifei.com/Hotel'
            }
            else if (data.uri == 'https://abs.yiqifei.com/Profile/VideoCollect/MCollection') {
                uri = 'https://abs.yiqifei.com/Profile/VideoCollect/MCollection'
            }
            else if (data.uri == 'https://abs.yiqifei.com/Profile/Video/MIndex') {
                uri = 'https://abs.yiqifei.com/Profile/Video/MIndex'
            }else if(data.uri=="http://mddtest.yiqifei.com:88/index/home"){
                uri = 'http://mddtest.yiqifei.com:88/index/home'

            }


            this.props.navigator.push({
                name: 'WebView',
                component: WebView,
                passProps: {
                    webUrl: uri,

                },

            })

        }



    }

    _handleAndroidBack = () => {
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

    componentDidMount() {


        if (Chat.isAndroid()) {
            this._handleAndroidBack();

        }







        //回去
            var ret = Chat.loginUserResult;

            var names = ret.DetailInfo.Names;
            var time = Chat.getTimeHello();

            this.store.title = time + names;

            this.store.UserResult = ret;







            this._getIndexData();

            this.sync();




        //开启心跳包，时时刻刻发通知给
        this.testReceiveOrder();


    }


    componentWillUnmount = () => {

        // if(Chat.isAndroid()) {
        //     BackHandler.removeEventListener('hardwareBackPress', ()=>{});
        // }


    }

    testReceiveOrder = () => {

        setInterval(() => {

            // console.log('testReceiveOrder');

            //判断有没有成员登陆
            if (this.store.UserResult) {


                var orderReceivingStatus = Chat.obj.isReceiveOrder == true ? 1 : 0;//0为不接单，1为接单
                var method = 'Messaging.SendOrderReceivingStatus';
                var paramter = {
                    UserCode: this.store.UserResult.AccountNo,
                    OrderReceivingStatus: orderReceivingStatus,
                    ClientType: 1,//0为pc，1为移动
                };

                // console.log('告诉服务器是否接单');
                // console.dir(paramter);


                RestAPI.invoke(method, paramter, (success) => {

                    // console.log('发送了当前的接单状态---success，去后台查看')
                    // console.dir(success);
                })

            }

        }, 20000)

    }

    showReceiveOrder() {

        Alert.alert(
            '接单提醒',
            '是否接单',
            [

                {
                    text: '否', onPress: () => {

                        Chat.obj.isReceiveOrder = false;
                    }, style: 'destructive'
                },
                {
                    text: '是', onPress: () => {
                        Chat.obj.isReceiveOrder = true;
                    }, style: 'destructive'
                },
            ]
        );
    }



    codePushStatusDidChange(syncStatus) {



        switch (syncStatus) {
            case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                this.setState({ syncMessage: "Checking for update." });
                break;
            case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                this.setState({ syncMessage: "Downloading package." });
                break;
            case CodePush.SyncStatus.AWAITING_USER_ACTION:
                this.setState({ syncMessage: "Awaiting user action." });
                break;
            case CodePush.SyncStatus.INSTALLING_UPDATE:
                this.setState({ syncMessage: "Installing update." });
                break;
            case CodePush.SyncStatus.UP_TO_DATE:
                this.setState({ syncMessage: "App up to date.", progress: false });
                break;
            case CodePush.SyncStatus.UPDATE_IGNORED:
                this.setState({ syncMessage: "Update cancelled by user.", progress: false });
                break;
            case CodePush.SyncStatus.UPDATE_INSTALLED:
                this.setState({ syncMessage: "Update installed.", progress: false });
                break;
            case CodePush.SyncStatus.UNKNOWN_ERROR:
                this.setState({ syncMessage: "An unknown error occurred.", progress: false });
                break;
        }
    }

    codePushDownloadDidProgress(progress) {


        this.setState({ progress });
    }


    toggleAllowRestart() {
        this.state.restartAllowed
            ? CodePush.disallowRestart()
            : CodePush.allowRestart();

        this.setState({ restartAllowed: !this.state.restartAllowed });
    }




    sync() {


        CodePush.sync(
            {
                installMode: CodePush.InstallMode.IMMEDIATE,
                updateDialog: {
                    optionalIgnoreButtonLabel: '稍后更新',
                    optionalInstallButtonLabel: '立即更新',
                    optionalUpdateMessage: '修复部分bug',
                    title: '新版本提示',
                }
            },
            this.codePushStatusDidChange.bind(this),
            this.codePushDownloadDidProgress.bind(this)
        );
    }

    //获取网络请求
    _getIndexData = async () => {

        let endDateString = moment().format("YYYY-MM-DDTHH:mm:ss");
        var dd = new Date();
        dd.setDate(dd.getDate() - 7);//获取AddDayCount天后的日期
        let startDateString = moment(dd).format("YYYY-MM-DDTHH:mm:ss");

        var method = 'ABIS.PSOJourneyByConditionServiceGet';
        var UserCode = this.store.UserResult.AccountNo;




        var journeyParamter1 = {
            UserCode: UserCode,
            StartDate: startDateString,
            PageSize: 1,
            PageCount: 20,
            IsPNR: true,
            IsOutTicket: false,
            IsProxyNote: false,
            EndDate: endDateString
        };


        var journeyParamter2 = {
            UserCode: UserCode,
            StartDate: startDateString,
            PageSize: 1,
            PageCount: 20,
            CustomerPaymentStatusID: 33,
            EndDate: endDateString
        };

        var journeyParamter3 = {
            UserCode: UserCode,
            StartDate: startDateString,
            PageSize: 1,
            PageCount: 20,
            IsIntraday: true,
            EndDate: endDateString
        };

        RestAPI.invoke(method, journeyParamter1, (response) => {

            // console.log('请求1的结果')
            // console.dir(response);

            if (response.Result.Code == 0) {
                this.store.Tasks[0].count = response.Result.RowCount;

            }
        });


        RestAPI.invoke(method, journeyParamter2, (response) => {

            // console.log('请求2的结果')
            // console.dir(response);

            if (response.Result.Code == 0) {
                this.store.Tasks[1].count = response.Result.RowCount;
            }


        });

        RestAPI.invoke(method, journeyParamter3, (response) => {

            // console.log('请求3的结果')
            // console.dir(response);

            if (response.Result.Code == 0) {
                this.store.Tasks[2].count = response.Result.RowCount;
            }

        });

    }


    //搜索客户订单
    toSearch(searchString) {

        console.log('这个方法待处理...toSearch....最好在原生中处理searchString');

        //  var url='http://mlr.yiqifei.com/Customer?key='+searchString;
        var url = 'http://mlr.yiqifei.com/Customer';

        // if(searchString.length==6)
        // {
        //     url='http://mlr.yiqifei.com/Order/SODetail?nr='+ searchString;
        // }
        this.props.navigator.push({
            name: 'WebView',
            component: WebView,
            passProps: {
                webUrl: url,

            },

        })


    }



    /** -----------------------renderView-------------------------------------------------**/

    _renderNavBar() {


        var title=this.store.title;


        return (
            <YQFNavBar title={title}


            />
        )



        // return(
        //     <YQFNavBar  title={this.store.title}
        //                 rightText={'今日接单'}
        //                 onRightClick={()=>{
        //                     this.props.navigator.push({
        //                         component:TodayOrder
        //                     })
        //                 }}
        //     />
        // )
    }

    renderTop = () => {

        return (


            <View style={{ backgroundColor: 'rgb(255,255,255)', marginTop: 10 }}>


                <View style={[styles.searchExtra]}>
                    {this.store.Tasks.map((v, i) => {
                        return <TouchableOpacity activeOpacity={.7} key={i} onPress={() => this.ToProduct(v)} style={styles.tipActionItem}>


                            <Text style={styles.topActionCount}>{v.count}</Text>

                            <Text style={styles.topActionTitle}>{v.title}</Text>


                        </TouchableOpacity>

                    })}
                </View>
            </View>



        )



    }

    renderScheduledEntrance = () => {

        return (

            <View style={{ backgroundColor: 'rgb(255,255,255)', marginTop: 10 }}>

                <Text style={{ margin: 10, color: Colors.colors.Chat_Color153, fontSize: 16 }}>{'预定入口'}</Text>
                <View style={[styles.searchExtra]}>
                    {this.store.ScheduledEntrances.map((v, i) => {
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

    renderSearchBar = () => {
        return (

            <TouchableOpacity onPress={() => {

                this.toSearch('');

            }}


                style={{ backgroundColor: Colors.colors.Chat_Color230, height: 45 }}>


                <View style={{ flex: 1, margin: 8, borderRadius: 3, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>

                    <Icon size={13} color={Colors.colors.Chat_Color153} icon={0xe171} style={{ marginRight: 3 }} />

                    <Text style={[{ fontSize: 13, marginLeft: 3, color: Colors.colors.Chat_Color153 }]}>
                        {'搜索客户名称/手机号/订单号'}
                    </Text>


                </View>


            </TouchableOpacity>
        )
    };

    renderApplication = () => {

        return (

            <View style={{ backgroundColor: 'rgb(255,255,255)', marginTop: 10 }}>

                <Text style={{ margin: 10, color: Colors.colors.Chat_Color153, fontSize: 16 }}>{'常用应用'}</Text>
                <View style={[styles.searchExtra]}>
                    {this.store.CommonApplications.map((v, i) => {
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

    _renderContent() {


        return (


            <ScrollView>

                {this.renderSearchBar()}
                {this.renderTop()}
                {this.renderScheduledEntrance()}
                {this.renderApplication()}
            </ScrollView>

        )

    }

    render() {
        return (

            <View style={{ flex: 1, backgroundColor: 'rgb(235,235,235)' }}>

                {this._renderNavBar()}
                {this._renderContent()}
                {this.renderProgreessView()}

            </View>
        )
    }


    renderProgreessView = () => {

        if (this.state.progress) {

            return (

                <View style={styles.downLoadBG}>
                    <View style={styles.downloadMain}>
                        <Text style={styles.downloadTitle}>正在更新</Text>
                        <View style={styles.downloadInfo}>
                            <View style={[styles.downloadLeft, { width: (this.state.progress.receivedBytes / this.state.progress.totalBytes) * (window.width - 2 * (50 + 10) - 45) }]}></View>
                            <Text style={styles.downloadRight}>
                                {(parseInt(100 * this.state.progress.receivedBytes / this.state.progress.totalBytes)) > 0 ? (parseInt(100 * this.state.progress.receivedBytes / this.state.progress.totalBytes)).toString() + '%' : '1%'}
                            </Text>
                        </View>
                    </View>
                </View>

            )
        }
        return null

    }

}


var styles = StyleSheet.create({



    downLoadBG: {
        // flexDirection:'column',
        backgroundColor: 'rgba(0,0,0,0.3)',
        position: 'absolute',
        top: 0,
        left: 0,
        width: window.width,
        height: window.height,
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadMain: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        position: 'absolute',
        top: window.height * 0.35,
        width: window.width - 2 * 50,
        marginLeft: 50,
        marginRight: 50,
        borderRadius: 5,

    },
    downloadTitle: {
        fontSize: 15,
        padding: 15,
    },
    downloadInfo: {

        flexDirection: 'row',
        //alignItems:'center',
        justifyContent: 'center',
        // backgroundColor:'yellow',
        width: window.width - 2 * 50,
        height: 40,
        padding: 5,
    },
    downloadLeft: {
        left: 15,
        position: 'absolute',
        top: 15,
        width: 150,
        height: 5,
        backgroundColor: '#f44848',

    },
    downloadRight: {
        fontSize: 16,
        position: 'absolute',
        top: 10,
        right: 15,

    },





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

    topActionTitle: {

        fontSize: 15,
        color: 'rgb(102,102,102)',
        marginTop: 5

    },
    topActionCount: {

        fontSize: 20,
        color: '#000003'

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

    iconBox: {
        borderRadius: 10,
        borderColor: '#dededf',
        borderWidth: 1 / FLEXBOX.pixel,
        backgroundColor: '#fbfbfc',
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: 'center',
        marginBottom: 5,

    },

    tipActionItem: {

        alignItems: 'center',
        justifyContent: "center",
        width: window.width / 4,
        marginBottom: 0,

    },





    page: {
        flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center',

    },
    indexList: {
        height: window.height - 200,
    },

    login: {

    },
    loginBG: {
        width: window.width,
        height: window.height,

        flexDirection: 'column',
        // justifyContent:'center',
        alignItems: 'center',
    },
    logo: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        // position:'absolute',
        top: 40,
        left: 0,
        right: 0,
        marginBottom: 40,
    },
    logoImg: {
        width: 60,
        height: 60,
    },
    logoName: {
        padding: 10,
        color: 'white',
        fontSize: 15,
        textAlign: 'center',
    },


    loginMain: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor:'red',
    },


    loginItem: {
        // marginLeft:50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        padding: 10,
        // flex:1,
        // borderWidth:1,
        // borderColor:'yellow',

    },
    loginItemLeft: {

        fontFamily: 'iconfont',
        fontSize: 20,
        paddingRight: 20,
        color: 'white',
        // flex:1,
        //height:30,
    },
    loginItemRight: {
        width: window.width - 40 * 3,
        height: 30,
        color: 'white',
    },


    remember: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 8,
        paddingRight: 0,
        paddingLeft: 230,
    },
    remberIcon: {
        fontFamily: 'iconfont',
        fontSize: 15,
        // color:'white',
        backgroundColor: 'white',
        width: 20,
        height: 20,
        textAlign: 'center',
        //padding:1,
    },
    remmeberInfo: {
        color: 'white',
        padding: 5,
    },
    loginButton: {
        backgroundColor: 'rgb(21,158,125)',
        color: 'white',
        padding: 12,
        width: window.width - 20 * 2,
        textAlign: 'center',
        fontSize: 18,
        margin: 10,
    },


    index: {
        //flex:1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indexTop: {

        width: window.width,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgb(21,158,125)',
        paddingTop: 20,
    },

    indexTopImg: {
        width: 30,
        height: 30,
        borderRadius: 15,
        overflow: 'hidden',
        margin: 5,

    },
    indexTopName: {
        color: 'white',
        paddingLeft: 10,
        padding: 5,
        fontSize: 15,
    },
    indexTopAccount: {
        color: 'white',
        fontSize: 10,
    },
    indexTopMessage: {
        fontFamily: 'iconfont',
        color: 'white',
        fontSize: 24,
        paddingLeft: 10,
        // position:'absolute',
        // right:20,
        // top:25,

    },


    messageNumber: {
        backgroundColor: 'red',
        color: 'white',
        overflow: 'hidden',
        width: 18,
        height: 18,
        fontSize: 13,
        borderRadius: 9,
        // position:'absolute',
        // right:10,
        top: -8,
        right: 5,
        textAlign: 'center',
    },

    indexTopSwitch: {
        fontFamily: 'iconfont',
    },


    indexMainListStyle: {
        //height:Common.window.height-64-65,
    },

    indexMainList: {

        justifyContent: 'space-around',
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',

    },
    indexMainItem: {
        // backgroundColor:'red',
        paddingTop: 20,
        //justifyContent:'center',//垂直
        alignItems: 'center',
        borderWidth: 1,
        //borderRadius:5,
        borderColor: '#FAFAFA',
        width: window.width / 3,
        // marginBottom:10,
        //marginTop:10,
        height: window.width / 3,


    },

    indexMainItemIcon: {
        fontFamily: 'iconfont',
        fontSize: 32,
    },
    indexMainItemNumber: {

        padding: 2,

    },
    indexMainItemTitle: {
        fontSize: 12,
        padding: 10,
        paddingTop: 0,
    },




    searchBarBG: {

        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eee',
        padding: 10,
        //backgroundColor:'red',
        //borderRadius:20,
        //overflow:'hidden',


    },
    searchBarLeft: {
        flex: 1,
        height: 32,
        paddingTop: 9,
        fontFamily: 'iconfont',
        fontSize: 12,
        backgroundColor: 'white',
        textAlign: 'center',
        overflow: 'hidden',
        color: '#ccc',
        //borderRadius:5,
    },
    searchBarInput: {
        flex: 15,
        backgroundColor: 'white',
        height: 32,
        marginRight: 10,
        fontSize: 15,
        //borderRadius:5,
        // width:100,
    },
    searchBarCancel: {
        flex: 1,
        // color:'#f44848',
        color: 'white',
        marginLeft: 10,
        fontSize: 15,
    },


    historyListStyle: {
        backgroundColor: 'white',
        position: 'absolute',
        top: 110,
        left: 0,
        right: 0,
    },


    historyCellItem: {

        justifyContent: 'center',//垂直
        //alignItems:'center',
        width: window.width,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        //backgroundColor:'blue',




    },

    historyCellInfo: {
        backgroundColor: 'blue',
        color: '#333',
        textAlign: 'center',
        padding: 8,
        paddingLeft: 18,
        paddingRight: 18,
        margin: 5,
        //borderRadius:5,
        fontSize: 14,
        overflow: 'hidden',
        //flex:1,
        textAlign: 'left'



    },

    loadingMore: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        width: 140,
        marginTop: window.height / 2 - 60,
        height: 120,


        marginLeft: (window.width - 140) / 2,
        marginRight: (window.width - 140) / 2,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,

    },
    loading: {
        margin: 20,

    },
    loadingMoreTitle: {

        marginLeft: 10,
        fontSize: 18,
        color: 'white',
    },

    bottom: {
        backgroundColor: 'white',
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: window.width,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    bottomItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',




    },
    bottomItemIcon: {
        fontFamily: 'iconfont',
        // fontSize:55,
        fontSize: 28,
        color: '#555',
    },
    bottomItemInfo: {
        fontSize: 11,
        color: '#666',

    },
    bottomItemCenter: {
        marginLeft: 1,
        fontFamily: 'iconfont',
        fontSize: 24,
        color: 'white',
        borderRadius: 24,
        overflow: 'hidden',
        textAlign: 'center',
        backgroundColor: 'transparent',
        width: 48,
        height: 48,
        lineHeight: 48,
    },
    CameraBG: {
        width: 50,
        height: 50,
    },

    quotePricesCell: {
        width: window.width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 5,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    quotePricesCellLeft: {
        //flex:1,
        fontFamily: 'iconfont',
        fontSize: 20,
        padding: 5,
        marginLeft: 10,

        //backgroundColor:'orange',
        borderRadius: 15,
        width: 30,
        height: 30,
        overflow: 'hidden',
        textAlign: 'center',
        color: 'white',
    },


    quotePricesCellLeftImg: {
        width: 40,
        height: 40,
    },


    quotePricesCellCenter: {
        flex: 8,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 5,
        paddingLeft: 4,

    },
    quotePricesCellCenterInfo: {

        textAlign: 'left',
        // backgroundColor:'red',
    },
    quotePricesCellCenterDetail: {

        textAlign: 'left',
        padding: 5,
        paddingLeft: 0,
    },
    quotePricesCellRight: {
        flex: 2,
        textAlign: 'right',
        //margin:1
        right: 10,

    },

    switch: {
        position: 'absolute',
        right: 5,
        bottom: 5,
        // width:50,
        // height:30,
    },



    receiveInfo: {
        fontSize: 15,
        position: 'absolute',
        right: 60,
        color: 'white',
        // top:10,
        textAlign: 'center',
        bottom: 12,

    }




})



