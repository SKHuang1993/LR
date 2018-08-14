import React, { Component } from 'react';
import { Tabs, Button, Toast } from 'antd-mobile';
import { COLORS } from '../../styles/commonStyle';
import {
    AppRegistry,
    Image,
    StyleSheet,
    Text,
    View,
    Navigator,
    Dimensions,
    Platform,
    BackAndroid,
    ToastAndroid,
    TouchableHighlight,
    TouchableOpacity,
    TextInput,
    NativeModules,
    StatusBar,
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import CheckBox from 'react-native-check-box'
import TabBar from '../../components/TabBar';
//import { LanguageType } from '../../utils/languageType';
import Icon from '../../components/icons/icon';
import ApplyAccount from './applyAccount';
import VerAccount from './verAccount';
import { RestAPI } from '../../utils/yqfws'
//import { storage } from '../../utils/storage';
import index from '../../pages/index';

var { width, height } = Dimensions.get('window');
const TabPane = Tabs.TabPane;
//var lan = LanguageType.setType();
let storage = global.storage;

//多语言
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class Login extends BaseComponent {
    constructor(props) {
        super(props);
        this._index = 60;//计时器倒计时60s
        this._timer = null;//计时器
        this.state = {
            loginAccunt: '',//记录登录的账号
            password: '',//记录登录的密码
            fastAccount: '',//快速登录的账号
            fastVercode: '',//快速登录的验证码
            remainTime: 60,//计时器倒计时60s
            isTouchAble: true,//判断是否给予点击
            verCodeRemind: lan.sendVerCode,
            verCodeColor: '#ccc',
            clearTxt: '',
            isCheck: true,
            checkIcon: '0xe673',//选择图标代码0xe673,未选择图标代码0xe672
            lanType: null,
            isGetDataOver: false,
            ip: '',//记录本地网络IP
            verCode: 'BizTest',
            companyName: '',//
            permission: {},
            isWait: false,
            userAccount: '',
            MyInfo: {},
            lang: lan.lang == 'EN' ? '中文' : 'EN'

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

    //发送验证码后的计时器
    countTime = () => {
        this.state.verCodeColor = '#999';
        this._timer = setInterval(() => {
            this.state.remainTime = this._index--;
            this.state.verCodeRemind = this.state.remainTime + 's ' + lan.resendVerCode;
            this.setState({});
            if (this.state.remainTime <= 0) {
                this._timer && clearInterval(this._timer);
                this.state.verCodeColor = '#333';
                this.state.verCodeRemind = lan.sendVerCode;
                this._index = 60;
                this.state.remainTime = 60;
                this.state.verCode = 'BizTest';
                this.setState({});
            }
        }, 1000);
        let param = {
            "LoginModeID": this.isMPNumber(this.state.fastAccount) ? 2 : this.isEmail(this.state.fastAccount) ? 1 : 3,
            "LoginName": this.state.fastAccount,
            "IP": this.state.ip,
            "NetID": "123456test",
            "DomainName": "yiqifei.com"
        }
        RestAPI.invoke("CRM.SecurityCodeGet", JSON.stringify(param), (test) => {
            let verInfo = test;
            if (verInfo.Code == 0) {
                // this.state.verCode = verInfo.Result.SecurityCode;
                // this.setState({});
            } else {
                Toast.info(test, 5, null, false);
            }
        }, (err) => {
            Toast.info(err, 5, null, false);
        });
    }

    //多语言切换
    changeLanguage = () => {
        if (lan.lang == 'EN') {
            this.changeLocale(zh_CN);
        } else {
            this.changeLocale(en_US);
        }
        // lan.lang == 'EN' ? this.changeLocale(zh_CN) : this.changeLocale(en_US);

    }

    render() {
        // console.log(111,lan)

        let tabNames = [lan.ordinaryLogin, lan.fastLogin];
        let tabTextSize = 16;
        let storage = global.storage;
        if (!this.state.isGetDataOver) {
            storage.load({ key: 'USERINFO' }).then(val => {
                if (val != null && !this.state.isGetDataOver) {
                    this.state.loginAccunt = JSON.parse(val).Account;
                    this.state.password = JSON.parse(val).Password;
                    this.state.isCheck = true;
                    this.state.isGetDataOver = true;
                    this.state.checkIcon = '0xe673';
                    this.setState({});
                }
            }).catch(err => {
            });
        }


        return (
            <View >
                <StatusBar
                    animated={true}
                    hidden={false}
                    backgroundColor={'transparent'}
                    translucent={true}
                    barStyle="light-content"
                    showHideTransition={'fade'}
                />

                <Image source={require('../../images/login_bg.png')} style={styles.imageBgStyle}>
                    {/*语言切换*/}
                    <TouchableOpacity style={{ top: 30, right: 20, position: 'absolute', padding: 5 }} onPress={() => this.changeLanguage()}>
                        {/*测试，先为空*/}
                        <Text style={{ color: '#fff' }}>{lan.lang == 'EN' ? ' ' : ' '}</Text>
                    </TouchableOpacity>
                    <View style={styles.iconStyle}>

                        <Image source={require('../../images/icon_biz.png')} style={{ width: 70, height: 70 }} />
                        <Text style={{ color: '#fff', fontSize: 18, marginTop: 5 }}>{lan.appName}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', }}>

                        <Text style={{ width: 8 }} />

                        <View style={styles.loginModuleStyle}>
                            <View style={styles.loginModuleItemStyle}>
                                <ScrollableTabView locked={true}
                                    renderTabBar={() => <TabBar tabNames={tabNames} tabTextSize={tabTextSize}
                                        tabChoiceColor="#fa5e5b" tabUnchoiceColor="#999" />}
                                    tabBarPosition='top' style={{ marginTop: 20 }}>
                                    <View style={{ backgroundColor: '#fff', flex: 1, }} tabLabel='key1'>

                                        <View style={styles.accountViewStyle}>
                                            <Icon icon={'0xe65c'} color={'#999'} style={{ fontSize: 18, marginBottom: 3, marginRight: 5 }} />
                                            <TextInput style={{ flex: 1, fontSize: 15, }}
                                                onChangeText={(txt) => { this.setState({ loginAccunt: txt }); }}
                                                placeholder={lan.account} placeholderTextColor='#ccc'
                                                underlineColorAndroid="transparent"
                                                value={this.state.loginAccunt}
                                                selectionColor='#333' />
                                        </View>
                                        <Text style={{
                                            marginLeft: 30, marginRight: 30, height: 0.6,
                                            backgroundColor: '#ccc', marginBottom: 8
                                        }} />

                                        <View style={styles.accountViewStyle}>
                                            <Icon icon={'0xe65e'} color={'#999'} style={{ fontSize: 18, marginBottom: 3, marginRight: 5 }} />
                                            <TextInput style={{ flex: 1, fontSize: 15, }}
                                                onChangeText={(txt) => { this.setState({ password: txt }); }}
                                                placeholder={lan.password} placeholderTextColor='#ccc'
                                                underlineColorAndroid="transparent" secureTextEntry={true}
                                                value={this.state.password}
                                                selectionColor='#333' />
                                        </View>
                                        <Text style={{
                                            marginLeft: 30, marginRight: 30, height: 0.6,
                                            backgroundColor: '#ccc', marginBottom: 10
                                        }} />

                                        <View style={styles.passwordOptStyle}>
                                            <TouchableOpacity style={{ flex: 1 }} onPress={() => this.forgetPasswordEvent()}>
                                                <Text style={{ fontSize: 13, color: '#999' }}>{lan.forgetPass}</Text>
                                            </TouchableOpacity>

                                            <View style={{
                                                flex: 1, flexDirection: 'row', alignItems: 'center',
                                                justifyContent: 'flex-end',
                                            }}>
                                                <TouchableOpacity onPress={() => this.isCheckPass()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Icon icon={this.state.checkIcon} color={'#999'} style={{ fontSize: 16, marginTop: 1 }} />
                                                    <Text style={{ fontSize: 13, color: '#999', marginLeft: 3 }}>{lan.rememberPass}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <TouchableOpacity onPress={() => this.loginEvent()}
                                            style={{ flexDirection: 'row', marginTop: 30 }}>
                                            <Text style={{ width: 30 }} />
                                            <View style={{
                                                height: 45, backgroundColor: COLORS.btnBg, alignItems: 'center',
                                                justifyContent: 'center', borderRadius: 5, flex: 1
                                            }}>
                                                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>{lan.login}</Text>
                                            </View>
                                            <Text style={{ width: 30 }} />
                                        </TouchableOpacity>


                                    </View>

                                    <View style={{ backgroundColor: '#fff', flex: 1, }} tabLabel='key2'>
                                        <View style={styles.accountViewStyle}>
                                            <Icon icon={'0xe65d'} color={'#999'} style={{ fontSize: 18, marginBottom: 1, marginRight: 5 }} />
                                            <TextInput style={{ flex: 1, fontSize: 15, }}
                                                onChangeText={(txt) => { this.state.fastAccount = txt; }}
                                                placeholder={lan.mpNumber} placeholderTextColor='#ccc'
                                                underlineColorAndroid="transparent"
                                                selectionColor='#333' keyboardType={'numeric'}
                                                clearButtonMode={'while-editing'}
                                                onChange={(txt) => this.checkSendVerCodeState(txt)} />
                                        </View>
                                        <Text style={{
                                            marginLeft: 30, marginRight: 30, height: 0.6,
                                            backgroundColor: '#ccc', marginBottom: 8
                                        }} />

                                        <View style={styles.accountViewStyle}>
                                            <Icon icon={'0xe65e'} color={'#999'} style={{
                                                fontSize: 18,
                                                marginBottom: 3, marginRight: 5
                                            }} />

                                            <TextInput style={{ flex: 1, fontSize: 15, }}
                                                onChangeText={(txt) => { this.state.fastVercode = txt; }}
                                                placeholder={lan.verCode} placeholderTextColor='#ccc'
                                                underlineColorAndroid="transparent"
                                                keyboardType={'numeric'}
                                                selectionColor='#333' />
                                            <TouchableOpacity disabled={this.state.isTouchAble} onPress={() => this.countTime()}>
                                                <Text style={{
                                                    fontSize: 14, textAlign: 'center', marginRight: 3,
                                                    color: this.state.verCodeColor
                                                }}>
                                                    {this.state.verCodeRemind}</Text>
                                            </TouchableOpacity>

                                        </View>
                                        <Text style={{
                                            marginLeft: 30, marginRight: 30, height: 0.6,
                                            backgroundColor: '#ccc', marginBottom: 30
                                        }} />

                                        <TouchableOpacity onPress={() => this.fastLoginEvent()}
                                            style={{ flexDirection: 'row', flex: 0.5, }}>
                                            <Text style={{ width: 30 }} />
                                            <View style={{
                                                height: 45, backgroundColor: COLORS.btnBg, alignItems: 'center',
                                                justifyContent: 'center', borderRadius: 5, flex: 1
                                            }}>
                                                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>{lan.login}</Text>
                                            </View>
                                            <Text style={{ width: 30 }} />
                                        </TouchableOpacity>

                                    </View>
                                </ScrollableTabView>
                            </View>
                        </View>

                        <Text style={{ width: 8 }} />
                    </View>
                    {/* <View style={{ flex: 0.8 }}></View> */}
                    <View style={{ marginBottom: 30, flexDirection: 'row', width: width,marginTop:-100 }}>
                        <TouchableOpacity onPress={this.applyAccountEvent.bind(this)} style={{ flex: 1.1, height: 20 }}>
                            <Text style={styles.bottomLeftTextStyle}>{lan.noAccount + lan.applyAccount}</Text>
                        </TouchableOpacity>
                    </View>
                </Image>
            </View>
        )
    }

    //登录点击事件
    loginEvent = () => {
        if (this.state.loginAccunt.length == '' || this.state.password == '') {
            Toast.info(lan.userCodeOrPass, 3, null, false);
            return;
        }
        var logType = 1;
        if (this.isMPNumber(this.state.loginAccunt)) {
            logType = 2;
        } else if (this.isEmail(this.state.loginAccunt)) {
            logType = 1;
        } else {
            logType = 4;
        }

        var param = {
            "Account": this.state.loginAccunt,
            "Password": this.state.password,
            "AccountType": logType,
            "OrganizaType": "US4",
        };

        Toast.loading(lan.logining, 60, () => {
            Toast.info(lan.loginFail, 3, null, false);
        });
        RestAPI.invoke('CRM.AccountLogin', JSON.stringify(param), (test) => {
            try {
                var userInfo = test;
                if (userInfo.Code == 0) {

                    if (userInfo.Result.Name == '超级管理员') {
                        Toast.info('超级管理员账号暂无权限登录手机版！', 3, null, false);
                    } else if (userInfo.Result.OrganizaType == 'US4') {

                        this.state.userAccount = this.state.loginAccunt;
                        let myInfo = {
                            "Account": this.state.loginAccunt,
                            "Password": this.state.isCheck ? this.state.password : '',
                            "AccountNo": userInfo.Result.AccountNo,
                            "Name": userInfo.Result.Name
                        };
                        this.getPersonCode(myInfo);
                    } else {
                        Toast.info('此账号非差旅账号，请确认！', 3, null, false);
                    }

                } else {
                    Toast.hide();
                    Toast.info(JSON.stringify(test.Msg), 3, null, false);
                }
            } catch (err) {
                Toast.hide();
                Toast.info(err, 3, null, false);
            }
        }, (err) => {
            Toast.hide();
            Toast.info(err, 3, null, false);
        });
    }

    //登录后获取personCode
    getPersonCode = (myInfo) => {
        let param = {
            "UserCode": "",
            "OrganizaType": "US4",
            "Condition": this.state.loginAccunt
        }
        RestAPI.invoke('CRM.UserLoginByCondition', JSON.stringify(param), (test) => {
            try {
                var userInfo = test;
                if (userInfo.Code == 0) {
                    Toast.hide();
                    myInfo.PersonCode = userInfo.Result.User.PersonCode;
                    let storage = global.storage;
                    storage.save({
                        key: 'USERINFO',
                        rawData: JSON.stringify(myInfo)
                    });
                    this.props.navigator.replace({
                        name: 'index',
                        component: index,
                        passProps: {
                            IsLogin: true,
                        }
                    })
                } else {
                    Toast.hide();
                    Toast.info(JSON.stringify(test.Msg), 3, null, false);
                }
            } catch (err) {
                Toast.hide();
                Toast.info(err, 3, null, false);
            }
        }, (err) => {
            Toast.hide();
            Toast.info(err, 3, null, false);
        });
    }


    //快速登录
    fastLoginEvent = () => {
        if (this.state.fastVercode == "") {
            Toast.info(lan.verCodeErr, 3, null, false);
            return;
        }
        let param = {
            "LoginModeID": this.isMPNumber(this.state.fastAccount) ? 2 : this.isEmail(this.state.fastAccount) ? 1 : 3,
            "LoginName": this.state.fastAccount,
            "SecurityCode": this.state.fastVercode,
            "LoginIp": this.state.ip,
            "OrganizaType": "US4",
        }
        Toast.loading(lan.logining, 60, () => {
            Toast.info(lan.loginFail, 3, null, false);
        });
        RestAPI.invoke("CRM.UserLoginBySecurityCodeGet", JSON.stringify(param), (test) => {
            let userInfo = test;
            Toast.hide();
            if (userInfo.Code == 0) {
                alert(11)
                console.log('用户numer', userInfo.Result);
                if (userInfo.Result.Name == '超级管理员') {
                    Toast.info('超级管理员账号暂无权限登录手机版！', 3, null, false);
                } else if (userInfo.Result.OrganizaType == 'US4') {
                    let storage = global.storage;
                    let myInfo = {
                        "Account": this.state.fastAccount,
                        "Password": userInfo.Result.Password,
                        "AccountNo": userInfo.Result.AccountNo,
                        "PersonCode": userInfo.Result.PersonCode,
                        "Name": userInfo.Result.Name
                    };
                    storage.save({
                        key: 'USERINFO',
                        rawData: JSON.stringify(myInfo)
                    });
                    //极光推送
                    // NativeModules.MyNativeModule.jpushLogin({ tags: ['user'], alias: userInfo.Result.AccountNo })
                    // .then((datas) => {
                    //     console.log("jpush success");;
                    // })
                    // .catch((error) => {

                    // });
                    this.props.navigator.replace({
                        name: 'index',
                        component: index,
                        passProps: {
                            IsLogin: true,
                        }
                    })

                } else {
                    Toast.info('此账号非差旅账号，请确认！', 3, null, false);
                }
            } else {
                Toast.info(test.Msg, 3, null, false);
            }
        }, (err) => {
            Toast.info(err, 3, null, false);
        });
    }

    getAccountInfo = (personCode) => {
        let param = {
            "Person": personCode,
            "OrganizaType": "US4",
            "OperateID": null
        }
        RestAPI.invoke("Biz3.BizPersonGet", JSON.stringify(param), (test) => {
            if (test.Code == 0) {
                this.state.MyInfo = test;
                this.state.companyName = test.Result.Company.CompanyName;
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
            "Account": test.Result.Account.AccountNo
        }
        RestAPI.invoke("Base.UserFaceGet", JSON.stringify(param), (value) => {
            let userInfo = value;
            if (userInfo.Code == 0) {
                test.UserImage = 'http://img2.yiqifei.com' + userInfo.Result.Path;
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
        let param = {
            "RoleID": test.Result.Account.RoleID
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
                this.state.permission = powerInfo;
                this.state.isWait = this.isOrderSelf(powerInfo.Result.DataAccessPermissions);
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
                    "MyInfo": test
                }
                let storage = global.storage;
                global.userInfo = aInfo;
                storage.save({
                    key: 'BIZACCOUNTINFO',
                    rawData: JSON.stringify(aInfo)
                });
                const { navigator } = this.props;
                if (navigator) {
                    navigator.replace({
                        name: 'index',
                        component: index,
                        passProps: {
                            My_Info: test,
                            Company_Name: this.state.companyName,
                            _IsWait: this.state.isWait,
                            UserAccount: this.state.userAccount,
                            Permission: powerInfo.Result
                        }
                    })
                }
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

    //申请入驻点击事件
    applyAccountEvent = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.push({
                name: 'ApplyAccount',
                component: ApplyAccount,
            })
        }
    }

    //忘记密码点击事件
    forgetPasswordEvent = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.push({
                name: 'VerAccount',
                component: VerAccount,
            })
        }
    }

    //是否记住密码
    isCheckPass = () => {
        if (this.state.isCheck) {
            this.state.isCheck = false;
            this.state.checkIcon = '0xe672';
            this.setState({
            });
        } else {
            this.state.isCheck = true;
            this.state.checkIcon = '0xe673';
            this.setState({
            });
        }
    }

    //检测“发送验证码”按钮的状态
    checkSendVerCodeState = (txt) => {
        this.state.clearTxt = txt.nativeEvent.text;
        if (txt.nativeEvent.text.length == 11) {
            if (this.isMPNumber(txt.nativeEvent.text)) {
                this.state.isTouchAble = false;
                this.state.verCodeColor = '#333';
                this.setState({});
            }
        }
        if (txt.nativeEvent.text.length != 11 && !(this.state.isTouchAble)) {
            this.state.isTouchAble = true;
            this.state.verCodeColor = '#ccc';
            this.setState({});
        }
    }

    //快速登录界面清空‘手机号码’框
    clearTextInoutTxt = () => {
        this.state.isTouchAble = true;
        this.state.verCodeColor = '#ccc';
        this.state.clearTxt = '';
        this.setState({});
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
    // componentWillMount 多语言切换冲突 改   componentDidMount
    // componentDidMount() {
    //     if (Platform.OS === 'android') {
    //         BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
    //     };
    // }



    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
        }
    }
    onBackAndroid = () => {
        if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
            return false;
        }
        this.lastBackPressed = Date.now();
        ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
        return true;
    }
}


const styles = StyleSheet.create({
    imageBgStyle: {
        width: width,
        height: height,
        //flex:1,
        alignItems: 'center',
    },
    iconStyle: {

        width: 100,
        height: 100,
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginModuleStyle: {
        flex: 1,
        height: 450,
        marginTop: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    loginModuleItemStyle: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#fff',
        flexDirection: 'row',
    },
    bottomLeftTextStyle: {
        fontSize: 13,
        color: COLORS.titleBar,
        textAlign: 'center',
    },
    bottomRightTextStyle: {
        fontSize: 13,
        color: COLORS.titleBar,
        textAlign: 'left',
    },
    loginTypeStyle: {
        textAlign: 'center',
        color: COLORS.btnBg,
        fontSize: 16,
    },
    noLoginTypeStyle: {
        textAlign: 'center',
        color: '#999',
        fontSize: 16,
    },
    accountViewStyle: {
        marginLeft: 30,
        marginRight: 30,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordOptStyle: {
        alignItems: 'center',
        marginLeft: 30,
        marginRight: 30,
        flexDirection: 'row',
    },
})
