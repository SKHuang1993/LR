import React, { Component } from 'react';
import {Toast} from 'antd-mobile';
import {
    AppRegistry,
    Navigator,
    Text,
    Dimensions,
    StyleSheet,
    View,
    TouchableOpacity,
    TextInput,
    Platform,
    BackAndroid,
    Alert,
} from 'react-native';

import {COLORS} from '../../styles/commonStyle';
//import {LanguageType} from '../../utils/languageType';
import Navbar from '../../components/navBar/index';
import ResetPassword from './resetPassword';
import{ RestAPI } from '../../utils/yqfws'

var {width,height} = Dimensions.get('window');
import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();

export default class VerAccount extends Component {
    constructor(props) {
         super(props);
         this._index=60;//计时器倒计时60s
         this._timer=null;//计时器
         this.state={
             account:'',
             verCode:'',
             remainTime:60,//计时器倒计时60s
             verCodeRemind:lan.sendVerCode,
             accType:2,
             vCode:'',//验证码输入框输入的内容
         };
     }
     
    render(){
        return(
            <View style={{backgroundColor:"#E6EAF3",height:height}}>
                <Navbar navigator={this.props.navigator} title={lan.verAccount} style={{marginTop:10,}}/>
                <View style={{marginBottom:0.8,justifyContent:'center',height:48}}>
                    <TextInput style={{fontSize:16,paddingLeft:10,backgroundColor:"#fff",flex:1}} 
                                    placeholder={lan.inputAccout} placeholderTextColor='#ccc' 
                                  
                                    underlineColorAndroid='#fff'
                                    onChangeText={(txt) => {this.state.account=txt;}}
                                    selectionColor='#333'/>
                </View>

                <View style={styles.verCodeStyle}>
                    <TextInput style={{fontSize:16,paddingLeft:10,backgroundColor:"#fff",flex:1}} 
                                    placeholder={lan.verCode} placeholderTextColor='#ccc' 
                                   
                                    onChangeText={(txt) => {this.state.vCode=txt;}}
                                    underlineColorAndroid='#fff'
                                    selectionColor='#333'/>
                    <TouchableOpacity  onPress={()=>this.sendVerCodeEvent()}>
                        <Text style={styles.sendBtnStyle}>{this.state.verCodeRemind}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.nextViewSttyle} onPress={()=>this.nextEvent()}>
                        <Text style={styles.nextBtnStyle}>{lan.next}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    //发生验证码按钮点击事件
    sendVerCodeEvent = () => {
        this.state.remainTime = 60;
        if(this.state.account.length==11 && this.isMPNumber(this.state.account)){
            this.countTime();
            let param = {
                    "Account": this.state.account,
                    "AccountType": 2,
            }
            this.state.accType = 2;
            RestAPI.invoke("CRM.VerifyGet",JSON.stringify(param),(test)=>{
                let verInfo = test;
                if(verInfo.Code == 0){
                    if(verInfo.Result.VerifyCode == null || verInfo.Result.VerifyCode == ''){
                        Toast.info("信号问题或者账号未注册导致验证码无法发送，请确认!", 3, null, false);
                        return;
                    }
                    this.state.verCode = verInfo.Result.VerifyCode;
                    this.sendVercodeToUser(this.state.account);
                }else{
                    Toast.info(test, 3, null, false);
                }
            },(err)=>{
                Toast.info(err, 3, null, false);
            });
        }else if(this.isEmail(this.state.account)){
            this.countTime();
            let param = {
                    "Account": this.state.account,
                    "AccountType": 1
            }
            this.state.accType = 1;
            RestAPI.invoke("CRM.VerifyGet",JSON.stringify(param),(test)=>{
                let verInfo = test;
                if(verInfo.Code == 0){
                    if(verInfo.Result.VerifyCode == null || verInfo.Result.VerifyCode == ''){
                        Toast.info("信号问题或者账号未注册导致验证码无法发送，请确认!", 3, null, false);
                        return;
                    }
                    this.state.verCode = verInfo.Result.VerifyCode;
                    this.sendVercodeToUser(this.state.account);
                }else{
                    Toast.info(verInfo, 3, null, false);
                }
            },(err)=>{
                Toast.info(err, 3, null, false);
            });
        }else{
            Alert.alert(lan.remind,lan.noMPOrEmail,[{text: lan.ok, onPress: () => {}},])
        }
    }

     //发送验证码后的计时器
    countTime = () =>{
        this.state.verCodeColor='#999';
        this._timer=setInterval(()=>{
            this.state.remainTime = this._index--;
            this.state.verCodeRemind = this.state.remainTime+'s '+lan.resendVerCode;
            this.setState({}); 
            if(this.state.remainTime<=0){
                this._timer && clearInterval(this._timer);
                this.state.verCodeRemind = lan.sendVerCode;
                this._index = 60;
                this.state.remainTime=60;
                this.state.verCode = '';
                this.setState({}); 
            }
        },1000);
    }

    sendVercodeToUser = (txt) => {
        if(this.isMPNumber(txt)){
            let param = {
                "Body": "差旅宝修改密码功能验证码:"+this.state.verCode+",请勿泄露给其他人！",
                "To": txt,
            }
            RestAPI.invoke("Messaging.SmsSend",JSON.stringify(param),(test)=>{
                if(test.Code == 0){
                }else{
                    Toast.info(test, 5, null, false);
                }
            },(err)=>{
                Toast.info(err, 5, null, false);
            });
        }else if(this.isEmail(txt)){
            let param = {
                "Recipients": txt,
                "Subject":'差旅宝修改密码功能验证码',
                "Body": "差旅宝修改密码功能验证码:"+this.state.verCode+",请勿泄露给其他人！",
            }
            RestAPI.invoke("Messaging.FocusMailSend",JSON.stringify(param),(test)=>{
                if(test.Code == 0){
                }else{
                    Toast.info(test, 5, null, false);
                }
            },(err)=>{
                Toast.info(err, 5, null, false);
            });
        }
    }

    //判断手机号码输入是否正确
    isMPNumber = (Tel) => {
        var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/; 
        if(myreg.test(Tel)){
            return true;
        }else{
            return false;
        }
    }

    //判断账号是否为邮箱
    isEmail = (email) => {
         var myReg = /^[-_A-Za-z0-9]+@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/;
         if(myReg.test(email)){
             return true;
         } else{
             return false;
         }
    }

    //“下一步”按钮点击事件
    nextEvent=()=>{
        if(this.state.vCode == '' || this.state.vCode != this.state.verCode){
            Alert.alert(lan.remind,
                        lan.inputVerCode,
                        [{text: lan.ok, onPress: () => {}},]
            )
        }else{
            this._timer && clearInterval(this._timer);
            this.state.remainTime = 0;
            const {navigator} = this.props;
            let _this = this;
            if(navigator) {
                navigator.replace({
                    name: 'ResetPassword',
                    component: ResetPassword,
                    passProps:{
                        verCode: _this.state.verCode,
                        account:_this.state.account,
                        accType:_this.state.accType,
                    }
                });
            }
        }
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
         if(navigator){
             navigator.pop();
             return true;
         }
         return false;
     }
}

const styles=StyleSheet.create({
    verCodeStyle:{
        flexDirection:"row",
        backgroundColor:"#fff",
        height:48,
        width:width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnStyle:{
        borderColor:"#333",
        borderRadius:5,
        borderWidth:0.5,
        marginTop:8,
        marginBottom:8,
        paddingTop:2,
        paddingBottom:2,
        paddingLeft:5,
        paddingRight:5,
        marginRight:15,
        color:'#333',
        textAlign :'center',
    },
    nextViewSttyle:{
        height:45,
        marginLeft:15,
        marginRight:15,
        marginTop:20,
        backgroundColor:COLORS.btnBg,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:8,
    },
    nextBtnStyle:{
        color:'#fff',
        fontSize:16,
    },
})