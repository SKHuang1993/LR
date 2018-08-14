import React, {Component} from 'react';
import {
	View,
} from 'react-native';
import {Toast} from 'antd-mobile';
import OrderDetail from './orderDetail2';
import{ RestAPI } from '../../utils/yqfws'

export default class OrderDetailById extends Component {
    constructor(props) {
        super(props);
        this.state={
            tradeID:this.props.OrderNum,
            accountNo:this.props.AccountNo,
            serviceStaffInfo:{},
            bookingInfo:{},
            orderTitleInfo:{},
            orderId:'',
            insureId:null,
            visaId:null
        }
    }
    componentDidMount(){
        this.getOrderDetail();
    }
    render(){
        return(<View></View>);
    }

    getOrderDetail = () => {
        this.state.serviceStaffInfo = {
            'UserCode':'',
            'Name':'网上客服',
            'CustomerServiceCount':'888',
            'UserAVGScore':'4.80',
            'Mobile':'400-6786622',
            'WXQRCode':'',
            'IsOnline':'',
            'IsMobileOnline':false,
            'userImg':"http://m.yiqifei.com/userimg/CMC05T5D/2",
        };
        const {navigator} = this.props;
        if(navigator) {
            navigator.replace({
                name: 'OrderDetail',
                component: OrderDetail,
                passProps:{
                    ServiceStaffInfo:this.state.serviceStaffInfo,
                    OrderId:this.state.tradeID,
                    BookerID:this.state.accountNo,
                }
            })
        }
        // let param={
        //     "TradeID": this.state.tradeID,//"SAKUHY",//
        //     "BookerID": this.state.accountNo//"TG000QA8"//
        // }
        // Toast.loading("加载中...",60,()=>{
        //      Toast.info('加载失败', 3, null, false);
        // });
        // RestAPI.invoke("ABIS.SimTradeGet",JSON.stringify(param),(value)=>{
        //     if(value.Code == 0){
        //         this.state.bookingInfo = {
        //             'ContactPerson':value.Result.Trade.ContactPerson != null ? value.Result.Trade.ContactPerson : value.Result.Trade.BookerName,
        //             'ContactMobile':value.Result.Trade.ContactMobile != null ? value.Result.Trade.ContactMobile : '',
        //             'ContactEmail':value.Result.Trade.ContactEmail != null ? value.Result.Trade.ContactEmail : '',
        //             'Remark':value.Result.Trade.Remark != null ? value.Result.Trade.Remark : '',
        //         };
        //         this.state.orderTitleInfo = {
        //             'BookerName':value.Result.Trade.BookerName,
        //             'StatusName':'',
        //             'OrderID':'',
        //             'DepartureDate':'',
        //             'PaymentMethodID':value.Result.Trade.PaymentMethodID == 1 ? '现付' : 
        //                                 value.Result.Trade.PaymentMethodID == 3 ? '欠款' : '月结',
        //             'CostCenterInfo':'',
        //             'TravelPurpose':'',
        //             'ContrReason':'',
        //             'TotalAmount':value.Result.Trade.TotalAmount,
        //         };
        //         this.state.orderId = value.Result.Trade.Orders[0].OrderID;
        //         for(var v of value.Result.Trade.Orders){
        //             if(v.OrderType == 4) this.state.insureId = v.OrderID;
        //             else if(v.OrderType == 5) this.state.visaId = v.OrderID;
        //         }
        //         if(value.Result.Trade.ServiceStaff!=null && value.Result.Trade.ServiceStaff.UserCode != null){
        //             this.state.serviceStaffInfo = {
        //                 'UserCode':value.Result.Trade.ServiceStaff.UserCode,
        //                 'Name':value.Result.Trade.ServiceStaff.Name,
        //                 'CustomerServiceCount':'',
        //                 'UserAVGScore':value.Result.Trade.ServiceStaff.UserAVGScore,
        //                 'Mobile':value.Result.Trade.ServiceStaff.Mobile,
        //                 'WXQRCode':value.Result.Trade.ServiceStaff.WXQRCode,
        //                 'IsOnline':value.Result.Trade.ServiceStaff.IsOnline,
        //                 'IsMobileOnline':value.Result.Trade.ServiceStaff.IsMobileOnline,
        //                 'userImg':"http://m.woquguo.net/UserImg/" + value.Result.Trade.ServiceStaff.UserCode + "/3",
        //             };
        //             this.getUserImg();
        //         }else{
        //             this.state.serviceStaffInfo = {
        //                 'UserCode':'',
        //                 'Name':'网上客服',
        //                 'CustomerServiceCount':'888',
        //                 'UserAVGScore':'4.80',
        //                 'Mobile':'400-6786622',
        //                 'WXQRCode':'',
        //                 'IsOnline':'',
        //                 'IsMobileOnline':false,
        //                 'userImg':"http://m.yiqifei.com/userimg/CMC05T5D/2",
        //             };
        //             const {navigator} = this.props;
        //             if(navigator) {
        //                 navigator.replace({
        //                     name: 'OrderDetail',
        //                     component: OrderDetail,
        //                     passProps:{
        //                         ServiceStaffInfo:this.state.serviceStaffInfo,
        //                         BookingInfo:this.state.bookingInfo,
        //                         OrderTitleInfo:this.state.orderTitleInfo,
        //                         OrderId:this.state.orderId,
        //                         InsureId:this.state.insureId,
        //                         VisaId:this.state.visaId,
        //                     }
        //                 })
        //             }
        //         }
        //     }else{
        //         Toast.hide();
        //         Toast.info(value, 3, null, false);
        //         this.goBackPrevious();
        //     }
        // },(err)=>{
        //     Toast.hide();
        //     Toast.info(err,3,null,false);
        //     this.goBackPrevious();
        // })
    }

    //获取跟单人头像
    getUserImg=()=>{
            let param={
                "UserCode": this.state.serviceStaffInfo.UserCode,
            }
            RestAPI.invoke("CRM.TravelAdvisoryInfoStatistics",JSON.stringify(param),(value)=>{
                let advInfo = value;
                if(advInfo.Code == 0){
                    this.state.serviceStaffInfo = {
                        'UserCode':advInfo.Result.StaffContact.UserCode,
                        'Name':advInfo.Result.StaffContact.StaffName,
                        'CustomerServiceCount':advInfo.Result.CustomerServiceCount,
                        'UserAVGScore':advInfo.Result.StaffContact.UserAVGScore,
                        'Mobile':this.state.serviceStaffInfo.Mobile,
                        'WXQRCode':this.state.serviceStaffInfo.WXQRCode,
                        'IsOnline':this.state.serviceStaffInfo.IsOnline,
                        'IsMobileOnline':this.state.serviceStaffInfo.IsMobileOnline,
                        'userImg':"http://m.woquguo.net/UserImg/" + this.state.serviceStaffInfo.UserCode + "/3",
                    }
                    Toast.hide();
                    const {navigator} = this.props;
                    if(navigator) {
                        navigator.replace({
                            name: 'OrderDetail',
                            component: OrderDetail,
                            passProps:{
                                ServiceStaffInfo:this.state.serviceStaffInfo,
                                BookingInfo:this.state.bookingInfo,
                                OrderTitleInfo:this.state.orderTitleInfo,
                                OrderId:this.state.orderId,
                                InsureId:this.state.insureId,
                                VisaId:this.state.visaId,
                            }
                        })
                    }
                }else{
                    Toast.hide();
                    Toast.info(value, 3, null, false);
                    this.goBackPrevious();
                }
            },(err)=>{
                Toast.hide();
                Toast.info(err,3,null,false);
                this.goBackPrevious();
            })
    }

    goBackPrevious = () => {
        const {navigator} = this.props;
        if(navigator) navigator.pop();
    }
}