import React, {Component} from 'react';
import {
	StyleSheet,
	View,
	TouchableOpacity,
    Text,
    Dimensions,
    ScrollView,
    ListView,
    Platform,
    BackAndroid,
} from 'react-native';
import Icon from '../../components/icons/icon';
import RadiusImage from '../../components/radiusImage/index';
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import ExhibitionView from '../../components/exhibitionView/index';
import EntryBar from '../../components/entryBar/index';
import Navbar from '../../components/navBar/index';
import {Popup,Toast} from 'antd-mobile';

import ProofInfo from './proofInfo';
import TripPolicy from './tripPolicy';
import ApprovalRule from './approvalRule';
import AirCompanyCade from './airCompanyCade';
import EditMyAccountInfo from './editMyAccountInfo';
import Login from '../login/login';
import{ RestAPI } from '../../utils/yqfws';

import  ImagePicker from 'react-native-image-picker'; //第三方相机
import { Chat } from '../../utils/chat';
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

var {width,height} = Dimensions.get('window')
var myinfo;

var photoOptions = {
            //底部弹出框选项
            title:lan.select,
            cancelButtonTitle:lan.cancel,
            takePhotoButtonTitle:lan.photograph,
            chooseFromLibraryButtonTitle:lan.album,
            quality:0.75,
            allowsEditing:true,
            noData:false,
            storageOptions: {
                skipBackup: true,
                path:'images'
    }
}

export default class MyAccount  extends Component {
    constructor(props) {
        super(props);
        myinfo = this.props.myInfo;
        this.state={
            dataSource: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            isGetDepInfo:false,
            headImg:this.props.headImg,//头像
            name:'',//全名
            lastName:'',//姓
            firstName:'',//名
            sex:myinfo.Result.Information.Sex,//性别
            mpNumber:'',
            email:'',
            company:myinfo.Result.Company.CompanyName,//公司名称
            companyCode:myinfo.Result.Company.CompanyCode,//公司代码
            department:myinfo.Result.Company.DepartmentName,//部门
            role:myinfo.Result.Account.RoleName == null ? '' : myinfo.Result.Account.RoleName,//角色
            core:myinfo.Result.CostDetail == null ? '' : myinfo.Result.CostDetail.CostName,//中心成本
            ip:'',//网络IP地址
        };
    }

    componentDidMount() {  
         fetch("http://pv.sohu.com/cityjson?ie=utf-8").then((res) => {
            res.text().then((text) => {
                let reg = new RegExp('(\\d+)\.(\\d+)\.(\\d+)\.(\\d+)');
                let arr = reg.exec(text);
                this.state.ip = arr[0];
            })
        }); 
    }

    render(){
        myinfo = this.props.myInfo;
        this.state.name=myinfo.Result.Information.FullName;//全名
        this.state.lastName=myinfo.Result.Information.LastNameEn;//姓
        this.state.firstName=myinfo.Result.Information.FirstNameEn;//名

        let isMP = false;
        if(myinfo.Result.Annts != null){
            for(var v of myinfo.Result.Annts){
                if (v.Name == 'PHONE' && !isMP) {
                    this.state.mpNumber = v.Value;
                    isMP = true;
                }else if(v.Name == 'EMAIL') this.state.email = v.Value;
            }
        }
        // if(myinfo.Result.Account.Mobile!=null &&myinfo.Result.Account.Mobile!='')
        //         this.state.mpNumber = myinfo.Result.Account.Mobile;
        // if(myinfo.Result.Account.Email!=null &&myinfo.Result.Account.Email!='')
        //         this.state.email = myinfo.Result.Account.Email;
        return(
            <View>
                <Navbar navigator={this.props.navigator} title={lan.myAccount}/>
                <ScrollView style={{backgroundColor:COLORS.containerBg}}>
                <TouchableOpacity style={styles.barStyle} onPress={()=>this.setUpHeadImg()}>
                    <Text style={styles.headTextStyle}>{lan.portrait}</Text>
                    <View style={{flex:3.5,flexDirection:'row'}}>
                        <Text style={{flex:1}}/>
                        <RadiusImage pathType={1} 
                                imagePath={this.state.headImg}
                                imgWidth={38} imgHeight={38}/>
                    </View>
                    <Icon icon={'0xe677'} color={'#999'} style={{fontSize: 18,marginLeft:5}}/>
                </TouchableOpacity>
                <ExhibitionView leftText={lan.name} rightText={this.state.name} rightColor={'#333'}
                                BorderTop={1/FLEXBOX.pixel}
                                bottomLine={true} leftColor={'#666'} isVisible={true} 
                                clickEvent={()=>{this.editInfoEvent("FullName",this.state.name,lan.name)}}/>
                <ExhibitionView leftText={lan.lastName} rightText={this.state.lastName} 
                                rightColor={'#333'} bottomLine={true} leftColor={'#666'}
                                isVisible={true} clickEvent={()=>{this.editInfoEvent("LastNameEn",this.state.lastName,lan.lastName)}}/>
                <ExhibitionView leftText={lan.firstName} rightText={this.state.firstName} 
                                rightColor={'#333'} bottomLine={true} leftColor={'#666'}
                                isVisible={true} clickEvent={()=>{this.editInfoEvent("FirstNameEn",this.state.firstName,lan.firstName)}}/>
                <ExhibitionView leftText={lan.sex} rightText={this.state.sex == 'M' ? lan.man : lan.woman} leftColor={'#666'}
                                rightColor={'#333'} bottomLine={true} isVisible={true} clickEvent={()=>{this.selectSex()}}/>
                <ExhibitionView leftText={lan.mpNumber} rightText={this.state.mpNumber} 
                                rightColor={'#333'} bottomLine={true} leftColor={'#666'}
                                isVisible={true} clickEvent={()=>{this.editInfoEvent("PHONE",this.state.mpNumber,lan.mpNumber)}}/>
                <ExhibitionView leftText={lan.email} rightText={this.state.email} rightColor={'#333'} leftColor={'#666'}
                                isVisible={true} clickEvent={()=>{this.editInfoEvent("EMAIL",this.state.email,lan.email)}}/>
                
                <View style={{marginTop:10}} />
                <ExhibitionView leftText={lan.theCompany} rightText={this.state.company} 
                                BorderTop={1/FLEXBOX.pixel}
                                rightColor={'#333'} bottomLine={true} leftColor={'#666'}/>
                <ExhibitionView leftText={lan.theDeparment} rightText={this.state.department} rightColor={'#333'} 
                                bottomLine={true} leftColor={'#666'} isVisible={true} 
                                clickEvent={()=>{this.getDepartmentInfo()}}/>
                <ExhibitionView leftText={lan.role} rightText={this.state.role} 
                                rightColor={'#333'} bottomLine={true} leftColor={'#666'}/>
                <ExhibitionView leftText={lan.core} rightText={this.state.core} 
                                rightColor={'#333'} leftColor={'#666'}/>

                <View style={{marginTop:10}}>
                    <EntryBar leftText={lan.credentialsInfo} leftColor={'#666'}
                              BorderTop={1/FLEXBOX.pixel} 
                              clickEvent={()=> this.toProofInfo()}/>
                    <EntryBar leftText={lan.airlinesCard} leftColor={'#666'} clickEvent={()=>{this.toAirCompanyCade()}}/>
                    <EntryBar leftText={lan.tripPolicy} leftColor={'#666'} clickEvent={()=>this.toTripPolicy()}/>
                    <EntryBar leftText={lan.approvalRule} leftColor={'#666'} clickEvent={()=>{this.toApprovalRule()}}/>
                </View>

                <TouchableOpacity  onPress={()=>MyAccount.exitLoginClick(this.props)} style={{borderRadius:5,
                        backgroundColor:COLORS.btnBg,margin:20,alignItems: 'center',justifyContent: 'center',}}>
                    <Text style={{color:'#fff',paddingTop:15,paddingBottom:15,fontSize:16}}>{lan.exitLogin}</Text>
                </TouchableOpacity>
                
            </ScrollView>
            </View>
        );
    }

    //设置头像
    setUpHeadImg = () => {
        ImagePicker.showImagePicker(photoOptions,(response) =>{
            if(response.data != null){
                let param = {
                     "Account":myinfo.Result.Account.AccountNo,
                     "UserIP":this.state.ip,
                     "FaceImageBytes":response.data
                }
                Toast.loading(lan.uploadImg,60,()=>{
                    Toast.info(lan.loadingFail, 3, null, false);
                });
                RestAPI.invoke("Base.UserFaceUpload",JSON.stringify(param),(value)=>{
                    Toast.hide();
                    let info = value;
                    if(info.Code == 0){
                        this.state.headImg = 'http://img2.yiqifei.com'+info.Result.Path;
                        this.props.myInfo.UserImage = 'http://img2.yiqifei.com'+info.Result.Path;
                        this.resetMyInfo();
                        this.props.RefreshView();
                        this.setState({});
                    }else{
                        Toast.info(value, 3, null, false);
                    }
                },(err)=>{
                    Toast.info(err,3,null,false);
                })
            }
         })
    }

    //跳转到证件信息页面
    toProofInfo = () => {
        let _this = this;
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'ProofInfo',
                component: ProofInfo,
                passProps:{
                    myInfo:myinfo,
                }
            })
        }
    }

    //跳转到差旅政策页面
    toTripPolicy = () =>{
        let _this = this;
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'TripPolicy',
                component: TripPolicy,
                passProps:{
                    myInfo:myinfo,
                }
            })
        }
    }

    //跳转到审批规则页面
    toApprovalRule = () =>{
        let _this = this;
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'ApprovalRule',
                component: ApprovalRule,
                passProps:{
                    myInfo:myinfo,
                }
            })
        }
    }

    //跳转到常用航司卡页面
    toAirCompanyCade = () =>{
        let _this = this;
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'AirCompanyCade',
                component: AirCompanyCade,
                passProps:{
                    myInfo:myinfo,
                }
            })
        }
    }

    //点击性别框选择性别
    selectSex = () =>{
        Popup.show(
            <View>
                <View style={{flexDirection:'row',padding:15,backgroundColor:COLORS.primary}}>
                    <Text style={{fontSize:17,color:'#fff',flex:1}}>{lan.sex}</Text>
                    <Text style={{fontSize:15,color:'#fff',width:50,textAlign:'right'}} onPress={()=>Popup.hide()}>{lan.cancel}</Text>
                </View>
                
                <View style={{backgroundColor:"#ebebeb",height:0.8}}></View>
                <TouchableOpacity onPress={()=>this.selSexEvent('M')}>
                    <Text style={{fontSize:16,color:'#333',paddingLeft:15,textAlign:'center',
                                    paddingTop:15,paddingBottom:15}}>{lan.man}</Text>
                </TouchableOpacity>
                <View style={{backgroundColor:"#ebebeb",height:0.8}}></View>
                <TouchableOpacity onPress={()=>this.selSexEvent('F')}>
                    <Text style={{fontSize:16,color:'#333',paddingLeft:15,textAlign:'center',
                                    paddingTop:15,paddingBottom:15}}>{lan.woman}</Text>
                </TouchableOpacity>
            </View>,
            {animationType:'slide-up',maskClosable:true}
        );
    }

    //性别选择后的反馈事件
    selSexEvent = (s)=>{
        Popup.hide();
        let param = {
                "RoleID":myinfo.Result.Account.RoleID,
                "Person":myinfo.Result.Account.PersonCode,
                "Account":myinfo.Result.Account.AccountNo,
                "ApproveID":myinfo.Result.ApproveRule.ID,
                "ClientMan":{
                    "OperateID":myinfo.Result.Account.AccountNo,
                    "CompanyCode":myinfo.Result.Company.CompanyCode,
                    "DepartmentCode":myinfo.Result.Company.DepartmentCode,
                    "Name":myinfo.Result.Information.FullName,
                    "Sex":s == "M" ? "Male" : "Female",
                    "Birthday":myinfo.Result.Information.Birthday,
                    "ThirdPartyID":myinfo.Result.Information.ThirdPartyID,
                    "Annts":myinfo.Result.Annts,
                    "Proofs":myinfo.Result.Proofs,
                    "CostCenterID":myinfo.Result.CostDetail.CostID,
                    "PolicyID":myinfo.Result.PolicyDetail.PolicyID,
                    "LastNameEn":myinfo.Result.Information.LastNameEn,
                    "FirstNameEn":myinfo.Result.Information.FirstNameEn,
                    "Nationality":myinfo.Result.Information.CountryCode,
                    "Milescards":myinfo.Result.Milescards
                }
        };
        Toast.loading(lan.loading,60,()=>{
                Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("Base.UpdateClientManInfo",JSON.stringify(param),(test)=>{
                Toast.hide();
                if(test.Code == 0){
                    Toast.info(lan.modifySuccess,3,null,false);
                    this.props.myInfo.Result.Information.Sex = s;
                    this.state.sex = s;
                    this.resetMyInfo();
                    this.setState({});
                }else{
                    Toast.info(test.Msg, 3, null, false);
                }
        },(err)=>{
                Toast.info(err, 3, null, false);
        });
    }

    //获得所有的部门
    getDepartmentInfo= ()=>{
        let param = {
            "CompanyCode": this.state.companyCode
        }
        Toast.loading(lan.loading,60,()=>{
             Toast.info(lan.loadingFail, 3, null, false);
        });
        
        RestAPI.invoke("CRM.DeparmentGetList",JSON.stringify(param),(value)=>{
            let userInfo = value;
            if(userInfo.Code == 0){
                let ds = new ListView.DataSource({
                    rowHasChanged: (row1, row2) => row1 !== row2,
                });
                this.setState({
                    isGetDepInfo:true,
                    dataSource:ds.cloneWithRows(userInfo.Result.Deparments),
                });
                Toast.hide();
                Popup.show(
                    this.departmentList() ,{animationType:'slide-up'}
                );
            }else{
                Toast.info(value, 3, null, false);
            }
        },(err)=>{
            Toast.info(err,3,null,false);
        })
    }

    //适配部门list的内容
    renderDepart=(depInfo)=>{
        return (
             <TouchableOpacity onPress={()=>this.depListItemClick(depInfo)}> 
                 <Text style={{fontSize:16,color:'#333',padding:15,textAlign:'center'}}>{depInfo.NameCn}</Text>
                 <View style={{backgroundColor:'#ebebeb',height:0.8}}/>
            </TouchableOpacity>
         );
    }

    //部门列表样式
    departmentList = ()=>{
        return(
            <View style={{height:300,backgroundColor:COLORS.primary}}>
                <View style={{padding:15,flexDirection:'row'}}>
                    <Text style={{flex:1,fontSize:16,color:'#fff'}}>{lan.theDeparment}</Text>
                    <Text style={{textAlign:'right',fontSize:15,color:'#fff'}} onPress={()=>Popup.hide()}>{lan.cancel}</Text>
                </View>
                
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this.renderDepart.bind(this)}
                    style={styles.listView}
                />
            </View>
        )
    }

    //部门子项点击事件
    depListItemClick = (dep) =>{
        Popup.hide();
        let param = {
                "RoleID":myinfo.Result.Account.RoleID,
                "Person":myinfo.Result.Account.PersonCode,
                "Account":myinfo.Result.Account.AccountNo,
                "ApproveID":myinfo.Result.ApproveRule.ID,
                "ClientMan":{
                    "OperateID":myinfo.Result.Account.AccountNo,
                    "CompanyCode":myinfo.Result.Company.CompanyCode,
                    "DepartmentCode":dep.DepartmentCode,
                    "Name":myinfo.Result.Information.FullName,
                    "Sex":myinfo.Result.Information.Sex,
                    "Birthday":myinfo.Result.Information.Birthday,
                    "ThirdPartyID":myinfo.Result.Information.ThirdPartyID,
                    "Annts":myinfo.Result.Annts,
                    "Proofs":myinfo.Result.Proofs,
                    "CostCenterID":myinfo.Result.CostDetail.CostID,
                    "PolicyID":myinfo.Result.PolicyDetail.PolicyID,
                    "LastNameEn":myinfo.Result.Information.LastNameEn,
                    "FirstNameEn":myinfo.Result.Information.FirstNameEn,
                    "Nationality":myinfo.Result.Information.CountryCode,
                    "Milescards":myinfo.Result.Milescards
                }
            };
            Toast.loading(lan.loading,60,()=>{
                Toast.info(lan.loadingFail, 3, null, false);
            });
            RestAPI.invoke("Base.UpdateClientManInfo",JSON.stringify(param),(test)=>{
                Toast.hide();
                if(test.Code == 0){
                    Toast.info(lan.modifySuccess,3,null,false);
                    this.state.department = dep.NameCn;
                    this.props.myInfo.Result.Company.DepartmentName = dep.NameCn;
                    this.props.myInfo.Result.Company.DepartmentCode = dep.DepartmentCode;
                    this.resetMyInfo();
                    this.setState({});
                }else{
                    Toast.info(test.Msg, 3, null, false);
                }
            },(err)=>{
                Toast.info(err, 3, null, false);
            });
    }

    //编辑个人信息
    editInfoEvent = (type,content,title) =>{
        let _this = this;
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'EditMyAccountInfo',
                component: EditMyAccountInfo,
                passProps:{
                    Type:type,
                    Content:content,
                    Title:title,
                    MyInfo:myinfo,
                    RefreshView:()=>{this.resetMyInfo()},
                }
            })
        }
    }
    resetMyInfo = () => {
        let storage = global.storage;
        storage.load({ key: 'BIZACCOUNTINFO' }).then(val =>{
            if(val!=null){
                let bizAccountInfo = JSON.parse(val);
                bizAccountInfo.MyInfo = this.props.myInfo;
                global.userInfo = bizAccountInfo;
                storage.save({
                    key: 'BIZACCOUNTINFO',
                    rawData: JSON.stringify(bizAccountInfo)
                });
            }
        }).catch(err => {
            console.log(err)
        });
    }

    //退出登录
    static exitLoginClick = (props) => {
        let storage = global.storage;
        let _this = this;
        let m_myInfo = {};
        storage.load({ key: 'BIZACCOUNTINFO' }).then(val =>{
            if(val!=null){
                m_myInfo = {
                    "Account": JSON.parse(val).MyInfo.Result.Account.UserName,
                    "Password": '',
                    "AccountNo": JSON.parse(val).MyInfo.Result.Account.AccountNo,
                    "PersonCode": JSON.parse(val).MyInfo.Result.Account.PersonCode,
                    "Name": JSON.parse(val).MyInfo.Result.Information.FullName
                }
                storage.save({
                    key: 'USERINFO',
                    rawData: JSON.stringify(m_myInfo)
                });
                Chat.logout();
                const {navigator} = props;
                if(navigator) {
                    navigator.resetTo({
                        name: 'Login',
                        component: Login,
                    })
                }
            }
        }).catch(err => {
            alert(err);
                console.log(err)
        });
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
    barStyle:{
        width:width,
        height:45,
        flexDirection:'row',
        paddingLeft:15,
        paddingRight:10,
        alignItems: 'center',
        backgroundColor:"#fff",
        justifyContent: 'center',
    },
    headTextStyle:{
        color:'#666',
        flex:1,
        fontSize:15,
    },
    listView: {
        flex:1,
        backgroundColor: '#F5FCFF',
    },
})
