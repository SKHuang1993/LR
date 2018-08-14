


import React, { Component } from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'

import {

    StyleSheet,
    View,
    Image,
    Text,
    ListView,
    TouchableOpacity,
    DeviceEventEmitter


} from 'react-native';

import YQFNavBar from '../../components/yqfNavBar';

import Colors from '../../Themes/Colors';
import {Chat} from '../../utils/chat'

import ChatRoom from '../../pages/Chat/ChatRoom';

import YQFProgressHUD from '../../components/YQFProgressHUD';

import Enumerable from 'linq';


//联系人列表
export default class Chat_Select_Contacts extends Component
{


    constructor(props) {
        super(props);

        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2
        });

        this.state = {

            Users: [],
            SelectList:[],//选中的人
            isLoad: true,
            dataSource: ds.cloneWithRowsAndSections({}),
        }
    }


    _TagAdd(){

        var SelectList = this.state.SelectList;
        // console.log('选择了这些人，用于插入标签的');
        // console.dir(SelectList);
        this.props.getContact(SelectList);
        this.props.navigator.pop();


    }


    //根据两个人的聊天创建群聊
    _CreateNewGroup()
    {


        var Infos = this._getMembersAndIMNrsAndContent(this.state.SelectList);



        var Members=Infos.Members;
        var IMNrs =Infos.IMNrs;
        var Content = Infos.Content;

        if(Members.length == 0){

            alert('请至少选择一个人')
            return;
        }

        else
        {


            var MemberNrs = IMNrs;

            MemberNrs.push(this.props.Members[0].IMNr);



            var message={
                    MemberNrs:MemberNrs,
                     }




            Chat.CreateGroup(message,(response)=>{


                Chat.createConversation(this.props.navigator,response.IMNr,Content,'Group',(conversation)=>{

                    var tempContent = '你邀请'+Content + '加入了群聊';


                    Chat.insertNotificationMessage(response.IMNr,"Group",tempContent);

                })


            });



        }



    }


    //发起聊天(创建群聊)
     CreateGroup=async()=> {

        var Infos = this._getMembersAndIMNrsAndContent(this.state.SelectList);



        var Members=Infos.Members;
        var IMNrs =Infos.IMNrs;
        var Content = Infos.Content;
      //  Content = '你邀请'+Content + '加入了群聊';

        if(Members.length == 0){

            alert('请至少选择一个人')
            return;
        }



        //如果只有一个人的情况下，则直接进入单聊模式
        else  if(Members.length == 1)
        {

            var member = Members[0];

            var data = {

                FaceUrlPath:member.FaceUrlPath,
                Name:member.Name,
                Peer:member.IMNr,
            };


            //跳到对话窗口

            this.props.navigator.push({

                component:ChatRoom,

                passProps:{

                    response:Chat.userInfo,
                    data:data,
                    ConversationType:'C2C',
                    from:'Chat_Select_Contacts',


                }

            })




        }

        //有多个人，进入群聊模式
        else
        {


            // var currentError={
            //     isHidden:false,
            //     title:'正在创建群聊...',
            // };
            // this.refs.progress.showHUD(currentError);

            var message;
            var Name;

            //有群名
            if(this.props.Name && this.props.Name.length)
            {
                Name = this.props.Name;
                message={
                    MemberNrs:IMNrs,
                    Name:Name,
                }

            }
            else {
                message={
                    MemberNrs:IMNrs,
                }
            }

            Chat.CreateGroup(message,(response)=>{


                Chat.createConversation(this.props.navigator,response.IMNr,Content,'Group',(conversation)=>{

                    var tempContent = '你邀请'+Content + '加入了群聊';
                    Chat.insertNotificationMessage(response.IMNr,"Group",tempContent);

                })





            });



        }


    }



    //增加群成员
    AddGroupMember = async()=>{

        var Members=[];
        var content='';
        var SelectList = this.state.SelectList;

        if(SelectList.length>0) {

            var currentError={
                isHidden:false,
                title:'正在新增成员...',
            };
            this.refs.progress.showHUD(currentError);


            for (var i = 0; i < SelectList.length; i++) {

                Members.push(SelectList[i].IMNr);
                content = content+''+SelectList[i].Name+',';
            }

            var message = {

                GroupIMNr: this.props.GroupIMNr,
                UserIMNrs: Members,
                content:content
            };

            Chat.AddGroupMember(message,(response)=>{


                var currentError={
                    isHidden:true,
                    title:'正在新增成员...',
                };

                this.refs.progress.showHUD(currentError);
                this.props.callback('123');

                this.props.navigator.pop();


            },(failure)=>{

                var currentError={
                    isHidden:true,
                    title:'正在新增成员...',
                };

                this.refs.progress.showHUD(currentError);
                this.props.callback('123');

                this.props.navigator.pop();

            });


        }


        else
        {

            alert('请至少选择一个群成员');

        }





    }

    //移除群成员
    RemoveGroupMember = async()=>{

        var Members=[];
        var content='';
        if(this.state.SelectList.length>0) {

            var currentError={
                isHidden:false,
                title:'正在移除成员...',
            };
            this.refs.progress.showHUD(currentError);

            for (var i = 0; i < this.state.SelectList.length; i++) {

                Members.push(this.state.SelectList[i].IMNr);
                content = content+''+this.state.SelectList[i].Name+',';

            }

            var message = {

                GroupIMNr: this.props.GroupIMNr,
                UserIMNrs: Members,
            };


            Chat.RemoveGroupMember(message, () => {


                var currentError={
                    isHidden:true,
                    title:'正在移除成员...',
                };

                this.refs.progress.showHUD(currentError);

                //将移除的成员传回去
                this.props.callback('123');

                this.props.navigator.pop();


            },() => {


            });
        }

        else
        {
            alert('请至少选择一个群成员');
        }


    }

    _getMembersAndIMNrsAndContent(Array){


        var Members=[];
        var IMNrs = [];
        var Content = '';
        var length = Array.length;
        for(var i=0;i<length;i++){

            Members.push(Array[i]);

            if(Array[i] && Array[i].Name){
                Content = Content+''+Array[i].Name+',';
            }

            if(Array[i] && Array[i].IMNr){
                IMNrs.push(Array[i].IMNr);
            }else {
                IMNrs.push(Array[i]);
            }

        }

        return {

            Members:Members,
            IMNrs:IMNrs,
            Content:Content,
        }



    }


    //消息转发
    _TransmitMessage(){



        // console.log('传过来的消息，用来转发.发送完回去之前那个对话页面');
        // console.dir(this.props.Message);


        var Members=[];


        for(var i=0;i<this.state.SelectList.length;i++)
        {

            Members.push(this.state.SelectList[i]);
        }

        if(Members.length == 0){

            alert('请至少选择一个人')
            return;
        }


//如果只有一个人的情况下，则直接进入单聊模式
        else  if(Members.length == 1)
        {

            var member = Members[0];
            var data = {

                FaceUrlPath:member.FaceUrlPath,
                Name:member.Name,
                Peer:member.IMNr,

            };

            // console.log('单聊的data');
            // console.dir(data);


            var Message =this.props.Message;
            var User = member;

            var Param={

                isHidden:false,
                Message:Message,
                User:member

            };

            this.Dialog.showDialog(Param);


            /*
             Chat_Util.storage.load({

             key:Chat_Util.StorageKey.Peer,

             }).then(ret=> {

             this.props.navigator.push({

             name:'Chat_Select_Contacts',

             component:Chat_Conversation,
             passProps:{


             response:ret,
             data:data,
             ConversationType:'C2C',
             from:'Chat_Select_Contacts',


             }

             })


             });
             */

        }

        //需要创建新的群聊，同时将新的消息发送过去

        else {


        }


    }


    _HandleData = async()=>{


        var response = Chat.obj.Contacts;

        var type = this.props.type;


        //选择一个聊天
        if(type == 'TransmitMessage'){

            //联系人数据


            var response = Chat.obj.Contacts;
                for(var i=0;i<response.Users.length;i++)
                {
                    response.Users[i]['select']=false;
                }


                Chat.pySegSort(response.Users,response=>{

                    const ds = new ListView.DataSource({
                        rowHasChanged: (r1, r2) => r1 !== r2,
                        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
                    });

                    this.state.Users=response;
                    this.setState({
                        dataSource: ds.cloneWithRowsAndSections(this.state.Users),
                        isLoad:false,

                    })

                },(error)=>{

                });




        }

        //选择标签
        else if(type == 'TagAdd'){

            // console.log('TagAdd传过来的数据');
            // console.dir(this.props);
            const ds = new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2,
            });

                console.log('TagAdd --- 获取本地通讯录');

                for (var i = 0; i < response.Users.length; i++) {


                    var user = response.Users[i].User;
                    user['select']=false;

                    var isFind = false;

                    for(var j=0;j<this.props.SelectArray.length;j++)
                    {

                        var member = this.props.SelectArray[j];
                        //如果通讯录的用户与群里面的用户匹配到，则不要显示
                        if(user.IMNr==member.IMNr)
                        {
                            isFind = true;
                        }
                    }

                    if(isFind ==false)
                    {

                        this.state.Users.push(user);
                    }

                }


                this.setState({

                    dataSource: ds.cloneWithRows(this.state.Users),
                    isLoad: false,

                })



        }


        //AddGroupMember
        else  if(type =='AddGroupMember' || type =='CreateNewGroup')
        {


            const ds = new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2,
            });

            for (var i = 0; i < response.Users.length; i++) {

                var user = response.Users[i].User;
                user['select']=false;
                var isFind = false;

                for(var j=0;j<this.props.Members.length;j++)
                {

                    var member = this.props.Members[j];
                    //如果通讯录的用户与群里面的用户匹配到，则不要显示
                    if(user.IMNr==member.IMNr)
                    {
                        console.log('find')
                        isFind = true;
                    }
                }

                if(isFind ==false)
                {
                    this.state.Users.push(user);
                }
            }

            this.setState({

                dataSource: ds.cloneWithRows(this.state.Users),
                isLoad: false,
            })


        }

        //RemoveGroupMember
        else  if(type =='RemoveGroupMember')
        {
            // console.log('RemoveGroupMember传过来的数据');
            // console.dir(this.props);

            const ds = new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2,
            });

            for(var i=0;i<this.props.Members.length;i++)
            {

                var member = this.props.Members[i];
                member['select']=false;

                if(member.Level !='Administrator')
                {
                    this.state.Users.push(member);
                }

            }

            this.setState({

                dataSource: ds.cloneWithRows(this.state.Users),
                isLoad: false,

            })


        }



        //发起群聊
        else  if(type == 'CreateGroup')
        {

            for(var i=0;i<response.Users.length;i++)
            {
                response.Users[i]['select']=false;
            }

            Chat.pySegSort(response.Users,response=>{

                const ds = new ListView.DataSource({
                    rowHasChanged: (r1, r2) => r1 !== r2,
                    sectionHeaderHasChanged: (s1, s2) => s1 !== s2
                });

                this.state.Users=response;
                this.setState({
                    dataSource: ds.cloneWithRowsAndSections(this.state.Users),
                    isLoad:false,

                })

            },(error)=>{

            });




        }


        else {

        }


    }


    componentDidMount()
    {

        //账号被踢下线
        this.listener = RCTDeviceEventEmitter.addListener('KickOff',()=>{

            this.props.navigator.popToTop();
        });


        this._HandleData();


    }


    componentWillUnmount(){
        this.listener.remove();
    }


    _renderHeader()
    {


        if(this.props.type=='TransmitMessage'){


            return(
                <View style={{margin:20}}>
                    <Text style={{fontSize:15,color:'rgb(51,51,51)'}} onPress={()=>{

/*
    this.props.navigator.push({

        component:Chat_Group_My,
        passProps:{

            type:'TransmitMessage',


        }

    })
*/
}}>{'选择群聊'}</Text>
                </View>

            )

        }

        return null;



    }



    _renderSectionHeader(data,sectionID)
    {

        return(

            <View style={{backgroundColor:'rgb(244,244,244)',height:20,justifyContent:'center'}}>
                <Text style={[{marginLeft:10,color:Colors.colors.Chat_Color102}]}>{sectionID}</Text>

            </View>

        );



    }


    _renderRow(data,sectionID,rowID)
    {



        var type = this.props.type;



        var margin=Chat.ContactComponent.margin;
        var iconW = Chat.ContactComponent.iconW;
        var iconH = iconW;
        var FaceUrlPath,Name;


        //如果是删除群成员，添加新成员，创建新的群聊
        if(type =='RemoveGroupMember' || type == 'TagAdd' ||  type =='AddGroupMember' || type =='CreateNewGroup')
        {
            FaceUrlPath = Chat.getFaceUrlPath(data.FaceUrlPath);
            Name = data.Name;
        }

        else if(type == 'CreateGroup' || type == 'TransmitMessage')
        {

            FaceUrlPath = Chat.getFaceUrlPath(data.User.FaceUrlPath);
            Name = data.User.Name;
        }

        else {


            FaceUrlPath = Chat.getFaceUrlPath(data.User.FaceUrlPath);
            Name = data.User.Name;
        }




        return(


            <TouchableOpacity   onPress={()=>{


                             data.select =!(data.select);


                                  if(this.props.type == 'CreateGroup' || this.props.type=='TransmitMessage'){


                                  const ds = new ListView.DataSource({
                        rowHasChanged: (r1, r2) => r1 !== r2,
                        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
                    });


            this.setState({
                dataSource: ds.cloneWithRowsAndSections(this.state.Users),
            })
                                  }

                                  else
                                      {
                                           const ds = new ListView.DataSource({
                        rowHasChanged: (r1, r2) => r1 !== r2,

                    });


            this.setState({
                dataSource: ds.cloneWithRows(this.state.Users),
            })

                                      }



            }}>

                <View style={[{backgroundColor:'white',flexDirection:'row'}]}>



                    <View style={[{marginLeft:margin,justifyContent:'center',alignItems:'center'}]}>

                        {data.select ?

                            <Text style={{fontSize:17,fontFamily:'iconfontim',color:Colors.colors.Chat_ThemeColor}}>
                                {String.fromCharCode('0xe176')}
                            </Text>

                            :

                            <Text
                                style={{fontSize:17,fontFamily:'iconfontim',}}>
                                {String.fromCharCode('0xe174')}</Text>


                        }
                    </View>

                    <Image style={{margin:margin,marginLeft:margin*1.5, resizeMode:'cover',width:iconW,height:iconH,borderRadius:iconW/2}}
                           source={{uri:FaceUrlPath }}>

                    </Image>

                    <View style={[{justifyContent:'center',alignItems:'center'}]}>

                        <Text style={{fontSize:Chat.ContactComponent.fontSize,color:Colors.colors.Chat_Color51}}>{Name}</Text>

                    </View>


                </View>

                <View style={{backgroundColor:Colors.colors.Chat_Color235,height:0.5,}}></View>


            </TouchableOpacity>


        );

    }



    async  _getLoginUserInfo(){



        var loginUser =await Chat.getLoginInfo();

        console.log('_getLoginUserInfo --- loginUser');

        // console.dir(loginUser);


        var User ={
            Peer:loginUser.User.IMNr,
            Name:loginUser.User.Name,
            FaceUrlPath:Chat.getFaceUrlPath(loginUser.User.FaceUrlPath),
        };
        return User;


    }



    /*
    //发送消息的参数
    async _getMessageParam(message){



        var IMNr = await Chat.getLoginInfo().User.IMNr;

        var nowTime = (new Date()).valueOf();


        var Param = {

            Peer: IMNr,
            ConversationType: 'C2C',
            // Source:Chat_Util.MessageSource,
            ChatMessage: message,
            TimeStap:nowTime,
            State:'Sending',
        };
        return Param;
    }


    //修改对应的状态
    async  _ChangeConversationState(TimeStap,State){



        var Members=[];
        for(var i=0;i<this.state.SelectList.length;i++)
        {
            Members.push(this.state.SelectList[i]);
        }
        var member = Members[0];
        var Peer = member.IMNr;

        var response = await Chat_Util._IMGetChat(Peer);
        var tempConversations = response;
        var index;
        var isFind = false;
        for(var i=tempConversations.length-1;i>=0;i--){

            if(tempConversations[i].Message && tempConversations[i].Message.TimeStap ==TimeStap ){

                index =i;
                isFind = true;
            }
        }

        if(isFind ==true){

            var updateConversation = tempConversations[index];
            updateConversation.Message.State =State;
            tempConversations[index] = updateConversation;
            // console.log('消息转发后，查看与这个人的对话记录');
            // console.dir(tempConversations);
            //存到本地数据库
            Chat_Util._IMSaveChat(Peer,tempConversations)


        }



    }

    async _handleConversation(conversation)
    {

        var Members=[];
        for(var i=0;i<this.state.SelectList.length;i++)
        {
            Members.push(this.state.SelectList[i]);
        }
        var member = Members[0];


        var Peer = member.IMNr;
        var response = await Chat_Util._IMGetChat(Peer);

        if(response.length>0)
        {
            var lastConversation =response[response.length-1];

            if(lastConversation.Time!=null && lastConversation.Time !=undefined)
            {
                //将当前的时间和旧时间比较
                var currentTime = conversation.Time;
                var lastTime = lastConversation.Time;
                var terminal = Chat_Util.compareTime(currentTime, lastTime);
            }
            //如果大于5分钟，则显示时间
            if(terminal)
            {
                //插入时间
                var timeConversation = {Content:currentTime,Time:currentTime,type:3};

                response.push(timeConversation);
                //插入当前的会话
                response.push(conversation);
            }
            else
            {
                response.push(conversation);
            }

        }

        else
        {

            //插入时间

            var timeConversation = {Content:time,Time:Chat_Util._getCurrentTime(),type:3};
            response.push(timeConversation);
            //插入当前的会话
            response.push(conversation);
        }
        //存到本地数据库
        Chat_Util._IMSaveChat(Peer,response);



    }
    */



    render()
    {

        var rightTitle;
        if(this.props.type=='RemoveGroupMember'){
            rightTitle='删除';
        }
        else
        {
            rightTitle='确定';
        }

        return(

            <View style={{flex:1}}>

                <YQFNavBar  leftIcon={'0xe183'}
                            rightText={rightTitle}
                            title={'选择联系人'}

                                   onLeftClick={()=>{

                                    this.props.navigator.pop();

                                  }}
                                   onRightClick={()=>{

                                       this.state.SelectList = [];


                                       //移除成员 添加成员 发起二人＋群
                                       if(this.props.type == 'RemoveGroupMember' || this.props.type == 'AddGroupMember' || this.props.type == 'TagAdd' || this.props.type == 'CreateNewGroup')

                                           {

/*
                                            var tempArray =    Enumerable.from(this.state.Users).select((o)=>{
                                                   return o.select == true
                                               }).toArray();
                                            console.log('tempArray -- 选中的人')
                                            console.dir(tempArray);
                                            this.state.SelectList =tempArray;
*/


                                               for(var i in this.state.Users)
{


                                                   if(this.state.Users[i].select)
                                                       {
                                                           this.state.SelectList.push(this.state.Users[i])
                                                       }


}


                                           }


                                           else if(this.props.type=='CreateGroup' || this.props.type=='TransmitMessage')
                                               {


                                                       for(var i in this.state.Users)
                                                       {

                                                           for(var j in this.state.Users[i]){

                                                                 if(this.state.Users[i][j].select)
                                                       {

                                                           this.state.SelectList.push(this.state.Users[i][j].User)
                                                       }

                                                           }




                                                       }

                                               }

                                           else
                                               {



                                       for(var i in this.state.Users)
{


                                                   if(this.state.Users[i].select)
                                                       {
                                                           this.state.SelectList.push(this.state.Users[i].User)
                                                       }




}

}




    //发起聊天。根据选中的人数来决定是单聊或者群聊
      if(this.props.type=='CreateGroup')
        {

            this.CreateGroup();
        }

         //这里是增加成员
        else if(this.props.type =='AddGroupMember')
            {

                           // this._PlusGroup();
                           this.AddGroupMember();


            }


        //这里是删除成员
        else if(this.props.type =='RemoveGroupMember')
            {

                this.RemoveGroupMember();

                           // this._KickGroup();


            }

            //根据两个人的聊天创建群聊
            else if(this.props.type == 'CreateNewGroup')
                {

                               this._CreateNewGroup();
                }

                //消息转发
             else if(this.props.type=='TransmitMessage'){


                       this._TransmitMessage();


             }

             else if(this.props.type=='TagAdd'){

                 this._TagAdd();
             }



                                   }}
                />


                {


                    this.props.type == 'Chat' || this.props.type == 'TransmitMessage'?
                        <ListView dataSource={this.state.dataSource}
                                  renderHeader={this._renderHeader.bind(this)}
                                  renderSectionHeader={this._renderSectionHeader.bind(this)}
                                  renderRow={this._renderRow.bind(this)}>

                        </ListView>
                        :

                        <ListView dataSource={this.state.dataSource}
                                  renderHeader={this._renderHeader.bind(this)}
                                  renderRow={this._renderRow.bind(this)}>


                        </ListView>


                }


                <YQFProgressHUD ref='progress'/>




            </View>
        );
    }


}

