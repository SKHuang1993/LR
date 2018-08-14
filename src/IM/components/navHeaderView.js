/**
 * Created by yqf on 2017/10/30.
 */

import React, { Component } from 'react';
import Colors from '../Themes/Colors';
import {Chat} from '../utils/chat'

import {


    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Platform,

} from 'react-native';

//type ==1 ? 左右两边都是图标  ＝＝2 ？ 左边是图标，右边是文字？ ＝＝3？ 左边文字右边图标 ==Home ?左边右边图标中间view


export default class YQFNavHeaderView extends Component{


    constructor(props)
    {
        super(props);

        this.state={

            navHeight:Platform.OS == 'ios' ? 20 : 0,

            type:this.props.type,
            value:'',//搜索框的文字
            titleStyle:{

                color:this.props.titleColor ? this.props.titleColor : Chat.obj.Source =='抢单'? 'rgb(255,255,255)' : 'rgb(51,51,51)',
                fontSize:this.props.titleFont ? this.props.titleFont : 20,
                textAlign:'center',
            },

            containerStyle:{

                backgroundColor:this.props.backgroundColor ? this.props.backgroundColor:'rgb(255,255,255)',
                // flexDirection:'row',

            }


        }
    }





    render()
    {



//左边图标，右边文字
        if(this.state.type==2)
        {
            return(

                <View style={[{ height: 64,},this.state.containerStyle]}>

                    <View style={{height:this.state.navHeight}}>
                        <StatusBar barStyle={'default'}>

                        </StatusBar>
                    </View>


                    <View style={{justifyContent:'space-between',flex:1,flexDirection:'row'}}>

                        <TouchableOpacity style={[{alignItems:'flex-start',justifyContent:'center', flex:3}]}
                                          onPress={()=>{this.props.onpressLeft()}}>

                            <Text style={{  fontFamily:'iconfontim',fontSize:20,color:Colors.colors.Chat_Color51,marginLeft:10}}>{String.fromCharCode(this.props.leftIcon)}</Text>

                        </TouchableOpacity>


                        <View style={{justifyContent:'center',alignItems:'center',height:44,flex:6}}>
                            <Text style={[{fontSize:20,color:Colors.colors.Chat_Color51,},this.state.titleStyle]} numberOfLines={1}>{this.props.title}</Text>
                        </View>


                        <TouchableOpacity style={[{flex:3, alignItems:'flex-end',justifyContent:'center'},]}
                                          onPress={()=>{this.props.onpressRight()}}>

                            <Text style={{  fontSize:14,color:Colors.colors.Chat_Color51,marginRight:10, textAlign:'right'}}>{this.props.rightIcon}</Text>

                        </TouchableOpacity>

                    </View>

                    <View style={{backgroundColor:Colors.colors.Chat_Color220,height:0.5,marginBottom:0}}></View>


                </View>

            );


        }

        //左边文字，右边图标

        else if(this.state.type==3)
        {

            return(


                <View style={[{ height: 64,},this.state.containerStyle]}>


                    <View style={{height:this.state.navHeight}}>
                        <StatusBar barStyle={'default'}>

                        </StatusBar>
                    </View>


                    <View style={{marginTop:0,justifyContent:'space-between',flex:1,flexDirection:'row'}}>

                        <TouchableOpacity style={[{marginTop:0,alignItems:'flex-start',justifyContent:'center', },styles.flex]}
                                          onPress={()=>{this.props.onpressLeft()}}>

                            <Text style={{  fontSize:15,color:Colors.colors.Chat_Color51,marginLeft:10, textAlign:'left'}}>{this.props.leftIcon}</Text>

                        </TouchableOpacity>


                        <View style={{marginTop:0,flex:4, justifyContent:'center',alignItems:'center',height:44,}}>
                            <Text style={{fontSize:20,color:Colors.colors.Chat_Color51,}} numberOfLines={1}>{this.props.title}</Text>
                        </View>


                        <TouchableOpacity style={{marginTop:0,justifyContent:'center',alignItems:'flex-end',flex:1}}
                                          onPress={()=>{this.props.onpressRight()}}>

                            <Text style={{  fontSize:20,color:Colors.colors.Chat_Color51,marginRight:10,}}>{String.fromCharCode(this.props.rightIcon)}</Text>

                        </TouchableOpacity>

                    </View>

                    <View style={{backgroundColor:Colors.colors.Chat_Color220,height:0.5,marginBottom:0}}></View>


                </View>

            );

        }

        //左边文字标题，右边文字标题
        else  if(this.state.type == 4)
        {
            return(


                <View style={[{ height: 64,},this.state.containerStyle]}>

                    <View style={{height:this.state.navHeight}}>
                        <StatusBar barStyle={'default'}>

                        </StatusBar>
                    </View>

                    <View style={{marginTop:0,justifyContent:'space-between',flex:1,flexDirection:'row'}}>


                        <TouchableOpacity style={[{marginTop:0,alignItems:'flex-start',justifyContent:'center',flexDirection:'row'},styles.flex]}
                                          onPress={()=>{this.props.onpressLeft()}}>

                            <Text style={{ fontFamily:'iconfontim',fontSize:15,color:Colors.colors.Chat_Color51,marginLeft:10, textAlign:'left'}}>{String.fromCharCode(this.props.leftIcon)}</Text>
                            <Text style={{  fontSize:15,color:Colors.colors.Chat_Color51,marginLeft:3, textAlign:'left'}}>{this.props.leftTitle}</Text>

                        </TouchableOpacity>


                        <View style={{marginTop:0,flex:3, justifyContent:'center',alignItems:'center',height:44,}}>
                            <Text style={{fontSize:20,color:Colors.colors.Chat_Color51,}} numberOfLines={1}>{this.props.title}</Text>
                        </View>


                        <TouchableOpacity style={{marginTop:0,justifyContent:'center',alignItems:'flex-end',flex:1}}
                                          onPress={()=>{this.props.onpressRight()}}>

                            <Text style={{ fontFamily:'iconfontim',fontSize:15,color:Colors.colors.Chat_Color51,marginLeft:10, textAlign:'left'}}>{String.fromCharCode(this.props.rightIcon)}</Text>
                            <Text style={{  fontSize:15,color:Colors.colors.Chat_Color51,marginLeft:3, textAlign:'right'}}>{this.props.rightTitle}</Text>
                        </TouchableOpacity>

                    </View>

                    <View style={{backgroundColor:Colors.colors.Chat_Color220,height:0.5,marginBottom:0}}></View>

                </View>

            );

        }

        //搜索
        else  if(this.state.type == 'search')
        {

            return(

                <View style={[{ height: 64,},this.state.containerStyle]}>

                    <View style={{height:this.state.navHeight}}>
                        <StatusBar barStyle={'default'}>

                        </StatusBar>
                    </View>


                    <View style={{marginTop:0,justifyContent:'space-between',flex:1,flexDirection:'row'}}>


                        <TouchableOpacity style={[{marginTop:0,alignItems:'flex-start', alignItems:'center',justifyContent:'center',flex:1}]}
                                          onPress={()=>{this.props.onpressLeft()}}>

                            <Text style={{ fontFamily:'iconfontim',fontSize:18,color:Colors.colors.Chat_Color51}}>{String.fromCharCode('0xe183')}</Text>

                        </TouchableOpacity>



                        <View style={{borderWidth:0.5,borderColor:Colors.colors.Chat_Color220,borderRadius:3,margin:7,marginLeft:0,marginRight:0, flex:8,justifyContent:'center',alignItems:'center',backgroundColor:Colors.colors.Chat_Color248,flexDirection:'row'}}>

                            <Text style={{fontFamily:'iconfontim',margin:10,color:'rgb(153,153,153)',fontSize:16}}>{String.fromCharCode('0xe171')}</Text>

                            <TextInput style={{flex:1,fontSize:13,}} placeholderTextColor={'rgb(153,153,153)'}
                                       placeholder={this.props.placeholder}
                                       underlineColorAndroid="transparent"
                                       returnKeyType={'search'}
                                       onEndEditing={this.props.onEndEditing}
                                       onChangeText={(Text)=>{

                        this.setState({

                            value:Text,

                        })

                    }}

                            >


                            </TextInput>

                        </View>


                        <TouchableOpacity style={{marginTop:0,justifyContent:'center',alignItems:'center',flex:1}}
                                          onPress={()=>{this.props.onpressRight()}}>

                            <Text style={{ fontSize:13,color:Colors.colors.Chat_Color51,}}>{'搜索'}</Text>

                        </TouchableOpacity>

                    </View>

                    <View style={{backgroundColor:Colors.colors.Chat_Color220,height:0.5,marginBottom:0}}></View>


                </View>

            )

        }


        //发现群
        else if(this.state.type == 'DiscoverGroup'){
            return(


                <View style={[{ height: 64,},this.state.containerStyle]}>

                    <View style={{height:this.state.navHeight}}>
                        <StatusBar barStyle={'default'}>

                        </StatusBar>
                    </View>


                    <View style={{marginTop:0,justifyContent:'space-between',flex:1,flexDirection:'row'}}>


                        <TouchableOpacity style={[{alignItems:'flex-start',justifyContent:'center', flex:2}]}
                                          onPress={()=>{this.props.onpressLeft()}}>

                            <Text style={{  fontFamily:'iconfontim',fontSize:20,color:Colors.colors.Chat_Color51,marginLeft:10}}>{String.fromCharCode(this.props.leftIcon)}</Text>

                        </TouchableOpacity>



                        <View style={{justifyContent:'center',alignItems:'center',height:44,flex:6}}>
                            <Text style={{fontSize:20,color:Colors.colors.Chat_Color51,}} numberOfLines={1}>{this.props.title}</Text>
                        </View>



                        <View style={{ flexDirection:'row', marginTop:0,justifyContent:'space-around',alignItems:'center',flex:2}}>


                            <Text onPress={this.props.onpressRight1} style={{ fontFamily:'iconfontim',fontSize:20,color:Colors.colors.Chat_Color51,marginLeft:10}}>{String.fromCharCode(this.props.rightIcon1)}</Text>
                            <Text onPress={this.props.onpressRight2} style={{ fontFamily:'iconfontim', fontSize:20,color:Colors.colors.Chat_Color51,marginLeft:3}}>{String.fromCharCode(this.props.rightIcon2)}</Text>
                        </View>

                    </View>

                    <View style={{backgroundColor:Colors.colors.Chat_Color220,height:0.5,marginBottom:0}}></View>

                </View>

            );




        }


        else if(this.state.type == 'Home') {

            return(

                <View style={[{ height: 64,},this.state.containerStyle]}>

                    <View style={{height:this.state.navHeight}}>
                        <StatusBar barStyle={'default'}>
                        </StatusBar>
                    </View>

                    <View style={{marginTop:0,justifyContent:'space-between',flex:1,flexDirection:'row'}}>


                        <TouchableOpacity style={{marginTop:0,justifyContent:'center',alignItems:'center',width:44,height:44,}}
                                          onPress={()=>{
                                              if(this.props.onpressLeft()){

                                                    this.props.onpressLeft()
                                              }


                                          }}>

                            {

                                Chat.obj.Source =='我去过'?
                                    <Text style={{  fontFamily:'iconfontim',fontSize:20,color:Colors.colors.Chat_Color51,margin:10,}}>{String.fromCharCode('0xe183')}</Text>
                                    :
                                    null

                            }





                        </TouchableOpacity>


                        <View style={{marginTop:0,flex:1,flexDirection:'row', justifyContent:'center',alignItems:'center',height:44,}}>
                            <Text style={{fontSize:20,color:Colors.colors.Chat_Color51,}} numberOfLines={1}>
                                {this.props.title}
                            </Text>

                            <View style={{width:10,height:10,backgroundColor:this.props.statusColor,marginLeft:5,borderRadius:5}}>

                            </View>

                        </View>


                        <TouchableOpacity style={{marginTop:0,justifyContent:'center',alignItems:'center',width:44,height:44,}}
                                          onPress={()=>{this.props.onpressRight()}}>

                            <Text style={{  fontFamily:'iconfontim',fontSize:20,color:Colors.colors.Chat_Color51,margin:10,}}>{String.fromCharCode(this.props.rightIcon)}</Text>

                        </TouchableOpacity>
                    </View>

                    <View style={{backgroundColor:Colors.colors.Chat_Color220,height:0.5,marginBottom:0}}></View>


                </View>);


        }

        //左边图标右边图标
        else
        {

            return(

                <View style={[{ height: 64,},this.state.containerStyle]}>

                    <View style={{height:this.state.navHeight}}>
                        <StatusBar barStyle={'default'}>

                        </StatusBar>
                    </View>

                    <View style={{marginTop:0,justifyContent:'space-between',flex:1,flexDirection:'row'}}>


                        <TouchableOpacity style={{marginTop:0,justifyContent:'center',alignItems:'center',width:44,height:44,}}
                                          onPress={()=>{this.props.onpressLeft()}}>

                            {
                                this.props.leftIcon ?   <Text style={{  fontFamily:'iconfontim',fontSize:20,color:Colors.colors.Chat_Color51,margin:10,}}>{String.fromCharCode(this.props.leftIcon)}</Text>
                                    :
                                    null

                            }





                        </TouchableOpacity>


                        <View style={{marginTop:0,flex:1, justifyContent:'center',alignItems:'center',height:44,}}>
                            <Text style={[{fontSize:20,color:Colors.colors.Chat_Color51,},this.state.titleStyle]} numberOfLines={1}>{this.props.title}</Text>
                        </View>


                        <TouchableOpacity style={{marginTop:0,justifyContent:'center',alignItems:'center',width:44,height:44,}}
                                          onPress={()=>{this.props.onpressRight()}}>

                            <Text style={{  fontFamily:'iconfontim',fontSize:20,color:Colors.colors.Chat_Color51,margin:10,}}>{String.fromCharCode(this.props.rightIcon)}</Text>

                        </TouchableOpacity>
                    </View>


                    <View style={{backgroundColor:Colors.colors.Chat_Color220,height:0.5,marginBottom:0}}></View>


                </View>);


        }


    }





    _renderLine(){


        return(
            <View style={{backgroundColor:Colors.colors.Chat_Color220,height:0.5,marginBottom:0}}></View>

        )

    }


}


const styles = StyleSheet.create({


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

    themeColor:{

        backgroundColor:'rgb(235,235,235)',
    },



});
