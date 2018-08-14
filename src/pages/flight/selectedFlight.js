

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
import FormatPrice from '../../components/formatPrice/';
import Modal from '../../components/modal';
import Item from '../../components/flight/item';
const alert = Modal.alert;
import moment from 'moment';
import 'moment/locale/zh-cn';
const defaultDate = moment().locale('zh-cn').utcOffset(8);


export default class SelectedFlight extends Component {

    constructor(props) {
        super(props);
    }
    // 国内列表 右边信息

    domesticRightInfo(data) {
        return (
            <Flex.Item style={styles.mainRight}>
                {FormatPrice(data.Price, '', null, null, '起')}
                <Text style={styles.mainRigntTxt}>机建+燃油费</Text>
                <Text style={styles.mainRigntTxt}>&yen;50</Text>
            </Flex.Item>
        )
    }
    // 国际列表 右边信息
    intlRightInfo(data) {
        return (
            <Flex.Item style={styles.mainRight}>
                <Text style={styles.taxTitle}>全程含税价</Text>
                {FormatPrice(data.Price, '', null, null, '起')}
                <TouchableOpacity style={styles.policyHint} activeOpacity={1} onPress={() => alert('违反政策', '政策内容', [
                    { text: '确定', onPress: () => { } },
                ])}>
                    <Text style={styles.policyHint}>违反政策</Text>
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
        let data = this.props.data;
        return (
            <View>
                {/*头部*/}
                <Flex style={styles.header} >
                    <View style={styles.headerLeg}><Text style={styles.headerLegText}>{this.props.leg}</Text></View>
                    <Text style={styles.headerText}>
                        {moment(data.DepartureDate).format('MM.DD')}({moment(data.DepartureDate).format('ddd')})
                    </Text>
                    <Text style={styles.headerText}>
                        {moment(data.DepartureDate).format('HH:mm')}-{moment(data.ArrivalDate).format('HH:mm')}
                    </Text>
                    {/*<Text style={styles.titleTxt}>{data.MarketingAirlineName}{data.MarketingAirline}{data.FlightNumber}</Text>*/}
                    {/*返回*/}
                    {this.props.onBackPress ? <TouchableOpacity activeOpacity={.7} style={styles.reselect} onPress={this.props.onBackPress}>
                        <Icon icon={'0xe686'} style={styles.reselectText} />
                    </TouchableOpacity> : null}
                </Flex>
                <Item data={data} />
            </View>)

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

