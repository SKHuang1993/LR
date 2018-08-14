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
import VideoSearch from './VideoSearch';

const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}

let canLoadVideoMore=false;


class VideoListModel extends  Component{

    @observable navigationTitle = '我的培训学院';

    @observable type = false;//vc类型  'VideoCollection'表示视频收藏

    @observable SortByPlayCount = false;//按播放次数排序


    @observable StartDate = null;//开始时间
    @observable EndDate = null;//结束时间
    @observable Title = null;//标题(模糊匹配)
    @observable IsPublish = null;//是否公开
    @observable UserCode = null;//上传用户账号
    @observable LabelID = null;//	标签ID
    @observable ClassID = null;//分类ID
    @observable IsOwnVideo = null;//是否自己上传的视频
    @observable IsLoginUserFavorite = false;//是否返回登录人的收藏视频,配合LoginUserCode一起使用
    @observable LoginUserCode = null;//	登录账号
    @observable LoginPersonCode = null;//登录人
    @observable OrderBy = null;//自定义排序：例: a.PlayCount desc,默认按CreateDate排序
    @observable PageSize = 20;//数目
    @observable PageCount = 1;//页码

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
export  default  class VideoList extends  Component {

    constructor(props){
        super(props);
        this.store = new VideoListModel();

        //判断是从培训学院还是视频收藏
        if(props.type == 'VideoCollection'){

            this.store.type = props.type;
            this.store.navigationTitle = '我的收藏';
            this.store.IsLoginUserFavorite = true;

        }

        // this.store.LoginUserCode = 'VBL00T54';
        // this.store.LoginPersonCode = 'VBK036D9';

        this.store.LoginUserCode = Chat.loginUserResult.AccountNo;
        this.store.LoginPersonCode = Chat.loginUserResult.PersonCode;

    }

    //将时间



    //上传时间排序
    SortByCreate = ()=>{

        this.store.SortByCreate = !this.store.SortByCreate;

        if(this.store.SortByCreate){
            this.store.VideoLists = Enumerable.from(this.store.VideoLists).orderByDescending(o => o.UploadDate).toArray();

        }else {
            this.store.VideoLists = Enumerable.from(this.store.VideoLists).orderBy(o => o.UploadDate).toArray();
        }

    }

    //播放次数排序
    SortByplayCount = ()=>{


        this.store.SortByPlayCount = !this.store.SortByPlayCount;

        if(this.store.SortByPlayCount){
            this.store.VideoLists = Enumerable.from(this.store.VideoLists).orderByDescending(o => o.PlayCount).toArray();

        }else {
            this.store.VideoLists = Enumerable.from(this.store.VideoLists).orderBy(o => o.PlayCount).toArray();
        }

    }

    componentDidMount = ()=>{
        this.onRefresh();
    }
    onScroll(){
        if(!canLoadVideoMore) canLoadVideoMore = true;
    }
    onRefresh = async()=> {

        this.store.PageCount = 1;//刷新时将页码设置为1
        canLoadVideoMore=false;
        this.store.isVideoRefreshing = true;
        this._fetchData();

    }

    onEndReach=async()=>{

        if(this.store.VideoLists.length==0 || (this.store.RowCount>0   && this.store.RowCount <=this.store.VideoLists.length))
        {
            return;
        }


        if (canLoadVideoMore)
        {

            var count =this.store.PageCount;
            this.store.PageCount = count+1;

            this._fetchData();
        }




    }
    renderFooter=()=>{


        if(this.store.VideoLists.length==0 || (this.store.RowCount>0   && this.store.RowCount <=this.store.VideoLists.length))
        {

            return(

                <View style={{justifyContent:'center',alignItems:'center',margin:10}}>

                <Text>没有更多了...</Text>

                </View>
            )
        }

        if (canLoadVideoMore){

            return <LoadMoreFooter/>
        }
    }


    _fetchData = async()=>{

        //暂时调用我去过的搜索游记接口
        var param ={

            Title:this.store.Title,//标题(模糊匹配)
            PageSize:this.store.PageSize,//每页行数
            PageCount:this.store.PageCount,//页码
            IsPublish:this.store.IsPublish,////是否公开
            LoginUserCode:this.store.LoginUserCode,
            LoginPersonCode:this.store.LoginPersonCode,
            IsLoginUserFavorite:this.store.IsLoginUserFavorite,
        };

        // console.log('现在的请求参数')
        // console.dir(param);


        var result = await  ServingClient.execute('Channel.VideoByCondition',param);
        //加载完马上将刷新关掉
        this.store.isVideoRefreshing = false;
        if(result && result.VideoList && result.VideoList.length>0){

            // console.log('现在的请求结果')
            // console.dir(result);

            this.store.RowCount = result.RowCount;
            this.store.isLoading = false;
            this.store.isEmpty = false;
            //如果是刷新的话，则将之前的视频清空，接着将最新的视频赋值
            //刷新
            if(this.store.PageCount == 1){
                this.store.VideoLists = result.VideoList.slice();
            }else {  //如果是加载更多的话，则将新视频，拼接到原来的旧数组上面去



                //关闭加载更多

                canLoadVideoMore =false;




                this.store.VideoLists = this.store.VideoLists.concat(result.VideoList).slice();

            }

        }

        else {

            //

            this.store.isLoading = false;
            this.store.isEmpty = true;
        }
    }


    VideoFavourite = async(data,rowId) =>{

        //根据data的UserF来判断，如果>0,则已经收藏过，现在要修改
        var VideoFavouriteCDParam={
            VideoID:data.ID,
            UserCode:this.store.LoginUserCode,
            PersonCode:this.store.LoginPersonCode,
            Action:data.UserVideoFavouriteID >0? 3 : 1,
            ID:data.UserVideoFavouriteID >0 ? data.UserVideoFavouriteID : null
        }


        var result = await  ServingClient.execute('Channel.VideoFavouriteCD',VideoFavouriteCDParam);

        this.onRefresh();

        // var temp = this.store.VideoLists;
        // temp[rowId].UserVideoFavouriteID = VideoFavouriteCDParam.ID;
        //
        // console.log('修改完成后的temp')
        //
        // console.dir(temp);
        //
        // this.store.VideoLists = temp.slice();

    }

    _VideoPlayAdd = async(data)=>{

        var VideoPlayAddParam = {
            VideoID: data.ID,
            UserCode: Chat.loginUserResult.AccountNo,
            PersonCode: Chat.loginUserResult.PersonCode,
        };

        var VideoPlayAddResult = await  ServingClient.execute('Channel.VideoPlayAdd', VideoPlayAddParam);


    }


    _ToVideoDetail = async(data)=>{


        //发送请求，添加视频播放记录



        //添加视频播放记录
        this._VideoPlayAdd(data);


        this.props.navigator.push({
            component:VideoDetail,
            passProps:{

                videoDetail:data

            }

        })

    }


    _renderLine(){

        return(
            <View style={{backgroundColor:'rgb(235,235,235)',height:10,}}></View>
        )
    }



    renderRow = (data,sectionId,rowId)=>{

        var imageW = 100;
        var imageH= 130;

        var ImageUrl;
        if( data.VideoDetail &&  data.VideoDetail.ImageUrl){
            ImageUrl = data.VideoDetail.ImageUrl;
        }else {
            ImageUrl = 'http://img3.imgtn.bdimg.com/it/u=2278644159,2868052534&fm=27&gp=0.jpg'
        }

        //是否收藏过
        var UserVideoFavouriteID = data.UserVideoFavouriteID;
        if(UserVideoFavouriteID && UserVideoFavouriteID>0){
            //证明收藏过

        }

        var Title = data.Title;
        var LabelDisplay ='标签:'+data.LabelDisplay;
        var ClassName = '分类:'+data.ClassName;
        var PersonName = '上传者:'+data.PersonName;
        var UploadDate = Chat.showDate(data.UploadDate);
        var PlayCount = '已播放'+data.PlayCount+'次';
        var margin=10;
        var titleMaxWidth = window.width - imageW - margin *3;

        return(

            <TouchableOpacity onPress={()=>{this._ToVideoDetail(data)}}>


            <View
                style={[{margin:0,backgroundColor:'white'}]}>

                <View style={{flexDirection:'row'}}>

                    <Image
                        style={{justifyContent:'center',alignItems:'center',width:imageW,height:imageH,resizeMode:'cover',borderRadius:2,margin:margin}}
                        source={{uri:ImageUrl}}>

                        <Icon style={{backgroundColor:'transparent'}}  icon={'0xe6cd'} color={'gray'} size={20} />
                    </Image>

                <View style={{width:titleMaxWidth}}>

                    <Text numberOfLines={1} style={{ color:Colors.colors.Chat_Color51,fontSize:16,marginTop:margin,maxWidth:titleMaxWidth}}>{Title}</Text>
                    <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:margin}}>{LabelDisplay}</Text>
                    <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:margin}}>{ClassName}</Text>

                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:margin}}>
                        <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:0}}>{PersonName}</Text>
                        <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:0,marginRight:margin}}>{PlayCount}</Text>
                    </View>

                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:margin}}>

                    <Text style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:5}}>{UploadDate}</Text>


                        {
                            UserVideoFavouriteID && UserVideoFavouriteID>0 ?

                                <Icon onPress={()=>{this.VideoFavourite(data,rowId)}}   style={{marginRight:10}} icon={'0xe6df'} color={'red'} size={20} />
                                :
                                <Icon onPress={()=>{this.VideoFavourite(data,rowId)}}  style={{marginRight:10}}  icon={'0xe693'} color={'rgb(51,51,51)'} size={20} />
                        }


                    </View>
                </View>


            </View>

                {this._renderLine()}

            </View>
            </TouchableOpacity>
        )


    }

    //导航条
    renderNavBar=()=>{
        return(
            <YQFNavBar  leftIcon={'0xe183'}
                        rightText={this.store.type =='VideoCollection'?'':'我的收藏'}
                        onRightClick={()=>{

                            if(this.store.type !=='VideoCollection'){

                                  this.props.navigator.push({
                                component:VideoList,
                                passProps:{
                                    type:'VideoCollection'
                                }
                            })

                            }



                        }}
                        onLeftClick={()=>{this.props.navigator.pop()}}
                        title={this.store.navigationTitle}/>
        )
    }



    renderTextInput = ()=>{

        if(Chat.isAndroid()){

            <TextInput
                style={{ width:window.width-50,margin:5,color:Colors.colors.Chat_Color51}}
                placeholder={'请输入关键字搜索'}

                returnKeyType={'search'}
                onChangeText={(text)=>{
                            this.store.Title = text;
                        }}
                multiline={false}
                onSubmitEditing={(text) => {


                            this.store.PageCount =1;//刷新当前
                               this._fetchData();
                             }}
                underlineColorAndroid='transparent'>


            </TextInput>

        }
        return(

            <TextInput
                style={{ width:window.width-50,padding:10,color:Colors.colors.Chat_Color51}}
                placeholder={'请输入关键字搜索'}

                returnKeyType={'search'}
                onChangeText={(text)=>{
                            this.store.Title = text;
                        }}
                multiline={false}
                onSubmitEditing={(text) => {

                            this.store.PageCount =1;//刷新当前
                               this._fetchData();
                             }}
                underlineColorAndroid='transparent'>


            </TextInput>

        )

    }


    //搜索条
    renderSearchBar=()=>{


        return(

            <View style={{backgroundColor:Colors.colors.Chat_Color230}}>

                <View style={{margin:8,borderRadius:3, backgroundColor:'white',alignItems:'center',flexDirection:'row'}}>

                    <Icon size={15} color={Colors.colors.Chat_Color153} icon={'0xe171'} style={{marginLeft:10}}/>

                    <TextInput
                        style={{ width:window.width-50,margin:5,color:Colors.colors.Chat_Color51,padding:0,height:22}}
                        placeholder={'请输入关键字搜索'}

                        returnKeyType={'search'}
                        onChangeText={(text)=>{
                            this.store.Title = text;
                        }}
                        multiline={false}
                        onSubmitEditing={(text) => {

                               this.store.PageCount =1;//刷新当前
                               this._fetchData();



                             }}
                        underlineColorAndroid='transparent'>


                    </TextInput>


                </View>

            </View>
        )
    }
     //listview
    renderListview = ()=>{

        var searchBarHeight =Chat.isAndroid() ? 0:49;

        return(

            <View style={{backgroundColor:'white',flex:9}}>
                <ListView

                    keyboardDismissMode={'on-drag'}
                    renderRow={this.renderRow}
                    dataSource={this.store.getDataSource}
                    renderFooter={this.renderFooter}
                    onScroll={this.onScroll()}
                    onEndReached={this.onEndReach.bind(this)}
                    onEndReachedThreshold={20}
                    refreshControl={<RefreshControl refreshing={this.store.isVideoRefreshing}
                                                    onRefresh={this.onRefresh.bind(this)}
                                                    title="正在加载中..."
                                                    color="#ccc"
                />}

             >
                </ListView>

            </View>
        )
    }


    renderBottomView = ()=>{



        //如果是视频收藏的话，则只有上传时间','播放次数(暂时将高级筛选注释)
        console.log('培训学院搜索相对于海报位置没那么重要')
   var titles=this.store.type =='VideoCollection' ?['上传时间','播放次数'] : ['上传时间','播放次数'];

        icons = ['0xe6c5','0xe6c5'];//正常图标
        selectIcons=['0xe6c7','0xe6c7'];//选中图标

        //如果是培训学院，则有上传时间','播放次数','筛选三个

        return(
            <VideoToolBar
                titles={titles}
                icons={icons}
                selectIcons={selectIcons}
                onPress = {(i)=>{
                    switch (i){
                        case 0:
                            this.SortByCreate();
                            break;
                        case 1:
                            this.SortByplayCount();
                            break;

                        case 2:

                            this.props.navigator.push({
                                component:VideoSearch

                            })

                            break;
                        default:
                            break;


                    }

                }}


            />
        )

    }

    renderLoading = ()=>{

        if(this.store.isLoading){

            return(
                <ActivityIndicator toast  text={'正在加载中...'}  animating={true}/>
            )
        }
        return null;

    }

    render = ()=>{

        return(

            <View style={{flex:1,backgroundColor:'rgb(235,235,235)'}}>

                {this.renderNavBar()}
                {this.renderSearchBar()}
                {this.renderListview()}
                {this.renderBottomView()}
                {this.renderLoading()}

            </View>
        )


    }

}


 class VideoToolBar extends Component{

    constructor(props){

        super(props);
    }

    render(){


        //是否定义一个属性，图标和字体，top,left,right,bottom

        var icons = this.props.icons;
        var selectIcons = this.props.selectIcons;
        var titles = this.props.titles;


        return(

            <View style={[{flex:1, flexDirection:'row',justifyContent:'center', alignItems:'center',height:49,backgroundColor:'rgb(40,45,83)'},this.props.style]}>

                {


                   titles.map((value,i)=>{


                        var currentIcon =icons[i];

                        return(

                        <TouchableOpacity onPress={()=>{



                          {/*if(currentIcon ==icons[i]){*/}
                             {/*alert('1');*/}
                              {/*currentIcon=selectIcons[i];*/}
                          {/*}else {*/}
                               {/*alert('2');*/}
                              {/*currentIcon=icons[i];*/}
                          {/*}*/}

                          {/*console.log('currentIcon')*/}
                          {/*console.dir(currentIcon);*/}

                            //先切换图标

                            this.props.onPress(i)


                        }}
                        >

                            <View style={{alignItems:'center',justifyContent:'center',flexDirection:'row',flex:1,width:window.width/this.props.titles.length}}>

                                <Text style={{color:'white',fontSize:15,marginRight:3}}>{this.props.titles[i]}</Text>

                                {

                                }


                            </View>
                        </TouchableOpacity>

                        )
                    })

                }



            </View>

        );

    }

}


