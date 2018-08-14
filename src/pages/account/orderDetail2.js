import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    ListView,
    ScrollView,
    TouchableOpacity,
    Platform,
    BackAndroid,
    NativeModules,
    Alert,
} from 'react-native';
import { Toast,Popup } from 'antd-mobile';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import { COLORS, FLEXBOX } from '../../styles/commonStyle';
import AdviserModule from './adviserModule';
import ExhibitionView from '../../components/exhibitionView/index';
import { RestAPI,ServingClient } from '../../utils/yqfws';
import FlightView from '../../components/booking/flightList';
import FlightInfo from '../../components/booking/flightInfo';
import Flex from '../../components/flex';
import formatPrice from '../../components/formatPrice';
import PayWebview from '../webviewView/payWebview';
import Main from '../../IM/index';
import Enumerable from 'linq';
import Marquee from '../../components/marquee';

import moment from 'moment';
import Modal from '../../components/modal';
import 'moment/locale/zh-cn';

import ListStore from '../../stores/train/change'
import FlightChangeStore from '../../stores/flight/change';
import Change from '../../pages/trains/change';
import FlightChange from '../../pages/flight/change';
import PassengerStore from '../../stores/booking/passenger-order';


var { width, height } = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

const proofType = [
    {
        "TypeCode": "10",
        "Name": lan.militaryCard,
      },
      {
        "TypeCode": "11",
        "Name": lan.reentryPermit,
      },
      {
        "TypeCode": "12",
        "Name": lan.mtp,
      },
      {
        "TypeCode": "13",
        "Name": lan.EEP,
      },
      {
        "TypeCode": "ID",
        "Name": lan.ID,
      },
      {
        "TypeCode": "NI",
        "Name": lan.other,
      },
      {
        "TypeCode": "PP",
        "Name": lan.passport,
      }
]
var num = 0;
export default class orderDetail extends Component {

    constructor(props) {
        super(props);
        this.store = ListStore;
        this.flightStore = FlightChangeStore;
        this.state = {
            callNr: 0,//接口调用次数
            accountNo: '',
            orderId: this.props.OrderId,//订单号
            InnerID: '',

            Plane_Info: [],
            Train_Info: [],
            Hotel_Info: [],
            Insure_Info: [],
            Visa_Info: [],
            orderTitleInfo: {},
            passengersInfo: [],
            bookingInfo: {
                'ContactPerson': '',
                'ContactMobile': '',
                'ContactEmail': '',
                'Remark': ''
            },
            ServiceStaffInfo: this.props.ServiceStaffInfo,
            Segments: [],
            changeSegments:[],
            title: {},

            isAllowClose: false,//判断此单是否允许取消
            isPay: false,//判断此单是否允许马上支付

            //所有机票信息listview关联的数据
            AllPlaneInfo: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            //所有火车票信息listview关联的数据
            AllTrainInfo: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            //所有酒店信息listview关联的数据
            AllHotelInfo: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            //所有保险信息listview关联的数据
            AllInsureInfo: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            //所有签证信息listview关联的数据
            AllVisaInfo: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),

            //旅客信息listview关联的数据
            passengersData: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            //改签旅客信息listview关联的数据
            changeReturnData: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            //机票信息listview关联的数据
            domesticInfo: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            //火车票信息listview关联的数据
            trainInfo: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),

            travelNatureCode: lan.public,
            isPublic:true,

            contactPerson: '',
            contactMobile: '',
            contactEmail: '',
            remark: '',

            isAro: true,//点击拒绝或者同意审批按钮后隐藏两个按钮

            CusApproveRoutings: [],//审批人信息

            isChange:false,
            changeSuccess:false,
            changeTrip:[],
            refundCost:false,
            refunding:false,
            changePassengersData:[],//所有旅客信息
            changePasInfo:[],//改单了乘客信息
            stateName:'',//旅客票单状态
            goPassengerInfo:[],//去程旅客信息
            backPassengerInfo:[],//回程旅客信息
        };
    }

    componentDidMount() {
        this.store.list = [];
        this.flightStore.list = [];
        PassengerStore.passengerList = [];
        this.store.count = 0;
        storage.load({ key: 'USERINFO' }).then(val => {
            if (val != null) {
                let userInfo = JSON.parse(val);
                this.state.accountNo = userInfo.AccountNo;
                this.getOrderDetailInfo();
            }
        }).catch(err => {
            console.log(err)
        });
        // this.getOrderDetailInfo();
        // this.getApproveRouting();
    }

    toMain = () => {
        this.props.navigator.resetTo({
            name: 'Main',
            component: Main,
        })
    }

    render() {
        let returnCount = true;
        let changeCount = 0;
        for(var c of this.state.changePassengersData){
            if(c.IsChange || c.ChangeSuccess) changeCount++;
            if(c.StatusID == 22) returnCount = false;
            if(c.StatusID == 32) changeCount++;
        }
        if(this.props.ticketType && this.state.callNr == 2) this.planeTicketTrip(this.props.ticketType)
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.containerBg }}>
                <Navbar navigator={this.props.navigator} title={lan.orderDetail} rightIcon={'0xe667'}
                    onRightClick={() => this.toMain()} />
                <ScrollView>
                    {this.state.orderTitleInfo.BookerName ? this.getOrderTitleView() : null}

                    {this.state.Plane_Info.length > 0 ?
                        <View>
                            <Text style={{ fontSize: 14, marginLeft: 15, marginBottom: 2, color: "#999", marginTop: 10 }}>机票信息</Text>
                            <View style={{ paddingLeft: 15, paddingRight: 15, paddingBottom: 10, backgroundColor: '#fff' }}>

                                <ListView
                                    enableEmptySections={true}
                                    dataSource={this.state.AllPlaneInfo}
                                    renderRow={(rowData, sectionId, rowId) => this.setPlaneAllInfo(rowData)}
                                />
                            </View>
                        </View>
                        : null}

                    {this.state.Plane_Info.length > 0 ?
                        <View>
                            <ListView
                                style={{ marginTop: 8 }}
                                dataSource={this.state.passengersData}
                                renderRow={this.setPlanePassengView.bind(this)}
                            />
                        </View> : null
                    }
                    {(this.state.isChange || this.state.changeSuccess)?//||this.state.refundCost ? 
                        this.state.changePasInfo.map((l, i) => {
                            let ds = new ListView.DataSource({
                                rowHasChanged: (row1, row2) => row1 !== row2,
                            })
                            this.state.changeReturnData = ds.cloneWithRows(l);
                        return (
                        <View key={i}>
                            <View style={styles.cardHeader}>
                            <Text style={styles.cardHeaderText}>{lan.trainInfo}</Text>
                            </View>
                            {this.setTrainAllInfo(this.state.changeTrip[i],true,true)}
                            {this.state.orderTitleInfo.StatusID == 48 || this.state.orderTitleInfo.StatusID == 49?
                            <View style={{backgroundColor: '#fff0da'}}>
                                <Marquee
                                bgColor={{ backgroundColor: '#fff0da' }}
                                textStyle={{color:'#fc9027'}}
                                data={`很抱歉，您所提交的${this.state.orderTitleInfo.StatusID == 48?'改签':'退票'}申请，${this.state.orderTitleInfo.StatusID == 48?'改签':'退票'}失败，请重新提交`}
                                alert /> 
                            </View>
                            :null}
                            <ListView
                                dataSource={this.state.changeReturnData}
                                enableEmptySections={true}
                                renderRow={(rowData, sectionId, rowId) => this.setTrainPassengView(rowData, rowId,true,this.state.changeSegments[i],0)}
                            />
                        </View>
                        )
                    })
                    
                    : null}
                    {this.state.Train_Info.length > 0 ?
                            <View>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardHeaderText}>
                                        {lan.trainInfo+(this.state.isChange || this.state.changeSuccess?"(旧)":"")}</Text>
                                </View>
                                <ListView
                                    enableEmptySections={true}
                                    dataSource={this.state.AllTrainInfo}
                                    renderRow={(rowData, sectionId, rowId) => 
                                        this.setTrainAllInfo(rowData,!(this.state.isChange || this.state.changeSuccess),false)}
                                />
                                <ListView
                                    dataSource={this.state.passengersData}
                                    enableEmptySections={true}
                                    renderRow={(rowData, sectionId, rowId) => this.setTrainPassengView(rowData,
                                         rowId,!(this.state.isChange||this.state.changeSuccess),this.state.Segments,1)}
                                />
                            </View>
                            : null}

                    {this.state.Hotel_Info.length > 0 ?
                        <ListView
                            enableEmptySections={true}
                            dataSource={this.state.AllHotelInfo}
                            renderRow={(rowData, sectionId, rowId) =>
                                this.setHotelPassengView(rowData, this.state.passengersInfo)}
                        />
                        : null}

                    {this.state.Insure_Info.length > 0 ?
                        <View>
                            <Text style={{ fontSize: 14, marginLeft: 15, marginBottom: 2, color: "#999", marginTop: 10 }}>保险信息</Text>
                            <ListView
                                enableEmptySections={true}
                                dataSource={this.state.AllInsureInfo}
                                renderRow={(rowData, sectionId, rowId) =>
                                    this.setInsureOrVisaView(4, rowData)}
                            />
                        </View>
                        : null}
                    {this.state.Visa_Info.length > 0 ?
                        <View>
                            <Text style={{ fontSize: 14, marginLeft: 15, marginBottom: 2, color: "#999", marginTop: 10 }}>签证信息</Text>
                            <ListView
                                enableEmptySections={true}
                                dataSource={this.state.AllVisaInfo}
                                renderRow={(rowData, sectionId, rowId) =>
                                    this.setInsureOrVisaView(5, rowData)}
                            />
                        </View>
                        : null}

                    <Text style={{ color: '#999', fontSize: 14, marginLeft: 15, marginBottom: 3, marginTop: 8 }}>{lan.contactInfo}</Text>
                    <ExhibitionView leftText={lan.name} rightText={this.state.bookingInfo.ContactPerson}
                        rightColor={'#333'} bottomLine={true} leftColor={'#666'} />
                    <ExhibitionView leftText={lan.mpNumber} rightText={this.state.bookingInfo.ContactMobile == '' ?
                        this.state.mMobile : this.state.bookingInfo.ContactMobile}
                        isVisible={true} iconCode={"0xe66f"}
                        clickEvent = {()=>{this.callPhoneToRole(
                            this.state.bookingInfo.ContactMobile == '' ? this.state.mMobile : 
                                this.state.bookingInfo.ContactMobile
                        )}}
                        rightColor={'#333'} bottomLine={true} leftColor={'#666'} />
                    <ExhibitionView leftText={lan.email} rightText={this.state.bookingInfo.ContactEmail == '' ?
                        this.state.mEmail : this.state.bookingInfo.ContactEmail} rightColor={'#333'}
                        leftColor={'#666'} bottomLine={true} />
                    <View style={{marginBottom:8, paddingLeft: 15, paddingRight: 15, paddingTop: 8, paddingBottom: 8, flexDirection: 'row', backgroundColor: '#fff' }}>
                        <Text style={{ flex: .3, fontSize: 16, color: '#666' }}>{lan.remark}</Text>
                        <Text style={{ flex: .7, fontSize: 16, color: '#333', paddingLeft: 12 }}>{this.state.bookingInfo.Remark}</Text>
                    </View>

                    {/* {this.state.ServiceStaffInfo ?
                        <View>
                            <Text style={{ color: '#999', fontSize: 14, marginLeft: 15, marginBottom: 3, marginTop: 8 }}>{lan.consultant}</Text>
                            <AdviserModule serviceStaffInfo={this.state.ServiceStaffInfo} navigator={this.props.navigator}/>
                        </View>
                        : null} */}

                    {/**审批人流程样式模块界面**/}


                    {/* {this.state.CusApproveRoutings.length>0 && this.state.orderTitleInfo.StatusID != 14 ?
                    this.getApprovalStateView(this.state.CusApproveRoutings) : null } */}

                   

  
                    {/** “取消订单”或者“马上支付”的点击按钮 **/}
                    {!this.props.IsApproval?
                        <View style={{ flexDirection: 'row'}}>
                            {(this.state.orderTitleInfo.StatusID == 1|| this.state.orderTitleInfo.StatusID == 6
                            || this.state.orderTitleInfo.StatusID == 21|| this.state.orderTitleInfo.StatusID == 22
                            || this.state.orderTitleInfo.StatusID == 2 || this.state.orderTitleInfo.StatusID == 15)
                            ?<TouchableOpacity onPress={() => this.cancelOrder()}
                                    style={{ flex: 0.6, alignItems: 'center', justifyContent: 'center', 
                                            backgroundColor: "#fff",height: 48, marginTop: 15, 
                                            borderTopWidth: 0.5, borderTopColor: '#ccc',  }}>
                                    <Text style={{ color: '#999', fontSize: 15 }}>{lan.cancelOrder}</Text>
                            </TouchableOpacity>
                            :null}
                            
                            {this.state.isPay ?
                                <TouchableOpacity style={{
                                    flex: 1, alignItems: 'center', justifyContent: 'center',height: 48,
                                    backgroundColor: COLORS.btnBg
                                }}
                                    onPress={() => this.toPayOrder(this.state.orderTitleInfo.OrderID, this.state.orderTitleInfo.TotalAmount)}>
                                    <Text style={{ color: '#fff', fontSize: 15, }}>{lan.payNow}</Text>
                                </TouchableOpacity>
                                : null}
                        </View>
                        : null}
                        
                                
                            

                    {/** “拒绝申请”或者“同意申请”的点击按钮 **/}
                    {(this.props.IsApproval && this.state.isAro && this.state.orderTitleInfo.StatusID != 14) ?
                        <View style={{ flexDirection: 'row', height: 48, marginTop: 15, borderTopWidth: 0.5, borderTopColor: '#ccc' }}>
                            <TouchableOpacity onPress={() => this.refuseApprovalEvent()}
                                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: "#fff" }}>
                                <Text style={{ color: '#999', fontSize: 15 }}>{lan.refuseApproval}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{
                                flex: 1, alignItems: 'center', justifyContent: 'center',
                                backgroundColor: COLORS.btnBg
                            }}
                                onPress={() => this.agreeApprovalEvent()}>
                                <Text style={{ color: '#fff', fontSize: 15 }}>{lan.agreeApproval}</Text>
                            </TouchableOpacity>
                        </View>
                        : null}
                    {(this.state.Train_Info.length > 0 && !returnCount && this.props.BookerID == this.state.accountNo) 
                    || (this.state.orderTitleInfo.OrderType == 8 && this.props.BookerID == this.state.accountNo
                        && (this.state.goPassengerInfo.length>0 || this.state.backPassengerInfo.length>0)) 
                        ?
                        <View style={{ flexDirection: 'row', height: 48, borderTopWidth: 0.5, borderTopColor: '#ccc', }}>
                            {(!this.state.isChange && !this.state.changeSuccess && this.state.orderTitleInfo.StatusID != 18)
                            || changeCount<this.state.changePassengersData.length ?
                            <TouchableOpacity onPress={() => {
                                if(this.state.orderTitleInfo.OrderType == 8 )
                                    this.planeTicketTrip(1)
                                else this.toSelectChangeTicket(1)}}
                                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: "#fff" }}>
                                <Text style={{ color: '#999', fontSize: 15 }}>{lan.change_changeTicket}</Text>
                            </TouchableOpacity>
                            : null}
                            <TouchableOpacity style={{
                                flex: 1, alignItems: 'center', justifyContent: 'center',
                                backgroundColor: COLORS.btnBg }}
                                onPress={() => {
                                    if(this.state.orderTitleInfo.OrderType == 8 )
                                    this.planeTicketTrip(2)
                                    else this.toSelectChangeTicket(2)}}>
                                <Text style={{ color: '#fff', fontSize: 15 }}>{lan.change_returnTicket}</Text>
                            </TouchableOpacity>
                        </View>
                    : null}
                </ScrollView>
            </View>
        );
    }

    //获取订单的审批信息
    getApproveRouting = (pSOID) => {
        let param = {
            "PSOID": pSOID  // SAHJTS
        }
        RestAPI.invoke("Biz3.PSOCusApproveRoutingBySOID", JSON.stringify(param), (value) => {
            this.state.callNr++;
            if (this.state.callNr == 2)
                Toast.hide();
            if (value.Code == 0) {
                this.state.CusApproveRoutings = value.Result.CusApproveRoutings;
              //  console.log(222,this.state.CusApproveRoutings)
                if (this.state.callNr == 2) this.setState({});
            } else {
                Toast.info(value.Msg, 3, null, false);
            }
        }, (err) => {
            this.state.callNr++;
            Toast.info(err, 3, null, false);
        })
    }

    //获取订单详情
    getOrderDetailInfo = () => {
        let param = {
            "TradeID": this.state.orderId,
            "OrderID": null,
            "BookerID": this.props.BookerID,
            "UserCode": ""
        }
        Toast.loading(lan.loading, 60, () => {
            Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("ABIS.SimTradeGet", JSON.stringify(param), (value) => {
            this.state.callNr++;
            if (this.state.callNr == 2)
                Toast.hide();
            let orderInfo = value;
            if (orderInfo.Code == 0) {
                this.store.orderDetail = orderInfo;
                this.getApproveRouting(orderInfo.Result.Trade.Orders[0].InnerID.ID)
                this.state.InnerID = orderInfo.Result.Trade.InnerID.ID;
                this.state.travelNatureCode = orderInfo.Result.Trade.Orders[0].TravelNatureCode == ('Public')
                    ? lan.public : lan.private;
                this.state.isPublic = orderInfo.Result.Trade.Orders[0].TravelNatureCode == ('Public')?true :false;
                this.state.orderTitleInfo = {
                    'BookerID':orderInfo.Result.Trade.BookerName,
                    'BookerName': orderInfo.Result.Trade.BookerName,
                    'StatusName': orderInfo.Result.Trade.StatusName,
                    'StatusID': orderInfo.Result.Trade.StatusID,
                    'OrderID': orderInfo.Result.Trade.TradeID,
                    'DepartureDate': orderInfo.Result.Trade.Orders[0].OrderType == 5 ? "" : orderInfo.Result.Trade.Orders[0].DepartureDate,
                    'PaymentMethodID': orderInfo.Result.Trade.PaymentMethodID == 1 ? lan.cashPayment :
                        orderInfo.Result.Trade.PaymentMethodID == 3 ? lan.arrears : lan.monthlyPay,
                    'CostCenterInfo': orderInfo.Result.Trade.Orders[0].Policy.CostCenterInfo,
                    'TravelPurpose': orderInfo.Result.Trade.Orders[0].TravelPurpose,
                    'ContrReason': orderInfo.Result.Trade.Orders[0].Policy.ContrReason,
                    'ContrContent': orderInfo.Result.Trade.Orders[0].Policy.ContrContent,
                    "CreateTime": orderInfo.Result.Trade.CreateTime,
                    'TotalAmount': orderInfo.Result.Trade.TotalAmount,
                    'OrderType':orderInfo.Result.Trade.Orders[0].OrderType
                };
                this.state.bookingInfo = {
                    'ContactPerson': orderInfo.Result.Trade.ContactPerson,
                    'ContactMobile': orderInfo.Result.Trade.ContactMobile,
                    'ContactEmail': orderInfo.Result.Trade.ContactEmail,
                    'Remark': orderInfo.Result.Trade.Remark == '' || orderInfo.Result.Trade.Remark == null ? '未填写'
                        : orderInfo.Result.Trade.Remark,
                };
                if (orderInfo.Result.Trade.ServiceStaff && JSON.stringify(orderInfo.Result.Trade.ServiceStaff) != '{}'
                    && JSON.stringify(this.state.ServiceStaffInfo) != '{}') {
                    this.state.ServiceStaffInfo = {
                        'UserCode': orderInfo.Result.Trade.ServiceStaff.UserCode,
                        'Name': orderInfo.Result.Trade.ServiceStaff.Name,
                        'CustomerServiceCount': orderInfo.Result.Trade.ServiceStaff.CustomerServiceCount
                            ? orderInfo.Result.Trade.ServiceStaff.CustomerServiceCount :this.state.ServiceStaffInfo.CustomerServiceCount,
                        'UserAVGScore': orderInfo.Result.Trade.ServiceStaff.UserAVGScore,
                        'Mobile': orderInfo.Result.Trade.ServiceStaff.Mobile,
                        'WXQRCode': orderInfo.Result.Trade.ServiceStaff.WXQRCode,
                        'IsOnline': orderInfo.Result.Trade.ServiceStaff.IsOnline,
                        'IsMobileOnline': orderInfo.Result.Trade.ServiceStaff.IsMobileOnline,
                        'userImg': orderInfo.Result.Trade.ServiceStaff.Face,
                        // 'IMNr':this.state.ServiceStaffInfo.IMNr
                    }
                    this.getIMNr(orderInfo.Result.Trade.ServiceStaff.UserCode);
                }
                let ds = new ListView.DataSource({
                    rowHasChanged: (row1, row2) => row1 !== row2,
                });
                this.state.isPay = (orderInfo.Result.Trade.IsPayable && orderInfo.Result.Trade.PaymentMethodID != 5)
                    && orderInfo.Result.Trade.BookerID == this.state.accountNo;
                for(var pasItem of orderInfo.Result.Trade.Orders[0].Passengers){
                    let item = {
                        "ID":pasItem.ID,
                        "Name":pasItem.Name,
                        "Type":pasItem.Type,
                        "CertType":pasItem.CertType,
                        "CertNr":pasItem.CertNr,
                        "Birthday":pasItem.Birthday,
                        "Sex":pasItem.Sex,
                        "ContactMobile":pasItem.ContactMobile,
                        "TicketNr":pasItem.TicketNr,
                        "OrderID":orderInfo.Result.Trade.Orders[0].OrderID,
                        "MiddleVendorOrderID":orderInfo.Result.Trade.Orders[0].OrderType == 3 ?
                            orderInfo.Result.Trade.Orders[0].EurailP2P.MiddleVendorOrderID:'',
                        "StatusID":pasItem.StatusID,
                        "IsChange":false,
                        "ChangeSuccess":false,
                        "IsReturn":false,
                        "ReturnSuccess":false,
                        "ChangeFail":false,
                        "ReturnFail":false
                    }
                    this.state.changePassengersData.splice(this.state.changePassengersData.length,0,item);
                }
                if(orderInfo.Result.Trade.Orders[0].OrderType == 3)
                    this.state.Segments = orderInfo.Result.Trade.Orders[0].EurailP2P.Segments;
                let TicketOrderInfo = [];
                for(var TOI of orderInfo.Result.Trade.Orders){
                    if(TOI.OrderType == 8){
                        TicketOrderInfo.splice(TicketOrderInfo.length,0,TOI);
                    }
                }
                if(orderInfo.Result.Trade.Orders[0].OrderType == 8){
                    this.flightStore.orderDetail = orderInfo;
                    this.tripPassengerInfo(TicketOrderInfo);
                }
                let n = 0;
                for (var v of orderInfo.Result.Trade.Orders) {
                    if (v.OrderType == 2) {
                        this.state.passengersInfo = v.Passengers;
                        if (!this.state.isAllowClose)
                            this.state.isAllowClose = v.IsAllowClose
                                && orderInfo.Result.Trade.BookerID == this.state.accountNo;
                        let hotel_info = {
                            "HotelName": v.Hotal.HotelName,
                            "CheckInDate": v.Hotal.CheckInDate,
                            "CheckOutDate": v.Hotal.CheckOutDate,
                            "RoomTypeName": v.Hotal.Rooms[0].RoomTypeName,
                            "BreakfastName": v.Hotal.Rooms[0].BreakfastName,
                            "IsContrPolicy": v.Policy.IsContrPolicy,
                            "ContrContent": v.Policy.ContrContent,
                            "HotelAddress": v.Hotal.HotelAddress,
                            "EI": v.Policy.EI,
                            "RoomPrice":v.Hotal.Expenses[0].RoomPrice ? 
                                lan.housingPrice+":¥" + v.Hotal.Expenses[0].RoomPrice + "x" +
                                v.Hotal.Expenses[0].RoomQty + "x"+lan.jian + v.Hotal.Expenses[0].DayQty + 
                                "x"+lan.night : lan.housingPrice+":¥ 0",
                            "TotalAmount": "¥" + v.TotalAmount,
                            "Rooms": v.Hotal.Rooms.length,
                        }
                        this.state.Hotel_Info.splice(this.state.Hotel_Info.length, 0, hotel_info);
                    } else if (v.OrderType == 3) {
                        let traInfo = [];
                        let T_info = {};
                        this.store.departureTime = v.EurailP2P.Segments[0].Trains[0].DepartureTime;
                        this.store.ticketPrice = v.EurailP2P.Expenses[0].TicketPrice?v.EurailP2P.Expenses[0].TicketPrice:0.0;
                        if (!this.state.isAllowClose)
                            this.state.isAllowClose = v.IsAllowClose
                                && orderInfo.Result.Trade.BookerID == this.state.accountNo;
                        
                        for (var i = 0; i < v.EurailP2P.Segments.length; i++) {
                            var v1 = v.EurailP2P.Segments[i];
                            T_info = {
                                "DepartureTime": v1.Trains[0].DepartureTime.substring(11, 16),
                                "ArrivalTime": v1.Trains[0].ArrivalTime.substring(11, 16),
                                "TotalElapsedTime": this.getDateDiff(v1.Trains[0].DepartureTime, v1.Trains[0].ArrivalTime, null),
                                "dayNum": this.getDateDiff(v1.Trains[0].DepartureTime, v1.Trains[0].ArrivalTime, true),
                                "DepartureCity": v1.DepartureCity.CityName,//split('|')
                                "ArrivalCity": v1.ArrivalCity.CityName,
                                "TrainNumber": v1.Trains[0].TrainNumber,
                                "EI": v.Policy.EI,
                                "CabinLevel": v1.Trains[0].CabinLevel,
                                "TicketPrice": v.EurailP2P.Expenses[i].TicketPrice,
                                "PassengerQty": v.EurailP2P.Expenses[i].PassengerQty,
                                "TotalAmount": v.TotalAmount
                            }
                            traInfo.splice(traInfo.length, 0, T_info);
                        }
                        if(v.StatusID == 17) {
                            this.state.isChange = true;
                            for(var m = 0;m<v.Passengers.length;m++)v.Passengers[m].IsChange = true;
                            if(v.OrderID.indexOf(".")>0){
                                this.state.changeTrip.splice(this.state.changeTrip.length,0,traInfo);
                                this.state.changeSegments.splice(this.state.changeSegments.length,0,v.EurailP2P.Segments);
                                this.state.changePasInfo.splice(this.state.changePasInfo.length,0,v.Passengers);
                                for(var p1 of this.state.changePassengersData){
                                    for(var p2 of v.Passengers){
                                        if(p1.ID == p2.ID){
                                            p1.IsChange = true;
                                            p1.OrderID = v.OrderID;
                                            p2.StatusID = p1.StatusID;
                                        }
                                            
                                    }
                                }
                            }
                            this.state.changeReturnData = ds.cloneWithRows(v.Passengers);
                        }else if(v.StatusID == 18){
                            this.state.changeSuccess = true;
                            for(var m = 0;m<v.Passengers.length;m++)v.Passengers[m].ChangeSuccess = true;
                            if(v.OrderID.indexOf(".")>0){
                                this.state.changeTrip.splice(this.state.changeTrip.length,0,traInfo);
                                this.state.changeSegments.splice(this.state.changeSegments.length,0,v.EurailP2P.Segments);
                                this.state.changePasInfo.splice(this.state.changePasInfo.length,0,v.Passengers);
                                for(var p1 of this.state.changePassengersData){
                                    for(var p2 of v.Passengers){
                                        if(p1.ID == p2.ID){
                                            p1.ChangeSuccess = true;
                                            p1.OrderID = v.OrderID;
                                            p2.StatusID = p1.StatusID;
                                        }
                                    }
                                }
                            }
                            this.state.changeReturnData = ds.cloneWithRows(v.Passengers);
                        }else if(v.StatusID == 19) {
                            this.state.refundCost = true;
                            this.state.refunding = true;
                            for(var m = 0;m<v.Passengers.length;m++){
                                if(v.Passengers[m] == 22)
                                v.Passengers[m].IsReturn = true;
                            }
                            if(v.OrderID.indexOf(".")>0){ 
                                this.state.changeTrip.splice(this.state.changeTrip.length,0,traInfo);
                                this.state.changeSegments.splice(this.state.changeSegments.length,0,v.EurailP2P.Segments);
                                this.state.changePasInfo.splice(this.state.changePasInfo.length,0,v.Passengers);
                                for(var p1 of this.state.changePassengersData){
                                    for(var p2 of v.Passengers){
                                        if(p1.ID == p2.ID){
                                            p1.IsReturn = true;
                                            p1.OrderID = v.OrderID;
                                            p2.StatusID = p1.StatusID;
                                        }
                                    }
                                }
                            }else{
                                for(var p1 of this.state.changePassengersData){
                                    for(var p2 of v.Passengers){
                                        if(p1.ID == p2.ID && p2.StatusID == 32){
                                            p1.IsReturn = true;
                                        }
                                    }
                                }
                            }
                            this.state.changeReturnData = ds.cloneWithRows(v.Passengers);
                        }else if(v.StatusID == 20) {
                            this.state.refundCost = true;
                            this.state.refunding = false;
                            for(var m = 0;m<v.Passengers.length;m++)v.Passengers[m].ReturnSuccess = true;
                            if(v.OrderID.indexOf(".")>0){ 
                                this.state.changeTrip.splice(this.state.changeTrip.length,0,traInfo);
                                this.state.changeSegments.splice(this.state.changeSegments.length,0,v.EurailP2P.Segments);
                                this.state.changePasInfo.splice(this.state.changePasInfo.length,0,v.Passengers);
                                for(var p1 of this.state.changePassengersData){
                                    for(var p2 of v.Passengers){
                                        if(p1.ID == p2.ID){
                                            p1.ReturnSuccess = true;
                                            p1.OrderID = v.OrderID;
                                            p2.StatusID = p1.StatusID;
                                            // p1.MiddleVendorOrderID = v.EurailP2P.MiddleVendorOrderID
                                        }
                                    }
                                }
                            }else{
                                for(var p1 of this.state.changePassengersData){
                                    for(var p2 of v.Passengers){
                                        if(p1.ID == p2.ID && p2.StatusID == 32){
                                            p1.ReturnSuccess = true;
                                        }
                                    }
                                }
                            }
                            this.state.changeReturnData = ds.cloneWithRows(v.Passengers);
                        }else{
                            this.state.Segments = v.EurailP2P.Segments;
                        }
                        if(n<1)
                            this.state.Train_Info.splice(this.state.Train_Info, 0, traInfo);
                        if(v.BusinessTypeID == 2 || v.BusinessTypeID == 3) this.state.isChange = true;
                    } else if (v.OrderType == 8 || v.OrderType == 9) {
                        let allFlightInfo = [];
                        if (!this.state.isAllowClose)
                            this.state.isAllowClose = v.IsAllowClose
                                && orderInfo.Result.Trade.BookerID == this.state.accountNo;
                        for (var i = 0; i < v.Ticket.Segments.length; i++) {
                            if (v.Ticket.Segments.length < 3) {
                                this.state.title = {
                                    leg: i == 0 ? lan.go : lan.comeBack,
                                    date: v.Ticket.Segments[i].Flights[0].DepartureTime, // 格式 2015-10-23T22:50:00 || 2015-10-23 22:50:00
                                    city: v.Ticket.Segments[i].DepartureCity.CityName + "—" + v.Ticket.Segments[i].ArrivalCity.CityName,
                                };
                            } else {
                                this.state.title = {
                                    leg: (i + 1) + "",
                                    date: v.Ticket.Segments[i].Flights[0].DepartureTime, // 格式 2015-10-23T22:50:00 || 2015-10-23 22:50:00
                                    city: v.Ticket.Segments[i].DepartureCity.CityName + "—" + v.Ticket.Segments[i].ArrivalCity.CityName,
                                };
                            }

                            let j = 0;
                            for (var v1 of v.Ticket.Segments[i].Flights) {
                                j++;
                                let turnInfo = false;//记录是否中间有转机
                                if (j > 1) turnInfo = true;
                                let isVisBottom = true;
                                if ((v.Ticket.Segments[i].Flights.length > 1
                                    && j < v.Ticket.Segments[i].Flights.length) || (i < v.Ticket.Segments.length - 1))
                                    isVisBottom = false;
                                // if(v.OrderType == 8)isVisBottom = 
                                let _time = '';
                                if (turnInfo) {
                                    _time = this.getDateDiff(v.Ticket.Segments[i].Flights[j - 2].ArrivalTime,
                                        v.Ticket.Segments[i].Flights[j - 1].DepartureTime, null)
                                }
                                let sInfo = {
                                    "TurnInfo": turnInfo,
                                    "IsVisBottom": isVisBottom,
                                    "IsTurn": turnInfo ? (lan.stops+"  " + _time + "  "+lan.transitArea+"  " + v1.DepartureAirport.AirportName) : "",
                                    "Departure": v1.DepartureAirport.CityCode,
                                    "Arrival": v1.ArrivalAirport.CityCode,
                                    "DepartureInfo": {
                                        "airportCode": v1.DepartureAirport.AirportCode,
                                        "airportNameEn": "",
                                        "airportNameCn": v1.DepartureAirport.AirportName,
                                        "cityCode": v1.DepartureAirport.CityCode,
                                        "cityIataCode": '',
                                        "cityNameEn": "",
                                        "cityNameCn": v1.DepartureAirport.CityName,
                                        "countryCode": v1.DepartureAirport.CountryCode,
                                        "countryNameEn": '',
                                        "countryNameCn": v1.DepartureAirport.CountryName,
                                        "continentCode": "",
                                        "continentNameCn": "",
                                        "timeZone": ""
                                    },
                                    "ArrivalInfo": {
                                        "airportCode": v1.ArrivalAirport.AirportCode,
                                        "airportNameEn": "",
                                        "airportNameCn": v1.ArrivalAirport.AirportName,
                                        "cityCode": v1.ArrivalAirport.CityCode,
                                        "cityIataCode": '',
                                        "cityNameEn": "",
                                        "cityNameCn": v1.ArrivalAirport.CityName,
                                        "countryCode": v1.ArrivalAirport.CountryCode,
                                        "countryNameEn": '',
                                        "countryNameCn": v1.ArrivalAirport.CountryName,
                                        "continentCode": "",
                                        "continentNameCn": "",
                                        "timeZone": ""
                                    },
                                    "DepartureDate": v1.DepartureTime,
                                    "ArrivalDate": v1.ArrivalTime,
                                    "MarketingAirline": v1.MarketingAirline.Code,
                                    "FlightNumber": v1.FlightNumber,
                                    "DepartureTerminal": v1.DepartureAirport.Terminal,
                                    "ArrivalTerminal": v1.ArrivalAirport.Terminal,
                                    "Equipment": v1.Equipment,
                                    "ElapsedTime": parseInt(v1.ElapsedTime / 60) + "h" + (v1.ElapsedTime % 60) + "m",
                                    "Miles": "",//英里
                                    "StopQuantity": "0",
                                }
                                let _Tax = 0; let _Price = 0;
                                if (v.OrderType == 9) {
                                    for (var t of v.Ticket.Expenses) {
                                        _Tax = _Tax + t.Tax
                                        _Price = _Price + t.TicketPrice;
                                    }
                                }
                                let fInfo = {
                                    Rule: v.Ticket.Rule?v.Ticket.Rule:'',
                                    CabinName: this.getCabinClassName(v1.CabinLevel) + v1.Cabin,
                                    DiscountRate: (v.QuotePrices && v.QuotePrices[0].Discount && (v.QuotePrices[0].Discount != 0.0)) ? v.QuotePrices[0].Discount : '10',
                                    Price: v.TotalAmount,
                                    ExtraPrice: v.OrderType == 8 ? lan.includes+":¥" + 
                                        v.Ticket.Expenses[v.Ticket.Expenses.length > i ? i : 0].Tax : 
                                        (lan.ticketPrice+":¥" + _Price + "  "+lan.tax+":¥" + _Tax)
                                }
                                this.state.data = { "title": turnInfo ? "" : this.state.title, "list": [sInfo], "FilInfo": fInfo };
                                allFlightInfo.splice(allFlightInfo.length, 0, this.state.data);
                            }
                        }
                        this.state.Plane_Info.splice(this.state.Plane_Info.length, 0, allFlightInfo);
                        this.state.passengersData = ds.cloneWithRows(v.Passengers);
                    } else if (v.OrderType == 4) {
                        let insureInfo = {
                            "ProductCode": v.Insure.ProductCode,
                            "Intro": v.Intro,
                            "EffectiveStart": v.Insure.EffectiveStart.substring(0, 11).replace("-", ".").replace("-", "."),
                            "EffectiveEnd": v.Insure.EffectiveEnd.substring(0, 11).replace("-", ".").replace("-", "."),
                            "TotalAmount": v.TotalAmount,
                        }
                        this.state.Insure_Info.splice(this.state.Insure_Info.length, 0, insureInfo);
                    } else if (v.OrderType == 5) {
                        let visaInfo = {
                            "Intro": v.Intro,
                            "StopMaxDay": v.Visa.StopMaxDay,
                            "ValidDay": v.Visa.ValidDay,
                            "TotalAmount": v.TotalAmount,
                        }
                        this.state.Visa_Info.splice(this.state.Visa_Info.length, 0, visaInfo);
                    }
                    n++;
                }
                this.state.passengersData = ds.cloneWithRows(this.state.changePassengersData);
                if (this.state.Plane_Info.length > 0) this.state.AllPlaneInfo = ds.cloneWithRows(this.state.Plane_Info);
                if (this.state.Train_Info.length > 0) this.state.AllTrainInfo = ds.cloneWithRows(
                    (this.state.isChange || this.state.changeSuccess) ? [this.state.Train_Info[0]] : this.state.Train_Info);
                if (this.state.Hotel_Info.length > 0) this.state.AllHotelInfo = ds.cloneWithRows(this.state.Hotel_Info);
                if (this.state.Insure_Info.length > 0) this.state.AllInsureInfo = ds.cloneWithRows(this.state.Insure_Info);
                if (this.state.Visa_Info.length > 0) this.state.AllVisaInfo = ds.cloneWithRows(this.state.Visa_Info);
                
                if (this.state.callNr == 2) this.setState({});
                // if(this.props.ticketType) this.planeTicketTrip(this.props.ticketType)
            } else {
                Toast.info(value.Msg, 3, null, false);
            }
        }, (err) => {
            this.state.callNr++;
            Toast.info(err, 3, null, false);
        })
    }

    //获取IMNr
    getIMNr = (code) =>{
        let param = {
            "UserCode": code,
            "UserName": null,
            "Password": null,
            "Platform": "MobileDevice",
            "Source": "差旅宝"
        }
        ServingClient.invoke("IM.GetToken",param,(value) => {
            if(value.IsSuccess){
                this.state.ServiceStaffInfo.IMNr = value.User.IMNr;
            }
        });
    }

    //订单信息头部布局
    getOrderTitleView = () => {
        return (
            <View style={{ backgroundColor: '#fff', padding: 10 }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ color: '#999', fontSize: 15, textAlign: 'left', flex: 0.2 }}>{lan.bookerName + ":"}</Text>
                    <View style={{ flexDirection: 'row', flex: 0.4, alignItems: 'center' }}>
                        <Text style={{ color: '#333', fontSize: 15, }}>{this.state.orderTitleInfo.BookerName}</Text>
                        {this.state.orderTitleInfo.ContrReason == null || this.state.orderTitleInfo.ContrReason == ""
                            ? null :
                            <TouchableOpacity onPress={() => this.getPolicyContent()}>
                                <Icon icon={'0xe67a'} color={COLORS.link} style={{ fontSize: 15, marginLeft: 3 }} />
                            </TouchableOpacity>
                        }
                    </View>
                    <Text style={{ color: COLORS.btnBg, fontSize: 15, flex: 0.3 }}>{this.state.orderTitleInfo.StatusName}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Text style={{ color: '#999', fontSize: 15, textAlign: 'left', flex: 0.2 }}>{lan.orderNum + ":"}</Text>
                    <Text style={{ color: '#333', fontSize: 15, flex: 0.4 }}>{this.state.orderTitleInfo.OrderID}</Text>
                    <Text style={{ color: '#333', fontSize: 15, flex: 0.3 }}>{this.state.orderTitleInfo.DepartureDate}</Text>
                </View>
                {this.state.isPublic ?
                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Text style={{ color: '#999', fontSize: 15, textAlign: 'left', flex: 0.2 }}>{lan.payWay + ":"}</Text>
                    <Text style={{ color: '#333', fontSize: 15, flex: 0.4 }}>{this.state.orderTitleInfo.PaymentMethodID}</Text>
                    <Text style={{ color: '#333', fontSize: 15, flex: 0.3 }}>{this.state.orderTitleInfo.CostCenterInfo}</Text>
                </View>
                :null}
                
                {this.state.isPublic ?
                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Text style={{ color: '#999', fontSize: 15, textAlign: 'left', flex: 0.2 }}>{lan.travelPurpose + ":"}</Text>
                    <Text style={{ color: '#333', fontSize: 15, flex: 0.7 }}>{this.state.orderTitleInfo.TravelPurpose}</Text>
                </View>
                :null}
                
                {(this.state.orderTitleInfo.ContrReason != null || this.state.orderTitleInfo.ContrReason != "") 
                    && this.state.isPublic ? 
                    <View style={{ flexDirection: 'row', marginTop: 5 }}>
                        <Text style={{ color: '#999', fontSize: 15, textAlign: 'left', flex: 0.2 }}>{lan.contrReason + ":"}</Text>
                        <Text style={{ color: '#333', fontSize: 15, flex: 0.7 }}>{this.state.orderTitleInfo.ContrReason}</Text>
                    </View>
                : null 
                }
                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Text style={{ color: '#999', fontSize: 15, textAlign: 'left', flex: 0.2 }}>{lan.totalAmount + ":"}</Text>
                    <Text style={{ color: '#333', fontSize: 15, flex: 0.7 }}>{'¥' + this.state.orderTitleInfo.TotalAmount}</Text>
                </View>
            </View>
        );
    }

    //获得每一程机票的信息
    setPlaneAllInfo = (value) => {
        let planeData = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        planeData = planeData.cloneWithRows(value);
        return (
            <ListView
                enableEmptySections={true}
                dataSource={planeData}
                renderRow={(rowData, sectionId, rowId) => this.getPlaneView(rowData)}
            />
        )
    }

    //获得每一段火车票的信息
    setTrainAllInfo = (value,changeColor,isBottom) => {
        let trainData = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        trainData = trainData.cloneWithRows(value);
        return (
            <ListView
                enableEmptySections={true}
                dataSource={trainData}
                renderRow={(rowData, sectionId, rowId) => this.getTrainView(rowData,changeColor,isBottom)}
            />
        )
    }

    //飞机票界面样式
    getPlaneView = (value) => {
        let fiData = value.FilInfo;
        let fvData = { "title": value.title, "list": value.list }
        return (
            <View >
                {fvData.list[0].TurnInfo ?
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        <View style={{
                            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderStyle: 'dotted', paddingTop: 3, paddingBottom: 3, paddingLeft: 8, paddingRight: 8,
                            marginTop: 2, marginBottom: 2, borderWidth: 2 / FLEXBOX.pixel, borderColor: '#ccc', borderRadius: 20,
                        }}>
                            <Text style={{
                                fontSize: 12, color: '#666',
                            }}>{fvData.list[0].IsTurn}</Text>
                        </View>
                    </View>
                    : null}

                {fvData.title != "" && (fvData.title.leg != lan.go && fvData.title.leg != "1") ?
                    <View style={{ paddingTop: 10, paddingBottom: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ height: 1 / FLEXBOX.pixel, width: width, backgroundColor: '#ebebeb' }} />
                    </View>
                    : null}

                <FlightView data={fvData} />

                {fvData.list[0].IsVisBottom ?
                    <FlightInfo data={fiData} endorseText={fiData.Rule.replace(new RegExp("<br />", "gm"), '\n')} />
                    : null}
            </View>
        )
    }

    //火车票界面样式
    getTrainView = (value,changeColor,isBottom) => {
        let _info = {
            type:3,
            Rule: '',//value.EI?value.EI:'',
            CabinName: '',
            DiscountRate: '',
            Price: value.TotalAmount,
            ExtraPrice: value.CabinLevel + '¥' + value.TicketPrice + "x" + value.PassengerQty,
            DepartureTime:this.state.orderTitleInfo.DepartureDate+" "+value.DepartureTime,
            type:3,
            changeColor:changeColor,
            isBottom:isBottom,
        }
        return (
            <View style={[styles.card, styles.train]}>
                {/*body*/}
                {/* <View style={{backgroundColor:'#fff0da'}}>
                <Marquee
                    bgColor={{ backgroundColor: '#fff0da'}}
                    textStyle={{color:'#fc9027'}}
                    data={lan.change_changeFail}
                    alert
                /></View> */}
                <Flex justify={'between'} style={styles.cardBody}>
                    {/*左栏*/}
                    <View style={{ flex: .7 }}>
                        <Flex>
                            <Text style={[styles.trainTime,{color:changeColor?'#333':'#ccc'}]}>{value.DepartureTime}</Text>
                            <Text style={[styles.trainName,{color:changeColor?'#333':'#ccc'}]}>{value.DepartureCity}</Text>
                        </Flex>
                        <Flex>
                            <Text style={[styles.trainTime,{color:changeColor?'#333':'#ccc'}]}>{value.ArrivalTime}
                                <Text style={styles.trainIsday}>{value.dayNum > 0 ? ('+' + value.dayNum) : ''}</Text></Text>
                            <Text style={[styles.trainName,{color:changeColor?'#333':'#ccc'}]}>{value.ArrivalCity}</Text>
                        </Flex>
                    </View>
                    {/*右栏*/}
                    <View style={{ flex: .3 }}>
                        <Text style={[styles.trainNumber,{color:changeColor?'#999':'#ccc'}]}>
                            {value.TrainNumber}
                        </Text>
                        <Flex>
                            <Icon icon={'0xe670'} style={[styles.iconTime,{color:changeColor?'#999':'#ccc'}]} />
                            <Text style={[styles.trainTotalTime,{color:changeColor?'#999':'#ccc'}]}>{value.TotalElapsedTime}</Text>
                        </Flex>
                    </View>
                </Flex>
                {/*底部*/}
                <Flex justify={'between'} style={styles.cardFooter}>
                    <FlightInfo data={_info} //navigator={this.props.navigator}
                                endorseText={_info.Rule.replace(new RegExp("<br />", "gm"), '\n')} />
                </Flex>
            </View>
        );
    }

    //酒店界面样式
    getHotelView = (value) => {
        let _info = {
            Rule: value.EI,
            CabinName: '',
            DiscountRate: '',
            Price: value.TotalAmount,
            ExtraPrice: value.RoomPrice,
            type:2,
        }
        return (
            <View style={[styles.card, styles.hotel]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderText}>{lan.hotelInfo}</Text>
                </View>
                <View justify={'between'} style={styles.cardBody}>
                    <Flex >
                        {/*左栏*/}
                        <View style={{ flex: .7 }}>
                            <View>
                                <Text style={styles.hotelName} numberOfLines={1}>{value.HotelName}</Text>
                            </View>
                            <Flex >
                                <Text style={[styles.hotelInfo, { marginRight: 40 }]}>{value.RoomTypeName}</Text>
                                <Text style={styles.hotelInfo}>{value.BreakfastName}</Text>
                            </Flex>
                            <Flex align={'center'} style={{ marginTop: 3 }}>
                                <Icon icon={'0xe691'} style={styles.iconSpace} />
                                <Text style={styles.hotelAdress}>{value.HotelAddress}</Text>
                            </Flex>
                        </View>
                        {/*右栏*/}
                        <View style={{ flex: .2 }}>
                            <View style={{ flex: 1 }}>
                                {this.state.isPublic ?
                                <TouchableOpacity activeOpacity={.8} onPress={() => {
                                    Modal.alert(lan.breachTravelPolicy,
                                        value.IsContrPolicy ? value.ContrContent : "",
                                        [{ text: lan.ok, onPress: () => { } },
                                        ]);
                                }}>
                                    <Text style={styles.hotelPolicy}>{lan.breachTravelPolicy}</Text>
                                </TouchableOpacity> 
                                :null}
                            </View>

                        </View>
                    </Flex>


                </View>
                {/*底部*/}
                <Flex justify={'between'} style={styles.cardFooter}>
                    <FlightInfo data={_info} endorseText={_info.Rule.replace(new RegExp("<br />", "gm"), '\n')} />
                </Flex>
            </View>
        );
    }

    //机票类型乘客信息界面布局
    setPlanePassengView = (value) => {
        return (
            <View>
                <View style={{ paddingLeft: 15, paddingRight: 15, paddingTop: 10, paddingBottom: 10, backgroundColor: '#fff' }}>
                    <Text style={{ color: '#333', fontSize: 16 }}>{value.Name}</Text>
                    <Text style={{ color: '#999', fontSize: 14, marginTop: 3 }}>
                        {this.getProofName(value.CertType) + ":" + value.CertNr}</Text>
                </View>
                <View style={{ backgroundColor: '#ebebeb', height: 0.8 }} />
            </View>
        );
    }

    //火车票类型乘客信息界面布局(CHD-小孩，ADT-成人)
    setTrainPassengView = (value, i,isRemind,seg,ind) => {
        let tInfo = seg[0];
        let seatArr = tInfo.Trains[0].Seat.split(",")?tInfo.Trains[0].Seat.split(","):[tInfo.Trains[0].Seat];
        let typeName = value.Type == 'ADT' ? lan.adult : value.Type == 'CHD' ? lan.child : lan.children;

        let item = value
        item.typeName = typeName+"票";
        item.CabinLevel = tInfo.Trains[0].CabinLevel;
        if(ind == 1)
            this.store.addListItem(item);
        let isShow = true;
        if(ind == 1)
        for(var n of this.state.changePasInfo){
            for(var m of n){
                if(value.CertNr == m.CertNr) isShow = false;
                break;
            }
        }
        return (
            <View>
            <View style={{ backgroundColor: '#fff' ,flexDirection: 'row',alignItems:'center'}}>
                <View style={{ paddingLeft: 15, paddingRight: 15, paddingTop: 10, paddingBottom: 10, 
                                flex:1}}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ color: isRemind ? '#333' : '#ccc', fontSize: 16 }}>{value.Name}</Text>
                        <Text style={{ color: isRemind ? '#333' : '#ccc', fontSize: 16, marginLeft: 30, marginRight: 30 }}>{typeName}</Text>
                        <Text style={{ color: isRemind ? '#333' : '#ccc', fontSize: 16 }}>{tInfo.Trains[0].CabinLevel}</Text>
                    </View>
                    <Text style={{ color: isRemind ? '#999' : '#ccc', fontSize: 14, marginTop: 3 }}>
                        {this.getProofName(value.CertType) + ":" + value.CertNr}</Text>
                    {tInfo.Trains[0].CabinCode ?
                        <Text style={{ color: isRemind ? '#999' : '#ccc', fontSize: 14, marginTop: 3 }}>
                            {tInfo.Trains[0].CabinCode + "   " + seatArr[i]}</Text> : null}
                </View>
                {(!value.IsReturn && !value.ReturnSuccess && isRemind)? 
                <Text style={{color:COLORS.correctColor,textAlign:'center',backgroundColor:'#fff',
                            paddingRight:15,fontSize:15}}>{value.StatusID == 32?lan.change_refund:this.state.changeSuccess?
                            lan.change_changeSuccess:this.state.isChange?lan.change_changeing:''}</Text>
                : null}
                {(value.IsReturn || value.ReturnSuccess)&&isShow&&value.StatusID != 22 ? 
                <Text style={{color:COLORS.correctColor,textAlign:'center',backgroundColor:'#fff',
                            paddingRight:15,fontSize:15}}>
                            {value.StatusID == 32?lan.change_refund:lan.change_refunding}</Text>
                : null}
            </View>
                
                {/* <View style={{ backgroundColor: '#ebebeb', height: 0.8 }} /> */}
            </View>
        );
    }

    //酒店类型乘客信息界面布局
    setHotelPassengView = (value, passengersInfo) => {
        let pInfo = '';
        for (var v of passengersInfo) {
            pInfo = v.Name + "、";
        }
        if (pInfo.length > 0) {
            pInfo = pInfo.substring(0, pInfo.length - 1);
        }
        let sd = this.DateDiff(value.CheckInDate, value.CheckOutDate);
        return (
            <View >
                {this.getHotelView(value)}
                <Text style={{ color: '#999', fontSize: 14, marginLeft: 15, marginBottom: 3, marginTop: 8 }}>{lan.passengInfo}</Text>
                <View style={{ paddingLeft: 10, paddingRight: 15, paddingTop: 10, paddingBottom: 10, backgroundColor: '#fff' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ color: '#999', fontSize: 15, flex: 0.3, textAlign: 'left' }}>{lan.checkIn}</Text>
                        <Text style={{ color: '#333', fontSize: 15, flex: .7 }}>{value.CheckInDate.replace("-", ".").replace("-", ".")
                            + "-" + value.CheckOutDate.replace("-", ".").replace("-", ".")}
                            <Text style={{ color: '#999', fontSize: 15, textAlign: 'left' }}>{'(' + sd + ''+lan.night+')'}</Text>
                        </Text>

                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ color: '#999', fontSize: 15, flex: 0.3, textAlign: 'left' }}>{lan.passenger}</Text>
                        <Text style={{ color: '#333', fontSize: 15, flex: .7 }}>{pInfo}
                            <Text style={{ color: '#999', fontSize: 15, textAlign: 'left' }}>{'(' + passengersInfo.length + '人)'}</Text>
                        </Text>

                    </View>
                    <View style={{ flexDirection: 'row', }}>
                        <Text style={{ color: '#999', fontSize: 15, flex: 0.3, textAlign: 'left' }}>{lan.roomNum}</Text>
                        <Text style={{ color: '#333', fontSize: 15, flex: .7 }}>{value.Rooms + lan.jian}</Text>
                    </View>
                </View>
            </View>
        );
    }

    //保险及签证的模块布局
    setInsureOrVisaView = (t, info) => {
        let ins = "";
        if (t == 4)
            ins = info.EffectiveStart + " - " + info.EffectiveEnd
        else ins = lan.stayDays+"：" + info.StopMaxDay
        return (
            <View style={{ backgroundColor: '#fff', padding: 15 }}>
                <Text style={{ color: '#333', fontSize: 16 }}>{info.Intro}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ color: '#999', fontSize: 14, marginTop: 3, flex: 1 }}>{ins}</Text>
                    {t == 5 ?
                        <Text style={{ color: '#999', fontSize: 14, marginTop: 3, flex: 1 }}>{lan.expiryDate+"：" + info.ValidDay}</Text>
                        : null}
                </View>
                <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'flex-end' }}>
                    {t == 4 ?
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => this.insureExplain(info.ProductCode)}>
                            <Text style={{ color: COLORS.link, fontSize: 14 }}>{lan.insInstructions}</Text>
                        </TouchableOpacity>
                        :
                        <View style={{ flex: 1, }} />}
                    <Text style={{ color: '#999', fontSize: 14 }}></Text>
                    <Text style={{ color: COLORS.btnBg, fontSize: 15, }}>¥</Text>
                    <Text style={{ color: COLORS.btnBg, fontSize: 17 }}>{info.TotalAmount}</Text>
                </View>
            </View>
        )
    }

    //根据证件的类型ID获取证件的名字
    getProofName = (type) => {
        for (var v of proofType) {
            if (v.TypeCode == type)
                return v.Name;
        }
        return lan.other;
    }

    //计算天数差的函数，通用  
    DateDiff = (startDate, endDate) => {    //sDate1和sDate2是2006-12-18格式  
        var startTime = new Date(Date.parse(startDate.replace(/-/g, "/"))).getTime();
        var endTime = new Date(Date.parse(endDate.replace(/-/g, "/"))).getTime();
        var dates = Math.abs((startTime - endTime)) / (1000 * 60 * 60 * 24);
        return dates;
    }

    //差旅政策违背原因
    getPolicyContent = () => {
        Alert.alert(
            lan.breachTravelPolicy,
            this.state.orderTitleInfo.ContrContent,
            [
                { text: lan.ok, onPress: () => { } },
            ]
        )
    }

    //保险说明
    insureExplain = (code) => {
        let param = {
            "ProductCode": code
        }
        Toast.loading(lan.loading, 60, () => {
            Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("INS.ProductQuery", JSON.stringify(param), (test) => {
            Toast.hide();
            if (test.Code == 0) {
                Alert.alert(
                    lan.insInstructions,
                    test.Result.Products[0].ProductDescribe == "" || test.Result.Products[0].ProductDescribe == null ?
                        '保险名称：华泰财产保险“安翔无忧”的交通工具意外伤害保险\n 适用于乘坐国内航班的旅客\n' +
                        '保险费：20元/份\n份数：不超过3份\n保险有效期：乘机日起7天内有效\n保额：40万\n' +
                        '年龄：凡零周岁（出生满 6个月）-70周岁\n' +
                        '乘机日之前可退//保险公司将委托一起飞在各地有资质的服务商为有需要的客户提供发票，保险定额发票仅作报销凭证，不是保单凭证'
                        + '\n数据电文是合法的合同表现形式，电子保单和纸质保单具有同等法律效力，请妥善保存，电子保单可凭保单号或身份证号登陆华泰保险网站http://www.ehuatai.com验真和打印'
                        + '\n产品详细条款可致电华泰财产保险股份有限公司热线4006095509进行咨询。<br />备注：根据中国保监会《关于父母为其未成年子女投保以死亡为给付保险金条件人身保险有关问题的通知》（保监发 [2010]95 号）文件的规定，自2011年4月1日起，父母为其未成年子女（未满 18 周岁）投保人身保险，在被保险人成年之前，各保险合同约定的被保险人死亡给付的保险金额总和、被保险人死亡时各保险公司实际支付的保险金总和均不得超过人民币 10 万元'
                        : test.Result.Products[0].ProductDescribe,
                    [
                        { text: lan.ok, onPress: () => { } },
                    ]
                )
            } else {
                Toast.info(test.Msg, 3, null, false);
            }
        }, (err) => {
            Toast.info(err, 5, null, false);
        });
    }

    //取消订单
    cancelOrder = () => {
        Alert.alert(
            lan.remind,
            lan.isCancelApplication,
            [
                {text: lan.ok, onPress: () => {
                    let param = {
                        "SOShortNr": this.state.orderId,
                        "OperatorUserCode": this.props.BookerID
                    }
                    Toast.loading(lan.cancelOrder, 60, () => {
                        Toast.info(lan.timeOut, 3, null, false);
                    });
                    RestAPI.invoke("ABIS.SalesOrderCancel", JSON.stringify(param), (value) => {
                        if (value.Code == 0) {
                            Toast.info(lan.orderNum+":" + this.state.orderId + lan.canceled, 3, null, false);
                            this.state.isAllowClose = false;
                            this.props.RefreshEvent();
                            this.setState({});
                        } else {
                            Toast.info(value.Msg, 3, null, false);
                        }
                    }, (err) => {
                        Toast.info(err, 3, null, false);
                    })
                }},
                {text: lan.cancel, onPress: () => {}},
            ]
          )
        
    }

    //马上支付
    toPayOrder = (orderId, totalAmount) => {
        this.props.navigator.push({
            component: PayWebview,
            passProps: {
                OrderID: orderId,
                LoginAccount: this.props.LoginAccount,
                AccountNo: this.props.AccountNo,
                PayMoney: totalAmount
            },
        })
    }

    //同意审批
    agreeApprovalEvent = () => {
        let param = {
            "SOID": this.state.InnerID,
            "IsPass": true,
            "UserCode": this.state.accountNo,
        }
        Toast.loading(lan.approving, 60, () => {
            Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("Biz3.PSOCustomerActuallyApprovalAdd", JSON.stringify(param), (value) => {
            Toast.hide();
            if (value.Code == 0 && value.Result.Flag == 0) {
                this.state.isAgree = true;
                this.state.isAro = false;
                if (value.Result.CustomerDocStatusID == 2)
                    this.state.orderTitleInfo.StatusName = lan.waitApproval;
                else this.state.orderTitleInfo.StatusName = lan.agreeApproval;
                this.props.RefreshEvent(lan.agreeApproval);
                this.setState({});
                Toast.info("审批同意成功!", 3, null, false);
            } else {
                Toast.info(value.Msg, 3, null, false);
            }
        }, (err) => {
            Toast.info(err, 3, null, false);
        })
    }

    //拒绝审批
    refuseApprovalEvent = () => {
        let param = {
            "SOID": this.state.InnerID,
            "IsPass": false,
            "UserCode": this.state.accountNo,
        }
        Toast.loading(lan.approving, 60, () => {
            Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("Biz3.PSOCustomerActuallyApprovalAdd", JSON.stringify(param), (value) => {
            Toast.hide();
            if (value.Code == 0 && value.Result.Flag == 0) {
                this.state.isRefuse = true;
                this.state.isAro = false;
                if (value.Result.CustomerDocStatusID == 2) {
                    this.state.orderTitleInfo.StatusName = lan.waitApproval;
                } else { this.state.orderTitleInfo.StatusName = lan.refuseApproval; }
                this.props.RefreshEvent(lan.refuseApproval);
                this.setState({});
                Toast.info("审批已拒绝!", 3, null, false);
            } else {
                Toast.info(value.Msg, 3, null, false);
            }
        }, (err) => {
            Toast.info(err, 3, null, false);
        });
    }

    //订单审批状态
    getApprovalStateView = (value) => {
        let rt = {};
        let userRoles = Enumerable.from(value).groupBy(o => o.SeqNr).toArray();
        return (
            <View style={styles.approvalstate}>
                {/*发起申请，主要是图标和提醒状态不一样 start*/}
                <Flex justify='between' align='start' style={[styles.approvalstate_item, { marginTop: 20 }]}>
                    <View style={{ position: 'absolute', top: 0, left: 12, zIndex: 2, marginTop: 0, paddingBottom: 5, backgroundColor: COLORS.containerBg }}>
                        {/*发起申请图标*/}
                        <Icon icon={'0xe676'} style={[styles.approvalstate_icon, { color: COLORS.correctColor }]} />
                    </View>
                    <View style={styles.approvalstate_right}>
                        <View style={styles.approvalstate_rightinner}>
                            <Flex justify='start' align='start' style={styles.approvalstate_rightbox}>
                                <View style={[styles.optview_circle, { backgroundColor: this.getRandomColor(), }]}>
                                    <Text style={styles.optview_txt} numberOfLines={1} ellipsizeMode='tail'>{this.state.orderTitleInfo.BookerName}</Text>
                                </View>
                                <View style={styles.approver_box}>
                                    <Text style={styles.approver}>{this.state.orderTitleInfo.BookerName}</Text>
                                    {/*发起申请*/}
                                    <Text style={styles.applicate_state}>{lan.initiateApproval}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end', paddingTop: 6 }}>
                                    <Text style={styles.time}>{moment(this.state.orderTitleInfo.CreateTime).format("YYYY.MM.DD  HH:mm")}</Text>
                                </View>
                            </Flex>
                        </View></View>

                </Flex>
                {/*发起申请 end*/}

                {/*审批通过 start*/}
                {userRoles.map((role, i) => {
                    role = role.getSource();
                    if (i == 0) {
                        if (role[0].OperationDate)
                            role[0].TimeLength = this.getTimeLength(this.state.orderTitleInfo.CreateTime, role[0].OperationDate)
                        else if (role[0].StatusID == 12)
                            role[0].TimeLength = this.getTimeLength(this.state.orderTitleInfo.CreateTime, moment().format())
                    } else {
                        if (role[0].OperationDate)
                            role[0].TimeLength = this.getTimeLength(rt[0].OperationDate, role[0].OperationDate)
                        else if (role[0].StatusID == 12)
                            role[0].TimeLength = this.getTimeLength(rt[0].OperationDate, moment().format())
                    }
                    rt = role;
                    return (
                        <Flex justify='between' align='start' style={styles.approvalstate_item} key={i}>
                            <View style={styles.approvalstate_left}>
                                {/*审批通过图标*/}
                                {role.every(o => o.IsPass && o.IsPass != null) ?
                                    <Icon icon={'0xe676'} style={[styles.approvalstate_icon, { color: COLORS.correctColor }]} /> : null}
                                {role.every(o => !o.IsPass && o.IsPass != null) ?
                                    <Icon icon={'0xe698'} style={[styles.approvalstate_icon, { color: COLORS.errorColor, }]} /> : null}
                                {role.some(o => o.IsPass == null) ?
                                    <Icon icon={'0xe69b'} style={[styles.approvalstate_icon, { color: '#ccc', }]} /> : null}
                            </View>
                            <View style={[styles.approvalstate_right]}>
                                <View style={styles.approvalstate_rightinner}>
                                    {role.map((o, i) =>
                                        <Flex justify='start' align='start' style={styles.approvalstate_rightbox} key={i}>
                                            <View style={[styles.optview_circle, { backgroundColor: this.getRandomColor(), }]}>
                                                <Text style={styles.optview_txt} numberOfLines={1} ellipsizeMode='tail'>{o.ApproveUserName}</Text>
                                            </View>
                                            <View style={styles.approver_box}>
                                                <Text style={styles.approver}>{o.ApproveUserName}</Text>
                                                {/*审批通过*/}
                                                {o.IsPass || o.StatusID == 12 ?
                                                    <Text style={styles.approvalstate_passtxt}>{o.StatusName}</Text>
                                                    : !o.IsPass && o.IsPass != null ?
                                                        <Text style={styles.approvalstate_nopasstxt}>{lan.refuseApproval}</Text> : null}

                                            </View>
                                            <View style={{ alignItems: 'flex-end', paddingTop: 6, }}>
                                                {o.StatusID == 12 && this.state.orderTitleInfo.BookerID == this.state.accountNo?//this.state.accountNo != o.ApproveUserCode ?
                                                    <View style={{
                                                        borderRadius: 4, borderWidth: 1 / FLEXBOX.pixel, borderColor: COLORS.btnBg,
                                                        alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <TouchableOpacity style={{ padding: 5, }} onPress={() => this.callPhoneToRole(o.ApproveUserPhone)}>
                                                            <Text style={{ fontSize: 12, color: COLORS.btnBg }}>{lan.hurryUp}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    :
                                                    <Text style={styles.time}>{o.OperationDate && moment(o.OperationDate).format("YYYY.MM.DD  HH:mm")}</Text>
                                                }

                                                {i == 0 && (o.OperationDate || o.StatusID == 12) ?
                                                    <Text style={[styles.time, { marginTop: 3 }]}>{lan.times+":" + o.TimeLength}</Text>
                                                    : null
                                                }
                                            </View>
                                        </Flex>)}
                                </View></View>
                        </Flex>)
                })}
            </View>
        );
    }

    // 随机获取颜色
    getRandomColor() {
        const ColorNum = ['#5ec9f7', '#3bc2b5', '#9a89b9', '#5c6bc0', '#ff943e', '#f75e5e',]
        var index = Math.floor(Math.random() * ColorNum.length);
        return ColorNum[index];
    }

    //拨打审批人电话
    callPhoneToRole = (tel) => {
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

    //舱位编码转舱位名称
    getCabinClassName = (type) => {
        if (type == 'Y') return lan.economyClass;
        else if (type == 'C') return lan.businessClass;
        else if (type == 'F') return lan.firstClass;
        else return lan.highEeconomyClass;
    }

    //时间间隔计算(间隔天（+1）数或小时数（3h8m）,为0不输出)
    getDateDiff = (startDate, endDate, output = 'day') => {
        //判断 时间格式
        startDate = output == 'day' ? moment(moment(startDate).format('YYYY-MM-DD')).format('X') : moment(moment(startDate).format('YYYY-MM-DD HH:mm')).format('X');
        endDate = output == 'day' ? moment(moment(endDate).format('YYYY-MM-DD')).format('X') : moment(moment(endDate).format('YYYY-MM-DD HH:mm')).format('X');
        let millisec = Math.abs((startDate - endDate))
        let dd = millisec / 60 / 60 / 24; // 天数
        let mm = millisec / 60 % 60; // 分
        let hh = parseInt(millisec / 60 / 60); //小时

        return output ? dd >= 1 ? '+' + dd : null : `${hh}h${mm}m`;
    }

    getTimeLength = (startDate, endDate) => {
        startDate = moment(moment(startDate).format('YYYY-MM-DD HH:mm')).format('X');
        endDate = moment(moment(endDate).format('YYYY-MM-DD HH:mm')).format('X');
        let millisec = Math.abs((startDate - endDate));
        let dd = parseInt(millisec / 60 / 60 / 24); // 天数
        let mm = millisec / 60 % 60; // 分
        let hh = parseInt(millisec / 60 / 60 % 24); //小时
        return dd >= 1 ? (dd + lan.day + (hh >= 1 ? hh + lan.hour : "") + (mm >= 1 ? mm + lan.minute : "")) :
            hh >= 1 ? (hh + lan.hour + (mm >= 1 ? mm + lan.minute : "")) :mm>0? mm + lan.minute:mm;
    }

    //火车票跳转退改签界面
    toSelectChangeTicket = (t) =>{
        this.store.changeOrReturn = t;
        this.props.navigator.push({
            name: 'Change',
            component: Change,
        });
    }

    //机票跳转退改签
    toPlaneChangeTicket = (info,t,departureTime,amount,index,d) =>{
        if((moment(moment(departureTime).format('YYYY-MM-DD HH:mm')).format('X')-
        moment(moment(moment().format()).format('YYYY-MM-DD HH:mm')).format('X'))/ 60 >5){
            this.flightStore.departureTime = departureTime;
            this.flightStore.Amount = amount;
            this.flightStore.list = [];
            this.flightStore.count = 0;
            this.flightStore.isResult = false;
            this.flightStore.LEG = d == 1 ? index : index+this.state.goPassengerInfo.length-1;
            for(var i of info){
                this.flightStore.addListItem(i);
            }
            Popup.hide();
            this.state.callNr = 3;
            this.flightStore.changeOrReturn = t;
            this.props.navigator.push({
                name: 'FlightChange',
                component: FlightChange,
            });
        }else{
            Alert.alert(lan.remind,"即将起飞或者已起飞航班退改签需联系营业员进行人工退改签操作！",
            [
                {text: lan.ok, onPress: () => {}},
            ])
        }
    }

    //国内机票选择退改签的行程操作界面,1 为改签\2 为退票
    planeTicketTrip = (type) =>{
        let ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        Popup.show(
            <View>
                <View style={{backgroundColor:COLORS.primary,height:44,alignItems:'center',flexDirection:'row'}}>
                    <Text style={{flex:1,textAlign:'center',color:'#fff',fontSize:17}}>
                        {type == 1 ? lan.selectChangeTrip : lan.selectReturnTrip}</Text>
                </View>
                {this.state.goPassengerInfo.length>0 ?
                <View>
                    <Text style={{backgroundColor:'#ebebeb',padding:5,fontSize:12,color:'#999',width:width}}>去程</Text>
                    <ListView
                        enableEmptySections = {true}
                        dataSource={ds.cloneWithRows(this.state.goPassengerInfo)}
                        renderRow={(rowData,sectionID,rowID)=>this.tripView(rowData,rowID,this.state.goPassengerInfo.length,type,1)}
                    />
                </View>
                : null}

                {this.state.backPassengerInfo.length>0 ?
                <View>
                    <Text style={{backgroundColor:'#ebebeb',padding:5,fontSize:12,color:'#999',width:width}}>回程</Text>
                    <ListView
                        enableEmptySections = {true}
                        dataSource={ds.cloneWithRows(this.state.backPassengerInfo)}
                        renderRow={(rowData,sectionID,rowID)=>this.tripView(rowData,rowID,this.state.backPassengerInfo.length,type,2)}
                    />
                </View>
                : null}
                 
                <TouchableOpacity style={{justifyContent:'center',alignItems:'center',height:44}} 
                    onPress={() => Popup.hide()}>
                    <Text style={{color:COLORS.btnBg,fontSize:16}}>{lan.cancel}</Text>
                </TouchableOpacity>
            </View>,
        { animationType: 'slide-up', maskClosable: false });
    }

    //航段行程样式
    tripView = (info,index,c,type,d) =>{
        // alert(info.Departure+"\n"+info.DepartureTime);
        return(
            <TouchableOpacity style={{flexDirection:'row',alignItems:'center',padding:15,
            borderBottomColor:'#ebebeb',borderBottomWidth:1}} onPress={()=>this.toPlaneChangeTicket(info,type,info.Time,info.Amount,index,d)} >
                <Text style={{backgroundColor:index == c-1?'#fa5e5b':'#26c281',width:20,height:20,color:'#fff',textAlign:'center'}}>
                    {index == c-1 ? '新' : '旧'}
                </Text>
                <View style={{flex:1,marginLeft:15}}>
                    <Text style={{color:'#333',fontSize:16}}>{info.Departure}</Text>
                    <Text style={{color:'#999',fontSize:14}}>{info.DepartureTime}</Text>
                </View>
                <Icon icon={'0xe677'} color={'#999'} style={{fontSize: 18}} />
            </TouchableOpacity>
        );
    }

    //每个航段乘机人信息数据的处理
    tripPassengerInfo = (info) => {
        for(var i = 0 ; i < info.length ; i++){
            info[i].Passengers.OrderID = info[i].OrderID
            info[i].Passengers.Departure = info[i].Intro;
            // info[i].Passengers.Amount = info[i].TotalAmount/info[i].Passengers.length;
            info[i].Passengers.Amount = info[i].Ticket.Expenses[0].TicketPrice+info[i].Ticket.Expenses[0].Tax;
            info[i].Passengers.DepartureTime = info[i].Ticket.Segments[0] ?
                info[i].Ticket.Segments[0].Flights[0].DepartureTime.replace(/-/g, '.').replace('T',' '):'';
            info[i].Passengers.Time = info[i].Ticket.Segments[0] ?
                info[i].Ticket.Segments[0].Flights[0].DepartureTime:'';
            if(i == 0){
                this.state.goPassengerInfo.push(info[0].Passengers);
            } else if(i>0 && info[i].OrderID.indexOf(info[0].OrderID)>0){
                this.state.goPassengerInfo.push(info[i].Passengers);
            } else this.state.backPassengerInfo.push(info[i].Passengers);
        }
        //去程人员数据
        for(var j = 0; j<this.state.goPassengerInfo.length-1;j++){
            for(var m of this.state.goPassengerInfo[j]){
                for(var n of this.state.goPassengerInfo[j+1]){
                    if(m.CertNr == n.CertNr){
                        m.StatusID = -1;
                        break;
                    }
                }
            }
        }
        let auxiliary = [];
        for(var l of this.state.goPassengerInfo){
            let pCount = 0
            for(var k of l){
                if(k.StatusID != 22) pCount++;
            }
            if(pCount != l.length)
                auxiliary.push(l);
        }
        this.state.goPassengerInfo = auxiliary;

        //回程人员数据
        for(var j = 0; j<this.state.backPassengerInfo.length-1;j++){
            for(var m of this.state.backPassengerInfo[j]){
                for(var n of this.state.backPassengerInfo[j+1]){
                    if(m.CertNr == n.CertNr){
                        m.StatusID = -1;
                        break;
                    }
                }
            }
        }
        auxiliary = [];
        for(var l of this.state.backPassengerInfo){
            let pCount = 0
            for(var k of l){
                if(k.StatusID != 22) pCount++;
            }
            if(pCount != l.length)
                auxiliary.push(l);
        }
        this.state.backPassengerInfo = auxiliary;
    }

}

const styles = StyleSheet.create({

    //审批人流程界面样式
    approvalstate: { marginBottom: 10, },
    approvalstate_item: { paddingLeft: 20, paddingRight: 25, },
    approvalstate_left: { position: 'absolute', top: 0, left: 12, zIndex: 2, paddingTop: 0, paddingBottom: 5, backgroundColor: COLORS.containerBg },
    approvalstate_icon: { fontSize: 16, },
    approvalstate_right: { borderLeftColor: '#ddd', borderLeftWidth: 1, paddingLeft: 20, flex: 1, paddingBottom: 20, },
    approvalstate_rightinner: { backgroundColor: '#fff', paddingLeft: 15, paddingRight: 15, borderRadius: 5, },
    approvalstate_rightbox: { paddingBottom: 15, paddingTop: 15, borderBottomColor: '#ebebeb', borderBottomWidth: 1 / FLEXBOX.pixel },
    optview_circle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 1 / FLEXBOX.pixel, borderColor: '#ccc', },
    optview_txt: { color: '#fff', fontSize: 12, paddingLeft: 5, paddingRight: 5, },
    approver_box: { marginLeft: 10, flex: 1, height: FLEXBOX.width * 0.16, flexDirection: 'column', justifyContent: 'space-between' },
    approver: { fontSize: 14, marginTop: 5, color: COLORS.textBase, },
    applicate_state: { color: COLORS.correctColor, marginBottom: 5, fontSize: 12, },
    approvalstate_passtxt: { color: COLORS.correctColor, marginBottom: 5, fontSize: 12, },
    approvalstate_nopasstxt: { color: COLORS.btnBg, marginBottom: 5, fontSize: 12, },
    time: { fontSize: 12, color: '#999' },
    //-----end-----

    // 列表通用
    cardHeader: {
        paddingTop: 10,
        paddingLeft: 10,
        paddingBottom: 2,
        backgroundColor: COLORS.containerBg,
    },
    cardHeaderText: {
        fontSize: 14,
        color: '#999'
    },
    cardFooterInfo: {
        color: '#999'
    },
    cardFooterLink: {
        color: COLORS.link,
        textDecorationLine: 'underline'
    },

    cardFooter: {
        borderTopColor: '#dcdcdc',
        borderTopWidth: 1 / FLEXBOX.pixel,
        padding: 10,
    },
    cardBody: {
        padding: 10,
    },
    card: {
        backgroundColor: '#fff'
    },
    // 火车票
    train: {
        backgroundColor: '#fff',
        marginBottom: 3,
    },

    trainTime: {
        flex: .35,
        fontSize: 16,
        color:'#333',
    },
    trainName: {
        flex: .65,
        fontSize: 16,
        color: '#333',
    },
    trainNumber: {
        fontSize: 16,
        color: '#999',
        transform: [
            {
                translateX: 12

            }
        ],

    },
    trainTotalTime: {
        fontSize: 14,
        color: '#999'
    },
    iconTime: {
        fontSize: 12,
        color: '#999'
    },
    trainIsday: {
        fontSize: 10,
        color: '#999'
    },

    // 酒店
    hotel: {
        backgroundColor: '#fff'
    },
    hotelName: {
        fontSize: 16,
        color: '#333',
        marginBottom: 3,
    },
    hotelInfo: {
        color: '#999'
    },
    hotelAdress: {
        color: '#333',


    },
    iconSpace: {
        color: '#333',

    },
    hotelPolicy: {
        color: COLORS.secondary,
        textDecorationLine: 'underline',
        textAlign: 'right',
        fontSize: 14,

    },


})