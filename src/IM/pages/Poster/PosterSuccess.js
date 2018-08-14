/**
 * Created by yqf on 2018/1/5.
 */

//海报保存成功


import { observer } from 'mobx-react/native';
import {observable, autorun,computed, extendObservable, action, toJS } from 'mobx'

import {Component} from 'react';
import React, { PropTypes } from 'react';
import Enumerable from 'linq';


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
    ActivityIndicator,
    Alert

} from  'react-native';

import YQFNavBar from '../../components/yqfNavBar';
import Colors from '../../Themes/Colors';


import {Chat} from '../../utils/chat';
import {RestAPI,ServingClient} from '../../utils/yqfws';
import YJActivityIndicator from '../../components/activity-indicator'




import Icon from '../../components/icon';
import PosterRecord from './PosterRecord';
import PosterCustom from './PosterCustom';

const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}


let canLoadVideoMore=false;
let scale = 169 / 276;


class  PosterSuccessModel extends  Component{

    @observable SortByCreate = false;//按上传时间排序

    @observable PageSize = 5;//数目
    @observable PageCount = 1;//页码
    @observable isVideoRefreshing = false;//是否刷新
    @observable RowCount = 0;
    @observable isLoading =true;//是否显示loading

    @observable selectIndex = 1;

    @observable Posters = [];

    @observable titleArray=[
        {name:'自选海报',select:false},
        {name:'早中晚报',select:true},

    ];

    @computed get getTitleDataSource(){

        ds1 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds1.cloneWithRows(this.titleArray.slice());
    }

    @computed get getDataSource(){

        ds2 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds2.cloneWithRows(this.Posters.slice());

    }

}




@observer
export  default class PosterSuccess extends  Component{

    constructor(props){
        super(props);
        this.store = new PosterSuccessModel();
    }


    _ToPosterRecord = ()=>{

        this.props.navigator.push({
            component:PosterRecord
        })

    }

    _ToPosterCustom= ()=>{

        this.props.navigator.push({
            component:PosterCustom,
            passProps:{
                type:'Image'
            }
        })


    }


    _renderNav(){
        return(
            <YQFNavBar title={'保存图片'}
                       leftIcon={'0xe183'}
                       rightText={'工作台'}
                       onRightClick={()=>{this.props.navigator.popToTop()}}
                       onLeftClick={()=>{

                           this.props.navigator.popToTop()

                       }} />
        )
    }

    _renderTop = ()=>{


        var text1 = this.props.type == 'video' ? '视频已保存至手机相册' :'海报已保存至手机相册';


        return(

            <View style={{padding:30,backgroundColor:'white'}}>


                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>

                    <View style={{marginRight:20, width:46,height:46,borderRadius:23,overflow:'hidden',justifyContent:'center',alignItems:'center',backgroundColor:'#26C281'}}>
                        <Icon size={30} color={'white'} icon={'0xe199'}/>
                    </View>
                    <Text style={{ color:'#333333',fontSize:15}}>{text1}</Text>
                </View>


                {
                    this.props.type == 'video' ? null
                        :

                        <View style={{marginTop:30, flexDirection:'row',alignItems:'center',justifyContent:'center'}}>

                            <Text
                                onPress={()=>this._ToPosterCustom()}
                                style={{color:'#333333', backgroundColor:'#CCCCCC',overflow:'hidden',marginRight:10, padding:10,borderRadius:2,borderColor:'#333333'}}>{'再生成一张'}</Text>
                            <Text

                                onPress={()=>this._ToPosterRecord()}
                                style={{color:'#333333',backgroundColor:'#CCCCCC',overflow:'hidden',marginLeft:10, padding:10,borderRadius:2,borderColor:'#333333'}}>{'生成记录'}</Text>

                        </View>
                }




            </View>

        )

    }


    _renderCenter = ()=>{

        return(

            <View style={{marginTop:20}}>

                <View style={{backgroundColor:'white', width:window.width,height:60,justifyContent:'center',alignItems:'center'}}>

                    <View style={{backgroundColor:'#EBEBEB',position:'absolute',top:30, width:window.width,height:1,justifyContent:'center',alignItems:'center'}} />

                    <Text style={{color:'#666666',fontSize:14,marginLeft:5,marginRight:5}}>{'分享'}</Text>

                </View>


            <ShareView clickItem={(item)=>{

                console.log('点击了这个item，分享到对应的平台，需要调配好ShareSDK的问题');

                Alert.alert('暂时保存图片存到本地，再分享到朋友圈')
            }}/>


            </View>
        )

    }


    render = ()=>{

        return(

            <View style={{backgroundColor:'rgb(240,245,244)',flex:1}}>

                {this._renderNav()}
                {this._renderTop()}
                {/*{this._renderCenter()}*/}


            </View>


        )

    }




}

//
var shareDatas=[

    {title:'0xe62a',info:'微信好友',showColr:'rgb(38,203,114)',type:'WechatSession',uri:require('../../image/login/Wechat.png')},
    {title:'0xe655',info:'微信朋友圈',showColr:'rgb(38,203,114)',type:'WechatTimeline',uri:require('../../image/login/friend.png')},
    {title:'0xe628',info:'QQ',showColr:'rgb(233,80,63)',type:'QQ',uri:require('../../image/login/QQ.png')},
    {title:'0xe625',info:'新浪微博',showColr:'rgb(90,172,226)',type:'SinaWeibo',uri:require('../../image/login/SinaWeibo.png')},
]

class  ShareView extends Component{


    constructor(props){
        super(props);
        this.state = {
            dataSource:new ListView.DataSource({
                rowHasChanged:(r1,r2) => r1!==r2,
                sectionHeaderHasChanged:(s1,s2) => s1!==s2
            }),
        };
    }

    render(){
        return(


                    <ListView dataSource={this.state.dataSource.cloneWithRows(shareDatas)}
                              renderRow={this.renderShare.bind(this)}
                              horizontal={true}
                              showsHorizontalScrollIndicator={false}
                              removeClippedSubviews={false}
                              initialListSize={10}
                              contentContainerStyle={styles.list}
                              style={[styles.listStyle]}
                    >

                    </ListView>

        );
    }

    renderShare(shareItem,sectionId,rowId)
    {
        return(
            <TouchableOpacity style={styles.shareItem} onPress={()=>{
                this.props.clickItem(shareItem);
            }}>
                <Image source={shareItem.uri} style={styles.loginWayItem} ></Image>
                <Text style={styles.shareInfo}>{shareItem.info}</Text>
            </TouchableOpacity>
        )
    }


}


const styles = StyleSheet.create({


    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(240,240,240)',
    },
    button: {
        marginBottom: 10,
        fontWeight: '500',
    },
    image: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
        backgroundColor: 'black',
    },




    itemStyle: {
        // 对齐方式
        alignItems:'center',
        justifyContent:'center',
        // 尺寸
        width:   90,
        height:150,
        // 左边距
        margin:5,
        marginBottom:0,

    },

    itemImageStyle: {
        // 尺寸
        width:  90,
        height:150,

    },
    mediaMain:{
        flex:1,

        position:'absolute',
        width:window.width,
        height:window.height,

        top:56,
        left:0,
    },

    mediaBG:{
        top:0,
        left:0,
        width:window.width,
        height:window.height,
        backgroundColor:'rgba(0,0,0,0.6)',

    },
    mediaShow:{
        position:'absolute',
        width:window.width,
        top:window.height,
        // top:220,
        left:0,
    },


    mediaItem:{
        borderBottomColor:'rgb(240,240,240)',
        borderBottomWidth:1,
        backgroundColor:'white',


    },
    mediaInfo:{
        textAlign:'center',
        fontSize:18,
        padding:15,
    },


    shareItem:{
        flexDirection:'column',
        //justifyContent:'center',
        alignItems:'center',
        //backgroundColor:'blue',
        //margin:8,



    },
    listStyle:{
        paddingLeft:25,
        backgroundColor:'white',
        borderBottomWidth:1,
        borderBottomColor:'rgb(240,240,240)',


    },
    list:{
        flexDirection:'row',
        // alignItems:'center',
        // flexWrap:'wrap',

    },


    shareInfo:{

        fontSize:12,
        paddingBottom:5,
        // color:'white',


    },
    shareCancle:{

        borderTopWidth:1,
        borderTopColor:'rgb(240,240,240)',
    },
    shareCancleInfo:{
        //flex:1,
        //width:Common.window.width,
        //height:45,

        padding:20,
        textAlign:'center',
        backgroundColor:'white',
        fontSize:18,
        color:'#999',
    },

    loginWayItem:{
        margin:10,
        width:45,
        height:45,
        //marginBottom:30,
    },


})
