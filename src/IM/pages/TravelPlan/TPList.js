
//旅行方案列表(需要判断。顾问版旅行方案，散客类旅行方案)


import { observer } from 'mobx-react/native';
import {observable, autorun,computed, extendObservable, action, toJS } from 'mobx'

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

const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}

let canLoadVideoMore=false;


class  TPListModel extends  Component{

    @observable isLoading =true;

    @observable PageSize = 10;//数目
    @observable PageCount = 1;//页码

    @observable isVideoRefreshing = false;//是否刷新

    @observable RowCount = 0;
    @observable UserPosterList = [];

    @observable  RemondDestinations=[
        {
            count:143,
            name:'新加坡',
            CorverImage:'https://pic.qyer.com/album/user/919/50/SEhcRxoPaQ/index/275x185'
        },
        {
            count:82,
            name:'曼谷',
            CorverImage:'https://pic.qyer.com/album/user/1719/46/QE5USx4BZEg/index/275x185'
        },
        {
            count:49,
            name:'东京',
            CorverImage:'https://pic.qyer.com/album/user/1027/10/QElXRRsHaU8/index/275x185'
        },
        {
            count:37,
            name:'巴厘岛',
            CorverImage:'https://pic1.qyer.com/album/user/1723/32/QE5XQRkFaU8/index/275x185'
        },
        {
            count:35,
            name:'普吉岛',
            CorverImage:'https://pic1.qyer.com/album/user/974/5/SE5RQh8CZQ/index/275x185'
        },
        {
            count:432,
            name:'河内',
            CorverImage:'https://pic1.qyer.com/album/user/2404/19/Q01VRhsOYUs/index/275x185'
        },
        {
            count:96,
            name:'墨尔本',
            CorverImage:'https://pic1.qyer.com/album/user/2304/5/Q0pVRhoCY0A/index/275x185'
        },
        {
            count:64,
            name:'澳大利亚',
            CorverImage:'https://pic1.qyer.com/album/user/2413/2/Q01UQRoFaU8/index/275x185'
        },

    ]

    @computed get getRemondDestinationsDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.RemondDestinations.slice());
    }


    @computed get getDataSource(){

        ds2 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds2.cloneWithRows(this.UserPosterList.slice());
    }





}

@observer
export  default class  TPList extends  Component{

    constructor(props){
        super(props);
        this.store = new TPListModel();
    }

    componentDidMount = ()=>{
        this.onRefresh();
    }
    onScroll(){
        if(!canLoadVideoMore) canLoadVideoMore = true;
    }
    onRefresh = async()=> {

        console.log('onRefresh onRefresh onRefresh');
        this.store.PageCount = 1;//刷新时将页码设置为1
        canLoadVideoMore=false;
        this.store.isVideoRefreshing = true;
        this._fetchData();

    }

    onEndReach=async()=>{

        if(this.store.UserPosterList.length==0 || (this.store.RowCount>0   && this.store.RowCount <=this.store.UserPosterList.length))
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


        if(this.store.UserPosterList.length==0 || (this.store.RowCount>0   && this.store.RowCount <=this.store.UserPosterList.length))
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


    _fetchData = async() =>{

        var param = {

            IsOwnTravelFormula: false,
            UserCode:Chat.loginUserResult.AccountNo,
            PageCount:this.store.PageCount,
            PageSize: this.store.PageSize,
            IsPublish:true,
            NatureID:1,
            OrderBy:this.store.OrderBy,
            DistrictName:this.store.DistrictName,//目的地
            TagNames:this.store.TagNames,//标签(亲子,广州)
            TravelMinDay:this.store.TravelMinDay,//旅行最小天数
            TravelMaxDay:this.store.TravelMaxDay,//旅行最大天数
            TravelMonth:this.store.TravelMonth,
        };


        this.store.loading = true;

        RestAPI.invoke('Knowledge.TravelFormulaByCondition',param,(result)=>{


            // console.log('旅行方案请求结果')
            // console.dir(result);


            //加载完马上将刷新关掉
            this.store.isVideoRefreshing = false;

            if(result && result.Result && result.Result.TravelFormulaInfos && result.Result.TravelFormulaInfos.length>0){

                this.store.RowCount = result.Result.RowCount;
                this.store.isLoading = false;
                this.store.isEmpty = false;

                //刷新
                if(this.store.PageCount == 1){


                    this.store.UserPosterList = result.Result.TravelFormulaInfos.slice();

                }
                else {  //如果是加载更多的话，则将新视频，拼接到原来的旧数组上面去

                    //关闭加载更多
                    canLoadVideoMore =false;

                    this.store.UserPosterList = this.store.UserPosterList.concat(result.Result.TravelFormulaInfos).slice();

                }



            }


        },()=>{

            this.store.isLoading = false;
            this.store.isEmpty = true;
        })


    }



    _ClickTitleItem = (data,rowId)=>{

        this.store.isLoading = true;

        var temp = this.store.titleArray;

        for(var i=0;i<temp.length;i++){
            temp[i].select = false;
        }
        temp[rowId].select=true;

        this.store.selectIndex  =rowId;
        this.store.PageCount = 1;//页码变为1
        this.store.titleArray=temp.slice();

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

    _ToTravelPlanDetail = (data)=>{


        // this.props.navigator.push({
        //
        //     component:PosterDetail,
        //     passProps:{
        //         UserPosterList:data
        //     }
        //
        // })

    }


    _getTripCoverImagePath(Path){
        return 'http://img10.yiqifei.com'+Path+'!385x170';
    }

    _renderRow = (trip,sectionID,rowID)=>{

        var StartDate = trip.StartDate;
        var EndDate = trip.EndDate;

        // var day = TripUtil._CompareTime(EndDate,StartDate);

        var CoverImagePath = trip.CoverImagePath ?this._getTripCoverImagePath(trip.CoverImagePath) : 'http://img10.yiqifei.com/20161129/3481a744b7be4c4b926e0f81e29fa9ce.jpg!385x170'
        var profileImage = 'http://m.woquguo.net/UserImg/'+trip.UserCode+'/3';//用户头像
        // var start = TripUtil._getArticleCreateDate(trip.StartDate);//出发时间
        var duration = '123';
        var PersonName = trip.PersonName;
        var Title = trip.Title;
        // var DestnDistrictNames = trip.DestnDistrictNames;
        var TravelFormulaDestns =trip.TravelFormulaDestns;

        var TravelFormulaDestn='';
        for(var i=0;i<TravelFormulaDestns.length;i++){

            var Destn = TravelFormulaDestns[i].DistrictName+'>';

            if(i ==TravelFormulaDestns.length-1 ){
                Destn = TravelFormulaDestns[i].DistrictName;
            }

            TravelFormulaDestn+=Destn;

        }

        var CommentCount = trip.CommentCount;//评论
        var ViewCount = trip.ViewCount;//浏览
        var CopyCount = trip.CopyCount;//复制
        var OrderCount = trip.OrderCount;//Order

        var ImageWidth = window.width-20;
        var ImageHeight = ImageWidth /2;


        return (


            <TouchableOpacity onPress={() => { alert('调用小高方案详情页面') }}>

                <View style={{flexDirection:'row',backgroundColor:'white'}}>

                    <Image style={{width:40,height:40,borderRadius:20,margin:10}}
                           source={{ uri:profileImage}}>
                    </Image>

                    <View style={{margin:10,marginLeft:0,justifyContent:'center'}}>

                        <Text style={{color:'rgb(51,51,51)',fontSize:14,marginTop:2 }}>{PersonName}</Text>
                        <Text style={{color:'rgb(102,102,102)',fontSize:13,marginTop:2}}>{'一起飞@国际旅行顾问'}</Text>
                    </View>


                </View>

                <Image style={{backgroundColor:'transparent', margin:10,marginTop:0,marginBottom:0, width:ImageWidth,height:ImageHeight}} source={{uri:CoverImagePath}}>

                    <View style={{position:'absolute',left:10,bottom:10,flexDirection:'row',alignItems:'flex-end'}}>
                        <Text style={{fontSize:22,color:'white',fontWeight:'bold'}}>{'7'}</Text>
                        <Text style={{fontSize:16,color:'white'}}>{'天6晚'}</Text>


                    </View>


                </Image>

                <View style={{margin:10}}>

                    <Text style={{color:'rgb(51,51,51)',fontSize:14}}>{Title}</Text>
                    <Text numberOfLines={1} style={{maxWidth:ImageWidth, color:'rgb(102,102,102)',fontSize:13,marginTop:3}}>{TravelFormulaDestn}</Text>
                </View>

                <View style={{height:10,backgroundColor:'rgb(240,240,240)'}}></View>


            </TouchableOpacity>




        );


    }


    _renderLine(){


        return(
            <View style={{backgroundColor:'rgb(235,235,235)',height:1,marginLeft:10}}></View>
        )
    }

    _renderNav(){
        return(
            <YQFNavBar title={'一起飞旅行方案'}
                       leftIcon={'0xe183'}
                       onLeftClick={()=>{this.props.navigator.pop()}} />
        )
    }


    _renderDestiontionItem = (item,sectionId,rowId)=>{

        return(


            <TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={()=>{this._ClickTitleItem(data,rowId)}}>


                <View style={{padding:5,alignItems:'center'}}>

                    <Image  style={{backgroundColor:'transparent', width:110,height:120,justifyContent:'center',alignItems:'center',borderRadius:3}} source={{uri:item.CorverImage}}>

                        <Text style={{color:'white',fontSize:22}}>{item.count}</Text>
                        <Text style={{color:'white',fontSize:16}}>旅行方案</Text>

                    </Image>

                    <Text style={{margin:10,marginBottom:0, color:'rgb(51,51,51)',fontSize:15}}>{item.name}</Text>


                </View>


            </TouchableOpacity>

        )

    }


    _renderDestionHeader = ()=>{

        return(
            <View>
                <Text style={{margin:10}}>{'_renderDestionHeader'}</Text>
            </View>
        )

    }
    _renderDestionFooter = ()=>{

        return(
            <View>
                <Text style={{margin:10}}>{'_renderDestionFooter'}</Text>
            </View>
        )

    }



    _renderHeader=()=>{

        var contentViewStyle={
            flexDirection:'row',
        }

        return(




            <View style={{backgroundColor:'white'}}>

                <Text style={{margin:10}}>{'_renderDestionHeader'}</Text>


                <ListView

                    horizontal={true}
                    showsHorizontalScrollIndicator={false}

                    renderRow={this._renderDestiontionItem}
                    dataSource={this.store.getRemondDestinationsDataSource}
                    contentContainerStyle={contentViewStyle}>

                </ListView>

                <Text style={{margin:10}}>{'_renderDestionFooter'}</Text>

            </View>
        )
    }

    _renderListView(){

        if(this.store.UserPosterList && this.store.UserPosterList.length>0){

            return(
                <ListView
                    style={{marginTop:5,backgroundColor:'white'}}
                    scrollEnabled={true}
                    dataSource={this.store.getDataSource}
                    renderRow={this._renderRow}
                    renderHeader={this._renderHeader}
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

        return null




    }

    renderLoading(){

        if(this.store.isLoading){

            return <ActivityIndicator toast text={'正在加载数据...'} animating={this.store.isLoading}/>


        }
        return null;


    }


    render() {

        return(

            <View style={{backgroundColor:'rgb(235,235,235)',flex:1}}>

                {this._renderNav()}

                {this.renderLoading()}

                {this._renderListView()}

            </View>



        );

    }



}





const styles = StyleSheet.create({

    center:{
        justifyContent:'center',
        alignItems:'center',
    }

})
