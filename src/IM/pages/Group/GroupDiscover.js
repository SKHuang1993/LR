


import { observer } from 'mobx-react/native';
import {observable, autorun,computed,action} from 'mobx'
import React, { Component } from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'

import {IM} from '../../utils/data-access/im';
import {Chat} from '../../utils/chat';

import CommonUserItem from '../../components/CommonUserItem';

import GroupApplication from './GroupApplication';
import ChatDetail from '../Chat/ChatDetail'
import Colors from '../../Themes/Colors'

import {

    StyleSheet,
    View,
    Image,
    Text,
    ListView,
    TouchableOpacity,
    ScrollView,
    Dimensions


} from 'react-native';

import {TabBar,TabViewAnimated} from 'react-native-tab-view';
import YQFNavHeaderView from '../../components/navHeaderView';
import NavBar from '../../components/yqfNavBar';

import GroupCreate from './GroupCreate';//创建群
import GroupSearch from './GroupSearch';//搜索群


import groupDiscover from '../../stores/Group/GroupDiscover';

const window = {

    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
}

@observer
export default class GroupDiscover extends Component{

    constructor(props)
    {
        super(props);

        this.store= new groupDiscover();



        this.state={

            selectTab:0,
            activeView:{borderBottomWidth:1, borderColor:'rgb(244,72,72)'},
            activeText:{color:'rgb(244,72,72)'},
            noActiveView:{borderBottomWidth:2, borderColor:'rgb(153,153,153)'},
            noActiveText:{color:'rgb(51,51,51)'},
            index:0,
            routes:[
                {key:'1',title:'热门'},
                {key:'2',title:'最新'},
            ]

        }
    }

    _handleChangeTab = (index) => {
        this.setState({ index });
    };

    _renderHeader = (props) => {
        return <TabBar style={styles.tabViewHeadBG}
                       indicatorStyle={styles.tabViewHeadIndicator}
                       labelStyle={styles.tabViewHeadLabel}
            {...props}
        />;
    };

    _renderScene = ({ route }) => {
        switch (route.key) {
            case '1':
                return <GroupSearch_Hot {...this.props}/>;
            case '2':
                return  <GroupSearch_New store ={this.store} {...this.props}/>;
            default:
                return null;
        }
    };

    _renderNav(){


        return(
            <NavBar type={'DiscoverGroup'}
                              title={'发现群'}
                              leftIcon={'0xe183'}
                              rightIcon1={'0xe171'}
                              rightIcon2={'0xe180'}
                              onpressLeft={()=>{this.props.navigator.pop()}}
                              onpressRight1={()=>{

                                  //跳到搜索群
                                     this.props.navigator.push({
                        component:GroupSearch,
                        name:'搜索',

                    })
                              }}
                              onpressRight2={()=>{

                                  //创建群
                                   this.props.navigator.push({
                        component:GroupCreate,
                        name:'创建群聊',


                    })


                              }}




            />
        )
    }

    _renderTabView(){

        return(
            <TabViewAnimated
                style={{flex:1}}
                navigationState={this.state}
                renderScene={this._renderScene}
                renderHeader={this._renderHeader}
                onRequestChangeTab={this._handleChangeTab}
            />
        )
    }


    render(){

        return(

            <View style={{flex:1}}>

                {this._renderNav()}
                {this.renderTitleView()}
                {this.renderContent()}


            </View>

        )

    }

    renderContent = ()=>{

        if(this.store.selectIndex==0){

         return (
             <GroupSearch_Hot {...this.props}/>
         )

        }else if(this.store.selectIndex==1){

            return (
                <GroupSearch_New store ={this.store} {...this.props}/>
                )


        }else {
            return null
        }

    }

    renderTitleView = ()=>{

        var contentViewStyle={
            flexDirection:'row',
        }

        var height =  window.width * (43 / 375);


        return(

            <View style={{height:height,backgroundColor:'white'}}>

                <ListView
                    ref={(titleListview)=>{this.titleListview = titleListview}}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    renderRow={this._renderTitleItem}
                    dataSource={this.store.getTitleDataSource}
                    removeClippedSubviews={false}
                    initialListSize={10}

                    contentContainerStyle={contentViewStyle}>

                </ListView>

            </View>
        )
    }


    _renderTitleItem = (data,sectionId,rowId)=>{

        var titleColorStyle;
        if(data.select == true){
            titleColorStyle ={
                color:Colors.colors.LR_Color,
                fontSize:16
            }
        }else {
            titleColorStyle ={
                color:Colors.colors.Chat_Color51,
                fontSize:15
            }
        }

        return(



            <TouchableOpacity style={{width:window.width/2,alignItems:'center',justifyContent:'center'}} onPress={()=>{this._ClickTitleItem(data,rowId)}}>
                <Text style={[{margin:10,},titleColorStyle]}>{data.name}</Text>
                {
                    data.select == true?

                        <View style={{backgroundColor:Colors.colors.LR_Color,height:2,position:'absolute',bottom:0,left:0,right:0}}></View>

                        :
                        null

                }

            </TouchableOpacity>

        )

    }


    _ClickTitleItem = (data,rowId)=>{


        var temp = this.store.titleArray;

        for(var i=0;i<temp.length;i++){
            temp[i].select = false;
        }
        temp[rowId].select=true;
        this.store.selectIndex  =rowId;

        this.store.titleArray=temp.slice();
        this.store.Users=[].slice();
    }




}

// //热门
class GroupSearch_Hot extends Component
{
    constructor(props)
    {
        super(props);

        this.state={

            dataSource:new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2}),
            LivelyGroups:[],
            RecommandGroups:[],
        }

    }

    componentDidMount() {

        //为用户推荐群
        this._fetchDataRecommandGroups();

        //获取活跃的群组列表（活跃群组里面有可能会出现我在群里面的数据，需要遍历群成员，如果我在群里面，将加入群按钮修改为不可点）
        this._fetchDataLivelyGroups();

    }


    _renderHeader1()
    {
        return(

            <GroupHeader icon={'0xe12e'} title={'推荐群'}/>

        )
    }

    _renderHeader2()
    {
        return(

            <GroupHeader icon={'0xe168'} title={'活跃群'}/>
        )
    }




    _renderFooter()
    {
        return(

            <GroupFooter/>

        )
    }


    async  _fetchDataRecommandGroups()
    {

        var IMNrResponse =  Chat.getLoginInfo();
        var Param ={

            IMNr:IMNrResponse.User.IMNr,
            Qty:5,
            Sortord:'Random',
            MaxGroupMemberCount:100,
        }

        var Groups=[];

        var response =await IM.getRecommandGroups(Param);
        if(response && response.Groups){

            for(var i=0;i<response.Groups.length;i++){

                var group =await Chat._getMyGroupFromGroup(response.Groups[i]);
                Groups.push(group);
            }

            this.setState({
                RecommandGroups:Groups,

            });

        }


    }

    async  _fetchDataLivelyGroups()
    {

        var Param ={

            Qty:5,
            MaxGroupMemberCount:100,
        };

        var Groups=[];

        var response =await IM.getLivelyGroups(Param);

        if(response && response.Groups){

            for(var i=0;i<response.Groups.length;i++){

                var group = await Chat._getMyGroupFromGroup(response.Groups[i]);

                Groups.push(group);
            }


            // console.log('IM.GetLivelyGroups response经过处理后的群');
            // console.dir(Groups);


            this.setState({

                LivelyGroups:Groups,

            });

        }

    }


    _CheckJumpToApplicationOrGroupDetail = (data)=>{

        //点击的话，是去到群详情。
        //分两种情况。
        // 1.如果是群成员的话，通过群号码去找对应的conversation。接着跳转到ChatDetail里面去
        //2.如果不是群成员的话，则跳转到群申请界面去

        //如果是群成员，不让其操作
        if(data.isMembersOfTheGroup == true){

            Chat.createConversation(this.props.navigator,data.IMNr,data.Name,'Group');

        }
        //在这里处理处理群的申请
        else {
            this.props.navigator.push({

                component:GroupApplication,
                passProps:{

                    GroupIMNr:data.IMNr

                },
            })
        }

    }


    _renderRow(data)
    {



        return(

            <View>


                <CommonUserItem data={data}
                                type={'GroupItem'}
                                onPress={()=>{

                                  this._CheckJumpToApplicationOrGroupDetail(data)


                                }}

                                onPressRight={()=>{

this._CheckJumpToApplicationOrGroupDetail(data)



             }}/>

            </View>
        )

    }

    render()
    {

        return(


            <View style={{flex:1}}>


                <View style={{backgroundColor:'rgb(235,235,235)',height:10,}}></View>


                <ScrollView style={{backgroundColor:'rgb(235,235,235)',}}>


                    <ListView style={{flex:1}}
                              dataSource={this.state.dataSource.cloneWithRows(this.state.RecommandGroups)}
                              renderRow={this._renderRow.bind(this)}
                              renderHeader={this._renderHeader1.bind(this)} renderFooter={this._renderFooter.bind(this)}>
                    </ListView>


                    <ListView dataSource={this.state.dataSource.cloneWithRows(this.state.LivelyGroups)}
                              renderRow={this._renderRow.bind(this)}
                              renderHeader={this._renderHeader2.bind(this)}
                              renderFooter={this._renderFooter.bind(this)}>
                    </ListView>



                </ScrollView>

            </View>
        );
    }

}


//最新
class GroupSearch_New extends Component
{

    constructor(props)
    {
        super(props);

        this.state={

            dataSource:new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2}),
            newGroups:[],
        }

    }

    componentDidMount()
    {
        this._fetchData();
    }


    async _fetchData()
    {


        var Groups=[];

        var response =await IM.getRecommandGroups({
            IMNr:Chat.userInfo.User.IMNr,
            Qty:10,
            Sortord:'Newest',
            MaxGroupMemberCount:100,
        });

        if(response && response.Groups){

            for(var i=0;i<response.Groups.length;i++){

                var group =await  Chat._getMyGroupFromGroup(response.Groups[i]);
                Groups.push(group);
            }

            // console.log("这是最新群....")
            // console.dir(Groups);

            this.setState({
                newGroups:Groups,

            });

        }


    }


    _CheckJumpToApplicationOrGroupDetail = (data)=>{

        //点击的话，是去到群详情。
        //分两种情况。
        // 1.如果是群成员的话，通过群号码去找对应的conversation。接着跳转到ChatDetail里面去
        //2.如果不是群成员的话，则跳转到群申请界面去

        //如果是群成员，不让其操作
        if(data.isMembersOfTheGroup == true){

            Chat.createConversation(this.props.navigator,data.IMNr,data.Name,'Group');

        }
        //在这里处理处理群的申请
        else {
            this.props.navigator.push({

                component:GroupApplication,
                passProps:{

                    GroupIMNr:data.IMNr

                },
            })
        }

    }

    _renderRow(data)
    {


        return(

            <View>

                <CommonUserItem
                    data={data}
                    type={'GroupItem'}
                    onPress={()=>{

                       this._CheckJumpToApplicationOrGroupDetail(data)

             }}
                    onPressRight={()=>{

                        this._CheckJumpToApplicationOrGroupDetail(data)

                    }}

                />

            </View>
        )

    }

    render()
    {
        return(


            <ListView dataSource={this.state.dataSource.cloneWithRows(this.state.newGroups)}
                      renderRow={this._renderRow.bind(this)}>

            </ListView>


        );
    }

}





class  GroupFooter extends Component
{

    render()
    {
        return(

            <View style={[{height:10,backgroundColor:'rgb(235,235,235)',alignItems:'center'},styles.row,styles.flex,]}>

            </View>
        );
    }

}


class GroupHeader extends Component
{
    render()
    {
        return(


            <View>


                <View style={[{height:25,backgroundColor:'white',alignItems:'center'},styles.row,styles.flex,]}>


                    <Text style={{fontSize:16,fontFamily:'iconfontim',color:'rgb(204,204,204)',marginLeft:10}}>{String.fromCharCode(this.props.icon)}</Text>
                    <Text style={{fontSize:13,color:'rgb(51,51,51)',marginLeft:5}}>{this.props.title}</Text>


                </View>


                <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>




            </View>

        )
    }


}


class GroupItem extends Component
{


    constructor(props)
    {
        super(props);


        this.state={

            data:this.props.data,

        }
    }


    render()
    {


        var margin=10;
        var iconW = 60;
        var iconH = iconW;
        return(

            <View>

                <View style={[styles.row,{backgroundColor:'white'}]}>



                    <Image style={{margin:margin,resizeMode:'cover',width:iconW,height:iconH,borderRadius:iconW/2}}
                           source={{uri:this.state.data.corverImage}}>

                    </Image>

                    <View style={[{margin:10,marginLeft:0, backgroundColor:'white',flex:1,},styles.row]}>

                        <View style={{flex:4,backgroundColor:'white'}}>



                            <Text numberOfLines={1}  style={{color:'rgb(51,51,51)',fontSize:16}}>{this.state.data.name}</Text>
                            <Text style={{color:'rgb(102,102,102)',fontSize:14,marginTop:2}}>{this.state.data.count+'人'}</Text>
                            <Text numberOfLines={1} style={{color:'rgb(153,153,153)',fontSize:12,marginTop:3}}>{this.state.data.content}</Text>


                        </View>


                        <View style={[{flex:1,backgroundColor:'white'},styles.center]}>



                            <View style={[styles.row,{},{borderColor:'rgb(244,72,72)',borderWidth:1,borderRadius:3,margin:5}]}>


                                <Text style={{fontSize:12,fontFamily:'iconfontim',color:'#F44848',margin:2,marginRight:0,marginLeft:3}}>{String.fromCharCode('0xe180')}</Text>
                                <Text onPress={()=>{

this.props.navigator.push({


    component:Chat_Group_Application,
    name:'申请入群',
     passProps:{

        data:data

    },





})




                              }} style={{fontSize:10,color:'rgb(244,72,72)',margin:2,marginLeft:0,marginRight:3}}>加入群</Text>



                            </View>

                        </View>



                    </View>




                </View>

                <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>



            </View>

        )
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
        container: {
            flex: 1,
            top:100,
        },
        page: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        tabViewHeadBG:{
            backgroundColor:'white',
        },
        tabViewHeadIndicator:{
            backgroundColor:'rgb(244,72,72)',
        },
        tabViewHeadLabel:{
            color:'rgb(244,72,72)',
        },
    });
