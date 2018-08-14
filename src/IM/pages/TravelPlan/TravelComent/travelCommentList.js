/**
 * Created by yqf on 2018/3/13.
 */

//方案评论列表





import { observer, trackComponents } from 'mobx-react/native';
import {observable, autorun,computed, extendObservable, action, toJS } from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';


import {
    View,
    Text,
    Image,
    CameraRoll,
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
    TextInput,
    Alert,
    Slider,
    UIManager,
    NativeModules,
    RefreshControl


} from  'react-native';
import {FLEXBOX} from '../../../styles/commonStyle'

import YQFNavBar from '../../../components/yqfNavBar';
import YQFEmptyView from '../../../components/EmptyView';

import Icon from '../../../components/icon';
import {RestAPI,ServingClient} from '../../../utils/yqfws';
import {Chat} from '../../../utils/chat';
import ActivityIndicator from '../../../components/activity-indicator'
import LoadMoreFooter from '../../../components/LoadMoreFooter';

const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,
}

let canLoadVideoMore=false;


class TravelCommentListModel extends  Component{

    @observable Articles=[];
    @observable isLoading = true;
    @observable type = 'Article';

    @observable PageSize = 10;//数目
    @observable PageCount = 1;//页码
    @observable isVideoRefreshing = false;//是否刷新
    @observable RowCount = 0;



    @computed get getDataSource(){

        ds1 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds1.cloneWithRows(this.Articles.slice());
    }

}


@observer

export  default  class  TravelCommentList extends  Component{

    constructor(props){
        super(props);

        this.store = new TravelCommentListModel();
        this.store.type = props.type;

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

        if(this.store.Articles.length==0 || (this.store.RowCount>0   && this.store.RowCount <=this.store.Articles.length))
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


        if(this.store.Articles.length==0 || (this.store.RowCount>0   && this.store.RowCount <=this.store.Articles.length))
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


        if(this.store.type=='Article'){

            var Param = {
                UserCode: Chat.userInfo.User.UserCode,
                ArticleAccessAuthorityIDs: '1',
                PageCount:this.store.PageCount,
                PageSize:this.store.PageSize,
            };


            this.store.isVideoRefreshing = false;

            RestAPI.invoke('Knowledge.ArticleListGetForMobile',Param,(result)=>{

                this.store.isLoading = false;
                if(result.Result && result.Result.ArticleList && result.Result.ArticleList.length>0){
                    this.store.RowCount = result.Result.RowCount;
                    this.store.isLoading = false;
                    this.store.isEmpty = false;

                    if(this.store.PageCount == 1){
                        this.store.Articles = result.Result.ArticleList.slice();
                    }else {

                        canLoadVideoMore =false;
                        this.store.Articles = this.store.Articles.concat(result.Result.ArticleList).slice();
                    }

                }else {

                    this.store.isEmpty = true;
                    if(this.store.RowCount==0){
                        Alert.alert('你还没在我去过写文章')

                    }
                }

            });



        }else if(this.store.type=='Trip'){
            //https://trip.yiqifei.com/Travelplan/Detail/3f06918aab54483793bf89e5b2008d81


            var param = {

                IsOwnTravelFormula: true,
                UserCode:Chat.userInfo.User.UserCode,
                PageCount:this.store.PageCount,
                PageSize:this.store.PageSize,
                IsPublish:true,
                NatureID:1,
            };
            this.store.isVideoRefreshing = false;

            RestAPI.invoke('Knowledge.TravelFormulaByCondition',param,(result)=>{

                // console.log('旅行方案搜索结果')
                // console.dir(result);

                this.store.isLoading = false;

                if(result.Result && result.Result.TravelFormulaInfos && result.Result.TravelFormulaInfos.length>0){
                    this.store.RowCount = result.Result.RowCount;
                    this.store.isLoading = false;
                    this.store.isEmpty = false;

                    if(this.store.PageCount == 1){
                        this.store.Articles = result.Result.TravelFormulaInfos.slice();
                    }else {

                        canLoadVideoMore =false;
                        this.store.Articles = this.store.Articles.concat(result.Result.TravelFormulaInfos).slice();
                    }

                }else {
                    this.store.isEmpty = true;
                    if(this.store.RowCount==0){
                        Alert.alert('你还没写旅行方案')

                    }

                }


            });




        }else {

        }






    }





    _renderLine(){

        return(
            <View style={{backgroundColor:'rgb(235,235,235)',height:1,}}></View>
        )
    }


    renderArticleItem = (Article)=>{

        var url;

        if(this.store.type == 'Article'){

            if(Article.CoverImagePath==null ||Article.CoverImagePath == ""){
                url ='http://tools.yiqifei.com/images/logo.gif';
            }else {

                var start = Article.CoverImagePath.indexOf('http');
                if(start == 0){
                    url = Article.CoverImagePath;
                }else {
                    url =  'http://img8.yiqifei.com'+Article.CoverImagePath+'!300x200';
                }
            }

        }
        else {

            url = 'https://img10.yiqifei.com'+Article.CoverImagePath+'!385x170';
        }

        return (


            <View>


                <TouchableOpacity activeOpacity={.7}  onPress={()=>{

                    //在这里生成二维码回调回去
                    var Url = this.store.type=='Article' ? 'http://3g.yiqifei.com/Weixin/Article/'+Article.ID : 'https://trip.yiqifei.com/Travelplan/Detail/'+Article.ID

                    var param ={
                        Url:Url,
                        CreateQRCode:true
                    };

                    RestAPI.invoke('Base.CreateRoute',param,(response)=>{

                        this.props.GetQRCode(response);
                        this.props.navigator.pop();

                    },(error)=>{

                    });


                }} style={{flexDirection:'row', alignItems: "center", backgroundColor:'white'}}>


                    <Image style={{margin:10,width:90,height:70}} source={{uri:url}}>
                    </Image>


                    <Text numberOfLines={2} style={{fontSize: 15, color: 'rgb(51,51,51)',maxWidth:window.width-90-10*3}}>{Article.Title}</Text>



                </TouchableOpacity>

                {this._renderLine()}

            </View>


        )


    }

    //文章列表
    renderListview = ()=>{

        if(this.store.Articles.length>0){

            return(
                <ListView

                    style={{marginTop:0,backgroundColor:'white'}}
                    renderRow={this.renderArticleItem}
                    dataSource={this.store.getDataSource}
                    removeClippedSubviews={false}
                    initialListSize={20}
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

    renderPosterLoading = ()=>{

        if(this.store.isLoading){
            return <ActivityIndicator toast text={'正在加载文章'} animating={this.store.isLoading}/>
        }

        return null;
    }


    renderEmptyView = ()=>{

        if(this.store.RowCount>0 && this.store.isLoading==false){

            return <YQFEmptyView title={this.store.type=='Article' ? '你还没有写文章...' :'你还没有写方案'} />
        }

        return null;
    }


    render = ()=>{

        return(

            <View style={{flex:1, backgroundColor:'rgb(235,235,235)'}}>

                {this.renderNavBar()}
                {this.renderListview()}


                {this.renderPosterLoading()}
                {/*{this.renderEmptyView()}*/}

            </View>
        )


    }

}








