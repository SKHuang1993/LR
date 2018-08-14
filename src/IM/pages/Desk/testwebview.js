/**
 * Created by yqf on 2017/11/30.
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    WebView,
    BackAndroid,

} from 'react-native';
import { observable } from 'mobx';
import { observer } from 'mobx-react/native'

import NavBar from '../../components/yqfNavBar'
import ActivityIndicator from '../../components/activity-indicator'

@observer

export default class TestWebview extends Component {

    @observable loading = true;


    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            url: "",
            title: "",
            loading: true,
            isBackButtonEnable: false,
            isForwardButtonEnable: false
        };
    }

    componentDidMount() {

    }


    render() {
        let url = 'http://www.iqiyi.com/';
        let title = 'eeee';
        return (

            <View style={styles.container}>

                <WebView startInLoadingState={true}
                         onLoadStart={() => { this.loading = true }}
                         onLoadEnd={() => { this.loading = false }}
                         javaScriptEnabled={true} source={{ uri: url }} />


                <ActivityIndicator toast text={'加载中'} animating={this.loading} />
            </View >
        )
    }



    //WebView导航状态改变
    _onNavigationStateChange(navState) {
        this.setState({
            url: navState.url,
            title: navState.title,
            loading: navState.loading,
            isBackButtonEnable: navState.canGoBack,
            isForwardButtonEnable: navState.canGoForward,
        })
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
