
//我的客户

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
import {RestAPI} from '../../utils/yqfws';

class MyCustomerModel extends  Component{

    @observable Datas=[];
    @observable totalScore='0.0';

    @computed get getDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1!==r2});

        return ds.cloneWithRows(this.Datas.slice());
    }



}


@observer
export  default  class MyCustomer extends Component{

    constructor(){
        super();
        this.store = new MyCustomerModel();

    }


    fetchData=async()=>{

        var method="ABIS.CustomerListByUserCode";

        var param={

            UserCode:this.props.Account,
            PageSize:500
        }


        RestAPI.invoke(method,param,(response)=>{

            // console.dir(response);

            this.store.Datas = response.Result.CustomerLists;

        },(error)=>[


        ]);



    }


    componentDidMount=()=>{

        this.fetchData();





    }

    renderHeader = ()=>{

        return(

            <View style={[styles.row,{alignItems:'center',padding:20}]}>

                <Text style={{fontSize:18,color:'rgb(102,102,102)'}}>{'总体评分'}</Text>

                <Text style={{fontSize:26,color:'red'}}>{this.store.totalScore+'分'}</Text>

            </View>

        )

    }




    renderRow = (row) =>{

        const margin=10;
        const iconW=35;

        return(

            <View>


                <View
                    style={[{padding:margin,backgroundColor:'white',alignItems:'center'},styles.row]}>


                    <Image

                        style={{width:iconW,height:iconW,resizeMode:'cover',borderRadius:iconW/2}}
                        source={{uri:Chat.getFaceUrlPath('')}}>

                    </Image>


                    <View style={{justifyContent:'space-between',alignItems:'center'}}>

                        <Text style={{color:'rgb(51,51,51)',fontSize:15,marginTop:0}}>{row.CustomerName}</Text>

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

            ></ListView>
        )

    }

    AddCustomer=()=>{

        alert('1')
    }

    render =()=>{

        return(

            <View style={{backgroundColor:'#fff',flex:1}}>



                <YQFNavBar title={'我的客户'}
                           leftIcon={'0xe183'}
                           rightText={'新增'}
                           onLeftClick={()=>{this.props.navigator.pop()}}
                           onRightClick={()=>{this.AddCustomer()}}
                />

                {this.renderListView()}




            </View>
        )

    }



}

var styles = StyleSheet.create({


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