

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
    Animated, Keyboard
} from 'react-native';

import { List, WhiteSpace, Popup, NoticeBar, SearchBar } from 'antd-mobile';
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
import FormatPrice from '../../components/formatPrice/';
//import Marquee from '../../components/@remobile/react-native-marquee';
//import Marquee from '@remobile/react-native-marquee-label';
import Marquee from '../../components/marquee';
import NoDataTip from '../../components/noDataTip.1';
import { AccountInfo, CabinInfo } from '../../utils/data-access/';
import { BaseComponent } from '../../components/locale';
import HotelList from '../../stores/hotel/list';
import moment from 'moment';
import Stars from '../../components/stars';
import Detail from '../../pages/hotels/detail';
import Modal from '../../components/modal';

let lan = BaseComponent.getLocale();
@observer
export default class International extends Component {
    constructor(props) {
        super(props);
        this.store = new HotelList(this.props);
        this.store.getHotelListAsyncId();
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
                            this.getPopupContent(1, this.store.getFilterData()),
                            {
                                maskClosable: true,
                                animationType: 'slide-up',
                                onMaskClose: () => { }
                            }
                        )
                    }
                },
                {
                    title: lan.flights_filter_lowToHight, icon: '0xe681', onPress: () => {
                        this.state.actions[1].title = this.store.initData.Sorter.Sortord === "Price" && this.store.initData.Sorter.Ascending ? lan.flights_filter_hightToLow : lan.flights_filter_lowToHight;
                        this.store.orderByPrice();
                        this.setState({ actions: this.state.actions, activeTab: 1 });
                    }
                },
                {
                    title: lan.hotels_starGrade, icon: '0xe68c', onPress: () => {
                        this.state.actions[2].icon = this.store.initData.Sorter.Sortord === "Star" && this.store.initData.Sorter.Ascending ? '0xe68c' : '0xe68c';
                        this.store.orderByStar();
                        this.setState({ actions: this.state.actions, activeTab: 2 });
                    }
                },

                {
                    title: lan.hotels_ranking, icon: '0xe648', onPress: () => {
                        this.store.orderByDefault();
                    }
                },
            ], activeTab: 3
        }
    }

    scrollToTop = () => {
        setTimeout(() => {
            // if (this.refs.FlightList)
            //     this.refs.FlightList.refs.ListView.getScrollResponder().scrollTo({ x: 0, y: 0, animated: false })
        }, 0);
    }

    getPopupContent = (num, data) => {
        return (
            <Filter data={data} getFilterData={(data) => {
                this.store.filterData = data;
                setTimeout(() =>
                    this.store.execSifteData(data), 100);
                // 底部筛选白点状态， 目前只判断点击筛选确定按钮都改变筛选修改状态
                let stateActions = this.state.actions;
                stateActions[0].aloneActiveTab = true;
                this.setState({
                    actions: stateActions
                })
            }} />
        );
    }

    //酒店列表
    _renderRow = (rowData, sectionID, rowID) => {
        return (
            <TouchableOpacity activeOpacity={0.6} style={[FLEXBOX.flexStart, styles.hotelList]} onPress={() => {
                if (this.props.navigator) {
                    this.props.navigator.push({
                        component: Detail,
                        passProps: {
                            data: rowData,
                            param: this.store.request,
                            employee: this.props.employee,
                            isPrivate: this.props.isPrivate
                        }
                    })
                }

            }}>
                <View>
                    <Image style={styles.thumb} source={{ uri: rowData.ImageList && rowData.ImageList.length > 0 ? `http://img11.yiqifei.com/${rowData.ImageList[0]}!150x110` : 'https://biz.yiqifei.com/Content/image/hotel_NOPIC.jpg' }} />
                </View>
                <View style={styles.info}>
                    <View style={styles.titie}>
                        <Text numberOfLines={2}>
                            {rowData.HotelName} {rowData.HotelEName ? `(${rowData.HotelEName})` : null}
                        </Text>
                    </View>

                    <View style={[styles.starBox, { flexDirection: 'row' }]}>
                        <Stars starNumber={rowData.Star} />
                        {!this.props.isPrivate && rowData.IsPolicyViolated &&
                            <Text style={{ color: COLORS.textLight, fontSize: 12, }} onPress={() => {
                                Modal.alert(lan.hotels_againstTravelPolicy, this.store.getPolicyViolations(rowData.PolicyViolations), [
                                    { text: lan.confirm, onPress: () => { } },
                                ]);
                            }}>
                                {lan.hotels_againstTravelPolicy}<Icon style={styles.policyIcon} icon={'0xe63b'} />
                            </Text>
                        }
                    </View>

                    <View style={FLEXBOX.flexBetween}>
                        <View style={[FLEXBOX.flexStart, styles.hotelAttrBox]}>
                            {/*新增图标涉及到更新原生图标 ,下一版统一更新，  */}
                            {/* wifi  */}
                            {rowData.FacilityList.find(o => o.FacilityID == 1) &&
                                <Icon style={styles.hotelAttr} icon={'0xe69f'} />}
                            {/* 游泳池  */}
                            {rowData.FacilityList.find(o => o.FacilityID == 3) &&
                                <Icon style={styles.hotelAttr} icon={'0xe651'} />}
                            {/*停车场  */}
                            {rowData.FacilityList.find(o => o.FacilityID == 2) &&
                                <Icon style={styles.hotelAttr} icon={'0xe69e'} />
                            }
                            {/* 供应商 */}
                            <View style={[FLEXBOX.flexStart, styles.supplier]}>
                                {
                                    rowData.VendorList.map((o, i) =>
                                        <Text key={i} style={styles.supplierText}>{o.Vendor}</Text>)
                                }
                            </View>

                        </View>
                        <View style={styles.price}>
                            {FormatPrice(Math.round(rowData.Price), '¥', null, null, lan.flights_priceUp)}
                        </View>
                    </View>
                </View>

            </TouchableOpacity>
        );
    }





    render() {
        let isEmptyData = this.store.isCompleted && this.store.data.length == 0;
        let checkInDate = moment(this.store.request.CheckInDate);
        let checkOutDate = moment(this.store.request.CheckOutDate);
        let title = `${this.store.request.DistrictName}\n${checkInDate.format("MM.DD")}-${checkOutDate.format("MM.DD")}(${checkOutDate.diff(checkInDate, "d")}${lan.night})`;
        return (
            <View style={styles.container} >
                {/* nodata 提示  */}
                {isEmptyData && !this.store.isLoading ? <NoDataTip /> : null}
                <NavBar title={title} rightIcon={'0xe666'} navigator={this.props.navigator} onRightClick={() => this.props.navigator.popToTop()} />
                {!this.props.isPrivate &&
                    <Marquee
                        data={`${lan.flights_marqueeTxt1}${Enumerable.from(this.props.employee).select('$.PersonName').toArray().join('、')}${lan.flights_marqueeTxt2}，${lan.flights_marqueeTxt3} ${this.store.policy}`}
                        alert
                    />}
                <SearchBar
                    placeholder={lan.hotels_listSearchKey}
                    ref={"SearchBar"}
                    value={this.store.keyWords}
                    onChange={(text) => {
                        if (typeof text != 'string') return;
                        this.store.keyWords = text;
                        this.store.initData.Filter.Keywords.HotelName = text;
                        clearTimeout(this.timer);
                        this.timer = setTimeout(() => {
                            this.store.initData.PageNo = 0;
                            this.store.data.clear();
                            this.store.getHotelList();
                        }, 500)
                    }}
                />
                {!this.props.isPrivate && <View style={styles.bookHint}><Text style={styles.bookHintText}><Icon style={styles.bookHintText} icon={'0xe711'} />{lan.hotels_listExplain}</Text></View>}
                <ListView
                    onScrollBeginDrag={() => Keyboard.dismiss()}
                    dataSource={this.store.getDataSource}
                    renderRow={this._renderRow}
                    enableEmptySections={true}
                    renderFooter={() => {
                        return ((this.store.isLoading || this.store.isCompleted) ? null : <TouchableOpacity style={{ alignItems: 'center', padding: 10 }}
                            onPress={() => { this.store.initData.PageNo += 1; this.store.getHotelList() }}><Text>{lan.passengers_loadHint}</Text></TouchableOpacity>)
                    }}
                />

                {/*底部工具栏*/}
                <ToolBar activeTab={this.state.activeTab}
                    actions={this.state.actions}
                />
                {/*loading*/}
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
    hotelList: {
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1 / FLEXBOX.pixel,
        padding: 10,
        paddingTop: 10,
        paddingBottom: 10,
    },
    hotelAttrBox: {
        flex: .8
    },
    hotelAttr: {
        color: '#999', marginRight: 5,
    },
    price: {
        // textAlign: 'right'
    },
    starBox: {
        marginTop: 5,
        marginBottom: 5,
    },
    title: {
        paddingRight: 10,
    },
    info: {
        flex: .8,
        paddingLeft: 10,
    },
    thumb: {
        width: 80,
        height: 80,
        flex: 0,
    },
    starBg: {
        width: 80,
        height: 15,

        // backgroundColor:'blue'
    },
    star: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        height: 15,
        //backgroundColor:'#000'
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
    bookHint: {
        padding: 5,
    },
    bookHintText: {
        fontSize: 11,
        color: '#999'
    },
    policyIcon: {
        fontSize: 12, color: '#999'
    },
    supplier: {
        marginLeft: 10,
    },
    supplierText: {
        color: COLORS.secondary,
        marginRight: 5,
    }


});

