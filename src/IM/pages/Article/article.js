/**
 * Created by yqf on 2018/3/7.
 */



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
    // ActivityIndicator,
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
import ImagePicker from 'react-native-image-picker';
import {FLEXBOX} from '../../styles/commonStyle'
import Colors from '../../Themes/Colors'
import YQFNavBar from '../../components/yqfNavBar';
import YQFEmptyView from '../../components/EmptyView';

import Icon from '../../components/icon';
import {RestAPI,ServingClient} from '../../utils/yqfws';
import {Chat} from '../../utils/chat';
import ActivityIndicator from '../../components/activity-indicator'
import LoadMoreFooter from '../../components/LoadMoreFooter';


const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,
}


let canLoadVideoMore=false;




class ArticleModel extends  Component{


    @observable Keywords = "";//搜索关键词

    @observable isSearchArticle =false;//是否搜索文章
    @observable isSearchTrip =false;//是否搜索旅行方案

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

export  default  class  Article extends  Component{

    constructor(props){
        super(props);

        this.store = new ArticleModel();
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

                //调用读取文章接口
            var  Param = {

                    Title:this.store.isSearchArticle==true ? this.store.Keywords : null,
                    // UserCode: Chat.userInfo.User.UserCode,
                    ArticleAccessAuthorityIDs: '1',
                    PageCount:this.store.PageCount,
                    PageSize:this.store.PageSize,
                };
                this.store.isVideoRefreshing = false;
                RestAPI.invoke('Knowledge.ArticleListGetForMobile',Param,(result)=>{

                    // console.log('读取我去过文章返回的result')
                    // console.dir(result);

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
                Title:this.store.isSearchTrip==true? this.store.Keywords : null,
                IsOwnTravelFormula: null,
                UserCode:Chat.userInfo.User.UserCode,
                PageCount:this.store.PageCount,
                PageSize:this.store.PageSize,
                IsPublish:true,
                Effectiveness:true
                // NatureID:1,
            };
            // console.log('搜索旅行方案的参数 param')
            // console.dir(param);

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
       //旅行方案
       else {

           if(Article.CoverImagePath==null ||Article.CoverImagePath == ""){
               url ='http://tools.yiqifei.com/images/logo.gif';
           }else {
               url = 'https://img10.yiqifei.com'+Article.CoverImagePath+'!385x170';

           }


       }

       var Name = null;

       if(Article && Article.AreaLists && Article.AreaLists.length>0){

           for(var i=0;i<Article.AreaLists.length;i++){
               var AreaList = Article.AreaLists[i];
               if(AreaList.ReferTypeID == 1){

                   // DisplayName = AreaList.DisplayName ? AreaList.DisplayName :  AreaList.CityName ? AreaList.CityName :null;
                   // DisplayName = AreaList.DisplayName ? AreaList.DisplayName :null;

                   // Name = AreaList.DisplayName ? AreaList.DisplayName :null;

                   Name = AreaList.DisplayName ? AreaList.DisplayName :null;

                   break;
               }

           }

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

                    response.Name = Name;

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
                        title={this.store.type=='Article'?'文章列表' : 'Trip'?'旅行方案':null  }/>
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


    //搜索条
    renderSearchBar=()=>{

        var placeholder = this.store.type == 'Article' ? "请输入关键词搜文章" : "请输入关键词搜方案"


        return(

            <View style={{backgroundColor:Colors.colors.Chat_Color230}}>

                <View style={{margin:8,borderRadius:3, backgroundColor:'white',alignItems:'center',flexDirection:'row'}}>

                    <Icon size={15} color={Colors.colors.Chat_Color153} icon={'0xe171'} style={{marginLeft:10}}/>

                    <TextInput
                        style={{ width:window.width-50,margin:5,color:Colors.colors.Chat_Color51,padding:0,height:22}}
                        placeholder={placeholder}

                        returnKeyType={'search'}
                        onChangeText={(text)=>{

                            this.store.Keywords = text;
                        }}
                        multiline={false}
                        onSubmitEditing={(text) => {


                            //清空所有数据
                            this.store.Articles = [].slice();

                            this.store.PageCount =1;//刷新当前页面

                            if(this.store.type == 'Article'){
                                this.store.isSearchArticle  =true;
                                this.store.isSearchTrip = false;
                            }else{

                                this.store.isSearchArticle  =false
                                this.store.isSearchTrip  =true
                            }

                            this._fetchData();


                        }}
                        underlineColorAndroid='transparent'>


                    </TextInput>


                </View>

            </View>
        )
    }

    render = ()=>{

        return(

            <View style={{flex:1, backgroundColor:'rgb(235,235,235)'}}>

                {this.renderNavBar()}
                {this.renderSearchBar()}
                {this.renderListview()}
                {this.renderPosterLoading()}
                {/*{this.renderEmptyView()}*/}

            </View>
        )


    }

}



