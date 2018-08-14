/**
 * Created by yqf on 17/2/10.
 */


import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Platform,   // 判断当前运行的系统
    Navigator,
    BackAndroid,
    ToastAndroid,
    NativeModules,
} from 'react-native';
import { Toast } from 'antd-mobile';
import TabNavigator from 'react-native-tab-navigator';
import { COLORS, FLEXBOX } from '../styles/commonStyle';
import Icon from '../components/icons/icon';
import { RestAPI } from '../utils/yqfws';

import Home from './home';
import Journey from './journey/';

// import News from '../im1/chatList';

import News from '../pages/news/';

import Account from './account/index';
import { BaseComponent, en_US, zh_CN } from '../components/locale';
var lan = BaseComponent.getLocale();
import { Chat } from '../utils/chat';
import { observer } from 'mobx-react/native';
import { observable } from 'mobx';
import Badge from '../components/badge';

@observer
export default class Index extends Component {

    // state = {
    //     selectedTab: 'home', // 默认是第一个
    // }
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: this.props.IsLogin ? '' : 'home', // 默认是第一个
            accountNo: '',
            myInfo: this.props.IsLogin ? {} : this.props.My_Info,
            personCode: '',
            companyName: this.props.IsLogin ? '' : this.props.Company_Name,
            roleId: '',
            permission: this.props.IsLogin ? {} : this.props.Permission,
            isWait: this.props.IsLogin ? false : this.props._IsWait,
            userImg: '',
            userAccount: this.props.IsLogin ? '' : this.props.UserAccount,
            companyCode: this.props.IsLogin ? '' : this.props.Company_Code,
            companyApproveTypeID: this.props.IsLogin ? '' : this.props.CompanyApproveTypeID,
            isTrain: this.props.IsLogin ? false : this.props._IsTrain,
            isHotel: this.props.IsLogin ? false : this.props._IsHotel,
        }
    }

    componentDidMount() {
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
        }
    }

    getAccountInfo = () => {
        let param = {
            "Person": this.state.personCode,
            "OrganizaType": "US4",
            "OperateID": null
        }
        Toast.loading(lan.loading, 60, () => {
            Toast.info(lan.loadingFailed, 3, null, false);
        });
        RestAPI.invoke("Biz3.BizPersonGet", JSON.stringify(param), (test) => {
            if (test.Code == 0) {
                this.state.myInfo = test;
                this.state.companyName = test.Result.Company.CompanyName;
                this.state.companyCode = test.Result.Company.CompanyCode;
                this.state.companyApproveTypeID = test.Result.Information.CompanyApproveTypeID;
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
            let storage = global.storage;
            global.userInfo = aInfo;
            storage.save({
                key: 'BIZACCOUNTINFO',
                rawData: JSON.stringify(aInfo)
            });
            this.setState({ selectedTab: 'home' });
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
                let storage = global.storage;
                global.userInfo = aInfo;
                storage.save({
                    key: 'BIZACCOUNTINFO',
                    rawData: JSON.stringify(aInfo)
                });
                this.setState({ selectedTab: 'home' });
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

    render() {
        return (
            <TabNavigator>
                {/*--首页--*/}
                {this.renderTabBarItem(lan.home_nav_home, 0xe667, 0xe666, 'home', '主页', Home)}
                {/*--行程--*/}
                {this.renderTabBarItem(lan.home_nav_journey, 0xe66c, 0xe668, 'journey', '问答', Journey)}
                {/*--消息--*/}
                {this.renderTabBarItem(lan.home_nav_news, 0xe66b, 0xe669, 'news', '消息', News)}
                {/*--我的--*/}
                {this.renderTabBarItem(lan.home_nav_user, 0xe66d, 0xe66a, 'mine', '我的', Account)}
            </TabNavigator>

        );
    }

    getIcon = (code, color) => {
        return <Icon icon={code} color={color} style={{ fontSize: 23 }} />
    }



    // 每一个TabBarItem
    renderTabBarItem(title, iconCode, selectedIconCode, selectedTab, componentName, component, badgeText) {
        let Component = component;
        return (
            <TabNavigator.Item
                title={title}
                renderIcon={() => this.getIcon(iconCode, '#999999')} // 图标
                renderSelectedIcon={() => this.getIcon(selectedIconCode, '#159E7D')}   // 选中的图标
                onPress={() => { this.setState({ selectedTab: selectedTab }) }}
                selected={this.state.selectedTab === selectedTab}
                selectedTitleStyle={styles.TabNaviSelectedTitle}
                badgeText={selectedTab == "news" ? Chat.obj.totalUnReadMessage : null}
                renderBadge={() => selectedTab == "news" && Chat.obj.totalUnReadMessage > 0 ? <View style={styles.badge}><Text style={{ color: '#fff', fontSize: 12 }}>{Chat.obj.totalUnReadMessage}</Text></View> : null}
            >
                <Component navigator={this.props.navigator}
                    My_Info={this.state.myInfo}
                    Company_Name={this.state.companyName}
                    Company_Code={this.state.companyCode}
                    _IsWait={this.state.isWait}
                    UserAccount={this.state.userAccount}
                    Permission={this.state.permission} />
                {/*<Navigator
                    initialRoute={{ name: componentName, component: component }}
                    configureScene={() => {// 过渡动画
                        return Navigator.SceneConfigs.PushFromRight;
                    }}
                    renderScene={(route, navigator) => {
                        let Component = route.component;
                        return <Component {...route.passProps} navigator={navigator} />;
                    }}
                />*/}

            </TabNavigator.Item>
        )
    }

    // componentWillMount() {
    //     if (Platform.OS === 'android') {
    //         BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
    //     };
    // }

    // componentWillUnmount() {
    //     if (Platform.OS === 'android') {
    //         BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
    //     }
    // }
    // onBackAndroid = () => {
    //     if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
    //         return false;
    //     }
    //     this.lastBackPressed = Date.now();
    //     ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
    //     return true;
    // }

}




const styles = StyleSheet.create({
    TabNaviSelectedTitle: {
        color: COLORS.primary
    },
    badge: {
        backgroundColor: "#ff5b05", paddingHorizontal: 5, borderRadius: 20, overflow: 'hidden'

    }
});
