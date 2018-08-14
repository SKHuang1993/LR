/**
 * Created by yqf on 2017/12/7.
 */


import React from 'react';
import {
    AppRegistry,
    Component,
    ScrollView,
    TouchableOpacity,
    Text,
    View,
    WebView
} from 'react-native';

export default class Simplewebview extends React.Component {
    render() {
        return (
            <WebView
                ref="webview"
                automaticallyAdjustContentInsets={false}
                style={{backgroundColor:'rgba(255,255,255,0.8)', height:400}}
                source={{uri:'http://mlr.yiqifei.com/Poster/GetPosterDetail?postID=631&typeID=1&account=VBL00T54&personCode=VBK036D9&phone=18620033022&userName=%E9%BB%84%E6%9D%BE%E5%87%AF&notGenerated=F&ifshare=true&ifGenerate=false'}}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                decelerationRate="normal"
                startInLoadingState={true}
            />
        )
    }
}