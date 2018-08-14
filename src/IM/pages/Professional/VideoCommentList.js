/**
 * Created by yqf on 2017/12/6.
 */


import { observer } from 'mobx-react/native';
import {observable, autorun,computed, extendObservable, action, toJS } from 'mobx'

import {Component} from 'react';
import React, { PropTypes } from 'react';
import Video from 'react-native-video';

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
    Switch,
    Platform,
    Dimensions,
    RefreshControl,
    Alert,

} from  'react-native';

import YQFNavBar from '../../components/yqfNavBar';
import Button from '../../components/Button';
import Icon from '../../components/icon';
import {Chat} from '../../utils/chat';
import {RestAPI,ServingClient} from '../../utils/yqfws';
import Colors from '../../Themes/Colors';
import Search from '../Contact/FriendSearch';
import    ActivityIndicator from '../../components/activity-indicator';
import Enumerable from 'linq';

const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}



class VideoCommentListModel extends  Component{

    @observable VideoComments =[];//视频评论列表



    @computed get getVideoCommentsDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.VideoComments.slice());
    }




}



export  default  class  VideoCommentList extends  Component{

    constructor(props){
        super(props);
        this.store = new VideoCommentListModel();

        this.store.VideoComments = props.VideoComments;
    }

    _renderLine(){

        return(
            <View style={{backgroundColor:'rgb(235,235,235)',height:1,}}></View>
        )
    }


    renderCommentItem = (Comment)=>{


        var imageW = 50;
        var imageH = imageW;
        var margin = 10;
        var url =  'http://m.yiqifei.com/userimg/'+Comment.UserCode+'/3'

        return(
            <View
                style={[{margin:0,backgroundColor:'white'}]}>

                <View style={{flexDirection:'row'}}>

                    <Image
                        style={{width:imageW,height:imageH,resizeMode:'cover',borderRadius:imageW/2,margin:margin}}
                        source={{uri:url}}>
                    </Image>

                    <View style={{}}>

                        <View style={{flexDirection:'row',alignItems:'center',marginTop:margin}}>
                            <Text style={{color:Colors.colors.Chat_Color51,fontSize:13,marginTop:0}}>{Comment.PersonName}</Text>
                            <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:0,marginLeft:10}}>{Chat.showDate(Comment.CreateDate) }</Text>
                        </View>

                        <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:margin}}>{Comment.Content}</Text>

                    </View>


                </View>

                {this._renderLine()}

            </View>
        )
    }

    //评论列表
    renderCommentList = ()=>{

        if(this.store.VideoComments.length>0){

            return(
                <ListView

                    style={{marginTop:0,backgroundColor:'white'}}
                    renderRow={this.renderCommentItem}
                    dataSource={this.store.getVideoCommentsDataSource}
                >
                </ListView>
            )
        }
        return null;


    }

    //导航条
    renderNavBar=()=>{
        return(
            <YQFNavBar  leftIcon={'0xe183'}
                        onLeftClick={()=>{this.props.navigator.pop()}}
                        title={'评论列表'}/>
        )
    }


    render = ()=>{

        return(

            <View style={{flex:1,backgroundColor:'rgb(235,235,235)'}}>

                    {this.renderNavBar()}
                    {this.renderCommentList()}

            </View>
        )


    }

}

