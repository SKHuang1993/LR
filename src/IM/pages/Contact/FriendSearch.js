/**
 * Created by yqf on 2017/11/1.
 */



import { observer } from 'mobx-react/native';
import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'

let margin=10;
let iconW = 38;
let fontSize=14;


import {
    TouchableOpacity,
    StyleSheet,
    Image,
    ListView,
    Text,
    View,
    RefreshControl,
    Dimensions,
    ScrollView,
    Alert

} from 'react-native';


import {IM} from '../../utils/data-access/im';
import {ServingClient,RestAPI} from '../../utils/yqfws';
import {Chat} from '../../utils/chat';
import Colors from '../../Themes/Colors';
import NavBar from '../../components/yqfNavBar';


import friendSearch from '../../stores/Contact/FriendSearch';
import YQFEmptyView from '../../components/EmptyView';
import FriendApplication from './FriendApplication';
import ChatUserInfo from '../Chat/ChatUserInfo';
import Icon  from '../../components/icon'
import ContactList  from './ContactList'
import AvatarGroup from "../../components/AvatarGroup"

const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,
}

@observer
export default class FriendSearch extends Component{

    constructor(props){
        super(props);

        this.store = new friendSearch();
        this.store.type = this.props.type;

        if(this.store.type == 'INCU'){
            this.store.title = '搜索内部同事'
        } else if(this.store.type =='PictureTemplate'){
            this.store.title = '输入目的地/标签/关键词查找素材'
        }
        else {
            //这里就是
            this.store.title = '输入名字/手机号码/IM号'
        }

    }


    //判断手机号码输入是否正确
    isMPNumber = (Tel) => {
        var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        if (myreg.test(Tel)) {
            return true;
        } else {
            return false;
        }
    }

    //点击搜索的时候，将当前的数据清空，同时将Loading改为true
//点击搜索的时候
  async  _search(){


        //每次点击搜索的时候，将之前保存的数据清空
      var contactArray=[]
      var customArray=[]
      var colleageArray=[]
      var groupArray=[]
      var guwenArray=[]


      //如果这里将数组也在这里穿插进去是怎样
      this.store.KKContactMap={isOpen:false,KKContact:[]}
      this.store.KKCustomMap={isOpen:false,KKCustom:[]}
      this.store.KKColleagueMap={isOpen:false,KKColleague:[]}
      this.store.KKGroupMap={isOpen:false,KKGroup:[]}
      this.store.KKGuwenMap={isOpen:false,KKGuwen:[]}

        this.store.Users = [];

        var value = this.refs._nav.state.value;
        var type = this.store.type;
        this.store.keyWord = value;



        if(value==undefined ||  value.length<=0){

            Alert.alert('请'+this.store.title);
            return;
        }else {


            this.store.isLoading = true;


            //在这里来判断关键字
            //是否为手机号码
            isPhoneNumber = this.isMPNumber(value)
            isIMNr = !isNaN(value);


            //还要分我的客户，我的同事，我的好友，
            //1.我的好友 2.我的客户  3.我的同事.4。我的群组
            if(type == 'Contact')
            {

                //1。我的好友
              //  var LocalContactsResponse = await Chat._GetContacts();
                var LocalContactsResponse = Chat.obj.Contacts;

                //遍历联系人(这个模块会出现闪退。由于Name的问题)
                for(var i=0;i<LocalContactsResponse.Users.length;i++)
                {
                    var User = LocalContactsResponse.Users[i].User;

                    if(User.IMNr && User.IMNr.indexOf(this.store.keyWord)>-1 || User.Name && User.Name.indexOf(this.store.keyWord)>-1 || User.Phone && User.Phone.indexOf(this.store.keyWord)>-1 || User.UserCode && User.UserCode.indexOf(this.store.keyWord)>-1)
                    {

                        contactArray.push(LocalContactsResponse.Users[i]);
                    }
                }
                this.store.KKContactMap.KKContact = contactArray
                //4.遍历本地的群。再与输入的关键词作对比
                for(var i=0;i<LocalContactsResponse.Groups.length;i++)
                {
                    var Group = LocalContactsResponse.Groups[i];

                    //#TODO  未来需要匹配群成员的名字。如果匹配不到群名字的话，接下要遍历群里面的每一个
                    if(Group.Name && Group.Name.indexOf(this.store.keyWord)>-1)
                    {
                        //#TODO  未来需要匹配群成员的名字 来处理
                        Group.Content = "";//这里不用显示description。因为是匹配到群名字的
                        groupArray.push(Group);

                    }else {

                        if(Group.Members && Group.Members.length>0){

                            //遍历群成员，如果群成员的名字里面含有这个关键字的话，就ok
                            for(z=0;z<Group.Members.length;z++){

                                //找到了
                                if(Group.Members[z].Name && Group.Members[z].Name.indexOf(this.store.keyWord)>-1){

                                    Group.Content = "包含:"+Group.Members[z].Name;//这里需要显示description。因为是匹配到群成员名字的
                                    groupArray.push(Group);
                                }
                                break;
                            }

                        }

                    }





                }
                // console.log("现在搜索得到的群")
                // console.dir(groupArray)
                this.store.KKGroupMap.KKGroup = groupArray


                //这是营业员账号登录，处理同事和客户
                if(Chat.loginUserResult.OrganizaType=="INCU"){


                    //2。我的客户（这里客户很多。在另一个页面是否需要特别判断）
                    // 1。如果输入的是手机号码，或者IM号码，则进行精准搜索，也就是去调接口查找
                     //2。如果输入的是其他情况，则去我的好友通讯录里面进行查找。但是最终两者的格式需要统一（以现在这种全局搜索的为准）
                    if(isPhoneNumber || isIMNr){
                        var LocalCustomResponse = await IM.getSearchUsers({
                            Keywords:this.store.keyWord,
                            Owner:Chat.getLoginInfo().User.IMNr,
                            PageSize:1000,
                            RoleType:"US0",//这里已经很明确要获取的是我的客户了。但是可能为其他方式
                        });


                        key = this.store.keyWord;
                      //#TODO 需要重点处理。这里分两种情况。按照需求，这里仅仅匹配精确匹配手机号码或者IM号码
                        //在这里是对黄璡接口的数据再进行多一步处理
                        customArray =  LocalCustomResponse.SearchedUsers.filter((SearchedUser)=>{

                            return SearchedUser.User.IMNr !==Chat.getLoginInfo().User.IMNr && SearchedUser.User.IMNr==key ||SearchedUser.User.Phone==key;
                        })

                        this.store.KKCustomMap.KKCustom = customArray

                    }else {

                        //在#TODO 关于客户 CRM.ClientManByUserCode  读取为我服务过的常用订票人(客户)请使用xdoc的新ServiceCustomerByUserCode。以及最近联系人去里面找

                        //如果内存里面有值
                        if(Chat.obj.Custom.ServiceStaffs && Chat.obj.Custom.ServiceStaffs.length>0){

                        }else {

                            let param = {
                                "UserCode": Chat.loginUserResult.AccountNo,
                                "PageSize": 100,//#TODO 服务销售过的 现在每次是搜索找100条记录，应该不太懂
                            }
                            let result = await RestAPI.execute("CRM.ClientManByUserCode", param);
                            if(result && result.Result && result.Result.ServiceStaffs && result.Result.ServiceStaffs.length>0){
                                    Chat.obj.Custom.ServiceStaffs =  result.Result.ServiceStaffs;
                            }
                        }



                        //接着要开始遍历客户了
                        if(Chat.obj.Custom.ServiceStaffs && Chat.obj.Custom.ServiceStaffs.length>0){

                            for(k=0;k<Chat.obj.Custom.ServiceStaffs.length;k++){

                                var Staff = Chat.obj.Custom.ServiceStaffs[k];
                                //#TODO 最近销售过的，仅仅匹配姓名
                                if(Staff.Name && Staff.Name.indexOf(this.store.keyWord)>-1)
                                {
                                    Staff.Description = "服务销售过的";
                                    var result={
                                        OnlinePlatforms:[],
                                        IsContact:Chat.obj.Contacts.Users.findIndex(function (value,index,arr) {
                                            return value.User.UserCode == Staff.UserCode
                                        }), //这个IsContact 需要从通讯录里面去匹配。如果UserCode一样，则可以证明确实存在这个好友。
                                        User:Staff
                                    }
                                    customArray.push(result);
                                }

                            }


                        }


                        this.store.KKCustomMap.KKCustom = customArray
                    }

                    //3。我的同事
                    var LocalColleagueResponse =  Chat.obj.IMNrBySubType;
                    if(LocalColleagueResponse == null){
                        //进行请求
                        LocalColleagueResponse =await IM.getUserIMNrBySubTypeCode();
                        Chat.obj.IMNrBySubType = LocalColleagueResponse
                    }

                    var UserLists = LocalColleagueResponse.IMUserLists;//所有的内部同事

                    //遍历同事
                    for(var i=0;i<UserLists.length;i++)
                    {
                        var User = UserLists[i];


                        //仅仅对名字遍历
                        //这里是对所有的字段进行遍历.有时候还需要对UserCode进行遍历等

                        if(User.AliasName && User.AliasName.indexOf(this.store.keyWord)>-1 || User.IMNr && User.IMNr.indexOf(this.store.keyWord)>-1 ){
                                colleageArray.push(User);
                            }



                    }
                    
                    this.store.KKColleagueMap.KKColleague = colleageArray

                }


                //这是非员工账号登录的，加载他的顾问（这里要和查找散客一样类似。可以通过调用接口的方式）
                else{


                    if(isPhoneNumber || isIMNr){
                        var LocalCustomResponse = await IM.getSearchUsers({
                            Keywords:this.store.keyWord,
                            Owner:Chat.getLoginInfo().User.IMNr,
                            PageSize:1000,
                            RoleType:"INCU",//这里已经很明确要获取的是我的客户了。但是可能为其他方式
                        });

                        key = this.store.keyWord;
                        //#TODO 这里是营业员查找顾问（是否也）
                        guwenArray =  LocalCustomResponse.SearchedUsers.filter((SearchedUser)=>{
                            return SearchedUser.User.IMNr !==Chat.getLoginInfo().User.IMNr && SearchedUser.User.IMNr==key ||SearchedUser.User.Phone==key;
                        })

                        this.store.KKGuwenMap.KKGuwen = guwenArray;
                    }





                }



                this.store.isLoading=false;
                this.store.isEmpty=this._isEmptyByDataSource();
            }

            //搜索用户
            else if(type == 'Search_User')
            {
                this._searchUserByLink();
            }

            else if(type == 'INCU'){

                this._searchOrganization();

            }else if(type =='PictureTemplate'){

                console.log("PictureTemplate PictureTemplate PictureTemplate")

                this._searchPictureTemplate();
            }

            //搜索群聊
            else{

            }


        }


    }


    //判断是否   //如果群组，好友，同事等5个都为空的时候，isEmpty=true
    _isEmptyByDataSource=() =>{

      return this.store.KKContactMap.KKContact.length<=0 && this.store.KKCustomMap.KKCustom.length<=0 && this.store.KKColleagueMap.KKColleague.length<=0 && this.store.KKGroupMap.KKGroup.length<=0 && this.store.KKGuwenMap.KKGuwen.length<=0

    }


    //搜索图片素材
    _searchPictureTemplate = async()=>{

        //暂时调用我去过的搜索游记接口
        var param ={
            StartDate:'2016-11-19T00:00:00',
            EndDate:'2030-01-10T00:00:00',
            FileTypeID:1,
            PageSize:1000,
            DistrictName:this.store.keyWord,
            Condition:this.store.keyWord
        };

        var result = await  ServingClient.execute('Channel.MaterialLibraryByCondition',param);

        if(result && result.MaterialLibraryList && result.MaterialLibraryList.length>0){


            this.store.isLoading = false;
            this.store.Users = result.MaterialLibraryList;
        }

        else {

            this.store.isLoading = false;
            this.store.isEmpty = true;
        }



    }

    //搜索内部同事
    async _searchOrganization(){

        var result =Chat.obj.IMNrBySubType;

        if(result==null){
            result =await IM.getUserIMNrBySubTypeCode();
            Chat.obj.IMNrBySubType = result
        }

        // console.log("内部同事result")
        // console.dir(result)


        var UserLists = result.IMUserLists;//所有的内部同事

        var Users=[];


        //遍历联系人
        for(var i=0;i<UserLists.length;i++)
        {
            var User = UserLists[i];

            //这里仅仅是匹配名字。其实还可以判断IM号码，还有各种其他的属性等等
                if(User.AliasName && User.AliasName.indexOf(this.store.keyWord)>-1 || User.IMNr && User.IMNr.indexOf(this.store.keyWord)>-1 ){
                    Users.push(User);
                }


        }

        if(UserLists && Users && Users.length>0){

            this.store.isLoading = false;
            this.store.Users = Users;

        }

        else {

            this.store.isLoading = false;
            this.store.isEmpty = true;


        }



    }

    //本地搜索好友
    async  _searchUserByLocal(){

        //var response = await Chat._GetContacts();
        var response = await Chat.obj.Contacts;

        var Users=[];//联系人
        var Groups =[];//群组

        //遍历联系人
        for(var i=0;i<response.Users.length;i++)
        {
            var User = response.Users[i].User;

            if(User.Name &&  User.Name.indexOf(this.store.keyWord)>-1)
            {
                Users.push(response.Users[i]);
            }
        }

        if(Users.length == 0){
            this.store.isLoading = false;
            this.store.isEmpty = true;
        }else {

            this.store.isLoading = false;
            this.store.Users = Users;
            this.store.isEmpty = false;
        }

        return Users

    }

    //远程搜索好友
    async  _searchUserByLink(RoleType){

        //点击搜索用户的时候将之前的数据清空
        this.store.Users =[];

        var Owner =Chat.getLoginInfo().User.IMNr;

        var  Param = {

                Keywords:this.store.keyWord,
                Owner:Owner,
                PageSize:1000,

            }

        var response = await IM.getSearchUsers(Param);

        var CurrentSearchUser=[]
        if(response.TotalResults == 0){

            this.store.isLoading = false;
            this.store.isEmpty = true;
        }else {

            var SearchedUsers = response.SearchedUsers;
            CurrentSearchUsers =  SearchedUsers.filter((SearchedUser)=>{
                return SearchedUser.User.IMNr !==Param.Owner;
            })
            this.store.isLoading = false;
            this.store.Users = CurrentSearchUsers;
            this.store.isEmpty = false;

        }




    }


    _ToChatUserInfo(data){

        if(this.store.type == 'INCU'){

            this.props.navigator.push({

                component:ChatUserInfo,
                passProps:{
                    Peer:data.IMNr,

                }
            })

        }

        //来到这里
        else if(this.store.type == 'Contact'){


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
                    Peer:data.User.IMNr,
                    User:data.User,
                    isContact:data.IsContact
                }
            })

        }
    }

    _ToFriendApplication(data){

        // console.warn('点击跳到好友申请页面,传递ID过去');
        //跳到好友验证页面。回调回来的时候需要将状态处理回来


        if(data.IsContact == false){

            this.props.navigator.push({

                component:FriendApplication,
                passProps:{
                    User:data.User
                }
            })
        }

    }



    _renderLine(){

        return(
            <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>
        )
    }



    _renderRow=(data)=>{

        var iconW = Chat.ContactComponent.iconW;
        var margin = Chat.ContactComponent.margin;
        const type = this.store.type;
        var _this =this;

        //搜索用户
        if(type == 'Search_User')
        {

            var ContentW = Chat.window.width - iconW -margin-100;

            var statuTitle = data.IsContact == false ? '添加': '已添加';
            var statuBorderColor = data.IsContact == false ? 'rgb(244,72,72)' : 'rgb(220,220,220)';
            var statuColor =data.IsContact == false ? 'rgb(244,72,72)' : 'rgb(153,153,153)';

            return(


                <TouchableOpacity onPress={()=>{
                    this._ToChatUserInfo(data);
                }}>
                    <View>
                        <View style={{justifyContent:'space-between',flexDirection:'row',alignItems:'center',backgroundColor:'white'}}>

                            <Image style={{ margin:Chat.ContactComponent.margin,resizeMode:'cover',width:Chat.ContactComponent.iconW,height:Chat.ContactComponent.iconW,borderRadius:Chat.ContactComponent.iconW/2}}
                                   source={{uri:Chat.getFaceUrlPath(data.User.FaceUrlPath)}}>

                            </Image>

                            <View style={{backgroundColor:'white',width:ContentW,}}>

                                <Text style={{color:Colors.colors.Chat_Color51,fontSize:15}}>{data.User.Name}</Text>

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

        //搜索本地
        else if(type == 'Contact'){

            var ContentW = Chat.window.width - iconW -margin-100;

            return(

                <TouchableOpacity onPress={()=>{
                    this._ToChatUserInfo(data);

                }}>

                    <View>

                        <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'white'}}>

                            <Image style={{ margin:Chat.ContactComponent.margin,resizeMode:'cover',width:Chat.ContactComponent.iconW,height:Chat.ContactComponent.iconW,borderRadius:Chat.ContactComponent.iconW/2}}
                                   source={{uri:Chat.getFaceUrlPath(data.User.FaceUrlPath)}}>

                            </Image>


                            <View style={{backgroundColor:'white',width:ContentW,margin:10,marginLeft:0, justifyContent:'space-between'}}>

                                <Text style={{color:Colors.colors.Chat_Color51,fontSize:15}}>{data.User.Name}</Text>


                            </View>




                        </View>

                        {this._renderLine()}

                    </View>
                </TouchableOpacity>
            );

        }
        //内部同事
        else if(type == 'INCU'){

            var ContentW = Chat.window.width - iconW -margin-100;

            return(
                <TouchableOpacity onPress={()=>{
                    this._ToChatUserInfo(data);

                }}>

                    <View>

                        <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'white'}}>

                            <Image style={{ margin:Chat.ContactComponent.margin,resizeMode:'cover',width:Chat.ContactComponent.iconW,height:Chat.ContactComponent.iconW,borderRadius:Chat.ContactComponent.iconW/2}}
                                   source={{uri:Chat.getFaceUrlPath(data.IconFile)}}>

                            </Image>


                            <View style={{backgroundColor:'white',width:ContentW,margin:10,marginLeft:0, justifyContent:'space-between'}}>

                                <Text style={{color:Colors.colors.Chat_Color51,fontSize:15}}>{data.AliasName}</Text>

                                <Text style={{color:Colors.colors.Chat_Color102,fontSize:13,marginTop:5}}>{data.DepartmentName+'>'+data.TeamName}</Text>

                            </View>

                        </View>

                        {this._renderLine()}

                    </View>
                </TouchableOpacity>


            );




        }

        //图片素材
        else if(type == 'PictureTemplate'){

            const item = data;
            var margin = 10;
            var ImageW =  (window.width - 40) / 2;
            var ImageH =  ImageW *(276/169);
            var w = parseInt(ImageW);
            var h = parseInt(ImageH);
            var scale = '!/fwfh/'+w+'x'+h;
            var  uri = Chat.getPosterImagePath(item.FilePath)+scale;

            return (
                <TouchableOpacity
                    onPress={()=>{

                        if(this.props.getSearchTemplate){

                            this.props.getSearchTemplate(data);
                        }

                        this.props.navigator.pop();



                    }}
                    style={{margin:5,height: ImageH}}>

                    <Image style={{margin:5, width: ImageW, height: ImageH, borderRadius: 5}} source={{uri:uri}}>

                    </Image>


                </TouchableOpacity>
            )

        }

        //图片素材备份
        else if(type =='PictureTemplateBeiFen'){


            var w = (window.width-20)/2;
            var h =300;
            var scale = '!/fwfh/'+w+'x'+h;
            var  uri = Chat.getPosterImagePath(data.FilePath)+scale;


            return(

                <TouchableOpacity
                    onPress={()=>{

                        if(this.props.getSearchTemplate){

                            this.props.getSearchTemplate(data);

                        }

                        this.props.navigator.pop();

                    }}
                    style={styles.itemStyle}>

                    <Image style={styles.itemImageStyle} source={{uri:uri}}>

                    </Image>

                </TouchableOpacity>
            )



        }

    }

    _renderHeader=()=>{


    }




    //这里需要更新
    _renderNav(){

        return(
            <NavBar ref="_nav" type={"search"} placeholder={this.store.title}  onpressLeft={()=>{this.props.navigator.pop()}}
                    onpressRight={this._search.bind(this)}/>

        )


    }
    _renderContent(){

        var contentViewStyle={
            flexDirection:'row',
            flexWrap:'wrap'
        }

        if(this.store.isLoading){

            return(
                <YQFEmptyView title={'正在搜索 '+this.store.keyWord+'   请稍候'} icon={'0xe653'} />
            )
        }
        else  if(this.store.isEmpty){

            return(
                <YQFEmptyView title={'搜索不到对应的数据，请修改搜索关键词'} icon={'0xe15c'} />
            )
        }

        else if (this.store.type == "Contact")   {

            if(this.store.isEmpty){
                return(
                    <YQFEmptyView title={'未找到相关记录'} icon={'0xe15c'} />
                )
            }else {
                //这里需要根据this.store.contact里面各个内容来渲染
                return this._renderMyContact()
            }

        }

        return(


            <ListView
                dataSource={this.store.getDataSource}
                contentContainerStyle={ this.store.type == 'PictureTemplate' &&  contentViewStyle}
                renderHeader={this._renderHeader}
                renderRow={this._renderRow}>

            </ListView>

        )

    }



    //传入type 进行数据的刷新
    _ChangeStatusByIsOpen = (type)=>{

        if(type=="Contact"){
            this.store.KKContactMap.isOpen = !this.store.KKContactMap.isOpen

        }else  if(type =="Custom"){
            this.store.KKCustomMap.isOpen = !this.store.KKCustomMap.isOpen

        }else if(type=="Colleague"){
            this.store.KKColleagueMap.isOpen = !this.store.KKColleagueMap.isOpen

        }else if(type=="Group"){
            this.store.KKGroupMap.isOpen = !this.store.KKGroupMap.isOpen

        }else if(type=="Guwen"){
            this.store.KKGuwenMap.isOpen = !this.store.KKGuwenMap.isOpen

        }else {

        }


    }


    _getResultByType = (type)=>{

        var title=""
        var dataSource=null
        switch (type){
            case "Contact":
                title="好友";
                dataSource = this.store.getContactDataSource

                break;
            case "Custom":
                title="客户";
                dataSource = this.store.getCustomDataSource

                break;

            case "Colleague":
                title="同事";
                dataSource = this.store.getColleagueDataSource

                break;

            case "Group":
                title="群组";
                dataSource = this.store.getGroupDataSource

                break;

            case "Guwen":
                title="顾问";
                dataSource = this.store.getGuwenDataSource

                break;
            default:
                title="bug";
                break;
        }
       var result={
            topTitle:title,
            dataSource:dataSource
        }
        return result;

    }


    //Categary 代表传入的类型数组。   type  代表类型文字
    renderCategary =  (Categary,type)=> {

        var MaxItemCount = 5;

        //获取标题
        var title=""


        //如果传进来的数据大于0的话，则将数据显示
        //如果本身数据就为空，则不显示
        if(Categary.length>0){
            //在这里决定数组要显示多少

         //   var dataSource=type=="Contact"?this.store.getContactDataSource : "Custom" ? this.store.getCustomDataSource : "Colleague"?this.store.getColleagueDataSource : "Guwen"?this.store.getGuwenDataSource: "Group"? this.store.getGroupDataSource : null;
            var dataSource=null;

            switch (type){
                case "Contact":
                    dataSource = this.store.getContactDataSource
                    break;

                case "Custom":
                    dataSource = this.store.getCustomDataSource
                    break;

                case "Colleague":
                    dataSource = this.store.getColleagueDataSource

                    break;
                case "Guwen":
                    dataSource = this.store.getGuwenDataSource

                    break;

                case "Group":
                    dataSource = this.store.getGroupDataSource
                    break;

                default:
                    dataSource=null
            }



            return(

                <View>

                                <ListView
                                    dataSource={dataSource}
                                    renderHeader={()=>{
                                        var icon='';
                                        var backgroundColor='white'; //这里暂时将颜色给
                                        var title='';
                                        var rightIcon=""
                                        //这里给出的几张类型还是不对的
                                        if(type == "Colleague"){
                                            icon = '0xe17a';
                                            title = "同事";
                                            rightIcon = this.store.KKColleagueMap.isOpen ==true ? '0xe184' :'0xe179'
                                        }
                                        else if(type == "Custom"){

                                            //#TODO 这里的图标需要修改，如果数据多的话。如果是展开的话，则显示关闭模式；如果是收缩的话，则显示展示样式

                                            icon = '0xe10c';
                                            title = "客户";
                                            rightIcon = this.store.KKCustomMap.isOpen ==true ? '0xe184' :'0xe179'


                                        }
                                        else if(type == "Contact"){

                                            icon = '0xe17a';
                                            title = "好友";
                                            rightIcon = this.store.KKContactMap.isOpen ==true ? '0xe184' :'0xe179'


                                        }
                                        else if(type == 'Group'){
                                            icon = '0xe17b';
                                            title = "群组";
                                            rightIcon = this.store.KKGroupMap.isOpen ==true ? '0xe184' :'0xe179'

                                        } else if(type == 'Guwen'){
                                            icon = '0xe17b';
                                            title = "顾问";
                                            rightIcon = this.store.KKGuwenMap.isOpen ==true ? '0xe184' :'0xe179'

                                        }


                                        //后期这里还要加上顾问模块的处理
                                        else {
                                            icon = '0xe17b';
                                            title = "bug";
                                        }
                                        return(

                                            <View>

                                                <TouchableOpacity
                                                    onPress={()=>{
                                                        //这里接受了点击事件。决定了是否显示
                                                        this._ChangeStatusByIsOpen(type)
                                                    }}
                                                    style={[{alignItems:'center',backgroundColor:backgroundColor,flexDirection:"row"}]}>
                                                    <View style={[{flex:1,backgroundColor:'white',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}]}>
                                                        <Text style={{margin:10, color:'rgb(153,153,153)',fontSize:15}}>
                                                            {"我的"+title}
                                                        </Text>

                                                        <Icon size={18} color={'rgb(204,204,204)'} icon={rightIcon} style={{marginRight:10,marginLeft:5}}/>

                                                    </View>
                                                </TouchableOpacity>
                                                <View style={{backgroundColor:'rgb(200,200,200)',height:0.5,marginLeft:10}}></View>

                                            </View>


                                        );

                                    }}
                                    renderFooter={()=>{
                                        //#TODO 周瑶 找其确认颜色
                                        var color = 'rgb(244,72,72)'; // 点击查看更多的颜色
                                     //   var color = 'green'; // 点击查看更多的颜色

                                        var padding = 10;

                                        //根据type以及this.store.。。。来决定是否显示
                                        var isShow =false
                                        switch (type){
                                            case "Contact":
                                                isShow =this.store.KKContactMap.isOpen;

                                            case "Custom":
                                                isShow =this.store.KKCustomMap.isOpen;

                                            case "Colleague":
                                                isShow =this.store.KKColleagueMap.isOpen;

                                            case "Group":
                                                isShow =this.store.KKGroupMap.isOpen;

                                            case "Guwen":
                                                isShow =this.store.KKGuwenMap.isOpen;

                                            default:
                                                isShow = false
                                        }

                                        if(isShow==false){
                                            return(

                                                <TouchableOpacity

                                                    style={{backgroundColor:'rgb(255,255,255)', justifyContent:"center",alignItems:"center",flexDirection:'row'}}>

                                                    <View style={{flexDirection:'row',margin:15,alignItems:'center',justifyContent:"center",borderColor:color,borderWidth:1,borderRadius:10,overflow: 'hidden'}}>

                                                        <Text
                                                            onPress={()=>{
                                                                this._ChangeStatusByIsOpen(type)
                                                            }}
                                                            style={{padding:padding,paddingLeft:padding*2,paddingRight:padding*2,  color:color,fontSize:14}}>{"更多"+this._getResultByType(type).topTitle+"结果"}</Text>

                                                    </View>


                                                </TouchableOpacity>
                                            )

                                        }
                                        return null





                                    }}
                                    renderRow={(item)=>{

                                        //在这里判断数据
                                        var name;
                                        var uri;
                                        var Peer;
                                        var User;
                                        var isContact=false;

                                        switch (type){

                                            case "Contact"  :
                                                name = item.User.Name;
                                                uri=Chat.getFaceUrlPath(item.User.FaceUrlPath);
                                                Peer= item.User.IMNr;
                                                User = item.User;
                                                isContact = true;
                                                break;


                                            case "Guwen"  :

                                                name = item.User.Name;
                                                uri=Chat.getFaceUrlPath(item.User.FaceUrlPath);
                                                Peer= item.User.IMNr;
                                                User = item.User;
                                                isContact = item.IsContact;//这里也是需要判断的

                                                break;



                                            case "Custom":

                                                name = item.User.Name;
                                                uri=Chat.getFaceUrlPath(null);
                                                Peer= null; // #TODO 服务销售过的，这里是没有IM号码的。需要主动去调用一个方法
                                                User = item.User;
                                                isContact = item.IsContact;


                                                break;

                                            case "Colleague":

                                                name = item.AliasName;
                                                uri=Chat.getFaceUrlPath(item.IconFile);
                                                Peer= item.IMNr;
                                                User=null;

                                                temp =  Chat.obj.Contacts.Users.findIndex(function (value,index,arr) {
                                                      return value.User.IMNr == item.IMNr
                                                })
                                                if(temp==-1){
                                                    isContact = false
                                                }else {
                                                    isContact = true

                                                }

                                                break;

                                            case "Group":

                                                name = Chat._getGroupName(item)+" ("+ item.MemberCount +")";
                                                uri:Chat.getFaceUrlPath(null);
                                                break;

                                            default:
                                                name = "bug";
                                                uri = "bug"
                                                break;

                                        }

                                        var iconW = 40;
                                        var ContentW = Chat.window.width - iconW -margin-100;


                                        return(


                                            <TouchableOpacity onPress={()=>{


                                                //如果是群的话，则直接到群聊
                                                if(type=="Group"){
                                                    Chat.createConversation(this.props.navigator,item.IMNr,Chat._getGroupName(item),"Group");

                                                }else if(type=="Custom"){

                                                  this._CustomToChatUserInfo(item,isContact)

                                                }

                                                else{

                                                    //#TODO  这里进去要判断是不是我的客户
                                                    //在这里根据传入的类型。以及对应的类型去跳转。
                                                    //1.如果是客户类型的话，如果不是好友的话，还要创建一个peer。其他的则都可以直接跳过把

                                                    this.props.navigator.push({
                                                        component:ChatUserInfo,
                                                        passProps:{

                                                            Peer:Peer,
                                                            User:User,
                                                            isContact:isContact
                                                        }
                                                    })



                                                }



                                            }}>

                                            <View>
                                                <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'white'}}>

                                                    {type=="Group"?

                                                        <View style={{margin:10}}>
                                                            <AvatarGroup   faceUrlPathsArray={Chat._IMGetGroupFaceUrlPath(item).FaceUrlPaths } />
                                                        </View>
                                                        :
                                                        <Image style={{ margin:Chat.ContactComponent.margin,resizeMode:'cover',width:iconW,height:iconW,borderRadius:3}}
                                                               source={{uri:uri}}>
                                                        </Image>

                                                    }

                                                    <View style={{backgroundColor:'white',width:ContentW,margin:10,marginLeft:0, justifyContent:'space-between'}}>

                                                        <Text numberOfLines={1} style={{color:Colors.colors.Chat_Color51,fontSize:15}}>{name}</Text>

                                                        {
                                                            //组织架构
                                                            type =="Colleague"?

                                                                <Text style={{color:Colors.colors.Chat_Color102,fontSize:13,marginTop:5}}>{item.DepartmentName+'>'+item.TeamName}</Text>
                                                                :
                                                                type =="Custom"?

                                                                    <Text style={{color:Colors.colors.Chat_Color102,fontSize:13,marginTop:5}}>{item.User.Description}</Text>
                                                                    :
                                                                    type =="Group" && item.Content && item.Content.length>0?

                                                                    <Text style={{color:Colors.colors.Chat_Color102,fontSize:13,marginTop:5}}>{item.Content}</Text>
                                                                    :
                                                                    null

                                                        }

                                                    </View>

                                                </View>


                                            </View>

                                            </TouchableOpacity>
                                        )

                                    }}>
                                </ListView>

                    <View style={{backgroundColor:'rgb(240,240,240)',height:5}}></View>

                </View>

            )
        }else {

            return null

        }


    }


    //特别处理客户点击跳转到指定的用户界面过去
    _CustomToChatUserInfo=async(data,isContact)=>{

        // console.log("是否要跳转到新页面。在这里判断是否要跳转")
        // console.dir(data)
        //客户其实有两个来源/甚至三个数据来源

        var Peer;
        var User;

        //首先判断是否有IM号码
        if(!data.User.IMNr){

            //调用接口，获取用户的详细资料  IM.CreateUser
            var  createUserParam ={

                UserCode:data.User.UserCode,
                StaffCode:data.User.PersonCode,
                Name:data.User.Name,
                RoleType:data.User.CustomerTypeCode,
                Gender:data.User.Sex
            };

            var result = await ServingClient.execute('IM.CreateUser',createUserParam);

            // console.log("创建一个新的IM号")
            // console.dir(result)

            Peer = result.User.IMNr;
            User = result.User;

        }else {
            //有IM号码
            Peer = data.User.IMNr;
            User =data.User;

        }

            this.props.navigator.push({

                component:ChatUserInfo,
                passProps:{
                    Peer:Peer,
                    User:User,
                    isContact:isContact
                }
            })


    }


    _renderMyContact = ()=>{


        return(

            <ScrollView>

                { this.renderCategary(this.store.KKContactMap.KKContact,"Contact")}
                { this.renderCategary(this.store.KKCustomMap.KKCustom,"Custom")}
                { this.renderCategary(this.store.KKGuwenMap.KKGuwen,"Guwen")}
                { this.renderCategary(this.store.KKColleagueMap.KKColleague,"Colleague")}
                { this.renderCategary(this.store.KKGroupMap.KKGroup,"Group")}

            </ScrollView>


        )







    }



    render(){


        return(

            <View style={{flex:1,backgroundColor:Colors.colors.Chat_Color235}}>

                {this._renderNav()}
                {this._renderContent()}


            </View>

        )
    }

}

const styles = StyleSheet.create({

    itemStyle: {
        // 对齐方式
        alignItems:'center',
        justifyContent:'center',
        // 尺寸
        width:(window.width-20)/2,
        height:300,
        // 左边距
        margin:5,

    },

    itemImageStyle: {
        // 尺寸
        width:(window.width-20)/2,
        height:300,
        // 间距
        // marginBottom:5
    }


})