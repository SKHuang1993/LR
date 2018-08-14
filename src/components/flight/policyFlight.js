

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
 import { BaseComponent } from '../locale';
let lan = BaseComponent.getLocale();


export default class PolicyFlight extends Component {

    static defaultProps={
        data:{
            DepartureDate:11
        }
    }
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



    render() {
        //let flightType=this.props.flightType == domestic ? domesticRightInfo : null ;
        let flightData = this.props.data;
        return (
            <View activeOpacity={.7} style={styles.header}>
                <Flex justify="between" >
                    <Flex.Item style={styles.mainTrip}>
                        <Text style={[styles.time, styles.timeLeft]} >{flightData.DepartureDate.substring(11, 16)}</Text>
                        <View style={[styles.airportBox, styles.airportBoxLeft]} >
                            <Text numberOfLines={1} style={styles.airport} >{flightData.Departure.airportNameCn}</Text>
                            <Text style={styles.terminal} >{flightData.DepartureTerminal}</Text>
                        </View>
                    </Flex.Item>
                    <Flex.Item style={styles.mainStops}>
                        {flightData.StopQuantity > 0 ? <Text style={styles.stops}>{lan.flights_stopOver}{flightData.StopQuantity}{lan.flights_frequency}</Text> : null}
                        <View style={styles.toLine}></View>
                        <Text style={styles.stopsCity}>{flightData.StopAirport}</Text>
                    </Flex.Item>

                    <Flex.Item style={styles.mainTrip}>
                        <Text style={[styles.time, styles.timeRight]} >
                            {flightData.ArrivalDate.substring(11, 16)}<Text style={styles.nextDay}>{flightData.Days}</Text></Text>
                        <View style={[styles.airportBox, styles.airportBoxRight]} >
                            <Text numberOfLines={1} style={[styles.airport, styles.airpotRight]} >
                                {flightData.Arrival.airportNameCn}
                            </Text>
                            <Text style={styles.terminal} >
                                {flightData.ArrivalTerminal}
                                            </Text>
                        </View>
                    </Flex.Item>
                    {/*list 右边信息*/}
                    {this.domesticRightInfo(flightData)}
                </Flex>
                <View style={styles.info}>
                    <Image style={styles.airlineIco} source={{ uri: `http://airlineico.b0.upaiyun.com/${flightData.MarketingAirline}.png` }} />
                    <Text style={styles.infoText}>{flightData.MarketingAirlineName}{flightData.MarketingAirline}{flightData.FlightNumber}</Text>
                    <Text style={styles.infoText}> | </Text>
                    <Text style={styles.infoText}>{lan.aircraftType}{flightData.Equipment} </Text>
                    <Text style={styles.infoText}> | </Text>
                    <Icon icon={'0xe670'} style={styles.timeIcon} />
                    <Text style={styles.infoText}>{flightData.TotalFlightTime}</Text>
                </View>
            </View>


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
        paddingBottom: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1 / FLEXBOX.pixel

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
        justifyContent: 'flex-end'
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
    }





});

