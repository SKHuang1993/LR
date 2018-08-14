import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
} from 'react-native';
import Flex from '../../components/flex';

import { COLORS, FLEXBOX } from '../../styles/commonStyle'

export default  FormatPirce = (value = 8889, currency = '￥', size = 16, color = COLORS.secondary, unit = null) => {
    size = size ? size : 18;
    color = color ? color : COLORS.secondary;
    currency = currency ? currency : '￥';
    //String.fromCharCode(165) ￥
    let styles = {
        value: {
            fontSize: size,
            color: color,
        }
    }
    return (
        <Text wrap='wrap' align='end' >
            <Text style={{ fontSize: size * .6, color: color, marginRight: -1, marginBottom: size * .17, }}>{currency}</Text>
            <Text style={{ fontSize: size, color: color }}>{value}</Text>
            {unit?<Text style={{ opacity:0,fontSize:2 }}> </Text>:null}
            <Text style={{ fontSize: size * .6, color: color, marginBottom: size * .17, marginLeft: 2, }}>{unit}</Text>
           
        </Text>
    )
}