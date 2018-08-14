

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
import Flex from '../../components/flex';
import ActivityIndicator from '../../components/activity-indicator';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../../components/button';
//import AccordionExample from '../demo/collapsible'
import IntlFlight from '../../stores/flight/intl'
import Accordion from 'react-native-collapsible/Accordion';
import FlightList from '../../components/flight/intl';
import { observer } from 'mobx-react/native';
import ToolBar from '../../components/toolBar/';
import Filter from './filter';
import Enumerable from 'linq';
import TabButton from '../../components/tabButton/';
//import Marquee from '../../components/@remobile/react-native-marquee';
//import Marquee from '@remobile/react-native-marquee-label';
import Marquee from '../../components/marquee';
import NoDataTip from '../../components/noDataTip.1';
import { AccountInfo, CabinInfo } from '../../utils/data-access/';
import Adviser from './adviser';
import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
@observer
export default class International extends Component {
    constructor(props) {
        super(props);
        this.store = new IntlFlight(props);
        this.store.userInfo = AccountInfo.getUserInfo();
        this.store.getOnlineStaffProfileGet();
        if (props.flights) {
            this.store.flights = props.flights;
            setTimeout(() => {
                if (props.param.isPrivate == true) {
                    Enumerable.from(props.flights).doAction(o => Enumerable.from(o.BerthList).
                        doAction(o => { o.BreachPolicy = null; o.IsConformPolicy = true }).toArray()).toArray();
                }
                this.store.filterData = props.flights
                this.store.airSummaries = props.airSummaries;
                this.store.isFinish = true
            }, 800);
        } else
            this.store.searchFlight();
        if (this.props.employee.length > 0)
            this.store.getPolicy(this.props.employee[0]);
        this.state = {
            actions: [
                {
                    title: lan.filter, icon: '0xe675',
                    aloneActiveTab: false,
                    onPress: () => {
                        //this.setState({ activeTab: 0 });

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
                {
                    title: lan.flights_filter_nonStopFirst, icon: '0xe682', onPress: () => {
                        if (this.store.filterData.length == 0) return;
                        this.store.directFlight();
                        this.setState({ actions: this.state.actions, activeTab: 3 });
                        this.scrollToTop();
                    }
                },
            ], activeTab: 2
        }
    }

    scrollToTop = () => {
        setTimeout(() => {
            if (this.refs.FlightList)
                this.refs.FlightList.refs.ListView.getScrollResponder().scrollTo({ x: 0, y: 0, animated: false })
        }, 0);
    }

    getPopupContent = (num, data) => {
        return (
            <Filter data={data} getFilterData={(data) => {
                this.getFilterData(data)
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

    }
    componentWillUnmount() {
        //this.marquee()
    }
    // marquee = () => {
    //     return <Marquee style={[styles.marquee]}>
    //         您正在为：苏木凤、周小瑶进行差旅预订，对应的差旅政策为：①90分
    //             </Marquee>
    // }

    navRightView() {
        return (
            <TabButton style={styles.switch}
                tabNames={[lan.flights_noTax, lan.flights_tax]}
                textActiveStyle={styles.switch_txt_acitve}
                textStyle={styles.switch_txt}
                tabStyle={styles.switch_tab}
                radius={3}
                tabActiveStyle={styles.switch_tabActive}
                activeTab={this.store.includingTax ? 1 : 0} onClink={(i) => {
                    this.store.includingTax = i == 0 ? false : true;
                }} />
        )
    }

    render() {
        let isEmptyData = this.store.isFinish && this.store.filterData.length == 0;
        return (
            <View style={styles.container} >
                {isEmptyData ? <NoDataTip size={'small'} /> : null}
                <NavBar title={this.store.getLegTitle()} rightView={this.navRightView()} navigator={this.props.navigator} />
                {/*差旅政策滚动信息*/}
                {/*{this.props.employee.length > 0 ?
                    Platform.OS == 'ios' ? <Marquee style={[styles.marquee]} scrollDuration={30} text="text">
                        {`您正在为：${Enumerable.from(this.props.employee).select('$.PersonName').toArray().join('、')}进行差旅预订，对应的差旅政策为：${this.store.policy}`}
                    </Marquee> : null : null}*/}

                {/* {this.props.employee.length > 0 && !this.props.toChange ? <Marquee
                    data={`${lan.flights_marqueeTxt1}${Enumerable.from(this.props.employee).select('$.PersonName').toArray().join('、')}${lan.flights_marqueeTxt2}${this.store.policy}`}
                    alert
                /> : null} */}
                {/*机票列表*/}
                <FlightList ref="FlightList" info={this.props.info} orderDetail={this.props.orderDetail} toChange={this.props.toChange} routetrip={this.props.routetrip} store={this.store} selectedFlights={this.props.selectedFlights || []} />
                {/*差旅顾问 列表*/}
                {isEmptyData ? <Adviser staffContacts={this.store.staffContacts} /> : null}
                {/*底部工具栏*/}
                <ToolBar activeTab={this.state.activeTab}
                    actions={this.state.actions}
                />
                <ActivityIndicator toast text={this.store.indicatorMessage} animating={!this.store.isFinish} />
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
    marquee: {
        backgroundColor: 'transparent',
        height: 30,
        color: '#999',
        fontSize: 14,
        overflow: 'hidden',
    },
    switch: {
        borderColor: '#fff',
        borderWidth: 1 / FLEXBOX.pixel,
        borderRadius: 3,
        width: 70,
        height: 30,
        backgroundColor: 'transparent',
        overflow: 'hidden'
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


});

