

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
import Modal from '../../components/modal';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../../components/button';
//import AccordionExample from '../demo/collapsible'
import DomesticFlight from '../../stores/flight/domestic'
import Accordion from 'react-native-collapsible/Accordion';
import FlightList from '../../components/flight/domestic';
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
import FormatPrice from '../../components/formatPrice';
import Detail from '../../stores/train/detail';
import Order from '../../pages/booking/train';

let lan = BaseComponent.getLocale();
@observer
export default class TrainDetail extends Component {
    constructor(props) {
        super(props);
        this.store = new Detail(props);
        this.state = {
            modal1: false,
        }
    }

    scrollToTop = () => {
        setTimeout(() => {
            if (this.refs.FlightList)
                this.refs.FlightList.refs.ListView.getScrollResponder().scrollTo({ x: 0, y: 0, animated: false })
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
        this.store.getList(this.props.data);
    }
    componentWillUnmount() {
        //this.marquee()
    }



    // 国内列表 右边信息

    domesticRightInfo(data) {
        return (
            <Flex.Item style={styles.mainRight}>
                {FormatPrice(data.Price, '', 20, null, lan.flights_priceUp)}

            </Flex.Item>
        )
    }
    // 座位余票状态
    seatTickets = (title, number) => {
        return <Text style={{ flex: .25, color: number > 0 ? '#666' : '#999', fontSize: 12, }}>{title}:{number}张</Text>
    }

    _renderRow = (rowData, sectionID) => {
        //字体长度

        return (
            <TouchableOpacity activeOpacity={.7} style={styles.list} disabled={rowData.num == '-'} onPress={() => {
                if (this.props.navigator) {
                    this.props.navigator.push({
                        component: Order,
                        passProps: {
                            detail: this.props.data,
                            data: rowData,
                            param: this.props.param,
                            employee: this.props.employee,
                            isPrivate: this.props.isPrivate,
                            toChange: this.props.toChange,
                            orderDetail: this.props.orderDetail
                        }
                    })
                }
            }}>
                <Flex justify="between" >
                    <Text style={styles.type}>{rowData.type}</Text>
                    <View style={styles.price}>
                        {FormatPrice(rowData.price != '-' ? rowData.price : '0')}
                    </View>

                    <Text style={[styles.tickets, { color: 1 ? '#333' : '#999' }]}>{rowData.num != '-' ? `${rowData.num}张` : '无票'}</Text>
                    <TouchableOpacity disabled style={[styles.bookBtn, { backgroundColor: rowData.num != '-' ? COLORS.secondary : "#dcdcdc" }]} activeOpacity={.8}>
                        <Text style={styles.bookText}>预订</Text>
                    </TouchableOpacity>

                </Flex>

            </TouchableOpacity>

        )
    }

    _momentRenderRow = (rowData, sectionID, rowID) => {
        let detail = this.props.data;
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
        let detail = this.props.data;
        let isEmptyData = !this.store.isLoading && this.store.data.length == 0;
        let fontStyle = { color: '#333' }
        let employee = [];
        if (this.props.toChange) {
            employee = Enumerable.from(this.props.employee).select('$.Name').toArray().join('、');
        } else
            employee = Enumerable.from(this.props.employee).select('$.PersonName').toArray().join('、');
        return (
            <View style={styles.container} >
                <NavBar title={'车次详情'} navigator={this.props.navigator} />
                {/* 滚动 */}
                {/* {!this.props.toChange &&
                    <Marquee
                        bgColor={{ backgroundColor: '#fff0da' }}
                        //textStyle={{color:'#fc9027'}}
                        data={`目前正在对车次${detail.train_code}（${detail.from_station}-${detail.arrive_station}），乘车人：${employee}`}
                        alert
                    />
                } */}
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
                <View style={[FLEXBOX.flexBetween, styles.detaiHeader]}>
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
                                <Text style={[styles.momentText, styles.lightnessFont]}>{detail.train_code}</Text>
                                <TouchableOpacity activeOpacity={1} onPress={async () => { this.isDeparture = false; this.isArrival = false; await this.store.queryStopStation(this.props.data.train_code); this.setState({ modal1: true }) }} style={[styles.momentBox]}><Text style={[styles.lightnessFont, styles.monentTitle]}>时刻表</Text></TouchableOpacity>
                                <Text style={[styles.momentText, styles.lightnessFont]}>{`${parseInt(detail.cost_time / 60)}h${parseInt(detail.cost_time % 60)}m`}</Text>
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
                {/*二级导航*  日期   */}
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
                {isEmptyData ? <Text style={{ textAlign: 'center', padding: 15, color: '#666' }}>很抱歉，暂无查询数据！</Text> : null}
                {/* 列表 */}
                <ListView
                    style={{ marginTop: 5, }}
                    dataSource={this.store.getDataSource}
                    renderRow={this._renderRow}
                    enableEmptySections={true}
                    removeClippedSubviews={false}

                />

                {/*底部工具栏*/}


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
        backgroundColor: 'white',
        height: 44,
        shadowColor: '#ccc',
        shadowOffset: { height: 0, width: 0 },
        shadowRadius: 1,
        shadowOpacity: 0.8,

    },
    subNavBar_center: {
        flex: 1,
        backgroundColor: '#EBEBEB',
        borderRadius: 2,
        width: FLEXBOX.width * 0.5,
        height: 32,
        flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',

    },

    subNavBar_item: {
        flexDirection: 'row',
        width: FLEXBOX.width * 0.25, alignItems: 'center', justifyContent: 'center',
    },

    subNavBar_btn: {
        color: COLORS.primary, fontSize: 14,
    },
    subNavBar_arrow: {
        color: COLORS.primary, marginRight: 2,
        marginLeft: 2,
    },
    subNavBar_icon: {
        color: '#333', marginRight: 2,
    },
    subNavBar_week: {
        marginLeft: 10,
    },

    //时刻
    detaiHeader: {
        padding: 10,
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
        color: '#fff'
    },
    grayFont: {
        color: '#999'
    },
    lightnessFont: {
        color: '#fff'
    },
    momentBox: {
        borderRadius: 2,
        borderColor: '#fff',
        borderWidth: 1 / FLEXBOX.pixel,
        padding: 2,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: COLORS.primary
    },
    momentLine: {
        height:  1 / FLEXBOX.pixel, width: 12, backgroundColor: "#fff", alignSelf: 'center'
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




});

