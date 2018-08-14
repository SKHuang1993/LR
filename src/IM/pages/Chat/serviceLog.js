/**
 * Created by yqf on 2017/11/8.
 */

//服务记录

import { observer } from 'mobx-react/native';
import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';


import {
    TouchableHighlight,
    TouchableOpacity,
    StyleSheet,
    Image,
    ListView,
    Text,
    View,
    RefreshControl,
    Dimensions

} from 'react-native';

import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';

import {COLORS,FLEXBOX} from '../../styles/commonStyle';

import YQFNavBar from '../../components/yqfNavBar';

import serviceLog from '../../stores/Chat/serviceLog';

import Colors from '../../Themes/Colors';

@observer
export default class ServiceLog extends Component{

    constructor(props){
        super(props);
     this.store = new serviceLog();

    }

    componentDidMount(){


        this._fetchData();


    }

    _fetchData = async() =>{




        this.store.Logs = [1,2,3,4,5];

    };

    _renderRow = (row)=>{

        return(


            <View>

            <View style={{backgroundColor:'rgb(255,255,255)'}}>

                <Text style={{margin:10, color:Colors.colors.Chat_Color51,fontSize:15}}>{'帮刘先生 预订了 01月03日至01月04日 汉莎航空 波哥大 至 法兰克福 的机票'}</Text>
                <View style={[styles.row,{justifyContent:'space-between',marginBottom:10}]}>

                    <Text style={{marginLeft:10, color:Colors.colors.Chat_Color102,fontSize:13}}>{'5分钟前'}</Text>
                    <Text style={{marginRight:10, color:Colors.colors.Chat_Color102,fontSize:13}}>{'总价:16900'}</Text>

                </View>
            </View>
                {this._renderLine()}
            </View>
        )

    }

    _renderLoading(){

        if(this.store.isLoading){

            <View style={[styles.center]}>

                <Text>正在为你推荐好友，请稍候...</Text>

            </View>

        }
        return null;


    }

    _renderLine(){

        return(
            <View style={{backgroundColor:'rgb(235,235,235)',height:5,}}></View>
        )
    }


    _renderNav(){
        return(
            <YQFNavBar title={'服务记录'}  leftIcon={'0xe183'} onLeftClick={()=>{this.props.navigator.pop()}}/>

        )
    }

    _renderListView(){

        return(
            <ListView scrollEnabled={true}

                      dataSource={this.store.getDataSource}
                      renderRow={this._renderRow}>
            </ListView>
        )
    }



    render()

    {

        return(


            <View style={{backgroundColor:'rgb(235,235,235)',flex:1}}>


                {this._renderNav()}

                {this._renderListView()}

                {this._renderLoading()}

            </View>



        );

    }


}




const styles = StyleSheet.create(
    {

        flex:{
            flex:1,
        },
        row:{
            flexDirection:'row',
        },

        center: {

            justifyContent: 'center',
            alignItems: 'center',

        },


    });


