/**
 * Created by yqf on 2017/11/17.
 */
//tab

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    BackAndroid,
    TouchableOpacity,
    Alert,
    StatusBar,
    NativeModules,
    BackHandler
} from 'react-native';

import { COLORS, FLEXBOX } from './styles/commonStyle';
import { Toast } from 'antd-mobile';
import TabNavigator from 'react-native-tab-navigator';
import Icon from './components/icon';
import ChatList from './pages/Chat/ChatList';
import Contacts from './pages/Contact/Contacts'
import Profile from './pages/Profile/Profile'
import Desk from './pages/Desk/Desk'
import {Chat} from '../IM/utils/chat'
import { RestAPI } from '../IM/utils/yqfws';
import {AccountInfo} from '../utils/data-access/account'

import { extendObservable, action, computed, toJS, observable,autorun } from 'mobx';
import { observer } from 'mobx-react/native';


@observer

export  default  class  Index extends  Component {

    constructor(props){
        super(props);
        this.state={
            selectedTab: 'Desk', // 默认是第一个
            isWait: false,
            isTrain: false,
            isHotel: false,
            accountNo: '',
            myInfo: {},
            personCode: '',
            userAccount: '',
            permission:{},
            roleId: '',
        }

    }

    fetchData = async()=>{


    }

    componentWillUnmount = ()=>{

        // if(Platform.OS === "android") {
        //     BackHandler.removeEventListener('hardwareBackPress', ()=>{});
        // }

    }

    componentDidMount = ()=>{
        let _this = this;
        // if(Chat.isAndroid()){
        //     BackHandler.addEventListener('hardwareBackPress', function () {
        //         if (_this.navigator && _this.navigator.getCurrentRoutes().length > 1) {
        //             // console.log('这是在Index页面点击了BackHandler,返回到上一级.getCurrentRoutes().length > 1')
        //             _this.navigator.pop();
        //             return true;
        //         } else {
        //             BackHandler.exitApp();
        //             return false;
        //         }
        //     });
        // }

        if (this.props.IsLogin) {
            let storage = global.storage;
            storage.load({ key: 'USERINFO' }).then(val => {
                if (val != null) {
                    let userInfo = JSON.parse(val);
                    this.state.userAccount = userInfo.Account;
                    this.state.accountNo = userInfo.AccountNo;
                    this.state.personCode = userInfo.PersonCode;
                    this.getAccountInfo();
                }
            }).catch(err => {
                console.log(err)
            });
        }else Toast.loading();
        storage.load({ key: 'BIZACCOUNTINFO' }).then(val => {
            if (val != null) {
                Toast.hide();
                AccountInfo.setUserInfo(JSON.parse(val))
                this.fetchData();
            }
        }).catch(err => {
            console.log(err)
        });
    }


    render(){
        return this.renderTab();
    }

    renderTab= ()=>{

        return(

            <TabNavigator>

                {this.renderTabBarItem('消息', '0xe16b', '0xe16b', 'ChatList', '消息', ChatList)}
                {this.renderTabBarItem('通讯录', '0xe15c', '0xe15c', 'Contacts', '通讯录', Contacts)}
                {this.renderTabBarItem('工作台', '0xe6bd','0xe6bd', 'Desk', '工作台', Desk)}
                {this.renderTabBarItem('我', '0xe17a', '0xe17a', 'Profile', '我', Profile)}

            </TabNavigator>

        );

    }


    _renderBadge = (selectedTab)=>{

        if(selectedTab == 'ChatList' && Chat.obj.totalUnReadMessage > 0){
            return(
                <View style={styles.badge}><Text style={{ color: '#fff', fontSize: 12 }}>{Chat.obj.totalUnReadMessage}</Text></View>
            )
        }
        else if(selectedTab == 'Contacts' && Chat.obj.totalUnReadMessage > 0){
            return(
                <View style={styles.badge}><Text style={{ color: '#fff', fontSize: 12 }}>{Chat.obj.totalUnReadMessage}</Text></View>
            )
        }

    }


    renderTabBarItem(title, iconCode, selectedIconCode, selectedTab, componentName, component, badgeText) {
        let Component = component;
        return (
            <TabNavigator.Item
                title={title}
                renderIcon={() => this.getIcon(iconCode, '#999999')} // 图标
                renderSelectedIcon={() => this.getIcon(selectedIconCode, '#162840')}   // 选中的图标
                onPress={() => { this.setState({ selectedTab: selectedTab }) }}
                selected={this.state.selectedTab === selectedTab}
                selectedTitleStyle={styles.TabNaviSelectedTitle}
                badgeText={selectedTab=="ChatList" ? Chat.obj.totalUnReadMessage :selectedTab=="Contacts" ?  Chat.obj.totalFriendPendingCount : null  }
                renderBadge={()=>selectedTab == 'ChatList' && Chat.obj.totalUnReadMessage > 0 ?
                <View style={styles.badge}><Text style={{ color: '#fff', fontSize: 12 }}>{Chat.obj.totalUnReadMessage}</Text></View>
                :

                selectedTab == 'Contacts'  && Chat.obj.totalFriendPendingCount > 0 ?
                <View style={styles.badge}><Text style={{ color: '#fff', fontSize: 12 }}>{Chat.obj.totalFriendPendingCount}</Text></View>
                :

                null}
            >
                <Component navigator={this.props.navigator}/>

            </TabNavigator.Item>
        )
    }

    getIcon = (code, color) => {
        return <Icon icon={code} color={color} style={{ fontSize: 23 }} />
    }



    getAccountInfo = () => {
        let param = {
            "Person": this.state.personCode,
            "OrganizaType": "US4",
            "OperateID": null
        }
        Toast.loading("加载中...", 60, () => {
            Toast.info("加载超时", 3, null, false);
        });
        RestAPI.invoke("Biz3.BizPersonGet", JSON.stringify(param), (test) => {
            if (test.Code == 0) {
                this.state.myInfo = test;
                this.getUserImg(test);
            } else {
                Toast.info(test.Msg, 3, null, false);
            }
        }, (err) => {
            Toast.info(err, 3, null, false);
        })
    }

    //获取用户头像
    getUserImg = (test) => {
        let param = {
            "Account": this.state.accountNo
        }
        RestAPI.invoke("Base.UserFaceGet", JSON.stringify(param), (value) => {
            let userInfo = value;
            if (userInfo.Code == 0) {
                this.state.myInfo.UserImage = 'http://img2.yiqifei.com' + userInfo.Result.Path;
                this.getUserPermission(test);
            } else {
                this.getUserPermission(test);
                Toast.info(value.Msg, 3, null, false);
            }
        }, (err) => {
            Toast.info(err, 3, null, false);
        })
    }

    //获取账户权限
    getUserPermission = (test) => {
        if (test.Result.Account.RoleID == null) {
            Toast.hide();
            let aPhone = '';
            let aEmail = '';
            let isMP = false;
            if (test.Result.Annts != null) {
                for (var v of test.Result.Annts) {
                    if (v.Name == 'PHONE' && !isMP) {
                        aPhone = v.Value;
                        isMP = true;
                    } else if (v.Name == 'EMAIL') aEmail = v.Value;
                }
            }
            this.state.isWait = false;
            let aInfo = {
                "Account": test.Result.Account.AccountNo,
                "CorpCode": test.Result.Company.CompanyCode,
                "CorpName": test.Result.Company.CompanyName,
                "DeptCode": test.Result.Company.DepartmentCode,
                "DeptName": test.Result.Company.DepartmentName,
                "EmpCode": test.Result.Account.PersonCode,
                "EmpName": test.Result.Information.FullName,
                "FirstNameEn": test.Result.Information.FirstNameEn,
                "LastNameEn": test.Result.Information.LastNameEn,
                "Sex": test.Result.Information.Sex,
                "Email": aEmail,
                "Phone": aPhone,
                "Tel": test.Result.Account.Mobile != null ? test.Result.Account.Mobile :
                    test.Result.Account.Email != null ? test.Result.Account.Email : "",
                "PolicyDetail": test.Result.PolicyDetail,
                "Permission": {},
                "IsWait": this.state.isWait,
                "CompanyApproveTypeID": test.Result.Information.CompanyApproveTypeID,
                "MyInfo": test
            }
            AccountInfo.setUserInfo(aInfo)
            let storage = global.storage;
            storage.save({
                key: 'BIZACCOUNTINFO',
                rawData: JSON.stringify(aInfo)
            });
            return;
        }
        this.state.roleId = test.Result.Account.RoleID;
        let param = {
            "RoleID": this.state.roleId
        }
        RestAPI.invoke("Base.AccessPermissionByRoleIDGet", JSON.stringify(param), (value) => {
            let powerInfo = value;
            Toast.hide();
            if (powerInfo.Code == 0) {
                let aPhone = '';
                let aEmail = '';
                let isMP = false;
                if (test.Result.Annts != null) {
                    for (var v of test.Result.Annts) {
                        if (v.Name == 'PHONE' && !isMP) {
                            aPhone = v.Value;
                            isMP = true;
                        } else if (v.Name == 'EMAIL') aEmail = v.Value;
                    }
                }
                this.state.permission = powerInfo.Result;
                this.state.isWait = this.isOrderSelf(powerInfo.Result.DataAccessPermissions);
                this.state.isTrain = this.isTrainPower(powerInfo.Result.DataAccessPermissions);
                this.state.isHotel = this.isHotelPower(powerInfo.Result.DataAccessPermissions);
                let aInfo = {
                    "Account": test.Result.Account.AccountNo,
                    "CorpCode": test.Result.Company.CompanyCode,
                    "CorpName": test.Result.Company.CompanyName,
                    "DeptCode": test.Result.Company.DepartmentCode,
                    "DeptName": test.Result.Company.DepartmentName,
                    "EmpCode": test.Result.Account.PersonCode,
                    "EmpName": test.Result.Information.FullName,
                    "FirstNameEn": test.Result.Information.FirstNameEn,
                    "LastNameEn": test.Result.Information.LastNameEn,
                    "Sex": test.Result.Information.Sex,
                    "Email": aEmail,
                    "Phone": aPhone,
                    "Tel": test.Result.Account.Mobile != null ? test.Result.Account.Mobile :
                        test.Result.Account.Email != null ? test.Result.Account.Email : "",
                    "PolicyDetail": test.Result.PolicyDetail,
                    "Permission": powerInfo.Result,
                    "IsWait": this.state.isWait,
                    "IsTrain": this.state.isTrain,
                    "IsHotel": this.state.isHotel,
                    "CompanyApproveTypeID": test.Result.Information.CompanyApproveTypeID,
                    "MyInfo": test
                }
                AccountInfo.setUserInfo(aInfo)
                let storage = global.storage;
                storage.save({
                    key: 'BIZACCOUNTINFO',
                    rawData: JSON.stringify(aInfo)
                });
            } else {
                Toast.info(value.Msg, 3, null, false);
            }
        }, (err) => {
            Toast.info(err, 3, null, false);
        })
    }

    //获取查看待审批权限
    isOrderSelf = (orderArray) => {
        for (var v of orderArray) {
            if (v.SysKey == 'Order_Self')
                return true;
        }
        return false;
    }

    //是否有订火车票的权限
    isTrainPower = (orderArray) => {
        for (var v of orderArray) {
            if (v.SysKey == 'ProductBooking_Train')
                return true;
        }
        return false;
    }

    //是否有订酒店的权限
    isHotelPower = (orderArray) => {
        for (var v of orderArray) {
            if (v.SysKey == 'ProductBooking_Hotel')
                return true;
        }
        return false;
    }

    componentWillMount() {
        if (Platform.OS === 'android') {
            BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
        }
    }
    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
        }
    }
    onBackAndroid = () =>{
    }

}


const styles = StyleSheet.create({
    TabNaviSelectedTitle: {
        color: COLORS.primary
    },
    badge: {
        backgroundColor: "#ff5b05", paddingHorizontal: 5, borderRadius: 20, overflow: 'hidden'

    }
});

