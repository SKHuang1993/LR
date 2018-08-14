import React, { Component } from 'react';
import {
    AppRegistry,
    Navigator,
    Image,
    AsyncStorage,
    Dimensions,
    View,
} from 'react-native';

import login from '../login/login'
import index from '../../IM/index';
import Login from "../../Login";
import {Chat} from '../../IM/utils/chat';
import WelcomeUI from '../login/welcomeUI';
import SplashScreen from 'react-native-splash-screen';
import { LanguageType } from '../../utils/languageType';
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
import Profile from '../../IM/pages/Profile/Profile';
import {ServingClient}  from '../../IM/utils/yqfws'
// 数据对应的key
var STORAGE_KEY = 'FIRST_KEY';
var { width, height } = Dimensions.get('window');
let storage = global.storage;

//多语言






export default class WelcomeOrMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFirst: null,
            lanType: LanguageType.setType(),
        };
    }


    componentDidMount() {

        // console.warn('启动后获取素材---WelcomeOrMain');

        Chat.getLabelInfos();//获取素材

        this._get().done(() => {
            SplashScreen.hide()
            const { navigator } = this.props;
           
            Chat.storage.load({
                key: 'ACCOUNTNO'
              }).then((val) => {
                if (val && val.AccountNo && val.AccountNo.length > 0) {

//                     console.log('有缓存信息...');
// console.dir(val)

                    //将登陆后的资料赋给chat。loginUserResult
                    Chat.loginUserResult = val;
                    Chat.setUserAgent(val.AccountNo, () => {

                    }, (error) => {
                    });


                    //IM连接
                    Chat.init(val.AccountNo, (kickOff) => {
                        if(Chat.obj.Source=='抢单'){
                            console.log('抢单 --  被登陆 ---  返回到登陆页面');

                            Profile.exitLogin(this.props);


                        }else {
                            Chat.logout();
                        }
                    });


                    const {navigator} = this.props;
                    if (navigator) {
                        navigator.resetTo({
                            name: 'index',
                            component: index,
                        })
                    }
                }
                else {
                    const {navigator} = this.props;
                    if (navigator) {
                        navigator.resetTo({
                            name: 'Login',
                            component: Login,
                        })
                    }
                }
              }, (error) => {
                const {navigator} = this.props;
                    if (navigator) {
                        navigator.resetTo({
                            name: 'Login',
                            component: Login,
                        })
                    }
              })
        });

    }

    render() {

        return (
            <View style={{ backgroundColor: '#e6eaf2', alignItems: 'center', justifyContent: 'flex-end', width: width, height: height }}>
                <Image source={require('../../images/start_page.png')} style={{ width: width, height: height,}} resizeMode={Image.resizeMode.stretch}></Image>
            </View>
        );
    }

    // 获取
    _get = async () => {
        try {
            let ret = await storage.load({
                key: 'localeLang',

            });
            ret == 'EN' ? BaseComponent.setLocale(en_US) : BaseComponent.setLocale(zh_CN);
            this.state.lanType = LanguageType.setType();
        } catch (error) {

        }
        try {// try catch 捕获异步执行的异常
            var value = await AsyncStorage.getItem(STORAGE_KEY);
            if (value !== null) {
                this.state.isFirst = value;
            } else {
                this.state.isFirst = null;
            }
        } catch (error) {
            this.state.isFirst = null;
        }
    }

    // componentWillMount(){
    //     return false;
    //  }

    //  componentWillUnmount(){
    //      return false;
    //  }
}