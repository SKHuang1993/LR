import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    Platform,
    WebView,
    TouchableOpacity,
    StatusBar,
    BackAndroid,
} from 'react-native';
import {LanguageType} from '../../utils/languageType';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';
import {Toast } from 'antd-mobile';
import createInvoke from 'react-native-webview-invoke/native';
import home from '../home';
import moment from 'moment';

var {width,height} = Dimensions.get('window')
var lan = LanguageType.setType();
//http://biz.yiqifei.com/Passport/RNLogin?product=Hotel&userCode=TG000QA8
const bizUrl = "http://pay.yiqifei.com/GetPay.aspx?";

export default class PayWebview  extends Component {
    webview: WebView
    invoke = createInvoke(() => this.Webview)
    webWannaGet = () => 'Hi, Web!'
    webWannaSet = (data) => {
        alert(`[Receive From Web] '${data}'`)
    }
    constructor(props) {
        super(props);
        let txnTime = moment().format('YYYYMMDDHHmmss');
        this.state={
            url:bizUrl+
                "OrderId="+this.props.OrderID+"&"+
                "PayLoginAccount="+this.props.LoginAccount+"&"+
                "PayMoney="+this.props.PayMoney+"&"+
                "txnTime="+txnTime+"&"+
                "ClientID="+this.props.AccountNo+"&"+
                "PayRemark=test&"+
                "PayProvadeID=8&"+
                "PayType=0&"+
                "PayCurrency=CNY&"+
                "PayBankCode=&"+
                "PayReturnVersion=2&"+
                "IsChangePayInfo=false&"+//"CancelReturnUrl=&"+
                "PaySource=yiqifei",//+"&Returnurl=",
            toJump:false,
            _URL:'',
        };
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg,}}>
                <StatusBar
                        animated={true} 
                        hidden={false}
                        backgroundColor={'#000'}
                        translucent={true}
                        barStyle="light-content"
                        showHideTransition={'fade'}
                        />
               
                <WebView  style={{marginTop:Platform.OS=='ios' ? -1 : Platform.OS === 'android' && Platform.Version >= 21 ? 20 :0}}
                    ref={webview => this.webview = webview}
                    source={{uri:this.state.url}}
                    onNavigationStateChange={(value)=>{
                        console.log(value.url)
                        if(value.url == bizUrl+'Home'){
                            Toast.hide();
                            const {navigator} = this.props;
                            navigator.pop();
                        } else if(value.url == 'http://pay.yiqifei.com/MPay/default.aspx' || 
                                    value.url =='http://3g.yiqifei.com/Home/Index'){
                            Toast.hide();
                             let storage = global.storage;
                            storage.load({ key: 'BIZACCOUNTINFO' }).then(v => {
                                global.userInfo = JSON.parse(v);
                                this.props.navigator.replace({
                                    name: 'home',
                                    component: home,
                                    passProps: {
                                        IsLogin: false,
                                        My_Info: JSON.parse(v).MyInfo,
                                        Company_Name: JSON.parse(v).MyInfo.Result.Company.CompanyName,
                                        Company_Code: JSON.parse(v).MyInfo.Result.Company.CompanyCode,
                                        UserAccount: JSON.parse(v).MyInfo.Result.Account.UserName,
                                        Permission: JSON.parse(v).Permission
                                    }
                                })
                            }).catch(err => {
                                const {navigator} = this.props;
                                navigator.pop();
                            });
                        }
                        {/* this.state._URL = value.url; */}
                    }}
                    onLoadStart={(value)=>{
                        Toast.loading("加载中...", 60, () => {
                            Toast.info('加载失败', 3, null, false);
                        });
                    }}
                    onLoadEnd={()=>{
                        Toast.hide();
                    }}
            />
            </View>
        )
    }

   

    componentWillMount(){
         if(Platform.OS === 'android'){
             BackAndroid.addEventListener('hardwareBackPress',this.onBackAndroid);
         };
     }

     componentWillUnmount(){
         if(Platform.OS === 'android'){
             BackAndroid.removeEventListener('hardwareBackPress',this.onBackAndroid);
         }
     }
     onBackAndroid = ()=>{
        const {navigator} = this.props;
        //  if(navigator && (this.state._URL == bizUrl+'Hotel' || this.state._URL == bizUrl+'Hotel/Index')){
             navigator.pop();
             return true;
        //  }
        // this.webview.goBack();
        // return true;
     }
}

const styles = StyleSheet.create({
    policyTextStyle:{
        fontSize:14,
        color:'#999',
        paddingLeft:15,
        paddingBottom:2,
    },
    itemViewStyle:{
        paddingLeft:15,
        paddingRight:15,
        flexDirection:'row',
        paddingBottom:10,
        paddingTop:10,
        backgroundColor:'#fff',
        alignItems: 'center',
    },
    itemTextStyle:{
        color:'#333',
        fontSize:16,
        marginLeft:5,
        paddingRight:15
    },
})