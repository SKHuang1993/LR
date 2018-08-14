/**
 * Created by yqf on 2017/12/6.
 */

//视频播放列表

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



class VideoPlayListModel extends  Component{

    @observable VideoPlayLists =[];//视频评论列表



    @computed get getVideoCommentsDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.VideoPlayLists.slice());
    }


}


export  default  class  VideoPlayList extends  Component{

    constructor(props){
        super(props);
        this.store = new VideoPlayListModel();

        this.store.VideoPlayLists = props.VideoPlayLists;
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
                            <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:0,marginLeft:10}}>{Comment.CreateDate}</Text>
                        </View>

                        <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:margin}}>{Comment.Content}</Text>

                    </View>


                </View>

                {this._renderLine()}

            </View>
        )
    }

    renderPlayLogItem = (PlayLog)=>{

        //  var url = http://m.yiqifei.com/userimg/VBL00T54/2;
        var url =  'http://m.yiqifei.com/userimg/'+PlayLog.UserCode+'/3'

        return (
            <TouchableOpacity activeOpacity={.7}  onPress={()=>{}} style={styles.actionItem}>

                <Image style={{width:50,height:50,borderRadius:25}} source={{uri:url}}>
                </Image>
                <Text style={styles.actionText}>{PlayLog.PersonName}</Text>

            </TouchableOpacity>
        )


    }

    //评论列表
    renderPlayList = ()=>{

        var contentViewStyle={
            flexDirection:'row',
            flexWrap:'wrap'
        }


        if(this.store.VideoPlayLists.length>0){

            return(
                <ListView

                    style={{marginTop:0,backgroundColor:'white'}}
                    renderRow={this.renderPlayLogItem}
                    dataSource={this.store.getVideoCommentsDataSource}
                    contentContainerStyle={contentViewStyle}
                    removeClippedSubviews={false}
                    initialListSize={20}

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
                        title={'播放列表'}/>
        )
    }


    render = ()=>{

        return(

            <View style={{flex:1, backgroundColor:'rgb(235,235,235)'}}>

                {this.renderNavBar()}
                {this.renderPlayList()}

            </View>
        )


    }

}

const styles = StyleSheet.create({

    actionItem: {
        alignItems: 'center',
        justifyContent: "center",
        // width:window.width/4,
        margin: 10,
        backgroundColor:'white'
    },



    actionIcon: {

        fontSize: 20,
        color: '#fff'

    },
    actionText: {
        fontSize: 15,
        color: 'rgb(51,51,51)',
        marginTop:10
    },


})