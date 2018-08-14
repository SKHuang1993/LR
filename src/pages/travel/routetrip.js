import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ListView,
    TouchableOpacity,
    TouchableHighlight,
    Animated,
    ScrollView,
} from 'react-native';

import Flex from '../../components/flex';
import List from '../../components/list';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Icon from '../../components/icons/icon';
import Enumerable from 'linq';
import moment from 'moment';
import { observer } from 'mobx-react/native';

import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

@observer
export default class Routetrip extends React.Component {
    static defaultProps = {
        ticketType: 0
    };

    constructor(props) {
        super(props);
        this.state = {

        };
        //this.store = this.props.store;

    }
    render() {
        return (
            <View>
                {this.props.data && this.props.data.map((o, i) =>
                    this.planeTicketView(o, i))
                }
            </View>

        );
    }

    // 机票的参考流程
    planeTicketView = (o, i) => {
        let flightCOS = o.selectedCabin.FlightCOS || o.Segment.ClassAvail[0].Flight.FlightCOS;
        let miles = Enumerable.from(o.Segment.ClassAvail).sum(o => parseInt(o.Flight.Miles));
        let destinations = [];
        if (lan.lang == "ZH") {
            for (let i = 0; i < this.props.data.length; i++) {
                if (this.props.data[i].Departure.cityNameCn != destinations[destinations.length - 1])
                    destinations.push(this.props.data[i].Departure.cityNameCn);
                if (this.props.data[i].Arrival.cityNameCn != destinations[destinations.length - 1])
                    destinations.push(this.props.data[i].Arrival.cityNameCn);
            }
        } else {
            for (let i = 0; i < this.props.data.length; i++) {
                if (this.props.data[i].Departure.cityIataCode != destinations[destinations.length - 1])
                    destinations.push(this.props.data[i].Departure.cityIataCode);
                if (this.props.data[i].Arrival.cityIataCode != destinations[destinations.length - 1])
                    destinations.push(this.props.data[i].Arrival.cityIataCode);
            }
        }
        let CabinName = o.selectedCabin.CabinName;
        if (lan.lang == "EN") {
            let target = Enumerable.from(zh_CN).firstOrDefault(o => o.value == CabinName, null);
            if (target) CabinName = en_US[target.key] + " ";
        }
        return (
            <TouchableOpacity activeOpacity={1} style={styles.todoList} key={i}>
                <Flex justify="between" style={styles.cardTitle}  >
                    {this.props.ticketType == 0 ? <Text style={styles.cardTitle_left} >
                        <Icon icon={0xe660} color={'#696969'} style={styles.cardTitle_icon} />
                        &nbsp;{lan.lang == "ZH" ? o.Departure.cityNameCn : o.Departure.cityIataCode} - {lan.lang == "ZH" ? o.Arrival.cityNameCn : o.Arrival.cityIataCode}&nbsp;&nbsp;&nbsp;&nbsp;{moment(o.DepartureDate).format("YYYY.MM.DD")}
                    </Text> : i == 0 && <Text style={styles.cardTitle_left} >
                        <Icon icon={0xe660} color={'#696969'} style={styles.cardTitle_icon} />
                        &nbsp;{destinations.join('-')}{'\n'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{moment(o.DepartureDate).format("YYYY.MM.DD")}-{moment(this.props.data[this.props.data.length - 1].ArrivalDate).format("YYYY.MM.DD")}
                    </Text>}
                    {((this.props.ticketType != 0 && i == 0) || this.props.ticketType == 0) && <View style={{ flexDirection: "row" }}>
                        <Text style={styles.cardTitle_right}>￥{o.TotalPrice}</Text>
                        {this.props.allowDelete &&
                            <View>
                                <TouchableOpacity activeOpacity={0.6} style={{ padding: 10 }} onPress={() => {
                                    if (this.props.ticketType == 0)
                                        this.props.data.remove(o);
                                    else
                                        this.props.data.clear();
                                }}>
                                    <Icon icon={'0xe67c'} style={styles.delIcon} />
                                </TouchableOpacity>
                            </View>
                        }
                    </View>}
                </Flex>
                <View style={styles.card}>
                    {/*头部*/}
                    <View style={styles.card_hd}>
                        <Image style={styles.card_airline_img} source={{ uri: `http://airlineico.b0.upaiyun.com/${o.MarketingAirline}.png` }} />
                        <Text style={styles.card_hd_text}>
                            {lan.lang == "ZH" && o.MarketingAirlineName}{o.MarketingAirline}{o.FlightNumber} 丨 {lan.aircraftType} {o.Equipment}  丨 {CabinName}{flightCOS}
                        </Text>
                        {/*小圆*/}
                        <View style={[styles.card_circle, styles.card_circle_left]} ></View>
                        <View style={[styles.card_circle, styles.card_circle_right]} >
                        </View>
                    </View>
                    {/*内容*/}
                    <View style={styles.card_bd}>
                        <Flex justify="center" style={styles.card_bd_main}  >
                            <Flex.Item style={styles.card_bd_left}>
                                <Text style={[styles.card_bd_time, { textAlign: 'right' }]} >
                                    {o.DepartureDate.substring(11, 16)}
                                </Text>
                                <View style={[styles.card_bd_airportView, styles.card_bd_airportViewLeft]} >
                                    <Text numberOfLines={1} style={styles.card_bd_airport} >
                                        {lan.lang == "ZH" ? o.Departure.airportNameCn : o.Departure.cityIataCode}
                                    </Text>
                                    <Text style={styles.card_bd_terminal} >
                                        {o.DepartureTerminal}
                                    </Text>
                                </View>
                            </Flex.Item>
                            <Flex.Item style={styles.card_bd_center}>
                                <View style={styles.card_bd_line}>
                                    <View style={[styles.card_emptyCircle, styles.card_emptyCircle_left]}></View>
                                    <View style={[styles.card_emptyCircle, styles.card_emptyCircle_right]}></View>
                                </View>
                            </Flex.Item>
                            <Flex.Item style={styles.card_bd_right}>
                                <Text style={styles.card_bd_time} >
                                    {o.ArrivalDate.substring(11, 16)}
                                </Text>
                                <View style={[styles.card_bd_airportView]} >
                                    <Text numberOfLines={1} style={styles.card_bd_airport} >
                                        {lan.lang == "ZH" ? o.Arrival.airportNameCn : o.Arrival.cityIataCode}
                                    </Text>
                                    <Text style={styles.card_bd_terminal} >
                                        {o.ArrivalTerminal}
                                    </Text>
                                </View>
                            </Flex.Item>
                        </Flex>

                        <View style={styles.card_info}>
                            <Text style={styles.card_info_text}>{o.TotalFlightTime}</Text>
                            <Text style={styles.card_info_text}>{parseInt(miles * 1.609)}km</Text>
                            <Text style={styles.card_info_text}>{lan.passenger}{o.PassengerQty}{lan.people}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    // 火车票的参考流程
    trainTicketView = () => {
        return (
            <TouchableOpacity activeOpacity={0.8} style={styles.todoList} >
                <Flex justify="between" style={styles.cardTitle}  >
                    <Text style={styles.cardTitle_left} >
                        <Icon icon={0xe662} color={'#696969'} style={styles.cardTitle_icon} />
                        &nbsp;广州 - 重庆&nbsp;&nbsp;&nbsp;&nbsp;2017-02-12  22:55
                                </Text>
                    <Text style={styles.cardTitle_right}>¥900</Text>
                </Flex>
                <View style={styles.card}>
                    {/*内容*/}
                    <View style={styles.card_bd}>
                        <Flex justify="center" style={styles.card_bd_main}  >
                            <Flex.Item style={styles.card_bd_left}>
                                <Text numberOfLines={1} style={[styles.card_bd_railstation, { textAlign: 'right' }]} >
                                    广州南广州南
                                          </Text>
                                <View style={[styles.card_bd_railstation_time]} >
                                    <Text style={[styles.card_bd_railstation_timetxt, { textAlign: 'right' }]} >
                                        10:30
                                            </Text>
                                </View>
                            </Flex.Item>
                            <Flex.Item style={styles.card_bd_center}>
                                <View style={styles.card_bd_line}>
                                    <View style={[styles.card_emptyCircle, styles.card_emptyCircle_left]}></View>
                                    <View style={[styles.card_emptyCircle, styles.card_emptyCircle_right]}></View>
                                </View>
                            </Flex.Item>
                            <Flex.Item style={styles.card_bd_right}>
                                <Text numberOfLines={1} style={[styles.card_bd_railstation]} >
                                    株洲北
                                          </Text>
                                <View style={[styles.card_bd_railstation_time]} >
                                    <Text style={styles.card_bd_railstation_timetxt} >
                                        10:30
                                            </Text>
                                </View>
                            </Flex.Item>
                        </Flex>
                        <View style={styles.card_info}>
                            <Text style={styles.card_info_text}>K648</Text>
                            <Text style={styles.card_info_text}>二等座</Text>
                            <Text style={styles.card_info_text}>3h25m</Text>
                        </View>
                    </View>


                </View>
            </TouchableOpacity>
        );
    }

}
const styles = StyleSheet.create({
    todoList: { padding: 10, /*paddingTop: 20,*/ backgroundColor: '#e6eaf2', paddingBottom: 0, },
    cardTitle_right: { color: COLORS.price, alignSelf: "center" },
    cardTitle: { marginBottom: 5, },
    cardTitle_left: { color: '#666', fontSize: 14, },
    cardTitle_icon: { fontSize: 15, },
    card_airline_img: { width: 12, height: 12, alignSelf: 'center', marginRight: 2, },
    card_hd_text: { fontSize: 12, fontWeight: 'normal', },
    card: { backgroundColor: '#fff', borderRadius: 6, shadowColor: '#ccc', shadowOffset: { height: 0, width: 0 }, shadowRadius: 2, shadowOpacity: 0.8, },
    card_hd: { padding: 10, paddingTop: 8, flexDirection: 'row', borderBottomColor: '#ddd', borderBottomWidth: 1 / FLEXBOX.pixel },
    card_circle: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#e6eaf2', position: 'absolute', top: 26, },
    card_circle_left: { left: -7, },
    card_circle_right: { right: -8, },
    card_bd: { padding: 10, },
    card_bd_main: { paddingLeft: 10, paddingRight: 10, },
    card_bd_time: { fontSize: 22, color: '#333', },
    card_bd_airportView: { flexDirection: 'row', justifyContent: 'flex-start' },
    card_bd_airportViewLeft: { justifyContent: 'flex-end' },
    card_bd_airport: { fontSize: 12, color: '#666', },
    card_bd_terminal: { marginLeft: 2, fontSize: 12, color: '#666', },
    card_bd_left: { width: FLEXBOX.width * 0.35, },
    card_bd_right: { width: FLEXBOX.width * 0.35 },
    card_bd_center: { width: FLEXBOX.width * 0.2, alignItems: 'center', justifyContent: 'center', },
    // 火车票
    card_bd_railstation: { fontSize: 20 },
    card_bd_railstation_time: {},
    card_bd_railstation_timetxt: { fontSize: 18 },

    card_emptyCircle: { position: 'absolute', top: -6, width: 13, height: 13, borderRadius: 6.5, borderColor: '#666', borderWidth: 1 },
    card_emptyCircle_left: { left: -12, },
    card_emptyCircle_right: { right: -12, },
    card_bd_line: { height: 1, backgroundColor: '#666', width: 30, },
    card_info: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingLeft: 15, paddingRight: 15, },
    card_info_text: { color: '#999', fontSize: 12, },
});