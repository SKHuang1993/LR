import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
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
    Animated, TextInput, Alert
} from 'react-native';

import { WhiteSpace, Popup } from 'antd-mobile';
import ActivityIndicator from '../../components/activity-indicator';
import Flex from '../../components/flex';
import List from '../../components/list';
import TextareaItem from '../../components/textarea-item';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../../components/button';
import DomesticFlight from '../../stores/flight/domestic'
import Accordion from 'react-native-collapsible/Accordion';
import { observer } from 'mobx-react/native';
import ToolBar from '../../components/toolBar/';
import FlightList from '../../components/booking/flightList';
import FlightInfo from '../../components/booking/flightInfo';
import FormatPrice from '../../components/formatPrice';
import Enumerable from 'linq';
import InputItem from '../../components/input-item'
import PriceBar from '../../components/price-bar';
import Form from '../../components/form/';
import Modal from '../../components/modal';
import Picker from '../../components/picker';
import PassgerList from './passagerList';
import PassgerEdit from './passagerEdit';
import EmployeeEdit from './employeeEdit';
import InSure from './inSure';
import Visa from './visa';
import Booking from '../../stores/booking/';
import Confirm from './';
import Checkbox from '../../components/checkbox/';
import OrderSubmit from './orderSubmit';
import CostCenter from './costCenter';
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { CertificateInfo, AccountInfo, CabinInfo, PermissionInfo } from '../../utils/data-access/';
import Radio from '../../components/radio/';
import BookingPassager from './bookingPassager';
const Item = List.Item;
const Brief = Item.Brief;
const RadioItem = Radio.RadioItem;

const alert = Modal.alert;
@observer
export default class Index extends Component {
    @observable store;
    constructor(props) {
        super(props);
        this.store = new Booking(props);
        this.store.userInfo = AccountInfo.getUserInfo();
        this.store.booking.BookerID = this.store.userInfo.Account;
        this.store.booking.StaffCode = this.store.userInfo.Account;
        this.store.booking.UserCode = this.store.userInfo.Account;
        this.store.booking.BookerName = this.store.userInfo.EmpName;
        if (props.param.BTANr)
            this.store.booking.SalesOrderRawData.CustomerSONr = props.param.BTANr.BTANr;

        if (this.props.employee && this.props.employee.length > 0) {
            let booker = this.props.employee[0];
            this.store.booker = {
                UserCode: booker.UserCode,
                checked: false,
                Name: booker.Name,
                Phone: booker.Phone,
                Email: booker.Email
            }
            this.store.booking.ContactPerson = booker.Name;
            this.store.booking.ContactMobile = booker.Phone;
            this.store.booking.ContactEmail = booker.Email;
        }
        this.store.info.PaymentMethodID = 5;
        let readonly = props.store ? true : false;
        this.getField = new Form(readonly).getField;

        if (!this.props.toChange)
            this.store.setEmployeeList([]);
        else
            this.store.initEmployeeList([]);

        this.store.setCertificateName();
        this.store.costGetList(props.info);
        this.store.getTravelReasonList(props.info);
        this.store.getPolicyReasonList();
        this.store.getLedgerAccountCash();
        this.store.setTicketDetail(this.props.selectedFlights);
    }

    componentDidMount() {
        if (this.props.store)
            this.store = this.props.store;
    }

    //航节提示
    getLeg = (position) => {
        if (this.props.param) {
            if (this.props.param.departureDates.length <= 2) {
                return position == 0 ? lan.booking_go : lan.booking_return;
            }
            else {
                return position + 1;
            }
        }
    }

    getLegTip = (position) => {
        if (this.props.param.departureDates.length <= 2) {
            return position == 0 ? lan.booking_trip : lan.booking_return_trip;
        }
        else {
            return lan.booking_no + (position + 1) + lan.booking_cheng;
        }
    }

    //航班信息
    getFlightInfo = (leg, info) => {
        return {
            //标题
            title: {
                leg: leg,
                date: info.DepartureDate,
                city: lan.lang == "ZH" ? `${info.Departure.cityNameCn} - ${info.Arrival.cityNameCn}` : `${info.Departure.cityIataCode} - ${info.Arrival.cityIataCode}`,
                agencyCode: info.AgencyCode
            },
            //列表
            list: Enumerable.from(info.Segment.ClassAvail).select('$.Flight').toArray()
        }
    }

    //舱位信息(国内)
    getCabinInfo = (info, flightInfo) => {
        return {
            CabinName: info.CabinName,
            DiscountRate: info.DiscountRate,
            Price: info.Price,
            ExtraPrice: `${lan.flights_enginePlusFuel}:￥50`
        }
    }

    //舱位信息(国际)
    getInlCabinInfo = (info, flightInfo) => {
        return {
            CabinName: info.CabinName,
            DiscountRate: info.DiscountRate,
            Price: flightInfo.TotalPrice,
            ExtraPrice: `${lan.booking_ticket_price}￥${flightInfo.Price} ${lan.booking_taxation}￥${flightInfo.Tax}`
        }
    }

    render() {
        let ticket = this.props.orderDetail ? this.props.orderDetail.Trade.Orders[0].Ticket : null;
        let flight = this.props.orderDetail ? this.props.orderDetail.Trade.Orders[0].Ticket.Segments[0].Flights[0] : null;
        let flightInfo = flight ? this.store.setFlightInfo(flight) : null;
        let ticketType = this.props.param.ticketType;
        let flightList = this.props.selectedFlights;
        let isPublic = !this.props.param.isPrivate;
        let booking = this.store.booking;
        let info = this.store.info;
        let isBreachPolicy = Enumerable.from(flightList).count(o => o.selectedCabin.BreachPolicy) > 0;
        let policies = Enumerable.from(flightList).select(o => toJS(o.selectedCabin.BreachPolicy)).toArray();
        let arr = [];
        for (let index in policies) {
            if (policies[index])
                arr.push(this.getLegTip(parseInt(index)) + "\n" + Enumerable.from(policies[index]).distinct(o => o.Id).select(o => o.Text).toArray().join('\n'));
        }
        let policyDetail = arr.join('\n\n');
        info.ContrContent = policyDetail;
        info.IsContrPolicy = isBreachPolicy;
        return (
            <View style={styles.container}>
                <NavBar title={this.props.toChange ? "改签" : this.props.store ? lan.booking_confirmation_data : lan.booking_fill_in_information} navigator={this.props.navigator} />
                <ScrollView>
                    <Form ref="form">
                        {/*结算方式*/}
                        {this.props.store || this.props.toChange ?
                            <View style={styles.clearingForm}>
                                <RadioItem checked={info.PaymentMethodID == 5} onChange={(event) => {
                                    info.PaymentMethodID = 5;
                                }}>{lan.booking_monthly} <Text style={styles.clearingFormTxt}>{lan.booking_enterprise_quota_surplus}：￥{this.store.availableBalance}</Text></RadioItem>
                            </View> : null}
                        {/*机票信息*/}
                        <View style={[styles.flights]}>
                            {flightList.map((o, i) =>
                                <View key={i} style={styles.flightList}>
                                    <FlightList data={this.getFlightInfo(this.getLeg(i), o)} arrow={this.props.store ? false : true} onBackPress={() => {
                                        let currentRouteStack = this.props.navigator.getCurrentRoutes();
                                        this.props.navigator.jumpTo(currentRouteStack[currentRouteStack.length - 1 - (flightList.length - i)]);
                                    }} />
                                    {ticketType == 0 ? <FlightInfo data={this.getCabinInfo(o.selectedCabin, o)} endorseText={o.selectedCabin.Rule} /> : null}
                                </View>)}
                        </View>
                        {ticketType != 0 ? (flight = flightList[flightList.length - 1],
                            <View style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 15, paddingBottom: 5, backgroundColor: "#fff", marginBottom: 10 }}>
                                <FlightInfo data={this.getInlCabinInfo(flight.selectedCabin, flight)} endorseText={flight.selectedCabin.Rule} />
                            </View>) : null}
                        {/*差旅政策 如果差旅政策没有违背，违背原因是相应隐藏的，出差原因不隐藏*/}
                        {isPublic && !this.props.toChange ?
                            <List style={{ marginTop: 10 }} >
                                {isBreachPolicy ?
                                    <List.Item >
                                        <Flex justify='between'  >
                                            <Text style={styles.listTitle} numberOfLines={1}>
                                                {lan.booking_the_flight_you_selected_has_violated_travel_policy}
                                            </Text>
                                            <Text style={styles.listWarning} onPress={() => {
                                                Modal.alert(lan.booking_breach_of_detail, (policyDetail), [
                                                    { text: lan.booking_determine, onPress: () => { } },
                                                ]);
                                            }}>
                                                <Icon style={styles.iconWarning} icon={'0xe67a'} />{lan.booking_breach_of_detail}
                                            </Text>
                                        </Flex>
                                    </List.Item> : null}
                                {isBreachPolicy ? <Picker
                                    {...this.getField(info.ContrReasonID ? [info.ContrReasonID] : null) }
                                    data={this.store.policyReasonList} cols={1}
                                    title={lan.booking_contrary_reason}
                                    extra={lan.booking_please_select_or_fill_in_the_reason}
                                    value={info.ContrReasonID ? [info.ContrReasonID] : null}
                                    triggerType="onClick"
                                    onChange={(val) => {
                                        info.ContrReasonID = val[0];
                                        info.ContrReason = this.store.policyReasonList.find(o => o.value == val[0]).label;
                                        if (val[0] == -2)
                                            info.ContrReason = null;
                                    }}>
                                    <List.Item {...this.getField() } labelNumber={5} last >{lan.booking_contrary_reason}</List.Item>
                                </Picker> : null}
                                {/*违背原因自定义选项输入框*/}
                                {info.ContrReasonID == -2 ?
                                    <TextareaItem
                                        {...this.getField(info.ContrReason) }
                                        title={lan.booking_new_reasons} placeholder={lan.booking_new_reasons} value={info.ContrReason}
                                        labelNumber={5}
                                        rows={3}
                                        onChange={(val) => info.ContrReason = val}
                                        autoHeight />
                                    : null}

                                <Picker
                                    {...this.getField(info.TravelPurposeID ? [info.TravelPurposeID] : null) }
                                    data={this.store.travelReasonList} cols={1}
                                    title={lan.booking_reasons_for_business_trip}
                                    extra={lan.booking_please_choose_the_reason_for_business_trip}
                                    value={info.TravelPurposeID ? [info.TravelPurposeID] : null}
                                    triggerType="onClick"
                                    onChange={(val) => {
                                        info.TravelPurposeID = val[0];
                                        info.TravelPurpose = this.store.travelReasonList.find(o => o.value == val[0]).label;
                                        if (val[0] == -2)
                                            info.TravelPurpose = null
                                    }}>
                                    <List.Item  {...this.getField() } labelNumber={5} >{lan.booking_reasons_for_business_trip}</List.Item>
                                </Picker>
                                {/*违背原因自定义选项输入框*/}
                                {info.TravelPurposeID == -2 ?
                                    <TextareaItem title={lan.booking_new_reasons}
                                        {...this.getField(info.TravelPurpose) }
                                        placeholder={lan.booking_new_reasons} value={info.TravelPurpose}
                                        onChange={(val) => info.TravelPurpose = val}
                                        labelNumber={5}
                                        rows={3}
                                        autoHeight />
                                    : null}
                                <List.Item arrow="horizontal"
                                    labelNumber={5}
                                    onClick={() => {
                                        this.props.navigator.push({
                                            component: CostCenter,
                                            passProps: {
                                                costCenterID: info.CostCenterID,
                                                confirm: (val) => {
                                                    if (val) {
                                                        info.CostCenterInfo = val.CostName;
                                                        info.CostCenterID = val.CostID;
                                                    }
                                                }
                                            }
                                        })
                                    }}
                                    {...this.getField(info.CostCenterInfo) }
                                    optional={false}
                                    extra={info.CostCenterInfo ? <Text style={{ color: '#333', flex: 1, fontSize: 16 }}>{info.CostCenterInfo}</Text> : lan.booking_please_select_the_cost_center}>{lan.booking_cost_center}</List.Item>
                            </List> : null}
                        {this.props.toChange && this.store.employeeList.map((o, i) =>
                            <List.Item key={i} arrow="" style={{ marginTop: 12, marginBottom: 12 }} disabled={true}>
                                {o.Name}
                                {<Brief>{o.CertName}：{o.CertNr}</Brief>}
                            </List.Item>)}
                        {this.props.toChange && <Text style={{ color: 'gray', fontSize: 13, margin: 8 }}>原航班信息</Text>}
                        {this.props.toChange && <View style={styles.flightList}>
                            <FlightList data={flightInfo} arrow={false} />
                            {ticketType == 0 ? <FlightInfo data={{
                                CabinName: CabinInfo.getCabinName(flight.CabinLevel),
                                DiscountRate: this.props.orderDetail.Trade.Orders[0].QuotePrices[0].Discount,
                                Price: ticket.Expenses[0].TicketPrice,
                                ExtraPrice: `${lan.flights_enginePlusFuel}:￥50`
                            }} endorseText={ticket.Rule.replace(new RegExp("<br />", "gm"), '\n\n')} /> : null}
                        </View>}
                        {this.props.toChange && this.store.employeeList.map((o, i) =>
                            <List.Item key={i} arrow="" style={{ marginTop: 12, marginBottom: 12 }} disabled={true}>
                                {o.Name}
                                {<Brief>票号：{o.TicketNr}</Brief>}
                            </List.Item>)}
                        {/*已选出差员工*/}
                        {this.store.employeeList.length > 0 && !this.props.toChange ?
                            <List renderHeader={() => `已选订票人(${this.store.employeeList.length}${lan.booking_people})`} >
                                <List.Item {...this.getField() } onClick={() => {
                                    this.props.navigator.push({
                                        component: BookingPassager,
                                        passProps: {


                                        }
                                    })
                                }}>
                                    新增订票人
                                </List.Item>
                                {this.store.employeeList.map((o, i) =>
                                    <List.Item {...this.getField() } key={i} ><View style={[FLEXBOX.flexStart, { alignItems: 'center' }]}>
                                        {!this.props.store && this.store.employeeList.length > 1 && <TouchableOpacity activeOpacity={.6} onPress={() => {
                                            this.store.employeeList.remove(o);
                                        }}>
                                            <Icon style={styles.delItemIcon} icon='0xe698' />
                                        </TouchableOpacity>}
                                        <TouchableOpacity activeOpacity={.6} style={{ flex: 1 }} disabled={this.props.store ? true : false} onPress={() => {
                                            this.props.navigator.push({
                                                component: EmployeeEdit,
                                                passProps: {
                                                    passenger: toJS(o),
                                                    selectedCertificate: toJS(o.defaultCertificate),
                                                    refresh: (passenger, certificate) => {
                                                        let index = this.store.employeeList.findIndex(o => o.PersonCode == passenger.PersonCode);
                                                        if (index != -1) {
                                                            passenger.defaultCertificate = certificate;
                                                            passenger.Sex = passenger.Sex == "Female" ? 0 : 1;
                                                            this.store.employeeList.splice(index, 1, toJS(passenger));
                                                            this.props.employee.splice(index, 1, toJS(passenger));
                                                        }
                                                    },
                                                }
                                            })
                                        }}>
                                            <Text>{o.PersonName + "   " + Enumerable.from([o.PersonLastNameEN, o.PersonFirstNameEN]).where(o => o && o.length > 0).toArray().join("/")}</Text>
                                            {o.defaultCertificate && !this.store.needSupplement([o.PersonLastNameEN, o.PersonFirstNameEN], o.defaultCertificate.Name) ?
                                                <Brief>{o.defaultCertificate.CertificateName}：{o.defaultCertificate.Value}</Brief> : <Brief><Icon icon={'0xe67a'} style={styles.iconWarning} /><Text style={styles.TextWarning}>{lan.booking_english_name_or_name_cannot_be_empty_please_click_add}</Text></Brief>}
                                        </TouchableOpacity>
                                    </View>
                                    </List.Item>)}
                            </List> : null}
                        {/* 订票人 */}
                        <List renderHeader={() => '订票人'}>
                            {!this.props.store &&
                                <List.Item {...this.getField() } onClick={() => {
                                    this.props.navigator.push({
                                        component: BookingPassager,
                                        passProps: {
                                            confirm: (val) => {
                                                if (val) {
                                                    this.store.passengers.clear();
                                                    this.store.booker = val;
                                                    booking.ContactPerson = val.Name;
                                                    booking.ContactMobile = val.Phone;
                                                    booking.ContactEmail = val.Email;
                                                }
                                            }
                                        }
                                    })
                                }}>
                                    添加订票人
                            </List.Item>}
                            {this.store.booker &&
                                <InputItem
                                    {...this.getField(booking.ContactPerson) }
                                    onChange={(value) => { booking.ContactPerson = value }}
                                    labelNumber={5}
                                    placeholder={lan.booking_please_enter}>{lan.booking_full_name}</InputItem>}
                            {this.store.booker && <InputItem
                                {...this.getField(booking.ContactMobile) }
                                placeholder={lan.booking_please_enter}
                                labelNumber={5}
                                onChange={(value) => { booking.ContactMobile = value }}>{lan.booking_contact_number}</InputItem>
                            }
                            {this.store.booker && <InputItem
                                {...this.getField(booking.ContactEmail, 'email') }
                                optional
                                labelNumber={5}
                                placeholder={lan.booking_please_enter}
                                onChange={(value) => { booking.ContactEmail = value }}>{lan.booking_mail_box}</InputItem>
                            }
                        </List>

                        {/*非员工旅客*/}
                        {(this.props.store && this.store.passengers.length == 0) || this.props.toChange ? <View style={FLEXBOX.bottomSpace}></View> :
                            <List renderHeader={() => `${this.store.employeeList.length > 0 ? '已选乘客' : '已选乘客'}(${this.store.passengers.length}${lan.booking_people})`} style={FLEXBOX.bottomSpace} >
                                {!this.props.store ?
                                    <List.Item {...this.getField() } onClick={() => {
                                        if (!this.store.booker) {
                                            Alert.alert("请添加订票人");
                                            return;
                                        }
                                        this.props.navigator.push({
                                            component: PassgerList,
                                            passProps: {
                                                passengers: this.store.passengers,
                                                booker: this.store.booker,
                                                addPassengers: (passengers) => this.store.passengers = passengers,
                                                param: this.props.param
                                            }
                                        })
                                    }}>
                                        {lan.booking_new_passenger}
                                    </List.Item> : null}
                                {this.store.passengerDatas.length > 0 &&
                                    <List.Item {...this.getField() } arrow={false} onClick={() => {

                                    }}>
                                        <View style={FLEXBOX.flexStart}>
                                            {this.store.passengerDatas.map((o, i) =>
                                                <Checkbox key={i} checked={o.checked} onChange={() => { o.checked = !o.checked }}>
                                                    <Text style={{ marginRight: 15 }}>{o.PassengerName}</Text>
                                                </Checkbox>)}
                                        </View>
                                    </List.Item>}
                                {this.store.passengers.map((o, i) =>
                                    <List.Item {...this.getField() } key={i} ><View style={[FLEXBOX.flexStart, { alignItems: 'center' }]}>
                                        {!this.props.store && this.store.passengers.length > 1 && <TouchableOpacity activeOpacity={.6} onPress={() => {
                                            this.store.passengers.remove(o);
                                        }}>
                                            <Icon style={styles.delItemIcon} icon='0xe698' />
                                        </TouchableOpacity>}

                                        <TouchableOpacity activeOpacity={.6} style={{ flex: 1 }} disabled={this.props.store ? true : false} onPress={() => {
                                            this.props.navigator.push({
                                                component: PassgerEdit,
                                                passProps: {
                                                    booker: this.store.booker,
                                                    passenger: toJS(o),
                                                    selectedCertificate: toJS(o.defaultCertificate),
                                                    refresh: (passenger, certificate) => {
                                                        let index = this.store.passengers.findIndex(o => o.PersonCode == passenger.PersonCode);
                                                        if (index != -1) {
                                                            passenger.defaultCertificate = certificate;
                                                            passenger.FullName = passenger.Name;
                                                            this.store.passengers.splice(index, 1, toJS(passenger));
                                                        }
                                                    },
                                                }
                                            })
                                        }}>
                                            <Text>
                                                {o.FullName + "   " + Enumerable.from([o.LastNameEn, o.FirstNameEn]).where(o => o && o.length > 0).toArray().join("/")}</Text>
                                            {o.defaultCertificate && !this.store.needSupplement([o.LastNameEn, o.FirstNameEn], o.defaultCertificate.ProofType) ?
                                                <Brief>{o.defaultCertificate.CertificateName}：{o.defaultCertificate.Number}</Brief> : <Brief><Icon icon={'0xe67a'} style={styles.iconWarning} /><Text style={styles.TextWarning}>{lan.booking_english_name_or_name_cannot_be_empty_please_click_add}</Text></Brief>}
                                        </TouchableOpacity>

                                    </View>
                                    </List.Item>)}
                            </List>
                        }
                        {/*保险、签证*/}
                        {!this.props.toChange &&
                            <List style={FLEXBOX.bottomSpace}>
                                {this.props.store && (!this.store.productInsure || this.store.productInsure.PassengersQty == 0) ? null : <Item {...this.getField() } extra={
                                    <View><Text style={styles.itemExtraVal} >{(this.store.productInsure && this.store.productInsure.PassengersQty > 0) ? `${lan.booking_selected}${this.store.productInsure.PassengersQty}${lan.booking_share}` : lan.booking_not_selected}
                                    </Text>
                                    </View>

                                } onClick={() => {
                                    if (this.store.employeeList.concat(this.store.passengers).length == 0) {
                                        Alert.alert(lan.booking_please_select_the_opportunity_person);
                                        return;
                                    }
                                    this.props.navigator.push({
                                        component: InSure,
                                        passProps: {
                                            param: this.props.param,
                                            passengers: toJS(this.store.employeeList.concat(this.store.passengers)),
                                            insuranceResult: this.store.insuranceResult,
                                            selectedFlights: this.props.selectedFlights,
                                            productInsure: this.store.productInsure,
                                            refresh: (passengers, productInsure) => {
                                                this.store.insuranceResult = passengers;
                                                this.store.productInsure = productInsure;
                                            },
                                        }
                                    })
                                }}>{lan.booking_insurance}<Brief><Text style={{ fontSize: 12, }} numberOfLines={1}>{lan.booking_from_take_off_to_landing_all_the_way_for_you_to_guard}！</Text></Brief></Item>}
                                {this.props.store && (!this.store.productVisa || this.store.productVisa.PassengersQty == 0) || this.props.param.ticketType == 0 ? null : <Item {...this.getField() } extra={
                                    <View><Text style={styles.itemExtraVal} >{(this.store.productVisa && this.store.productVisa.PassengersQty > 0) ? `${lan.booking_selected}${this.store.productVisa.PassengersQty}${lan.booking_share}` : lan.booking_not_selected}
                                    </Text>
                                    </View>

                                } onClick={() => {
                                    if (this.store.employeeList.concat(this.store.passengers).length == 0) {
                                        Alert.alert(lan.booking_please_select_the_opportunity_person);
                                        return;
                                    }
                                    this.props.navigator.push({
                                        component: Visa,
                                        passProps: {
                                            param: this.props.param,
                                            passengers: toJS(this.store.employeeList.concat(this.store.passengers)),
                                            selectedFlights: this.props.selectedFlights,
                                            productVisa: this.store.productVisa,
                                            refresh: (passengers, productVisa) => {
                                                this.store.productVisa = productVisa;
                                            },
                                        }
                                    })
                                }}>{lan.booking_visa}</Item>}
                                {this.props.store && !this.store.seatPreference ? null :
                                    <Picker extra={lan.flights_selectHint}
                                        okText={lan.confirm}
                                        dismissText={lan.cancel}
                                        data={this.store.seatPreferenceInfo} cols={1}
                                        title={lan.booking_seat_preference}
                                        triggerType="onClick"
                                        value={this.store.seatPreference ? [this.store.seatPreference] : null}
                                        onChange={(val) => {
                                            this.store.seatPreference = val[0];
                                        }}>
                                        <List.Item  {...this.getField() }  >{lan.booking_seat_preference}</List.Item>
                                    </Picker>}
                            </List>}


                        {/*{lan.booking_contact_information}*/}

                        <List >

                            <TextareaItem
                                {...this.getField(booking.Remark) }
                                optional
                                rows={3}
                                labelNumber={5} title={lan.booking_additional_information} value={booking.Remark}
                                onChange={(value) => booking.Remark = value}
                                placeholder={lan.booking_additional_information} autoHeight />
                        </List>

                    </Form>
                </ScrollView>
                {/*{lan.booking_bottom_toolbars}*/}
                <PriceBar hide={this.props.toChange} detailData={this.store.getDetailData} totalPrice={this.store.getTotalPrice} onClick={() => {
                    this.refs.form.validateFields(async (error) => {
                        if (!error) {
                            if (this.props.toChange) {
                                let result = await this.store.updateSalesOrder(this.props.orderDetail);
                                if (result) {
                                    this.props.navigator.push({
                                        component: OrderSubmit,
                                        passProps: {
                                            bookStateInfo: {
                                                'PaymentMethodID': this.store.info.PaymentMethodID,
                                                'BookStateID': 999,
                                                "ToChange": true,
                                                'BookState': "改签申请提交成功",
                                                'OrderNum': result.Result.SOShortNr,
                                                'TotalAmount': this.store.getTotalPrice,
                                                'CustomerApproveStatusID': this.store.CustomerApproveStatusID,
                                            }
                                        }
                                    })
                                }
                                return;
                            }
                            if (this.store.employeeList.concat(this.store.passengers) == 0) {
                                Alert.alert(lan.booking_please_select_the_opportunity_person);
                                return;
                            }
                            let passenger = this.store.setPassengers();
                            let isExits = Enumerable.from(passenger).any(o => o.CertTypeCode != "ID" && o.CertTypeCode != "10" && (!o.PassengerName || o.PassengerName.length == 0));
                            if (isExits) {
                                Alert.alert(lan.booking_please_improve_the_opportunity_information);
                                return;
                            }
                            Popup.hide();
                            if (this.props.store) {
                                let result = await this.store.submit();
                                if (!result) {
                                    Alert.alert(lan.booking_failed_to_submit_the_order_please_check_the_network_and_try_again);
                                    return;
                                }
                                if (result.Code == 0) {
                                    this.props.navigator.push({
                                        component: OrderSubmit,
                                        passProps: {
                                            bookStateInfo: {
                                                'PaymentMethodID': this.store.info.PaymentMethodID,
                                                'BookStateID': 1,
                                                'BookState': lan.booking_submit_order_successfully,
                                                'OrderNum': result.Result.SOShortNr,
                                                'TotalAmount': this.store.getTotalPrice,
                                                'CustomerApproveStatusID': this.store.CustomerApproveStatusID,
                                                'Approves': this.store.Approves,
                                                'Roles': this.store.Roles,
                                                'ID': result.Result.ID,
                                            }
                                        }
                                    })
                                } else {
                                    alert(result.Title ? result.Title : '', result.Msg, [
                                        { text: lan.booking_determine, onPress: () => { } },
                                    ])
                                }
                            } else {
                                this.props.navigator.push({
                                    component: Confirm,
                                    passProps: {
                                        sequence: this.props.sequence + 1,
                                        param: this.props.param,
                                        employee: this.props.employee,
                                        selectedFlights: this.props.selectedFlights,
                                        store: this.store
                                    }
                                })
                            }
                        }
                    })
                }} />
                <ActivityIndicator toast text={lan.booking_loading} animating={this.store.isLoading} />
            </View >
        )

    }


}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.containerBg,
    },
    flights: {
        //padding: 5,
        // backgroundColor: COLORS.primary,
    },

    flightList: {
        borderBottomWidth: 1 / FLEXBOX.pixel,
        borderBottomColor: '#ddd',
        padding: 10,
        backgroundColor: '#fff',
    },
    //列表样式
    listTitle: {
        flex: 1,
        fontSize: 16,

    },
    listWarning: {
        color: '#fa5e5b',
        fontSize: 12,
    },
    iconWarning: {
        color: '#fa5e5b',
        fontSize: 14,
        marginRight: 2,

    },
    TextWarning: {
        color: '#fa5e5b',
        fontSize: 12,
    },
    itemExtraVal: {
        fontSize: 16,
        color: '#888888'
    },
    // 结算方式
    clearingForm: {
        backgroundColor: COLORS.primary,
        padding: 5,
    },
    clearingFormTxt: {
        fontSize: 14,
        color: '#999',

    },
    delItemIcon: {
        paddingRight: 10, color: '#fa5e5b', fontSize: 20,
    }

});