
//海报
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
    ActivityIndicator,
    Switch,
    Platform,
    Dimensions,

} from  'react-native';

import YQFNavBar from '../../components/yqfNavBar';
import YQFEmptyView from '../../components/EmptyView';



import Icon from '../../components/icon';
import {RestAPI,ServingClient} from '../../utils/yqfws';
import {Chat} from '../../utils/chat';

import Colors from '../../Themes/Colors';
import PictureTemplate from './PictureTemplate'
const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}


class PosterModel extends  Component{

    @observable templateType = 'picture';//图片

    @observable loading = false;
    @observable isEmpty = false;

    @observable selectIndex = 0;

    @observable selectTemplateDict ={};//模版
    @observable selectPicture ={};//图片

    //模版
    @observable TemplateArray =[];
    @computed get getDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.TemplateArray.slice());
    }

}



@observer
export  default  class Poster extends  Component{

    constructor(props){
        super(props);

        this.store = new PosterModel();
        if(props.url){
            this.store.selectPicture.url = props.url;
        }else {
            this.store.selectPicture.url = 'https://pbs.twimg.com/card_img/936686809227993088/onr882RG?format=jpg&name=600x314';
        }

    }

    componentDidMount = ()=>{
        this._fetchData()
    }

    _SelectPicture = ()=>{

        this.props.navigator.push({
            component:PictureTemplate,
            passProps:{

                getPicture:(url)=>{
                    // console.log('回调的url')
                    // console.dir(url);

                    this.store.selectPicture.url = url
                }

            }
        })

    }

    _fetchData = async()=>{

        this.store.loading = true;

        //暂时调用我去过的搜索游记接口
        var param ={

            LoginUserCode:'VBL00T54',
            Keywords:'我去过',
            SearchSubType:'Travels',
            PageSize:10,
        };

        var result = await  ServingClient.execute('Article.SearchFullText',param);
        // console.dir(result);

        if(result && result.ArticleList && result.ArticleList.length>0){
            this.store.loading = false;
            this.store.isEmpty = false;
            this.store.TemplateArray = result.ArticleList;
            var TemplateDict ={
                url:Chat.getWoquguoCorverImagePath(result.ArticleList[0].CoverImagePath)
            }

            this.store.selectTemplateDict=TemplateDict;
        }

        else {

            this.store.loading = false;
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
        this.store.secondArray  = this.store.titleArray[rowId].items.slice();

    }


    //跳转到素材搜索页面
    _ToSearchTemplate = ()=>{

        this.props.navigator.push({
            component:Search,
            passProps:{
                type:'PictureTemplate'
            }
        })

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
            </TouchableOpacity>

        )

    }

    renderSecondItem = (data,sectionId,rowId)=>{

        return(

            <TouchableOpacity onPress={()=>{
                this.store.selectSecondIndex  =rowId;
                this._fetchData();
            }} style={{backgroundColor:'white',alignItems:'center',justifyContent:'center'}}>
                <Text style={{margin:5}}>{data}</Text>
            </TouchableOpacity>
        )
    }

    renderImageItem = (data)=>{


        return(
            <TouchableOpacity
                onPress={()=>{

                 this.store.selectTemplateDict.url = Chat.getWoquguoCorverImagePath(data.CoverImagePath)
                    }}
                style={styles.itemStyle}>

                <Image style={styles.itemImageStyle} source={{uri:Chat.getWoquguoCorverImagePath(data.CoverImagePath)}}>

                </Image>

            </TouchableOpacity>
        )
    }

    renderBig = ()=>{

        if(this.store.isLoading){

            return(
                <YQFEmptyView title={'正在搜索 '+'   请稍候'} icon={'0xe653'} />
            )
        }
        else  if(this.store.isEmpty){

            return(
                <YQFEmptyView title={'搜索不到对应的数据，请修改搜索关键词'} icon={'0xe15c'} />
            )
        }

        return null;

    }

    renderLoading = ()=>{


        if(this.store.loading){
            return (

                <View style={{position:'absolute',top:64,left:0,right:0,bottom:0,alignItems:'center',justifyContent:'center'}}>

                    <Text>正在加载...</Text>

                </View>

            )
        }

       return null

    }

    renderListview = ()=>{

        if(this.store.loading==false) {

            return (

                <View style={{flex:1, flexDirection:'row',marginTop:5,height:200}}>

                    <ListView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={ {flexDirection:'row'}}
                        style={{marginLeft:20,marginRight:20}}
                        renderRow={this.renderImageItem}
                        dataSource={this.store.getDataSource}>
                    </ListView>

                </View>
            )
        }
        return null

    }
    //导航条
    renderNavBar=()=>{
        return(
            <YQFNavBar  leftIcon={'0xe183'}
                        onLeftClick={()=>{this.props.navigator.pop()}}
                        title={'海报'}/>
        )
    }

    renderImageContainer = ()=>{


        if(this.store.loading==false){
            return(

                <View style={{margin:50,marginTop:20,marginBottom:20}}>

                    <Image style={{alignItems:'center',justifyContent:'center',resizeMode:'cover', width:window.width-100,height:400}} source={{uri:this.store.selectTemplateDict.url}}>

                        <Image

                            source={{uri:this.store.selectPicture.url}}
                            style={{resizeMode:'cover', width:250,height:250}}>

                            <Text onPress={this._SelectPicture} style={{position:'absolute',top:10,right:10,padding:5,
                            backgroundColor:'white',color:'rgb(51,51,51)',borderRadius:3,overflow:'hidden'}}>

                                {'更换图片'}
                            </Text>


                        </Image>

                    </Image>

                </View>

            )
        }

        return null


    }


    render = ()=>{

        return(

            <View style={{flex:1,backgroundColor:'rgb(82,84,106)'}}>




                {this.renderNavBar()}



                {this.renderLoading()}

                {this.renderImageContainer()}


                {this.renderListview()}


            </View>
        )

    }


}


const styles = StyleSheet.create({

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

    }


})