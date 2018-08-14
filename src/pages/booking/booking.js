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
import OrderSubmit from './orderSubmit';
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { CertificateInfo, AccountInfo } from '../../utils/data-access/';
import Radio from '../../components/radio/';
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
        this.store.booking.BookerName = this.store.userInfo.EmpName;
        this.store.booking.ContactPerson = this.store.userInfo.EmpName;
        this.store.booking.ContactMobile = this.store.userInfo.Phone;
        this.store.booking.ContactEmail = this.store.userInfo.Email;
        if (props.param.BTANr)
            this.store.booking.SalesOrderRawData.CustomerSONr = props.param.BTANr;
 
        if (props.param.isPrivate)
            this.store.info.PaymentMethodID = 1;
        let readonly = props.store ? true : false;
        this.getField = new Form(readonly).getField;
 
        this.store.setEmployeeList(this.props.employee);
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
                city: `${info.Departure.cityNameCn} - ${info.Arrival.cityNameCn}`,
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
                <NavBar title={this.props.store ? lan.booking_confirmation_data : lan.booking_fill_in_information} navigator={this.props.navigator} />
                <ScrollView>
                    <Form ref="form">
                        {/*结算方式*/}
                        {this.props.store && isPublic ?
                            <View style={styles.clearingForm}>
                                <RadioItem checked={info.PaymentMethodID == 1} onChange={(event) => {
                                    info.PaymentMethodID = 1;
                                }}>{lan.booking_as_you_go}</RadioItem>
                                <RadioItem checked={info.PaymentMethodID == 5} onChange={(event) => {
                                    info.PaymentMethodID = 5;
                                }}>{lan.booking_monthly} <Text style={styles.clearingFormTxt}>{lan.booking_enterprise_quota_surplus}：￥{this.store.ledgerAccountCashs.AvailableBalance}</Text></RadioItem>
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
                        {isPublic ?
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
 
                                <Picker
                                    {...this.getField(info.CostCenterID ? [info.CostCenterID] : null) }
                                    data={this.store.costList} cols={1}
                                    title={lan.booking_cost_center}
                                    extra={lan.booking_please_select_the_cost_center}
                                    value={info.CostCenterID ? [info.CostCenterID] : null}
                                    triggerType="onClick"
                                    onChange={(val) => {
                                        info.CostCenterID = val[0];
                                        info.CostCenterInfo = Enumerable.from(this.store.costList).first(o => o.value === val[0]).label;
                                    }}>
                                    <List.Item  {...this.getField() } labelNumber={5}>{lan.booking_cost_center}</List.Item>
                                </Picker>
                            </List> : null}
                        {/*已选出差员工*/}
                        {this.store.employeeList.length > 0 ?
                            <List renderHeader={() => `${lan.booking_selected_travel_staff}(${this.store.employeeList.length}${lan.booking_people})`} >
                                {this.store.employeeList.map((o, i) =>
                                    <List.Item {...this.getField() } key={i} onClick={() => {
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
                                        {o.PersonName + "   " + Enumerable.from([o.PersonLastNameEN, o.PersonFirstNameEN]).where(o => o && o.length > 0).toArray().join("/")}
                                        {o.defaultCertificate && !this.store.needSupplement([o.PersonLastNameEN, o.PersonFirstNameEN], o.defaultCertificate.Name) ?
                                            <Brief>{o.defaultCertificate.CertificateName}：{o.defaultCertificate.Value}</Brief> : <Brief><Icon icon={'0xe67a'} style={styles.iconWarning} /><Text style={styles.TextWarning}>{lan.booking_english_name_or_name_cannot_be_empty_please_click_add}</Text></Brief>}
                                    </List.Item>)}
                            </List> : null}
 
                        {/*非员工旅客*/}
                        {this.props.store && this.store.passengers.length == 0 ? <View style={FLEXBOX.bottomSpace}></View> :
                            <List renderHeader={() => `${this.store.employeeList.length > 0 ? lan.booking_non_employee_passengers : lan.booking_passenger_information}(${this.store.passengers.length}${lan.booking_people})`} style={FLEXBOX.bottomSpace} >
                                {!this.props.store ?
                                    <List.Item {...this.getField() } onClick={() => {
                                        this.props.navigator.push({
                                            component: PassgerList,
                                            passProps: {
                                                passengers: this.store.passengers,
                                                addPassengers: (passengers) => this.store.passengers = passengers,
                                                param: this.props.param
                                            }
                                        })
                                    }}>
                                        {lan.booking_new_passenger}
                        </List.Item> : null}
                                {this.store.passengers.map((o, i) =>
                                    <List.Item {...this.getField() } key={i} onClick={() => {
                                        this.props.navigator.push({
                                            component: PassgerEdit,
                                            passProps: {
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
                                        {o.FullName + "   " + Enumerable.from([o.LastNameEn, o.FirstNameEn]).where(o => o && o.length > 0).toArray().join("/")}
                                        {o.defaultCertificate && !this.store.needSupplement([o.LastNameEn, o.FirstNameEn], o.defaultCertificate.ProofType) ?
                                            <Brief>{o.defaultCertificate.CertificateName}：{o.defaultCertificate.Number}</Brief> : <Brief><Icon icon={'0xe67a'} style={styles.iconWarning} /><Text style={styles.TextWarning}>{lan.booking_english_name_or_name_cannot_be_empty_please_click_add}</Text></Brief>}
                                    </List.Item>)}
                            </List>
                        }
                        {/*保险、签证*/}
                        <List >
                            {this.props.store && (!this.store.productInsure || this.store.productInsure.PassengersQty == 0) ? null : <Item {...this.getField() } extra={
                                <View><Text style={styles.itemExtraVal} >{(this.store.productInsure && this.store.productInsure.PassengersQty > 0) ? `{lan.booking_selected}${this.store.productInsure.PassengersQty}{lan.booking_share}` : lan.booking_not_selected}
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
                                <View><Text style={styles.itemExtraVal} >{(this.store.productVisa && this.store.productVisa.PassengersQty > 0) ? `{lan.booking_selected}${this.store.productVisa.PassengersQty}{lan.booking_share}` : lan.booking_not_selected}
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
                                <Picker
                                    data={this.store.seatPreferenceInfo} cols={1}
                                    title={lan.booking_seat_preference}
                                    triggerType="onClick"
                                    value={this.store.seatPreference ? [this.store.seatPreference] : null}
                                    onChange={(val) => {
                                        this.store.seatPreference = val[0];
                                    }}>
                                    <List.Item  {...this.getField() }  >{lan.booking_seat_preference}</List.Item>
                                </Picker>}
                        </List>
 
 
                        {/*{lan.booking_contact_information}*/}
                        <List renderHeader={() => lan.booking_contact_information}>
                            <InputItem
                                {...this.getField(booking.ContactPerson) }
                                onChange={(value) => { booking.ContactPerson = value }}
                                labelNumber={5}
                                placeholder={lan.booking_please_enter}>{lan.booking_full_name}</InputItem>
                            <InputItem
                                {...this.getField(booking.ContactMobile, 'phone') }
                                placeholder={lan.booking_please_enter}
                                labelNumber={5}
                                type="number"
                                onChange={(value) => { booking.ContactMobile = value }}>{lan.booking_contact_number}</InputItem>
                            <InputItem
                                {...this.getField(booking.ContactEmail, 'email') }
                                optional
                                labelNumber={5}
                                placeholder={lan.booking_please_enter}
                                onChange={(value) => { booking.ContactEmail = value }}>{lan.booking_mail_box}</InputItem>
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
                <PriceBar detailData={this.store.getDetailData} totalPrice={this.store.getTotalPrice} onClick={() => {
                    this.refs.form.validateFields(async (error) => {
                        if (!error) {
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
                                    alert('', result.Msg, [
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
 
    }
 
});