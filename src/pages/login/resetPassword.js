import React, { Component } from 'react';
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
import {Toast} from 'antd-mobile';

import {COLORS} from '../../styles/commonStyle';
import {LanguageType} from '../../utils/languageType';
import Navbar from '../../components/navBar/index';
import Login from './login';
import{ RestAPI } from '../../utils/yqfws'

var {width,height} = Dimensions.get('window');
var lan = LanguageType.setType();

export default class ResetPassword extends Component {
    constructor(props) {
         super(props);
         this.state={
             newPassword:'',
             verCode:this.props.verCode,
             account:this.props.account,
             accType:this.props.accType,
         };
     }  

     componentDidMount() {
        //这里获取从FirstPageComponent传递过来的参数: id
        // this.state.verCode=this.props.verCode;
    }

     render(){
        return(
            <View style={{backgroundColor:"#E6EAF3",height:height}}>
                <Navbar navigator={this.props.navigator} title={lan.resetPassword} style={{marginTop:10,}}/>
                <TextInput style={{fontSize:16,paddingLeft:10,height:45,backgroundColor:"#fff"}} 
                                    placeholder={lan.inputNewPass} placeholderTextColor='#999' 
                                    multiline={true}
                                    onChangeText={(txt) => {this.state.newPassword=txt;}}
                                    underlineColorAndroid='#fff'
                                    selectionColor='#333'/>

                <TouchableOpacity style={styles.finishViewSttyle} onPress={()=>this.resetPassEvent()}>
                        <Text style={styles.finishBtnStyle}>{lan.finish}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    resetPassEvent = () =>{
        if(this.state.newPassword == ''){
            Toast.info(lan.inputNewPass,3,null,false);
        }else{
            let param = {
                    "Account": this.state.account,
                    "VerifyCode": this.state.verCode,
                    "Password": this.state.newPassword,
                    "AccountType": this.state.accType
            }
            RestAPI.invoke("CRM.PasswordUpdateByVerifyCode",JSON.stringify(param),(test)=>{
                let verInfo = test;
                if(verInfo.Code == 0){
                     const {navigator} = this.props;
                     Toast.info(lan.resetPassSuccess,3,null,false);
                    if(navigator) {
                        navigator.pop()
                    }
                }else{
                    Toast.info(test, 3, null, false);
                }
            },(err)=>{
                Toast.info(err, 3, null, false);
            });
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
    finishViewSttyle:{
        height:48,
        marginLeft:15,
        marginRight:15,
        marginTop:20,
        backgroundColor:COLORS.btnBg,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:8,
    },
    finishBtnStyle:{
        color:'#fff',
        fontSize:16,
    },
})