import React, {Component} from 'react';

import {
	StyleSheet,
	View,
	TouchableOpacity,
    Text,
    Dimensions,
} from 'react-native';
import Icon from '../../components/icons/icon';
import {FLEXBOX} from '../../styles/commonStyle';

var {width,height} = Dimensions.get('window')

export default class EntryBar  extends Component {
    static propTypes = {
        leftText:React.PropTypes.string,//左侧文字
        rightText:React.PropTypes.string,//右侧的文字
        leftColor:React.PropTypes.string,//左侧文字颜色
        rightColor:React.PropTypes.string,//右侧文字颜色
        clickEvent:React.PropTypes.func,//点击回调函数
	}

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <TouchableOpacity style={[styles.barStyle,{borderTopWidth:this.props.BorderTop?this.props.BorderTop:0,
                                borderTopColor:'#ebebeb'}]} onPress={()=>this.props.clickEvent()}>
                <Text style={[styles.leftTextStyle,{color:this.props.leftColor}]}>{this.props.leftText}</Text>
                <Text style={[styles.rightTextStyle,{color:this.props.rightColor}]}>{this.props.rightText}</Text>
                <Icon icon={'0xe677'} color={'#999'} style={{fontSize: 18,marginLeft:3}}/>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    barStyle:{
        width:width,
        height:45,
        flexDirection:'row',
        paddingLeft:15,
        paddingRight:5,
        alignItems: 'center',
        backgroundColor:"#fff",
        justifyContent: 'center',
        borderBottomWidth:1/FLEXBOX.pixel,
        borderBottomColor:'#ebebeb',
    },
    leftTextStyle:{
        flex:1,
        fontSize:16,
    },
    rightTextStyle:{
        fontSize:14,
    },
})