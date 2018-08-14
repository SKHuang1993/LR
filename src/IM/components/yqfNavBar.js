/**
 * Created by yqf on 2017/11/17.
 */


//根据传入的内容来渲染
/**
 * leftTitle 左边的标题 leftIcon 左边图标 leftClick 左边点击
 * rightTitle 右边的标题 rightIcon 左边图标 rightClick 左边点击
 * title 中间的标题
 * backgroundColor ? 有传，则显示，没有，我去过？=LR ？ =
 * */

import React, {
    Component
} from 'react'

import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    Dimensions,
    TextInput
} from 'react-native'

import NavigationBar from 'react-native-navbar';

import Icon from './icon';
import {Chat} from '../utils/chat'
const width= Dimensions.get('window').width;
const height= Dimensions.get('window').height;

import { isIphoneX } from 'react-native-iphone-x-helper'


const styles = {
    navbar: {
        alignItems: 'center',
    },
    title: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 30,
        //backgroundColor:'blue'
        // marginBottom: 5,
    },
    titleText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center'

    },
    button: {
        width: 35,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 16,
        color: '#333'
    },
    buttonIconFontText: {
        fontSize: 26,
        fontFamily: 'iconfont'
    },
    text: {
        color: '#fff',
        fontSize: 16,
    }
}

export  default  class YQFNavBar extends  Component{


    static defaultProps = {

        titleStyle:{}
    };
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    _leftOnClick() {
        if (this.props.onLeftClick) {
            this.props.onLeftClick()
        } else {
            if (this.props.navigator) this.props.navigator.pop()
        }

    }

    _leftContent() {


        let iconCode = this.props.leftIcon ? this.props.leftIcon : '0xe66e';

        if(this.props.leftIcon){
            return <Icon icon={iconCode} color={'#fff'} size={20} />
        }

      else  if (this.props.leftText) {
            return <Text style={styles.text}>{this.props.leftText}</Text>
        } else {
            return null

        }
    }

    _leftButton() {


      let paddingTop = Platform.OS == 'ios' ? 12 : 0;

        return (

            <TouchableOpacity activeOpacity={.7} style={{ paddingLeft: 10, paddingRight: 30, paddingBottom: paddingTop, paddingTop: paddingTop }}
                              onPress={this._leftOnClick.bind(this)}>
                {this._leftContent()}
            </TouchableOpacity>

        )

    }


    _rightContent() {
        let paddingTop = Platform.OS == 'ios' ? 0 : 0;




        let iconCode = this.props.rightIcon ? this.props.rightIcon : '0xe66e';
        if (!this.props.rightText && !this.props.rightIcon) return
        return <TouchableOpacity activeOpacity={.7} style={{ paddingLeft: 10, paddingRight: 10, paddingTop: paddingTop }}
                                 onPress={this.props.onRightClick}>
            {this.props.rightText ? <Text style={styles.text}>{this.props.rightText}</Text> : <Icon icon={iconCode} color={'#fff'} size={20} />}
        </TouchableOpacity>

    }

    _rightButton() {
        return (
            <View style={{ paddingRight: 10, }}>
                {this.props.rightView ? this.props.rightView : this._rightContent()}
            </View>
        )

    }

    _title() {
        return (
            <View style={[styles.title,this.props.titleStyle]}>
                <Text numberOfLines={1} style={styles.titleText}>{this.props.title ? this.props.title : '编辑'}</Text>
            </View>
        )
    }


    render() {

        let onlyBar = this.props.onlyBar ? true : false;
        let style = {
            paddingTop: Platform.OS === 'android' ? onlyBar ? 20 : 0 : 0,
            height: Platform.OS === 'android' ? onlyBar ? 64 : 44 : 44,
            marginTop: onlyBar ? -22 : 0,
        }


        //兼容安卓
        if (Platform.OS === 'android' && Platform.Version >= 21) {
            style = {
                paddingTop: Platform.OS === 'android' ? onlyBar ? 0 : 20 : 0,
                height: Platform.OS === 'android' ? onlyBar ? 44 : 64 : 44,
                marginTop: Platform.OS === 'ios' ? onlyBar ? -22 : 0 : 0,
                // height: Platform.OS === 'android' ? 44 : 44,
                // marginTop:Platform.OS==='android' ? 0 : onlyBar? -22:0,
            }
        }




        const statusBar = {
            style: 'light-content',
            hidden: Platform.OS === 'android' ? false : false,

            // height: Platform.OS === 'android' ? 64 : 44,
            //  marginTop:onlyBar? -22:0,
            // height: Platform.OS === 'android' ? 0 : 0,
            // marginTop:Platform.OS==='android' ? 0 : onlyBar? -22:0,
        }

        const tintColor = this.props.backgroundColor ? this.props.backgroundColor : Chat.obj.Source =='抢单' ? '#159E7D' :

                Chat.obj.Source =='我去过' ? '#fff' : 'rgb(255,255,255)';


        return (

            <View>

                {isIphoneX() && !onlyBar && <View style={{ height: 24, backgroundColor: tintColor}} />}


                {
                    this.props.type  ?

                        this.renderSearhBarNav()
                        :

                        <NavigationBar
                            style={[styles.navbar, style]}
                            containerStyle={{ backgroundColor: 'red' }}
                            tintColor={tintColor}
                            statusBar={statusBar}
                            leftButton={this._leftButton()}
                            rightButton={this._rightButton()}
                            title={this._title()}
                        />

                    }




            </View>
        )
    }




    //用于通讯录搜索的头部。（应该还有不少页面用到）
    renderSearhBarNav = ()=>{


        let onlyBar = this.props.onlyBar ? true : false;

        let style = {
            paddingTop: Platform.OS === 'android' ? onlyBar ? 20 : 0 : 0,
            height: Platform.OS === 'android' ? onlyBar ? 64 : 64 : 64,
            marginTop: onlyBar ? -22 : 0,
            backgroundColor:'#159E7D'
        }
        //兼容安卓
        if (Platform.OS === 'android' && Platform.Version >= 21) {
            style = {
                paddingTop: Platform.OS === 'android' ? onlyBar ? 0 : 20 : 0,
                height: Platform.OS === 'android' ? onlyBar ? 44 : 64 : 44,
                marginTop: Platform.OS === 'ios' ? onlyBar ? -22 : 0 : 0,
            }
        }





        if(this.props.type =="search"){

            return(

                <View style={[style]}>




                    <View style={{marginTop:20,justifyContent:'space-between',flex:1,flexDirection:'row',backgroundColor:'#159E7D',alignItems:'center'}}>


                        <TouchableOpacity style={[{marginTop:0,alignItems:'flex-start', alignItems:'center',justifyContent:'center',flex:1}]}
                                          onPress={()=>{this.props.onpressLeft()}}>

                            <Text style={{ fontFamily:'iconfontim',fontSize:18,color:'#fff'}}>{String.fromCharCode('0xe183')}</Text>

                        </TouchableOpacity>



                        <View style={{height:40, borderWidth:0.5,borderColor:'rgb(220,220,220)',borderRadius:3,margin:7,marginLeft:0,marginRight:0, flex:8,justifyContent:'center',alignItems:'center',backgroundColor:'rgb(248,248,248)',flexDirection:'row'}}>

                            <Text style={{fontFamily:'iconfontim',margin:10,color:'rgb(153,153,153)',fontSize:16}}>{String.fromCharCode('0xe171')}</Text>

                            <TextInput style={{flex:1, fontSize:13,}} placeholderTextColor={'rgb(153,153,153)'}
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

                            <Text style={{ fontSize:13,color:'#fff'}}>{'搜索'}</Text>

                        </TouchableOpacity>

                    </View>


                </View>

            )}else if(this.props.type=='DiscoverGroup'){

            return(

                    <View style={[style]}>

                        <View style={{marginTop:20,justifyContent:'space-between',flex:1,flexDirection:'row',backgroundColor:'#159E7D',alignItems:'center'}}>

                            <TouchableOpacity style={[{alignItems:'flex-start',justifyContent:'center', flex:2}]}
                                              onPress={()=>{this.props.onpressLeft()}}>

                                <Text style={{  fontFamily:'iconfontim',fontSize:20,color:'#fff',marginLeft:10}}>{String.fromCharCode(this.props.leftIcon)}</Text>

                            </TouchableOpacity>



                            <View style={{justifyContent:'center',alignItems:'center',height:44,flex:6}}>
                                <Text style={{fontSize:20,color:'#fff'}} numberOfLines={1}>{this.props.title}</Text>
                            </View>



                            <View style={{ flexDirection:'row', marginTop:0,justifyContent:'space-around',alignItems:'center',flex:2}}>


                                <Text onPress={this.props.onpressRight1} style={{ fontFamily:'iconfontim',fontSize:20,color:'#fff',marginLeft:10}}>{String.fromCharCode(this.props.rightIcon1)}</Text>
                                <Text onPress={this.props.onpressRight2} style={{ fontFamily:'iconfontim', fontSize:20,color:'#fff',marginLeft:3}}>{String.fromCharCode(this.props.rightIcon2)}</Text>
                            </View>

                        </View>


                    </View>

                )


        }else {
            return null
        }







    }







}

