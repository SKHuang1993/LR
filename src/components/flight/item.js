

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
import Enumerable from 'linq';
import Modal from '../../components/modal';
import { observer } from 'mobx-react/native'
import moment from 'moment';
const alert = Modal.alert;
import { BaseComponent, zh_CN, en_US } from '../locale';
let lan = BaseComponent.getLocale();
@observer
export default class DomesticList extends Component {
    constructor(props) {
        super(props);
    }
    // 国内列表 右边信息

    domesticRightInfo(data) {
        return (
            <Flex.Item style={styles.mainRight}>
                {FormatPrice(data.Price, '', null, null, lan.flights_priceUp)}
                <Text style={styles.mainRigntTxt}>{lan.flights_enginePlusFuel}</Text>
                <Text style={styles.mainRigntTxt}>&yen;50</Text>
            </Flex.Item>
        )
    }
    // 国际列表 右边信息
    intlRightInfo(data, includingTax, hidePrice) {
        let info = Enumerable.from(data.BerthList).firstOrDefault(null);
        let breachPolicy;
        if (info && info.BreachPolicy) {
            breachPolicy = Enumerable.from(info.BreachPolicy).select('$.Text').toArray().join('\n');
        }
        return (!hidePrice ?
            <Flex.Item style={styles.mainRight}>
                {includingTax ? <Text style={styles.taxTitle}>{lan.flights_fullPriceincludingTax}</Text> : null}
                {/*国际协议标示*/}
                <Flex>
                    {data.BerthList[0].BigCustomerCode && data.BerthList[0].BigCustomerCode.length > 0 ?
                        <View style={styles.xie}><Text style={styles.xieText}>{lan.flights_xie}</Text></View> : null}
                    {FormatPrice(includingTax ? data.TotalPrice : data.Price, '', null, null)}
                </Flex>
                {!includingTax ? <Text style={styles.taxTitle}>{lan.flights_taxation}￥{data.Tax}</Text> : null}
                {info && !info.IsConformPolicy ?
                    <TouchableOpacity activeOpacity={1} onPress={() => alert(lan.flights_violatePolicy, breachPolicy, [
                        { text: lan.confirm, onPress: () => { } },
                    ])}>
                        <Text style={styles.policyHint}>{lan.flights_violatePolicy}</Text>
                    </TouchableOpacity> : null}
            </Flex.Item> : null
        )
    }

    getCabinName = (CabinName) => {
        if (lan.lang == "EN") {
            let target = Enumerable.from(zh_CN).firstOrDefault(o => o.value == CabinName, null);
            if (target) return en_US[target.key] + " ";
        }
    }

    render() {
        let flightType = this.props.flightType ? this.props.flightType : "domestic";
        let flightData = this.props.data;
        let transit = Enumerable.from(flightData.Segment.ClassAvail.slice(0, flightData.Segment.ClassAvail.length - 1)).select("$.Flight").select("$.ArrivalInfo").select("$.cityNameCn").toArray();
        if (lan.lang == "EN") transit = Enumerable.from(flightData.Segment.ClassAvail.slice(0, flightData.Segment.ClassAvail.length - 1)).select("$.Flight").select("$.ArrivalInfo").select("$.cityIataCode").toArray();
        let shareAirline = Enumerable.from(flightData.Segment.ClassAvail).select("$.Flight").count(o => o.OperatingAirline && o.OperatingAirline != o.MarketingAirline) > 0;
        let days = moment(moment(flightData.ArrivalDate).format("YYYY-MM-DD")).diff(moment((flightData.DepartureDate)).format("YYYY-MM-DD"), 'days');
        days = days > 0 ? "+" + days : null;
        //字体长度
        getBLen = function (str) {
            if (str == null) return 0;
            if (typeof str != "string") {
                str += "";
            }
            return str.replace(/[^\x00-\xff]/g, "01").length;
        }
        return (
            <TouchableOpacity activeOpacity={.7} style={styles.header} disabled={this.props.onItemClick ? false : true} onPress={() => {
                if (this.props.onItemClick)
                    this.props.onItemClick();
            }}>
                <Flex justify="between" >
                    <Flex.Item style={styles.mainTrip}>
                        <Text style={[styles.time, styles.timeLeft]} >{flightData.DepartureDate.substring(11, 16)}</Text>
                        <View style={[styles.airportBox, styles.airportBoxLeft]} >
                            <Text numberOfLines={getBLen(lan.lang == "ZH" ? flightData.Departure.airportNameCn : flightData.Departure.airportCode) > 9 ? 1 : 0} style={[styles.airport, getBLen(lan.lang == "ZH" ? flightData.Departure.airportNameCn : flightData.Departure.airportCode) < 9 ? { flex: 0 } : null]} >
                                {lan.lang == "ZH" ? flightData.Departure.airportNameCn : flightData.Departure.airportCode}
                            </Text>
                            <Text style={styles.terminal} >{flightData.DepartureTerminal}</Text>
                        </View>
                    </Flex.Item>
                    <Flex.Item style={styles.mainStops}>
                        {flightData.StopQuantity > 0 ? <Text style={styles.stops}>{lan.flights_stopOver}{flightData.StopQuantity}{lan.flights_frequency}</Text> :
                            flightData.Segment.ClassAvail.length > 1 ? <Text style={styles.stops}>{lan.flights_turn}{flightData.Segment.ClassAvail.length - 1}{lan.flights_frequency}</Text> : null}
                        <View style={styles.toLine}><Icon icon={'0xe69d'} style={styles.toLineIcon} /></View>
                        <Text style={styles.stopsCity}>{transit.join('、')}</Text>
                    </Flex.Item>

                    <Flex.Item style={styles.mainTrip}>
                        <Text style={[styles.time, styles.timeRight]} >
                            {flightData.ArrivalDate.substring(11, 16)}<Text style={styles.nextDay}>{days}</Text></Text>
                        <View style={[styles.airportBox, styles.airportBoxRight]} >
                            <Text numberOfLines={getBLen(lan.lang == "ZH" ? flightData.Arrival.airportNameCn : flightData.Arrival.airportCode) > 9 ? 1 : 0} style={[styles.airport, styles.airpotRight, getBLen(lan.lang == "ZH" ? flightData.Arrival.airportNameCn : flightData.Arrival.airportCode) < 9 ? { flex: 0 } : null,]} >
                                {lan.lang == "ZH" ? flightData.Arrival.airportNameCn : flightData.Arrival.airportCode}
                            </Text>
                            <Text style={styles.terminal} >
                                {flightData.ArrivalTerminal}
                            </Text>
                        </View>
                    </Flex.Item>
                    {/*list 右边信息*/}
                    {flightType == "domestic" ? this.domesticRightInfo(flightData) : this.intlRightInfo(flightData, this.props.includingTax(), this.props.hidePrice)}
                </Flex>
                <View style={styles.info}>
                    <View style={[FLEXBOX.flexStart]}>
                        <Image style={styles.airlineIco} source={{ uri: `http://airlineico.b0.upaiyun.com/${flightData.MarketingAirline}.png` }} />
                        <Text style={styles.infoText}>{lan.lang != "EN" && flightData.MarketingAirlineName}{flightData.MarketingAirline}{flightData.FlightNumber}</Text>
                        <Text style={styles.infoText}> | </Text>
                        <Text style={styles.infoText}>{lan.aircraftType}{flightData.Equipment} </Text>
                        <Text style={styles.infoText}> | </Text>
                        <Icon icon={'0xe670'} style={styles.timeIcon} />
                        <Text style={styles.infoText}>{flightData.TotalFlightTime}</Text>
                        {/*舱位*/}
                        {flightData.CabinName ? <Text style={styles.infoText}> | {this.getCabinName(flightData.CabinName)}</Text> : null}
                        {flightData.DiscountRate ? <Text style={styles.infoText}> | {flightData.DiscountRate}{lan.flights_discount} </Text> : null}
                        {flightType != "domestic" && shareAirline ? <Text style={[styles.infoText, { color: COLORS.link }]}><Text style={[styles.infoText]}> | </Text>{lan.flights_share}</Text> : null}
                    </View>
                    {/* 供应商 */}
                    <Text style={styles.suppliers}>{flightData.AgencyCode}</Text>
                </View>
            </TouchableOpacity>


        )

    }


}




const styles = StyleSheet.create({
    container: {
        flex: 1,

    },


    airlineIco: {
        width: 12,
        height: 12,
        alignSelf: 'center',
        marginRight: 2,
    },

    header: {
        backgroundColor: '#fff',
        paddingTop: 10,
        marginBottom: 5,
        paddingBottom: 10,
        // borderBottomColor: '#ddd',
        // borderBottomWidth: 1 / FLEXBOX.pixel

    },

    time: {
        fontSize: 26,
        color: '#333'

    },
    timeLeft: {

        textAlign: 'left',
        paddingLeft: 10,
    },
    airportBox: {
        flexDirection: 'row',
        justifyContent: 'flex-start',

    },
    airportBoxLeft: {
        paddingLeft: 10,
        justifyContent: 'flex-end'
    },
    airport: {
        fontSize: 12,
        color: '#666',
        flex: .8,
        // width: FLEXBOX.width * 0.17,
        justifyContent: 'flex-end',
        //textAlign: 'right',
        // backgroundColor:'blue'
    },
    airpotRight: {
        textAlign: 'left',
        paddingRight: 10,
    },
    terminal: {
        marginLeft: 0,
        fontSize: 12,
        color: '#666',
        flex: .2
        // backgroundColor:'red'

    },
    mainTrip: {
        // width: FLEXBOX.width * 0.2,

        flex: .28,
        // backgroundColor:'red'



    },
    mainRight: {
        //width: FLEXBOX.width * 0.35,
        flex: .22,
        alignItems: 'flex-end',
        marginRight: 10,
        transform: [{ translateY: 5 }]
    },
    mainStops: {
        //width: FLEXBOX.width * 0.15,
        flex: .20,
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
        paddingLeft: 10,
        paddingRight: 10,
    },
    infoText: {
        color: '#999',
        fontSize: 12,
    },
    suppliers: {
        color: COLORS.secondary,
    },
    timeIcon: {
        fontSize: 12,
        color: '#999',
        marginRight: 1,
        marginLeft: 2,
    },
    mainRigntTxt: {
        fontSize: 10, color: '#999'
    },
    toLine: {
        width: FLEXBOX.width * 0.15,
        height: 5,
        borderBottomWidth: 2 / FLEXBOX.pixel,
        borderBottomColor: '#7a7a7a'
        // backgroundColor: '#ccc'
    },
    toLineIcon: {
        position: 'absolute',
        bottom: -3 / FLEXBOX.pixel,
        right: -1,
        fontSize: 5,
        color: '#7a7a7a'
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
    xie: {
        borderWidth: 1 / FLEXBOX.pixel,
        borderColor: COLORS.secondary,
        borderRadius: 2,
        padding: 1,
        transform: [{ translateY: 1 }]
    },
    xieText: {
        color: COLORS.secondary,
        fontSize: 10,
    }





});

