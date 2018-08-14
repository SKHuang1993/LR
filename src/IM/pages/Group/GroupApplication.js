

import { observer } from 'mobx-react/native';

import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'

import {

    StyleSheet,
    View,
    Image,
    Text,
    ListView,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';


import YQFNavBar from '../../components/yqfNavBar';

import YQFProgress from '../../components/YQFProgressHUD';
import {Chat} from '../../utils/chat';
import Colors from '../../Themes/Colors';


import groupApplication from '../../stores/Group/GroupApplication'

@observer
export  default  class GroupApplication extends Component
{

    constructor(props)
    {
        super(props);
        this.store = new groupApplication();

    }

    //重新发出申请加群。


      _confirm()
    {

        var GroupIMNr = this.props.GroupIMNr;

        //申请理由
        var text;
        if(this.store.text &&  this.store.text.length>0){
            text =this.store.text;
        }
        else {
            text ='我是'+Chat.getLoginInfo().User.Name;
        }

        var message={

            GroupIMNr:GroupIMNr,//群组id
            Wording:text,//申请理由
        };


        //点击确定时发出申请加群
        Chat.JoinGroup(message,(response)=>{

             // console.dir(response);
            this.store.isLoading=false;
            this.props.navigator.pop();
            Alert.alert('请求发送成功，等待管理员审核');

        },(failure)=>{


            Alert.alert('你已经是群成员了');

            // console.dir(failure);

        });


    }




    render()
    {
        return(


            <View style={{backgroundColor:Colors.colors.Chat_Color235,flex:1}}>

                <YQFNavBar title={'申请入群'}
                                  leftIcon={'0xe183'}
                                  rightText={'提交'}

                                  onLeftClick={()=>{

            this.props.navigator.pop();

                                  }}
                                  onRightClick={()=>{this._confirm();}}
                />


                <View style={{backgroundColor:'white'}}>

                    <TextInput
                        multiline={true}
                        underlineColorAndroid="transparent"
                        placeholder={'请输入您申请加入群的理由'}
                        onChangeText={(text)=>{

                            this.store.text = text;
           }}
                        style={{height:150,backgroundColor:'white',fontSize:15,margin:5}}>

                    </TextInput>



                </View>


            </View>




        )
    }


}





