

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
    Animated
} from 'react-native';

import { List, WhiteSpace, Picker, Popup, NoticeBar } from 'antd-mobile';
import ActivityIndicator from '../../components/activity-indicator';
import Flex from '../../components/flex';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../../components/button';
//import AccordionExample from '../demo/collapsible'
import DomesticFlight from '../../stores/flight/domestic'
import Accordion from 'react-native-collapsible/Accordion';
import FlightList from '../../components/flight/domestic';
import Detail from '../../pages/trains/detail';
import { observer } from 'mobx-react/native';
import ToolBar from '../../components/toolBar/';
import Filter from './filter';
import Enumerable from 'linq';
import moment from 'moment';
//import Marquee from '../../components/@remobile/react-native-marquee';
//import Marquee from '@remobile/react-native-marquee-label';
import Marquee from '../../components/marquee';
import NoDataTip from '../../components/noDataTip.1';
import { AccountInfo, CabinInfo } from '../../utils/data-access/';
import { BaseComponent } from '../../components/locale';
import FormatPrice from '../../components/formatPrice'
import TrainList from '../../stores/train/list';
let lan = BaseComponent.getLocale();

@observer
export default class DomesticList extends Component {
    constructor(props) {
        super(props);
        this.store = new TrainList(props);
        this.state = {
            actions: [
                {
                    title: lan.filter, icon: '0xe675',
                    aloneActiveTab: false,
                    onPress: () => {
                        //this.setState({ activeTab: 0 });
                        this.setState({ filterActiveTab: true });
                        Popup.show(
                            this.getPopupContent(1, this.store.getFlightCondition()),
                            {
                                maskClosable: true,
                                animationType: 'slide-up',
                                onMaskClose: () => { }
                            }
                        )
                    }
                },
                {
                    title: lan.flights_filter_nightToMorning, icon: '0xe670', onPress: () => {
                        if (this.store.filterData.length == 0) return;
                        this.state.actions[1].title = !this.store.isEarlyToLate ? lan.flights_filter_morningToNight : lan.flights_filter_nightToMorning;
                        this.store.orderByDepartureDate();
                        this.setState({ actions: this.state.actions, activeTab: 1 });
                        this.scrollToTop();
                    }
                },
                {
                    title: lan.flights_filter_lowToHight, icon: '0xe681', onPress: () => {
                        if (this.store.filterData.length == 0) return;
                        this.state.actions[2].title = !this.store.isLowToHight ? lan.flights_filter_lowToHight : lan.flights_filter_hightToLow;
                        this.store.orderByPrice();
                        this.setState({ actions: this.state.actions, activeTab: 2 });
                        this.scrollToTop();
                    }
                },
            ],
            activeTab: 2,




        }
    }

    scrollToTop = () => {
        setTimeout(() => {
            if (this.refs.FlightList)
                this.refs.FlightList.getScrollResponder().scrollTo({ x: 0, y: 0, animated: false })
        }, 0);
    }

    getPopupContent = (num, data) => {
        let beforeData = data;
        return (
            <Filter data={data} getFilterData={(data) => {
                this.getFilterData(data);
                // 底部筛选白点状态， 目前只判断点击筛选确定按钮都改变筛选修改状态
                let stateActions = this.state.actions;
                stateActions[0].aloneActiveTab = true;
                this.setState({
                    actions: stateActions
                })
            }} />
        );
    }

    //获取筛选数据
    getFilterData(data) {

        this.store.flightCondition = data;
        this.store.execSifteData(data);
        this.scrollToTop();
    }

    componentDidMount() {
        setTimeout(() =>
            this.store.getTrainList(), 500);
    }
    componentWillUnmount() {
        //this.marquee()
    }



    // 国内列表 右边信息

    domesticRightInfo(data) {
        return (
            <Flex.Item style={styles.mainRight}>
                {FormatPrice(data.wz, '', 18, null, lan.flights_priceUp)}

            </Flex.Item>
        )
    }
    // 座位余票状态
    seatTickets = (title, number) => {
        return <Text style={{ flex: .25, color: number > 0 ? '#666' : '#999', fontSize: 12, }}>{title}:{number == "-" ? 0 : number}张</Text>
    }

    _renderRow = (rowData, sectionID) => {
        let arrivalDate = moment(this.props.param.departureDates[0] + "T" + rowData.from_time).add(rowData.cost_time, 'm').format("YYYY-MM-DD");
        let days = moment(arrivalDate).diff(moment(this.props.param.departureDates[0]), 'd');
        //字体长度
        getBLen = function (str) {
            if (str == null) return 0;
            if (typeof str != "string") {
                str += "";
            }
            return str.replace(/[^\x00-\xff]/g, "01").length;
        }
        return (
            <TouchableOpacity activeOpacity={.7} style={styles.list} onPress={() => {
                this.props.navigator.push({
                    component: Detail,
                    passProps: {
                        param: this.store.request,
                        data: rowData,
                        employee: this.props.employee,
                        toChange: this.props.toChange,
                        orderDetail: this.props.orderDetail
                    },
                })
            }}>
                <Flex justify="between" >
                    <Flex.Item style={styles.mainTrip}>
                        <Text style={[styles.time, styles.timeLeft]} >{rowData.from_time}</Text>
                        <View style={[styles.airportBox, styles.airportBoxLeft]} >
                            <Text numberOfLines={getBLen(lan.lang == "ZH" ? rowData.from_station : 'CEN') > 9 ? 1 : 0} style={[styles.airport, getBLen(lan.lang == "ZH" ? rowData.from_station : 'CEN') < 9 ? { flex: 0 } : null]} >
                                {lan.lang == "ZH" ? rowData.from_station : 'CEN'}
                            </Text>

                        </View>
                    </Flex.Item>
                    <Flex.Item style={styles.mainStops}>
                        <Text style={styles.stops}>{rowData.train_code}</Text>
                        <View style={styles.toLine}></View>
                        <Text style={styles.stopsCity}>{`${parseInt(rowData.cost_time / 60)}h${parseInt(rowData.cost_time % 60)}m`}</Text>
                    </Flex.Item>

                    <Flex.Item style={styles.mainTrip}>
                        <Text style={[styles.time, styles.timeRight]} >{rowData.arrive_time}<Text style={styles.nextDay}>{days > 0 ? `+${days}` : ""}</Text></Text>
                        <View style={[styles.airportBox, styles.airportBoxRight]} >
                            <Text numberOfLines={getBLen(lan.lang == "ZH" ? rowData.arrive_station : 'CEN') > 9 ? 1 : 0} style={[styles.airport, getBLen(lan.lang == "ZH" ? rowData.arrive_station : 'CEN') < 9 ? { flex: 0 } : null]} >
                                {lan.lang == "ZH" ? rowData.arrive_station : 'CEN'}
                            </Text>

                        </View>
                    </Flex.Item>
                    {/*list 右边信息*/}
                    {this.domesticRightInfo(rowData)}
                </Flex>{(rowData.train_code.substr(0, 1) === "G" || rowData.train_code.substr(0, 1) === "D" || rowData.train_code.substr(0, 1) === "C") ?
                    <View style={[styles.info, FLEXBOX.flexBetween]}>
                        {this.seatTickets('二等座', rowData.rz2_num)}
                        {this.seatTickets('一等座', rowData.rz1_num)}
                        {this.seatTickets('特等座', rowData.tdz_num)}
                        {this.seatTickets('商务座', rowData.swz_num)}

                    </View> : <View style={[styles.info, FLEXBOX.flexBetween]}>
                        {this.seatTickets('硬座', rowData.yz_num)}
                        {this.seatTickets('硬卧', rowData.yw_num)}
                        {this.seatTickets('软卧', rowData.rw_num)}
                        {this.seatTickets('高级软卧', rowData.gw_num)}

                    </View>
                }
            </TouchableOpacity>

        )
    }


    render() {
        let isEmptyData = this.store.filterData.length == 0 && !this.store.isLoading;
        return (
            <View style={styles.container} >
                {isEmptyData ? <NoDataTip /> : null}

                <NavBar title={`${this.props.param.departures[0].cityName}-${this.props.param.arrivals[0].cityName}`} navigator={this.props.navigator} />
                {/*二级导航*/}
                <Flex style={styles.subNavBar}>
                    <TouchableOpacity activeOpacity={.8} style={styles.subNavBar_item} onPress={() => {
                        this.store.removeDays(1);
                    }}>
                        <Icon icon={'0xe683'} style={styles.subNavBar_arrow} /><Text style={styles.subNavBar_btn}>{lan.flights_beforeDay}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={.8} style={styles.subNavBar_center} onPress={() => {
                        this.store.changeDate();
                    }}>
                        <Icon icon={'0xe67f'} style={styles.subNavBar_icon} />
                        <Text>{this.store.getDate}</Text>
                        <Text style={styles.subNavBar_week}>{this.store.getWeekDay}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={.8} style={styles.subNavBar_item} onPress={() => {
                        this.store.addDays(1);
                    }}>
                        <Text style={styles.subNavBar_btn}>{lan.flights_afterDay}</Text><Icon icon={'0xe677'} style={styles.subNavBar_arrow} />
                    </TouchableOpacity>
                </Flex>
                {/* 列表 */}
                <ListView
                    ref={"FlightList"}
                    dataSource={this.store.getDataSource}
                    renderRow={this._renderRow}
                    enableEmptySections={true}

                />
                <ToolBar activeTab={this.state.activeTab}
                    actions={this.state.actions}
                />
                <ActivityIndicator toast text={lan.loading} animating={this.store.isLoading} />
            </View>
        )

    }


}








const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.containerBg,
    },
    subNavBar: {
        backgroundColor: COLORS.primary,
        height: 44,


    },
    subNavBar_center: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 6,
        width: FLEXBOX.width * 0.5,
        height: 36,
        flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',

    },

    subNavBar_item: {
        flexDirection: 'row',
        width: FLEXBOX.width * 0.25, alignItems: 'center', justifyContent: 'center',
    },

    subNavBar_btn: {
        color: '#fff', fontSize: 14,
    },
    subNavBar_arrow: {
        color: '#fff', marginRight: 2,
        marginLeft: 2,
    },
    subNavBar_icon: {
        color: '#333', marginRight: 2,
    },
    subNavBar_week: {
        marginLeft: 10,
    },

    //列表

    time: {
        fontSize: 20,
        color: '#333'

    },
    timeLeft: {

        textAlign: 'left',
        paddingLeft: 10,
    },
    airportBox: {
        flexDirection: 'row',
        justifyContent: 'flex-start',

    },
    airportBoxLeft: {
        paddingLeft: 10,
        // justifyContent: 'flex-end'
    },
    airport: {
        fontSize: 14,
        color: '#999999',
        flex: .8,
        // width: FLEXBOX.width * 0.17,
        justifyContent: 'flex-end',
        //textAlign: 'right',
        // backgroundColor:'blue'
    },
    airpotRight: {
        textAlign: 'left',
        paddingRight: 10,
    },
    terminal: {
        marginLeft: 0,
        fontSize: 12,
        color: '#666',
        flex: .2
        // backgroundColor:'red'

    },
    mainTrip: {
        // width: FLEXBOX.width * 0.2,

        flex: .3,
        // backgroundColor:'red'



    },
    mainRight: {
        //width: FLEXBOX.width * 0.35,
        flex: .28,
        alignItems: 'flex-end',
        marginRight: 10,
        transform: [{ translateY: 5 }]
    },
    mainStops: {
        //width: FLEXBOX.width * 0.15,
        flex: .18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 10,



    },


    stopsLine: {
        height: 1 / FLEXBOX.pixel,
        backgroundColor: '#cccccc',
        width: 30,

    },
    info: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 8,
        paddingLeft: 10,

        borderTopColor: '#ddd',
        borderTopWidth: 1 / FLEXBOX.pixel,
        paddingTop: 5,
    },
    infoText: {
        color: '#999',
        fontSize: 12,
    },
    timeIcon: {
        fontSize: 12,
        color: '#999',
        marginRight: 1,
        marginLeft: 2,
    },
    mainRigntTxt: {
        fontSize: 10, color: '#999'
    },
    toLine: {
        width: FLEXBOX.width * 0.15,
        height: 5,
        borderBottomWidth: 2 / FLEXBOX.pixel,
        borderBottomColor: '#7a7a7a'
        // backgroundColor: '#ccc'
    },
    toLineIcon: {
        position: 'absolute',
        bottom: -3 / FLEXBOX.pixel,
        right: -1,
        fontSize: 5,
        color: '#7a7a7a'
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
    xie: {
        borderWidth: 1 / FLEXBOX.pixel,
        borderColor: COLORS.secondary,
        borderRadius: 2,
        padding: 1,
        transform: [{ translateY: 1 }]
    },
    xieText: {
        color: COLORS.secondary,
        fontSize: 10,
    },
    list: {
        backgroundColor: '#fff',
        borderRadius: 3,
        margin: 5,
        marginBottom: 0,
        paddingTop: 5,
        paddingBottom: 5,
    }



});

