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
import {Toast,Popup,List,Radio } from 'antd-mobile';
import Icon from '../../components/icons/icon';
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import Navbar from '../../components/navBar/index';
import {airData} from '../../utils/acCodeOrAcName';
import{ RestAPI } from '../../utils/yqfws'

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();
const RadioItem = Radio.RadioItem;
const airComInfo = [];


export default class AddAirCade  extends Component {
    constructor(props) {
         super(props);
         this.state = {
             ind:this.props.Index,
             cadeName:this.props.CadeName,
             cadeNum:this.props.CadeNum,
             cadeId:this.props.IsAdd?"":this.props.MyInfo.Milescards[this.props.Index].Issuer,
             cName:this.props.CadeName,
             cNum:this.props.CadeNum,
             isAdd:this.props.IsAdd,
             myInfo:this.props.MyInfo,
             isSure:false,//判断是否选择了航司
         };
    }

    render(){
        airComInfo = [];
        for(var v of airData.NewDataSet.AirDataList){
            let d = {
                "carriercode": v.carriercode,
                "airwayname": v.airwayname,
                "shortname": v.shortname,
                "country": v.country,
                "isChoice":false
            }
            airComInfo.splice(airComInfo.length,0,d);
        }
        return(
            <View style={{backgroundColor:COLORS.containerBg,flex:1}}>
                <Navbar navigator={this.props.navigator} title={this.state.isAdd ? lan.addCade : lan.modifyAirCardInfo}/>
                <View style={styles.viewStyle}>
                    <Text style={styles.textStyle}>{lan.airCompany+":"}</Text>
                    <TouchableOpacity style={{flex:3,}} onPress={()=>this.seleteAirCadeData()}>
                        <Text style={this.state.cadeName == '' ? {fontSize:16,color:'#ccc'} : {fontSize:16,color:'#333'}}>
                            {this.state.cadeName == '' ? lan.inputCadeName : this.state.cadeName}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
                <View style={styles.viewStyle}>
                    <Text style={styles.textStyle}>{lan.cadeNum+":"}</Text>
                    <TextInput style={{flex:3,fontSize:16,}} 
                            onChangeText={(txt)=>{this.state.cadeNum = txt;this.setState({});}}
                            placeholder={lan.inputCadeNum} placeholderTextColor='#ccc' 
                            value={this.state.cadeNum}
                            underlineColorAndroid='#fff'
                            selectionColor='#333'/>
                </View>
                <TouchableOpacity style={styles.btnStely} onPress={()=>this.sureChoiceCompany()}>
                    <Text style={{fontSize:16,color:'#fff'}}>{lan.finish}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    seleteAirCadeData = () => {
        Popup.show(
                <PopupView AirCompanyCadeInfo={airComInfo}  data={(val)=>{
                    Popup.hide();
                    this.state.cadeName = val.shortname;
                    this.state.cadeId = val.carriercode;
                    this.setState({});
                }} />,
        { animationType: 'slide-up', maskClosable: true });
    }

    //点击确定按钮事件
    sureChoiceCompany = () => {
        if(this.state.cadeId != ''){
            let milCard;
            if(this.state.isAdd){
                milCard = {
                    // "Name":this.state.cadeName,
                    "Value":this.state.cadeNum,
                    "Issuer":this.state.cadeName
                };
                if(this.state.myInfo.Milescards == null){
                    this.state.myInfo.Milescards = [];
                    this.state.myInfo.Milescards.splice(this.state.myInfo.Milescards.length,0,milCard);
                }else
                    this.state.myInfo.Milescards.splice(this.state.myInfo.Milescards.length,0,milCard);
            }else{
                milCard = {
                    "Name":this.state.myInfo.Milescards[this.state.ind].Name,
                    "Value":this.state.cadeNum,
                    "Issuer":this.state.cadeName
                };
                this.state.myInfo.Milescards.splice(this.state.ind,1,milCard);
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
                            Toast.info(lan.success+(this.state.isAdd?lan.add:lan.modify)+lan.airCard,3,null,false);
                            this.props.RefreshEvent();
                            const {navigator} = this.props;
                            if(navigator){
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
            Toast.info(lan.FillInAirCardInfo,3,null,false);
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

class PopupView  extends Component {
    constructor(props) {
         super(props);
         let ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
         });
         this.state = {
             dataSource:ds.cloneWithRows(airComInfo),
             choiceInfo : {},
         };
    }
    render(){
        return (
            <View>
                <View style={{backgroundColor:COLORS.primary,height:44,alignItems:'center',flexDirection:'row'}}>
                    <TouchableOpacity style={{marginLeft:15,paddingRight:10}} onPress={() => Popup.hide()}>
                        <Text style={{color:'#fff',fontSize:15}}>{lan.cancel}</Text>
                    </TouchableOpacity>
                    <Text style={{flex:1}}/>
                    <TouchableOpacity style={{marginRight:15,paddingLeft:10}} onPress={()=>{this.props.data(this.state.choiceInfo);}}>
                        <Text style={{color:'#fff',fontSize:15}}>{lan.ok}</Text>
                    </TouchableOpacity>
                </View>
                <ListView
                    style={{height:300,backgroundColor:COLORS.containerBg}}
                    enableEmptySections = {true}
                    dataSource={this.state.dataSource}
                    renderRow={this.airCadeView.bind(this)}
                />
            </View>
        )
    }

    airCadeView = (value) => {
        return(
            <View style={{borderBottomWidth:1/FLEXBOX.pixel,borderBottomColor:'#ccc'}}>
                <TouchableOpacity style={{flexDirection:'row',paddingLeft:20,paddingRight:15,
                        paddingBottom:10,paddingTop:10,backgroundColor:"#fff"}}
                        onPress={()=>this.refreshData(value)}>
                    <Text style={{color:'#333',fontSize:17,flex:1}}>{value.shortname}</Text>
                    {value.isChoice ?
                        <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18}} /> : null
                    }
                </TouchableOpacity>
            </View>
        )
    }

    refreshData = (value) =>{
        this.state.choiceInfo = value;
        for(let i = 0;i<airComInfo.length;i++){
            if(value.carriercode == airComInfo[i].carriercode)
                airComInfo[i].isChoice = true;
            else airComInfo[i].isChoice = false;
        }
        let ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        // this.state.dataSource = this.state.dataSource.cloneWithRows(airComInfo);
        this.setState({
            dataSource:ds.cloneWithRows(airComInfo),
        });
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
        flex:0.8,
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