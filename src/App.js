
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  StatusBar,
  Navigator, BackAndroid, TouchableOpacity, Alert
} from 'react-native';
import CodePush from 'react-native-code-push';


import WelcomeOrMain from '../src/pages/login/WelcomeOrMain';
import * as storage from './utils/storage'
import demo from './pages/demo'
import Antdemo from './pages/Antdemo'
import { RestAPI } from './utils/yqfws'
import { BaseComponent, en_US, zh_CN } from './components/locale';
import { initData } from './components/calendar';
import { ModalBox } from './components/modalbox';
import {Chat} from './IM/utils/chat';
import Login from "./Login";
import Index from './IM/index';

export default class App extends Component {
  componentDidMount() {
    let _this = this;
    ModalBox.init(_this);
    initData();
    BackAndroid.addEventListener('hardwareBackPress', function () {
      if (_this.navigator && _this.navigator.getCurrentRoutes().length > 1) {
        _this.navigator.pop();
        return true;
      } else {
        BackAndroid.exitApp();
        return false;
      }
    });
    
  }


  render() {
    //暂不要删掉下面这段代码
    var NavigationBarRouteMapper = {
      LeftButton: function (route, navigator, index, navState) {
        return null;
      },
      RightButton: function (route, navigator, index, navState) {

        return null;


      },
      Title: function (route, navigator, index, navState) {
        return null;
      },
    };
        return (
          <View style={{flex:1}}>
            <StatusBar
                    animated={true}
                    hidden={false}
                    backgroundColor={'transparent'}
                    translucent={true}
                    barStyle="light-content"
                    showHideTransition={'fade'}
                />
            <Navigator 
                    initialRoute={{ name: 'WelcomeOrMain', component: WelcomeOrMain }}
                    configureScene={(route, routeStack) => {
                      if (route.type == 'Bottom') {
                        return Navigator.SceneConfigs.FloatFromBottomAndroid // 底部弹出
                      }
                      return Navigator.SceneConfigs.PushFromRight; // 右侧弹出
                    }}
                    renderScene={(route, navigator) => {
                    let Component = route.component;
                    this.navigator = navigator;
                    return <Component {...route.passProps} navigator={navigator} />;
                    }} navigationBar={
                      <Navigator.NavigationBar
                        routeMapper={NavigationBarRouteMapper}
                        style={styles.navBar} />}
            />
          </View>
          
        );
  }
}

//待说明
Navigator.prototype.replaceWithAnimation = function (route) {
  const activeLength = this.state.presentedIndex + 1;
  const activeStack = this.state.routeStack.slice(0, activeLength);
  const activeAnimationConfigStack = this.state.sceneConfigStack.slice(0, activeLength);
  const nextStack = activeStack.concat([route]);
  const destIndex = nextStack.length - 1;
  const nextSceneConfig = this.props.configureScene(route, nextStack);
  const nextAnimationConfigStack = activeAnimationConfigStack.concat([nextSceneConfig]);

  const replacedStack = activeStack.slice(0, activeLength - 1).concat([route]);
  this._emitWillFocus(nextStack[destIndex]);
  this.setState({
    routeStack: nextStack,
    sceneConfigStack: nextAnimationConfigStack,
  }, () => {
    this._enableScene(destIndex);
    this._transitionTo(destIndex, nextSceneConfig.defaultTransitionVelocity, null, () => {
      this.immediatelyResetRouteStack(replacedStack);
    });
  });
};

Navigator.prototype.immediatelyResetRouteStackWithAnimation = function (actives, route) {
  const activeLength = this.state.presentedIndex + 1;
  const activeStack = this.state.routeStack.slice(0, activeLength);
  const activeAnimationConfigStack = this.state.sceneConfigStack.slice(0, activeLength);
  const nextStack = activeStack.concat([route]);
  const destIndex = nextStack.length - 1;
  const nextSceneConfig = this.props.configureScene(route, nextStack);
  const nextAnimationConfigStack = activeAnimationConfigStack.concat([nextSceneConfig]);

  const replacedStack = activeStack.slice(0, activeLength - 1).concat([route]);
  this._emitWillFocus(nextStack[destIndex]);
  this.setState({
    routeStack: nextStack,
    sceneConfigStack: nextAnimationConfigStack,
  }, () => {
    this._enableScene(destIndex);
    this._transitionTo(destIndex, nextSceneConfig.defaultTransitionVelocity, null, () => {
      this.immediatelyResetRouteStack(actives.concat([route]));
    });
  });
};


const styles = StyleSheet.create({
  navBarLeftButton: {
    paddingLeft: 15,
    paddingRight: 15,
    height: 44
  },
  navBar: {
    backgroundColor: '#f44848',
    height: 0
  }, navBarText: {
    fontSize: 16,
    color: 'white',
    justifyContent: 'center',
  },
});
