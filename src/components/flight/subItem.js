import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    ListView,
    TouchableOpacity,
    Animated, Alert,
    Platform
} from 'react-native';

import { List, WhiteSpace, Picker, Popup } from 'antd-mobile';
import Flex from '../../components/flex';
import Modal from '../../components/modal';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import PolicyFlight from '../../pages/flight/policyFlight';
import '../../utils/date';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Item from './item';
import Enumerable from 'linq'
import FormatPrice from '../formatPrice';
import Domestic from '../../pages/flight/domestic';
import Booking from '../../pages/booking';
import { AccountInfo, PermissionInfo } from '../../utils/data-access/';
import { extendObservable } from 'mobx';

import { BaseComponent, en_US, zh_CN } from '../locale';
let lan = BaseComponent.getLocale();

const alert = Modal.alert;
export default class DomesticSubItem extends Component {
    constructor(props) {
        super(props);
    }

    //获取已选择航班
    getSelectedFlights = (obj, data) => {
        if (obj.selectedFlights) {
            obj.selectedFlights[obj.sequence] = data || this.props.rowData;
            return obj.selectedFlights;
        } else
            return [data || this.props.rowData];
    }

    jumpToNextStep = (data) => {
        let userInfo = AccountInfo.getUserInfo();
        //是否有违背差旅政策的航班预定权限
        let ViolateNoBooking_DomesticAir = PermissionInfo.hasPermission(userInfo.Permission.DataAccessPermissions, "ViolateNoBooking_DomesticAir");
        let cabinInfo = this.props.data;
        if (ViolateNoBooking_DomesticAir && cabinInfo.BreachPolicy) {
            alert('', lan.flights_notBookFlight, [
                { text: lan.confirm, onPress: () => { } },
            ])
            return;
        }
        let obj = this.props.store.passProps;
        if (obj.sequence + 1 >= obj.param.departureDates.length && this.props.routetrip && this.props.routetrip.referenceTrips) {
            let flights = this.getSelectedFlights(obj, data);
            Enumerable.from(flights).doAction(o => extendObservable(o, { PassengerQty: obj.employee.length })).toArray();
            let trips = this.props.routetrip.referenceTrips.slice().concat(flights);
            this.props.routetrip.referenceTrips = trips;
            this.props.routetrip.ticketType = obj.param.ticketType;
            let currentRouteStack = obj.navigator.getCurrentRoutes();
            obj.navigator.jumpTo(currentRouteStack[currentRouteStack.length - obj.sequence - 3]);
        } else {
            obj.navigator.push({
                component: obj.sequence + 1 < obj.param.departureDates.length ? Domestic : Booking,
                title: lan.flights_flight_title,
                passProps: {
                    sequence: obj.sequence + 1,
                    param: obj.param,
                    employee: obj.employee,
                    routetrip: this.props.routetrip,
                    toChange: this.props.toChange,
                    info: this.props.info,
                    orderDetail: this.props.orderDetail,
                    selectedFlights: this.getSelectedFlights(obj, data)
                }
            })
        }
    }

    render() {
        let cabinInfo = this.props.data;
        let breachPolicy;
        let rowData = this.props.rowData;
        if (cabinInfo.BreachPolicy) {
            breachPolicy = Enumerable.from(cabinInfo.BreachPolicy).select('$.Text').toArray().join('\n');
        }
        let seats = cabinInfo.Seats == "A" ? 9 : cabinInfo.Seats == "C" ? 0 : cabinInfo.Seats;
        //判断协议航司
        let agreementAirline = cabinInfo.BigCustomerCode != null && cabinInfo.BigCustomerCode != "";
        let CabinName = cabinInfo.CabinName;
        if (lan.lang == "EN") {
            let target = Enumerable.from(zh_CN).firstOrDefault(o => o.value == CabinName, null);
            if (target) CabinName = en_US[target.key] + " ";
        }
        return (
            <View>
                {/*  余票为0的该航班不显示*/}
                {seats != 0 ?
                    <Flex wrap='wrap' justify='between' style={styles.container}>
                        <View style={[styles.cabin, { flex: .2 }]}>
                            <Text style={styles.cabinTxt}>{CabinName}{cabinInfo.FlightCOS}</Text>
                            {!cabinInfo.IsConformPolicy ?
                                <TouchableOpacity activeOpacity={.7} style={styles.policy} onPress={
                                    () => alert(lan.flights_violatePolicy, breachPolicy, [
                                        { text: lan.confirm, onPress: () => { } },
                                    ])
                                }>
                                    <Text style={styles.policyTxt}>{lan.flights_violatePolicy}</Text>
                                </TouchableOpacity>
                                : null}
                        </View>
                        {cabinInfo.DiscountRate ?
                            <View style={{ flex: .1 }}>
                                <Text>{cabinInfo.DiscountRate < 10 ? cabinInfo.DiscountRate + lan.flights_discount : lan.flights_fullPrice}</Text>
                            </View> : null}
                        <TouchableOpacity style={[styles.rebook, { flex: .13 }]} onPress={
                            () => alert(lan.flights_ticketChangesBack, cabinInfo.Rule, [
                                { text: lan.confirm, onPress: () => { } },
                            ])
                        }>
                            <Text style={styles.rebookTxt}>{lan.flights_ticketChangesBack}</Text>
                        </TouchableOpacity>

                        <View >
                            <Text style={[styles.remainTxt, seats <= 2 ? { color: COLORS.secondary } : null]}>{lan.flights_surplus}{seats}{lan.flights_ticketNumber}</Text>
                        </View>

                        <TouchableOpacity activeOpacity={.7} style={[styles.button, { flex: .25 }]} onPress={() => {
                            let obj = this.props.store.passProps;
                            {/*if (!cabinInfo.IsConformPolicy && (obj.param.BTANr || this.props.routetrip)) {
                                Alert.alert("该航班不能进行预订");
                                return;
                            }*/}
                            rowData.selectedCabin = cabinInfo;
                            let timeLowTicket = Enumerable.from(this.props.store.breachPolicy).firstOrDefault(o => o.SysKey == 'TimeLowTicket', -1);
                            if (timeLowTicket != -1) {
                                let flight = this.props.store.getTimeLowTicket(rowData, parseInt(timeLowTicket.Value));
                                if (flight.length > 0 && obj.param.isPrivate == 0) {
                                    Popup.show(<PolicyFlight
                                        timeLowTicket={timeLowTicket.Value}
                                        data={flight} onClose={() => Popup.hide()} next={() => {
                                            if (rowData.selectedCabin.BreachPolicy)
                                                rowData.selectedCabin.BreachPolicy.push(timeLowTicket);
                                            else
                                                rowData.selectedCabin.BreachPolicy = [timeLowTicket];
                                            this.jumpToNextStep()
                                        }} onItemClick={(data) => {
                                            Popup.hide();
                                            this.jumpToNextStep(data);
                                        }} />, {
                                            maskClosable: true,
                                            animationType: 'slide-up',
                                            onMaskClose: () => { },
                                        })
                                    return;
                                }
                            }
                            this.jumpToNextStep();
                        }}>
                            {agreementAirline ? <View style={[styles.xie,]} >
                                <Text style={styles.xieTxt}>{lan.flights_xie}</Text>
                            </View> : null}
                            {FormatPrice(cabinInfo.Price)}
                            <Icon icon={'0xe677'} style={styles.arrowRight} />
                        </TouchableOpacity>
                    </Flex>
                    : null}
            </View>

        )

    }


}






const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 13,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#fff',
        borderRadius: 3,
        // borderBottomColor: '#ddd',
        // borderBottomWidth: 1 / FLEXBOX.pixel,
        marginBottom: 5,

    },
    button: {
        flexDirection: 'row',
        alignItems: 'flex-end',

        justifyContent: 'flex-end',
    },
    remainTxt: {
        color: '#999'
    },
    cabin: {

    },
    cabinTxt: {
        fontSize: 14,

    },
    policy: {

        //   borderBottomColor: '#42a6da',
        //  borderBottomWidth: 1 / FLEXBOX.pixel,

    },


    policyTxt: {
        fontSize: 11,
        color: COLORS.secondary,
        textDecorationLine: 'underline',

    },
    arrowRight: {
        color: COLORS.secondary,

        transform: Platform.OS === 'android' ? [{ translateY: -3 },] : [{ translateY: 0 },],
    },
    xie: {
        borderWidth: 1 / FLEXBOX.pixel,
        borderRadius: 2,
        borderColor: COLORS.secondary,
        padding: 1,
        marginLeft: 2


    },
    xieTxt: {
        color: COLORS.secondary,
    },
    rebook: {

    },
    rebookTxt: {
        color: '#42a6da',
        textDecorationLine: 'underline',
    }


});