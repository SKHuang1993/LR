/**
 * Created by yqf on 2017/12/4.
 */


//我的客户
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
    Dimensions,
    RefreshControl

} from  'react-native';

import YQFNavBar from '../../components/yqfNavBar';
import YQFEmptyView from '../../components/EmptyView';


import Icon from '../../components/icon';
import PicturePreview from './PicturePreview'
import {Chat} from '../../utils/chat';
import {RestAPI,ServingClient} from '../../utils/yqfws';
import Colors from '../../Themes/Colors';
import Search from '../Contact/FriendSearch';
import LoadMoreFooter from '../../components/LoadMoreFooter';

const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}


export  default  class MyCustomer extends  Component{


    constructor(props){
        super(props);

    }


    renderNavBar=()=>{
        return(
            <YQFNavBar  leftIcon={'0xe183'}
                        onLeftClick={()=>{this.props.navigator.pop()}}
                        title={'我的客户'}/>
        )
    }

    //搜索条
    renderSearchBar=()=>{
        return(

            <TouchableOpacity onPress={()=>{

             alert('搜索我的客户')

                }}


                              style={{backgroundColor:Colors.colors.Chat_Color230,height:45}}>


                <View style={{flex:1,margin:8,borderRadius:3, backgroundColor:'white', justifyContent:'center',alignItems:'center',flexDirection:'row'}}>

                    <Icon size={13} color={Colors.colors.Chat_Color153} icon={0xe171} style={{marginRight:3}}/>

                    <Text style={[{fontSize:13,marginLeft:3,color:Colors.colors.Chat_Color153}]}>
                        {'搜索我的客户'}
                    </Text>


                </View>


            </TouchableOpacity>
        )
    };


    render = ()=>{

        return(

            <View style={{flex:1,backgroundColor:'rgb(235,235,235)'}}>

                {this.renderNavBar()}
                {this.renderSearchBar()}
                {this.renderTitleView()}
                {this.renderContent()}

            </View>
        )

    }



}

