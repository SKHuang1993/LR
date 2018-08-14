/**
 * Created by yqf on 2017/11/8.
 */



//新建标签

import { observer } from 'mobx-react/native';
import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import Swipeout from 'react-native-swipeout';


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
    TextInput,

} from 'react-native';

import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';

import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import YQFNavBar from '../../components/yqfNavBar';

import contactTag from '../../stores/Contact/ContactTag';
import {IM} from '../../utils/data-access/im';
import Colors from '../../Themes/Colors';
import Icon  from '../../components/icon';
import tagAdd  from '../../stores/Contact/TagAdd';
import {Chat} from '../../utils/chat';
import Enumerable from 'linq';
import ContactSelect from './ContactSelect';

import ChatUserInfo from '../../pages/Chat/ChatUserInfo';

@observer
export default  class  TagAdd extends Component{

    constructor(props){
        super(props);
        this.store = new tagAdd();

        // console.log('porps');
        // console.dir(props);

        this.store.type = props.type ?  props.type : 'add';

        this.store.title = this.store.type=='add' ? '添加标签' : '设置标签';

        this.store.TagName = this.store.type == 'update' ? props.Tag.Name : null;

        if( this.store.type == 'update'){


            this.store.SelectArray =this.store.SelectArray.concat(props.Tag.Members);
            var response = this.pySegSortPinyin(this.store.SelectArray);

            this.store.Tags = response;


            // this.store.SelectArray = props.Tag.Members;
            // this.store.Tags =
        }

    }


    componentDidMount(){




    }


    _confirm = async()=>{


        var Name = this.store.TagName;
        // alert(Name);

       // var result = await Chat.getUserInfo();
        var result = Chat.userInfo;


        //1.新建便签
        var UserTagMembers = [];
        var userTags={};
        var IMNrs =[];//所有的IMNr数据

        this.store.SelectArray.forEach((item)=>{
            IMNrs.push(item.IMNr);
        })

        //根据类型来判断
        var type = this.store.type;

        if(type == 'add'){

            for(var i=0;i<IMNrs.length;i++){

                var UserTagMember={
                    Action:1,
                    IMNr:IMNrs[i]
                }
                UserTagMembers.push(UserTagMember);
            }

            userTags={

                UserTagMembers:UserTagMembers,
                Name:Name,
                Action:1
            }


        }
        else if(type =='update'){


            for(var i=0;i<IMNrs.length;i++){

                var UserTagMember={
                    Action:1,
                    IMNr:IMNrs[i],
                }
                UserTagMembers.push(UserTagMember);
            }

            userTags={

                UserTagMembers:UserTagMembers,
                Name:Name,
                Action:2,
                ID:this.props.Tag.ID,
            }

        }

        else {


        }



        var Param={
            IMNr:result.User.IMNr,
            UserTags:[userTags]
        }

        // console.log('即将要上传添加标签的参数')
        // console.dir(Param);


        var result111 =await IM.getIMSystemUserTagMemberCD(Param);
        // console.log('这是增加标签的结果')
        // console.dir(result111);



        //0。5s返回上一级
        setTimeout(()=>{

            this.props.navigator.pop();

            this.props.confirmCallBack('test');
        },500);




    }


    pySegSortPinyin=(arr) =>{


        // console.log('即将要排列的数据');
        // console.dir(arr);


        var ccc = (arr.sort((obj1, obj2)=>{


            var val1 = obj1.Pinyin.toUpperCase();
            var val2 = obj2.Pinyin.toUpperCase();

            if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }
        } ));



        // console.log('ccc 排列后的');
        // console.dir(ccc);


        var dic={};

        ccc.map((contact)=>{

            var first = contact.Pinyin.toUpperCase().substring(0,1);


            if(first == undefined){
                alert('Pinyin')
            }

            if (dic[first] != undefined) {
                dic[first].push(contact);
            }
            else {
                var data = [];
                data.push(contact);
                dic[first] = data;
            }
        })



        if(dic)
        {
            return dic;
        }

        else
        {
            return null;
        }



    };




    _ToChatUserInfo(data){

        //判断data
        if(data && data.User){

            this.props.navigator.push({

                component:ChatUserInfo,
                passProps:{
                    Peer:data.User.IMNr,
                    User:data.User,
                    isContact:true
                }
            })
        }


        else {

            this.props.navigator.push({

                component:ChatUserInfo,
                passProps:{
                    Peer:data.IMNr,

                }
            })
        }




    }

    _ToChatSelect(){

        this.props.navigator.push({

            component:ContactSelect,
            passProps:{
                type:'TagAdd',
                SelectArray:this.store.SelectArray,
                getContact:(selectArrays)=>{



                    this.store.SelectArray =this.store.SelectArray.concat(selectArrays);
                    var response = this.pySegSortPinyin(this.store.SelectArray);
                    this.store.Tags = response;

                }
            }
        })

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
            <YQFNavBar
                title={ this.store.title}
                leftText={'取消'}
                rightText={'完成'}
                onRightClick={()=>{
                //判断是否有群成员和标签。如果有的话则显示出来。如果没有则不显示

this._confirm();

            }}  onLeftClick={()=>{this.props.navigator.pop()}} />


        )
    }


    _renderContent=()=>{

        return(

            <View style={{backgroundColor:'rgb(220,220,220)'}}>

                <Text style={{padding:10,color:'rgb(153,153,153)'}}>{'标签名字'}</Text>

                <TextInput onChangeText={(text)=>{

                    this.store.TagName = text;

                }}


                           ref={(TextInput)=>{this.TextInput=TextInput}}
                           value={this.store.TagName}
                           underlineColorAndroid="transparent"
                           style={{height:40,backgroundColor:'white',padding:10}}
                           placeholder={'未设置标签名字'}></TextInput>


                <Text style={{padding:10,color:'rgb(153,153,153)'}}>{'标签成员'}</Text>



                <TouchableOpacity onPress={()=>{


                    this._ToChatSelect();

            }}>

                    <View style={{backgroundColor:'rgb(255,255,255)',padding:16,flexDirection:'row',alignItems:'center'}}>

                        <Icon icon={'0xe119'} color={'green'} size={17} />

                        <Text style={{color:'green',fontSize:17,marginLeft:10}}>{'添加成员'}</Text>

                    </View>

                    {this._renderLine()}

                </TouchableOpacity>


            </View>
        )
    }


    _renderSectionHeader(data,sectionID)
    {

        return(

            <View style={{backgroundColor:'rgb(244,244,244)',height:20,justifyContent:'center'}}>

                <Text style={[{marginLeft:10,color:Colors.colors.Chat_Color102}]}>
                    {sectionID.toLocaleUpperCase()}
                </Text>

            </View>

        );


    }


    _DeleteTagItem(data,sectionID,rowID){


        var sectionArray = this.store.Tags[sectionID];
        sectionArray.splice(rowID,1);





        console.log('删除某一个item');

        //在这里selectArray也需要重新考虑
        var index = this.store.SelectArray.findIndex((item)=>{

            return item.IMNr == data.IMNr;
        })

        this.store.SelectArray.splice(index,1);


        //判断sectionArray
        if(sectionArray.length>=0){
            this.store.Tags[sectionID] = sectionArray;

        }
        else {
            this.store.Tags  =this.pySegSortPinyin(this.store.SelectArray)
        }


    }

    _renderRow = (data,sectionID,rowID)=>
    {


        var margin=Chat.ContactComponent.margin/2;
        var iconW = Chat.ContactComponent.iconW;
        var type = this.store.type;

        var FaceUrlPath,Name;

        var swipeoutBtns = [
            {
                text: '删除',
                backgroundColor:'red',

                onPress:()=>{

                    this._DeleteTagItem(data,sectionID,rowID);
                }
            }
        ];



        if(type == 'add'){

            FaceUrlPath = Chat.getFaceUrlPath(data.FaceUrlPath);
            Name = data.Name;

        }
        else if(type == 'update'){
            FaceUrlPath = data.IconFile ? Chat.getFaceUrlPath(data.IconFile) : Chat.getFaceUrlPath(data.FaceUrlPath);
            Name = data.AliasName ? data.AliasName : data.Name;
        }


        return(

            <Swipeout right={swipeoutBtns}>

                <TouchableOpacity onPress={()=>{

                       this._ToChatUserInfo(data,);

            }}>

                    <View style={[styles.row,{backgroundColor:'white'}]}>

                        <Image style={{margin:margin*2,resizeMode:'cover',width:iconW,height:iconW,borderRadius:iconW/2}}
                               source={{uri:FaceUrlPath }}>

                        </Image>

                        <View style={[styles.center,{}]}>

                            <Text style={{fontSize:Chat.ContactComponent.fontSize,color:Colors.colors.Chat_Color51}}>
                                {Name}
                            </Text>

                        </View>



                    </View>
                    <View style={{backgroundColor:Colors.colors.Chat_Color235,height:0.5,}}></View>

                </TouchableOpacity>
            </Swipeout>


        );

    }


    _renderListView(){

        if(this.store.Tags){

            return(
                <ListView
                    dataSource={this.store.getDataSource}
                    enableEmptySections={true}
                    renderRow={this._renderRow}
                    renderHeader={this._renderContent}
                    renderSectionHeader={this._renderSectionHeader.bind(this)}
                    removeClippedSubviews={false}
                ></ListView>
            )
        }

        return null;


    }



    render()

    {

        return(


            <View style={{backgroundColor:'rgb(235,235,235)',flex:1}}>


                {this._renderNav()}


                {this._renderListView()}



            </View>


        );

    }



}



const styles = StyleSheet.create({

    row:{

        flexDirection:'row',

    },
    center: {

        justifyContent: 'center',
        alignItems: 'center',

    },

    flex:{
        backgroundColor:'rgb(248,248,248)',
        flex:1,
    },

    flex1:{
        flex:1,
    }


});


