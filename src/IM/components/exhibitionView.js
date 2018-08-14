/**
 * Created by yqf on 2017/11/26.
 */
import React, {Component} from 'react';

import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Dimensions,
} from 'react-native';
import Icon from './icon';
import {FLEXBOX} from '../styles/commonStyle'

var {width,height} = Dimensions.get('window')

export default class ExhibitionView  extends Component {
    static propTypes = {
        leftText:React.PropTypes.string,//左侧文字
        rightText:React.PropTypes.string,//右侧的文字
        leftColor:React.PropTypes.string,//左侧文字颜色
        rightColor:React.PropTypes.string,//右侧文字颜色
        clickEvent:React.PropTypes.func,//点击事件
        isVisible:React.PropTypes.bool,//判断右侧进入箭头是否可见
        bottomLine:React.PropTypes.bool,//判断底部的线是否出现

    }

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View>
                {this.props.isVisible ?
                    <View>
                        <TouchableOpacity style={[styles.barStyle,{borderTopWidth:this.props.BorderTop?this.props.BorderTop:0,
                                        borderTopColor:'#ebebeb'}]} onPress={()=> this.props.clickEvent()}>
                            <Text style={[styles.leftTextStyle,{color:this.props.leftColor}]}>{this.props.leftText}</Text>
                            <Text style={[styles.rightTextStyle,{color:this.props.rightColor}]}>{this.props.rightText}</Text>
                            <Icon icon={this.props.isVisible ? '0xe177' : ''} color={'#999'} style={{fontSize: 18,width:20}}/>
                        </TouchableOpacity>
                    </View>
                    :
                    <View>
                        <View style={[styles.barStyle,{borderTopWidth:this.props.BorderTop?this.props.BorderTop:0,
                            borderTopColor:'#ebebeb'}]} onPress={()=> this.props.clickEvent()}>
                            <Text style={[styles.leftTextStyle,{color:this.props.leftColor}]}>{this.props.leftText}</Text>
                            <Text style={[styles.rightTextStyle,{color:this.props.rightColor}]}>{this.props.rightText}</Text>
                            <Icon icon={this.props.isVisible ? '0xe177' : ''} color={'#999'} style={{fontSize: 18,width:20}}/>
                        </View>
                    </View>
                }

            </View>

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
        borderBottomWidth:1/FLEXBOX.pixel,
        borderBottomColor:'#ebebeb',
        backgroundColor:"#fff",
        justifyContent: 'center',
    },
    leftTextStyle:{
        flex:.3,
        fontSize:16,
    },
    rightTextStyle:{
        flex:.7,
        paddingLeft:12,
        fontSize:16,
        textAlign :'left',
    },
})