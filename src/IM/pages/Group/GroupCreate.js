/**
 * Created by yqf on 2017/10/30.
 */


import { observer } from 'mobx-react/native';

import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import ContactSelect from '../Contact/ContactSelect';


import {
    TouchableOpacity,
    StyleSheet,
    Image,
    ListView,
    Text,
    View,
    RefreshControl,
    Dimensions,
    TextInput,
    Alert,


} from 'react-native';

import  groupCreate from '../../stores/Group/GroupCreate';

import YQFNavBar from '../../components/yqfNavBar';


const alertTitle='提示';


@observer

export default class GroupCreate extends Component{


    constructor(){
        super();
        this.store = new groupCreate();

    }
    componentDidMount(){

        this.listener = RCTDeviceEventEmitter.addListener('KickOff',()=>{

            this.props.navigator.popToTop();

        });
    }


    componentWillUnmount(){

        this.listener && this.listener.remove();

    }

    _confirm(){


        if(this.store.text && this.store.text.length>0){


            this.props.navigator.push({

                component:ContactSelect,
                passProps:{

                    type:'CreateGroup',
                    Name:this.store.text,

                }

            })


        }

        else {

            Alert.alert(alertTitle,'请输入群名称');
            return;

        }


    }

    render(){


        return(


            <View style={{backgroundColor:'rgb(247,247,247)',flex:1}}>

                <YQFNavBar title={'创建群聊'}
                           leftIcon={'0xe183'}
                           rightText={'下一步'}
                                  onLeftClick={()=>{this.props.navigator.pop()}}
                                  onRightClick={this._confirm.bind(this)}
                />

                <View style={[styles.center]}>

                    <Image style={[styles.center,{marginTop:20, width:150,height:150,resizeMode:'cover'}]} source={require('../../image/groupCreate.png')}>
                    </Image>
                    <Text style={[{marginTop:10,color:'rgb(153,153,153)'}]}>起个给力的群名字，小伙伴才更想加入哦~</Text>

                </View>

                <View style={{backgroundColor:'white',marginTop:20,}}>
                    <TextInput
                        placeholder={'请输入群名称'}
                        onChangeText={(text)=>{

                            this.store.text = text;


           }}
                        style={{marginLeft:10, height:40,backgroundColor:'white',fontSize:15}}>


                    </TextInput>

                </View>

            </View>

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

