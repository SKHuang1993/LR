/**
 * Created by yqf on 2017/12/8.
 */

//今日接单

import { observer } from 'mobx-react/native';

import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import { COLORS, FLEXBOX } from '../../styles/commonStyle';
import {Chat} from '../../utils/chat';
import CodePush from "react-native-code-push";
import WebView from '../../components/webview1';

import moment from 'moment';
import {RestAPI} from '../../utils/yqfws';
import PictureTemplate from '../Poster/PictureTemplate';
import Simplewebview from '../Desk/Simplewebview';
import TPList from '../TravelPlan/TPList';

import {

    StyleSheet,
    View,
    Image,
    Text,
    ListView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Dimensions,

} from 'react-native';


import YQFNavBar from '../../components/yqfNavBar';

import Icon from '../../components/icon';
import Colors from '../../Themes/Colors';
import desk from '../../stores/Desk/Desk'

import Login from '../../../Login';
import DeviceInfo from 'react-native-device-info';
import TestWebView  from './testwebview'
import PosterList from '../../pages/Poster/PosterList'
import PosterEntrance from '../../pages/Poster/PosterEntrance'

import VideoList from '../../pages/Professional/VideoList'



const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}

export  default  class  TodayOrder extends  Component{

    constructor(props){
        super(props);
    }c

    render = () =>{

        var date = new Date();

        var nowTime = new Date();
        var finalTime = new Date("2017-12-19");


        var lefttime = (finalTime.getTime() - nowTime.getTime())/(1000*24*60*60);
        var leftHour = (finalTime.getTime() - nowTime.getTime())/(1000*24*60*60);
        var leftMinute = (finalTime.getTime() - nowTime.getTime())/(1000*24*60*60);
        var leftSecond = (finalTime.getTime() - nowTime.getTime())/(1000*24*60*60);



        // var date = Math.ceil(lefttime);

        // console.log('倒计时功能使用')
        // console.dir(date);


        return(

            <View style={styles.container}>

                <YQFNavBar

                    leftIcon={'0xe183'}
                    onLeftClick={()=>{this.props.navigator.pop()}}
                    title={'今日接单'}/>

                <View style={{margin:20}}>

                    <Text style={{color:'rgb(51,51,51)',fontSize:17,margin:10}}>今日接单时长:</Text>
                    <Text style={{color:'rgb(51,51,51)',fontSize:17,margin:10}}>此次接单时长:</Text>
                </View>

            </View >

        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    webview: {
        flex: 1,
    },
    loadingText: {
        color: '#8a8a8a',
        fontSize: 16
    }
})
