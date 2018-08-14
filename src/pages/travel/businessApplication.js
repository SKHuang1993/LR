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
    Navigator,
    Alert
} from 'react-native';

import { WhiteSpace } from 'antd-mobile';
import Picker from '../../components/picker';
import DatePicker from '../../components/date-picker';
import ActivityIndicator from '../../components/activity-indicator';
import Flex from '../../components/flex';
import List from '../../components/list';
import InputItem from '../../components/input-item';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import NavBar from '../../components/navBar/index';
import Icon from '../../components/icons/icon';
import TextareaItem from '../../components/textarea-item';
import ToolBar from '../../components/toolBar/index';
import Button from '../../components/button';
import moment from 'moment';
import Routetrip from './routetrip';
import FlightIndex from '../flight/';
import OrderDetail from './orderDetail';
import Staff from '../staff/';
import { observer } from 'mobx-react/native';
import { toJS } from 'mobx'
import Travel from '../../stores/travel/';
import { AccountInfo } from '../../utils/data-access/';
import Form from '../../components/form/';
import Enumerable from 'linq';

import Travelapplicate from './travelapplicate';

import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

@observer
export default class BusinessApplication extends React.Component {
    constructor(props) {
        super(props);
        this.getField = new Form(false).getField;
        this.store = new Travel();
        this.store.userInfo = AccountInfo.getUserInfo();
        this.store.getTravelReasonList();
        this.store.getCusApproveUserByUserCode();
        this.store.costGetList();
        this.store.getPolicy(this.store.userInfo.PolicyDetail.PolicyID);
    }
    render() {
        return (
            <View style={styles.container}>
                <NavBar title={lan.businessApplication_tripApplicate} navigator={this.props.navigator} rightText={'列表'} onRightClick={() => {
                    let storage = global.storage;
                    storage.load({ key: 'USERINFO' }).then(val => {
                        if (val != null) {
                            let userInfo = JSON.parse(val);
                            this.props.navigator.push({
                                component: Travelapplicate,
                                passProps: {
                                    AccountNo: userInfo.AccountNo,
                                }
                            })
                        }
                    }).catch(err => {
                        console.log(err)
                    });

                }

                } />
                <ScrollView>
                    <Form ref="form">
                        <List>
                            <Picker
                                {...this.getField(this.store.travelPurposeID ? [this.store.travelPurposeID] : null) }
                                data={this.store.travelReasonList} cols={1}
                                title={lan.orderDetail_tripReason}
                                extra={lan.businessApplication_selectReason}
                                value={this.store.travelPurposeID ? [this.store.travelPurposeID] : null}
                                onChange={(val) => this.store.travelPurposeID = val[0]}>
                                <List.Item labelNumber={5} arrow="horizontal"  >{lan.orderDetail_tripReason}</List.Item>
                            </Picker>
                            {this.store.travelPurposeID == -2 ?
                                <TextareaItem
                                    labelNumber={5}
                                    title={lan.businessApplication_custom}
                                    placeholder={lan.orderDetail_tripReason}
                                    data-seed="logId"
                                    autoHeight
                                    {...this.getField(this.store.travelPurpose) }
                                    value={this.store.travelPurpose}
                                    onChange={(val) => this.store.travelPurpose = val}
                                />
                                : null}
                            <Picker
                                {...this.getField(this.store.costCenterID ? [this.store.costCenterID] : null) }
                                data={this.store.costList} cols={1}
                                title={lan.orderDetail_costCenter}
                                extra={lan.businessApplication_costCenter}
                                value={this.store.costCenterID ? [this.store.costCenterID] : null}
                                onChange={(val) => this.store.costCenterID = val[0]}>
                                <List.Item labelNumber={5} arrow="horizontal"  >{lan.orderDetail_costCenter}</List.Item>
                            </Picker>
                        </List>
                        {/*行程列表*/}
                        {this.store.trips.map((o, i) =>
                            this.getRouteListView(o, i))}

                        {/*新增行程*/}
                        <TouchableHighlight underlayColor={'#ffffff66'} activeOpacity={0.8} style={styles.addRoute_btn} onPress={() => {
                            let trip = this.store.trips[this.store.trips.length - 1];
                            let departureDate = trip.departureDates[trip.departureDates.length - 1];
                            let arrival = trip.arrivals.length > 0 ? trip.arrivals[trip.departures.length - 1] : null;
                            this.store.trips.push({
                                transportation: 1,
                                tripType: 1,
                                adultQty: 1,
                                childQty: 0,
                                isPrivate: false,
                                berthType: 'Y',
                                departures: [arrival],
                                departureDates: [departureDate, moment(departureDate).add(5, 'd')],
                                arrivals: [],
                                referenceTrips: []
                            });
                        }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ color: COLORS.textLight, fontSize: 18 }}>{lan.businessApplication_addTrip}</Text>
                            </View>
                        </TouchableHighlight>

                        {/*出差天数*/}
                        <List>
                            <InputItem
                                {...this.getField(this.store.totalDays) }
                                placeholder={lan.businessApplication_inputBusTravelDays}
                                type="number"
                                labelNumber={5} type='number'
                                value={this.store.totalDays}
                                onChange={(val) => this.store.totalDays = val}
                            >{lan.businessApplication_busTravelDays}</InputItem>
                        </List>

                        {/*差旅政策*/}
                        {this.store.getPolicies ?
                            <View>
                                <View><Text style={styles.list_tit}>{lan.orderDatail_travelPolicy}</Text></View>
                                <List>
                                    {this.store.getPolicies.map((o, i) =>
                                        <List.Item key={i}>
                                            <View>
                                                <Text>
                                                    <Icon icon={'0xe67a'} style={{ color: COLORS.secondary, }} />{o}</Text>
                                            </View>
                                        </List.Item>)}
                                </List>
                            </View> : null}
                        <WhiteSpace size='lg' />
                        {/*同行人*/}
                        <View style={styles.approvalbox}>
                            <Flex justify='start'>
                                <Text style={styles.approvalbox_title}>{lan.orderDetail_fellowWorker}</Text>
                                <Text style={{ fontSize: 12, color: '#999' }}>{"（" + lan.businessApplication_clickDelete + "）"}</Text>
                            </Flex>
                            <Flex justify='start' wrap='wrap' align='start' style={styles.optview_box}>
                                {/*选择的同行人 start*/}
                                {this.store.staffData.map((o, i) =>
                                    <Flex justify='start' align='start' key={i}>
                                        <TouchableOpacity activeOpacity={0.9} style={styles.optview} onPress={() => {
                                            this.store.staffData.remove(o);
                                        }}>
                                            <View style={[styles.optview_circle, { backgroundColor: this.getRandomColor(), }]}>
                                                <Text style={styles.optview_txt} numberOfLines={1} ellipsizeMode='tail'>{o.PersonName}</Text>
                                            </View>
                                            <View style={styles.optview_text}>
                                                <Text>{o.PersonName}</Text>
                                            </View>

                                        </TouchableOpacity>
                                        {/*分隔线*/}
                                        <View style={styles.cutoff}><Text style={styles.cutoff_line}>－</Text></View>
                                    </Flex>
                                )}
                                {/*分隔线*/}
                                {/*{this.store.staffData.length  ?
                                    <View style={styles.cutoff}><Text style={styles.cutoff_line}></Text></View> : null}*/}
                                {/*选择的同行人 end*/}

                                <TouchableOpacity activeOpacity={0.8} onPress={() => {
                                    this.props.navigator.push({
                                        component: Staff,
                                        passProps: {
                                            type: 1,//选择的同行人
                                            routetrip: this.store,
                                            staffData: toJS(this.store.staffData),
                                            productType: this.store.ticketType,
                                            checkedData: (val) => {
                                                this.store.staffData = val
                                            }
                                        },

                                    })
                                }}>
                                    <View style={styles.optview}>
                                        <View style={styles.optview_circle}>
                                            <Text style={styles.optview_txt}><Icon icon={'0xe680'} /></Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                            </Flex>
                        </View>

                        {/*审批人*/}
                        {this.store.userRoles && this.store.userRoles.length > 0 &&
                            <View style={styles.approvalbox}>
                                <Flex justify='start'>
                                    <Text style={styles.approvalbox_title}>{lan.businessApplication_approver}</Text>
                                    <Text style={{ fontSize: 12, color: '#999' }}>{"（" + lan.businessApplication_backstageConfigure + "）"}</Text>
                                </Flex>
                                <Flex justify='start' wrap='wrap' align='start' style={styles.optview_box}>
                                    {Enumerable.from(this.store.userRoles.map((o, i) => {
                                        let items = Enumerable.from(o.userRoles.map((o, j) =>
                                            <View style={styles.optview}>
                                                <View style={[styles.optview_circle, { backgroundColor: this.getRandomColor(), }]}>
                                                    <Text style={styles.optview_txt} numberOfLines={1} ellipsizeMode='tail'>{o.UserName}</Text>
                                                </View>
                                                <View style={styles.optview_text}>
                                                    <Text numberOfLines={1}>{o.UserName}</Text>
                                                </View>
                                            </View>)
                                        ).alternate(<View style={styles.cutoff}><Text style={[styles.cutoff_line, styles.cutoff_rotate]}>/</Text></View>).toArray();
                                        if (i < this.store.userRoles.length - 1)
                                            items.push(<View style={styles.cutoff}><Text style={styles.cutoff_arrow}><Icon icon={'0xe69a'} style={{ color: '#999' }} /></Text></View>)
                                        return items;
                                    })).toArray()
                                    }
                                </Flex>
                            </View>}
                    </Form>
                </ScrollView>
                {/*底部工具栏*/}
                <View>
                    <TouchableOpacity style={styles.toolBar} activeOpacity={0.8} onPress={() => {
                        this.refs.form.validateFields(async (error) => {
                            if (!error) {
                                let result = await this.store.createBusinessTripApplication();
                                if (result.Code == -1) {
                                    Alert.alert(result.Msg);
                                    return;
                                }
                                this.props.navigator.push({
                                    component: OrderDetail,
                                    passProps: {
                                        ID: result.ID
                                    },
                                })
                            }
                        });
                    }}>
                        <Text style={styles.toolBar_btnText}>{lan.businessApplication_submit}</Text>
                    </TouchableOpacity>
                </View>
                <ActivityIndicator toast text={lan.businessApplication_submitting} animating={this.store.isLoading} />
            </View>
        );
    }

    //行程列表
    getRouteListView = (o, i) => {
        return (
            <View style={styles.route_list} key={i}>
                <View><Text style={styles.list_tit}>{lan.businessApplication_trip}{i + 1}*</Text></View>
                <Flex justify='between' align='stretch'>
                    <List style={styles.route_content}>
                        <Picker
                            {...this.getField(o.transportation ? [o.transportation] : null) }
                            data={this.store.transportations} cols={1}
                            title={lan.businessApplication_vehicle}
                            extra={lan.businessApplication_selectVehicle}
                            value={o.transportation ? [o.transportation] : null}
                            onChange={(val) => o.transportation = val[0]}
                        >
                            <List.Item labelNumber={5} arrow="horizontal" >{lan.businessApplication_vehicle}</List.Item>
                        </Picker>
                        <Picker
                            data={this.store.tripTypes} cols={1}
                            title={lan.businessApplication_way}
                            extra={lan.businessApplication_select}
                            value={[o.tripType]}
                            onChange={(tripType) => o.tripType = tripType[0]}
                        >
                            <List.Item labelNumber={5} arrow="horizontal" >{lan.businessApplication_way}</List.Item>
                        </Picker>

                        <List.Item arrow="horizontal"
                            labelNumber={5}
                            onClick={() => this.store.setDepartures(o, 0)}
                            {...this.getField(o.departures.length > 0 && o.departures[0] ? o.departures[0].cityName : null) }
                            optional={false}
                            extra={o.departures.length > 0 && o.departures[0] ? <Text style={{ color: '#333', flex: 1, fontSize: 16 }}>{o.departures[0].cityName}</Text> : "请选择出发城市"}>出发城市</List.Item>

                        <List.Item arrow="horizontal"
                            labelNumber={5}
                            {...this.getField(o.arrivals.length > 0 && o.arrivals[0] ? o.arrivals[0].cityName : null) }
                            errorInfo={lan.businessApplication_noIdentical}
                            validator={() => {
                                if (o.departures.length > 0 && o.departures[0] && o.arrivals.length > 0 && o.arrivals[0] &&
                                    o.departures[0].cityCode == o.arrivals[0].cityCode)
                                    return false
                                return true;
                            }}
                            onClick={() => this.store.setDepartures(o, 1)}
                            optional={false}
                            extra={o.arrivals.length > 0 && o.arrivals[0] ? <Text style={{ color: '#333', flex: 1, fontSize: 16 }}>{o.arrivals[0].cityName}</Text> : "请选择到达城市"}>到达城市</List.Item>

                        <DatePicker
                            mode="date"
                            title={lan.businessApplication_startTime}
                            extra={lan.businessApplication_selectStartTime}
                            {...this.getField(o.departureDates[0]) }
                            minDate={moment()}
                            maxDate={o.departureDates[1]}
                            value={o.departureDates[0]}
                            onChange={(date) => o.departureDates[0] = date}
                        >
                            <List.Item labelNumber={5} arrow="horizontal" >{lan.businessApplication_startTime}</List.Item>
                        </DatePicker>

                        <DatePicker
                            mode="date"
                            title={lan.businessApplication_endTime}
                            extra={lan.businessApplication_selectEndTime}
                            {...this.getField(o.departureDates[1]) }
                            minDate={o.departureDates[0]}
                            value={o.departureDates[1]}
                            onChange={(date) => o.departureDates[1] = date}
                        >
                            <List.Item labelNumber={5} arrow="horizontal">{lan.businessApplication_endTime}</List.Item>
                        </DatePicker>
                        {/*参考行程*/}
                        {o.transportation == 1 ?
                            <TouchableOpacity activeOpacity={0.8} onPress={() => {
                                if (o.departures.length == 0) {
                                    Alert.alert(lan.flights_please_select_departure);
                                    return;
                                }
                                if (o.arrivals.length == 0) {
                                    Alert.alert(lan.flights_please_select_arrival);
                                    return;
                                }
                                o.officeIds = [this.store.userInfo.CorpCode];
                                this.props.navigator.push({
                                    component: FlightIndex,
                                    passProps: {
                                        store: o,
                                        title: lan.businessApplication_selectTrip,
                                        processV2: true
                                    },

                                })
                            }}>
                                <Flex justify='between' style={styles.referbox}>
                                    <Flex justify='start'>
                                        <Text style={styles.referbox_title}>{lan.orderDatail_referTrip}</Text>
                                        <Text style={{ color: "#999" }}>{"(" + lan.businessApplication_selectOrNo + ")"}</Text>
                                    </Flex>
                                    <View style={styles.refer_arrow}>
                                        <Text><Icon icon={'0xe677'} /></Text>
                                    </View>
                                </Flex>
                            </TouchableOpacity>
                            : null}
                    </List>
                    {i > 0 ?
                        <View style={styles.del_stroke}>
                            <TouchableOpacity activeOpacity={0.6} style={{ padding: 10 }} onPress={() => {
                                this.store.trips.remove(o);
                            }}>
                                <Icon icon={'0xe67c'} style={styles.delIcon} />
                            </TouchableOpacity>
                        </View> : null
                    }
                </Flex>
                {/*行程单*/}
                {this.getRoutetripInfo(o.referenceTrips, o.ticketType)}
            </View>
        );
    }

    //参考的具体行程
    getRoutetripInfo = (flights, ticketType) => {
        return <Routetrip data={flights} allowDelete ticketType={ticketType} />
    }

    // 随机获取颜色
    getRandomColor() {
        const ColorNum = ['#5ec9f7', '#3bc2b5', '#9a89b9', '#5c6bc0', '#ff943e', '#f75e5e',];
        var index = Math.floor(Math.random() * ColorNum.length);
        return ColorNum[index];
    }


}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.containerBg, },
    list_tit: { padding: 15, fontSize: 16, paddingBottom: 5, },
    route_content: { flex: 1, },
    del_stroke: { backgroundColor: '#fff', flex: 0, justifyContent: 'center', alignItems: 'center' },
    delIcon: {},
    listItem_cutoff: { borderColor: '#ddd', borderBottomWidth: 0.5, },
    addRoute_btn: {
        height: 50,
        margin: 50,
        marginBottom: 20,
        marginTop: 20,
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    contentContainer: {},
    route_inp: { color: '#333', },
    referbox: { backgroundColor: '#fff', padding: 15, },
    referbox_title: { fontSize: 16, marginRight: 8 },
    approvalbox: { backgroundColor: '#fff', padding: 15, marginTop: 10, },
    approvalbox_title: { color: '#666', fontSize: 16, },
    optview_box: { paddingTop: 10, },
    optview: { alignItems: 'center', width: FLEXBOX.width * 0.16, marginBottom: 10, },
    optview_circle: {
        width: FLEXBOX.width * 0.16,
        height: FLEXBOX.width * 0.16,
        borderRadius: FLEXBOX.width * 0.08,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1 / FLEXBOX.pixel,
        borderColor: '#ccc',
    },
    optview_txt: { color: '#fff', fontSize: 12, paddingLeft: 5, paddingRight: 5, },
    optview_text: { alignItems: 'center', width: FLEXBOX.width * 0.18, marginTop: 2, },
    cutoff: { width: FLEXBOX.width * 0.08, height: FLEXBOX.width * 0.16, alignItems: 'center', justifyContent: 'center', },
    cutoff_rotate: { transform: [{ rotate: '-45deg' }], },
    cutoff_line: { width: 15, height: 0.5, backgroundColor: '#999', },
    cutoff_arrow: { width: 20, color: '#999' },
    toolBar: { backgroundColor: COLORS.secondary, borderTopColor: '#ddd', height: 44, alignItems: 'center', justifyContent: 'center', },
    toolBar_btn: { color: '#fff' },
    toolBar_btnText: { color: '#fff', fontSize: 16, },
});
