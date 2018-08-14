/**
 * Created by yqf on 2017/10/31.
 */
/**
 * Created by yqf on 17/3/2.
 */


import React, { Component } from 'react';
import {

    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,
    ListView,
    TextInput,

} from 'react-native';



export default class Button extends Component
{


    constructor(props)
    {
        super(props);

        this.state={

            containerStyle:{
                height:this.props.height ? this.props.height : 49,
                backgroundColor:this.props.backgroundColor ? this.props.backgroundColor:'white',
                borderRadius:this.props.borderRadius ?this.props.borderRadius :0,

            },


            iconStyle:{

                fontSize:this.props.iconFont,
                color:this.props.iconColor,
                fontFamily:'iconfont',
                marginRight:0,
                marginLeft:3,
                color:this.props.titleColor? this.props.titleColor : 'rgb(244,72,72)'

            },
            titleStyle:{

                fontSize:this.props.titleFont ? this.props.titleFont:16,
                color:this.props.titleColor,
                marginLeft:this.props.icon ? 5 : 0 ,
                marginRight:this.props.icon ? 3 : 0 ,
                color:this.props.titleColor? this.props.titleColor : 'rgb(244,72,72)',

                // fontWeight:'bold',


            }


        }

    }


    render()
    {
        return(


            <TouchableOpacity onPress={this.props.onPress}>


                <View style={[this.state.containerStyle,styles.center,styles.row]}>

                    {
                        this.props.icon ?                     <Text style={[this.state.iconStyle,{fontSize:16, color:'#F44848',margin:2,},]}>{String.fromCharCode(this.props.icon)}</Text>
                            :null

                    }


                    <View>

                        <Text style={[this.state.titleStyle]}>{this.props.title}</Text>
                    </View>

                </View>


            </TouchableOpacity>



        );

    }
}

const styles = StyleSheet.create(
    {


        flex:{
            flex:1,
        },

        row:{

            flexDirection:'row',
        },

        center: {

            justifyContent: 'center',
            alignItems: 'center',

        },

    });
