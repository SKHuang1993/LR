import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    Navigator, BackAndroid, TouchableOpacity
} from 'react-native';

import { Tabs, TabBar, List } from 'antd-mobile';
import Icon from '../components/icons/icon';
import Ant from '../ant/rn-kitchen-sink/index'

const TabPane = Tabs.TabPane;
const Item = List.Item;

export default class demo extends Component  {
    render() {
        return <Ant/>
    }
}