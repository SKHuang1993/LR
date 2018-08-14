
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



export  default  class  LoadingView extends  Component
{


    constructor(props)
    {
        super(props);

        this.state={


            ContainerStyle:{

                backgroundColor:this.props.backgroundColor ? this.props.backgroundColor : 'rgba(0,0,0,0.3)',

            },

            iconStyle:{

                fontFamily:'iconfontim',
                fontSize:this.props.size ? this.props.size : 20,
                color:this.props.color ? this.props.color :'white',

            },
            titleStyle:{

                fontSize:this.props.fontSize ? this.props.fontSize :16,
                marginTop:this.props.marginTop?this.props.marginTop:10,
                color:this.props.color ? this.props.color :'white',

            },




        }
    }



    render()
    {
        return(



            <View style={[{justifyContent:'center',alignItems:'center',flex:1},this.state.ContainerStyle]}>

                <Text style={[this.state.iconStyle]}>{String.fromCharCode('0xe653')}</Text>
                <Text style={this.state.titleStyle}>{this.props.title}</Text>

            </View>




        );
    }

}




const styles =StyleSheet.create({

    textStyle:{
        // color:this.props.textColor,
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