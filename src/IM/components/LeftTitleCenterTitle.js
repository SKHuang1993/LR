/**
 * Created by yqf on 2017/10/31.
 */
/**
 * Created by yqf on 17/4/28.
 */
/**
 * Created by yqf on 17/3/9.
 */



//通用的左边标题 ＋ 右边／文字／开关／箭头///
//type == 'switch' ? 开关 ： 'icon' ？ 图片  : 文字
//onPress 代表点击的方法



import React, { Component } from 'react';
import {

    StyleSheet,
    View,
    Image,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    Switch,
    TouchableOpacity,

} from 'react-native';


export default class  YQFLeftTitleCenterTitle extends Component
{


    constructor(props)
    {


        super(props);
        this.state={

            value:this.props.value ? this.props.value:false,
            leftTitleStyle: {

                color: this.props.leftTitleColor ? this.props.leftTitleColor :'rgb(51,51,51)' ,
                fontSize: this.props.leftTitleFont ? this.props.leftTitleFont:16,
                textAlign: 'left',
                margin: 20,
            },


            rightTitleStyle:{

                color: this.props.rightTitleColor ? this.props.rightTitleColor :'rgb(102,102,102)' ,
                fontSize: this.props.rightTitleFont? this.props.rightTitleFont : 14,
                textAlign: 'right',
                margin: 10,


            },

            lineStyle:{

                height:0.5,
                backgroundColor:'rgb(235,235,235)',
                marginLeft:10,

            },
            containerStyle:{

                alignItems:'center',
                flexDirection:'row',
                justifyContent:'space-between',
                height:this.props.height ? this.props.height : 45,
                backgroundColor:'white',


            }


        }


    }

    _renderLine = ()=>{
        if(this.props.isShowLine && this.props.isShowLine == false) {

            return null;
        }

        return (
            <View style={{height:0.7,
                backgroundColor:'rgb(235,235,235)',
                marginLeft:10,}}></View>
        )


        }


    _renderArrow = ()=>{

        if(this.props.isShowArrow && this.props.isShowArrow == true){

            return(
                <Text
                    style={{fontFamily:'iconfontim',color:'rgb(204,204,204)',marginRight:10,fontSize:18}}>{String.fromCharCode('0xe177')}</Text>
            )
        }
        return null;

    }

    _renderRightTitle = ()=>{

        if(this.props.rightTitle){
            return(
                <View onPress={this.props.onPress}>
                    <Text numberOfLines={1} style={[this.state.rightTitleStyle,this.props.rightTitleStyle]}>{this.props.rightTitle}</Text>
                </View>
            )

        }

        return null;

    }


    render()
    {



        return (


            <TouchableOpacity onPress={this.props.onPress}>

                <View >


                    <View style={[this.state.containerStyle,this.props.style ]}>


                        <Text numberOfLines={1} style={[this.state.leftTitleStyle,{flex:1}]}>{this.props.leftTitle}</Text>

                        <View style={{flexDirection:'row-reverse',alignItems:'center',flex:2}}>

                            {this._renderArrow()}

                            {this._renderRightTitle()}

                        </View>


                    </View>

                    {this._renderLine()}



                </View>
            </TouchableOpacity>

        );
    }



}




