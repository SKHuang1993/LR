/**
 * Created by yqf on 2017/11/16.
 */
//LR登陆界面

import { observer } from 'mobx-react/native';
import {observable, autorun,computed, extendObservable, action, toJS } from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ListView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    InteractionManager,
    Dimensions,
    RefreshControl,
    NativeAppEventEmitter,
    AsyncStorage,
    TouchableWithoutFeedback,
    CameraRoll,
    DeviceEventEmitter,
    TextInput,
    Keyboard,
    Switch,
    Alert,
    ActivityIndicator,
} from  'react-native';

import { Tabs, Button, Toast } from 'antd-mobile';

import { COLORS, FLEXBOX } from './styles/commonStyle';
import {IM} from './utils/data-access/im'
import {RestAPI,ServingClient} from './utils/yqfws'
import {Chat} from './IM/utils/chat';

import Index from './IM/index';
import Profile from './IM/pages/Profile/Profile';
import Icon from './components/icons/icon'
import SplashScreen from 'react-native-splash-screen';
import TabBar from './components/TabBar'
import ScrollableTabView from 'react-native-scrollable-tab-view';




import md5 from 'md5'
var { width, height } = Dimensions.get('window');


const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}


const SignInInfosArray=[
    '成全',
    '验证码不正确','账号已失效','人员资料已禁用','密码不正确','登陆失败次数超过3次（1小时内）',
    '未绑定邮箱地址','未绑定手机号码','会员卡号不正确','登陆名不正确','账号代码不正确',
    '账号号码不正确','无效登陆'
]



class  LoginModel extends  Component{


    @observable account='';//账号
    @observable password='';//密码
    @observable remember=true;//是否记住密码
    @observable SecurityCode = '发送验证码';


    @observable isLoading =true;
    @observable selectIndex = 0;


    //0代表普通登录；1代表手机验证码登录

    @observable titleArray=[
        {name:'普通登录',select:true},
        {name:'快速登录',select:false},
    ];

    @computed get getTitleDataSource(){

        ds1 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds1.cloneWithRows(this.titleArray.slice());
    }


}


@observer

export default  class Login extends Component{

    constructor(props){
        super(props);

        this.store = new LoginModel()


        this._index = 60;//计时器倒计时60s
        this._timer = null;//计时器

        this.state={


            loginType:1,//登录模式 1代表普通登录，2代表手机验证码登录
            loadingText:"登录中...",

            account:'',
            password:'',
            remember:true,
            isLogin:false,
            users:null,
            currentUser:null,
            isLogining:false,//是否在登陆中
            LoginResult:null,
            isCheck:true,
            checkIcon:'0xe673',

            //这里兼容快速登录
            fastAccount:'',////快速登录的账号
            fastVercode: '',//快速登录的验证码
            remainTime: 60,//计时器倒计时60s
            verCodeRemind: "发送验证码",
            verCodeColor: '#ccc',
            clearTxt: '',
            ip: '',//记录本地网络IP



        }
    }


    /***---------------------life style-----------------------------------------------**/

    componentDidMount = ()=>{

        SplashScreen.hide();//android need
        var _this = this;
        Chat.storage.load({
            key:"ACCOUNTNO"
        }).then((ret)=>{
            if(ret){

              //  console.log("登录页面进来的时候加载缓存东西")



                if(ret.isCheck==true){
                    this.setState({
                        account:ret.UserName,
                        password:ret.password
                    })
                }
                else {
                    this.setState({
                        account:ret.UserName,
                    })
                }
            }
        },(error)=>{

            _this.setState({
                account:'',
                password:'',
            })
        })



        fetch("http://pv.sohu.com/cityjson?ie=utf-8").then((res) => {
            res.text().then((text) => {
                let reg = new RegExp('(\\d+)\.(\\d+)\.(\\d+)\.(\\d+)');
                let arr = reg.exec(text);
                this.state.ip = arr[0];
            })
        });


    }

    componentWillUnmount() {
        this._timer && clearInterval(this._timer);
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





    checkPhoneNumber=(phoneNum)=> {

        var reg = /^1[3|4|5|7|8][0-9]{9}$/;
        var flag = reg.test(phoneNum); //true
        return flag;
    }




    /**
     * 通过用户UserCode获取用户资料
     *
     * */
    getUserInfo=async()=> {


        //新接口是CRM.AccountInfoByUserCode
        var AccountNo = this.state.LoginResult.SignInInfos[0].UserCode;
        var method='CRM.AccountInfoByUserCode';
        var paramter={
            UserCodes:AccountNo,
        };


        //设置好userAgent
        Chat.setUserAgent(AccountNo,(test)=>{
        },(error)=>{
        });



        let response = await ServingClient.execute(method,paramter);



        var AccountInfo = response.AccountInfos[0]

        var temp = this.state.LoginResult;

        var DetailInfo = {

        Names: AccountInfo.PersonName,
        LoginName: AccountInfo.UserName,
        PassWord: AccountInfo.UserPwd,//这个地方考虑要存明文密码还是暗文密码
        FirstNameCn: AccountInfo.FirstNameCN,
        LastNameCn:AccountInfo.LastNameCN,
        FirstNameEn: AccountInfo.FirstNameEN,
        LastNameEn: AccountInfo.LastNameEN,
        AccountNo: AccountInfo.UserCode,// "VBL00T54"
        Birthday:AccountInfo.Birthday,//1900-01-01T00:00:00
        Sex:AccountInfo.Sex ,//"F"
        StaffWorkPhone:AccountInfo.StaffWorkPhone,//"18520033022"
        Email:AccountInfo.Email,//"HS010135@yiqifei.cn"
        CompanyCode: AccountInfo.CompanyCode,//"3007F"
        CompanyName: AccountInfo.CompanyName,//广州市中航服商务管理有限公司
        Department:AccountInfo.DepartmentCode ,//3007F0N
        DepartmentName: AccountInfo.DepartmentName,//网络中心
        TeamCode:AccountInfo.TeamCode,//3007F0N01
        TeamName:AccountInfo.TeamName,//网络中心一组
        CompanyNo: AccountInfo.CompanyNr,//CAN999
        DepartmentNo: AccountInfo.DepartmentNr,//HS001
        Person: AccountInfo.PersonCode ,//VBK036D9
        OrganizaType: AccountInfo.OUSubTypeCode,//INCU
        IsVirtual:AccountInfo.IsVirtualAcount,//false
        ShareCode: AccountInfo.FirstNameEN,//UJLS9J
        PetName: AccountInfo.PetName,// "iOS_Test"
        SourceTypeCode: AccountInfo.SourceTypeCode,//1
        SourceTypeName: AccountInfo.SourceTypeName,//系统
        AccountRegDate: AccountInfo.UserRegDate,//"2015-12-31T11:57:01.187
        Intro: " ",//为什么这里会缺Intro？。。。
        UserLogo:AccountInfo.UserLogo ,///20180402/285931bc4b5d4d3f8e3134861d415a28.jpg
        Title: AccountInfo.Title,//一起飞®国际旅行顾问
        CompanyAdminUserCode: AccountInfo.CompanyAdminUserCode,//CMC0366F
        }

        var temp = this.state.LoginResult;



        //普通登录
        if(this.state.loginType==1){

            temp.UserName=temp.SignInInfos[0].UserNr;


            if(this.state.isCheck){
                temp.isCheck = true;
                temp.password = this.state.password;


            }else {

                temp.isCheck = false;
                temp.password = this.state.password;
            }

        }else {

            //手机验证码登录

            temp.isCheck = false;
            temp.password = '';

        }

        temp.DetailInfo = DetailInfo;
        temp.ACAccountNo=AccountNo;
        temp.AccountNo =AccountNo;
        temp.Email=AccountInfo.Email;
        temp.Name=AccountInfo.PersonName;
        temp.OrganizaType=AccountInfo.OUSubTypeCode;
        temp.PersonCode=AccountInfo.PersonCode;
        temp.Role=AccountInfo.RoleNr;
        temp.Sex=AccountInfo.Sex;
        temp.ShareCode=AccountInfo.ShareCode;

        //资料获取完成后再隐藏
        this.setState({
            LoginResult:temp,

        })


        //将登陆用户的资料保存起来
        Chat.storage.save({
            key:'ACCOUNTNO',
            rawData:temp
        });


        Chat.loginUserResult = temp;

        // console.log("Chat.loginUserResult")
        // console.dir(Chat.loginUserResult)


        //资料存储完毕后再开始IM登录
        this.imLogin();

       //Biz需要的param
        this.Biz_getPersonCode({
            "Account": this.state.account,
            "Password": this.state.isCheck ? this.state.password : '',
            "AccountNo": AccountNo,
            "Name": temp.Name

        });


    }


    /**
     *
     * IM登录
     *
     * */

    imLogin=()=>{


     var UserCode = this.state.LoginResult.SignInInfos[0].UserCode;



        Chat.init(UserCode,()=>{



            if(Chat.obj.Source=='抢单'){


              //  console.log('-------im登录成功 在这里将loding,,,去掉')

                // this.setState({
                //     isLogining:false,
                // })


                Profile.exitLogin(this.props);

            }else {
                Chat.logout();
            }
        });


    }




    //登录统一处理
    /**
     * param 调用接口ChkSignIn的参数
     * 普通登录和手机号码登录 提交了参数之后都在这里处理
     * */
    ChkSignIn =async(param)=>{


        let response = await ServingClient.execute("CRM.ChkSignIn",param);


        // console.log('登录接口返回的结果'+JSON.stringify(response))
        // console.dir(response);



        //登录成功....
        if(response.ReturnValue==0&& response.SignInInfos && response.SignInInfos.length>0)
        {



            //#TODO  这里现在改成可以支持用普通账号登录。暂时修改修改

            //INCU代表员工账号
            if(response.SignInInfos[0].OUSubTypeCode !=="INCU"){

                Alert.alert("仅支持内部员工登录")
                this.setState({
                    isLogining:false
                })
                if(this.state.loginType==1){

                    this.setState({
                        account:'',
                        password:''//验证码也清空
                    })

                }else{


                    this.setState({
                        // fastAccount:'',//将手机号码清空
                        // fastVercode:''//验证码也清空
                    })

                }
            }

            else{
                this.setState({
                    LoginResult:response
                })

                //获取用户的详细资料
                this.getUserInfo();

            }


/*
            //#TODO 这是7。26新修改的，为了兼容散客登录测试
            this.setState({
                LoginResult:response
            })

            //获取用户的详细资料
            this.getUserInfo();
*/


        }



        ///登录失败....
        else
        {

            this.setState({
                isLogining:false
            })

            if(this.state.loginType==1){

                this.setState({

                    password:''//密码清空

                })

            }else{

                this.setState({

                    fastVercode:''//验证码也清空

                })
            }

            Alert.alert("登录状态值为:"+response.ReturnValue+SignInInfosArray[response.ReturnValue])


        }







    }



    /**
     * 计算输入的长度
     *
     * */

    _isValidByLength = (str,errorMsg)=>{

        if(str.length<1){
            Alert.alert(errorMsg);
            return false
        }

        return true
    }



    //开始登陆
    commonloginEvent =async() =>{

        //关闭键盘
        Keyboard.dismiss();

        this.state.loginType = 1;


        if(!this._isValidByLength(this.state.account,"输入员工账号/手机号码/邮箱")){
            return;
        }

       if(!this._isValidByLength(this.state.password,"请输入密码")){
           return;
       }





//出现登录提示框
            this.setState({
                isLogining:true,
                loadingText:"登录中..."
            })




        //那你这样，如果是非验证码登录，用 LoginModeID = 0，LoginModeChk =664

        var LoginModeID = 0;
        var LoginModeChk =344;


            var paramterNew={

                LoginModeID:  LoginModeID,//如果是员工账号 传9 --如果是手机号码传
                LoginModeChk: LoginModeChk,
                LoginName: this.state.account,
                Password: this.state.password,
                SourceTypeCode:1,
                IsPasswordEncrypted:true,
            };

            this.ChkSignIn(paramterNew);

        }





        hideModal = ()=>{


            // this.refs.account.blur();
            // this.refs.password.blur();
            // this.refs.fastAccount.blur();
            // this.refs.fastVercode.blur();

        }





    //快速登录
    fastLoginEvent =async () => {


        //如果使用这种方法登录，则下次进来一定要重新登录。
        //这样在存储密码的时候，这里要改成false

       this.state.loginType = 2;

        // console.log("现在的手机号码",this.state.fastAccount)
        // console.log("现在的验证码",this.state.fastVercode)


        if(!this._isValidByLength(this.state.fastAccount,"请输入手机号码")){
            return;
        }

      if(!this._isValidByLength(this.state.fastVercode,"请输入验证码")){
            return;
      }

      if(!this.isMPNumber(this.state.fastAccount)){
          Alert.alert("请输入正确的手机号码")
          return;
      }

        this.setState({

            isLogining:true,
            loadingText:"登录中..."
        })

        var LoginModeID = 0;
        var LoginModeChk =7;

        let param = {
            "LoginModeID": LoginModeID,
            "LoginModeChk":LoginModeChk,
            "LoginName": this.state.fastAccount,
            "Password":this.state.fastVercode,
            "SourceTypeCode":1,
            "IsPasswordEncrypted":false,
        }








        this.ChkSignIn(param)




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

    //发送验证码后的计时器
    countTime = () => {


        //手机号码
        if(this.state.fastAccount.length!=11){

            Alert.alert("手机号码格式不正确")
            return
        }





        this.state.verCodeColor = '#999';
        this._timer = setInterval(() => {
            this.state.remainTime = this._index--;
            this.state.verCodeRemind = this.state.remainTime + 's ' + "后重发";
            this.setState({});
            if (this.state.remainTime <= 0) {
                this._timer && clearInterval(this._timer);
                this.state.verCodeColor = '#333';
                this.state.verCodeRemind = "发送验证码";
                this._index = 60;
                this.state.remainTime = 60;
                this.state.verCode = 'BizTest';
                this.setState({});
            }
        }, 1000);



        //发送验证码

        let param = {
            "LoginModeID": this.isMPNumber(this.state.fastAccount) ? 2 : this.isEmail(this.state.fastAccount) ? 1 : 3,
            "LoginName": this.state.fastAccount,//手机号码
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


    //登录loading...
    _renderLoading = ()=>{

        if(this.state.isLogining){
            return(
                <View style={styles.loadingMore}>
                    <ActivityIndicator size="large" style={styles.loading} color="white"/>
                    <Text style={styles.loadingMoreTitle}>{this.state.loadingText}</Text>
                </View>
            )
        }
        return null

    }









     //登录后获取personCode
    Biz_getPersonCode = (myInfo) => {

        // console.log("Biz_getPersonCode  myinfo")
        // console.dir(myInfo)

        let param = {
            "UserCode": "",
            "OrganizaType": "",
            "Condition": this.state.account
        }
        RestAPI.invoke('CRM.UserLoginByCondition', JSON.stringify(param), (test) => {
            try {

                var userInfo = test;
                if (userInfo.Code == 0) {
                    myInfo.PersonCode = userInfo.Result.User.PersonCode;
                    let storage = global.storage;
                    storage.save({
                        key: 'USERINFO',
                        rawData: JSON.stringify(myInfo)
                    });
                    this.props.navigator.replace({
                        name: 'index',
                        component: Index,
                        passProps: {
                            IsLogin: true,
                        }
                    })
                } else {
                    Toast.info(JSON.stringify(test.Msg), 3, null, false);
                }
            } catch (err) {
                Toast.info(err, 3, null, false);
            }
        }, (err) => {
            Toast.info(err, 3, null, false);
        });
    }



    /**
     *  //是否记住密码。更换图标和状态
     *
     * */
    isCheckPass = () => {

        if (this.state.isCheck==true) {
            this.setState({
                isCheck:false,
                checkIcon:'0xe672'
            })


        } else {


            this.setState({
                isCheck:true,
                checkIcon:'0xe673'
            })



        }
    }









    render=()=>{

        let tabNames = ["普通登录","快速登录"]
        let tabTextSize = 16;
        //在这里要加载历史记录

        return(
            <View style={{position:'absolute',left:0,top:0,width:window.width,height:window.height}}>

                <Image style={{width: window.width,height: window.height, alignItems: 'center',}}
                       source={require('./IM/image/login/bg.png')}
                >


                    <View style={styles.iconStyle}>

                        <Image source={require('./IM/image/login/logo.png')} style={{ width: 70, height: 70 }} />
                        <Text style={{ color: '#fff', fontSize: 16, marginTop: 10 }}>{"旅睿管理系统"}</Text>
                    </View>



   <View style={{ flexDirection: 'row', }}>

<Text style={{ width: 8 }} />

   <View style={styles.loginModuleStyle}>
                            <View style={styles.loginModuleItemStyle}>


 <ScrollableTabView locked={true}
                    contentProps={{keyboardShouldPersistTaps: 'always' }}
                                    renderTabBar={() => <TabBar tabNames={tabNames} tabTextSize={tabTextSize}
                                        tabChoiceColor='rgb(21,158,125)' tabUnchoiceColor="#999" />}
                                    tabBarPosition='top' style={{ marginTop: 20 }}>
                                    <View style={{ backgroundColor: '#fff', flex: 1, }} tabLabel='key1'>

                                        <View style={styles.accountViewStyle}>
                                            <Icon icon={'0xe65c'} color={'#999'} style={{ fontSize: 18, marginBottom: 3, marginRight: 5 }} />
                                            <TextInput style={{ flex: 1, fontSize: 15, }}
                                                       ref ={"account"}

                                                       onChangeText={(txt) => { this.setState({ account: txt }); }}
                                                placeholder={"输入员工账号/手机号码/邮箱"} placeholderTextColor='#ccc'
                                                underlineColorAndroid="transparent"
                                                value={this.state.account}
                                                selectionColor='#333' />
                                        </View>
                                        <Text style={{
                                            marginLeft: 30, marginRight: 30, height: 0.6,
                                            backgroundColor: '#ccc', marginBottom: 8
                                        }} />

                                        <View style={styles.accountViewStyle}>
                                            <Icon icon={'0xe65e'} color={'#999'} style={{ fontSize: 18, marginBottom: 3, marginRight: 5 }} />
                                            <TextInput
                                                ref ={"password"}
                                                style={{ flex: 1, fontSize: 15, }}
                                                onChangeText={(txt) => { this.setState({ password: txt }); }}
                                                placeholder={"输入密码"} placeholderTextColor='#ccc'
                                                underlineColorAndroid="transparent" secureTextEntry={true}
                                                value={this.state.password}
                                                selectionColor='#333' />
                                        </View>
                                        <Text style={{
                                            marginLeft: 30, marginRight: 30, height: 0.6,
                                            backgroundColor: '#ccc', marginBottom: 10
                                        }} />

                                        <View style={styles.passwordOptStyle}>


                                            <View style={{
                                                flex: 1, flexDirection: 'row', alignItems: 'center',
                                                justifyContent: 'flex-end',
                                            }}>
                                                <TouchableOpacity onPress={() => this.isCheckPass()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Icon icon={this.state.checkIcon} color={'#999'} style={{ fontSize: 16, marginTop: 1 }} />
                                                    <Text style={{ fontSize: 13, color: '#999', marginLeft: 3 }}>{"记住密码"}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <TouchableOpacity onPress={()=>{
                                            this.hideModal()
                                            this.commonloginEvent()
                                        }}
                                            style={{ flexDirection: 'row', marginTop: 30 }}>
                                            <Text style={{ width: 30 }} />
                                            <View style={{
                                                height: 45, backgroundColor: 'rgb(21,158,125)', alignItems: 'center',
                                                justifyContent: 'center', borderRadius: 5, flex: 1
                                            }}>
                                                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>{"登录"}</Text>
                                            </View>
                                            <Text style={{ width: 30 }} />
                                        </TouchableOpacity>


                                    </View>



                                    <View style={{ backgroundColor: '#fff', flex: 1, }} tabLabel='key2'>
                                        <View style={styles.accountViewStyle}>
                                            <Icon icon={'0xe65d'} color={'#999'} style={{ fontSize: 18, marginBottom: 1, marginRight: 5 }} />
                                            <TextInput style={{ flex: 1, fontSize: 15, }}

                                                       ref={"fastAccount"}
                                                onChangeText={(txt) => { this.state.fastAccount = txt; }}
                                                placeholder={"输入手机号码"} placeholderTextColor='#ccc'
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

                                            <TextInput
                                                style={{ flex: 1, fontSize: 15, }}
                                                onChangeText={(txt) => {
                                                    this.state.fastVercode = txt;
                                                }}
                                                ref={"fastVercode"}

                                                placeholder={"输入手机验证码"}
                                                placeholderTextColor='#ccc'
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

                                        <TouchableOpacity onPress={() =>{

                                            this.fastLoginEvent()

                                        }}
                                            style={{ flexDirection: 'row', flex: 0.5, }}>
                                            <Text style={{ width: 30 }} />
                                            <View style={{
                                                height: 45, backgroundColor: 'rgb(21,158,125)', alignItems: 'center',
                                                justifyContent: 'center', borderRadius: 5, flex: 1
                                            }}>
                                                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>{"登录"}</Text>
                                            </View>
                                            <Text style={{ width: 30 }} />
                                        </TouchableOpacity>

                                    </View>
                                </ScrollableTabView>








</View>
                        </View>











   <Text style={{ width: 8 }} />
                    </View>









                </Image>

                {this._renderLoading()}

            </View>

        )



    }








}










var styles = StyleSheet.create({

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










    searchExtra: {

        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent:'flex-start',
        backgroundColor: 'rgb(255,255,255)',
        paddingLeft: 0,
        paddingTop: 10,
        paddingBottom: 20,
        alignItems: 'center',
        //borderTopColor: '#ddd',
        // borderTopWidth: 1 / FLEXBOX.pixel,
        // height: 220,

    },


    actionIcon: {

        fontFamily:'iconfont',
        fontSize: 20,
        color: '#666'

    },
    actionText: {
        fontSize: 15,
        color: '#666',
        marginTop:10
    },

    iconBox: {
        borderRadius: 10,
        borderColor: '#dededf',
        borderWidth: 1 / FLEXBOX.pixel,
        backgroundColor: '#fbfbfc',
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: 'center',
        marginBottom: 5,

    },


    actionItem: {

        alignItems: 'center',
        justifyContent: "center",
        width:window.width/4,
        marginBottom: 10,

    },


    page: {
        flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center',

    },
    indexList:{
        height:window.height-200,
    },

    login:{

    },
    loginBG:{
        width:window.width,
        height:window.height,
        flexDirection:'column',
        alignItems:'center',

    },
    logo:{
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        // position:'absolute',
        top:40,
        left:0,
        right:0,
        marginBottom:40,
    },
    logoImg:{
        width:60,
        height:60,
    },
    logoName:{
        padding:10,
        color:'white',
        fontSize:15,
        textAlign:'center',
    },


    loginMain:{
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        //backgroundColor:'red',
    },


    loginItem:{
        // marginLeft:50,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        borderBottomColor:'#ccc',
        borderBottomWidth:1,
        padding:10,
        // flex:1,
        // borderWidth:1,
        // borderColor:'yellow',

    },
    loginItemLeft:{

        fontFamily:'iconfontim',
        fontSize:20,
        paddingRight:20,
        color:'white',
        // flex:1,
        //height:30,
    },
    loginItemRight:{
        width:window.width-40*3,
        height:40,
        color:'white',
    },


    remember:{
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'center',
        padding:8,
        paddingRight:0,
        paddingLeft:230,
    },
    remberIcon:{
        fontFamily:'iconfont',
        fontSize:15,
        // color:'white',
        backgroundColor:'white',
        width:20,
        height:20,
        textAlign:'center',
        //padding:1,
    },
    remmeberInfo:{
        color:'white',
        padding:5,
    },
    loginButton:{
        backgroundColor:'rgb(21,158,125)',
        color:'white',
        padding:12,
        width:window.width-20*2,
        textAlign:'center',
        fontSize:18,
        margin:10,
    },


    index:{
        //flex:1,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
    },
    indexTop:{

        width:window.width,
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'rgb(21,158,125)',
        paddingTop:20,
    },

    indexTopImg:{
        width:30,
        height:30,
        borderRadius:15,
        overflow:'hidden',
        margin:5,

    },
    indexTopName:{
        color:'white',
        paddingLeft:10,
        padding:5,
        fontSize:15,
    },
    indexTopAccount:{
        color:'white',
        fontSize:10,
    },
    indexTopMessage:{
        fontFamily:'iconfont',
        color:'white',
        fontSize:24,
        paddingLeft:10,
        // position:'absolute',
        // right:20,
        // top:25,

    },


    messageNumber:{
        backgroundColor:'red',
        color:'white',
        overflow:'hidden',
        width:18,
        height:18,
        fontSize:13,
        borderRadius:9,
        // position:'absolute',
        // right:10,
        top:-8,
        right:5,
        textAlign:'center',
    },

    indexTopSwitch:{
        fontFamily:'iconfont',
    },


    indexMainListStyle:{
        //height:Common.window.height-64-65,
    },

    indexMainList:{

        justifyContent:'space-around',
        flexDirection:'row',
        alignItems:'center',
        flexWrap:'wrap',

    },
    indexMainItem:{
        // backgroundColor:'red',
        paddingTop:20,
        //justifyContent:'center',//垂直
        alignItems:'center',
        borderWidth:1,
        //borderRadius:5,
        borderColor:'#FAFAFA',
        width:window.width/3,
        // marginBottom:10,
        //marginTop:10,
        height:window.width/3,


    },

    indexMainItemIcon:{
        fontFamily:'iconfont',
        fontSize:32,
    },
    indexMainItemNumber:{

        padding:2,

    },
    indexMainItemTitle:{
        fontSize:12,
        padding:10,
        paddingTop:0,
    },




    searchBarBG:{

        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'#eee',
        padding:10,
        //backgroundColor:'red',
        //borderRadius:20,
        //overflow:'hidden',


    },
    searchBarLeft:{
        flex:1,
        height:32,
        paddingTop:9,
        fontFamily:'iconfont',
        fontSize:12,
        backgroundColor:'white',
        textAlign:'center',
        overflow:'hidden',
        color:'#ccc',
        //borderRadius:5,
    },
    searchBarInput:{
        flex:15,
        backgroundColor:'white',
        height:32,
        marginRight:10,
        fontSize:15,
        //borderRadius:5,
        // width:100,
    },
    searchBarCancel:{
        flex:1,
        // color:'#f44848',
        color:'white',
        marginLeft:10,
        fontSize:15,
    },


    historyListStyle:{
        backgroundColor:'white',
        position:'absolute',
        top:110,
        left:0,
        right:0,
    },


    historyCellItem:{

        justifyContent:'center',//垂直
        //alignItems:'center',
        width:window.width,
        borderBottomWidth:1,
        borderBottomColor:'#ccc',
        //backgroundColor:'blue',




    },

    historyCellInfo:{
        backgroundColor:'blue',
        color:'#333',
        textAlign:'center',
        padding:8,
        paddingLeft:18,
        paddingRight:18,
        margin:5,
        //borderRadius:5,
        fontSize:14,
        overflow:'hidden',
        //flex:1,
        textAlign:'left'



    },

    loadingMore:{
        position:'absolute',
        top:0,
        left:0,
        right:0,
        bottom:0,

        width:140,
        marginTop:window.height/2-60,
        height:120,


        marginLeft:(window.width-140)/2,
        marginRight:(window.width-140)/2,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgba(0,0,0,0.5)',
        borderRadius:10,

    },
    loading:{
        margin:20,

    },
    loadingMoreTitle:{

        marginLeft:10,
        fontSize:18,
        color:'white',
    },

    bottom:{
        backgroundColor:'white',
        position:'absolute',
        left:0,
        bottom:0,
        width:window.width,
        height:50,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        borderTopWidth:1,
        borderTopColor:'#eee'
    },
    bottomItem:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',




    },
    bottomItemIcon:{
        fontFamily:'iconfont',
        // fontSize:55,
        fontSize:28,
        color:'#555',
    },
    bottomItemInfo:{
        fontSize:11,
        color:'#666',

    },
    bottomItemCenter:{
        marginLeft:1,
        fontFamily:'iconfont',
        fontSize:24,
        color:'white',
        borderRadius:24,
        overflow:'hidden',
        textAlign:'center',
        backgroundColor:'transparent',
        width:48,
        height:48,
        lineHeight:48,
    },
    CameraBG:{
        width:50,
        height:50,
    },

    quotePricesCell:{
        width:window.width,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-start',
        padding:5,
        borderBottomColor:'#eee',
        borderBottomWidth:1,
    },
    quotePricesCellLeft:{
        //flex:1,
        fontFamily:'iconfont',
        fontSize:20,
        padding:5,
        marginLeft:10,

        //backgroundColor:'orange',
        borderRadius:15,
        width:30,
        height:30,
        overflow:'hidden',
        textAlign:'center',
        color:'white',
    },


    quotePricesCellLeftImg:{
        width:40,
        height:40,
    },


    quotePricesCellCenter:{
        flex:8,
        flexDirection:'column',
        alignItems:'flex-start',
        justifyContent:'center',
        padding:5,
        paddingLeft:4,

    },
    quotePricesCellCenterInfo:{

        textAlign:'left',
        // backgroundColor:'red',
    },
    quotePricesCellCenterDetail:{

        textAlign:'left',
        padding:5,
        paddingLeft:0,
    },
    quotePricesCellRight:{
        flex:2,
        textAlign:'right',
        //margin:1
        right:10,

    },

    switch:{
        position:'absolute',
        right:5,
        bottom:5,
        // width:50,
        // height:30,
    },



    receiveInfo:{
        fontSize:15,
        position:'absolute',
        right:60,
        color:'white',
        // top:10,
        textAlign:'center',
        bottom:12,

    }




})



