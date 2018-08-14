/**
 * Created by yqf on 2017/12/5.
 */
//视频列表
import { observer } from 'mobx-react/native';
import {observable, autorun,computed, extendObservable, action, toJS } from 'mobx'

import {Component} from 'react';
import React, { PropTypes } from 'react';
import Enumerable from 'linq';
import {
    View,
    Text,
    Image,
    TextInput,
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
    RefreshControl

} from  'react-native';

import YQFNavBar from '../../components/yqfNavBar';
import YQFEmptyView from '../../components/EmptyView';
import    ActivityIndicator from '../../components/activity-indicator';

import Icon from '../../components/icon';
import {Chat} from '../../utils/chat';
import {RestAPI,ServingClient} from '../../utils/yqfws';
import Colors from '../../Themes/Colors';
import Search from '../Contact/FriendSearch';
import LoadMoreFooter from '../../components/LoadMoreFooter';
import VideoDetail from './VideoDetail';
import Myplayer from '../../components/Myplayer'
const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}


class VideoSearchModel extends  Component{

    @observable SortByPlayCount = false;//按播放次数排序
    @observable SortByCreate = false;//按上传时间排序

    @observable StartDate = null;//开始时间
    @observable EndDate = null;//结束时间
    @observable Title = null;//标题(模糊匹配)
    @observable IsPublish = null;//是否公开

    @observable UserCode = null;//上传用户账号
    @observable LabelID = null;//	标签ID
    @observable ClassID = null;//分类ID
    @observable IsOwnVideo = null;//是否自己上传的视频
    @observable IsLoginUserFavorite = null;//是否返回登录人的收藏视频,配合LoginUserCode一起使用
    @observable LoginUserCode = null;//	登录账号
    @observable LoginPersonCode = null;//登录人
    @observable OrderBy = null;//自定义排序：例: a.PlayCount desc,默认按CreateDate排序
    @observable PageSize = 2;//数目
    @observable PageCount = 1;//页码


    @observable canLoadVideoMore = false;//是否能加载更多
    @observable isVideoRefreshing = false;//是否刷新
    @observable RowCount = 0;
    @observable VideoLists =[];

    @observable isLoading =true;//是否显示loading

    @computed get getDataSource(){

        ds3 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds3.cloneWithRows(this.VideoLists.slice());
    }

}

@observer
export  default  class VideoSearch extends  Component {

    constructor(props){
        super(props);
        this.store = new VideoSearchModel();
    }

    componentDidMount = ()=>{
        this._fetchData()
    }


    _fetchData = async()=>{

        //暂时调用我去过的搜索游记接口
        var param ={

            Title:this.store.Title,//标题(模糊匹配)
            PageSize:this.store.PageSize,//每页行数
            PageCount:this.store.PageCount,//页码
            IsPublish:this.store.IsPublish,////是否公开
        };

        // console.log('现在的请求参数')
        // console.dir(param);


        var result = await  ServingClient.execute('Channel.VideoByCondition',param);
        // console.dir(result);

        //加载完马上将刷新关掉
        this.store.isVideoRefreshing = false;

        if(result && result.VideoList && result.VideoList.length>0){

            this.store.RowCount = result.RowCount;
            this.store.isLoading = false;
            this.store.isEmpty = false;

            //如果是刷新的话，则将之前的视频清空，接着将最新的视频赋值

            //刷新
            if(this.store.PageCount == 1){

                this.store.VideoLists = result.VideoList;

            }else {  //如果是加载更多的话，则将新视频，拼接到原来的旧数组上面去

                //关闭加载更多
                this.store.canLoadVideoMore =false;

                this.store.VideoLists = this.store.VideoLists.concat(result.VideoList).slice();

            }
        }

        else {

            //

            this.store.isLoading = false;
            this.store.isEmpty = true;
        }
    }




    _renderLine(){

        return(
            <View style={{backgroundColor:'rgb(235,235,235)',height:10,}}></View>
        )
    }

    renderRow = (data)=>{

        var imageW = 100;
        var imageH= 130;
        var ImageUrl = data.VideoDetail.ImageUrl;
        var Title = data.Title;
        var LabelDisplay ='标签:'+data.LabelDisplay;
        var ClassName = '分类:'+data.ClassName;
        var PersonName = '上传者:'+data.PersonName;
        var UploadDate = data.UploadDate;
        var PlayCount = '已播放'+data.PlayCount+'次';
        var margin=10;
        var titleMaxWidth = window.width - imageW - margin *3;


        return(
            <View
                style={[{margin:0,backgroundColor:'white'}]}>

                <View style={{flexDirection:'row'}}>


                    <TouchableOpacity onPress={()=>{this._ToVideoDetail(data)}}>

                        <Image
                            style={{width:imageW,height:imageH,resizeMode:'cover',borderRadius:2,margin:margin}}
                            source={{uri:ImageUrl}}>

                        </Image>
                    </TouchableOpacity>


                    <View style={{}}>

                        <Text numberOfLines={1} style={{ color:Colors.colors.Chat_Color51,fontSize:16,marginTop:margin,maxWidth:titleMaxWidth}}>{Title}</Text>
                        <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:margin}}>{LabelDisplay}</Text>
                        <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:margin}}>{ClassName}</Text>

                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:margin}}>
                            <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:0}}>{PersonName}</Text>
                            <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:0,marginRight:margin}}>{PlayCount}</Text>
                        </View>

                        <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:margin}}>{UploadDate}</Text>

                    </View>


                </View>

                {this._renderLine()}

            </View>
        )


    }

    //导航条
    renderNavBar=()=>{
        return(
            <YQFNavBar  leftIcon={'0xe183'}
                        onLeftClick={()=>{this.props.navigator.pop()}}
                        title={'搜索视频'}/>
        )
    }


    render = ()=>{

        return(

            <View style={{flex:1,backgroundColor:'rgb(235,235,235)'}}>

                {this.renderNavBar()}


            </View>
        )


    }

}
