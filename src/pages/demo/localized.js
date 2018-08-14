import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    Navigator,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar, TextInput
} from 'react-native';
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
import { Button, InputItem } from 'antd-mobile';
var { width, height } = Dimensions.get('window')
var isVis = true;
var type = BaseComponent.getLocale();

export default class index extends BaseComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center',backgroundColor:"#fff" }}>
            <Text style={{ marginBottom: 10 }}>{type.fastLogin}</Text>
            <View style={{ flexDirection: 'row' }}>
                <Button style={{ marginRight: 10 }} onClick={() => this.changeLocale(en_US)}>
                    <Text>English</Text>
                </Button>
                <Button onClick={() => this.props.navigator.pop()}>
                    <Text>中文</Text>
                </Button>
                <TextInput
                    style={{ height: 40, width: 100, borderColor: 'gray', borderWidth: 1 }}
                    onChangeText={(text) => this.setState({ text })}

                />
            </View>
        </View>
    }
}