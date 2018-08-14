/**
 * Created by yqf on 2017/10/25.
 */

//消息页面


import { observer } from 'mobx-react/native';
import {observable, autorun,computed,action} from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import Swipeout from 'react-native-swipeout';

import {
    TouchableHighlight,
    TouchableOpacity,
    StyleSheet,
    Image,
    ListView,
    Text,
    View,
    RefreshControl,
    Dimensions,
    ActivityIndicator,
    BackHandler
} from 'react-native';

import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';

import {COLORS,FLEXBOX} from '../../styles/commonStyle';

import AvatarGroup from '../../components/AvatarGroup';
import Badge  from '../../components/badge';

import YQFNavBar from '../../components/yqfNavBar';
import YQFRightMenu from '../../components/YQFRightMenu';

import chatList from '../../stores/Chat/ChatList';
import {IM} from '../../utils/data-access/im';
import {Chat}  from '../../utils/chat'

import Enumerable from 'linq';

import GroupDiscover from '../Group/GroupDiscover';
import FriendRecommend from '../Contact/FriendRecommend';
import ContactSelect from '../Contact/ContactSelect';
import ChatRoom from './ChatRoom';


let window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}


@observer

export default class ChatList extends Component{

    constructor(){

          super();
          this.store =new chatList();
    }

    _handleAndroidBack = ()=>{

    }



    componentDidMount(){

        if(Chat.isAndroid()) {

            this._handleAndroidBack();
        }

        this.listener = RCTDeviceEventEmitter.addListener('OnChat', (message) => {

        });

    }

    componentWillUnmount() {

        this.listener.remove();
        if(Chat.isAndroid()) {
            BackHandler.removeEventListener('hardwareBackPress', ()=>{});
        }

    }


    //点击更多
    _ClickMore(i){


        this.store.isShowMenu=false;

        switch (i){

            case 0:
                //发起聊天
                this._ToChat();
                break;
            case 1:
                //新朋友
                this._ToFriendCommand();
                break;
            case 2:
                //发现群
                this._ToGroupDiscover();
                break;
            case 3:
                console.log('其他相关操作');
                break;
        }

    }

    //发起群聊
    _ToChat()
    {

        this.props.navigator.push({

            component:ContactSelect,
            name:'选择联系人',
            passProps:{
                type:'CreateGroup',
            },

        });

    }

    //添加朋友
    _ToFriendCommand()
    {

        this.props.navigator.push({

            component:FriendRecommend,

        })

    }

    //跳到发现群模块
    _ToGroupDiscover(){


        this.props.navigator.push({

         component:GroupDiscover,

        })


    }


    _showMenu(){

        if(this.store.isShowMenu){

            this.store.isShowMenu = false;
        }

        else {
            this.store.isShowMenu = true;
        }


    }

    _back(){

        //如果是我去过，则需要返回到上一级
        if(Chat.obj.Source == '我去过'){

            Chat.showCount();
            this.props.navigator.popToTop();
        }

        else {

          //  this.props.navigator.popToTop();

        }



    }


    //右上角菜单
    _renderRightMenu(){

        if( this.store.isShowMenu){

            return(
                <YQFRightMenu whiteClick={()=>{this.store.isShowMenu = false}}  titles={['发起群聊','添加朋友','发现群']} icons={['0xe16b','0xe17a','0xe171']}
                              callback={(i) =>{

                                            this._ClickMore(i);

                                }}></YQFRightMenu>
            );

        }

        return null;
    }

    _renderNav(){

        //导航栏连接状态显示
        // let title =return(
        //
        //      <View style={{ flexDirection: 'row' }}>
        //     <ActivityIndicator style={{ marginRight: 6 }} text="收取中..." color="white" />
        //     <Text style={styles.title}>收取中...</Text>
        // </View >
        // )
        let title = '收取中...';

        if (Chat.obj.connectionState == 1)
            title = `消息` + (Chat.obj.totalUnReadMessage > 0 ? `(${Chat.obj.totalUnReadMessage})` : "");
        else if (Chat.obj.connectionState == 3)
            title = `消息` + "(未连接)";


      //  let isEmptyData = Chat.obj.isFinish && Chat.obj.conversations.length == 0;

if(Chat.obj.Source == '我去过'){

    return(
        <YQFNavBar title={title}
                   rightIcon={'0xe180'}
                   leftIcon={'0xe183'}
                   onLeftClick={this._back.bind(this)}

                   navigator={this.props.navigator}
                   onRightClick={()=>{
                          this._showMenu();
                    }}/>

    )

}
else {


    return(
        <YQFNavBar title={title}
                   rightIcon={'0xe180'}
                   navigator={this.props.navigator}
                   onRightClick={()=>{
                          this._showMenu();
                    }}/>



    )

}



    }

    _renderListView(){

        return(
            <ListView
                dataSource={this.store.getDataSource}
                enableEmptySections={true}
                renderRow={this.renderRow}
                removeClippedSubviews={false}

            ></ListView>
        )

    }


    render(){


        

        return(
            <View style={[{flex:1,backgroundColor:'white'}]}>

                {this._renderNav()}
                {this._renderListView()}
                {this._renderRightMenu()}

            </View>

        )

    }



    renderRow=(row)=>{

        return (
            row.Messages.length > 0 && <ConversationRow row={row} navigator={this.props.navigator} store={this.store} />
        );
    }

}

@observer
class ConversationRow extends React.Component {
    render() {
        let row = this.props.row;
        var swipeoutBtns = [
            {
                text: '删除',
                backgroundColor:'red',
                onPress:()=>{

                    Chat.removeConversations(row.IMNr, row.ConversationType);

                }
            }
        ];
        return (

            <View style={styles.listItem}>

<Swipeout right={swipeoutBtns}>

                    <ConversationCell
                        avatar={row.FaceUrlPath}
                        unReadMessageCount={row.UnreadCount}
                        name={row.Name}
                        rank={row.Rank}
                        stick={row.Stick}
                        disturb={row.Disturb}
                        latestTime={Chat.getTimeStamp(row.LatestTime)}
                        latestMessage={row.LatestMessage}
                        onPress={() => {

                            //加载最近的15条消息
                            row.Messages = Chat.insertDateMessages(Enumerable.from(row._Messages).takeFromLast(15).toArray())
                            this.props.navigator.push({
                                component: ChatRoom,
                                passProps: { conversation: row }
                            });
                        }}
                    />

</Swipeout>

            </View>)
    }
}

@observer

class ConversationCell extends Component {


    constructor(props) {
        super(props);
    }

    render() {
        let { avatar, unReadMessageCount, name, latestTime, latestMessage, onPress, rank, stick, disturb } = this.props;

        return (
            <TouchableHighlight
                onPress={onPress}

            >
                <View
                    style={[styles.ConversationCell, stick && { backgroundColor: '#F3F2F7' }]}
                >
                    <View
                        style={styles.leftBox}
                    >
                        <Badge text={unReadMessageCount} dot={disturb} textViewStyle={styles.badgeView} badgeTextStyle={{ fontSize: 12 }} size={'small'}>

                            <AvatarGroup faceUrlPathsArray={avatar.slice()} />

                        </Badge>
                    </View>
                    <View
                        style={styles.boxRight}
                    >
                        <View
                            style={styles.boxCeil}
                        >
                            <View style={FLEXBOX.flexStart}>
                                <Text
                                    style={[styles.sessionName, { flex: 0 }]}
                                    numberOfLines={1}
                                >{name}</Text>
                                {/* 顾问是否显示 */}
                                {rank ? <View style={styles.adviser}>
                                        <Text style={styles.adviserText}>旅行顾问</Text>
                                    </View> : null}
                            </View>

                            <Text
                                style={styles.latestTime}
                            >{latestTime}</Text>
                        </View>
                        <Text
                            style={styles.boxFloor}
                            numberOfLines={1}
                        >{disturb ? (unReadMessageCount > 0 ? `[${unReadMessageCount}条] ` : "") + latestMessage : latestMessage}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        );



    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: '#f6f6f6'
    },
    listItem: {
        borderBottomWidth: 1 / FLEXBOX.pixel,
        borderColor: '#ddd',

    },
    ConversationCell: {
        flexDirection: 'row',
        backgroundColor: '#fff',

    },
    leftBox: {
        padding: 10
    },
    avatar: {
        borderRadius: 4,
        width: 45,
        height: 45
    },
    cellBadge: {
        position: 'absolute',
        top: 2,
        right: 0
    },
    boxRight: {
        flex: 1,
        padding: 10,
        paddingLeft: 0
    },
    boxCeil: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sessionName: {
        fontSize: 16,
        color: '#333',
        flex: .7
    },
    boxFloor: {
        fontSize: 14,
        color: '#9A9A9A',
        flex: 1,
    },
    latestTime: {
        fontSize: 12,
        color: '#B3B3B3'
    },
    emptyMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyMessageImage: {
        width: 90,
        height: 90,
        opacity: 0.6
    },
    emptyMessageText: {
        color: '#999',
        fontSize: 14
    },
    badgeView: {
        minWidth: 18,
        paddingVertical: 2,
        paddingHorizontal: 5,
        top: -8, right: -8,
        overflow: 'hidden'
    },
    notificationWrap: {
        backgroundColor: COLORS.primary,
        borderRadius: 3,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationIcon: {
        fontSize: 26,
        color: '#fff'
    },
    adviser: {
        // backgroundColor:COLORS.primary,
        borderRadius: 12,
        borderColor: COLORS.secondary,
        borderWidth: 1 / FLEXBOX.pixel,
        paddingHorizontal: 5,
        paddingVertical: 0,
        marginLeft: 5,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    adviserText: {
        color: COLORS.secondary,
        fontSize: 10,
    },
    title: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    }
});
