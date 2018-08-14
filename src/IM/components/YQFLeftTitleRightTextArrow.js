/**
 * Created by yqf on 2017/10/31.
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



export default class  YQFLeftTitleRightTextArrow extends Component
{


    constructor(props)
    {



        super(props);


        this.state={


            isShowLine:this.props.isShowLine  ? this.props.isShowLine : true,
            isShowArrow:this.props.isShowArrow ? this.props.isShowArrow : true,

            ArrowColor:this.props.ArrowColor? this.props.ArrowColor :'rgb(204,204,204)',

            leftTitleStyle: {


                color: this.props.leftTitleColor ? this.props.leftTitleColor :'rgb(51,51,51)' ,
                fontSize: this.props.leftTitleFont ? this.props.leftTitleFont:16,
                textAlign: 'left',
                margin: 10,

            },


            rightTitleStyle:{

                color: this.props.rightTitleColor ? this.props.rightTitleColor :'rgb(102,102,102)' ,
                fontSize: this.props.rightTitleFont? this.props.rightTitleFont : 15,
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
                height:this.props.height ? this.props.height : 50,
                backgroundColor:'white',


            }


        }


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



    render()
    {

        if(this.props.type=='switch')
        {
            return(

                <View>


                    <View style={[this.state.containerStyle,this.props.style]}>


                        <Text style={[this.state.leftTitleStyle,{flex:1}]}>{this.props.leftTitle}</Text>

                        <View style={{flexDirection:'row-reverse',alignItems:'center',flex:2}}>


                            <Switch style={{marginRight:10}} value={this.props.value} onValueChange={(currentValue)=>{

                                       this.props.myOnValueChange(currentValue);


                            }} ></Switch>



                        </View>


                    </View>

                    {
                       this._renderLine()
                    }


                </View>


            );

        }



        if(this.props.type == 'icon')
        {
            return(

                <View>


                    <View style={[this.state.containerStyle,this.props.style]}>


                        <Text style={[this.state.leftTitleStyle,{flex:1}]}>{this.props.leftTitle}</Text>

                        <View style={{flexDirection:'row-reverse',alignItems:'center',flex:2}}>



                            <Image style={{width:40,height:40}} source={{uri:'test'}}>

                            </Image>



                        </View>


                    </View>

                    {
                     this._renderLine()
                    }


                </View>


            );



        }


        else {




            return (


                <TouchableOpacity onPress={this.props.onPress}>

                    <View >


                        <View style={[this.state.containerStyle,this.props.style ]}>


                            <Text numberOfLines={1} style={[this.state.leftTitleStyle,{flex:1}]}>{this.props.leftTitle}</Text>

                            <View style={{flexDirection:'row-reverse',alignItems:'center',flex:2}}>


                                {this._renderArrow()}

                                {
                                    this.props.rightTitle ?

                                        <View onPress={this.props.onPress}>
                                            <Text numberOfLines={1} style={[this.state.rightTitleStyle]}>{this.props.rightTitle}</Text>
                                        </View> : null
                                }


                            </View>


                        </View>

                        {this._renderLine()}








                    </View>
                </TouchableOpacity>

            );
        }
    }


}


class YQFAlertTextView extends Component
{




    render()
    {



        return(


            <View>

                <Text></Text>



            </View>


        );
    }


}



