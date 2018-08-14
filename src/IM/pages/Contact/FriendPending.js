/**
 * Created by yqf on 2017/10/30.
 */


//新朋友以及群朋友

//好友推荐

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

import {Chat} from '../../utils/chat'
import Colors from '../../Themes/Colors'
import NavBar from '../../components/navBar';
import YQFNavBar from '../../components/yqfNavBar';

import {Enumerable}  from 'linq';
import friendPending from '../../stores/Contact/FriendPending';
import  {IM} from '../../utils/data-access/im';
import ChatUserInfo from '../../pages/Chat/ChatUserInfo';


let window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}



@observer
export default class FriendPending extends  Component{

    constructor(props){
        super(props);

        this.store = new friendPending();

    }



    fetchData = async()=>{

     //    var result = await IM.getFutureFriends({
     //        FutureFlags:'Unsettled',
     //        IMNr:Chat.userInfo.User.IMNr,
     //    });
     //
     //
     //    if(result  && result.FriendItems && result.FriendItems.length>0){
     //
     //        var FriendItems = result.FriendItems;
     //        for(var i=0;i<FriendItems.length;i++){
     //            //
     //            FriendItems[i].Status = 1;
     //
     //        }
     //
     //
     //        this.store.FriendItems =FriendItems;
     //    }

        
      //  var result = await Chat._GetFriendPending();
        var result =Chat.obj.FriendItems;
        if(result && result.length>0){
            this.store.FriendItems = result;
        }






    }

    componentDidMount(){

        this.fetchData();

    }



    _renderLine(){

        return(
            <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>
        )
    }


    _ToChatUserInfo = (data) =>{


        this.props.navigator.push({

            component:ChatUserInfo,
            passProps:{
                Peer:data.User.IMNr,
                isContact:true,
            }
        })

    }




    _ToAgreeFriend(data,rowId) {


        // console.log('---点击的这个DataItem')
        // console.dir(data);

        //先比较天数
        var isTimeOut = Chat._YQFCompareDayFromNow(data.CreateTime);
        if(isTimeOut){

            alert('好友请求超过3天，不能通过');
            return;
        }

        else {

            //还没通过的
            if (data.Status == 1)
            {
                //在这里处理好友请求的申请
                var Message = {

                    ResponseType:'Agree',
                    FriendIMNr:data.User.IMNr,
                };

                // console.log('FriendResponse -- -参数')
                // console.dir(Message);

                Chat.FriendResponse(Message,(response)=>{

                    var tempData =data;

                    tempData.Status = 2;

                    Chat.obj.FriendItems[rowId]=tempData;
                    this._ToChatUserInfo(tempData);

                },(error)=>{

                    // console.dir(error);

                });


            }


            else{

                console.log('已经是好友了，哈哈哈哈')
                //alert('已经通过了...')

            }


        }


    }

    _renderRow=(data,sectionId,rowId)=>{


        var ContentW = window.width -Chat.ContactComponent.iconW -Chat.ContactComponent.margin-100;
        var statuTitle =data.Status == 1? '添加' :'已添加';
        var statuBorderColor =data.Status == 1? 'rgb(244,72,72)' : 'rgb(153,153,153)' ;
        var statuColor =data.Status == 1? 'rgb(244,72,72)' : 'rgb(153,153,153)';


        return(


            <TouchableOpacity onPress={()=>{

                //this._ToChatUserInfo(data);

            }}>

                <View>
                    <View style={{justifyContent:'space-between',flexDirection:'row',alignItems:'center',backgroundColor:'white'}}>

                        <Image style={{ margin:Chat.ContactComponent.margin,resizeMode:'cover',width:Chat.ContactComponent.iconW,height:Chat.ContactComponent.iconW,borderRadius:0}}
                               source={{uri:Chat.getFaceUrlPath(data.User.FaceUrlPath)}}>

                        </Image>

                        <View style={{backgroundColor:'white',width:ContentW,justifyContent:'space-around'}}>


                            <Text style={{color:Colors.colors.Chat_Color51,fontSize:15}}>{data.User.Name}</Text>
                            <Text style={{color:Colors.colors.Chat_Color102,fontSize:13,marginTop:7}}>{data.Wording}</Text>

                        </View>

                        <TouchableOpacity onPress={()=>{

                            //

                            this._ToAgreeFriend(data,rowId);


                        }}>

                            <View style={{flexDirection:'row', backgroundColor:'white', borderRadius:15,width:70,height:30,marginLeft:10, marginRight:10,borderColor:statuBorderColor, borderWidth:0.75,justifyContent:'center',alignItems:'center'}}>

                                <Text style={{fontSize:12,color:statuColor}}>{statuTitle}</Text>

                            </View>

                        </TouchableOpacity>

                    </View>

                    {this._renderLine()}

                </View>



            </TouchableOpacity>


        );


    }


    _renderNav(){
        return(
            <YQFNavBar title={'新的朋友'}
                       leftIcon={'0xe183'}
                       onLeftClick={()=>{
                           this.props.navigator.pop()

                       // Chat._IMGetUnreadFriend();

                       }} />

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


    render() {

        return(


            <View style={{backgroundColor:'rgb(235,235,235)',flex:1}}>


                {this._renderNav()}

                {this._renderListView()}


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



