
import React, { Component } from 'react'
import { StyleSheet, Text, View, Image, TouchableHighlight, Animated, StatusBar } from 'react-native';
import Narbar from '../../components/navBar/'
//import WebViewBridge from 'react-native-webview-bridge';
import Stars from '../../components/stars';

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            txt: 'heleo'
        }

    }




    render() {
        return (
        <View style={styles.container} >


            {Stars(3.6)}
           

        </View>
        )
    }
}

class Test extends Component {

    render() {
        return <View>
            <Text >组件2</Text>
            <Text >{this.props.text}</Text>
        </View>
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,

    },
    flex: {
        flex: 1,
        flexDirection: 'row',


    }

});
