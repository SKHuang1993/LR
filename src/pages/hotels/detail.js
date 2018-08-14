

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
    Animated, WebView,
    Modal
} from 'react-native';

import { WhiteSpace, Popup, NoticeBar, SearchBar } from 'antd-mobile';
import List from '../../components/list';
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
import Modals from '../../components/modal';
import Filter from './filter';
import Enumerable from 'linq';
import TabButton from '../../components/tabButton/';
import FormatPrice from '../../components/formatPrice/';
//import Marquee from '../../components/@remobile/react-native-marquee';
//import Marquee from '@remobile/react-native-marquee-label';
import Marquee from '../../components/marquee';
import Stars from '../../components/stars';
import NoDataTip from '../../components/noDataTip.1';
import { AccountInfo, CabinInfo } from '../../utils/data-access/';
import { BaseComponent } from '../../components/locale';
import Detail from '../../stores/hotel/detail';
import Order from '../../pages/booking/hotel';
import moment from 'moment';
const Item = List.Item;

import ImageViewer from 'react-native-image-zoom-viewer';


let lan = BaseComponent.getLocale();
@observer
export default class International extends Component {
    constructor(props) {
        super(props);
        this.store = new Detail(props);
        this.store.getHotelPriceAsyncId(this.props.data.HotelID);
        this.state = {
            imageViewer: false,
            imageViewerIndex: 0
        }
    }





    //酒店列表
    _renderRow = (rowData, sectionID, rowID) => {
        let str = `<div class="modal-text"><div>${lan.hotels_taxAndserviceCharge}：<span class="price">¥${rowData.VendorTaxExchange}</span></div>`;
        if (rowData.VendorTaxDetail) {
            for (let item of rowData.VendorTaxDetail)
                str += `<div>${item}</div>`;
        }
        if (rowData.CheckInInstructions) {
            str += `<p class="fb">${lan.hotels_checkInInstructions}：</p>`;
            str += rowData.CheckInInstructions;
        }
        if (rowData.SpecialCheckInInstructions) {
            str += `<b class="fb">${lan.hotels_specialOccupancyInstructions}：</b>`;
            str += `<p>${rowData.SpecialCheckInInstructions}</p>`;
        }
        str += '</div>';
        let roomIntroduce = <WebView style={styles.WebView} source={{ html: `<div style="word-wrap:break-word;font-size:12px;padding-right:0;width:100%">${str}</div>` }} />




        return (
            <TouchableOpacity activeOpacity={0.6} style={[FLEXBOX.flexStart, styles.roomList]} onPress={() => {
                if (this.props.navigator) {
                    this.props.navigator.push({
                        component: Order,
                        passProps: {
                            detail: this.props.data,
                            data: rowData,
                            param: this.props.param,
                            employee: this.props.employee,
                            isPrivate: this.props.isPrivate,
                            policyViolations: this.store.getPolicyViolations(this.props.data.PolicyViolations)
                        }
                    })
                }
            }}>
                {/* <Image style={styles.thumb} source={{ uri: 'https://biz.yiqifei.com/Content/image/hotel_NOPIC.jpg' }} /> */}
                <View style={styles.info}>
                    <View style={styles.roomName}>
                        <Text style={styles.roomNameText}>({rowData.Vendor}){rowData.RoomName}</Text>
                    </View>
                    <View style={[FLEXBOX.flexStart]}>
                        <Text style={styles.extraInfo}>{rowData.Breakfast.Breakfast ? lan.hotels_includingbreakfast : lan.hotels_noIncludingbreakfast}</Text>
                        <Text activeOpacity={.6} style={[styles.extraLink]} onPress={() => {
                            Modals.alert('', rowData.CancelPolicy.PolicyDetails.join("，"), [
                                { text: lan.confirm, onPress: () => { } },
                            ]);
                        }}  >

                            {rowData.CancelPolicy.Cancelable ? lan.hotels_freeCancellation : lan.hotels_cannotbeCancelled}
                        </Text>


                        <Text activeOpacity={.6} style={[styles.extraLink]} >
                            <Icon style={styles.extraLink} icon={'0xe711'} />
                            <Text activeOpacity={.6} style={[styles.extraLink]} onPress={() => {
                                Modals.alert(lan.hotels_roomDescription, roomIntroduce, [
                                    { text: lan.confirm, onPress: () => { } },
                                ]);
                            }}  >
                                {lan.hotels_roomDescription}
                            </Text>
                        </Text>

                    </View>
                    <View style={FLEXBOX.flexBetween}>
                        <View style={[FLEXBOX.flexStart, styles.price]}>
                            {FormatPrice(Math.round(rowData.AveragePrice), '¥', 20, null, lan.hotels_everyroomPirce)}
                            {/* <Text style={styles.tax}>({lan.hotels_taxPrice})</Text> */}
                            <View style={[FLEXBOX.flexStart, styles.supplier]}>
                                <Text style={styles.supplierText}>
                                    {rowData.Vendor}
                                </Text>
                                {rowData.Vendor == "EAN" &&
                                    <Text style={styles.supplierText}>
                                        {`返￥${rowData.GrossProfit}`}
                                    </Text>
                                }
                            </View>
                        </View>
                        <TouchableOpacity style={styles.bookBtn} activeOpacity={.6} disabled>
                            <Text style={styles.bookBtnText}>{lan.booking}</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </TouchableOpacity>
        );
    }





    render() {
        let detail = this.props.data;
        let checkInDate = moment(this.props.param.CheckInDate);
        let checkOutDate = moment(this.props.param.CheckOutDate);
        //酒店简介 
        let hotelIntroduce = <WebView style={styles.WebView} source={{ html: `<div style="word-wrap:break-word;font-size:12px;padding-right:0;width:100%">${detail.Intro && detail.Intro.length > 0 ? detail.Intro : lan.hotels_noIntroduction}</div>` }} />
        // 图片浏览器图片数组
        let imagesViewer = Enumerable.from(detail.ImageList).select(o => { return { minUrl: "http://img11.yiqifei.com/" + o + "!150x110", url: "http://img11.yiqifei.com/" + o + "!420x300" } }).toArray();

        // console.log(212,detail.Intro);
        return (
            <View style={styles.container} >

                <NavBar title={lan.hotels_theHotelDetails} rightIcon={'0xe666'} navigator={this.props.navigator} onRightClick={() => this.props.navigator.popToTop()} />

                <ScrollView>
                    <View style={styles.hotelName}>
                        <Text style={styles.hotelNameText}>
                            {detail.HotelName} {detail.HotelEName ? `(${detail.HotelEName})` : null}
                        </Text>
                    </View>
                    <View style={styles.roomExtra}>
                        <Stars starNumber={detail.Star} />
                        {!this.props.isPrivate && detail.IsPolicyViolated &&
                            <Text style={styles.link} onPress={() => {
                                Modals.alert(lan.hotels_againstTravelPolicy, this.store.getPolicyViolations(detail.PolicyViolations), [
                                    { text: lan.confirm, onPress: () => { } },
                                ]);
                            }}>
                                {lan.hotels_againstTravelPolicy}<Icon style={styles.link} icon={'0xe63b'} />
                            </Text>
                        }
                    </View>
                    {/* 相册 */}
                    <View>

                        <ScrollView horizontal={true}>
                            {imagesViewer.map((v, i) => {
                                return <TouchableOpacity key={i} onPress={() => {
                                    this.setState({ imageViewer: !this.state.imageViewer, imageViewerIndex: i })
                                }} activeOpacity={.8}>
                                    <Image style={styles.imageMinViewer} source={{ uri: v.minUrl }} />
                                </TouchableOpacity>

                            })}

                        </ScrollView>
                        <View style={styles.imageMinViewerNum}>
                            <Text style={styles.imageMinViewerNumTxt}>
                                {imagesViewer.length}图
                            </Text>
                        </View>
                    </View>


                    <Modal onRequestClose={() => { }} visible={this.state.imageViewer} transparent={true}>
                        <ImageViewer loadingRender={() => <ActivityIndicator />} imageUrls={imagesViewer} index={this.state.imageViewerIndex} onClick={() => {
                            this.setState({
                                imageViewer: !this.state.imageViewer
                            })
                        }} />
                    </Modal>

                    <Item extra={<View style={styles.adddress}><Text style={styles.adddressText}>{detail.Address}</Text></View>}>
                        <View style={[FLEXBOX.flexStart, styles.listTitle]}><Icon style={styles.listIcon} icon={'0xe63e'} /><Text style={styles.listLabel}>{lan.address}</Text></View>
                    </Item>
                    <Item arrow="horizontal" onClick={() => {
                        Modals.alert(lan.hotels_hotelIntroduction, hotelIntroduce, [
                            { text: lan.confirm, onPress: () => { } },
                        ]);
                    }}>
                        <View style={[FLEXBOX.flexStart, styles.listTitle]}><Icon style={styles.listIcon} icon={'0xe63f'} /><Text style={styles.listLabel}>{lan.hotels_hotelIntroduction}</Text>
                        </View>
                    </Item>
                    <Item  >
                        <View style={[FLEXBOX.flexStart, styles.listTitle]}>
                            <Icon style={styles.listIcon} icon={'0xe640'} />
                            <Text style={styles.listLabel}>{lan.hotels_hotelFacilities}</Text>
                            {/* 酒店设施  */}
                            {/* wifi  */}
                            {detail.FacilityList.find(o => o.FacilityID == 1) &&
                                <Icon style={styles.hotelAttr} icon={'0xe69f'} />}
                            {/* 游泳池  */}
                            {detail.FacilityList.find(o => o.FacilityID == 3) &&
                                <Icon style={styles.hotelAttr} icon={'0xe651'} />}
                            {/*停车场  */}
                            {detail.FacilityList.find(o => o.FacilityID == 2) &&
                                <Icon style={styles.hotelAttr} icon={'0xe69e'} />
                            }
                        </View>
                    </Item>
                    <Item extra={<View style={styles.listValue}>

                        <Text style={styles.listValueText}>{lan.lang == 'EN' ? '' : '住'}{checkOutDate.diff(checkInDate, "d")}{lan.night}</Text>

                    </View>} >
                        <View style={[FLEXBOX.flexStart, styles.listTitle]}>
                            <Icon style={styles.listIcon} icon={'0xe642'} />
                            <Text style={styles.listLabel}>{lan.hotels_toStayIn}</Text>
                            <Text style={styles.listLabelCon}>{checkInDate.format("MM月DD日")}~{checkOutDate.format("MM月DD日")}</Text>
                        </View>
                    </Item>
                    <Item extra={<View style={styles.listValue}><Text style={styles.listValueText}>{lan.lang == 'EN' ? '' : '共'}{this.props.param.RoomCount}{lan.jian}</Text></View>} >
                        <View style={[FLEXBOX.flexStart, styles.listTitle]}>
                            <Icon style={styles.listIcon} icon={'0xe641'} />
                            <View>
                                <Text style={styles.listLabel}>{lan.hotels_everyroomTitle}
                                    <Text style={styles.listLabelCon}>&nbsp;{this.props.param.Adult}{lan.adult}</Text>
                                </Text>
                                <Text style={styles.listLabel}>{lan.hotels_checkInPerson}
                                    <Text style={styles.listLabelCon}>&nbsp;{Enumerable.from(this.props.employee).select('$.PersonName').toArray().join('、')}</Text>
                                </Text>
                            </View>

                        </View>
                    </Item>
                    {this.store.rateList.length == 0 && this.store.isLoading == false ? <Text style={{ textAlign: 'center', padding: 15 }}>很抱歉，暂无房型数据！</Text> : null}
                    {/*房间列表  */}
                    <ListView
                        enableEmptySections={true}
                        dataSource={this.store.getDataSource}
                        renderRow={this._renderRow}
                    />


                </ScrollView>




                {/*loading*/}
                <ActivityIndicator toast text={lan.loading} animating={this.store.isLoading} />
            </View>
        )

    }


}








const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    hotelName: {
        padding: 10,
        paddingBottom: 0,
    },
    hotelNameText: {
        fontSize: 18,
        color: '#333'
    },
    listTitle: {
        alignItems: 'center',
    },
    listIcon: {
        marginRight: 10,
        color: '#6689cc'
    },
    adddress: {
        flex: 2,
        justifyContent: 'center'
    },
    hotelIntroduceTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10,
    },
    hotelIntroduce: {
        width: FLEXBOX.width * .8,
        height: FLEXBOX.height * .6,

    },
    hotelIntroduceContent: {

    },
    WebView: {
        //width: FLEXBOX.width * .65,
        height: FLEXBOX.height * .6,
    },
    hotelAttr: {
        color: '#999',
        marginLeft: 5,
    },
    listLabelCon: {
        color: '#999',
        marginLeft: 5,
    },
    listValue: {
        flex: .4,
        alignItems: 'flex-end',
    },
    listValueText: {
        color: '#999'
    },
    roomList: {
        backgroundColor: '#fff',
        padding: 10,
        borderWidth: 1 / FLEXBOX.pixel,
        borderColor: '#ddd'

    },
    thumb: {
        width: 80,
        height: 80,
        flex: 0,
    },
    info: {
        flex: 1,
        paddingLeft: 10,
    },
    extraInfo: {
        fontSize: 12,
        color: '#999'
    },
    extraLink: {
        color: '#6689cc',
        fontSize: 12,
        marginLeft: 10,
    },
    roomNameText: {
        color: '#333',
        fontSize: 16,

    },
    roomName: {
        marginBottom: 10,

    },
    price: {
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    tax: {
        color: '#999',
        marginLeft: 5,
        fontSize: 12,
    },
    bookBtn: {
        backgroundColor: '#f44848',
        borderRadius: 3,
        height: 25,
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookBtnText: {
        color: '#fff'
    },
    link: {
        fontSize: 14,
        color: '#6689cc'
    },
    adddressText: {
        color: '#999'
    },
    roomExtra: {

        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    imageMinViewer: {
        width: 100,
        height: 100,
        marginRight: 5,
    },
    imageMinViewerNum: {
        position: 'absolute',
        right: 10,
        bottom: 5,
        borderRadius: 8,
        paddingRight: 8,
        paddingLeft: 8,
        backgroundColor: 'rgba(0,0,0,.5)'
    },
    imageMinViewerNumTxt: {
        color: '#fff'
    },
    supplier: {
        marginLeft: 20
    }
    , supplierText: {
        marginRight: 10
    }




});

