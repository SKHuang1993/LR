
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    Navigator,
    TouchableHighlight,
    TouchableOpacity,
    PixelRatio,
    ScrollView,
    StatusBar,
    NativeModules,
    TextInput,
    Dimensions, Alert
} from 'react-native';
import { COLORS, FLEXBOX } from '../styles/commonStyle';
import { Flex, Card, Toast } from 'antd-mobile';
import Grid from '../components/grid';
import Icon from '../components/icons/icon';
import FlightIndex from './flight/index'
import BusinessApplication from './travel/businessApplication'
//import HotelIndex from './webviewView/hotelWebview';
import HotelIndex from './hotels';

//import TrainIndex from './webviewView/trainWebview';
import TrainIndex from './trains';

import Picker from './demo/picker';
import moment from 'moment';
import RadiusImage from '../components/radiusImage/index';

import MyAccount from '../pages/account/myAccount';

import { RestAPI, ServingClient } from '../utils/yqfws';
import MyOrder from '../pages/account/myOrder';
import MyAdviser from '../pages/account/myAdviser';
import ApprovalOrder from '../pages/account/approvalOrder';
import ApprovalOrder2 from '../pages/account/approvalOrder2';
import OrderDetail from './account/orderDetail2';
import ApprovalDetail from './travel/orderDetail';
import { LanguageType } from '../utils/languageType';
import { BaseComponent, en_US, zh_CN } from '../components/locale';
import { Chat } from '../utils/chat';
import Login from './login/login';

let lan = BaseComponent.getLocale();


var { width, height } = Dimensions.get('window')

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isVis: false,
            isHave: false,//判断是否有行程单
            itiInfo: {},//行程单信息
            userAccount: this.props.UserAccount,//用户登录的账号
            accountNo: '',
            companyName: this.props.Company_Name,
            myInfo: this.props.My_Info,
            personCode: '',
            roleId: '',
            loadOrder: true,
            orderType: 8,
            sOShortNr: '',
            isHaveApprove: false,
            approveOrderNr: 0,
            approveOrderInfo: {},
            CompanyApproveTypeID: 1,
            isTrain: true,
            isHotel: true,
            isWait: false,
        }
    }

    onPressNav(link, index) {
        let i = index;
        if (index == 5) {
            this.state.approveOrderNr = 0;
            if (this.props._IsWait)
                this.props.navigator.push({
                    component: link,
                    passProps: {
                        CompanyApproveTypeID: this.state.CompanyApproveTypeID,
                        AccountNo: this.state.accountNo,
                        CompanyID: this.state.myInfo.Result.Company.CompanyCode,
                        RefreshEvent: (content) => { this.getApproveOrder(); },
                    },
                })
            else
                this.props.navigator.push({
                    component: link,
                    passProps: {
                        AccountNo: this.state.accountNo,
                        CompanyCode: this.state.myInfo.Result.Company.CompanyCode,
                    },

                })
            this.setState({});
        } else if ((index == 3 && this.state.CompanyApproveTypeID == 1) || (i == 1 && !this.state.isHotel) ||
            (i == 2 && !this.state.isTrain)) {
            this.showAlert(lan.home_alert_jurisdiction);
        } else if (this.props.navigator && link) {
            if ((i == 0 || i == 2) && this.state.CompanyApproveTypeID == 2) {
                Alert.alert(lan.home_alert_reserveTitle, lan.home_alert_reserveSubstance,
                    [
                        {
                            text: lan.home_alert_cpEntrance, onPress: () => {
                                this.pushScene(link, index, { isPrivate: true });
                            }
                        },
                        {
                            text: lan.home_alert_travelApplication, onPress: () => {
                                this.pushScene(BusinessApplication, index);
                            }
                        }
                    ])
                return;
            }
            this.pushScene(link, index);
        }
    }
    pushScene = (link, i, param) => {
        if (i == 4) i = 1;
        this.props.navigator.push({
            component: link,
            passProps: {
                name: '',
                ActiveKeyNum: i,
                AccountNo: this.state.accountNo,
                ...param
            },

        })
    }
    componentDidMount() {
        let storage = global.storage;
        storage.load({ key: 'BIZACCOUNTINFO' }).then(val => {
            if (val != null) {
                this.state.isWait = JSON.parse(val).IsWait;
                this.state.isTrain = JSON.parse(val).IsTrain;
                this.state.isHotel = JSON.parse(val).IsHotel;
                this.state.CompanyApproveTypeID = JSON.parse(val).CompanyApproveTypeID;
            }
        }).catch(err => {
            console.log(err)
        });
        storage.load({ key: 'USERINFO' }).then(val => {
            if (val != null) {
                let userInfo = JSON.parse(val);
                this.state.accountNo = userInfo.AccountNo;
                this.state.personCode = userInfo.PersonCode;
                
                this.getToTravelInfo();
                this.getApproveOrder();
                //初始化IM
                Chat.init(userInfo.AccountNo, () => {
                    MyAccount.exitLoginClick(this.props);
                });
            }
        }).catch(err => {
            console.log(err)
        });
    }

    showAlert = (content) => {
        Alert.alert(
            lan.remind,
            content,
            [
                { text: lan.ok, onPress: () => { } },
            ]
        );
    }

    render() {
        // alert(JSON.stringify(versionInfo.version));
        //九宫格数据
        const data = [
            { text: lan.home_menu_flight, code: '0xe660', color: '#fa5e5b', link: FlightIndex },
            { text: lan.home_menu_hotel, code: '0xe661', color: '#fa5e5b', link: HotelIndex },
            { text: lan.home_menu_train, code: '0xe662', color: '#fa5e5b', link: TrainIndex },
            // this.props.CompanyApproveTypeID == 1 ?
            //     { text: '我的顾问', code: '0xe665', color: '#fa5e5b', link: MyAdviser } :
            { text: lan.home_menu_travelRequest, code: '0xe69c', color: '#fa5e5b', link: BusinessApplication },
            { text: lan.home_menu_myOrder, code: '0xe663', color: '#fa5e5b', link: MyOrder },
            this.state.isWait ?
                { text: lan.home_menu_myTrial, code: '0xe664', color: '#fa5e5b', link: (this.state.CompanyApproveTypeID != 2 ? ApprovalOrder : ApprovalOrder2) }
                : { text: lan.home_menu_myConsultant, code: '0xe665', color: '#fa5e5b', link: MyAdviser },
        ].map((_val, i) => ({
            icon: _val.code,
            text: _val.text,
            color: _val.color,
            link: _val.link
        }));

        //头部用户信息背景图地址
        let userInfoBg = 'http://img2.yiqifei.com/20161223/e31c42510552425898ba203a0b36b17a.jpg!180';
        //用户头像
        let userInfoAvatar = require('../images/home_user_info_bg.png');
        return (
            <ScrollView style={styles.container}>
                <StatusBar
                    animated={true}
                    hidden={false}
                    backgroundColor={'transparent'}
                    translucent={true}
                    barStyle="light-content"
                    showHideTransition={'fade'}
                />
                <Image style={styles.userInfo} source={userInfoAvatar}>
                    <View style={styles.userInfo_title}>
                        <Text style={{ color: '#fff' }}>
                            {this.state.companyName}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => this.setUpEvent()} style={{ marginLeft: 25 }}>
                        <RadiusImage pathType={1}
                            imagePath={this.state.myInfo.UserImage}
                            imgWidth={30} imgHeight={30} />
                    </TouchableOpacity>
                </Image>

                {/*导航*/}
                <View style={styles.navGrid}>
                    <Grid data={data} columnNum={3}
                        renderItem={(dataItem, index) => (
                            <TouchableHighlight underlayColor={'#f2f2f2'} style={styles.navGrid_item} onPress={this.onPressNav.bind(this, dataItem.link, index)}>
                                <View style={{ alignItems: 'center' }}>
                                    <Icon icon={dataItem.icon} color={dataItem.color} style={{ fontSize: 22, marginBottom: 4 }} />
                                    <Text>{dataItem.text}</Text>
                                    {dataItem.text == lan.home_menu_myTrial && this.state.approveOrderNr > 0 ?
                                        <View style={{
                                            justifyContent: 'center', alignItems: 'center', position: 'absolute',
                                            right: -5, top: -10, height: 18, width: 18, borderRadius: 9, backgroundColor: COLORS.btnBg
                                        }}>
                                            <Text style={{ fontSize: 12, color: "#fff" }}>{this.state.approveOrderNr > 99 ? "···" : this.state.approveOrderNr}</Text>
                                        </View>
                                        : null}
                                </View>
                            </TouchableHighlight>
                        )}
                    />
                </View>
                {this.state.loadOrder ?
                    <View style={{ marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <Text>{lan.home_journeyLoad}</Text>
                    </View>
                    : null}
                {this.state.isHaveApprove ? this.getApproveOrderView() : null}
                {this.state.isVis ? this.getLatelyItineraryView(this.state.isHave, this.state.itiInfo) : null}
            </ScrollView>
        )
    }

    //最近待出行行程单样式布局
    getLatelyItineraryView = (t, oInfo) => {
        if (t)
            if (this.state.orderType == 3)
                return this.getTrainItiView(oInfo);
            else
                return this.getPlaneItiView(oInfo);
        else return (
            <View style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}>
                <Flex justify="between" style={styles.cardTitle}  >
                    <Flex.Item>
                        <Text style={styles.cardTitle_left} >
                            <Icon icon={0xe670} color={'#696969'} style={styles.cardTitle_icon} />
                            &nbsp;{lan.home_journey_title}
                        </Text>
                    </Flex.Item>
                </Flex>

                <Text style={{ marginTop: 5, marginBottom: 10, textAlign: 'center', color: '#666' }}>
                    <Icon icon={0xe67d} color={'#696969'} style={styles.cardTitle_icon} />
                    &nbsp;{lan.home_journey_hint}
                </Text>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableHighlight underlayColor={'#f66c6c'} activeOpacity={1} onPress={this.onPressNav.bind(this, FlightIndex)} style={{ borderColor: '#999', borderRadius: 4, borderWidth: 0.5, backgroundColor: '#fff' }} onShowUnderlay={() => this.setState({
                        bookingBtnActive: true
                    })} onHideUnderlay={() => this.setState({
                        bookingBtnActive: false
                    })}>
                        <Text style={[{ marginBottom: 5, marginTop: 5, marginLeft: 15, marginRight: 15, color: COLORS.link }, this.state.bookingBtnActive ? { color: '#fff' } : null]}>
                            {lan.home_journey_reserve}
                        </Text>
                    </TouchableHighlight>
                </View>
            </View>
        );
    }

    //最近待我审批订单样式布局
    getApproveOrderView = () => {
        return (
            <View style={{ borderRadius: 5, backgroundColor: '#fff', marginLeft: 15, marginRight: 15, marginTop: 15, padding: 10 }}>
                <TouchableOpacity onPress={() => this.state.CompanyApproveTypeID == 1 ? this.toApproveDetail() : this.toApproveDetail2()}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 15, color: "#666", flex: 1 }}>{lan.waitMyApproval}</Text>
                        <Text style={{ color: COLORS.btnBg, fontSize: 12 }}>{lan.home_trial_waiting
                            + this.getTimeLength(this.state.approveOrderInfo.CreateTime, moment().format())}</Text>
                    </View>
                    <Text style={{ marginTop: 5, fontSize: 13 }}>{lan.home_trial_ticket + this.state.approveOrderInfo.DepartureDate +
                        (this.state.approveOrderInfo.OrderTypeId == 2 ? home_trial_checkIn : lan.home_trial_departure) +
                        this.state.approveOrderInfo.OrderType + (this.state.CompanyApproveTypeID == 1 ? lan.home_trial_order : lan.home_trial_apply) +
                        lan.home_trial_applyTxt + this.state.approveOrderInfo.DisplayPassengerName + lan.home_trial_applyTxt2}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    //获取待出行行程单信息
    getToTravelInfo = () => {
        let endTime = '2025-12-31';
        let startTime = moment().format();
        let param = {
            "BookerCompanyCode": this.state.myInfo.Result.Company.CompanyCode,
            "PassengerCode": this.state.personCode,//"NE300V43",//
            "ProductCategoryID": "3,8,9",
            "PageSize": 1,
            "PageCount": 1,
            "IsPassengerOutTicket": true,
            "StartDate": startTime,
            "EndDate": endTime
        }
        RestAPI.invoke("ABIS.CustomerJourneyByConditionGet", JSON.stringify(param), (value) => {
            this.state.loadOrder = false;
            let orderInfo = value;
            if (orderInfo.Code == 0) {
                this.state.isVis = true;
                if (orderInfo.Result.RowCount != 0) {
                    this.state.sOShortNr = orderInfo.Result.JourneyInfos[0].SOShortNr;
                    if (orderInfo.Result.JourneyInfos[0].ProductCategoryID == 3) {
                        let v = orderInfo.Result.JourneyInfos[0];
                        this.state.orderType = orderInfo.Result.JourneyInfos[0].ProductCategoryID;
                        this.state.itiInfo = {
                            "DepartureDate": v.DepartureDate.replace("T", " "),
                            "DepartureTrainStationName": v.Trains[0].DepartureTrainStationName,
                            "DepartureTime": v.Trains[0].DepartureDate.substring(11, 16),
                            "ArrivalTrainStationName": v.Trains[0].ArrivalTrainStationName,
                            "ArrivalTime": v.Trains[0].ArrivalDate.substring(11, 16),
                            "TrainNr": v.Trains[0].TrainNr,
                            "CabinCode": v.Trains[0].CabinCode,
                            "CabinClass": v.Trains[0].CabinClass,
                            "Seat": v.Trains[0].Seat,
                        };
                        this.state.isHave = true;
                        this.setState({});
                    } else {
                        this.state.orderType = orderInfo.Result.JourneyInfos[0].ProductCategoryID;
                        this.state.itiInfo = {
                            "aircraftType": orderInfo.Result.JourneyInfos[0].Flights[0].AirEquipmentType != null ?
                                '机型' + orderInfo.Result.JourneyInfos[0].Flights[0].AirEquipmentType : '',
                            "TakeOffDate": orderInfo.Result.JourneyInfos[0].Flights[0].TakeOffDate.substring(11, 16),
                            "DepartureAirportName": orderInfo.Result.JourneyInfos[0].Flights[0].DepartureAirportName,
                            "ArrivalDate": orderInfo.Result.JourneyInfos[0].Flights[0].ArrivalDate.substring(11, 16),
                            "ArrivalAirportName": orderInfo.Result.JourneyInfos[0].Flights[0].ArrivalAirportName,
                            "DepartureTerminal": orderInfo.Result.JourneyInfos[0].Flights[0].DepartureTerminal,
                            'ArrivalTerminal': orderInfo.Result.JourneyInfos[0].Flights[0].ArrivalTerminal,
                            "ElapsedTime": orderInfo.Result.JourneyInfos[0].ElapsedTime,
                            "Distance": orderInfo.Result.JourneyInfos[0].Flights[0].Distance,
                        }
                        this.getAirNameAndNr(orderInfo.Result.JourneyInfos[0].PSOShortNr);
                    }
                } else {
                    this.setState({});
                }
            } else {
                Toast.info(value.Msg, 5, null, false);
            }
        }, (err) => {
            Toast.info(err, 3, null, false);
        })
    }

    //获取待我审批的订单
    getApproveOrder = () => {
        if (this.state.CompanyApproveTypeID != 2) {
            let param = {
                "BookerCompanyCode": this.props.Company_Code,
                "PSOCARPUserCode": this.state.accountNo,
                "PageNo": 0,
                "PageSize": 1
            }
            RestAPI.invoke("ABIS.BizSimTradeGetList", JSON.stringify(param), (value) => {
                try {
                    if (value.Code == 0) {
                        if (value.Result.TotalResults > 0) {
                            this.state.isHaveApprove = true;
                            this.state.approveOrderNr = value.Result.TotalResults;
                            this.state.approveOrderInfo = {
                                "TradeID": value.Result.Trades[0].TradeID,
                                "BookerID": value.Result.Trades[0].BookerID,
                                "CreateTime": value.Result.Trades[0].CreateTime,
                                "DepartureDate": value.Result.Trades[0].Orders[0].DepartureDate,
                                "OrderType": value.Result.Trades[0].Orders[0].OrderType == 3 ? lan.trains
                                    : (value.Result.Trades[0].Orders[0].OrderType == 2 ? lan.hotel : lan.flights),
                                "DisplayPassengerName": value.Result.Trades[0].DisplayPassengerName,
                                "OrderTypeId": value.Result.Trades[0].Orders[0].OrderType
                            }
                            this.setState({});
                        }
                    } else {
                        Toast.info(value.Msg, 3, null, false);
                    }
                } catch (error) {
                    console.log(error);
                }
            }, (err) => {
                Toast.info(err, 3, null, false);
            })
        } else {
            let param = {
                "ApprovingUserCode": this.state.accountNo,
                "PageSize": 1,
                "PageCount": this.state.waitApprovalNum
            }
            ServingClient.invoke("BIZ.BTAByApplicantByCondition", param, (value) => {
                try {
                    let orderInfo = value;
                    if (orderInfo.RowCount > 0) {
                        this.state.isHaveApprove = true;
                        this.state.approveOrderNr = orderInfo.RowCount;
                        this.state.approveOrderInfo = {
                            "TradeID": value.ApplicantUsers[0].ID,
                            "BookerID": value.ApplicantUsers[0].ApplicantUserCode,
                            "CreateTime": value.ApplicantUsers[0].CreateDate,
                            "DepartureDate": moment(value.ApplicantUsers[0].Contents[0].Content.Segment.DepartureDate).format("YYYY.MM.DD hh:mm"),
                            "OrderType": value.ApplicantUsers[0].Contents[0].Content.ProductCategoryID == 3 ? lan.trains
                                : (value.ApplicantUsers[0].Contents[0].Content.ProductCategoryID == 2 ? lan.hotel : lan.flights),
                            "DisplayPassengerName": value.ApplicantUsers[0].ApplicantUserName
                        }
                        this.setState({});
                    }
                } catch (error) {
                    console.log(error);
                }
            }, (err) => {
                Toast.info(err, 3, null, false);
            })
        }
    }

    //获取旅客人数跟航司名称
    getAirNameAndNr = (oID) => {
        let param = {
            "OrderID": oID
        }
        RestAPI.invoke("ABIS.SimOrderGet", JSON.stringify(param), (value) => {
            Toast.hide();
            let orderInfo = value;
            if (orderInfo.Code == 0) {
                this.state.itiInfo = {
                    "DepartureTime": orderInfo.Result.Order.Ticket.Segments[0].Flights[0].DepartureTime.replace("T", " "),
                    "Code": orderInfo.Result.Order.Ticket.Segments[0].Flights[0].MarketingAirline.Code,
                    "ShortName": orderInfo.Result.Order.Ticket.Segments[0].Flights[0].MarketingAirline.ShortName,
                    "FlightNr": orderInfo.Result.Order.Ticket.Segments[0].Flights[0].FlightNumber,
                    "aircraftType": this.state.itiInfo.aircraftType,
                    "cabin": this.getCabinClassName(orderInfo.Result.Order.Ticket.Segments[0].Flights[0].CabinLevel)
                        + orderInfo.Result.Order.Ticket.Segments[0].Flights[0].Cabin,
                    "TakeOffDate": this.state.itiInfo.TakeOffDate,
                    "DepartureAirportName": this.state.itiInfo.DepartureAirportName,
                    "ArrivalDate": this.state.itiInfo.ArrivalDate,
                    "ArrivalAirportName": this.state.itiInfo.ArrivalAirportName,
                    "DepartureTerminal": this.state.itiInfo.DepartureTerminal,
                    'ArrivalTerminal': this.state.itiInfo.ArrivalTerminal,
                    "ElapsedTime": this.state.itiInfo.ElapsedTime,
                    "Distance": this.state.itiInfo.Distance,
                    "passageNum": orderInfo.Result.Order.Passengers.length,
                }
                this.state.isHave = true;
                this.setState({});
            } else {
                Toast.info(value, 5, null, false);
            }
        }, (err) => {
            Toast.hide();
            Toast.info(err, 3, null, false);
        })
    }

    getCabinClassName = (type) => {
        if (type == 'Y') return lan.economyClass;
        else if (type == 'C') return lan.businessClass;
        else if (type == 'F') return lan.firstClass;
        else return lan.premiumEconomyClass;
    }

    //点击头像跳转
    setUpEvent = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.push({
                name: 'MyAccount',
                component: MyAccount,
                passProps: {
                    myInfo: this.state.myInfo,
                    headImg: this.state.myInfo.UserImage,
                    UserAccount: this.state.userAccount
                }
            });
        }
    }

    //机票行程单界面
    getPlaneItiView = (oInfo) => {
        return (
            <View style={{ marginLeft: 15, marginRight: 15, marginTop: 10, marginBottom: 10 }}>
                <TouchableOpacity onPress={() => { this.toOrderDetail() }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 8, marginTop: 10 }}>
                        <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10, marginTop: 10, alignItems: 'flex-end' }}>
                            <Text style={[styles.cardTitle_left, { flex: 1 }]} >
                                <Icon icon={0xe670} color={'#696969'} style={styles.cardTitle_icon} />
                                &nbsp;{moment(oInfo.DepartureTime).format("YYYY.MM.DD HH:mm")}
                            </Text>
                            <Text style={{ color: '#999', fontSize: 11 }}>{lan.residue + ":"
                                + this.getTimeLength(moment().format(), oInfo.DepartureTime)}</Text>
                        </View>
                        <View style={{ backgroundColor: '#ebebeb', marginTop: 10, height: 1 / FLEXBOX.pixel }} />

                        <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 20 }}>
                            <View style={{ marginLeft: 5, flex: 1 }}>
                                <Text style={{ fontSize: 20, color: '#333', textAlign: "right" }}>{oInfo.TakeOffDate}</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontSize: 12, color: '#666' }} numberOfLines={1}>{oInfo.DepartureAirportName}</Text>
                                    <Text style={{ fontSize: 12, color: '#666' }}>{oInfo.DepartureTerminal != null ? oInfo.DepartureTerminal : ""}</Text>
                                </View>
                            </View>
                            <View style={{ marginLeft: 15, marginRight: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ height: 14, width: 14, borderRadius: 7, borderWidth: 1 / FLEXBOX.pixel, borderColor: '#666' }} />
                                <View style={{ height: 2 / FLEXBOX.pixel, width: 50, backgroundColor: '#999' }} />
                                <View style={{ height: 14, width: 14, borderRadius: 7, borderWidth: 1 / FLEXBOX.pixel, borderColor: '#666' }} />
                            </View>
                            <View style={{ flex: 1, marginRight: 5 }}>
                                <Text style={{ fontSize: 20, color: '#333' }}>{oInfo.ArrivalDate}</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontSize: 12, color: '#666' }} numberOfLines={1}>{oInfo.ArrivalAirportName}</Text>
                                    <Text style={{ fontSize: 12, color: '#666' }}>{oInfo.ArrivalTerminal != null ? oInfo.ArrivalTerminal : ""}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 20, marginLeft: 20, marginRight: 20 }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={styles.card_hd_text}>{oInfo.ShortName + " " + oInfo.FlightNr}</Text>
                                <Text style={styles.card_info_text}>{oInfo.ElapsedTime}</Text>
                            </View>

                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={styles.card_hd_text}>{oInfo.aircraftType}</Text>
                                <Text style={styles.card_info_text}>{oInfo.Distance + "km"}</Text>
                            </View>

                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={styles.card_hd_text}>{oInfo.cabin}</Text>
                                <Text style={styles.card_info_text}>{lan.passenger + oInfo.passageNum + lan.people}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    //火车票行程单界面
    getTrainItiView = (oInfo) => {
        return (
            <View style={{ marginLeft: 15, marginRight: 15, marginTop: 10, marginBottom: 10 }}>
                <TouchableOpacity onPress={() => { this.toOrderDetail() }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 8, marginTop: 10 }}>
                        <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10, marginTop: 10, alignItems: 'flex-end' }}>
                            <Text style={[styles.cardTitle_left, { flex: 1 }]} >
                                <Icon icon={0xe670} color={'#696969'} style={styles.cardTitle_icon} />
                                &nbsp;{moment(oInfo.DepartureDate).format("YYYY.MM.DD HH:mm")}
                            </Text>
                            <Text style={{ color: '#999', fontSize: 11 }}>{lan.residue + ":"
                                + this.getTimeLength(moment().format(), oInfo.DepartureDate)}</Text>
                        </View>
                        <View style={{ backgroundColor: '#ebebeb', marginTop: 10, height: 1 / FLEXBOX.pixel }} />

                        <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 20 }}>
                            <View >
                                <Text style={{ fontSize: 20, color: '#333', textAlign: "right" }}>{oInfo.DepartureTrainStationName}</Text>
                                <Text style={{ fontSize: 12, color: '#666', textAlign: "right" }}>{oInfo.DepartureTime}</Text>
                            </View>
                            <View style={{ marginLeft: 15, marginRight: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ height: 14, width: 14, borderRadius: 7, borderWidth: 1 / FLEXBOX.pixel, borderColor: '#666' }} />
                                <View style={{ height: 2 / FLEXBOX.pixel, width: 50, backgroundColor: '#999' }} />
                                <View style={{ height: 14, width: 14, borderRadius: 7, borderWidth: 1 / FLEXBOX.pixel, borderColor: '#666' }} />
                            </View>
                            <View style={{ marginLeft: 10 }}>
                                <Text style={{ fontSize: 20, color: '#333' }}>{oInfo.ArrivalTrainStationName}</Text>
                                <Text style={{ fontSize: 12, color: '#666' }}>{oInfo.ArrivalTime}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 20, marginLeft: 20, marginRight: 20 }}>
                            <Text style={{ color: '#999', fontSize: 14 }}>{oInfo.TrainNr}</Text>
                            <Text style={{ color: '#999', fontSize: 14, flex: 1, textAlign: 'center' }}>{oInfo.CabinCode}</Text>
                            <Text style={{ color: '#999', fontSize: 14 }}>{oInfo.Seat}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    //查看行程单详情
    toOrderDetail = () => {
        this.props.navigator.push({
            name: 'OrderDetail',
            component: OrderDetail,
            passProps: {
                // ServiceStaffInfo:{},
                OrderId: this.state.sOShortNr,
                BookerID: this.state.accountNo,
                LoginAccount: this.state.userAccount,
                AccountNo: this.state.accountNo,
                RefreshEvent: () => { }
            }
        });
    }

    //查看审批单详情
    toApproveDetail = () => {
        this.props.navigator.push({
            name: 'OrderDetail',
            component: OrderDetail,
            passProps: {
                OrderId: this.state.approveOrderInfo.TradeID,
                BookerID: this.state.approveOrderInfo.BookerID,
                LoginAccount: this.state.userAccount,
                AccountNo: this.state.accountNo,
                IsApproval: true,
                RefreshEvent: (content) => { this.getApproveOrder() }
            }
        });
    }

    //流程2查看待我审批订单详情
    toApproveDetail2 = () => {
        this.props.navigator.push({
            component: ApprovalDetail,
            passProps: {
                ID: this.state.approveOrderInfo.TradeID,
                type: 1,
                RefreshEvent: () => { this.getApproveOrder() },
            },
        })
    }

    //计算时间间隔
    getTimeLength = (startDate, endDate) => {
        startDate = moment(moment(startDate).format('YYYY-MM-DD HH:mm')).format('X');
        endDate = moment(moment(endDate).format('YYYY-MM-DD HH:mm')).format('X');
        let millisec = Math.abs((startDate - endDate))
        let dd = parseInt(millisec / 60 / 60 / 24); // 天数
        let mm = millisec / 60 % 60; // 分
        let hh = parseInt(millisec / 60 / 60 % 24); //小时
        return dd >= 1 ? (dd + lan.day + (hh >= 1 ? hh + lan.hour : "") + (mm >= 1 ? mm + lan.minute : "")) :
            hh >= 1 ? (hh + lan.hour + (mm >= 1 ? mm + lan.minute : "")) : mm + lan.minute;
    }
}

const styles = StyleSheet.create({
    //容器
    container: {
        flex: 1,
        backgroundColor: '#e6eaf2'
    },
    //背景
    userInfo: {
        height: 180,
        width: FLEXBOX.width,
        resizeMode: 'cover',
        paddingTop: 30,
    },
    //标题
    userInfo_title: {
        backgroundColor: 'transparent',
        height: 180,
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        flex: 1,
    },
    userInfo_avatar: {
        position: 'absolute',
        left: 10,
        top: 25,

    },
    userInfo_avatarImg: {
        height: 18,
        width: 18,
        borderRadius: 9,
        borderWidth: 1 / FLEXBOX.pixel,
        borderColor: '#818287'
    },
    //九宫格
    navGrid_item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    navGrid: {
        shadowColor: '#ccc',
        shadowOffset: { height: 0, width: 0 },
        shadowRadius: 2,
        shadowOpacity: 0.8,
    },
    todoList: {
        padding: 10,
        paddingTop: 20,
        backgroundColor: '#e6eaf2'
    },
    cardTitle_right: {

    },
    cardTitle: {
        marginBottom: 5,
    },
    cardTitle_left: {
        color: '#666',
        width: FLEXBOX.width * .8,
        fontSize: 13,

    },
    cardTitle_icon: {
        fontSize: 15,
    },
    card_airline_img: {
        width: 12,
        height: 12,
        alignSelf: 'center',
        marginRight: 2,
    },
    card_hd_text: {
        fontSize: 12,
        fontWeight: 'normal',


    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 6,

        shadowColor: '#ccc',
        shadowOffset: { height: 0, width: 0 },
        shadowRadius: 2,
        shadowOpacity: 0.8,

    },
    card_hd: {
        padding: 10,
        paddingTop: 8,
        flexDirection: 'row',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1 / FLEXBOX.pixel
    },
    card_circle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#e6eaf2',
        position: 'absolute',
        top: 26,
    },
    card_circle_left: {
        left: -7,
    },
    card_circle_right: {
        right: -8,
    },
    card_bd: { padding: 10, },
    card_bd_main: {
        paddingLeft: 10,
        paddingRight: 10,
    },
    card_bd_time: {
        fontSize: 22,
        color: '#333',

    },
    card_bd_time_left: {

        textAlign: 'right'
    },
    card_bd_airportView: {
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    card_bd_airportViewLeft: {
        justifyContent: 'flex-end'
    },
    card_bd_airport: {
        flex: 1,
        fontSize: 12,
        color: '#666',
        //width: FLEXBOX.width * 0.2,



    },
    card_bd_terminal: {
        marginLeft: 2,
        fontSize: 12,
        color: '#666',
    },
    card_bd_left: {
        width: FLEXBOX.width * 0.35,

    },
    card_bd_right: {
        width: FLEXBOX.width * 0.35
    },
    card_bd_center: {
        width: FLEXBOX.width * 0.2,
        alignItems: 'center',
        justifyContent: 'center',

    },

    card_emptyCircle: {
        position: 'absolute',
        top: -6,
        width: 13,
        height: 13,
        borderRadius: 6.5,
        borderColor: '#666',
        borderWidth: 1
    },
    card_emptyCircle_left: {
        left: -12,
    },
    card_emptyCircle_right: {
        right: -12,
    },
    card_bd_line: {
        height: 1,
        backgroundColor: '#666',
        width: 30,

    },
    card_info: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingLeft: 15,
        paddingRight: 15,
    },
    card_info_text: {
        color: '#999',
        fontSize: 12,
    }

})