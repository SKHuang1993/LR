/**
 * Created by yqf on 2017/11/8.
 */

//标签联系人


import { observer } from 'mobx-react/native';
import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import SwipeAction from '../../components/swipe-action';
import Swipeout from 'react-native-swipeout';
import  Enumerate from 'linq';
import {Chat} from '../../utils/chat'
import {

    TouchableHighlight,
    StyleSheet,
    Image,
    ListView,
    Text,
    View,
    RefreshControl,
    Dimensions,
    TouchableOpacity,


} from 'react-native';

import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
// import YQFNavHeaderView from '../../components/navHeaderView';

import YQFNavBar from '../../components/yqfNavBar';

import contactTag from '../../stores/Contact/ContactTag';

import Colors from '../../Themes/Colors';
import {IM} from '../../utils/data-access/im';

import Icon  from '../../components/icon';
import TagAdd from './TagAdd';


@observer
export default class ContactTag extends Component{

    constructor(props){
        super(props);
        this.store = new contactTag();

    }

    componentDidMount(){

        this._fetchData();
    }


    _fetchData = async()=>{

        //如果上一个页面已经把服务记录都获取了，则直接获取就行

      //  var userResult = await Chat.getUserInfo();


        var result =await IM.getIMSystemUserTagByIMNr({
            IMNr:Chat.userInfo.User.IMNr
        });


        // console.log('getIMSystemUserTagByIMNr');
        // console.dir(result);


        if( result.IMUserTags && result.IMUserTags.length>0){

            this.store.Tags = result.IMUserTags;
        }




    }





    _renderAddTagView = ()=>{

        return (


            <TouchableOpacity onPress={()=>{


                this.props.navigator.push({

                    component:TagAdd,
                    passProps:{
                        type:'add',

                        confirmCallBack:(value)=>{

                     this._fetchData();

                     }

                    }
                })

            }}>


                <View style={{backgroundColor:'rgb(255,255,255)',padding:16,flexDirection:'row',alignItems:'center'}}>

                    <Icon icon={'0xe119'} color={'green'} size={17} />

                    <Text style={{color:'green',fontSize:17,marginLeft:10}}>{'新建标签'}</Text>

                </View>



                {this._renderLine()}

            </TouchableOpacity>
        )
    }


    getMembersName = (Members)=>{

        var Name = '';

        Members.forEach((member)=>{

            Name +=member.AliasName+',';

        })

        //  Name=Name.substring(0,Name.Length-1);


        return Name;

    }

    _deleteTag = async(data)=>{

        //删除这个标签
        var Param={

            IMNr:'1923',
            UserTags:[
                {
                    Action:3,
                    ID:data.ID
                }
            ]

        };

        // console.log('删除整个标签的参数');
        // console.dir(Param);

        //删除整个标签
        var result = await IM.getIMSystemUserTagMemberCD(Param);



    }

    _ToSettingtag = (data)=>{

        // console.log(' _ToSettingtag data');
        // console.dir(data)

        //跳到设置标签页面
        this.props.navigator.push({

            component:TagAdd,
            passProps:{

                type:'update',
                Tag:data,

                confirmCallBack:(value)=>{

                    this._fetchData();


                }

            }

        })



    };

    _renderHeader = ()=>{

        return(
            <View>
                {  this._renderAddTagView()}
            </View>
        )


    }

    _renderRow = (data,sectionID,rowID)=>{


      //  var Name = data.Name + '（'+ data.Members.length +'）' +'   ID为'+data.ID;
        var Name = data.Name + '（'+ data.Members.length +'）';


        var Content = this.getMembersName(data.Members);


        var swipeoutBtns = [
            {
                text: '删除',
                backgroundColor:'red',

                onPress:()=>{

                    this.store.Tags.splice(rowID,1);

                    this._deleteTag(data);
                }
            }
        ];


        return(

            <Swipeout autoClose={true} right={swipeoutBtns}>

                <TouchableOpacity onPress={()=>{

             //   this.props.onPress();
                this._ToSettingtag(data);



            }}>

                    <View style={{backgroundColor:'rgb(255,255,255)'}}>

                        <View style={[{justifyContent:'space-between',margin:10}]}>

                            <Text numberOfLines={1} style={{ color:Colors.colors.Chat_Color51,fontSize:15}}>{Name}</Text>
                            <Text numberOfLines={1} style={{marginTop:5, color:Colors.colors.Chat_Color102,fontSize:16}}>{Content}</Text>

                        </View>

                    </View>
                    {this._renderLine()}
                </TouchableOpacity>

            </Swipeout>
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
            <View style={{backgroundColor:'rgb(235,235,235)',height:1,marginLeft:10}}></View>
        )
    }


    _renderNav(){
        return(
            <YQFNavBar title={'标签'}
                       leftIcon={'0xe183'}
                       onLeftClick={()=>{this.props.navigator.pop()}} />

        )
    }

    _renderListView(){


        if(this.store.Tags && this.store.Tags.length>0){

            return(
                <ListView scrollEnabled={true}
                          renderHeader={this._renderHeader}
                          dataSource={this.store.getDataSource}
                          renderRow={this._renderRow}>
                </ListView>
            )
        }

        else {

            return(

                <View>
                    {this._renderAddTagView()}
                </View>

            )

        }




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


