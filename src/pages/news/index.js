
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    Navigator, 
    TouchableOpacity,
} from 'react-native';
import NoData from '../../components/noDataTip'
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import Navbar from '../../components/navBar/index';

import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class News extends Component {
   
    render() {
        let tHeight = (Platform.OS === 'android' ? 64 : 64);
        return (
            <View style={{ flex: 1 }}>
                <View style={{width:FLEXBOX.width,height:tHeight,backgroundColor:COLORS.primary,
                                alignItems:'center',justifyContent:'center',paddingTop:tHeight-44}}>
                    <Text style={{textAlign:'center',fontSize:18,color:'#fff',}}>{lan.home_nav_news}</Text>
                </View>
                <NoData noDataState={4}/>
            </View>

        )
    }
}