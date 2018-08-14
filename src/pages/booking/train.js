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
    Animated, TextInput, Alert, WebView
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
import moment from 'moment';
import Booking from '../../stores/booking/train';
import Confirm from './train';
import OrderSubmit from './orderSubmit';
import { extendObservable, action, computed, toJS, observable, autorun } from 'mobx';
import { CertificateInfo, AccountInfo, PermissionInfo } from '../../utils/data-access/';
import Radio from '../../components/radio/';
import CostCenter from './costCenter';
import BookingPassager from './bookingPassager';
const Item = List.Item;
const Brief = Item.Brief;
const RadioItem = Radio.RadioItem;

const alert = Modal.alert;
@observer
export default class Train extends Component {
    @observable store;
    constructor(props) {
        super(props);
        this.state = { modal1: false };
        this.store = new Booking(props);
        this.store.userInfo = AccountInfo.getUserInfo();
        this.store.booking.BookerID = this.store.userInfo.Account;
        this.store.booking.BookerName = this.store.userInfo.EmpName;
        this.store.booking.StaffCode = this.store.userInfo.Account;
        this.store.booking.UserCode = this.store.userInfo.Account;
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

    //火车座位
    seatOnShowPress = () => {
        Popup.show(this.seatGetPopupContent(), {
            maskClosable: true,
            animationType: 'slide-up',
            onMaskClose: () => { },
        })
    }

    seatGetPopupContent = () => {
        // 选座信息
        // let setData = [{'1A':'B',} '1B':'B', '1C':'C', '1D':'D', '1F':'F'}, {'2A':'A', '2B':'B', '2C':'C', '2D':'D', '2F':'F'}]
        let num = this.store.employeeList.concat(this.store.passengers).length;
        return <SeatContent store={this.store} num={num} code={this.props.data.code} />
    }

    _momentRenderRow = (rowData, sectionID, rowID) => {
        let detail = this.props.detail;
        let state = 2; // 状态 1为时刻外站点  2为时刻内站点   3为上车站点或下车站点  
        let id = rowData.stationno;
        if (rowData.name == detail.from_station) {
            state = 3;
            this.isDeparture = true;
        }
        if (rowData.name == detail.arrive_station) {
            state = 3;
            this.isArrival = true;
        }
        else if (!this.isDeparture)
            state = 1;
        else if (this.isArrival)
            state = 1;
        let fontColor = state == 1 ? '#999' : state == 2 ? '#333' : '#fe796f';
        let fontStyle = { color: fontColor };
        let selectStyle = { borderRadius: 22, width: 22, height: 22, backgroundColor: state == 3 ? '#fe796f' : 'transparent', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' };
        let selectFontStyle = { color: state == 1 ? '#999' : state == 2 ? '#333' : '#fff', fontSize: 14, }
        return <View style={[FLEXBOX.flexStart, styles.momentList]}>
            <View style={[styles.moentId]}>
                <View style={[selectStyle]}>
                    <Text style={[fontStyle, selectFontStyle]}>{id <= 9 ? "0" + id : id}</Text>
                </View>

            </View>

            <Text style={[styles.moentName, fontStyle]}>{rowData.name}</Text>
            <Text style={[styles.moentOther, fontStyle]}>{rowData.starttime}</Text>
            <Text style={[styles.moentOther, fontStyle]}>{rowData.arrtime}</Text>
            <Text style={[styles.moentOther, fontStyle]}>{/^[0-9]+$/.test(rowData.interval) ? `${rowData.interval}分钟` : rowData.interval}</Text>
        </View>
    }

    render() {
        let train = this.props.orderDetail ? this.props.orderDetail.Trade.Orders[0].EurailP2P.Segments[0].Trains[0] : null;
        let fontStyle = { color: '#333' }
        let detail = this.props.detail;
        let data = this.props.data;
        let first_code = detail.train_code.charAt(0);
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
        let content = "<div>";
        content += " <p>改签：</p>";
        content += " <p>1.未取纸质票，且离发车时间大于35分钟，可改签等于或低于原车票票价的车次。其他不能在线改签的情况需在发车前至火车站窗口办理。</p>";
        content += " <p>2.开车前48小时以上，可改签预售期内的车次。开车前48小时以内，可改签至票面当天24：00之前任意车次，不办理票面日期次日及以后的改签。</p>";
        content += " <p>3.新车票票价低于原车票的，退还差额，对差额部分核收退票费并执行现行退票费标准。</p>";
        content += " <p>4.新车票票价高于原车票的，先收取新车票票款，对原车票票款核收退票费并执行现行改签费标准。</p>";
        content += " <p>退票：</p>";
        content += " <p>1.代购成功，未取票且发车前时间大于35分钟，可进入“我的差旅宝”，点击火车订单根据提示申请退票；发车前15天以内的退票，铁路局将对每张车票按梯次收取退票手续费。</p>";
        content += " <p>2.代购成功，已取票或发车前时间小于35分钟，需您自行携带购票时所使用的乘车人有效证件原件和火车票在发车前去火车站退票窗口办理退票。</p>";
        content += "</div>";
        content = <WebView style={styles.WebView} source={{ html: `<div style="word-wrap:break-word;font-size:12px;padding-right:0;width:100%">${content}</div>` }} />
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
                        {/*差旅政策 如果差旅政策没有违背，违背原因是相应隐藏的，出差原因不隐藏*/}
                        <View style={styles.detaiHeader}>
                            <View style={[FLEXBOX.flexBetween, styles.infoInner]}>
                                <View style={styles.left}>
                                    <Text style={[styles.station, styles.lightnessFont]} >{detail.from_station}</Text>
                                    <Text style={[styles.time, styles.whiteFont]}>{detail.from_time}</Text>
                                    <Text style={[styles.date, styles.lightnessFont]}>{moment(this.props.param.departureDates[0]).format("MM月DD日")}</Text>
                                </View>
                                <View style={styles.center}>
                                    <View style={[FLEXBOX.flexBetween]}>
                                        <View style={styles.momentLine}></View>
                                        <View style={{
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                            <Text style={[styles.momentText, styles.grayFont]}>{detail.train_code}</Text>
                                            <TouchableOpacity activeOpacity={1} onPress={async () => { this.isDeparture = false; this.isArrival = false; await this.store.queryStopStation(detail.train_code); this.setState({ modal1: true }) }} style={[styles.momentBox]}><Text style={[styles.lightnessFont, styles.monentTitle]}>时刻表</Text></TouchableOpacity>
                                            <Text style={[styles.momentText, styles.grayFont]}>{`${parseInt(detail.cost_time / 60)}h${parseInt(detail.cost_time % 60)}m`}</Text>
                                        </View>
                                        <View style={styles.momentLine}></View>
                                    </View>
                                </View>
                                <View style={styles.right}>
                                    <Text style={[styles.station, styles.lightnessFont]} >{detail.arrive_station}</Text>
                                    <Text style={[styles.time, styles.whiteFont]}>{detail.arrive_time}</Text>
                                    <Text style={[styles.date, styles.lightnessFont]}>{moment(this.props.param.departureDates[0] + "T" + detail.from_time).add(detail.cost_time, 'm').format("MM月DD日")}</Text>
                                </View>
                            </View>
                            <View style={[styles.detaiBottom, FLEXBOX.flexBetween]}>
                                <View style={FLEXBOX.flexStart}>
                                    <Text style={[styles.station, styles.lightnessFont, { marginRight: 20 }]} >{data.type}</Text>
                                    <Text onPress={() => {
                                        Modal.alert('退改签', content, [
                                            { text: lan.confirm, onPress: () => { } },
                                        ]);
                                    }} style={[styles.station, styles.lightnessFont, { color: COLORS.link, textDecorationLine: 'underline' }]}>退改签</Text>
                                </View>
                                <Text style={[styles.station, { color: COLORS.secondary }]}>￥{data.price}</Text>
                            </View>
                        </View>
                        {/* 时刻表 */}
                        <Modal
                            bodyStyle={{ paddingHorizontal: 0 }}
                            title={`${detail.train_code}时刻表`}
                            transparent
                            maskClosable={true}
                            visible={this.state.modal1}
                            onClose={() => { this.setState({ modal1: false }) }}

                        >
                            <View style={[FLEXBOX.flexStart, styles.momentList, styles.momentHeader]}>
                                <Text style={[styles.moentId, fontStyle]}></Text>
                                <Text style={[styles.moentName, fontStyle]}>车站名字</Text>
                                <Text style={[styles.moentOther, fontStyle]}>到达</Text>
                                <Text style={[styles.moentOther, fontStyle]}>出发</Text>
                                <Text style={[styles.moentOther, fontStyle]}>停留</Text>
                            </View>

                            <ListView
                                style={{ maxHeight: 300, paddingHorizontal: 10, }}
                                dataSource={this.store.getStationStops}
                                renderRow={this._momentRenderRow}
                                enableEmptySections={true}

                            />
                        </Modal>
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
                                {o.Name + "  " + this.props.data.type + "  " + "成人票"}
                                {<Brief>{o.CertName}：{o.CertNr}</Brief>}
                            </List.Item>)}
                        {train && <Text style={{ color: 'gray', fontSize: 13, margin: 8 }}>旧的行程</Text>}
                        {train &&
                            <View style={[styles.detaiHeader, { backgroundColor: 'white' }]}>
                                <View style={[FLEXBOX.flexBetween, styles.infoInner]}>
                                    <View style={styles.left}>
                                        <Text style={[styles.station, styles.lightnessFont]} >{train.DepartureStation.StationName}</Text>
                                        <Text style={[styles.time, styles.whiteFont]}>{moment(train.DepartureTime).format("HH:mm")}</Text>
                                        <Text style={[styles.date, styles.lightnessFont]}>{moment(train.DepartureTime).format("MM月DD日")}</Text>
                                    </View>
                                    <View style={styles.center}>
                                        <View style={[FLEXBOX.flexBetween]}>
                                            <View style={styles.momentLine}></View>
                                            <View style={{
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                                <Text style={[styles.momentText, styles.grayFont]}>{train.TrainNumber}</Text>
                                                <TouchableOpacity activeOpacity={1} onPress={async () => { this.isDeparture = false; this.isArrival = false; await this.store.queryStopStation(train.TrainNumber); this.setState({ modal1: true }) }} style={[styles.momentBox]}><Text style={[styles.lightnessFont, styles.monentTitle]}>时刻表</Text></TouchableOpacity>
                                                <Text style={[styles.momentText, styles.grayFont]}>{`${parseInt(train.ElapsedTime / 60)}h${parseInt(train.ElapsedTime % 60)}m`}</Text>
                                            </View>
                                            <View style={styles.momentLine}></View>
                                        </View>
                                    </View>
                                    <View style={styles.right}>
                                        <Text style={[styles.station, styles.lightnessFont]} >{train.ArrivalStation.StationName}</Text>
                                        <Text style={[styles.time, styles.whiteFont]}>{moment(train.ArrivalTime).format("HH:mm")}</Text>
                                        <Text style={[styles.date, styles.lightnessFont]}>{moment(train.ArrivalTime).format("MM月DD日")}</Text>
                                    </View>
                                </View>
                                <View style={[styles.detaiBottom1, FLEXBOX.flexBetween]}>
                                    <View style={FLEXBOX.flexStart}>
                                        <Text style={[styles.station, styles.lightnessFont, { marginRight: 20 }]} >{train.CabinLevel}</Text>
                                        <Text onPress={() => {
                                            Modal.alert('退改签', content, [
                                                { text: lan.confirm, onPress: () => { } },
                                            ]);
                                        }} style={[styles.station, styles.lightnessFont, { color: COLORS.link, textDecorationLine: 'underline' }]}>退改签</Text>
                                    </View>
                                    <Text style={[styles.station, { color: COLORS.secondary }]}>￥{this.props.orderDetail.Trade.Orders[0].TotalAmount}</Text>
                                </View>
                            </View>}
                        {/*已选出差员工*/}
                        {this.store.employeeList.length > 0 && !this.props.toChange ?
                            <List renderHeader={() => `${lan.booking_selected_travel_staff}(${this.store.employeeList.length}${lan.booking_people})`} >
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
                                            <Text>{o.PersonName + "   " + Enumerable.from([o.PersonLastNameEN, o.PersonFirstNameEN]).where(o => o && o.length > 0).toArray().join("/") + "  " + this.props.data.type + "  " + "成人票"}</Text>
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
                            {this.store.booker && <InputItem
                                {...this.getField(booking.ContactPerson) }
                                onChange={(value) => { booking.ContactPerson = value }}
                                labelNumber={5}
                                placeholder={lan.booking_please_enter}>{lan.booking_full_name}</InputItem>}
                            {this.store.booker && <InputItem
                                {...this.getField(booking.ContactMobile) }
                                placeholder={lan.booking_please_enter}
                                labelNumber={5}
                                onChange={(value) => { booking.ContactMobile = value }}>{lan.booking_contact_number}</InputItem>}
                            {this.store.booker && <InputItem
                                {...this.getField(booking.ContactEmail, 'email') }
                                optional
                                labelNumber={5}
                                placeholder={lan.booking_please_enter}
                                onChange={(value) => { booking.ContactEmail = value }}>{lan.booking_mail_box}</InputItem>}

                        </List>

                        {/*非员工旅客*/}
                        {(this.props.store && this.store.passengers.length == 0) || this.props.toChange ? <View style={FLEXBOX.bottomSpace}></View> :
                            <List renderHeader={() => `${this.store.employeeList.length > 0 ? lan.booking_non_employee_passengers : lan.booking_passenger_information}(${this.store.passengers.length}${lan.booking_people})`} style={FLEXBOX.bottomSpace} >
                                {!this.props.store ?
                                    <List.Item {...this.getField() } onClick={() => {
                                        if (!this.store.booker) {
                                            Alert.alert("请添加订票人");
                                            return;
                                        }
                                        this.props.navigator.push({
                                            component: PassgerList,
                                            passProps: {
                                                productType: 3,
                                                booker: this.store.booker,
                                                employeeList: this.store.employeeList,
                                                passengers: this.store.passengers,
                                                addPassengers: (passengers) => {
                                                    this.store.passengers = passengers;
                                                    this.store.seatStyle.clear();
                                                },
                                                param: this.props.param
                                            }
                                        })
                                    }}>
                                        {lan.booking_new_passenger}
                                    </List.Item> : null}
                                {this.store.passengers.map((o, i) =>
                                    <List.Item {...this.getField() } key={i} ><View style={[FLEXBOX.flexStart, { alignItems: 'center' }]}>
                                        {!this.props.store && <TouchableOpacity activeOpacity={.6} onPress={() => {
                                            this.store.passengers.remove(o);
                                            this.store.seatStyle.clear();
                                        }}>
                                            <Icon style={styles.delItemIcon} icon='0xe698' />
                                        </TouchableOpacity>}

                                        <TouchableOpacity style={{ flex: 1 }} disabled={this.props.store ? true : false} activeOpacity={.6} onPress={() => {
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
                                                {o.FullName + "   " + Enumerable.from([o.LastNameEn, o.FirstNameEn]).where(o => o && o.length > 0).toArray().join("/") + "  " + this.props.data.type + "  " + "成人票"}</Text>
                                            {o.defaultCertificate && !this.store.needSupplement([o.LastNameEn, o.FirstNameEn], o.defaultCertificate.ProofType) ?
                                                <Brief>{o.defaultCertificate.CertificateName}：{o.defaultCertificate.Number}</Brief> : <Brief><Icon icon={'0xe67a'} style={styles.iconWarning} /><Text style={styles.TextWarning}>{lan.booking_english_name_or_name_cannot_be_empty_please_click_add}</Text></Brief>}
                                        </TouchableOpacity>

                                    </View>
                                    </List.Item>)}
                            </List>
                        }
                        {/*保险、签证*/}
                        {!this.props.toChange &&
                            <List >
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
                                            selectedFlights: [detail],
                                            productType: 3,
                                            productInsure: this.store.productInsure,
                                            refresh: (passengers, productInsure) => {
                                                this.store.insuranceResult = passengers;
                                                this.store.productInsure = productInsure;
                                            },
                                        }
                                    })
                                }}>交通意外险</Item>}
                                {(first_code == "G" || first_code == "C" || first_code == "D") && data.code != "wz" && <Item {...this.getField() } extra={this.store.getSelectSeats.length == 0 ? "未选" : this.store.getSelectSeats.join(',')} onClick={this.seatOnShowPress}>选择座位</Item>}
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
                            </List>
                        }

                        {/*{lan.booking_contact_information}*/}
                        {!this.props.toChange &&
                            <List style={{ marginTop: 10 }}>
                                <TextareaItem
                                    {...this.getField(booking.Remark) }
                                    optional
                                    rows={3}
                                    labelNumber={5} title={lan.booking_additional_information} value={booking.Remark}
                                    onChange={(value) => booking.Remark = value}
                                    placeholder={lan.booking_additional_information} autoHeight />
                            </List>
                        }
                    </Form>
                </ScrollView>
                {/*{lan.booking_bottom_toolbars}*/}
                <PriceBar detailData={this.store.getDetailData} totalPrice={this.store.getTotalPrice} onClick={() => {
                    this.refs.form.validateFields(async (error) => {
                        if (!error) {
                            if (this.props.toChange) {
                                this.store.trainToChange(this.props.orderDetail, detail, data);
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
                                        detail: this.props.detail,
                                        data: this.props.data,
                                        sequence: this.props.sequence + 1,
                                        param: this.props.param,
                                        employee: this.props.employee,
                                        store: this.store
                                    }
                                })
                            }
                        }
                    })
                }} />
                <ActivityIndicator toast text={lan.loading} animating={this.store.isLoading} />
            </View >
        )

    }


}

@observer
class SeatContent extends Component {
    @observable num = this.props.num;
    @observable seatStyle = [];
    componentDidMount() {
        this.seatStyle = toJS(this.props.store.seatStyle);
        if (this.seatStyle.length == 0)
            this.seatStyle = this.props.store.getSeats(this.props.code, this.props.num);
        this.num = this.props.num - this.getSelectedSeats();
    }

    seatOnPopupClose = () => {
        if (this.num == 0) {
            this.props.store.seatStyle = this.seatStyle;
            Popup.hide();
        }
    };

    getSelectedSeats = () => {
        let seats = this.seatStyle;
        return Enumerable.from(seats).sum(o =>
            Enumerable.from(o).sum(o =>
                Enumerable.from(o).count(o => o.checked)));
    }

    onCheck = (v) => {
        if (this.num > 0 || v.checked) {
            let seats = this.seatStyle;
            v.checked = !v.checked;
            this.num = this.props.num - this.getSelectedSeats();
            this.selectedSeat = v;
        }
        //else{
        //     if (this.selectedSeat)
        //         this.selectedSeat.checked = false;
        //     this.selectedSeat = v;
        //     v.checked = !v.checked;
        // }
    }

    render() {
        let seats = this.seatStyle;
        return <View style={styles.seatWrap}>
            <NavBar onlyBar title={this.num == 0 ? `` : `还差${this.num}个旅客未选`} leftText={lan.cancel} onLeftClick={() => Popup.hide()} onRightClick={this.seatOnPopupClose} rightText={lan.confirm} />
            <View style={[styles.seat, { backgroundColor: 'white', flex: 1, }]}>
                <View style={styles.seatTip}>
                    <Text style={styles.seatTipText}>优先按指定的坐席出票，若指定的无票则转购其他坐席</Text>
                </View>
                <View style={[FLEXBOX.flexBetween, styles.seatInner]}>
                    {seats.map((v, k) => {
                        return <View key={k} style={[FLEXBOX.flexBetween, styles.seatList]}>
                            <Text style={styles.seatWindow}>窗</Text>
                            {v[0].map((v, k) =>
                                <TouchableOpacity key={k} activeOpacity={1} style={styles.seatTouch} onPress={() => this.onCheck(v)}>
                                    <Icon style={[styles.seatIcon, { color: v.checked ? '#2280c2' : '#bcdef2' }]} icon={'0xe6a1'} />
                                    <View style={styles.seatLetter}>
                                        <Text style={[styles.seatLetterText, { color: v.checked ? '#fff' : '#333' }]}>{v.code}</Text>
                                    </View>
                                </TouchableOpacity>)}
                            <Text style={styles.seatPassage}>过道</Text>
                            {v[1].map((v, k) =>
                                <TouchableOpacity key={k} activeOpacity={1} style={styles.seatTouch} onPress={() => this.onCheck(v)}>
                                    <Icon style={[styles.seatIcon, { color: v.checked ? '#2280c2' : '#bcdef2' }]} icon={'0xe6a1'} />
                                    <View style={styles.seatLetter}>
                                        <Text style={[styles.seatLetterText, { color: v.checked ? '#fff' : '#333' }]}>{v.code}</Text>
                                    </View>
                                </TouchableOpacity>)}
                            <Text style={styles.seatWindow}>窗</Text>
                        </View>
                    })}

                </View>

            </View>

        </View>;
    }
}
//屏幕比例系数
let scale = FLEXBOX.width / 320;

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
    WebView: {
        //width: FLEXBOX.width * .65,
        height: FLEXBOX.height * .6,
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
    },

    //时刻
    detaiHeader: {
        paddingHorizontal: 5,
        paddingBottom: 5,
        flex: 0,
        backgroundColor: COLORS.primary,
    },
    left: {
        flex: .3,
        alignItems: 'flex-end',

    },
    right: {
        flex: .3,

    },
    center: {
        flex: .4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    station: {
        fontSize: 12,
    },
    whiteFont: {
        color: '#333'
    },
    grayFont: {
        color: '#999'
    },
    lightnessFont: {
        color: '#666'
    },
    momentBox: {
        borderRadius: 2,
        borderColor: '#ddd',
        borderWidth: 1 / FLEXBOX.pixel,
        padding: 2,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#fff'
    },
    momentLine: {
        height: 1 / FLEXBOX.pixel, width: 12, backgroundColor: "#ddd", alignSelf: 'center'

    },
    momentText: {
        fontSize: 11,
    },
    monentTitle: {
        fontSize: 12,
    },
    time: {
        fontSize: 20,
    },
    date: {
        fontSize: 11,
    },
    list: {
        backgroundColor: '#fff',
        borderRadius: 3,
        margin: 5,
        marginBottom: 0,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookBtn: {
        width: 60,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.secondary,
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10,
    },
    bookText: {
        color: '#fff',
        textAlign: 'center'
    },
    type: {
        flex: .3
    },
    price: {
        flex: .25
    },
    tickets: {
        flex: .2
    },
    momentHeader: {
        backgroundColor: '#e6eaf2', height: 30, flex: 0, paddingHorizontal: 10,
    },
    momentList: {
        height: 35,
        alignItems: 'center',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1 / FLEXBOX.pixel,
    },
    moentId: {
        flex: .1,
    },
    moentName: {
        flex: .3,
    },
    moentOther: {
        flex: .2,
    },
    infoInner: {
        backgroundColor: '#fff',
        paddingVertical: 5,
        paddingTop: 10,
    },
    detaiBottom: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderColor: '#eee',
        borderWidth: 1 / FLEXBOX.pixel,
        padding: 5,
    }, detaiBottom1: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderColor: '#eee',
        borderTopWidth: 1 / FLEXBOX.pixel,
        paddingTop: 5,
    },
    seatWrap: {
        height: 250
    },
    seatTip: {
        backgroundColor: '#fffcd2',
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    seatTipText: {
        fontSize: 12,
        lineHeight: 25,
        color: '#666'
    },
    seatIcon: {
        fontSize: 32 * scale,
        color: '#bcdef2'
    },
    seatWindow: {
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        marginRight: 10,
        marginLeft: 10,
    },
    seatList: {
        alignItems: 'center',
        justifyContent: 'center',
        //  backgroundColor:'red'
    },
    seatPassage: {
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        marginRight: 10,
        marginLeft: 10,
        // backgroundColor:'red'
    },
    seatInner: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        paddingTop: 20,
        paddingBottom: 20,
    },
    seatTouch: {
        paddingLeft: 5,
        paddingRight: 5,
        // backgroundColor:'red',
        justifyContent: 'center',
        alignItems: 'center',
    },
    seatLetter: {
        position: 'absolute',
        top: 0, left: 0,
        height: 40 * scale,
        width: 40 * scale,
        // backgroundColor:'red',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    seatLetterText: {
        transform: [{ translateY: -8, translateX: 2 }],
        color: '#333',
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0)'
    },


});