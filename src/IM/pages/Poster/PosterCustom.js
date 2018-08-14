/**
 * Created by yqf on 2017/12/6.
 */

//自定义海报  选择版式

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
import PosterEdit from './PosterEdit';
import PosterNewYearVideo from './PosterNewYearVideo';


const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,
}


class PosterCustomModel extends  Component{


    //适用于横屏拍摄视频
    //适用于竖屏拍摄视频


    @observable templateType = 'picture';//图片

    @observable type='Image';//默认是自定义海报


    @observable loading = false;
    @observable isEmpty = false;
    @observable selectIndex = 0;
    //模版
    @observable TemplateArray =[];
    @observable videoTip = ""



    @computed get getTemplateDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.TemplateArray.slice());
    }


}



@observer
export  default  class PosterCustom extends  Component{

    constructor(props){
        super(props);

        this.store = new PosterCustomModel();

        this.store.type = props.type;
        this.store.videoTip =  this.store.selectIndex == 0 ? "适\n用\n于\n竖\n屏\n拍\n摄\n视\n频" :"适\n用\n于\n横\n屏\n拍\n摄\n视\n频\n"


        //#TODO 20180808 wudy新需求。海报新模版，第五个模版。头部用一起飞透明logo，底部用个人信息模版。再加上一张图片。
        if(this.store.type == 'Image'){

            this.store.TemplateArray =  [
                require('./Images/poster1s.png'),
                require('./Images/poster2s.png'),
                require('./Images/poster3s.png'),
                require('./Images/posterByDouYin1.png'),
                require('./Images/posternew5s.png'),  //这里后期需要兼容进去
                require('./Images/posternew6s.png'),  //这里后期需要兼容进去


            ]
        }else if(this.store.type == 'Video'){

            //经理让婷婷设计的模版
            this.store.TemplateArray =  [

                require('./Images/posterByDouYin1.png'),
                require('./Images/posterVideoTemplateSecond1.png'),
                require('./Images/posterVideoTemplateThird1.png'),
                require('./Images/posterVideoTemplateFour.jpg'),
            ]
        }else {
            this.store.TemplateArray =  [];
        }

    }

    _ToPosterEdit = ()=>{
        if(this.store.type=='Image'){
            //跳转到海报图片编辑
            this.props.navigator.push({
                component:PosterEdit,
                passProps:{

                    selectIndex:this.store.selectIndex
                }
            })
        }else {

            //跳转到海报视频编辑
            this.props.navigator.push({
                component:PosterNewYearVideo,
                passProps:{
                    selectIndex:this.store.selectIndex

                }
            })

        }

    }

    renderImageItem = (data,sectionId,rowId)=>{

        return(

            <TouchableOpacity
                onPress={()=>{

               this.store.selectIndex = rowId;

               if(rowId==0){
                   this.store.videoTip = "适\n用\n于\n竖\n屏\n拍\n摄\n视\n频"
               }else {
                   this.store.videoTip = "适\n用\n于\n横\n屏\n拍\n摄\n视\n频\n"
               }

                    }}
                style={styles.itemStyle}>

                <Image style={styles.itemImageStyle} source={this.store.TemplateArray[rowId]}>
                </Image>

            </TouchableOpacity>
        )
    }


    renderLeftText = ()=>{


        if(this.store.type =='Image'){
           return         null

        }
        return (
            <Text style={{marginTop:20,marginRight:0, padding:10,fontSize:18, color:'#fff'}}>{this.store.videoTip}</Text>
        )

    }


    renderTemplateImageContainer = ()=>{
        if(this.store.type == 'Image'){

            //#TODO 这里最好用一张大图来处理0808新需求的东西。
            var Images =[
                require('./Images/poster1.png'),
                require('./Images/poster2.png'),
                require('./Images/poster3.png'),
                require('./Images/posterByDouYin1.png'),
                require('./Images/posternew5.png'),
                require('./Images/posternew6.png'),

            ];

        }else if(this.store.type=='Video'){

            var Images =[
                require('./Images/posterByDouYin1.png'),
                require('./Images/posterVideoTemplateSecond1.png'),
                require('./Images/posterVideoTemplateThird1.png'),
                require('./Images/posterVideoTemplateFour.jpg'),
            ];
        }else {
            var Images=[];
        }



        var scale = 540/960;
        var margin = 37 /scale;

        var iconW = window.width-margin*2;
        var iconH = iconW/scale;

        return(

            <View style={{marginTop:20,flexDirection:'row'}}>


                {this.renderLeftText()}

                <Image style={{marginLeft:this.store.type=='Image'? margin : margin/2,marginRight:margin, width:iconW,height:iconH}} source={Images[this.store.selectIndex]}>

                </Image>


            </View>

        )
    }

    
    renderTemplateBottom = () =>{

        return (

            <View style={{flexDirection:'row',marginTop:5}}>
                <ListView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={ {flexDirection:'row'}}
                    removeClippedSubviews={false}
                    initialListSize={10}
                    style={{marginLeft:20,marginRight:20}}
                    renderRow={this.renderImageItem}
                    dataSource={this.store.getTemplateDataSource}>
                </ListView>

            </View>
        )

    }


    render = ()=>{

        return(

            <View style={{flex:1,backgroundColor:'rgb(82,84,106)'}}>

                {this.renderNavBar()}

                {this.renderLoading()}

                {this.renderTemplateImageContainer()}

                {this.renderTemplateBottom()}


            </View>
        )

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
    //导航条
    renderNavBar=()=>{
        return(
            <YQFNavBar  leftIcon={'0xe183'}
                        onLeftClick={()=>{this.props.navigator.pop()}}
                        rightText={'下一步'}
                        onRightClick={()=>{

                           this._ToPosterEdit();

                        }}
                        title={'生成海报'}/>
        )
    }
}


var bottomImageItemScale = 540 / 960;
var bottomImageW = 80;


const styles = StyleSheet.create({

    itemStyle: {
        // 对齐方式
        alignItems:'center',
        justifyContent:'center',

    },
    itemImageStyle: {
        // 尺寸
        width: bottomImageW,
        height:bottomImageW/bottomImageItemScale,
        margin:10,

    }


})