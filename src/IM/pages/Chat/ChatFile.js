/**
 * Created by yqf on 2017/10/30.
 */


import { observer } from 'mobx-react/native';
import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'


import {
    TouchableOpacity,
    StyleSheet,
    Image,
    ListView,
    Text,
    View,
    RefreshControl,
    Dimensions

} from 'react-native';

import YQFNavBar from '../../components/yqfNavBar';

import chatFile from '../../stores/Chat/ChatFile';

import Colors from '../../Themes/Colors';

let window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}


@observer
export  default  class Chat_File extends Component
{


    constructor(props)
    {
        super(props);

        this.store = new chatFile();

        this.store.Files = this.props.Files ?this.props.Files : [] ;
    }


    _renderRow(data)
    {

        var margin=3;
        var number = 4;
        var iconW = (window.width - margin*2 *number-margin)/number;

        return(


            <TouchableOpacity onPress={this.props.onPress}>


                <View style={{alignItems:'center',margin:margin,}}>


                    <View style={{backgroundColor:'white'}}>

                        <Image style={{width:iconW,height:iconW,resizeMode:'cover'}} source={{uri:data.ChatMessage.ImageContent.Url}}>

                        </Image>

                    </View>


                </View>

            </TouchableOpacity>

        );

    }


    _renderLoading()
    {
        return(

            <View style={[styles.flex,{marginTop:100,alignItems:'center'}]}>


                <Text style={{fontFamily:'iconfontim',fontSize:120,color:'rgb(204,204,204)'}}>{String.fromCharCode('0xe123')}</Text>
                <Text style={{fontSize:16,marginTop:10,color:Colors.colors.Chat_Color153}}>{'暂无文件'}</Text>


            </View>


        );

    }


    render()
    {


        //进来的时候首先加载数据，判断有没有。如果有的话，则显示。如果没有，则显示空

        return(


            <View style={{flex:1,backgroundColor:'rgb(240,240,240)'}}>

                <YQFNavBar title={'聊天文件'} leftIcon={'0xe183'} onLeftClick={()=>{this.props.navigator.pop()}}/>

                {

                    this.store.Files.length>0 ?
                        <ListView contentContainerStyle={styles.list}
                                  showsVerticalScrollIndicator={false}
                                  dataSource={this.store.getDataSource}
                                  renderRow={this._renderRow.bind(this)}
                                  removeClippedSubviews={false} ></ListView>
                        :
                        this._renderLoading()

                }


            </View>

        )
    }

}

const styles = StyleSheet.create({


    list: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },

});