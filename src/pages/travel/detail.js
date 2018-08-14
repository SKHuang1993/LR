import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    ListView,
    ScrollView,
    Platform,
    BackAndroid,
    Navigator,
    TouchableOpacity
} from 'react-native';
import { Tabs, Toast } from 'antd-mobile';
import { LanguageType } from '../../utils/languageType';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import Flex from '../../components/flex';
import { COLORS, FLEXBOX } from '../../styles/commonStyle';
import ApprovalItem from './approvalItem';
import formatPrice from '../../components/formatPrice';
const TabPane = Tabs.TabPane;
import Modal from '../../components/modal';

import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class Orders extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#e6eaf2', marginTop: 100 }}>
                {/*火车票信息*/}

                <View style={[styles.card, styles.train]}>
                    {/*头部*/}
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderText}>{lan.trainInfo}</Text>
                    </View>
                    {/*body*/}
                    <Flex justify={'between'} style={styles.cardBody}>
                        {/*左栏*/}
                        <View style={{ flex: .7 }}>
                            <Flex>
                                <Text style={styles.trainTime}>22:55</Text>
                                <Text style={styles.trainName}>广州南</Text>
                            </Flex>
                            <Flex>
                                <Text style={styles.trainTime}>22:55<Text style={styles.trainIsday}>+1</Text></Text>
                                <Text style={styles.trainName}>上海北</Text>
                            </Flex>
                        </View>
                        {/*右栏*/}
                        <View style={{ flex: .3 }}>
                            <Text style={styles.trainNumber}>
                                K648
                            </Text>
                            <Flex>
                                <Icon icon={'0xe670'} style={styles.iconTime} />
                                <Text style={styles.trainTotalTime}>3h25m</Text>
                            </Flex>
                        </View>
                    </Flex>
                    {/*底部*/}
                    <Flex justify={'between'} style={styles.cardFooter}>
                        <TouchableOpacity activeOpacity={.7} onPress={() => { }}>
                            <Text style={styles.cardFooterLink}>{lan.detail_ticketChanges}</Text>
                        </TouchableOpacity>
                        <Text style={styles.cardFooterInfo}>
                            二等座¥150*2人
                            {formatPrice(2830, null, 20)}
                        </Text>
                    </Flex>
                </View>
                {/*酒店信息*/}

                <View style={[styles.card, styles.hotel]}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderText}>{lan.hotelInfo}</Text>
                    </View>
                    <View justify={'between'} style={styles.cardBody}>
                        <Flex >
                            {/*左栏*/}
                            <View style={{ flex: .7 }}>
                                <View>
                                    <Text style={styles.hotelName} numberOfLines={1}>北京新世界酒店</Text>
                                </View>
                                <Flex >
                                    <Text style={[styles.hotelInfo,{marginRight:40}]}>豪华双人房</Text>
                                    <Text style={styles.hotelInfo}>自助早餐</Text>
                                </Flex>
                                <Flex align={'center'} style={{marginTop:10}}>
                                    <Icon icon={'0xe691'} style={styles.iconSpace} />
                                    <Text style={styles.hotelAdress}>北京二环二路365号(市政府后侧)</Text>
                                </Flex>
                            </View>
                            {/*右栏*/}
                            <View style={{ flex: .2 }}>
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity activeOpacity={.7} onPress={() => {
                                        Modal.alert(lan.detail_violatePolicy, lan.detail_violateContent, [
                                            { text: lan.ok, onPress: () => { } },
                                        ]);
                                    }}>
                                        <Text style={styles.hotelPolicy}>{lan.detail_violatePolicy}</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </Flex>


                    </View>
                    {/*底部*/}
                    <Flex justify={'between'} style={styles.cardFooter}>
                        <TouchableOpacity activeOpacity={.7} onPress={() => { }}>
                            <Text style={styles.cardFooterLink}>{lan.detail_ticketChanges}</Text>
                        </TouchableOpacity>
                        <Text style={styles.cardFooterInfo}>
                            二等座¥150*2人
                            {formatPrice(2830, null, 20)}
                        </Text>
                    </Flex>
                </View>
            </View>
        )
    }

    getOrderItemInfo = () => {
        return <ApprovalItem />
    }

}

const styles = StyleSheet.create({
    // 列表通用
    cardHeader: {
        paddingTop: 10,
        paddingLeft: 10,
        paddingBottom: 5,
        backgroundColor: COLORS.containerBg,
    },
    cardHeaderText: {
        fontSize: 14,
        color: '#999'
    },
    cardFooterInfo: {
        color: '#999'
    },
    cardFooterLink: {
        color: COLORS.link,
        textDecorationLine: 'underline'
    },

    cardFooter: {
        borderTopColor: '#dcdcdc',
        borderTopWidth: 1 / FLEXBOX.pixel,
        padding: 10,
    },
    cardBody: {
        padding: 10,
    },
    card: {
        backgroundColor: '#fff'
    },
    // 火车票
    train: {
        backgroundColor: '#fff',
    },

    trainTime: {
        flex: .35,
        fontSize: 20,
    },
    trainName: {
        flex: .65,
        fontSize: 16
    },
    trainNumber: {
        fontSize: 18,
        color: '#999',
        transform: [
            {
                translateX: 12

            }
        ],

    },
    trainTotalTime: {
        fontSize: 14,
        color: '#999'
    },
    iconTime: {
        fontSize: 12,
        color: '#999'
    },
    trainIsday: {
        fontSize: 10,
        color: '#999'
    },

    // 酒店
    hotel: {
        backgroundColor: '#fff'
    },
    hotelName: {
        fontSize: 18,
        color: '#333',
        marginBottom: 10,
    },
    hotelInfo: {
        color: '#999'
    },
    hotelAdress: {
        color: '#333',
       
       
    },
    iconSpace: {
        color: '#333',
        
    },
    hotelPolicy: {
        color: COLORS.secondary,
        textDecorationLine: 'underline',
        textAlign: 'right',
        fontSize:15,
        
    }


})