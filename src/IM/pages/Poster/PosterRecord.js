/**
 * Created by yqf on 2017/12/6.
 */


//海报  我的生成记录


/**
 * Created by yqf on 2017/12/1.
 */



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


} from  'react-native';


import YQFNavBar from '../../components/yqfNavBar';
import Colors from '../../Themes/Colors';


import {Chat} from '../../utils/chat';
import {RestAPI,ServingClient} from '../../utils/yqfws';
import ActivityIndicator from '../../components/activity-indicator'
import LoadMoreFooter from '../../components/LoadMoreFooter';
import Icon from '../../components/icon';
import  PosterDetail from './PosterDetail';


const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}

let canLoadVideoMore=false;


class  PosterRecordModel extends  Component{

    @observable SortByCreate = false;//按上传时间排序

    @observable PageSize = 5;//数目
    @observable PageCount = 1;//页码
    @observable isVideoRefreshing = false;//是否刷新
    @observable RowCount = 0;
    @observable isLoading =true;//是否显示loading
    @observable selectIndex = 0;
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
export  default class  PosterRecord extends  Component{

    constructor(props){
        super(props);
        this.store = new PosterRecordModel();
    }



    //上传时间排序
    SortByCreate = ()=>{

        this.store.SortByCreate = !this.store.SortByCreate;

        if(this.store.SortByCreate){
            this.store.Posters = Enumerable.from(this.store.Posters).orderByDescending(o => o.CreateDate).toArray();
        }else {
            this.store.Posters = Enumerable.from(this.store.Posters).orderBy(o => o.CreateDate).toArray();
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

        if(this.store.Posters.length==0 || (this.store.RowCount>0   && this.store.RowCount <=this.store.Posters.length))
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


        if(this.store.Posters.length==0 || (this.store.RowCount>0   && this.store.RowCount <=this.store.Posters.length))
        {
            return(

                <View style={{justifyContent:'center',alignItems:'center',margin:10}}>

                    <Text>没有更多了...</Text>

                </View>
            )
        }

        if (canLoadVideoMore){

            return (

                <View style={{width:window.width,margin:10, flexDirection:'row',alignItems:'center',justifyContent:'center'}}>

                    <ActivityIndicator animating={true} />
                    <Text style={{fontSize:14,margin:5}}>{'正在加载更多'}</Text>

                </View>


                )


        }
    }


    _fetchData = async()=>{


        var param;

        if(this.store.selectIndex == 1){

             param ={
                UserCode:Chat.loginUserResult.AccountNo,
                PageSize:this.store.PageSize,
                PageCount:this.store.PageCount,
                NonPosterCategoryIDs:5,
            };


        }else {

            param ={

                UserCode:Chat.loginUserResult.AccountNo,
                PosterUserCode:Chat.loginUserResult.AccountNo,
                PageSize:this.store.PageSize,
                PageCount:this.store.PageCount,
                PosterCategoryID:5
            };
        }



        var result = await  ServingClient.execute('Channel.UserPosterListByUserCode',param);

        console.log('加载后的结果')
        // console.dir(result);

        //加载完马上将刷新关掉
        this.store.isVideoRefreshing = false;
        this.store.isLoading = false;

        if(result && result.UserPosterList && result.UserPosterList.length>0){

            
            this.store.RowCount = result.RowCount;
            this.store.isLoading = false;
            this.store.isEmpty = false;

            //如果是刷新的话，则将之前的视频清空，接着将最新的视频赋值

            //刷新
            if(this.store.PageCount == 1){
                this.store.Posters = result.UserPosterList.slice();

            }else {  //如果是加载更多的话，则将新视频，拼接到原来的旧数组上面去

                canLoadVideoMore =false;
                this.store.Posters = this.store.Posters.concat(result.UserPosterList).slice();
                // console.log('当前的所有海报')
                // console.dir(this.store.Posters);
            }
        }

        else {


            this.store.isLoading = false;
            this.store.isEmpty = true;
        }
    }



    _ClickTitleItem = (data,rowId)=>{


        var temp = this.store.titleArray;

        for(var i=0;i<temp.length;i++){
            temp[i].select = false;
        }
        temp[rowId].select=true;

        this.store.selectIndex  =rowId;

        this.store.titleArray=temp.slice();
        this.store.Posters=[].slice();


        this._fetchData();

    }


    _renderTitleItem = (data,sectionId,rowId)=>{

        var titleColorStyle;
        if(data.select == true){
            titleColorStyle ={
                color:Colors.colors.LR_Color,
                fontSize:16
            }
        }else {
            titleColorStyle ={
                color:Colors.colors.Chat_Color51,
                fontSize:15
            }
        }

        return(


            <TouchableOpacity style={{}} onPress={()=>{this._ClickTitleItem(data,rowId)}}>
                <Text style={[{margin:10,},titleColorStyle]}>{data.name}</Text>
                {
                    data.select == true?

                        <View style={{backgroundColor:Colors.colors.LR_Color,height:2,position:'absolute',bottom:0,left:0,right:0}}></View>

                        :
                        null

                }

            </TouchableOpacity>

        )

    }



    _ToPosterDetail = (data)=>{


        this.props.navigator.push({

            component:PosterDetail,
            passProps:{
                UserPosterList:data
            }
        })

    }



    _renderRow = (data,sectionID,rowID)=>{


        const item = data;
        var margin = 10;
        var ImageW =  (window.width - 50) / 2;
        var ImageH =  ImageW *(276/169);
        var w = parseInt(ImageW);
        var h = parseInt(ImageH);
        var scale = '!/fwfh/'+w+'x'+h;
        var  uri = Chat.getPosterImagePath(item.ImagePath)+scale;

        return (
            <TouchableOpacity
                onPress={()=>{

                    this.props.navigator.push({
                        component:PosterDetail,

                        passProps:{

                            PosterCategoryID:5,
                            UserPosterList:data
                        }

                    })


                }}
                style={{margin:5,height: ImageH+40}}>

                <Image style={{margin:5, width: ImageW, height: ImageH, borderRadius: 5}} source={{uri:uri}}>

                </Image>

                <View style={{flexDirection:'row',alignItems:'center',margin:5}}>

                    <Icon style={{margin:2}} icon={'0xe170'} size={18} color={'rgb(102,102,102)'}/>
                    <Text style={{color:'rgb(102,102,102)',fontSize:14,margin:2}}>{Chat.showDate(data.CreateDate) }</Text>
                </View>

            </TouchableOpacity>
        )



    }



    _renderLoading(){


        if(this.store.loading){

            <View style={[styles.center]}>

                <ActivityIndicator toast text={'正在加载数据...'} animating={true}/>

            </View>

        }
        return null;


    }

    _renderLine(){


        return(
            <View style={{backgroundColor:'rgb(235,235,235)',height:1,marginLeft:10}}></View>
        )
    }

    _renderNav(){
        return(
            <YQFNavBar title={'我的生成记录'}
                       leftIcon={'0xe183'}
                       rightIcon={'0xe104'}
                       onRightClick={()=>{this.SortByCreate()}}
                       onLeftClick={()=>{this.props.navigator.pop()}} />
        )
    }
    _renderTitleItem = (data,sectionId,rowId)=>{

        var titleColorStyle;
        if(data.select == true){
            titleColorStyle ={
                color:Colors.colors.LR_Color,
                fontSize:16
            }
        }else {
            titleColorStyle ={
                color:Colors.colors.Chat_Color51,
                fontSize:15
            }
        }

        return(


            <TouchableOpacity style={{width:window.width/this.store.titleArray.length,alignItems:'center',justifyContent:'center'}} onPress={()=>{this._ClickTitleItem(data,rowId)}}>
                <Text style={[{margin:10,},titleColorStyle]}>{data.name}</Text>
                {
                    data.select == true?

                        <View style={{backgroundColor:Colors.colors.LR_Color,height:2,position:'absolute',bottom:0,left:0,right:0}}></View>

                        :
                        null

                }

            </TouchableOpacity>

        )

    }

    _renderLoading(){

        if(this.store.isLoading){

            return <ActivityIndicator toast text={'正在加载数据...'} animating={this.store.isLoading}/>
        }
        return null;


    }


    renderTitleView = ()=>{

        var contentViewStyle={
            flexDirection:'row',
        }


        var height =  window.width * (43 / 375);


        return(

            <View style={{height:height,backgroundColor:'white'}}>

                <ListView
                    ref={(titleListview)=>{this.titleListview = titleListview}}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    renderRow={this._renderTitleItem}
                    dataSource={this.store.getTitleDataSource}
                    removeClippedSubviews={false}
                    initialListSize={10}

                    contentContainerStyle={contentViewStyle}>

                </ListView>

            </View>
        )
    }

    _renderListView(){


        if(this.store.Posters && this.store.Posters.length>0){


            return(
                <ListView

                    contentContainerStyle={{flexDirection:'row',flexWrap:'wrap'}}
                    style={{marginTop:5,backgroundColor:'#fff'}}
                    renderRow={this._renderRow}
                    dataSource={this.store.getDataSource}
                    renderFooter={this.renderFooter}
                    onScroll={this.onScroll()}
                    onEndReached={this.onEndReach.bind(this)}
                    onEndReachedThreshold={20}
                    refreshControl={<RefreshControl refreshing={this.store.isVideoRefreshing}
                                                    onRefresh={this.onRefresh.bind(this)}
                                                    title="正在加载中..."
                                                    color="#ccc"
                />}>

                </ListView>
            )
        }

        return null




    }

    render() {

        return(

            <View style={{backgroundColor:'rgb(235,235,235)',flex:1}}>

                {this._renderNav()}
                {this._renderLoading()}
                {this._renderListView()}

            </View>



        );

    }



}



@observer
class ImageItem extends Component {

    constructor(props) {
        super(props);
    }

    render = () => {


        const item = this.props.item;
        var margin = 10;
        var ImageW =  (window.width - 30) / 2;
        var ImageH =  ImageW *(276/169);

        var w = parseInt(ImageW);

        var h = parseInt(ImageH);

        var scale = '!/fwfh/'+w+'x'+h;
        var  uri = Chat.getPosterImagePath(item.ImagePath)+scale;
        // console.dir(uri);



        return (
            <TouchableOpacity
                onPress={()=>{

                    this.props.click();
                }}
                style={{ alignItems: 'center',  justifyContent: 'center', width: ImageW, height: ImageH,
                    // 左边距
                    margin: 5,
                    marginBottom: 0,}}>

                <Image style={{ width: ImageW, height: ImageH, borderRadius: 5, alignItems: 'center', justifyContent: 'center'}} source={{uri:uri}}>

                </Image>




            </TouchableOpacity>
        )


    }

}


const styles = StyleSheet.create({

    itemStyle: {
        // 对齐方式
        alignItems: 'center',
        justifyContent: 'center',
        // 尺寸
        width: (window.width - 30) / 2,
        height: 100,
        // 左边距
        margin: 5,
        marginBottom: 0,

    },

    itemImageStyle: {
        // 尺寸
        width: (window.width - 30) / 2,
        height: 100,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'


    }


})