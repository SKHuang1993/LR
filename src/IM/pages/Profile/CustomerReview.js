
//客户对我的评价

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

} from  'react-native';

import YQFNavBar from '../../components/yqfNavBar';
import {Chat} from '../../utils/chat';


class CustomerReviewModel extends  Component{

    @observable Datas=[];
    @observable totalScore='0.0';


    @computed get getDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1!==r2});

        return ds.cloneWithRows(this.Datas.slice());
    }


}


@observer
export  default  class CustomerReview extends Component{

    constructor(){
        super();
        this.store = new CustomerReviewModel();

    }

    fetchData=async()=>{

        this.store.Datas=[1,2,3];

    }

    componentDidMount=()=>{

        this.fetchData();

    }

    renderHeader = ()=>{

        return(

            <View>


            <View style={[styles.row,{alignItems:'center',padding:20}]}>

                <Text style={{fontSize:18,color:'rgb(102,102,102)'}}>{'总体评分'}</Text>

                <Text style={{fontSize:26,color:'red',marginLeft:30}}>{this.store.totalScore+' 分'}</Text>

            </View>


            </View>
        )

    }




    renderRow = (row) =>{

        const margin=10;
        const iconW=50;

        return(

            <View>


                <View
                    style={[{padding:margin,backgroundColor:'white'},styles.row]}>


                        <Image

                            style={{width:iconW,height:iconW,resizeMode:'cover',borderRadius:iconW/2}}
                            source={{uri:Chat.getFaceUrlPath('')}}>

                        </Image>




                    <View style={{}}>


                        <View style={{flex:1,flexDirection:'row', marginLeft:margin,justifyContent:'space-around',alignItems:'center'}}>

                            <Text style={{color:'rgb(51,51,51)',fontSize:15,marginTop:0}}>{'刘先生'}</Text>
                            <Text style={{color:'rgb(153,153,153)',fontSize:13}}>{'2017/4/3 14:52:29'}</Text>

                        </View>


                        <View style={{margin:margin,justifyContent:'space-around',alignItems:'center'}}>


                        <Text>{'服务满意 -客人默认评分'}</Text>
                        </View>

                    </View>


                </View>

                {this._renderLine()}

            </View>


        )



    }

    _renderLine(){

        return(
            <View style={{backgroundColor:'rgb(235,235,235)',height:5,}}></View>
        )
    }




    renderListView = ()=>{

        return(
            <ListView
                dataSource={this.store.getDataSource}
                enableEmptySections={true}
                renderRow={this.renderRow}
                removeClippedSubviews={false}
                renderHeader={this.renderHeader}

            ></ListView>
        )

    }


    render =()=>{

        return(

            <View style={{backgroundColor:'#fff',flex:1}}>



                <YQFNavBar title={'客户对我的评价'} leftIcon={'0xe183'} onLeftClick={()=>{this.props.navigator.pop()}}/>

                {this.renderListView()}




            </View>
            )

    }



}

var styles = StyleSheet.create({


    // main:{
    //     flex:1,
    //     backgroundColor:'#fff'
    // },


    row:{
        flexDirection:'row'
    },

    center:{
        justifyContent:'center',
        alignItems:'center'
    },
    flex:{
        flex:1
    }


})