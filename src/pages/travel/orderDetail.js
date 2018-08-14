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
    Platform,
    Navigator,
    NativeModules,
    Alert,
    TextInput,
} from 'react-native';

import Flex from '../../components/flex';
import List from '../../components/list';
import ActivityIndicator from '../../components/activity-indicator';
import InputItem from '../../components/input-item';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import NavBar from '../../components/navBar/index';
import Icon from '../../components/icons/icon';
import TextareaItem from '../../components/textarea-item';
import ToolBar from '../../components/toolBar/index';
import Button from '../../components/button';
import moment from 'moment';
import Staff from '../staff/';
import { observer } from 'mobx-react/native';
import Enumerable from 'linq';
import Routetrip from './routetrip';
import { toJS } from 'mobx';
import Detail from '../../stores/travel/orderDetail';
import { AccountInfo } from '../../utils/data-access/';
import Booking from '../../pages/booking';
import Intl from '../../stores/flight/intl';
import FlightIndex from '../flight/';
import { Toast,Popup } from 'antd-mobile';
import Home from '../index';
import TrainIndex from '../webviewView/trainWebview';

import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

@observer
export default class OrderDetail extends React.Component {
    constructor(props) {
        super(props);
        this.store = new Detail();
        this.store.RefreshEvent = props.RefreshEvent;
        this.store.businessTripApplicationByID(props.ID);
        this.store.userInfo = AccountInfo.getUserInfo();
        this.state={
            reason:'',
        };
    }
    render() {
        let detail = this.store.detail;
        let obj = this.props.store;
        this.flights = [];
        if (detail.Contents) {
            for (let flight of detail.Contents) {
                if (flight.Content.ReferenceJourney && flight.Content.ReferenceJourney.Air)
                    this.flights = this.flights.concat(JSON.parse(flight.Content.ReferenceJourney.Air));
            }
        }
        return (
            <View style={styles.container}>
                <NavBar title={lan.orderDatail_applicateDatail} navigator={this.props.navigator} rightIcon={'0xe666'} onRightClick={() => {
                    this.toMain();
                }} />
                <ScrollView>
                    {this.getOrderTitleView()}
                    {/*行程*/}
                    {detail.Contents && detail.Contents.map((o, i) =>
                        <View style={styles.routebox} key={i}>
                            <Flex justify='start' align='center' style={styles.routeTitle}>
                                <Text style={styles.routeTitle_left} >
                                    {o.Content.ProductCategoryID == 8 || o.Content.ProductCategoryID == 9 ?
                                        <Icon icon={0xe660} color={'#696969'} style={styles.routeTitle_icon} /> : null}
                                    {o.Content.ProductCategoryID == 3 ?
                                        <Icon icon={0xe662} color={'#696969'} style={styles.routeTitle_icon} /> : null}
                                </Text>
                                <View>{lan.lang == "ZH" ? (
                                    <Text style={styles.routeTitle_right}>
                                        {o.Content.Segment.DepartureCityName + "-" + o.Content.Segment.ArrivalCityName + (o.Content.Segment.TripType == "RT" ? `-${o.Content.Segment.DepartureCityName}` : "")}
                                    </Text>) : (
                                        <Text style={styles.routeTitle_right}>
                                            {o.Content.Segment.DepartureCityCode + "-" + o.Content.Segment.ArrivalCityCode + (o.Content.Segment.TripType == "RT" ? `-${o.Content.Segment.DepartureCityCode}` : "")}
                                        </Text>)}
                                    <Text>
                                        {(departureDate = moment(o.Content.Segment.DepartureDate), arrivalDate = moment(o.Content.Segment.ArrivalDate),
                                            `${departureDate.format("YYYY.MM.DD")}-${arrivalDate.format("YYYY.MM.DD")} (${moment(arrivalDate).diff(departureDate, 'd') + 1}${lan.day})`)}
                                    </Text>
                                </View>
                            </Flex>
                        </View>)}
                    {/*参考行程start*/}
                    {Enumerable.from(detail.Contents).sum(o => o.Content.ReferenceJourney && o.Content.ReferenceJourney.Air) > 0 ?
                        <View style={styles.referbox}>
                            <Text style={styles.referbox_title}>{lan.orderDatail_referTrip + "："}</Text>
                        </View> : null
                    }
                    {this.getRoutetripInfo(this.flights)}
                    {/*参考行程end*/}
                    {/*差旅政策*/}
                    <View>
                        <View><Text style={styles.list_tit}>{lan.orderDatail_travelPolicy}</Text></View>
                        <List>
                            {detail.TravelPolicyContent && detail.TravelPolicyContent.split(';').map((o, i) =>
                                <List.Item key={i}>
                                    <View>
                                        <Text>
                                            <Icon icon={'0xe67a'} style={{ color: COLORS.secondary }} />{o}</Text>
                                    </View>
                                </List.Item>)}
                        </List>
                    </View>
                    {/*审批状态start*/}
                    {this.getApprovalStateView()}
                    {/*审批状态end*/}
                </ScrollView>
                {/*底部工具栏*/}
                {this.getToolbarView()}
                <ActivityIndicator toast text={lan.orderDatail_later} animating={this.store.isLoading} />
            </View>
        );
    }

    //订单信息头部
    getOrderTitleView = () => {
        let detail = this.store.detail;
        return (
            <View style={styles.orderView}>
                <Flex style={[styles.orderView_item, { marginTop: 0 }]}>
                    <Text style={styles.orderView_label}>{lan.orderDetail_applicant + "："}</Text>
                    <Flex justify='start' style={{ flex: 1 }}>
                        <Text style={styles.orderView_inner}>{this.store.detail.ApplicantUserName}</Text>
                        <Icon icon={'0xe67a'} color={COLORS.link} style={{ fontSize: 15, marginLeft: 3 }} />
                    </Flex>
                    <Text style={{ color: COLORS.secondary, fontSize: 15, flex: 0.9 }}>{this.store.detail.StatusCName}</Text>
                </Flex>
                {detail.Persons && detail.Persons.length > 0 ?
                    <Flex style={styles.orderView_item}>
                        <Text style={styles.orderView_label}>{lan.orderDetail_fellowWorker + "："}</Text>
                        <Flex justify='start' style={{ flex: 1 }}>
                            <Text style={styles.orderView_inner}>{Enumerable.from(detail.Persons).select("$.PersonName").toArray().join(',')}</Text>
                        </Flex>
                    </Flex> : null}
                <Flex style={styles.orderView_item}>
                    <Text style={styles.orderView_label}>{lan.orderDetail_applicationCode + "："}</Text>
                    <Flex justify='start' style={{ flex: 1 }}>
                        <Text style={styles.orderView_inner}>{detail.BTANr}</Text>
                    </Flex>
                </Flex>
                <Flex style={styles.orderView_item}>
                    <Text style={styles.orderView_label}>{lan.orderDetail_tripReason + "："}</Text>
                    <Flex justify='start' style={{ flex: 1 }}>
                        <Text style={styles.orderView_inner}>{detail.Reason}</Text>
                    </Flex>
                </Flex>
                <Flex style={styles.orderView_item}>
                    <Text style={styles.orderView_label}>{lan.orderDetail_costCenter + "："}</Text>
                    <Flex justify='start' style={{ flex: 1 }}>
                        <Text style={styles.orderView_inner}>{detail.CostCenterInfo}</Text>
                    </Flex>
                </Flex>
            </View>
        );
    }

    //订单审批状态
    getApprovalStateView = () => {
        let userRoles = Enumerable.from(this.store.detail.AApproveUser).groupBy(o => o.RoleID).toArray();


        return (
            <View style={styles.approvalstate}>
                {/*发起申请，主要是图标和提醒状态不一样 start*/}
                <Flex justify='between' align='start' style={styles.approvalstate_item}>
                    <View style={styles.approvalstate_left}>
                        {/*发起申请图标*/}
                        <Icon icon={'0xe676'} style={[styles.approvalstate_icon, { color: COLORS.correctColor }]} />
                    </View>
                    <View style={styles.approvalstate_right}>
                        <View style={styles.approvalstate_rightinner}>
                            <Flex justify='start' align='start' style={styles.approvalstate_rightbox}>
                                <View style={[styles.optview_circle, { backgroundColor: this.getRandomColor(), }]}>
                                    <Text style={styles.optview_txt} numberOfLines={1} ellipsizeMode='tail'>{this.store.detail.ApplicantUserName}</Text>
                                </View>
                                <View style={styles.approver_box}>
                                    <Text style={styles.approver}>{this.store.detail.ApplicantUserName}</Text>
                                    {/*发起申请*/}
                                    <Text style={styles.applicate_state}>{lan.orderDetail_applyFor}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end', paddingTop: 6 }}>
                                    <Text style={styles.time}>{moment(this.store.detail.CreateDate).format("YYYY.MM.DD  HH:mm")}</Text>
                                </View>
                            </Flex>
                        </View></View>

                </Flex>
                {/*发起申请 end*/}

                {/*审批通过 start*/}
                {userRoles.map((role, i) => {
                    role = role.getSource();
                    return (
                        <Flex justify='between' align='start' style={styles.approvalstate_item} key={i}>
                            <View style={styles.approvalstate_left}>
                                {/*审批通过图标*/}
                                {role.some(o => o.IsPass) && role.every(o => o.StatusID != 1 && o.StatusID != 2) ?
                                    <Icon icon={'0xe676'} style={[styles.approvalstate_icon, { color: COLORS.correctColor }]} /> : null}
                                {role.some(o => o.IsPass == false) && role.every(o => o.StatusID != 1 && o.StatusID != 2) ?
                                    <Icon icon={'0xe698'} style={[styles.approvalstate_icon, { color: COLORS.errorColor, }]} /> : null}
                                {role.some(o => o.StatusID == 1 || o.StatusID == 2) ?
                                    <Icon icon={'0xe69b'} style={[styles.approvalstate_icon, { color: '#ccc', }]} /> : null}
                            </View>
                            <View style={[styles.approvalstate_right]}>
                                <View style={styles.approvalstate_rightinner}>
                                    {role.map((o, i) => {
                                        let statusCName = o.StatusCName;
                                        if (o.StatusID != 1 && o.StatusID != 2) {
                                            if (role.some(o => o.IsPass))
                                                statusCName = lan.beAgreed;
                                            else
                                                statusCName = lan.beRefuse;
                                        }
                                        let seconds = moment(o.OperationDate).diff(moment(o.CreateDate), 's');
                                        return (
                                            <Flex justify='start' align='start' style={styles.approvalstate_rightbox} key={i}>
                                                <View style={[styles.optview_circle, { backgroundColor: this.getRandomColor(), }]}>
                                                    <Text style={styles.optview_txt} numberOfLines={1} ellipsizeMode='tail'>{o.UserName}</Text>
                                                </View>
                                                <View style={styles.approver_box}>
                                                    <Text style={styles.approver}>{o.UserName}</Text>
                                                    <Text style={styles.approvalstate_passtxt}>{statusCName}</Text>
                                                </View>

                                                <View style={{ alignItems: 'flex-end', paddingTop: 6, }}>
                                                    <Text style={styles.time}>{o.CreateDate && moment(o.CreateDate).format("YYYY.MM.DD  HH:mm")}</Text>
                                                    {o.OperationDate && <Text style={styles.time}>{parseInt(seconds / 3600)}{lan.hour}{parseInt(Math.ceil(seconds % 3600 / 60))}{lan.minute}</Text>}
                                                    {/*催他一下*/}
                                                    {(this.store.detail.StatusID == 1 || this.store.detail.StatusID == 2) && o.UserCode != this.store.userInfo.Account &&
                                                        < TouchableOpacity style={{
                                                            padding: 5, borderRadius: 4, borderWidth: 1 / FLEXBOX.pixel, borderColor: COLORS.btnBg,
                                                            alignItems: 'center', justifyContent: 'center'
                                                        }} onPress={(v) => this.callPhoneToRole(o.Phone)}>
                                                            <Text style={{ fontSize: 12, color: COLORS.btnBg }}>{lan.hurryUp}</Text>
                                                        </TouchableOpacity>
                                                    }
                                                </View>

                                            </Flex>)
                                    })}
                                </View></View>
                        </Flex>)
                })}
            </View>
        );
    }

    //拨打审批人电话
    callPhoneToRole = (tel) => {
        if (!tel) return;
        if (Platform.OS == 'android')
            Alert.alert(
                lan.call,
                tel,
                [
                    { text: lan.ok, onPress: () => { NativeModules.MyNativeModule.callPhone(tel) } },
                    { text: lan.cancel, onPress: () => { } },
                ]
            );
        else
            NativeModules.MyNativeModule.callPhone(tel);
    }


    //获取员工信息列表
    getEmployeeList = async () => {
        let detail = this.store.detail;
        let personCodes = [this.store.userInfo.EmpCode];
        personCodes = personCodes.concat(Enumerable.from(detail.Persons).select("$.PersonCode").toArray());
        let employee = await this.store.getEmployeeByMyself(personCodes.join(","));
        employee = Enumerable.from(employee).distinct(o => o.PersonCode).toArray();
        let index = employee.findIndex(o => o.PersonCode == this.store.userInfo.EmpCode);
        if (index != -1) {
            let target = employee[index];
            employee.splice(index, 1);
            employee.splice(0, 0, target);
        }
        return employee;
    }

    //底部工具栏，审批中和审批拒绝没有底部工具栏
    getToolbarView = () => {
        let detail = this.store.detail;
        let isPass = false;
        if (detail.AApproveUser) {
            isPass = detail.AApproveUser.every(o => o.IsPass);
        }
        let isFlight = Enumerable.from(detail.Contents).any(o => o.Content.ProductCategoryID == 9 || o.Content.ProductCategoryID == 8);
        let isTrain = Enumerable.from(detail.Contents).any(o => o.Content.ProductCategoryID == 3);
        return (
            /*我发起的，审批通过底部工具栏*/
            <View>
                {this.props.type == 1 && (this.store.detail.StatusID == 1 || this.store.detail.StatusID == 2) ?
                    <Flex style={styles.toolbar}>
                        <Button style={styles.leftBtn} textStyle={styles.leftBtnTxt} onClick={() => this.setApprovalReason(this.props.ID, true)}>{lan.orderDetail_applicateAgree}</Button>
                        <Button style={styles.rightBtn} textStyle={styles.rightBtnTxt} onClick={() => this.setApprovalReason(this.props.ID, false)}>{lan.orderDetail_applicateRefuse}</Button>
                    </Flex> : <Flex style={styles.toolbar}>
                        {this.flights.length > 0 && detail.StatusID == 4 && this.store.userInfo.Account == this.store.detail.ApplicantUserCode &&
                            <Button style={styles.leftBtn} textStyle={styles.leftBtnTxt} onClick={async () => {
                                this.store.isLoading = true;
                                let isIntl = Enumerable.from(detail.Contents).any(o => o.Content.ProductCategoryID == 9);
                                let employee = await this.getEmployeeList();
                                let flights = this.flights;
                                if (isIntl) {
                                    let result = await new Intl().verifyPrice([21], this.flights);
                                    if (result) flights = result;
                                }
                                this.store.isLoading = false;
                                this.props.navigator.push({
                                    component: Booking,
                                    passProps: {
                                        param: {
                                            ticketType: isIntl ? 1 : 0,
                                            tripType: 1,
                                            adultQty: 1,
                                            childQty: 0,
                                            departureDates: new Array(flights.length),
                                            isPrivate: false,
                                            BTANr: { ID: this.props.ID, BTANr: detail.BTANr }
                                        },
                                        info: {
                                            costCenterID: this.store.detail.CostCenterID,
                                            reason: this.store.detail.Reason,
                                        },
                                        employee: employee,
                                        selectedFlights: flights
                                    }
                                })
                            }}>{lan.orderDatail_referProcess}</Button>}
                        {isTrain && detail.StatusID == 4 && this.store.userInfo.Account == this.store.detail.ApplicantUserCode && <Button style={styles.rightBtn} textStyle={styles.rightBtnTxt} onClick={async () => {
                            this.props.navigator.push({
                                component: TrainIndex,
                                passProps: {

                                }
                            })
                        }} >订火车票</Button>}
                        {isFlight && detail.StatusID == 4 && this.store.userInfo.Account == this.store.detail.ApplicantUserCode && <Button style={styles.rightBtn} textStyle={styles.rightBtnTxt} onClick={async () => {
                            this.store.isLoading = true;
                            let isIntl = Enumerable.from(detail.Contents).any(o => o.Content.ProductCategoryID == 9);
                            let employee = await this.getEmployeeList();
                            this.store.isLoading = false;
                            let tripType = 0;
                            let sum = Enumerable.from(detail.Contents).sum(o => {
                                if (o.Content.Segment.TripType == "RT") return 2;
                                else return 1;
                            });
                            if (sum == 2) tripType = 1;
                            else tripType = 2;
                            let obj = {
                                "tripType": tripType,
                                "adultQty": 1,
                                "transportation": 1,
                                "childQty": 0,
                                "isPrivate": false,
                                "berthType": "Y",
                                "ticketType": isIntl ? 1 : 0,
                                "officeIds": [
                                    this.store.userInfo.CorpCode
                                ]
                            };
                            //日期
                            let departureDates = [];
                            for (let item of detail.Contents) {
                                departureDates.push(moment(item.Content.Segment.DepartureDate));
                                if (item.Content.Segment.ArrivalDate)
                                    departureDates.push(moment(item.Content.Segment.ArrivalDate));
                            }
                            obj.departureDates = departureDates;
                            //出发地
                            let departures = [];
                            for (let item of detail.Contents) {
                                departures.push({
                                    "cityName": item.Content.Segment.DepartureCityName,
                                    "isAirport": false,
                                    "isDomestic": isIntl ? false : true,
                                    "cityCode": item.Content.Segment.DepartureCityCode
                                });
                            }
                            obj.departures = departures;
                            //抵达地
                            let arrivals = [];
                            for (let item of detail.Contents) {
                                arrivals.push({
                                    "cityName": item.Content.Segment.ArrivalCityName,
                                    "isAirport": false,
                                    "isDomestic": isIntl ? false : true,
                                    "cityCode": item.Content.Segment.ArrivalCityCode
                                });
                            }
                            obj.arrivals = arrivals;

                            this.props.navigator.push({
                                component: FlightIndex,
                                passProps: {
                                    store: obj,
                                    BTANr: { ID: this.props.ID, BTANr: detail.BTANr },
                                    staffData: employee,
                                    processV2: true,
                                    info: {
                                        costCenterID: this.store.detail.CostCenterID,
                                        reason: this.store.detail.Reason,
                                    },
                                }
                            })
                        }}>{lan.orderDatail_bookTicket}</Button>}
                    </Flex >
                }
                {(this.store.detail.StatusID == 1 || this.store.detail.StatusID == 2) && this.store.userInfo.Account == this.store.detail.ApplicantUserCode && <View style={styles.toolBar}>
                    <TouchableOpacity activeOpacity={0.8} style={[styles.cancelBtn, this.store.detail.StatusID == 6 && { backgroundColor: "#ccc" }]} onPress={async () => {
                        this.alert(lan.orderDatail_isCancel + "？", async () => {
                            if (this.store.detail.StatusID == 6) { Toast.info(lan.orderDatail_applicateClose); return; }
                            await this.store.BTAUpdateStatus(this.props.ID, 6);
                            if (this.props.RefreshEvent)
                                this.props.RefreshEvent(this.props.ID, 6);
                        }
                        )
                    }}>
                        <Text style={styles.cancelBtnTet}>{lan.cancel}</Text>
                    </TouchableOpacity>
                </View>
                }
            </View >

            /*待我审批，底部工具栏
            <Flex style={styles.toolbar}>
                <Button style={styles.leftBtn} textStyle={styles.leftBtnTxt}审批通过</Button>
                <Button style={styles.rightBtn} textStyle={styles.rightBtnTxt}>审批拒绝</Button>
            </Flex>
            */
        );
    }

    toMain = () => {
        storage.load({ key: 'BIZACCOUNTINFO' }).then(v => {
            global.userInfo = JSON.parse(v);
            this.props.navigator.replace({
                name: 'Home',
                component: Home,
                passProps: {
                    IsLogin: false,
                    My_Info: JSON.parse(v).MyInfo,
                    Company_Name: JSON.parse(v).MyInfo.Result.Company.CompanyName,
                    _IsWait: JSON.parse(v).IsWait,
                    UserAccount: JSON.parse(v).MyInfo.Result.Account.UserName,
                    Permission: JSON.parse(v).Permission,
                }
            })
        }).catch(err => {
        });
    }

    //输入审批同意或者拒绝原因
    setApprovalReason = (ID, IsPass) =>{
        Popup.show(
            <View>
                <View style={{backgroundColor:COLORS.primary,height:44,alignItems:'center',flexDirection:'row'}}>
                    <TouchableOpacity style={{flex:1,marginLeft:15,paddingRight:10}} onPress={() => Popup.hide()}>
                        <Text style={{color:'#fff',fontSize:15}}>{lan.cancel}</Text>
                    </TouchableOpacity>
                    <Text style={{flex:5,textAlign:'center',color:'#fff',fontSize:17}}>{lan.remark}</Text>
                    <TouchableOpacity style={{flex:1,marginLeft:15,paddingRight:10}}>
                        <Text style={{color:'#fff',fontSize:15}}></Text>
                    </TouchableOpacity>
                </View>
                <TextInput style={{fontSize:16,textAlignVertical: "top",height:200}} 
                            onChangeText={(txt)=>{this.state.reason = txt;}}
                            placeholder={lan.inputReason} placeholderTextColor='#ccc' 
                            underlineColorAndroid='#fff' 
                            selectionColor='#333'/>
                <TouchableOpacity style={{height:45,backgroundColor:COLORS.btnBg,
                                    alignItems:"center",justifyContent:'center'}}
                                    onPress={()=>{Popup.hide();this.store.addActuallyApproval(ID, IsPass,this.state.reason)}}>
                    <Text style={{color:'#fff',fontSize:16}}>{IsPass?lan.agreeApproval:lan.refuseApproval}</Text>
                </TouchableOpacity>
            </View>,
        { animationType: 'slide-up', maskClosable: false });
    }

    alert = (msg, confirm, cancel) => {
        Alert.alert('', msg, [
            {
                text: lan.ok, onPress: () => {
                    if (confirm)
                        confirm();
                }
            },
            {
                text: lan.cancel, onPress: () => {
                    if (cancel)
                        cancel();
                }
            }
        ])
    }

    //参考的具体行程
    getRoutetripInfo = (flights) => {
        let isIntl = Enumerable.from(this.store.detail.Contents).any(o => o.Content.ProductCategoryID == 9);
        return <Routetrip data={flights} ticketType={isIntl ? 1 : 0} />
    }

    // 随机获取颜色
    getRandomColor() {
        const ColorNum = ['#5ec9f7', '#3bc2b5', '#9a89b9', '#5c6bc0', '#ff943e', '#f75e5e',]
        var index = Math.floor(Math.random() * ColorNum.length);
        return ColorNum[index];
    }


}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.containerBg, },
    orderView: { backgroundColor: '#fff', padding: 10, },
    orderView_item: { marginTop: 5, },
    orderView_label: { color: '#999', fontSize: 15, textAlign: 'right', width: 90, },
    orderView_inner: { color: '#333', fontSize: 15, },
    routebox: { padding: 10, },
    routeTitle: { backgroundColor: '#fff', padding: 10, },
    routeTitle_left: { color: '#666', fontSize: 14, marginRight: 10, },
    routeTitle_icon: { fontSize: 15, },
    routeTitle_right: { color: '#333', fontSize: 16, },
    list_tit: { padding: 15, fontSize: 16, paddingBottom: 5, paddingTop: 10, },
    route_content: { flex: 1, },
    referbox: { backgroundColor: '#fff', padding: 15, paddingBottom: 10, paddingTop: 10, },
    referbox_title: { color: '#666', fontSize: 16, },
    approvalstate: { marginBottom: 10, },
    approvalstate_item: { paddingLeft: 20, paddingRight: 25, },
    approvalstate_left: { position: 'absolute', top: 35, left: 12, zIndex: 2, paddingTop: 5, paddingBottom: 5, backgroundColor: COLORS.containerBg },
    approvalstate_icon: { fontSize: 16, },
    approvalstate_right: { borderLeftColor: '#ddd', borderLeftWidth: 1, paddingLeft: 20, flex: 1, paddingTop: 20, },
    approvalstate_rightinner: { backgroundColor: '#fff', paddingLeft: 15, paddingRight: 15, borderRadius: 5, },
    approvalstate_rightbox: { paddingBottom: 15, paddingTop: 15, borderBottomColor: '#ebebeb', borderBottomWidth: 1 / FLEXBOX.pixel },
    approvalstate_cutoff: { borderTopColor: COLORS.line, borderTopWidth: 0.5, },
    approver_box: { marginLeft: 10, flex: 1, height: FLEXBOX.width * 0.16, flexDirection: 'column', justifyContent: 'space-between' },
    approver: { fontSize: 14, marginTop: 5, color: COLORS.textBase, },
    applicate_state: { color: COLORS.correctColor, marginBottom: 5, fontSize: 12, },
    approvalstate_passtxt: { color: COLORS.correctColor, marginBottom: 5, fontSize: 12, },
    approvalstate_rejecttxt: { color: COLORS.errorColor, marginBottom: 5, fontSize: 12, },
    approvalstate_ongongingtxt: { color: '#999', marginBottom: 5, fontSize: 12, },
    optview_circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1 / FLEXBOX.pixel,
        borderColor: '#ccc',
    },
    optview_txt: { color: '#fff', fontSize: 12, paddingLeft: 5, paddingRight: 5, },
    toolbar: { borderTopColor: '#ddd', borderTopWidth: 1 / FLEXBOX.pixel },
    leftBtn: { borderRadius: 0, borderWidth: 0, flex: 1 },
    rightBtn: { flex: 1, borderRadius: 0, borderWidth: 0, backgroundColor: COLORS.secondary, },
    leftBtnTxt: { color: '#666', fontSize: 16, },
    rightBtnTxt: { color: '#fff', fontSize: 16, },
    cancelBtn: { backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', height: 44 },
    cancelBtnTet: { color: '#fff', fontSize: 16, },
    time: { fontSize: 12, color: '#999' }
});
