

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    ListView,
    TouchableOpacity,
    TouchableHighlight,
    Animated
} from 'react-native';

import { List, WhiteSpace, Picker } from 'antd-mobile';
import Flex from '../../components/flex';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import '../../utils/date';
import { COLORS, FLEXBOX } from '../../styles/commonStyle';
import FormatPrice from '../formatPrice';
import Modal from '../../components/modal';
const alert = Modal.alert;
import moment from 'moment';
import 'moment/locale/zh-cn';
const defaultDate = moment().locale('zh-cn').utcOffset(8);
import { BaseComponent } from '../locale';
let lan = BaseComponent.getLocale();

export default class SelectedFlight extends Component {

    static defaultProps = {
        onBackPress: () => { }, //() => { }, //返回按钮
        leg: lan.flights_trip, // 航段
        // 组件数据格式
        data:

        [
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
                "Price": "8993",
                "Cabin": "经济舱",
                "Discount": '6.1',
                "Share": false // 共享航班
            }
        ]

    };



    constructor(props) {
        super(props);
    }
    // 国内列表 右边信息

    domesticRightInfo(data) {
        return (
            <Flex.Item style={styles.mainRight}>
                {FormatPrice(data.Price, '', null, null, '起')}
                <Text style={styles.mainRigntTxt}>{lan.flights_enginePlusFuel}</Text>
                <Text style={styles.mainRigntTxt}>&yen;50</Text>
            </Flex.Item>
        )
    }
    // 国际列表 右边信息
    intlRightInfo(data) {
        return (
            <Flex.Item style={styles.mainRight}>
                <Text style={styles.taxTitle}>{lan.flights_fullPriceincludingTax}</Text>
                {FormatPrice(data.Price, '', null, null, lan.flights_priceUp)}
                <TouchableOpacity style={styles.policyHint} activeOpacity={1} onPress={() => alert(lan.flights_violatePolicy, lan.flights_policyContent, [
                    { text: lan.confirm, onPress: () => { } },
                ])}>
                    <Text style={styles.policyHint}>{lan.flights_violatePolicy}</Text>
                </TouchableOpacity>
            </Flex.Item>
        )
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
        //let flightType=this.props.flightType == domestic ? domesticRightInfo : null ;
        let firstData = this.props.data[0];
        let lastData = this.props.data[this.props.data.length - 1];
        return (
            <View>
                {/*头部*/}
                <Flex style={styles.header} >
                    <View style={styles.headerLeg}><Text style={styles.headerLegText}>{this.props.leg}</Text></View>
                    <Text style={styles.headerText}>
                        {moment(firstData.DepartureDate).format('MM.DD')}({moment(firstData.DepartureDate).format('ddd')})
                    </Text>
                    <Text style={styles.headerText}>
                        {moment(firstData.DepartureDate).format('HH:mm')}-{moment(lastData.ArrivalDate).format('HH:mm')}
                    </Text>
                    {/*返回*/}
                    {this.props.onBackPress ? <TouchableOpacity activeOpacity={.7} style={styles.reselect} onPress={this.props.onBackPress}>
                        <Icon icon={'0xe686'} style={styles.reselectText} />
                    </TouchableOpacity> : null}
                </Flex>
                <TouchableOpacity activeOpacity={.7} style={styles.body}>
                    <Flex justify="between" >
                        <Flex.Item style={styles.mainTrip}>
                            <Text style={[styles.time, styles.timeLeft]} >{firstData.DepartureDate.substring(11, 16)}</Text>
                            <View style={[styles.airportBox, styles.airportBoxLeft]}>
                                <Text numberOfLines={1} style={styles.airport} >{firstData.DepartureInfo.airportNameCn}</Text>
                                <Text style={styles.terminal} >{firstData.DepartureTerminal}</Text>
                            </View>
                        </Flex.Item>
                        <Flex.Item style={styles.mainStops}>
                            {firstData.StopQuantity > 0 ? <Text style={styles.stops}>{lan.flights_stopOver}{firstData.StopQuantity}{lan.flights_frequency}</Text> : null}
                            <View style={styles.toLine}></View>
                            <Text style={styles.stopsCity}>{firstData.StopAirport}</Text>
                        </Flex.Item>

                        <Flex.Item style={styles.mainTrip}>
                            <Text style={[styles.time, styles.timeRight]}>
                                {lastData.ArrivalDate.substring(11, 16)}<Text style={styles.nextDay}>{this.getDateDiff(firstData.DepartureDate, lastData.ArrivalDate)}</Text></Text>
                            <View style={[styles.airportBox, styles.airportBoxRight]}>
                                <Text numberOfLines={1} style={[styles.airport, styles.airpotRight]} >
                                    {lastData.ArrivalInfo.airportNameCn}
                                </Text>
                                <Text style={styles.terminal} >
                                    {lastData.ArrivalTerminal}
                                </Text>
                            </View>
                        </Flex.Item>
                        {/*list 右边信息  判断国际（国际没价格信息）或国内*/}
                        {firstData.Price > 0 ? this.domesticRightInfo(firstData) : null}
                    </Flex>
                    <View style={styles.info}>
                        <Image style={styles.airlineIco} source={{ uri: `http://airlineico.b0.upaiyun.com/${firstData.MarketingAirline}.png` }} />
                        <Text style={styles.infoText}>{lan.lang != "EN" && firstData.MarketingAirlineName}{firstData.MarketingAirline}{firstData.FlightNumber}</Text>
                        <Text style={styles.infoText}> | </Text>
                        <Text style={styles.infoText}>{lan.aircraftType}{firstData.Equipment} </Text>
                        <Text style={styles.infoText}> | </Text>
                        <Icon icon={'0xe670'} style={styles.timeIcon} />
                        <Text style={styles.infoText}>{this.getDateDiff(lastData.ArrivalDate, firstData.DepartureDate, null)}</Text>

                        {/*舱位*/}
                        {firstData.Cabin ? <Text style={styles.infoText}> | {firstData.Cabin}</Text> : null}
                        {firstData.Discount ? <Text style={styles.infoText}> | {firstData.Discount}{lan.flights_discount} </Text> : null}
                        {firstData.Share ? <Text style={[styles.infoText, COLORS.link]}>  {lan.flights_share} </Text> : null}


                    </View>
                </TouchableOpacity>
            </View>


        )

    }


}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 5,
        backgroundColor: '#fff'

    },


    airlineIco: {
        width: 12,
        height: 12,
        alignSelf: 'center',
        marginRight: 2,
    },



    time: {
        fontSize: 24,


    },
    timeLeft: {

        textAlign: 'right'
    },
    airportBox: {
        flexDirection: 'row',
        justifyContent: 'flex-start',


    },
    airportBoxLeft: {
        justifyContent: 'flex-start',
        paddingLeft: 8,
    },
    airport: {
        fontSize: 12,
        color: '#666',
        width: FLEXBOX.width * 0.17,
        justifyContent: 'flex-end',
        textAlign: 'right',
    },
    airpotRight: {
        textAlign: 'left',
    },
    terminal: {
        marginLeft: 2,
        fontSize: 10,
        color: '#666',

    },
    mainTrip: {
        width: FLEXBOX.width * 0.2,

        flex: 1,



    },
    mainRight: {
        width: FLEXBOX.width * 0.35,
        alignItems: 'flex-end',
        marginRight: 10,
        transform: [{ translateY: 5 }]
    },
    mainStops: {
        width: FLEXBOX.width * 0.15,
        alignItems: 'center',
        justifyContent: 'center',


    },


    stopsLine: {
        height: 1,
        backgroundColor: '#666',
        width: 30,

    },
    info: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 5,
        paddingLeft: 15,
        paddingRight: 15,
    },
    infoText: {
        color: '#999',
        fontSize: 12,
    },
    timeIcon: {
        fontSize: 14,
        color: '#999'
    },
    mainRigntTxt: {
        fontSize: 10, color: '#999'
    },
    toLine: {
        width: FLEXBOX.width * 0.15,
        height: 1 / FLEXBOX.pixel,

        backgroundColor: '#ddd'
    },
    stops: {
        fontSize: 10,
        color: '#999',
        marginBottom: 2,

    },
    stopsCity: {
        marginTop: 2,
        fontSize: 10,
        color: '#999'
    },
    nextDay: {
        fontSize: 12, color: '#999'
    },
    reselect: {
        position: 'absolute',
        right: 5,
        top: 5,
        paddingLeft: 10,
        paddingRight: 10,
    },
    reselectText: {
        color: '#999'
    },
    // 国际右边
    policyHint: {
        textDecorationLine: 'underline',
        color: COLORS.secondary,
        fontSize: 12,
        backgroundColor: '#fff'
    },
    taxTitle: {
        fontSize: 12,
        color: '#999'
    },

    //头部
    header: {
        backgroundColor: '#fff',
        padding: 5,
        paddingLeft: 15,
        paddingRight: 15,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1 / FLEXBOX.pixel

    },
    headerLeg: {
        borderRadius: 3,
        borderWidth: 1 / FLEXBOX.pixel,
        borderColor: '#fa5e5b',
        padding: 2,


    },
    headerLegText: {
        fontSize: 10,
        color: '#fa5e5b'


    },
    headerText: {
        marginLeft: 10,
    }





});

