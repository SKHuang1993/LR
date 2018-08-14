import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    Platform,
    TextInput,
    TouchableOpacity,
    BackAndroid,
} from 'react-native';
import {Toast } from 'antd-mobile';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';
import { RestAPI } from '../../utils/yqfws';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class EditMyAccountInfo  extends Component {
    constructor(props) {
        super(props);
        this.state={
            content:this.props.Content,
            title:this.props.Title,
        };
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                <Navbar navigator={this.props.navigator} title={this.state.title}/>
                <TextInput style={{fontSize: 16,backgroundColor:'#fff',textAlignVertical: 'top',paddingLeft:15,height:120}}
                            onChangeText={(txt) => {
                                let len = true;
                                if(this.props.Type == 'FirstNameEn' || this.props.Type == 'LastNameEn'){
                                    let re = new RegExp("[a-zA-Z]");
                                    len=re.test(txt);
                                }
                                if(len||txt==""){
                                    this.state.content = txt;
                                    this.setState({});
                                }
                            }}
                            placeholder={lan.inputContent} placeholderTextColor='#ccc'
                            autoCapitalize={(this.props.Type == 'FirstNameEn' || this.props.Type == 'LastNameEn')
                                                ? 'characters' :'none'}
                            keyboardType={
                                (this.props.Type == 'FirstNameEn' || this.props.Type == 'LastNameEn' 
                                    || this.props.Type == 'EMAIL') ? 'email-address' :
                                this.props.Type == 'PHONE' ? 'phone-pad' : 'default'
                            }
                            value={this.state.content}
                            multiline={true}
                            underlineColorAndroid="transparent" 
                            selectionColor='#333' />
                <TouchableOpacity onPress={() => this.submitContent()}
                                style={{height: 45, backgroundColor: COLORS.btnBg, alignItems: 'center',
                                        justifyContent: 'center', borderRadius: 5,margin:30}}>
                    <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>{lan.ok}</Text>
               </TouchableOpacity>
            </View>
        )
    }

    submitContent = () =>{
        let isSubmit = true;
        let type = this.props.Type;
        let myInfo = this.props.MyInfo.Result;
        let myName = myInfo.Information.FullName;
        let firstName = myInfo.Information.FirstNameEn;
        let lastName = myInfo.Information.LastNameEn;
        if(type == 'FullName'){
            this.props.MyInfo.Result.Information.FullName = this.state.content;
            myName = this.state.content;
        }else if(type == 'FirstNameEn'){
            firstName = this.state.content;
            this.props.MyInfo.Result.Information.FirstNameEn = this.state.content;
        }else if(type == 'LastNameEn'){
            lastName = this.state.content;
            this.props.MyInfo.Result.Information.LastNameEn = this.state.content;
        }else if(type == 'PHONE'){
            if(this.props.MyInfo.Result.Annts == null) this.props.MyInfo.Result.Annts = [];
            if(!this.isMPNumber(this.state.content)){
                isSubmit = false;
                Toast.info(lan.wrongMPNum,3,null,false);
            }else if((JSON.stringify(this.props.MyInfo.Result.Annts)).indexOf("PHONE") >= 0){
                for(let i = 0;i<this.props.MyInfo.Result.Annts.length;i++){
                    if(this.props.MyInfo.Result.Annts[i].Name == 'PHONE')
                        this.props.MyInfo.Result.Annts[i].Value = this.state.content;
                }
            }else{
                let item = {
                    "Name": "PHONE",
                    "Value": this.state.content
                };
                this.props.MyInfo.Result.Annts.splice(this.props.MyInfo.Result.Annts.length,0,item);
            }
        }else{
            if(this.props.MyInfo.Result.Annts == null) this.props.MyInfo.Result.Annts = [];
            if(!this.isEmail(this.state.content)){
                isSubmit = false;
                Toast.info(lan.wrongEmail,3,null,false);
            }else if((JSON.stringify(this.props.MyInfo.Result.Annts)).indexOf("EMAIL") >= 0){
                for(let i = 0;i<this.props.MyInfo.Result.Annts.length;i++){
                    if(this.props.MyInfo.Result.Annts[i].Name == 'EMAIL')
                        this.props.MyInfo.Result.Annts[i].Value = this.state.content;
                }
            }else{
                let item = {
                    "Name": "EMAIL",
                    "Value": this.state.content
                };
                this.props.MyInfo.Result.Annts.splice(this.props.MyInfo.Result.Annts.length,0,item);
            }
        }
        if(isSubmit){
            let param = {
                "RoleID":myInfo.Account.RoleID,
                "Person":myInfo.Account.PersonCode,
                "Account":myInfo.Account.AccountNo,
                "ApproveID":myInfo.ApproveRule.ID,
                "ClientMan":{
                    "OperateID":myInfo.Account.AccountNo,
                    "CompanyCode":myInfo.Company.CompanyCode,
                    "DepartmentCode":myInfo.Company.DepartmentCode,
                    "Name":myName,
                    "Sex":myInfo.Information.Sex,
                    "Birthday":myInfo.Information.Birthday,
                    "ThirdPartyID":myInfo.Information.ThirdPartyID,
                    "Annts":this.props.MyInfo.Result.Annts,
                    "Proofs":myInfo.Proofs,
                    "CostCenterID":myInfo.CostDetail.CostID,
                    "PolicyID":myInfo.PolicyDetail.PolicyID,
                    "LastNameEn":lastName,
                    "FirstNameEn":firstName,
                    "Nationality":myInfo.Information.CountryCode,
                    "Milescards":myInfo.Milescards
                }
            };
            Toast.loading(lan.loading,60,()=>{
                Toast.info(lan.loadingFail, 3, null, false);
            });
            RestAPI.invoke("Base.UpdateClientManInfo",JSON.stringify(param),(test)=>{
                Toast.hide();
                if(test.Code == 0){
                    Toast.info(lan.modifySuccess,3,null,false);
                    const {navigator} = this.props;
                    if(navigator){
                        this.props.RefreshView();
                        navigator.pop();
                    }
                }else{
                    Toast.info(test.Msg, 3, null, false);
                }
            },(err)=>{
                Toast.info(err, 3, null, false);
            });
        }
    }

    //判断手机号码输入是否正确
    isMPNumber = (Tel) => {
        var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        if (myreg.test(Tel)) {
            return true;
        } else {
            return false;
        }
    }

    //判断账号是否为邮箱
    isEmail = (email) => {
        var myReg = /^[-_A-Za-z0-9]+@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/;
        if (myReg.test(email)) {
            return true;
        } else {
            return false;
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