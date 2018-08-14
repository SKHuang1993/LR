
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    Navigator, 
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
} from 'react-native';
import {Toast} from 'antd-mobile';
import{ RestAPI } from '../../utils/yqfws'
//import {LanguageType} from '../../utils/languageType';
import {storage} from '../../utils/storage';
import Icon from '../../components/icons/icon';
import RadiusImage from '../../components/radiusImage/index';
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import EntryBar from '../../components/entryBar/index';
import MyAccount from '../../pages/account/myAccount';
import MyOrder from './myOrder';
import ApprovalOrder from './approvalOrder';
import Company from './companyOrder';
import ItineraryOrder from './itineraryOrder';
import AboutCLB from './aboutCLB';
import Feedback from './feedback';
import CompanyItineraryOrder from './companyItineraryOrder';
import Adviser from './myAdviser';
import orderInfoById from './orderDetailById'
import TravelApplicate from '../travel/travelapplicate';
import ApprovalOrder2 from './approvalOrder2';

var {width,height} = Dimensions.get('window')
var isVis = true;

import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class Mine extends Component {
    constructor(props) {
        super(props);
        this.state={
            imgType:2,//未获取上传图片是用默认图片显示
            myInfo:this.props.My_Info,
            name:'',//用户姓名
            userAccount:'',//用户登录的账号
            accountNo:'',//用户ID
            personCode:'',//用户编号
            account:'',//用户账户
            role:'',//用户角色
            roleId:0,//用户角色ID
            department:'',//用户所属部门
            depCode:'',//用户所属部门代码
            group:'',//用户所属组
            userImg:'',//用户头像
            isWaitMe:false,//是否有审批权限显示审批模块
            orderNum:0,//全部订单未读个数
            waitAppNum:0,//待审批未读个数
            waitPayNum:0,//待支付订单个数
            waitMeAppNum:0,//待我审批信息个数
            waitTrip:'',//待出行行程个数
            isCompany:false,//是否有公司订单模块
            ActiveKeyNum:'1',
            companyID:'',//所属公司编码
            departmentCode:'',//权限部门编码
            CompanyApproveTypeID:1,
        };
    }
    getUserImg=(userInfo)=>{
        if(userInfo.Code == 0){
            this.state.accountNo = userInfo.Result.Account.AccountNo;
            this.state.personCode = userInfo.Result.Account.PersonCode;
            this.state.name = userInfo.Result.Information.FullName;
            this.state.role = userInfo.Result.Account.RoleName;
            this.state.account = userInfo.Result.Account.UserName;
            this.state.department = userInfo.Result.Company.CompanyName;
            this.state.group = userInfo.Result.Company.DepartmentName;
            this.state.roleId = userInfo.Result.Account.RoleID;
            this.state.companyID = userInfo.Result.Company.CompanyCode;
            this.state.depCode = userInfo.Result.Company.DepartmentCode;
        }

        let powerInfo = this.props.Permission;
        let orderOrganization = powerInfo.DataAccessPermissions!=null ?
                                    this.isOrderOrganization(powerInfo.DataAccessPermissions) : '';
        let orderCustom = (powerInfo.DataAccessPermissions!=null && powerInfo.AccessOUs!=null)?
                            this.isOrderCustom(powerInfo.DataAccessPermissions, powerInfo.AccessOUs):'';
        this.state.isCompany = (orderOrganization != '' || orderCustom != '') ? true : false;
        this.state.isWaitMe = powerInfo.DataAccessPermissions != null ?
                                this.isOrderSelf(powerInfo.DataAccessPermissions) : false;

        this.state.userImg = userInfo.UserImage;
        this.state.imgType = 1;
        this.setState({});
    }

    //当前组织架构下查看订单权限
    //orderArray为DataAccessPermissions节点下数组,accessOUs为AccessOUs节点下数组
    isOrderOrganization = (orderArray) => {
        for(var v of orderArray){
            if(v.SysKey == 'Order_Organization')
             return this.state.departmentCode = this.state.depCode+",";
        }
        return '';
    }

    //自定义订单查看权限
    isOrderCustom = (orderArray,accessOUs) => {
        for(var v of orderArray){
            if(v.SysKey == 'Order_Custom'){
                return this.getAccessOUs(v.ResourcePropertyID,accessOUs)
            }
        }
        return '';
    }

    //获取查看待审批权限
    isOrderSelf = (orderArray) =>{
        for(var v of orderArray){
            if(v.SysKey == 'Order_Self')
             return true;
        }
        return false;
    }

    //获取查看公司部门订单权限
    getAccessOUs = (id,accessOUs) => {
        // alert("aaa");
        for(var OUs of accessOUs){
            if(OUs.ResourcePropertyID == id)
                this.state.departmentCode = this.state.departmentCode+OUs.OUCode+",";
        }
        return this.state.departmentCode;
    }

    componentDidMount(){
        let storage = global.storage;
        storage.load({ key: 'BIZACCOUNTINFO' }).then(val =>{
            if(val!=null){
                let userInfo = JSON.parse(val).MyInfo;
                this.state.userAccount = JSON.parse(val).MyInfo.Result.Account.UserName,
                this.state.CompanyApproveTypeID = JSON.parse(val).CompanyApproveTypeID;
                this.getUserImg(userInfo);
            }
        }).catch(err => {
                console.log(err)
        });
    }
   
    render() {
        return (
            <View style={{ flex: 1,backgroundColor:COLORS.containerBg}}>
                <StatusBar
                        animated={true} 
                        hidden={false}
                        backgroundColor={'transparent'}
                        translucent={true}
                        barStyle="light-content"
                        showHideTransition={'fade'}/>
                <ScrollView>
                    <Image style={styles.imgBGStyle} source={require('../../images/my_bg.png')}>
                        <TouchableOpacity style={styles.headViewStyle} onPress={()=>this.setUpEvent()}>
                            <RadiusImage pathType={this.state.imgType}
                                imagePath={this.state.userImg}
                                radiusNum={40} imgWidth={80} imgHeight={80}/>
                            <View style={{flex:1,marginLeft:10}}>
                                <View style={{flexDirection:'row',flex:1,alignItems:'flex-end',marginTop:8}}>
                                    <Text style={{color:'#fff',fontSize:18,backgroundColor:'transparent'}}>{this.state.name}</Text>
                                    <Text style={{fontSize:14,marginLeft:10,backgroundColor:'transparent',color:'rgba(255,255,255,0.8)'}}>{this.state.role}</Text>
                                </View>

                                <View style={{flex:1,justifyContent:'center',marginTop:8,marginBottom:8}}>
                                    <Text style={{color:'rgba(255,255,255,0.8)',fontSize:14,backgroundColor:'transparent'}}>{this.state.account}</Text>
                                </View>

                                <View style={{flexDirection:'row',flex:1,}}>
                                    <Text numberOfLines={1} style={{color:'rgba(255,255,255,0.8)',fontSize:14,backgroundColor:'transparent'}}>
                                        {this.state.department+"  "+this.state.group}</Text>
                                </View>
                            </View>
                            <View style={{alignItems: 'center',justifyContent:'center'}} >
                                <Icon icon={'0xe677'} color={'#fff'} style={{fontSize: 20,marginRight:15,backgroundColor:'transparent'}} />
                            </View>
                        </TouchableOpacity>
                    </Image>
                    <View style={{width:width,height:90,backgroundColor:'#fff',flexDirection:'row',}}>
                        <TouchableOpacity style={styles.orderViewStyle} onPress={()=>this.toMyOrderEvent("1")}>
                            <View>
                                <Icon icon={'0xe68b'} color={'#333'} style={{fontSize: 30,}} />
                                {this.state.orderNum>0 ? 
                                    <Text style={styles.state}>{this.state.orderNum}</Text>
                                    : null
                                }
                            </View>
                            <Text style={styles.orderTextStyle}>{lan.allOrder}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.orderViewStyle} onPress={()=>this.toMyOrderEvent("2")}>
                            <View>
                                <Icon icon={'0xe689'} color={'#333'} style={{fontSize: 30,}} />
                                {this.state.waitAppNum>0 ? 
                                    <Text style={styles.state}>{this.state.waitAppNum}</Text>
                                    : null
                                }
                            </View>
                            <Text style={styles.orderTextStyle}>{lan.waitApproval}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.orderViewStyle} onPress={()=>this.toMyOrderEvent("3")}>
                            <View>
                                <Icon icon={'0xe687'} color={'#333'} style={{fontSize: 30,}} />
                                {this.state.waitPayNum>0 ? 
                                    <Text style={styles.state}>{this.state.waitPayNum}</Text>
                                    : null
                                }
                            </View>
                            
                            <Text style={styles.orderTextStyle}>{lan.waitPayment}</Text>
                        </TouchableOpacity>
                        
                        {this.state.isWaitMe ? 
                            <TouchableOpacity style={styles.orderViewStyle} onPress={()=>
                                this.state.CompanyApproveTypeID != 2 ?this.toApprovalOrder() : this.toApprovalOrder2()}>
                                    <View>
                                        <Icon icon={'0xe688'} color={'#333'} style={{fontSize: 30,}} />
                                        {this.state.waitMeAppNum>0 ? 
                                            <Text style={styles.state}>{this.state.waitMeAppNum}</Text>
                                            : null
                                        }
                                    </View>
                                    <Text style={styles.orderTextStyle}>{lan.waitMyApproval}</Text>
                            </TouchableOpacity>
                            : null
                        }
                    </View>

                    <View style={{marginTop:15}} >
                        <EntryBar leftText={lan.myTrip} leftColor={'#666'} clickEvent={()=>{this.toItineraryOrder()}}
                                    BorderTop={1/FLEXBOX.pixel} 
                                    rightText={this.state.waitTrip} rightColor={COLORS.btnBg} />
                        {this.state.CompanyApproveTypeID == 2 ? 
                        <EntryBar leftText={lan.businessApplication} leftColor={'#666'} 
                                    clickEvent={()=>{this.toBusinessApplication()}}/>
                        :null}
                        <EntryBar leftText={lan.consultant} leftColor={'#666'} clickEvent={()=>{this.toMyAdviser()}}
                                    rightText={lan.service} rightColor={'#999'} />
                    </View>
                    {this.state.isCompany ? 
                        <View style={{marginTop:15}}>
                            <EntryBar leftText={lan.companyOrder} leftColor={'#666'} 
                                    BorderTop={1/FLEXBOX.pixel} 
                                    clickEvent={()=>{this.toCompanyOrder()}} />
                            <View style={{width:width,backgroundColor:'#ebebeb',height:1/FLEXBOX.pixel}} />
                            <EntryBar leftText={lan.companyTrip} leftColor={'#666'} 
                                clickEvent={()=>{this.toCompanyItineraryOrder()}} />
                        </View>
                        : null
                    }
                    <View style={{marginTop:15,marginBottom:15}}>
                        <EntryBar leftText={lan.aboutCLB} leftColor={'#666'} 
                                    BorderTop={1/FLEXBOX.pixel} 
                                    clickEvent={()=>{this.toAboutCLB()}} />
                        <View style={{width:width,backgroundColor:'#ebebeb',height:1/FLEXBOX.pixel}} />
                        <EntryBar leftText={lan.feedback} leftColor={'#666'} 
                                clickEvent={()=>{this.toFeedback()}} />
                    </View>

                </ScrollView>
            </View>

        )
    }

    //设置点击事件
    setUpEvent=()=>{
        const {navigator} = this.props;
            let _this = this;
            if(navigator) {
                navigator.push({
                    name: 'MyAccount',
                    component: MyAccount,
                    passProps:{
                        myInfo:_this.state.myInfo,
                        headImg:_this.state.userImg,
                        UserAccount:this.state.userAccount,
                        RefreshView:()=>{},
                    }
                });
            }
    }

    //查看订单点击事件（全部订单、待审批、待付款）
    toMyOrderEvent = (num) =>{
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'MyOrder',
                component: MyOrder,
                passProps:{
                    ActiveKeyNum:num,
                    AccountNo: this.state.accountNo
                }
            });
        }
    }

    //查看待我审批订单
    toApprovalOrder = () => {
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'ApprovalOrder',
                component: ApprovalOrder,
                passProps:{
                    AccountNo: this.state.accountNo,
                    CompanyID:this.state.companyID,
                    CompanyApproveTypeID:this.state.CompanyApproveTypeID,
                }
            });
        }
    }

    //流程2查看待我审批订单
    toApprovalOrder2 = () => {
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'ApprovalOrder2',
                component: ApprovalOrder2,
                passProps:{
                    AccountNo: this.state.accountNo,
                    CompanyID:this.state.companyID,
                    CompanyApproveTypeID:this.state.CompanyApproveTypeID,
                    RefreshEvent1:()=>{this.state.CompanyApproveTypeID = this.state.CompanyApproveTypeID;},
                }
            });
        }
    }

    //查看公司订单
    toCompanyOrder = () => {
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'Company',
                component: Company,
                passProps:{
                    DepartmentCode:this.state.departmentCode,
                    CompanyCode:this.state.companyID,
                }
            });
        }
    }

    //查看我的行程单
    toItineraryOrder = () => {
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'ItineraryOrder',
                component: ItineraryOrder,
                passProps:{
                    AccountNo: this.state.accountNo,
                    CompanyID:this.state.companyID,
                    Visible:true,
                }
            });
        }
    }

    //查看差旅申请
    toBusinessApplication = () => {
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'TravelApplicate',
                component: TravelApplicate,
                passProps:{
                    AccountNo: this.state.accountNo,
                }
            });
        }
    }

    //查看差旅顾问
    toMyAdviser = () => {
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'Adviser',
                component: Adviser,
                passProps:{
                    CompanyCode:this.state.companyID,
                }
            });
        }
    }

    //查看公司行程单
    toCompanyItineraryOrder = () => {
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'CompanyItineraryOrder',
                component: CompanyItineraryOrder,
                passProps:{
                    AccountNo: this.state.departmentCode,
                    CompanyID:this.state.companyID,
                }
            });
        }
    }

    //关于差旅宝
    toAboutCLB = () => {
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'AboutCLB',
                component: AboutCLB,
                passProps:{
                }
            });
        }
    }

    //意见反馈
    toFeedback = () => {
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'Feedback',
                component: Feedback,
                passProps:{
                    Account:this.state.accountNo,
                }
            });
        }
    }
}

const styles = StyleSheet.create({
    imgBGStyle:{
        width:width,
        height:160,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headViewStyle:{
        width:width,
        flexDirection:'row',
        paddingLeft:10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop:20,
    },
    orderViewStyle:{
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderTextStyle:{
        marginTop:5,
        color:'#666',
        fontSize:13,
    },
    state: {
        textAlign:'center',
        color:'#fff',
    position: 'absolute',
    top: -6,
    right: -5,
    width: 17,
    height: 17,
    fontSize:11,
    borderRadius: 10,
    backgroundColor: COLORS.btnBg
  },
})