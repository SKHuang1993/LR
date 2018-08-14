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
    Animated, TextInput, Alert,
    WebView
} from 'react-native';

import { WhiteSpace, Popup, SearchBar } from 'antd-mobile';
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
import Checkbox from '../../components/checkbox';
import Form from '../../components/form/';
import Modal from '../../components/modal';
import Picker from '../../components/picker';
import PassgerList from './passagerList';
import PassgerEdit from './passagerEdit';
import EmployeeEdit from './employeeEdit';
import InSure from './inSure';
import Visa from './visa';
import Booking from '../../stores/booking/';
import Confirm from './hotel';
import OrderSubmit from './orderSubmit';
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { CertificateInfo, AccountInfo, NationalityInfo, PermissionInfo } from '../../utils/data-access/';
import Radio from '../../components/radio/';
import moment from 'moment';
import Hotel from '../../stores/booking/hotel';
import { Keyboard } from 'react-native';
import CostCenter from './costCenter';
import BookingPassager from './bookingPassager';
import Term from './hotel-term';

const Item = List.Item;
const Brief = Item.Brief;
const RadioItem = Radio.RadioItem;
const CheckboxItem = Checkbox.CheckboxItem;

const alert = Modal.alert;
@observer
export default class Index extends Component {
    @observable store;
    constructor(props) {
        super(props);
        this.store = new Hotel(props);
        this.store.userInfo = AccountInfo.getUserInfo();
        this.store.booking.BookerID = this.store.userInfo.Account;
        this.store.booking.BookerName = this.store.userInfo.EmpName;
        this.store.booking.StaffCode = this.store.userInfo.Account;
        this.store.booking.UserCode = this.store.userInfo.Account;
        if (props.param.BTANr)
            this.store.booking.SalesOrderRawData.CustomerSONr = props.param.BTANr.BTANr;

        this.store.info.PaymentMethodID = 5;
        let readonly = props.store ? true : false;
        this.getField = new Form(readonly).getField;

        if (this.props.employee && this.props.employee.length > 0) {
            let booker = this.props.employee[0];
            this.store.booker = {
                UserCode: booker.UserCode,
                checked: false,
                Name: booker.Name,
                Phone: booker.Phone,
                Email: booker.Email
            }
            this.store.booking.ContactMobile = booker.Phone;
            this.store.booking.ContactEmail = booker.Email;
        }

        this.store.setEmployeeList(this.props.employee);
        if (props.isPrivate && !this.props.store)
            this.store.employeeList = Enumerable.range(0, props.param.RoomCount).select("{PersonFirstNameEN:null,PersonLastNameEN:null,CertIssue:'CN',CertIssueName:'中国大陆' }").toArray();
        this.store.setCertificateName();
        this.store.costGetList(props.info);
        this.store.getTravelReasonList(props.info);
        this.store.getPolicyReasonList();
        this.store.getLedgerAccountCash();

        this.state = {
            otherDemand: [
                { value: 0, label: '禁烟/No-Smoking', checked: false },
                { value: 1, label: '禁烟/No-Smoking', checked: false },
                { value: 2, label: '蜜月布置/Honeymoon', checked: false },
                { value: 3, label: '高层楼/Higher-Floor', checked: false },
                { value: 4, label: '提前入住/Early-Arrival', checked: false },
                {
                    value: 5, label: '晚点入住/Late Arriva', des: lan.hotels_otherDemandDes5,
                    checked: false
                },
                { value: 6, label: '原房续住/Extened stay in original room', checked: false },
                { value: 7, label: '请提供内部相通的房间/Connecting rooms', checked: false },
                { value: 8, label: '加婴儿床/Baby Cot', des: lan.hotels_otherDemandDes8, checked: false },

            ],
            otherDemandShow: true,
            termsContentToggle: false,
            termsCeckbox: true
        }

    }

    componentDidMount() {
        if (this.props.store)
            this.store = this.props.store;
    }


    demandShow = () => {
        this.store.otherDemandShow = !this.store.otherDemandShow;
    }





    //其他需求 
    otherrDemandOnChange = (val) => {
        val.checked = !val.checked;
    }


    render() {
        let detail = this.props.detail;
        let roomInfo = this.props.data;
        let param = this.props.param;
        let checkInDate = moment(param.CheckInDate);
        let checkOutDate = moment(param.CheckOutDate);
        this.store.dayQty = checkOutDate.diff(checkInDate, "d");
        let info = this.store.info;
        let booking = this.store.booking;
        info.ContrContent = !this.props.isPrivate ? this.props.policyViolations : null;
        info.IsContrPolicy = !this.props.isPrivate && detail.IsPolicyViolated ? true : false;
        //console.log(roomInfo);
        //房型详情
        let roomlIntroduceHtml = `
            <div>
                <p>
                <b>${lan.hotels_roomDescription}</b>
                </p>
                <p>
                    ${roomInfo.RoomDescription ? roomInfo.RoomDescription : lan.noData}
                </p>
                 <p>
                <b>含餐情况</b>
                </p>
                <p>
                    ${roomInfo.Breakfast.BreakfastDesc}
                </p>
                 <p>
                <b>${lan.hotels_cancellationPolicy}</b>
                </p>
                <p>
                    ${roomInfo.CancelPolicy.Cancelable ? roomInfo.CancelPolicy.PolicyDetails.join("<br/>") : lan.hotels_cannotbeCancelled}
                </p>
            </div>
        `;
        let roomIntroduce = <View style={styles.roomIntroduce}>
            <WebView source={{ html: `<div style="word-wrap:break-word;font-size:12px;padding-right:0;width:100%">${roomlIntroduceHtml}</div>` }} />
        </View>
        // 入住说明
        let checkInfoIntroduce = <View style={styles.roomIntroduce}>
            <WebView source={{ html: roomInfo.CheckInInstructions ? roomInfo.CheckInInstructions : lan.noData }} />
        </View>
        // 条款
        let termsHtml1 = <View style={styles.roomIntroduce}>
            <WebView source={{ uri: 'http://developer.ean.com/terms/en/' }} />
        </View>
        let termsHtml2 = <View style={styles.roomIntroduce}>
            <WebView source={{ uri: 'http://developer.ean.com/terms/zh/' }} />
        </View>
        let termsHtml3 = <View style={styles.roomIntroduce}>
            <WebView source={{ uri: 'http://developer.ean.com/terms/agent/en/' }} />
        </View>
        let termsHtml4 = <View style={styles.roomIntroduce}>
            <WebView source={{ uri: 'http://developer.ean.com/terms/agent/zh-cn/' }} />
        </View>



        return (
            <View style={styles.container}>
                <NavBar title={this.props.store ? lan.booking_confirmation_data : lan.booking_fill_in_information} navigator={this.props.navigator} />
                <ScrollView>
                    <Form ref="form">
                        {/*结算方式*/}
                        {this.props.store && !this.props.isPrivate ?
                            <View style={styles.clearingForm}>
                                <RadioItem checked={info.PaymentMethodID == 5} onChange={(event) => {
                                    info.PaymentMethodID = 5;
                                }}>{lan.booking_monthly} <Text style={styles.clearingFormTxt}>{lan.booking_enterprise_quota_surplus}：￥{this.store.availableBalance}</Text></RadioItem>
                            </View> : null}
                        <View style={styles.hotelInfo}>
                            <Text style={styles.hotelName}>
                                {detail.HotelName} {detail.HotelEName ? `(${detail.HotelEName})` : null}
                            </Text>
                            <View style={styles.roomInfo}>
                                <View style={[styles.roomLine, styles.roomItem, FLEXBOX.flexBetween]}>
                                    <Text numberOfLines={0} style={{ flex: 1 }}>{roomInfo.RoomName}</Text>
                                    <Text onPress={() => {
                                        Modal.alert(lan.hotels_theHotelDetails, roomIntroduce, [
                                            { text: lan.confirm, onPress: () => { } },
                                        ]);
                                    }}>{lan.hotels_theHotelDetails}&nbsp;<Icon style={styles.iconArrow} icon={'0xe677'} /></Text>
                                </View>
                                <View style={[styles.roomLine, styles.roomItem]}>

                                    <Text style={styles.grayLight}>{roomInfo.Breakfast.BreakfastDesc}&nbsp;&nbsp;{roomInfo.CancelPolicy.Cancelable ? lan.hotels_freeCancellation : lan.hotels_cannotbeCancelled}</Text>
                                </View>
                                <View style={[styles.roomLine, styles.roomItem]}>

                                    <Text style={styles.black}>{lan.hotels_toStayIn}：{checkInDate.format("MM.DD")}&nbsp;&nbsp;{lan.hotels_toStayOut}：{checkOutDate.format("MM.DD")}&nbsp;&nbsp;<Text style={styles.grayLight}>{lan.lang == 'EN' ? '' : '共'}{checkOutDate.diff(checkInDate, "d")}{lan.night}</Text></Text>
                                </View>
                                <View style={[styles.roomItem]}>
                                    <Text style={styles.black}>{lan.hotels_everyroom}：{param.Adult}{lan.adult}&nbsp;&nbsp;{lan.roomNum}：{param.RoomCount}</Text>
                                </View>
                            </View>

                        </View>

                        {/* 订票人 */}
                        <List renderHeader={() => '订票人'} style={{ marginBottom: 10 }}>
                            {!this.props.store &&
                                <List.Item {...this.getField() } onClick={() => {
                                    this.props.navigator.push({
                                        component: BookingPassager,
                                        passProps: {
                                            confirm: (val) => {
                                                if (val) {
                                                    this.store.passengers.clear();
                                                    this.store.booker = val;
                                                    booking.ContactMobile = val.Phone;
                                                    booking.ContactEmail = val.Email;
                                                }
                                            }
                                        }
                                    })
                                }}>
                                    添加订票人
                            </List.Item>}
                            {this.store.booker && <View style={{ flexDirection: 'row' }}>
                                <InputItem
                                    style={{ flex: 1.5, }}
                                    {...this.getField(this.store.contactPersonFirstName) }
                                    validator={(val) => {
                                        let regExp = /^[a-zA-Z\s]+$/;
                                        return val && val.trim().length > 0 && regExp.test(val);
                                    }}
                                    errorInfo={lan.hotels_nameIsEn}
                                    onChange={(value) => { this.store.contactPersonFirstName = value }}
                                    labelNumber={5}
                                    placeholder={lan.hotels_fristNamePh}>{lan.fullName}</InputItem>
                                <InputItem
                                    style={{ flex: 1, }}
                                    {...this.getField(this.store.contactPersonLastName) }
                                    validator={(val) => {
                                        let regExp = /^[a-zA-Z\s]+$/;
                                        return val && val.trim().length > 0 && regExp.test(val);
                                    }}
                                    errorInfo={lan.hotels_nameIsEn}
                                    onChange={(value) => { this.store.contactPersonLastName = value }}
                                    labelNumber={5}
                                    placeholder={lan.hotels_lastNamePh}></InputItem>
                            </View>}
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

                        {/* 　入住信息 */}
                        <View style={styles.checkInInfo}>

                            <View style={[styles.checkInfoItem, FLEXBOX.flexStart]}>
                                <Text style={styles.itemTitle}>{lan.hotels_checkInInfo}&nbsp;&nbsp;&nbsp;&nbsp;</Text>
                                <Text style={styles.itemAfter} onPress={() => {
                                    Modal.alert(lan.hotels_FillInExplain, lan.hotels_nameIsEn, [
                                        { text: lan.confirm, onPress: () => { } },
                                    ]);
                                }} ><Icon style={styles.inconHint} icon={'0xe751'} />{lan.hotels_FillInExplain}&nbsp;&nbsp;&nbsp;&nbsp;</Text>
                                <Text style={styles.itemAfter} onPress={() => {
                                    Modal.alert(lan.hotels_checkInInstructions, checkInfoIntroduce, [
                                        { text: lan.confirm, onPress: () => { } },
                                    ]);
                                }} ><Icon style={styles.inconHint} icon={'0xe751'} />{lan.hotels_checkInInstructions}</Text>
                            </View>
                            <View style={[styles.checkInfoItem, FLEXBOX.flexStart]}>
                                <Text style={styles.itemTitle}>{lan.hotels_checkInPerson}：</Text>
                                <Text style={styles.userName}>{Enumerable.from(this.store.employeeList).where(o => o.PersonName).select(o => o.PersonName).toArray().join('、')}</Text>

                            </View>
                            {/*旅客信息*/}
                            {Enumerable.range(0, param.RoomCount).toArray().map((o, i) =>
                                <CheckInInfo navigator={this.props.navigator} key={i} index={i} data={this.store.employeeList[i]} store={this.props.store} />)}

                        </View>
                        {/*以下  差旅政策 是拿机票的   */}
                        {/*差旅政策 如果差旅政策没有违背，违背原因是相应隐藏的，出差原因不隐藏*/}
                        {!this.props.isPrivate ?
                            <List style={{ marginTop: 10 }} >
                                {detail.IsPolicyViolated ?
                                    <List.Item >
                                        <Flex justify='between'  >
                                            <Text style={styles.listTitle} numberOfLines={1}>
                                                {lan.hotels_hotelContraryPolicy}
                                            </Text>
                                            <Text style={styles.listWarning} onPress={() => {
                                                Modal.alert(lan.booking_breach_of_detail, this.props.policyViolations, [
                                                    { text: lan.booking_determine, onPress: () => { } },
                                                ]);
                                            }}>
                                                <Icon style={styles.iconWarning} icon={'0xe67a'} />{lan.booking_breach_of_detail}
                                            </Text>
                                        </Flex>
                                    </List.Item> : null}
                                {detail.IsPolicyViolated ? <Picker
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

                        {/* 其他要求  */}

                        <View style={styles.otherDemand}>
                            <TouchableOpacity activeOpacity={.6} onPress={this.demandShow} style={[FLEXBOX.flexBetween, styles.otherDemandTitle]}>
                                <View style={{ flex: .8 }}>
                                    <Text style={styles.title}>
                                        {lan.hotels_otherRequirements}
                                    </Text>
                                    <Text style={[styles.titleDes, { marginTop: 5, }]}>
                                        {lan.hotels_otherRequirementsDes}
                                    </Text>
                                </View>
                                <Icon style={[styles.iconArrowDown]} icon={'0xe679'} />


                            </TouchableOpacity>

                            <View style={{ height: this.store.otherDemandShow ? 500 : 0, overflow: 'hidden' }}>
                                {this.store.otherDemand.map(i => (
                                    <CheckboxItem key={i.value} checked={i.checked} disabled={this.props.store} onChange={() => this.otherrDemandOnChange(i)}>
                                        <View style={styles.demandItem}>
                                            <Text>{i.label}</Text>
                                            {i.des != null ? <Text style={styles.demandDes}>{i.des}</Text> : null}
                                        </View>
                                    </CheckboxItem>
                                ))}

                                <TextareaItem
                                    styles={{ container: { padding: 0, paddingLeft: 10, borderColor: 'transparent' }, input: { fontSize: 12, paddingLeft: 0, } }}
                                    rows={3}
                                    title={lan.other}
                                    editable={this.props.store ? false : true}
                                    labelNumber={2} value={this.store.otherRequirements}
                                    onChange={(value) => { this.store.otherRequirements = value }}
                                    placeholder={lan.hotels_otherRequirementsPlaceholder} autoHeight />
                            </View>
                        </View>
                        {/*{联系人}*/}
                        <List style={{ marginTop: 10, marginBottom: 10 }}>
                            <TextareaItem
                                {...this.getField(booking.Remark) }
                                optional
                                rows={3}
                                labelNumber={5} title={lan.booking_additional_information} value={booking.Remark}
                                onChange={(value) => booking.Remark = value}
                                placeholder={lan.booking_additional_information} autoHeight />
                        </List>
                        {/*同意条件*/}
                        <CheckboxItem disabled={this.props.store} checked={this.store.termsCeckbox} onChange={() => this.store.termsCeckbox = !this.store.termsCeckbox}>
                            <View style={[styles.termsCeckbox, FLEXBOX.flexStart]}>
                                <Text>{lan.hotels_agreedClauseTxt1}</Text>
                                <Text onPress={() => {
                                    this.props.navigator.push({
                                        component: Term,
                                        passProps: {
                   
                                        },
                                    })
                                }} style={[styles.termsToggle]}>{lan.hotels_agreedClauseTxt2}</Text>
                            </View>
                        </CheckboxItem>
                    </Form>
                </ScrollView>
                {/*底部价格栏*/}
                <PriceBar detailData={this.store.getDetailData} totalPrice={roomInfo.TotalAmount} onClick={() => {
                    this.refs.form.validateFields(async (error) => {
                        if (!error) {
                            {/* if (Enumerable.from(this.store.employeeList).firstOrDefault(o => (o.PersonFirstNameEN && o.PersonFirstNameEN.trim().length > 0) && (o.PersonFirstNameEN && o.PersonFirstNameEN.trim().length > 0), null)) {
                                Alert.alert("入住人姓名不能为空");
                                return;
                            } */}
                            let regExp = /^[a-zA-Z\s]+$/;
                            let val = this.store.employeeList.slice().some(o => (!o.PersonFirstNameEN || !regExp.test(o.PersonFirstNameEN)) || (!o.PersonLastNameEN || !regExp.test(o.PersonLastNameEN)));
                            if (val) {
                                Alert.alert(lan.hotels_nameIsEn);
                                return;
                            }
                            if (!this.store.termsCeckbox) {
                                Alert.alert(lan.hotels_readAndAgreeToTheTerms);
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
                                                'TotalAmount': this.props.data.TotalAmount,
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
                            }
                            else
                                if (this.props.navigator) {
                                    this.props.navigator.push({
                                        component: Confirm,
                                        passProps: {
                                            detail: this.props.detail,
                                            data: this.props.data,
                                            param: this.props.param,
                                            employee: this.store.employeeList,
                                            isPrivate: this.props.isPrivate,
                                            store: this.store,
                                            policyViolations: this.props.policyViolations
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

@observer
class CheckInInfo extends Component {
    state = {

    }
    render() {
        let info = this.props.data;
        return (
            <View style={[styles.checkInInfoList, FLEXBOX.flexBetween]}>
                <Text style={styles.checkInInfoLabel}>
                    房间{this.props.index + 1}
                </Text>
                <TextInput
                    editable={!this.props.store}
                    style={styles.checkInInput}
                    underlineColorAndroid='transparent'
                    onChangeText={(firstName) => info.PersonFirstNameEN = firstName}
                    placeholder={lan.hotels_fristNamePh}
                    value={info.PersonFirstNameEN}
                />
                <Text style={{ color: '#999' }}> | </Text>
                <TextInput
                    underlineColorAndroid='transparent'
                    editable={!this.props.store}
                    style={styles.checkInInput}
                    onChangeText={(lastName) => info.PersonLastNameEN = lastName}
                    placeholder={lan.hotels_lastNamePh}
                    value={info.PersonLastNameEN}
                />
                <TouchableOpacity disabled={this.props.store ? true : false} style={[FLEXBOX.flexBetween, styles.checkInInfoCountry]} onPress={() => {
                    this.props.navigator.push({
                        component: Countries,
                        passProps: {
                            info: info
                        }
                    })

                }}>
                    <Text numberOfLines={1} >{info.CertIssueName}</Text>
                    {!this.props.store && <Icon style={styles.iconArrow} icon={'0xe677'} />}
                </TouchableOpacity>
            </View>
        )
    }

}


@observer
class Countries extends Component {
    @observable items = NationalityInfo.getList().items;
    @observable keyWords = "";
    constructor(props) {
        super(props);
    }

    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.items.slice());
    }

    _renderRow = (rowData: string, sectionID: number, rowID: number) => {
        return (
            <TouchableOpacity activeOpacity={0.5} style={styles.countriesItem} onPress={() => {
                if (this.props.info) {
                    this.props.info.CertIssueName = rowData.name;
                    this.props.info.CertIssue = rowData.code;
                }
                this.props.navigator.pop();
            }}>
                <Text>{rowData.name}</Text>
            </TouchableOpacity>
        );
    }


    render() {
        return (
            <View style={styles.container}>
                <NavBar title={lan.hotels_chooseNationality} navigator={this.props.navigator} />
                <SearchBar
                    placeholder={lan.hotels_inputKeywords}
                    ref={"SearchBar"}
                    value={this.keyWords}
                    onChange={(text) => {
                        if (typeof text != 'string') return;
                        this.keyWords = text;
                        clearTimeout(this.timer);
                        this.timer = setTimeout(() => {
                            this.items.clear();
                            if (text.trim().length > 0)
                                this.items = Enumerable.from(NationalityInfo.getList().items).where(o => o.code.indexOf(text.toUpperCase()) != -1 ||
                                    o.name.indexOf(text) != -1 || o.nameEN.toUpperCase().indexOf(text.toUpperCase()) != -1).toArray();
                            else
                                this.items = NationalityInfo.getList().items;
                        }, 500)
                    }}
                />
                <ListView style={styles.countriesBg}
                    keyboardShouldPersistTaps='always'
                    onScrollBeginDrag={() => Keyboard.dismiss()}
                    enableEmptySections={true}
                    dataSource={this.getDataSource}
                    renderRow={this._renderRow}
                />
            </View >
        )
    }

}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.containerBg,
    },
    countriesBg: {
        backgroundColor: '#fff'
    },
    otherDemandTitle: {

        alignItems: 'center',
        padding: 10,
    },
    title: {
        color: '#333',
    },
    titleDes: {
        color: '#999',
        fontSize: 12,
    },
    inconHint: {
        fontSize: 14,
        color: '#666'
    },

    roomIntroduce: {
        width: FLEXBOX.width * .8,
        height: FLEXBOX.height * .6,
    },
    hotelInfo: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,

    },
    roomInfo: {
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        padding: 10,
    },
    hotelName: {
        fontSize: 16, color: '#333',
        marginBottom: 5,
    },
    roomItem: {
        padding: 10,
    },
    countriesItem: {
        borderColor: '#ccc',
        borderBottomWidth: 1 / FLEXBOX.pixel,
        padding: 10,
    },
    roomLine: {
        borderColor: '#ccc',
        borderBottomWidth: 1 / FLEXBOX.pixel,
    },
    iconArrow: { fontSize: 12, color: '#666' },
    otherDemand: {
        backgroundColor: '#fff',

    },
    demandItem: {
        width: FLEXBOX.width * 0.8,
        paddingTop: 5,
        paddingBottom: 5,
    },

    demandDes: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    checkInInfo: {
        backgroundColor: '#fff',
        padding: 10,
        paddingBottom: -10,
        marginBottom: 10,
    },
    checkInInfoList: {
        height: 40,
        alignItems: 'center',
        borderBottomWidth: 1 / FLEXBOX.pixel,
        borderColor: '#ddd',
    },
    checkInInput: {
        height: 40, flex: .3,
        fontSize: 14,
    },
    checkInInfoLabel: {
        flex: .15,
        color: '#666',

    },
    checkInInfoCountry: {
        flex: .2,

    },
    checkInfoItem: {
        borderBottomWidth: 1 / FLEXBOX.pixel,
        borderColor: '#ddd',
        paddingTop: 10,
        paddingBottom: 10,
    },
    iconArrowDown: {
        color: '#666',
        width: 20,
        marginLeft: 10,
        flex: 0
    },
    textareaItem: {
        fontSize: 12,
        height: 50,
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
    termsCeckbox: {
        alignItems: 'center'
    },
    termsLink: {
        color: '#007aff',
        marginBottom: 2,
    },
    termsTitle: {
        marginBottom: 5,
        marginTop: 5,
    },
    termsContent: {
        backgroundColor: '#fff',

        paddingLeft: 45,
    },
    termsToggle: {
        color: '#007aff',
        textDecorationLine: 'underline'
    },


});