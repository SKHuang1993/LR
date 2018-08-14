import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    StatusBar,
    ScrollView,
    Navigator,
    ListView,
    TouchableOpacity,
    TouchableHighlight,
    Animated
} from 'react-native';

import { List, WhiteSpace, Picker, ActivityIndicator, Popup } from 'antd-mobile';
import Flex from '../../components/flex';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../../components/button';
import Accordion from 'react-native-collapsible/Accordion';
import { observer } from 'mobx-react/native';
import FormatPrice from '../../components/formatPrice';
import moment from 'moment';
import 'moment/locale/zh-cn';
const defaultDate = moment().locale('zh-cn').utcOffset(8);

import { BaseComponent } from '../locale';
let lan = BaseComponent.getLocale();


export default class Index extends Component {

    static defaultProps = {
        onBackPress: null, //() => { }, //返回按钮
        // 组件数据格式
        data: {
            //标题
            title: {
                leg: '去',
                date: '2015-10-23T22:50:00', // 格式 2015-10-23T22:50:00 || 2015-10-23 22:50:00
                city: '广州-北京',
                agencyCode: "1P"
            },

            //列表
            list: [
                {
                    "Departure": "CAN",
                    "Arrival": "XMN",
                    "DepartureInfo": {
                        "airportCode": "CAN",
                        "airportNameEn": "Baiyunairport",
                        "airportNameCn": "广州新白云国际机场",
                        "cityCode": "CNCAN",
                        "cityIataCode": "CAN",
                        "cityNameEn": "Guangzhou",
                        "cityNameCn": "广州",
                        "countryCode": "CN",
                        "countryNameEn": "China",
                        "countryNameCn": "中国",
                        "continentCode": "DN",
                        "continentNameCn": "东南亚",
                        "timeZone": "8"
                    },
                    "ArrivalInfo": {
                        "airportCode": "XMN",
                        "airportNameEn": "Xiamen Airport",
                        "airportNameCn": "厦门高崎国际机场",
                        "cityCode": "CNXMN",
                        "cityIataCode": "XMN",
                        "cityNameEn": "Xiamen",
                        "cityNameCn": "厦门",
                        "countryCode": "CN",
                        "countryNameEn": "China",
                        "countryNameCn": "中国",
                        "continentCode": "DN",
                        "continentNameCn": "东南亚",
                        "timeZone": "8"
                    },
                    "DepartureDate": "2017-04-02 22:00:00",
                    "ArrivalDate": "2017-04-02 23:20:00",
                    "MarketingAirline": "MF",
                    "FlightNumber": "8302",
                    "DepartureTerminal": null,
                    "ArrivalTerminal": "T3",
                    "Equipment": "738",
                    "ElapsedTime": "1:20",
                    "Miles": "567",
                    "StopQuantity": "0",
                }
            ]
        }
    };
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    //转机信息
    isStops = (data, index) => {
        return index > 0 ? <View style={styles.stops}>
            <View style={styles.stopsInner}>
                <Text style={styles.stopsText} numberOfLines={1}>{lan.flights_stops} {this.getDateDiff(this.props.data.list[index - 1].ArrivalDate, data.DepartureDate, null)} {lan.flights_transitPlace} {lan.lang == "ZH" ? data.DepartureInfo.airportNameCn : data.DepartureInfo.cityIataCode}</Text>
            </View>
        </View> : null
    }

    //时间间隔计算(间隔天（+1）数或小时数（3h8m）,为0不输出)
    getDateDiff = (startDate, endDate, output = 'day') => {
        //判断 时间格式

        startDate = output == 'day' ? moment(moment(startDate).format('YYYY-MM-DD')).format('X') : moment(moment(startDate).format('YYYY-MM-DD HH:mm')).format('X');
        endDate = output == 'day' ? moment(moment(endDate).format('YYYY-MM-DD')).format('X') : moment(moment(endDate).format('YYYY-MM-DD HH:mm')).format('X');
        let millisec = Math.abs((startDate - endDate))
        let dd = millisec / 60 / 60 / 24; // 天数
        let mm = millisec / 60 % 60; // 分
        let hh = parseInt(millisec / 60 / 60); //小时

        return output ? dd >= 1 ? '+' + dd : null : `${hh}h${mm}m`;
    }

    render() {
        return (
            <View style={styles.container}>
                {this.props.data.title ?
                    <Flex style={styles.header}>
                        <View style={styles.leg}><Text style={styles.legText}>{this.props.data.title.leg}</Text></View>
                        <Text style={styles.data}>{moment(this.props.data.title.date).format('MM.DD')}({moment(this.props.data.title.date).format('ddd')})</Text>
                        <Text style={{ color: '#666' }}>{this.props.data.title.city}</Text>
                        <Text style={styles.supplier}>{this.props.data.title.agencyCode}</Text>
                        {this.props.onBackPress ? <TouchableOpacity activeOpacity={.7} style={styles.reselect} onPress={this.props.onBackPress}>

                            <Icon icon={'0xe686'} style={styles.reselectText} />
                        </TouchableOpacity> : null}


                    </Flex> : null
                }
                {this.props.data.list.map((data, index) => {
                    let departureDate = this.props.data.list[0].DepartureDate;
                    return (
                        <View key={index}>
                            {/*转机信息*/}
                            {this.isStops(data, index)}
                            <Flex >
                                {/*修饰*/}
                                {this.props.sym ?
                                    <Flex.Item style={styles.sym}>
                                        <View style={[styles.symDot, styles.symDot1]}></View>
                                        <View style={[styles.symDot, styles.symDot2]}></View>
                                        <View style={styles.symLine}></View>
                                    </Flex.Item> : null
                                }
                                <Flex.Item style={styles.left}>
                                    <Flex>
                                        <Text style={styles.time}>{moment(data.DepartureDate).format('HH:mm')}</Text>
                                        <Text style={styles.days}>{this.getDateDiff(departureDate, data.DepartureDate)}</Text>
                                    </Flex>
                                    <Flex>
                                        <Text style={styles.time}>{moment(data.ArrivalDate).format('HH:mm')}</Text>
                                        <Text style={styles.days}>{this.getDateDiff(departureDate, data.ArrivalDate)}</Text>
                                    </Flex>

                                </Flex.Item>
                                <Flex.Item style={styles.center}>
                                    <Flex style={{ marginBottom: 4 }}>
                                        <Text style={styles.airport} numberOfLines={1}>{lan.lang == "ZH" ? data.DepartureInfo.airportNameCn : data.DepartureInfo.airportCode}</Text>
                                        <Text style={styles.terminal}>{data.DepartureTerminal}</Text>
                                    </Flex>
                                    <Flex>
                                        <Text style={styles.airport} numberOfLines={1}>{lan.lang == "ZH" ? data.ArrivalInfo.airportNameCn : data.ArrivalInfo.airportCode}</Text>
                                        <Text style={styles.terminal}>{data.ArrivalTerminal}</Text>
                                    </Flex>

                                </Flex.Item>
                                {/*右边*/}
                                <Flex.Item style={styles.right}>
                                    <View>
                                        <Flex>
                                            <Image style={styles.airlineIco} source={{ uri: `http://airlineico.b0.upaiyun.com/${data.MarketingAirline}.png` }} />
                                            <Text style={styles.infoText}>
                                                {lan.lang == "ZH" && data.MarketingAirlineName}{data.MarketingAirline}{data.FlightNumber}
                                            </Text>
                                        </Flex>
                                        <Text style={[styles.infoText, styles.type]}>{lan.aircraftType}{data.Equipment}</Text>
                                        <Flex>
                                            <Icon icon={'0xe670'} style={styles.timeIcon} />
                                            <Text style={[styles.infoText]}>
                                                {data.ElapsedTime}
                                            </Text>
                                        </Flex>
                                    </View>
                                </Flex.Item>
                            </Flex>
                        </View>

                    )
                })}

            </View>
        )
    }
}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',

    },
    header: {
        paddingTop: 5,
        paddingBottom: 5,
        marginBottom: 5,
    },
    leg: {
        borderRadius: 2,
        backgroundColor: COLORS.secondary,
        padding: 2,
        marginRight: 5,
    },
    legText: {
        color: '#fff',
        fontSize: 10
    },
    data: {
        marginRight: 10,
        color: '#666',
    },
    reselect: {
        position: 'absolute',
        right: 0,
        top: 5,
    },
    reselectText: {
        color: '#999'
    },
    time: {
        fontSize: 18,
        color: '#333'
    },
    left: {
        flex: 0.5,
        marginRight: 15,

    },
    center: {

    },
    right: {
        alignItems: 'flex-end'
    },
    airport: {
        fontSize: 15,
        //lineHeight: 18,
        color: '#333'
        //width: '100%'
    },
    terminal: {
        fontSize: 15,
        lineHeight: 18,

    },
    airlineIco: {
        width: 14,
        height: 14,
        marginRight: 1,
    },
    infoText: {
        color: '#999',
        fontSize: 10,

    },
    timeIcon: {
        fontSize: 11,
        color: '#999',
        marginLeft: 1,
        marginRight: 1,


    },
    type: {
        marginLeft: 14,
    },
    days: {
        fontSize: 10,
        color: '#666',
        transform: [{ translateY: 0 },]

    },
    endorse: {
        textDecorationLine: 'underline',
        color: COLORS.link,
        fontSize: 12,
        marginLeft: 10,
    },
    stops: {

        justifyContent: 'center',
        alignItems: 'center'



    },
    stopsInner: {
        borderRadius: 10,
        borderWidth: 1 / FLEXBOX.pixel,
        borderStyle: 'dashed',
        borderColor: '#dcdcdc',
        padding: 2,
        paddingLeft: 10,
        paddingRight: 10,
        marginTop: 10,
        marginBottom: 10,



    },
    stopsText: {
        fontSize: 10,
        textAlign: 'center',
        color: '#666'
    },
    // 修饰符
    sym: {
        width: 7,
        flex: 0,
        // backgroundColor: 'red',
        height: 36,
        marginLeft: 5,
        marginRight: 5,
    },
    symDot: {
        borderColor: COLORS.primary,
        height: 7,
        width: 7,
        borderRadius: 3.5,
        backgroundColor: '#999999',
        position: 'absolute',
        left: 0,
    },
    symDot1: {
        top: 3,
    },
    symDot2: {
        bottom: 3,
    },
    symLine: {
        position: 'absolute',
        left: 2.5,
        top: 5,
        width: 2,
        height: 25,
        backgroundColor: '#999',
    },
    supplier: {
        position: 'absolute',
        right: 30,
        top: 5,
        fontSize: 12,
        color: COLORS.secondary
    },





});

