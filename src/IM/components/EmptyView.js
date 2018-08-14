/**
 * Created by yqf on 2017/10/30.
 */
/**
 * Created by yqf on 17/3/7.
 */
/**
 * Created by yqf on 17/2/25.
 */
import React, { Component } from 'react';

import {

    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,


} from 'react-native';



export  default  class  EmptyView extends  Component
{

    constructor(props)
    {
        super(props);

        this.state={

            iconStyle:{

                fontFamily:'iconfontim',
                fontSize:this.props.size ? this.props.size : 70,
                color:this.props.color ? this.props.color :'rgb(204,204,204)',

            },
            titleStyle:{


                fontSize:this.props.fontSize ? this.props.fontSize :16,
                marginTop:this.props.marginTop?this.props.marginTop:10,
                color:this.props.color ? this.props.color :'rgb(153,153,153)',

            },





        }
    }



    render()
    {
        return(



            <View style={[{marginTop:100,alignItems:'center',flex:1}]}>

                <Text style={[this.state.iconStyle]}>{String.fromCharCode(this.props.icon)}</Text>
                <Text style={this.state.titleStyle}>{this.props.title}</Text>


            </View>




        );
    }

}




const styles =StyleSheet.create({

    textStyle:{
    },

    container:{




    },

    flex: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
    },

    center: {

        justifyContent:'center',
        alignItems:'center',
    },

    margin:{
        marginLeft:10,
        marginRight:5,

    },

});