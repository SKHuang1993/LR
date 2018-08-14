/**
 * <plusmancn@gmail.com> created at 2017
 *
 * Copyright (c) 2017 plusmancn, all rights
 * reserved.
 *
 * @flow
 *
 * 聊天会话窗口
 */

import { observer } from 'mobx-react/native';
import React, { PropTypes } from 'react';
import {
    TouchableHighlight,
    TouchableOpacity,
    StyleSheet,
    Image,
    ListView,
    Text,
    View, RefreshControl, ActivityIndicator
} from 'react-native';



import Enumerable from 'linq';
import { WhiteSpace } from 'antd-mobile';
import List from '../components/list';
import Flex from '../components/flex';
import NavBar from '../components/navBar';
import Icon from '../components/icons/icon';
import SwipeAction from '../components/swipe-action';
import { COLORS, FLEXBOX } from '../styles/commonStyle';
import NoData from '../components/noDataTip';
import Badge from '../components/badge';
import AvatarGroup from '../components/avatar-group';
import ChatRoom from './chatRoom';
import ChatList from './stores/chatList';
import { Chat } from '../utils/chat';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import NoDataTip from '../components/noDataTip.1';
import Swipeout from 'react-native-swipeout';
import NotificationList from './notificationList';
import { Storage } from './libs/storage';

@observer
export default class SessionList extends Chat {
    constructor() {
        super();
        this.store = new ChatList();
        //this.getConversations();
    }

    componentDidMount() {
        this.listener = RCTDeviceEventEmitter.addListener('OnChat', (message) => {
            // console.log(message);
            // this.store.insertConversation(message);
        });
    }

    componentWillUnmount() {
        this.listener.remove();
    }

    getConversations = async () => {
        let conversations = await Chat.getConversations();
        this.store.conversationList = conversations;
        this.store.isLoading = false;
    }

    renderRow = (row) => {

        return (
            row.Messages.length > 0 && <ConversationRow row={row} navigator={this.props.navigator} store={this.store} />
        );
    }



    render() {
        //导航栏连接状态显示
        let title = <View style={{ flexDirection: 'row' }}>
            <ActivityIndicator style={{ marginRight: 6 }} text="收取中..." color="white" />
            <Text style={styles.title}>收取中...</Text>
        </View >
        if (Chat.obj.connectionState == 1)
            title = `消息` + (Chat.obj.totalUnReadMessage > 0 ? `(${Chat.obj.totalUnReadMessage})` : "");
        else if (Chat.obj.connectionState == 3)
            title = `消息` + "(未连接)";

        let isEmptyData = Chat.obj.isFinish && Chat.obj.conversations.length == 0;
        return <View style={styles.container}>
            <NavBar leftText={' '} title={title} navigator={this.props.navigator} />
            <ListView
                dataSource={this.store.getDataSource}
                enableEmptySections={true}
                renderRow={this.renderRow}
                removeClippedSubviews={false}
                renderHeader={() =>
                    Chat.obj.conversationHeaders.map((o, i) => <View key={i} style={styles.listItem}><NotificationCell
                        name={o.Name}
                        unReadMessageCount={o.UnreadCount}
                        onPress={() => {
                            this.props.navigator.push({
                                component: NotificationList,
                                passProps: {},
                            });
                        }} /></View>)
                }
            // refreshControl={
            //     <RefreshControl
            //         onRefresh={() => this.getConversations()}
            //         refreshing={!Chat.obj.isFinish}
            //     />
            // }
            />
            {/* {isEmptyData && <NoDataTip noDataState={4} />} */}
        </View>
    }
}

@observer
class ConversationRow extends React.Component {
    render() {
        let row = this.props.row;
        return (
            <View style={styles.listItem}>
                <Swipeout autoClose style={{ backgroundColor: 'transparent' }} right={[

                    {
                        text: '删除',
                        onPress: () => {
                            Chat.removeConversations(row.IMNr, row.ConversationType);
                        },
                        color: '#fff',
                        backgroundColor: 'red',
                        style: { backgroundColor: 'red', color: 'white' },
                    },
                ]}  >
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
                            //row.Messages = Chat.insertDateMessages(Enumerable.from(row._Messages).takeFromLast(15).toArray())
                            Storage.selectMessage(row.IMNr, 0, 15, (messages) => {
                                //console.log(messages);
                                row.Messages = Chat.insertDateMessages(messages);
                            });
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
class ConversationCell extends React.Component {


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
                    style={[styles.ConversationCell, stick && { backgroundColor: "#F3F2F7" }]}
                >
                    <View
                        style={styles.leftBox}
                    >
                        <Badge text={unReadMessageCount} dot={disturb} textViewStyle={styles.badgeView} badgeTextStyle={{ fontSize: 12 }} size={'small'}>
                            {/* <Image
                                source={{
                                    uri: avatar[0]
                                }}
                                style={styles.avatar}
                            /> */}
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
                                    <Text style={styles.adviserText}>差旅顾问</Text>
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
//系统通知
@observer
class NotificationCell extends React.Component {


    constructor(props) {
        super(props);
    }

    render() {
        let { unReadMessageCount, name, latestTime, latestMessage, onPress } = this.props;
        return (
            <TouchableHighlight
                onPress={onPress}

            >
                <View
                    style={styles.ConversationCell}
                >
                    <View
                        style={styles.leftBox}
                    >
                        <Badge text={unReadMessageCount} dot={false} textViewStyle={styles.badgeView} badgeTextStyle={{ fontSize: 12 }} size={'small'}>
                            <View style={styles.notificationWrap}>
                                <Icon style={styles.notificationIcon} icon={'0xe611'} />
                            </View>
                        </Badge>
                    </View>
                    <View
                        style={styles.boxRight}
                    >
                        <View
                            style={[styles.boxCeil, {
                                alignItems: 'center',
                            }]}
                        >
                            <Text
                                style={styles.sessionName}
                                numberOfLines={1}
                            >{name}</Text>

                        </View>

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

