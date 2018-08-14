import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    StatusBar,
    ScrollView,
    Animated,
    Easing,
    TextInput,
    Navigator, BackAndroid, TouchableOpacity, Alert, TouchableHighlight, InteractionManager
} from 'react-native';

import { WhiteSpace } from 'antd-mobile';
import List from '../../components/list';
import Flex from '../../components/flex';
import NavBar from '../../components/navBar';
import Picker from '../../components/picker';
import Icon from '../../components/icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../../components/button';
import TabButton from '../../components/tabButton/';
import Checkbox from '../../components/checkbox';
import SearchAirRequest from '../../stores/flight/'
import { observer } from 'mobx-react/native'
import { observable, extendObservable, toJS } from 'mobx';
import Staff from '../../pages/staff';
import HotelsList from '../../pages/hotels/list';
import Enumerable from 'linq';
import moment from 'moment'
import { AccountInfo, CabinInfo } from '../../utils/data-access/';
const AgreeItem = Checkbox.AgreeItem;
const CheckboxItem = Checkbox.CheckboxItem;
import { BaseComponent } from '../../components/locale';
import Hotel from '../../stores/hotel/';
let lan = BaseComponent.getLocale();

@observer
class Index extends Component {
    constructor(props) {
        super(props);
        this.store = new Hotel(AccountInfo.getUserInfo());
        this.store.getHistory();

        this.state = {
            activeSwitch: '1',
            cabinVal: CabinInfo.getCabinList(),
            roomNumberData: [{
                "value": 1,
                "label": `1${lan.jian}`,
            },
            {
                "value": 2,
                "label": `2${lan.jian}`,
            }
            ],
            roomPeopleData: [{
                "value": 1,
                "label": `1${lan.adult}`,
            },
            {
                "value": 2,
                "label": `2${lan.adult}`,
            },
            {
                "value": 3,
                "label": `3${lan.adult}`,
            },
            {
                "value": 4,
                "label": `4${lan.adult}`,
            },
            {
                "value": 5,
                "label": `1${lan.adult}`,
            }
            ],
            roomNumber: [1],
            roomPeople: [1]

        };
    }


    componentDidMount() {
        if (this.props.booker) {
            this.store.forMyself = !this.store.forMyself;
            this.store.staffData.splice(0, 0, this.props.booker);
        }
    }

    onTabClick(key) {

    }

    //员工信息
    getStaffData() {
        return Enumerable.from(this.store.staffData).select("$.PersonName").toArray().join("、");
    }

    // 导航 右边内容
    navRightView() {
        return (
            <TabButton style={styles.switch}
                tabNames={[lan.onBusiness, lan.onPrivate]}
                textActiveStyle={styles.switch_txt_acitve}
                textStyle={styles.switch_txt}
                tabStyle={styles.switch_tab}
                tabActiveStyle={styles.switch_tabActive}
                radius={3}
                activeTab={0} onClink={(i) => { this.store.isPrivate = i == 1 }} />
        )
    }

    pushToStaff = () => {
        if (this.props.navigator) {
            this.props.navigator.push({
                component: Staff,
                type: 'Bottom',
                passProps: {
                    productType: 2,
                    staffData: toJS(this.store.staffData),
                    limitNum: this.store.request.Adult * this.store.request.RoomCount,
                    checkedData: (val) => {
                        this.store.staffData = val;
                    }
                }
            })
        }
    }

    //跳转酒店列表
    pushToHotelList = () => {
        let num = this.store.request.Adult * this.store.request.RoomCount;
        if (!this.store.isPrivate && num != this.store.staffData.length) {
            Alert.alert(`${lan.select}${num}${lan.employee}`);
            return;
        }
        if (!this.store.request.DistrictCode) {
            Alert.alert(lan.hotels_BusinessCityHint);
            return;
        }
        if (!this.store.isPrivate && this.store.staffData.length == 0) {
            Alert.alert(lan.hotels_BusinessEmployee);
            return;
        }
        if (moment(this.store.request.CheckInDate)
            .isBefore(moment(moment().format('YYYY-MM-DD')))) {
            Alert.alert(lan.hotels_InTimeLessThanNowTime);
            return false;
        }
        this.store.saveHistory();
        //this.store.request.OfficeID = this.store.userInfo.CorpCode;
        this.store.request.OfficeID = "21";
        if (this.store.staffData.length > 0)
            this.store.request.StaffCode = this.store.staffData[0].PersonCode;
        if (this.props.navigator) {
            this.props.navigator.push({
                component: HotelsList,
                passProps: {
                    param: toJS(this.store.request),
                    keyWords: this.state.keyWords,
                    isPrivate: this.store.isPrivate,
                    employee: this.store.staffData
                }
            })
        }

    }

    render() {

        return (
            <View style={styles.container}>
                <NavBar title={this.props.title || lan.hotels} navigator={this.props.navigator} />
                <ScrollView style={styles.scrollView}>
                    <TouchableOpacity style={[styles.box,]} activeOpacity={.8} onPress={() => this.store.setDistrict()}>
                        <Text style={[styles.city, !this.store.request.DistrictName && { color: "#C7C7CD" }]}>
                            {this.store.request.DistrictName ? this.store.request.DistrictName : lan.hotels_BusinessCity}
                        </Text>
                    </TouchableOpacity>

                    <View style={[styles.box, FLEXBOX.flexBetween,]}>
                        <TouchableOpacity style={styles.date} activeOpacity={1} onPress={() => this.store.setCheckInDate()}>
                            <Text style={[styles.dateTitle]}>
                                {lan.checkIn}
                            </Text>
                            <Text style={[styles.dateMain]}>
                                {moment(this.store.request.CheckInDate).format("L")}
                                {/* <Text style={styles.dateWeek}>&nbsp;{moment(this.store.request.CheckInDate).format("ddd")}</Text> */}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.days}>
                            <View style={styles.daysLine}></View>
                            <View style={styles.daysNumber}>
                                {lan.lang == 'EN' ? <Text style={styles.daysText}>{this.store.getDiffDays}{lan.night}</Text> : <Text style={styles.daysText}>共{this.store.getDiffDays}晚</Text>}

                            </View>
                        </View>
                        <TouchableOpacity style={[styles.date, styles.dateRight]} activeOpacity={1} onPress={() => this.store.setCheckOutDate(this.store.request.CheckInDate)}>
                            <Text style={[styles.dateTitle, styles.dateTitleLeft]}>
                                {lan.checkOut}
                            </Text>
                            <Text style={[styles.dateMain, styles.dateMainLeft]}>
                                {moment(this.store.request.CheckOutDate).format("L")}
                                {/* <Text style={styles.dateWeek}>&nbsp;{moment(this.store.request.CheckOutDate).format("ddd")}</Text> */}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {/*关键词  */}
                    <View style={[styles.box, FLEXBOX.flexBetween,]}>
                        <TextInput
                            style={styles.search}
                            underlineColorAndroid='transparent'
                            onChangeText={(keyWords) => this.setState({ keyWords })}
                            placeholder={lan.hotels_searchKey}
                            value={this.state.text}
                        />
                    </View>
                    {/*房间数   Picker 需要优化 */}
                    <View style={[FLEXBOX.flexBetween, FLEXBOX.bottomSpace]} >
                        <View style={{ flex: .45, marginRight: 10 }}>
                            <Picker
                                data={this.state.roomNumberData} cols={1}
                                title={lan.roomNum}
                                value={[this.store.request.RoomCount]}
                                triggerType="onClick"
                                onChange={(val) => { this.store.request.RoomCount = val[0] }}>
                                <List.Item labelNumber={3}    >
                                    <Text style={styles.label}>{lan.roomNum}</Text>
                                </List.Item>
                            </Picker>
                        </View>
                        <View style={{ flex: .55 }}>
                            <Picker

                                data={this.state.roomPeopleData} cols={1}
                                title={lan.hotels_employeeNum}
                                value={[this.store.request.Adult]}
                                triggerType="onClick"
                                onChange={(val) => { this.store.request.Adult = val[0] }}>
                                <List.Item labelNumber={4}    >
                                    <Text style={styles.label}>{lan.hotels_everyroom}</Text>
                                </List.Item>
                            </Picker>
                        </View>

                    </View>
                    {/* 出差员工  */}
                    {/* 已选择的状态 extra="林琴" */}
                    {!this.store.isPrivate &&
                        <List.Item extra={this.store.staffData.length == 0 ? lan.hotels_selectEmployee : this.getStaffData()} arrow="horizontal" onClick={() => this.pushToStaff()} >
                            <Text style={styles.label}>{lan.hotels_businessEmployee}</Text>
                        </List.Item>}
                    {/*从通讯录选择的用户*/}
                    {this.props.booker &&
                        <Flex style={[styles.box, styles.staff]}>
                            <View style={styles.staffLeft}>
                                <AgreeItem style={styles.staffItem} checked={true} onChange={(event) => {
                                }} >{`为${this.props.booker.Name}预订`}</AgreeItem>
                            </View>

                        </Flex>}
                    {/*搜索按钮  */}
                    <Button style={styles.confirmBtn} textStyle={styles.confirmBtnTxt} onClick={() => this.pushToHotelList()}>{lan.search}</Button>
                    {/* 历史  */}
                    <ScrollView ref='historyScrollView' horizontal={true} showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: 'row', }} onLayout={this.historyLayout}  >
                            {this.store.records.map((o, i) => <TouchableOpacity key={i} activeOpacity={.7} onPress={() => {
                                this.store.setCurrentHistory(o);
                            }}>
                                <Text style={styles.record_item}>{this.store.getHistoryItemText(o)}</Text>
                            </TouchableOpacity>)}
                        </View>
                    </ScrollView>
                    {this.store.records.length > 0 &&
                        <TouchableOpacity onPress={() => { this.store.clearHistory() }} style={styles.clear_record_btn}>
                            <Text style={{ color: '#66666666', fontSize: 14 }}>{lan.flights_clearHistory}</Text>
                        </TouchableOpacity>
                    }
                </ScrollView>
            </View>
        )
    }
}








const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.containerBg,
    },

    city: {
        flex: 1,
        justifyContent: 'center',
        padding: 0,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 16,




    },
    days: {
        flex: .2,

    },
    dateTitle: {
        color: '#999',
        marginBottom: 5,
    },
    dateMain: {
        fontSize: 18,
    },
    dateWeek: {
        color: '#999',
        fontSize: 12,

    },
    dateTitleLeft: {
        textAlign: 'right'
    },
    label: { color: '#999' },

    daysNumber: {
        borderWidth: 2 / FLEXBOX.pixel,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 2,
        backgroundColor: '#fff',
        marginTop: 8,
        width: 55,
    },
    daysText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
    },
    daysLine: {
        height: 40,
        width: 1,
        backgroundColor: '#ddd',
        position: 'absolute',
        left: 28,
    },
    date: {
        flex: .4,

    },
    dateRight: {

    },
    dateMainLeft: {
        textAlign: 'right'
    },



    confirmBtn: {

        backgroundColor: COLORS.secondary,
        marginBottom: 10,
        marginTop: 10,
    },
    confirmBtnTxt: { color: '#fff' },
    search: {

        flex: 1,
        // paddingTop: 10,
        padding: 0,
        height: 40,
        /// paddingBottom: 10,
        marginLeft: 0,



    },

    historyBtn: {
        width: 70,
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },


    //机票
    scrollView: {
        padding: 5,
        paddingTop: 10
    },
    box: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        // paddingLeft:5,
        // paddingRight:5,
    },

    //切换
    switch: {
        borderColor: '#fff',
        borderWidth: 1 / FLEXBOX.pixel,
        // borderRadius: 3,
        width: 70,
        height: 25,
        backgroundColor: 'transparent',
        //overflow: 'hidden'
    },
    switch_tab: {
        flex: 1,
        backgroundColor: 'transparent',
        padding: 2,
        alignItems: 'center',


    },
    switch_tabActive: {
        backgroundColor: "#fff",

    },
    switch_txt: {
        fontSize: 12,
        color: '#fff'
    },
    switch_txt_acitve: {
        color: '#333'
    },
    record_item: {
        marginTop: 15,
        marginRight: 20,
        color: '#999',
        fontSize: 13,
        textDecorationLine: 'underline'
    },
    clear_record_btn: {
        marginTop: 25,
        marginBottom: 25,
        alignSelf: 'center',
    },
    addLeg_btn: {
        height: 40,
        marginBottom: 10,
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4
    },
    addIcon: {
        fontSize: 13,
        color: COLORS.secondary,
        marginRight: 8
    },
    //tab 切换
    tabButton: {
        borderBottomWidth: 1 / FLEXBOX.pixel,
        borderBottomColor: '#ddd'
    },
    tabButtonAT: {
        color: '#333'
    },
    tabButtonT: {
        color: '#999'
    },
    tabButtonAI: {
        borderBottomColor: COLORS.secondary,
        paddingLeft: 10,
        paddingRight: 10,
    },
    tabButtonI: {
        borderBottomWidth: 3 / FLEXBOX.pixel,
        borderBottomColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    staff: {
        flex: 1,
        //padding: 10,
        flexDirection: 'row',
        marginBottom: 10,
    },
    staffRight: {
        flex: .5,
        paddingTop: 8,
        paddingBottom: 8,
        alignItems: 'center',
        //backgroundColor: 'blue',
        flexDirection: 'row',
        justifyContent: 'flex-end',

    },
    staffLeft: {
        flex: .5
    },
    staffText: {
        flex: .6
    },
});

export default Index