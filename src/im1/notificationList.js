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
import React, { PropTypes, Component } from 'react';
import {
    TouchableHighlight,
    TouchableOpacity,
    StyleSheet,
    Image,
    ListView,
    Text,
    View, RefreshControl
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
import Notifications from './stores/notificationList';
import { Chat } from '../utils/chat';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import NoDataTip from '../components/noDataTip.1';
import Swipeout from 'react-native-swipeout';
import ActivityIndicator from '../components/activity-indicator';
import { BaseComponent } from '../components/locale';
import moment from 'moment';

import OrderDetail from '../pages/account/orderDetail2';

let lan = BaseComponent.getLocale();

@observer
export default class NotificationList extends Chat {
    constructor() {
        super();
        this.store = new Notifications();
        this.store.getMsgList();
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        let paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
    };

    renderRow = (row) => {
        return (
            <NotificationItem row={row} onPress={() => {
                if (!row.ReadDate)
                    this.store.setMsgListRead(row.Id);
                row.ReadDate = moment().format();
                let storage = global.storage;
                let _this = this;
                storage.load({ key: 'BIZACCOUNTINFO' }).then(val =>{
                    if(val!=null){
                        let userInfo = JSON.parse(val);
                        _this.props.navigator.push({
                            name: 'OrderDetail',
                            component: OrderDetail,
                            passProps:{
                                OrderId:row.OrderID,
                                BookerID:row.BookerID,
                                LoginAccount:(userInfo.Phone == null || userInfo.Phone == '') ?
                                             userInfo.Email : userInfo.Phone,
                                AccountNo:userInfo.AccountNo,
                                IsApproval:row.BookerID == userInfo.AccountNo ? false : true, 
                            }
                        });
                    }
                }).catch(err => {
                    alert(err)
                });
            }} />
        );
    }

    render() {
        let isEmptyData = this.store.messageList.length == 0 && !this.store.isLoading;
        return <View style={styles.container}>
            <NavBar title={'系统通知'} navigator={this.props.navigator} />

            <ListView
                onMomentumScrollEnd={({ nativeEvent }) => {
                    if (this.isCloseToBottom(nativeEvent) && !this.store.isFinish) {
                        this.store.getMsgList();
                    }
                }}
                dataSource={this.store.getDataSource}
                enableEmptySections={true}
                renderRow={this.renderRow}
                removeClippedSubviews={false}
            />
            {isEmptyData && <NoDataTip noDataState={4} />}
            <ActivityIndicator toast text={lan.loading} animating={this.store.isLoading} />
        </View>
    }
}

@observer
class NotificationItem extends Component {
    render() {
        let row = this.props.row;
        let date = moment(row.SendDate);
        let sendDate = date.format("YYYY-MM-DD HH:mm");
        if (date.isSame(moment(), "d")) {
            sendDate = date.format("HH:mm");
        }
        // 匹配字符添加换行符号
        let content = row.Content.replace('审批人', `${'\n'}审批人`);
         content = content.replace('旅客', `${'\n'}旅客`);
        return <TouchableOpacity onPress={() => {
            if (this.props.onPress)
                this.props.onPress();
        }}
            activeOpacity={0.7}
            style={styles.card}
        >
            <View style={[FLEXBOX.flexBetween, styles.header]}>
                <View>
                    <Text style={[styles.title, row.ReadDate && { color: "#333" }]}>{row.Title}</Text>
                    {!row.ReadDate && <View style={styles.dot}></View>}
                </View>
                <Text style={styles.date}>{sendDate}</Text>
            </View>
            <View style={styles.body}>
                <Text style={[styles.text, row.ReadDate && { color: "#999" }]}>
                    {content}
                </Text>

            </View>
        </TouchableOpacity>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: '#f6f6f6',

    },
    card: {
        borderRadius: 10,
        marginHorizontal: 5,
        marginTop: 5,
        borderWidth: 1 / FLEXBOX.pixel,
        borderColor: '#ddd',
        padding: 10,
        backgroundColor: '#fff'
    },
    header: {
        marginBottom: 5,
    },
    dot: {
        position: 'absolute',
        right: -10,
        top: -3,
        width: 8,
        height: 8,
        backgroundColor: COLORS.secondary,
        borderRadius: 4
    },
    date: {
        fontSize: 12,
        color: '#999'
    },
    title: {
        fontSize: 16,
    },
    text: {
        marginTop: 4,
        fontSize: 12,
        color: '#333'
    }


});

