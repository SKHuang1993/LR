/**
 * Created by yqf on 2017/10/30.
 */





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
    Dimensions,
    Alert,
    TextInput

} from 'react-native';


import {IM} from '../../utils/data-access/im';
import {Chat} from '../../utils/chat'
import Colors from '../../Themes/Colors'
import YQFNavBar from '../../components/yqfNavBar';
import Icon from '../../components/icon';

import ChatUserInfo from '../Chat/ChatUserInfo';
import FriendApplication from './FriendApplication';
import FriendSearch from './FriendSearch';
import ActivityIndicator from '../../components/activity-indicator'


let window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}



class FriendRecommendModel extends  Component{

    @observable isSearch = false;//是否搜索好友界面
    @observable isEmpty = false;//是否没数据
    @observable isLoading = true;
    @observable isAdding = false;//是否正在添加好友
    @observable keyWord = '';//keyword主要用于搜索好友

    @observable Users = [];

    @computed get getDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.Users.slice());

    }


}





@observer

export default class FriendRecommend extends Component{

    constructor(props){
        super(props);



        this.store = new FriendRecommendModel();

    }

    componentDidMount(){


        this.listener = RCTDeviceEventEmitter.addListener('KickOff',()=>{

            this.props.navigator.popToTop();
        });

        this._fetchData();

    }

    componentWillUnmount(){

        this.listener && this.listener.remove();

    }

    async _fetchData(){

        this.store.isLoading = true;

        var Param={
            IMNr:Chat.userInfo.User.IMNr,
            Qty:5
        }

        var result = await IM.getRecommandUsers(Param);

        var Users=[];//存储整理后的用户数据

        // console.log('推荐好友的json')
        // console.dir(result);
        if(result && result.Users){

            for(var i=0;i<result.Users.length;i++){
                var item = result[i];
                var data = {};
                data.IsContact = false;
                data.User = result.Users[i];
                Users.push(data)
            }

        }


        this.store.Users = Users;

        this.store.isLoading = false;
    }


    _renderLine(){

        return(
            <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>
        )
    }

    //好友搜索

    _ToFriendSearch(){

        this.props.navigator.push({

            component:FriendSearch,
            passProps:{
                type:'Search_User'
            }
        })

    }

    //用户详情
    _ToChatUserInfo(data,isContact){

        this.props.navigator.push({

            component:ChatUserInfo,
            passProps:{
                Peer:data.User.IMNr,
                User:data.User,
                isContact:isContact
            }
        })

    }

    //好友验证
    _ToFriendApplication(data){



        if(data.IsContact == true){


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
            this.store.isAdding = true;
            var message={
                FriendIMNr:data.User.IMNr,//好友id
            };
            Chat.PreAddFriend(message,(response)=>{

                this.store.isAdding = false;
                var FriendAllowType = response.FriendAllowType;

                if(FriendAllowType == 'AllowAny'){

                    this._ToChatUserInfo(data,true)


                }else if(FriendAllowType=='DenyAny'){

                    Alert.alert('该好友拒绝被其他人添加')

                }else if(FriendAllowType=='NeedConfirm'){

                    //需要验证
                    //跳到好友验证页面。回调回来的时候需要将状态处理回来
                    this.props.navigator.push({

                        component:FriendApplication,
                        passProps:{
                            User:data.User,
                        }
                    })

                }



            },(error)=>{

                console.log('FriendCommand error')
                // console.dir(error);
                Alert.alert('请求失败，请稍后重试');

            });

        }









    }


    //远程搜索好友
      _ToSearchUser=async()=>{


          this.store.isLoading = true;

          this.store.isSearch = true;
        //点击搜索用户的时候将之前的数据清空
         this.store.Users =[];

        var Owner =Chat.userInfo.User.IMNr;

        var Param = {

            Keywords:this.store.keyWord,
            Owner:Owner,
            PageSize:100,
        };

          var response = await IM.getSearchUsers(Param);



        if(response.TotalResults == 0){


            this.store.isLoading = false;
            this.store.isEmpty = true;
            Alert.alert('搜索不到用户，请修改关键词重新搜索')



        }else {

            var SearchedUsers = response.SearchedUsers;


            var CurrentSearchUsers =  SearchedUsers.filter((SearchedUser)=>{
                return SearchedUser.User.IMNr !==Param.Owner;
            })


            this.store.isLoading = false;
            this.store.Users = CurrentSearchUsers;
            this.store.isEmpty = false;

        }


    }

    _renderRow=(data)=>{


        var ContentW = window.width -Chat.ContactComponent.iconW -Chat.ContactComponent.margin-100;

        var statuTitle = data.IsContact == false ? '添加': '已添加';
        var statuBorderColor = data.IsContact == false ? 'rgb(244,72,72)' : 'rgb(220,220,220)';
        var statuColor =data.IsContact == false ? 'rgb(244,72,72)' : 'rgb(153,153,153)';

        var User = data.User;
        return(

            <TouchableOpacity onPress={()=>{

                this._ToChatUserInfo(data,false);
            }}>

                <View>
                    <View style={{justifyContent:'space-between',flexDirection:'row',alignItems:'center',backgroundColor:'white'}}>

                        <Image style={{ margin:Chat.ContactComponent.margin,resizeMode:'cover',width:Chat.ContactComponent.iconW,height:Chat.ContactComponent.iconW,borderRadius:Chat.ContactComponent.iconW/2}}
                               source={{uri:Chat.getFaceUrlPath(User.FaceUrlPath)}}>

                        </Image>

                        <View style={{backgroundColor:'white',width:ContentW,}}>

                            <Text numberOfLines={1} style={{color:Colors.colors.Chat_Color51,fontSize:15}}>{User.Name}</Text>
                        </View>

                        <TouchableOpacity onPress={()=>{this._ToFriendApplication(data)}}>

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


    _renderHeader()
    {

        if(this.store.isSearch == true){
            return null
        }

        return(


            <View>
                <View style={this.props.style}>
                    <View style={[{height:25,backgroundColor:'white',alignItems:'center'},styles.row,styles.flex,]}>

                        <Text style={{fontSize:16,fontFamily:'iconfontim',color:'rgb(204,204,204)',marginLeft:10}}>{String.fromCharCode(this.props.icon)}</Text>
                        <Text style={{fontSize:12,color:'rgb(51,51,51)',marginLeft:5}}>{'推荐用户'}</Text>

                    </View>


                    <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>



                </View>

            </View>
        );

    }


    _renderHeaderBF()
    {
        return(


            <View>

                <TouchableOpacity onPress={()=>{
                    this._ToFriendSearch();
                }} style={{backgroundColor:'rgb(230,230,230)',flex:1,height:40}}>


                    <View style={{flex:1,margin:8,borderRadius:3, backgroundColor:'white', justifyContent:'center',alignItems:'center',flexDirection:'row'}}>

                        <Text style={{fontFamily:'iconfontim',fontSize:13,marginRight:3,color:'rgb(153,153,153)'}}>
                            {String.fromCharCode('0xe171')}</Text>
                        <Text style={[{fontSize:13,marginLeft:3,color:'rgb(153,153,153)'}]}>
                            {'搜索'}</Text>

                    </View>



                </TouchableOpacity>


                <View style={this.props.style}>


                    <View style={[{height:25,backgroundColor:'white',alignItems:'center'},styles.row,styles.flex,]}>

                        <Text style={{fontSize:16,fontFamily:'iconfontim',color:'rgb(204,204,204)',marginLeft:10}}>{String.fromCharCode(this.props.icon)}</Text>
                        <Text style={{fontSize:12,color:'rgb(51,51,51)',marginLeft:5}}>{'推荐用户'}</Text>

                    </View>


                    <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>



                </View>

            </View>
        );

    }

    _renderNav(){

        return(
            <YQFNavBar title={'添加好友'}
                       leftIcon={'0xe183'}
                       onLeftClick={()=>{this.props.navigator.pop()}} />

        )
    }

    _renderListView(){



        /*
        if(this.store.isLoading){
            return <ActivityIndicator toast text={'正在加载...'} animating={this.store.isLoading}/>

        }
        else  if (this.store.isAdding){
            return <ActivityIndicator toast text={'正在添加好友'} animating={this.store.isAdding}/>

        }

       else if(this.store.isEmpty){
            return(
                <YQFEmptyView title={'搜索不到用户，请修改搜索关键词'} icon={'0xe15c'} />
            )
        }

*/


        return(
            <ListView scrollEnabled={true}

                      dataSource={this.store.getDataSource}
                      renderHeader={this._renderHeader.bind(this)}
                      renderRow={this._renderRow}>

            </ListView>
        )
    }

    _renderEmpty = ()=>{

        // if(this.store.isEmpty) {
        //     return (
        //         <YQFEmptyView title={'搜索不到用户，请修改搜索关键词'} icon={'0xe15c'}/>
        //     )
        // }
        return null

    }

    _renderIsAdding = ()=>{

        if(this.store.isAdding){
            return <ActivityIndicator toast text={'正在添加好友...'} animating={this.store.isAdding}/>
        }
        return null;
    }

    _renderLoading= ()=>{

        if(this.store.isLoading){
            return <ActivityIndicator toast text={'正在查找...'} animating={this.store.isLoading}/>
        }
        return null;
    }


    //没有用户数据

    //搜索条
    _renderSearchBar=()=>{


        return(

            <View style={{backgroundColor:Colors.colors.Chat_Color230}}>

                <View style={{margin:8,borderRadius:3, backgroundColor:'white',alignItems:'center',flexDirection:'row'}}>

                    <Icon size={15} color={Colors.colors.Chat_Color153} icon={'0xe171'} style={{marginLeft:10}}/>

                    <TextInput
                        style={{ width:window.width-50,margin:5,color:Colors.colors.Chat_Color51,padding:0,height:22}}
                        placeholder={'搜索好友'}
                        returnKeyType={'search'}
                        onChangeText={(text)=>{

                            this.store.keyWord = text;
                        }}
                        multiline={false}
                        onSubmitEditing={(text) => {

                            this._ToSearchUser();


                        }}
                        underlineColorAndroid='transparent'>


                    </TextInput>


                </View>

            </View>
        )
    }



    render()

    {

        return(


            <View style={{backgroundColor:'rgb(235,235,235)',flex:1}}>


                {this._renderNav()}

                {this._renderSearchBar()}

                {this._renderListView()}

                {this._renderLoading()}

                {this._renderIsAdding()}

                {this._renderEmpty()}





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


