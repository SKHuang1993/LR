import React, {Component} from 'react';
import {
	StyleSheet,
	View,
	TouchableOpacity,
    Text,
    Dimensions,
    TextInput,
    Platform,
    BackAndroid,
    ListView,
} from 'react-native';
import {Toast, } from 'antd-mobile';
import Icon from '../../components/icons/icon';
import {COLORS} from '../../styles/commonStyle';
import Navbar from '../../components/navBar/index';
import {airData} from '../../utils/acCodeOrAcName';
import{ RestAPI } from '../../utils/yqfws'

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();
const proofInfo = [];


export default class UpdataProofInfo  extends Component {
    constructor(props) {
         super(props);
         this.state = {
             proofType:this.props.ProofType,
             proofName:this.props.ProofName,
             proofNum:this.props.ProofNum,
             myInfo:this.props.MyInfo,
             isAdd:this.props.ProofNum == '' ? true : false,
         };
    }

    render(){
        return(
            <View style={{backgroundColor:COLORS.containerBg,flex:1}}>
                <Navbar navigator={this.props.navigator} title={lan.proofIngo}/>
                <View style={styles.viewStyle}>
                    <Text style={styles.textStyle}>{lan.proofName}</Text>
                    <Text style={{fontSize:16,color:'#333',flex:3}}>{this.state.proofName}</Text>
                </View>
                <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
                <View style={styles.viewStyle}>
                    <Text style={styles.textStyle}>{lan.proofNum+":"}</Text>
                    <TextInput style={{flex:3,fontSize:16,}} 
                            onChangeText={(txt)=>{this.state.proofNum = txt;this.setState({});}}
                            placeholder={lan.inputProofNum} placeholderTextColor='#ccc' 
                            value={this.state.proofNum}
                            underlineColorAndroid='#fff'
                            selectionColor='#333'/>
                </View>
                <TouchableOpacity style={styles.btnStely} onPress={()=>this.sureChoiceCompany()}>
                    <Text style={{fontSize:16,color:'#fff'}}>{lan.finish}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    //点击确定按钮事件
    sureChoiceCompany = () => {
        if(this.state.myInfo.Proofs == null) this.state.myInfo.Proofs = [];
        if(this.state.proofNum != ''){
            let proInfo;
            if(this.state.isAdd){
                proInfo = {
                    "Name":this.state.proofType,
                    "Value":this.state.proofNum,
                    "Issuer":''
                };
                this.state.myInfo.Proofs.splice(this.state.myInfo.Proofs.length,0,proInfo);
            }else{
                proInfo = {
                    "Name":this.state.proofType,
                    "Value":this.state.proofNum,
                    "Issuer":''
                };
                for(let i = 0;i<this.state.myInfo.Proofs.length;i++){
                    if(this.state.myInfo.Proofs[i].Name == this.state.proofType){
                        this.state.myInfo.Proofs.splice(i,1,proInfo);
                        break;
                    }
                }
                
            }

            let param = {
                "RoleID":this.state.myInfo.Account.RoleID,
                "Person":this.state.myInfo.Account.PersonCode,
                "Account":this.state.myInfo.Account.AccountNo,
                "ApproveID":this.state.myInfo.ApproveRule.ID,
                "ClientMan":{
                    "OperateID":this.state.myInfo.Account.AccountNo,
                    "CompanyCode":this.state.myInfo.Company.CompanyCode,
                    "DepartmentCode":this.state.myInfo.Company.DepartmentCode,
                    "Name":this.state.myInfo.Information.FullName,
                    "Sex":this.state.myInfo.Information.Sex,
                    "Birthday":this.state.myInfo.Information.Birthday,
                    "ThirdPartyID":this.state.myInfo.Information.ThirdPartyID,
                    "Annts":this.state.myInfo.Annts,
                    "Proofs":this.state.myInfo.Proofs,
                    "CostCenterID":this.state.myInfo.CostDetail.CostID,
                    "PolicyID":this.state.myInfo.PolicyDetail.PolicyID,
                    "LastNameEn":this.state.myInfo.Information.LastNameEn,
                    "FirstNameEn":this.state.myInfo.Information.FirstNameEn,
                    "Nationality":this.state.myInfo.Information.CountryCode,
                    "Milescards":this.state.myInfo.Milescards
                }
            };
            Toast.loading(lan.loading,60,()=>{
                Toast.info(lan.loadingFail, 3, null, false);
            });
            RestAPI.invoke("Base.UpdateClientManInfo",JSON.stringify(param),(test)=>{
                Toast.hide();
                if(test.Code == 0){
                    let storage = global.storage;
                    storage.load({ key: 'BIZACCOUNTINFO' }).then(val =>{
                        if(val!=null){
                            let bizAccountInfo = JSON.parse(val);
                            bizAccountInfo.MyInfo.Result = this.state.myInfo;
                            global.userInfo = bizAccountInfo;
                            storage.save({
                                key: 'BIZACCOUNTINFO',
                                rawData: JSON.stringify(bizAccountInfo)
                            });
                            Toast.info(lan.modifySuccess,3,null,false);
                            const {navigator} = this.props;
                            if(navigator){
                                this.props.RefreshView();
                                navigator.pop();
                            }
                        }
                    }).catch(err => {
                        console.log(err)
                    });
                }else{
                    Toast.info(test.Msg, 3, null, false);
                }
            },(err)=>{
                Toast.info(err, 3, null, false);
            });
        }else{
            Toast.info(lan.fillInProofInfo,3,null,false);
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
    viewStyle:{
        height:45,
        flexDirection:'row',
        backgroundColor:'#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textStyle:{
        marginRight:8,
        color:'#333',
        fontSize:16,
        marginLeft: 15,
    },
    btnStely:{
        backgroundColor:COLORS.btnBg,
        marginLeft:20,
        marginRight:20,
        marginTop:30,
        paddingTop:12,
        paddingBottom:12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius:5,
    },
})