import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ListView,
    TouchableOpacity,
    TouchableHighlight,
    Animated, InteractionManager, Alert
} from 'react-native';

import { List, WhiteSpace, Picker, Popup } from 'antd-mobile';
import Flex from '../../components/flex';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import '../../utils/date';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Item from './item';
import SubItem from './intlDetail';
import Enumerable from 'linq';
import moment from 'moment';
import Modal from '../../components/modal';
import SelectedFlight from '../../pages/flight/selectedFlight'
import Accordion from 'react-native-collapsible/Accordion';
import Co from '../../pages/demo/collapsible'
import { observer } from 'mobx-react/native'
import Intl from '../../pages/flight/intl';
import Booking from '../../pages/booking';
import PolicyFlight from '../../pages/flight/policyFlight';
import { extendObservable } from 'mobx';
import { AccountInfo, PermissionInfo } from '../../utils/data-access/';
const alert = Modal.alert;
import { BaseComponent } from '../locale';
let lan = BaseComponent.getLocale();
@observer
export default class FlightList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            expanded: true,
            animation: new Animated.Value()
        }
    }

    //已选航班
    getFlightSelection = () => {
        let selectedFlights = this.props.selectedFlights;
        let sequence = this.props.store.passProps.sequence;
        let isEmpty = this.props.store.isFinish && this.props.store.filterData.length == 0;
        if (isEmpty) return null;
        if (selectedFlights && selectedFlights.length > 0) {
            let flight = [];
            for (let position in selectedFlights.slice(0, sequence)) {
                let obj = Object.assign({}, selectedFlights[position], selectedFlights[position].selectedCabin);
                flight.push(
                    <View key={position} >
                        <Flex style={styles.header} >
                            <View style={styles.headerLeg}><Text style={styles.headerLegText}>{this.props.store.getLegTip(parseInt(position))}</Text></View>
                            <Text style={styles.headerText}>
                                {moment(obj.DepartureDate).format('MM.DD')}({moment(obj.DepartureDate).format('ddd')})
                    </Text>
                            <Text style={styles.headerText}>
                                {moment(obj.DepartureDate).format('HH:mm')}-{moment(obj.ArrivalDate).format('HH:mm')}
                            </Text>
                            <TouchableOpacity activeOpacity={.7} style={styles.reselect} onPress={() => {
                                let currentRouteStack = this.props.store.passProps.navigator.getCurrentRoutes();
                                this.props.store.passProps.navigator.jumpTo(currentRouteStack[currentRouteStack.length - 1 - (this.props.store.passProps.param.departures.length - position - 1)]);
                            }}>
                                <Icon icon={'0xe686'} style={styles.reselectText} />
                            </TouchableOpacity>
                        </Flex>
                        <AccordionItem rowData={obj} store={this.props.store} hidePrice={true} disabled={true} />
                    </View >)
            }
            return <View style={{ paddingBottom: 6 }}>
                {flight}
                {sequence > 0 ? <View style={{ marginTop: 10 }}><Text style={{ textAlign: 'center', color: '#999', fontSize: 13 }}>{lan.flights_selectHint} {this.props.store.getLegTip(sequence)}</Text></View> : null}
            </View>;
        }
    }


    _renderRow(rowData: string, sectionID: number, rowID: number, highlightRow: (sectionID: number, rowID: number) => void) {
        return <AccordionItem rowData={rowData} orderDetail={this.props.orderDetail} toChange={this.props.toChange} store={this.props.store} routetrip={this.props.routetrip} info={this.props.info} />

    }

    render() {
        return (
            <View style={styles.container} >
                <ListView
                    ref="ListView"
                    initialListSize={8}
                    enableEmptySections={true}
                    dataSource={this.props.store.getDataSource}
                    renderRow={this._renderRow.bind(this)}
                    renderHeader={() =>
                        this.getFlightSelection()
                    }
                />
            </View>
        )

    }


}

@observer
class AccordionItem extends Component {

    getSelectedFlights = (obj, data) => {
        if (obj.selectedFlights) {
            obj.selectedFlights[obj.sequence] = data || this.props.rowData;
            return obj.selectedFlights;
        } else
            return [data || this.props.rowData];
    }

    jumpToNextStep = async (data) => {
        let userInfo = AccountInfo.getUserInfo();
        //是否有违背差旅政策的航班预定权限
        let ViolateNoBooking_IntlAir = PermissionInfo.hasPermission(userInfo.Permission.DataAccessPermissions, "ViolateNoBooking_IntlAir");
        let cabinInfo = this.props.rowData.selectedCabin;
        if (ViolateNoBooking_IntlAir && cabinInfo.BreachPolicy) {
            alert('', lan.flights_notBookFlight, [
                { text: lan.confirm, onPress: () => { } },
            ])
            return;
        }

        let obj = this.props.store.passProps;
        if (obj.sequence + 1 >= obj.param.departureDates.length) {
            if (this.props.routetrip && this.props.routetrip.referenceTrips) {
                let flights = this.getSelectedFlights(obj, data);
                Enumerable.from(flights).doAction(o => extendObservable(o, { PassengerQty: obj.employee.length })).toArray();
                let trips = this.props.routetrip.referenceTrips.slice().concat(flights);
                this.props.routetrip.referenceTrips = trips;
                this.props.routetrip.ticketType = obj.param.ticketType;
                let currentRouteStack = obj.navigator.getCurrentRoutes();
                obj.navigator.jumpTo(currentRouteStack[currentRouteStack.length - obj.sequence - 3]);
                return;
            }
            this.props.store.isFinish = false;
            this.props.store.indicatorMessage = "正在验价...";
            let flights = await this.props.store.verifyPrice([21], this.getSelectedFlights(obj, data));
            let sum = 0;
            if (flights) {
                for (let flight of flights) {
                    for (let classAvail of flight.Segment.ClassAvail) {
                        if (classAvail.Flight.Seats == 0) sum += 1;
                    }
                }
            }
            this.props.store.isFinish = true;
            if (sum == 0 && flights)
                this.pushScene(data, flights);
            else {
                let msg = lan.flights_flightNotSeat;
                if (sum > 0) {
                    msg = lan.flights_flightNotPartSeat;
                }
                Alert.alert('', msg, [
                    {
                        text: lan.flights_reFlight, onPress: () => {
                            let currentRouteStack = this.props.store.passProps.navigator.getCurrentRoutes();
                            this.props.store.passProps.navigator.jumpTo(currentRouteStack[currentRouteStack.length - 1 - (this.props.store.passProps.sequence)]);
                        }
                    },
                    {
                        text: lan.flights_bookAlternateOrder, onPress: () => {
                            this.pushScene(data, flights);
                        }
                    }
                ])

            }
        } else
            this.pushScene(data);

    }

    pushScene = (data, flights) => {
        let obj = this.props.store.passProps;
        let Key = data ? data.Key : this.props.rowData.Key;
        obj.navigator.push({
            component: obj.sequence + 1 < obj.param.departureDates.length ? Intl : Booking,
            title: lan.flights_flight_title,
            passProps: {
                toChange: this.props.toChange,
                orderDetail: this.props.orderDetail,
                routetrip: this.props.routetrip,
                info: this.props.info,
                sequence: obj.sequence + 1,
                param: obj.param,
                employee: obj.employee,
                flights: Enumerable.from(this.props.store.airSummaries[Key]).doAction((o) => o.Segment._ClassAvail = []).toArray(),
                airSummaries: this.props.store.airSummaries,
                selectedFlights: flights || this.getSelectedFlights(obj, data)
            }
        })
    }

    _setSection(section) {
        if (this.props.rowData.Segment._ClassAvail.length == 0)
            this.props.rowData.Segment._ClassAvail = this.props.rowData.Segment.ClassAvail;
        else
            InteractionManager.runAfterInteractions(() =>
                this.props.rowData.Segment._ClassAvail = [])
    }

    _renderHeader(section, i, isActive) {
        return (
            <View><Item data={this.rowData} hidePrice={this.hidePrice} flightType="intl" includingTax={() => this.store.includingTax} /></View>
        );
    }

    _renderContent(section, i, isActive) {
        return (
            <SubItem
                data={Enumerable.from(this.rowData.Segment._ClassAvail).select('$.Flight').toArray()}
                rowData={this.rowData}
                store={this.store}
                disabled={this.disabled}
                onItemClick={() => {
                    this.rowData.selectedCabin = this.rowData.BerthList[0];
                    let obj = this.store.passProps;
                    let timeLowTicket = Enumerable.from(this.store.breachPolicy).firstOrDefault(o => o.SysKey == 'TimeLowTicket', -1);
                    if (timeLowTicket != -1) {
                        let flight = this.store.getTimeLowTicket(this.rowData, parseInt(timeLowTicket.Value));
                        if (flight.length > 0 && obj.param.isPrivate == 0) {
                            Popup.show(<PolicyFlight
                                timeLowTicket={timeLowTicket.Value}
                                data={flight} onClose={() => Popup.hide()} next={() => {
                                    if (this.rowData.selectedCabin.BreachPolicy)
                                        this.rowData.selectedCabin.BreachPolicy.push(timeLowTicket);
                                    else
                                        this.rowData.selectedCabin.BreachPolicy = [timeLowTicket];
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
                }} />
        );
    }

    render() {
        return (
            <View style={styles.container}>

                <Accordion
                    sections={[{}]}
                    renderHeader={this._renderHeader}
                    renderContent={this._renderContent}
                    duration={400}
                    rowData={this.props.rowData}
                    onChange={this._setSection.bind(this)}
                    underlayColor={'rgba(255,255,255,.8)'}
                    store={this.props.store}
                    hidePrice={this.props.hidePrice}
                    disabled={this.props.disabled}
                    jumpToNextStep={(data) => this.jumpToNextStep(data)}
                />

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

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
    },
    subItem: {
        padding: 5,
    }



});