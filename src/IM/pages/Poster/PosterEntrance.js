

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
    Alert,
    ActivityIndicator

} from  'react-native';


import YQFNavBar from '../../components/yqfNavBar';
import PosterList from './PosterList'
import PosterList1 from './PosterList1'

import PosterRecord from './PosterRecord';
import PosterCustom from './PosterCustom';

const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}



class  PosterEntranceModel extends  Component{


    @observable isShowUpdateContent= true;//是否显示更新内容



    @observable titleArray=[

        {name:'早中晚报'},
        {name:'自选海报'},
        {name:'海报视频'},
    ];

    @computed get getTitleDataSource(){

        ds1 = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds1.cloneWithRows(this.titleArray.slice());
    }


}

@observer
export  default class  PosterEntrance extends  Component{

    constructor(props){
        super(props);
        this.store = new PosterEntranceModel();
    }

    _ToPosterRecord = ()=>{

        this.props.navigator.push({
            component:PosterRecord,

        })

    }



    //显示更新内容
    showContent = (content)=>{

        Alert.alert(
            "更新要点如下:",
            "1.海报生成无需手动点击,切换列表页即可自动生成当天最新海报。\n\n 2.海报只允许生成当天的，以往的海报只能查看，无法生成。\n\n 3.取消“早中晚报”生成记录，生成时间在列表页可查看到。",
            [
                { text: "确定", onPress: () => { } },
            ]
        );

    }


    renderThirdItem =(data,sectionID,rowID)=>{


        var rightViewWidth= 20;
        var content = "更新要点如下:\n 1.海报生成无需手动点击，"+' \n '+"切换列表页即可自动生成当天最新海报。\n 2.海报只允许生成当天的，以往的海报只能查看，无法生成。\n3.取消“早中晚报”生成记录，生成时间在列表页可查看到。";



        return(
            <TouchableOpacity onPress={()=>{

                if(data.name == '早中晚报'){

                    {/*this.props.navigator.push({component:PosterList})*/}
                 this.props.navigator.push({component:PosterList1})


                }else  if(data.name == '自选海报'){
                    this.props.navigator.push({
                        component:PosterCustom,
                        passProps:{
                            type:'Image'
                        }

                    })

                }else  if(data.name == '海报视频'){
                    this.props.navigator.push({
                        component:PosterCustom,
                        passProps:{
                            type:'Video'
                        }

                    })
                }else {

                }



                }} style={{flexDirection :'row', margin:10,borderRadius:5, justifyContent:'center',alignItems:'center',backgroundColor:'#fff'}}>


                <Text  style={{padding:20, color:'#333333',fontSize:18}}>{data.name}</Text>

                {rowID==0 && this.store.isShowUpdateContent==true?
                    <TouchableOpacity onPress={()=>{this.showContent(content)}} style={{width:rightViewWidth,height:rightViewWidth,borderRadius:rightViewWidth/2, position:'absolute', top:rightViewWidth, right:rightViewWidth, backgroundColor:'red',alignItems:'center',justifyContent:'center'}}>
                        <Text style={{color:'#fff'}}>{"i"}</Text>
                    </TouchableOpacity>

                    :

                    rowID==1&& this.store.isShowUpdateContent==true?

                        <TouchableOpacity onPress={()=>{this._ToPosterRecord()}} style={{position:'absolute', top:rightViewWidth, right:rightViewWidth,alignItems:'center',justifyContent:'center'}}>
                            <Text style={{color:'#666'}}>{"生成记录"}</Text>
                        </TouchableOpacity>
                    :
                    null


                }





            </TouchableOpacity>

        )

    }

    _renderNav(){
        return(
            <YQFNavBar title={'海报'}
                       leftIcon={'0xe183'}
                       onRightClick={()=>{this._ToPosterRecord()}}
                       onLeftClick={()=>{this.props.navigator.pop()}} />
        )
    }


    render() {

        return(

            <View style={{backgroundColor:'rgb(235,235,235)',flex:1}}>

                {this._renderNav()}
                <ListView

                    renderRow={this.renderThirdItem}
                    removeClippedSubviews={false}
                    initialListSize={10}
                    dataSource={this.store.getTitleDataSource}>
                </ListView>
          </View>



        );

    }


}







