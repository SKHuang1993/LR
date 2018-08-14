/**
 * Created by yqf on 2017/12/3.
 */

//图片预览
import { observer } from 'mobx-react/native';
import {observable, autorun,computed, extendObservable, action, toJS } from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';


import {
    View,
    Text,
    Image,
    StyleSheet,
    ListView,
    ScrollView,
    TouchableWithoutFeedback,
    InteractionManager,
    StatusBar,
    WebView,
    AsyncStorage,
    TouchableOpacity,
    Modal,
    DeviceEventEmitter,
    ActivityIndicator,
    Switch,
    Platform,
    UIManager,
    Dimensions

} from  'react-native';

import YQFNavBar from '../../components/yqfNavBar';
import Icon from '../../components/icon';

import {Chat} from '../../utils/chat';
import {RestAPI} from '../../utils/yqfws';
import Colors from '../../Themes/Colors';
import Button from '../../components/Button';
import PictureTemplate from './PictureTemplate';


const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,
}


export  default  class PosterPreview extends  Component{

    constructor(props){
        super(props);

        this.state={
            uri:null
        }
    }

    _back = ()=>{
        this.props.navigator.pop();
    }


    //导航条
    renderNavBar=()=>{

        return(
            <YQFNavBar  leftIcon={'0xe183'}
                        rightText={'保存'}
                        onLeftClick={this._back}
                        onRightClick={()=>{alert('保存，利用截屏工具将当前页面截取存到本地')}}
                        title={'预览'}/>
        )
    }



    renderButton = ()=>{

        return(

            <View style={{margin:5}}>

        <Button onPress={()=>{()=>{alert('保存海报图片')}}}
                borderRadius={5}
                backgroundColor={Colors.colors.LR_Color}
                height={40}
                titleFont={20}
                title={'保存海报图片'}
                titleColor={'white'}></Button>


                
            </View>
        )

    }


    renderScrollView = ()=>{

        var margin=20;

      return(

          <ScrollView style={{flex:1}}>

              <Image style={{
                  marginLeft:margin,marginRight:margin,resizeMode:'cover', width:window.width-margin*2,height:window.height-64-margin*2}}
                               source={{uri:this.props.Template.url}}>

                  <View style={{position:'absolute',left:10,bottom:10,height:60,width:120,
                            backgroundColor:'white'}} >
                      <Text onPress={()=>{

                          this.props.navigator.push({
                              component:PictureTemplate

                          })

                      }}>{'选择图片'}</Text>

                  </View>



                  <View style={{position:'absolute',right:10,bottom:10,height:60,width:60,
                            backgroundColor:'white'}}>

                      <Text onPress={()=>{alert('选择二维码')}}>{'选择二维码'}</Text>


                  </View>



              </Image>



          </ScrollView>


      )


    }





    render = ()=>{

        return(

            <View style={{flex:1,backgroundColor:'rgb(235,235,235)'}}>



                {this.renderNavBar()}




                {this.renderScrollView()}



            </View>
        )

    }



}

