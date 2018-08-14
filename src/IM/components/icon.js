/**
 * Created by yqf on 2017/10/25.
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View
} from 'react-native';


/**
 *
 * onPress代表点击事件
 * size 尺寸
 * color图标颜色
 * icon 图标
 *
 * */



export default class Icon extends Component{


    static defaultProps={

        size: 16,
        color: '#000',
        icon:'0xe172',
        onPress:null

    };

    render(){
        return(

            <Text onPress={this.props.onPress}
                  style={[{fontFamily:'iconfontim',fontSize:this.props.size,color: this.props.color},this.props.style]}>
                {String.fromCharCode(this.props.icon)}
            </Text>
        )
    }

}