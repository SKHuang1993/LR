/**
 * Created by yqf on 2017/11/1.
 */


//添加好友申请。（好友推荐过来，好友搜索过来，用户资料过来。）直接传User过来。最好里面有FaceUrlPath，IMNr。Name


import { observer } from 'mobx-react/native';
import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'

import {

    StyleSheet,
    Image,
    Text,
    View,
    TextInput,
    Alert

} from 'react-native';


import {IM} from '../../utils/data-access/im';
import {Chat} from '../../utils/chat';
import Colors from '../../Themes/Colors';
import YQFNavBar from '../../components/yqfNavBar';

import friendApplication from '../../stores/Contact/FriendApplication';

@observer
export default class FriendApplication extends Component{

    constructor(props){

        super(props);
        this.store = new friendApplication();
        this.store.text = '我是'+Chat.getLoginInfo().User.Name;
        this.store.User = this.props.User ? this.props.User : null

    }

    componentDidMount(){

        // console.warn('如果User为空时，需要发送请求获取用户资料');

    }

    _confirm(){

        //发送请求
        let text = this.store.text;

        var message={

            FriendIMNr:this.store.User.IMNr,//申请人账号
            Wording:text,//申请理由
        };

        Chat.AddFriend(message,(response)=>{
            this.props.navigator.pop();
            Alert.alert('你的申请已发出，需要对方同意才能加为好友');

        },(error)=>{


            this.props.navigator.pop();
            Alert.alert('请求失败，请稍后重试');

        });


    }

    _renderNav(){

        return(
            <YQFNavBar  title={'添加好友申请'}
                        leftIcon={'0xe183'}
                        rightText={'发送'}

                               onLeftClick={()=>{
            this.props.navigator.pop();

                                  }}
                               onRightClick={()=>{this._confirm()}}
            />
        )
    }

    _renderTop(){


        const margin=12;
        const iconW = 40;
        const iconH = iconW;
        const {Name,FaceUrlPath} = this.store.User;


        return(

            <View style={{backgroundColor:Colors.colors.Chat_Color235}}>

                <View style={{flexDirection:'row',alignItems:'center',}}>

                    <Image style={{margin:margin,resizeMode:'cover',width:iconW,height:iconH,borderRadius:iconW/2}}
                           source={{uri:Chat.getFaceUrlPath(FaceUrlPath)}}>

                    </Image>


                    <View style={{flex:1}}>

                        <Text style={{color:Colors.colors.Chat_Color51,fontSize:15}}>{Name}</Text>

                    </View>

                </View>

                <Text style={{marginLeft:margin,marginBottom:margin/2, color:Colors.colors.Chat_Color153}}>{'你需要发送验证申请，等对方通过'}</Text>


            </View>
        );


    }

    _renderTextInput(){

        return(
            <TextInput
                multiline={true}
                placeholder={'请输入验证信息'}
                value={this.store.text}
                underlineColorAndroid="transparent"

                onChangeText={(text)=>{

                    this.store.text = text;

           }}
                style={{height:100,backgroundColor:'white',fontSize:15,margin:5}}>


            </TextInput>
        )

    }



    render()
    {


        return(


            <View style={{backgroundColor:Colors.colors.Chat_Color235,flex:1}}>

                {this._renderNav()}
                {this._renderTop()}
                {this._renderTextInput()}

            </View>




        )
    }

}
