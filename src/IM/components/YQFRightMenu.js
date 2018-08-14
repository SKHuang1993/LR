/**
 * Created by yqf on 2017/11/1.
 */
/**
 * Created by yqf on 17/4/26.
 */


import React, { Component } from 'react';


import {

    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,
    ScrollView,
    TouchableWithoutFeedback,

} from 'react-native';


//菜单右上角的菜单 title:文字  icons:图标


export  default  class  YQFRightMenu extends  Component
{


    render()
    {
        return(


            <View style={{position:'absolute',top:0,bottom:0,left:0,right:0,
                        backgroundColor:'rgba(0,0,0,0)'}}>


                <TouchableOpacity style={{position:'absolute',top:0,bottom:0,left:0,right:0,
                        backgroundColor:'rgba(0,0,0,0.3)'}} onPress={()=>{

                this.props.whiteClick();

                       }
                       }>

                </TouchableOpacity>



                <Text style={{fontFamily:'iconfontim',position:'absolute', top:54,right:15,width:20,height:10,color:'white'}}>
                    {String.fromCharCode('0xe191')}
                </Text>




                <View style={{position:'absolute',
                top:64,right:10,width:120,backgroundColor:'white',

                borderRadius:5,
                overflow:'hidden',
                }}>
                    {
                        this.props.titles.map((value,i)=>{

                            return(

                                <View>

                                    <TouchableOpacity
                                        onPress={()=>{this.props.callback(i)}}
                                        style={[{flexDirection:'row', backgroundColor:'white',height:44,alignItems:'center'}]}>

                                        <Text style={{fontFamily:'iconfontim',fontSize:18,margin:10,color:'rgb(102,102,102)'}}>{String.fromCharCode(this.props.icons[i])}</Text>

                                        <Text  style={{color:'rgb(51,51,51)',fontSize:14}}>{this.props.titles[i]}</Text>

                                    </TouchableOpacity>

                                    <View style={{height:0.5,backgroundColor:'rgb(153,153,153)'}}></View>
                                </View>


                            );
                        })



                    }







                </View>


            </View>

        );
    }


}

