import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    ListView,
    TouchableOpacity,
    Platform,
    BackAndroid,
    Alert,
    NativeModules,
} from 'react-native';
import {Tabs,Toast,Popup} from 'antd-mobile';
import Icon from '../../components/icons/icon';
import RadiusImage from '../../components/radiusImage/index';
import {COLORS} from '../../styles/commonStyle';
import{ RestAPI,ServingClient } from '../../utils/yqfws'
import OrderDetail from './orderDetail2';
import PayWebview from '../webviewView/payWebview';
import ListStore from '../../stores/train/change';
import Change from '../../pages/trains/change';
import {Chat} from '../../utils/chat';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();
var _num = 0;

export default class OrderModuleView extends Component {
    static propTypes = {
        itemInfo:PropTypes.object,//每张订单的信息
	}

    constructor(props) {
        super(props);
        this.store = ListStore;
        this.state={
            imgType:2,
            userImg:"",
            isTrain:false,
            changeSuccess:false,
            moduleInfo:this.props.itemInfo,//每张订单的信息
            dataSource:new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            tripInfoList:new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            serviceStaffInfo:{},
            orderId:'',
            isCancel:false,
            LoginAccount:'',
            AccountNo:'',
            isGo:false,
            isBack:false,
            isChangeReturn:false,
            passengersName:'',
        };
    }

    componentDidMount(){
        let storage = global.storage;
        storage.load({ key: 'BIZACCOUNTINFO' }).then(val =>{
                if(val!=null){
                    let userInfo = JSON.parse(val);
                    this.state.LoginAccount = (userInfo.Phone == null || userInfo.Phone == '') ? 
                                                    userInfo.Email : userInfo.Phone;
                    this.state.AccountNo = userInfo.AccountNo
                }
            }).catch(err => {
                console.log(err)
            });
        this.getUserImg();
    }

    render(){
        this.state.orderId = this.props.itemInfo.SOShortNr;
        this.state.passengersName = this.props.itemInfo.BookerName;
        if(this.props.itemInfo.ProductSalesOrders[0].ProductCategoryID == 8)
            this.isCanChangeOrReturn();
        this.state.serviceStaffInfo = {
            'UserCode':this.props.itemInfo.ServiceStaff.UserCode,
            'Name':this.props.itemInfo.ServiceStaff.Name,
            'CustomerServiceCount':'768',
            'UserAVGScore':this.props.itemInfo.ServiceStaff.UserAVGScore,
            'Mobile':this.props.itemInfo.ServiceStaff.Mobile,
            'WXQRCode':this.props.itemInfo.ServiceStaff.WXQRCode?this.props.itemInfo.ServiceStaff.WXQRCode:"",
            'IsOnline':this.props.itemInfo.ServiceStaff.IsOnline,
            'IsMobileOnline':this.props.itemInfo.ServiceStaff.IsMobileOnline,
            'userImg':"http://m.woquguo.net/UserImg/" + this.props.itemInfo.ServiceStaff.UserCode + "/3",
            'IMNr':this.props.itemInfo.ServiceStaff.IMNr?this.props.itemInfo.ServiceStaff.IMNr:'',
        };
        let ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.state.dataSource = ds.cloneWithRows(this.props.itemInfo.ProductSalesOrders);
        this.state.tripInfoList = ds.cloneWithRows(this.props.itemInfo.ProductSalesOrders);
        let returnCount = 0;
        let changeCount = 0;
        let pasCount = 0;
        // for(var v of this.props.itemInfo.Orders){
        //     if(v.ProductCategoryID == 3 && (v.StatusID == 11||v.StatusID == 48||v.StatusID == 49)) this.state.isTrain = true;
        //     else this.state.isTrain = false;
        //     if(v.ProductCategoryID == 3 && v.StatusID == 18) this.state.changeSuccess = true;
        //     if(v.StatusID == 18 || v.StatusID == 17) changeCount++;
        //     if(v.StatusID == 19 || v.StatusID == 20) returnCount++;
        //     if(v.OrderID.indexOf(".")<1) pasCount++;
        //     if((v.ProductCategoryID == 2 || v.OrderType == 3 ||v.OrderType == 8 ||v.OrderType == 9) && 
        //         (v.StatusID == 1|| v.StatusID == 6|| v.StatusID == 21|| v.StatusID == 22
        //         || v.StatusID == 2 || v.StatusID == 15)
        //          && this.props.itemInfo.BookerID == this.props.AccountNo)
        //         this.state.isCancel = true;
        //     else this.state.isCancel = false;
        // }
        return(
            <View style={{marginBottom:12,marginTop:3}}>
                <View style={styles.titleViewStyle}>
                    <Text style={{fontSize:15,color:"#fff",flex:1}}>{lan.orderNum+":"+
                        this.state.moduleInfo.SOShortNr}</Text>
                    {/* <Text style={{fontSize:15,color:"#666",}}>{
                        this.state.moduleInfo.Orders[0].TravelNatureCode==('Public')
                         ? lan.public : lan.private}</Text> */}
                </View>
                
                <ListView
                    enableEmptySections = {true}
                    dataSource={this.state.dataSource}
                    renderRow={(rowData,sectionID,rowID)=>this.productInfo(rowData,rowID)}
                />
                {/* <View style={styles.contactViewStyle}>
                    <RadiusImage pathType={1} 
                            imagePath={'http://m.woquguo.net/UserImg/'+this.state.serviceStaffInfo.UserCode+'/3'}
                            radiusNum={15} imgWidth={30} imgHeight={30}/>
                    <Text style={{flex:1,fontSize:15,marginLeft:10,color:'#666'}}>{this.state.moduleInfo.ServiceStaff.Name}</Text>
                    <TouchableOpacity onPress={()=>this.callPhoneEvent(this.state.serviceStaffInfo.Mobile)}>
                        <Icon icon={'0xe66f'} color={'#666'} style={{fontSize: 22,}}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>this.chatWithAdviser()}>
                        <Icon icon={'0xe66b'} color={'#666'} style={{fontSize: 22,marginLeft:15}}/>
                    </TouchableOpacity>
                </View> */}
                {/* <View style={styles.priceViewStyle}>
                    <Text style={{flex:1,textAlign:'right',color:'#666',fontSize:12}}>{this.getProductPrice()}</Text>
                    <Text style={{fontSize:17,color:'#333',marginLeft:8}}>{lan.price+":¥"+this.state.moduleInfo.TotalAmount}</Text>
                </View> */}
                {/* <View style={{backgroundColor:'#ebebeb',height:0.8}}></View> */}
                <View style={styles.titleViewStyle2}>
                    <Text style={{flex:1}}></Text>
                    <Text style={{flex:1,textAlign:'right',color:'#666',fontSize:12}}>{this.getProductPrice()}</Text>
                    <Text style={{fontSize:17,color:'#333',marginLeft:8}}>{lan.price+":¥"+this.state.moduleInfo.TotalAmount}</Text>

                    {/* {this.state.moduleInfo.IsPayable && this.state.moduleInfo.PaymentMethodID != 5 ? 
                    <TouchableOpacity style={styles.payBorderStyle} onPress={()=>this.toPayOrder(this.state.orderId,this.state.moduleInfo.TotalAmount)}>
                        <Text style={{color:COLORS.btnBg}}>{lan.payNow}</Text>
                    </TouchableOpacity>
                    : null} */}

                    {/* {(this.state.isTrain && returnCount<pasCount && changeCount<pasCount)||
                    (this.props.itemInfo.ProductSalesOrders[0].OrderType == 8 && this.state.isChangeReturn) ? 
                    <TouchableOpacity style={styles.checkOrderBorderStyle} onPress={()=>{
                        if(this.props.itemInfo.ProductSalesOrders[0].OrderType == 8) this.changeOrReturnToDetail(1)
                        else this.toSelectChangeTicket(1)}}>
                        <Text style={{color:"#333"}}>{"   "+lan.change_changeTicket+"   "}</Text>
                    </TouchableOpacity>
                    : null}

                    {((this.state.isTrain  || this.state.changeSuccess)&&returnCount<pasCount) 
                    ||(this.props.itemInfo.ProductSalesOrders[0].OrderType == 8 && this.state.isChangeReturn) 
                    ? 
                    <TouchableOpacity style={styles.checkOrderBorderStyle} onPress={()=>{
                        if(this.props.itemInfo.ProductSalesOrders[0].OrderType == 8) this.changeOrReturnToDetail(2)
                        else this.toSelectChangeTicket(2)
                    }}>
                        <Text style={{color:'#333'}}>{"   "+lan.change_returnTicket+"   "}</Text>
                    </TouchableOpacity>
                    : null} */}

                    {/* {this.state.isCancel ? 
                     <TouchableOpacity style={styles.checkOrderBorderStyle} onPress={()=>this.cancelOrder()}>
                        <Text style={{color:'#333'}}>{lan.cancelOrder}</Text>
                    </TouchableOpacity>
                     : null} */}
                    
                    <TouchableOpacity style={styles.checkOrderBorderStyle} onPress={()=>this.toOrderDetail()}>
                        <Text style={{color:'#333'}}>{lan.checkOrder}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    //8-国内机票，9-国际机票，2-酒店，5-签证，4-保险
    productInfo = (value,i) => {
        if(value.ProductCategoryID == 8 || value.ProductCategoryID == 9) {
            return this.planeTicketView(value);
        }else if(value.ProductCategoryID == 2){
            return this.hotelView(value);
        }else if(value.ProductCategoryID == 4){ 
            return this.insuranceView(value);
        }else if(value.ProductCategoryID == 5){ 
            return this.visaView(value);
        }else{
            // _num++;
            // if(value.StatusID !== 11 || _num<2)
                return this.trainTicketView(value);
            // else return null;
        }
    }

    planeTicketView = (info) => {
        return(
            <View>
                <View style={styles.itemViewStyle}>
                    <Icon icon={'0xe660'} color={'#999'} style={{fontSize: 18,}} />
                    <View style={{flex:1,marginLeft:10}}>
                        <Text style={{color:'#333',fontSize:16}}>{info.Intro}</Text>
                        {/* <Text style={{color:'#666'}} numberOfLines={1}>{"航班号："+info.Carrier}</Text> */}
                        <Text style={{color:'#666'}}>{lan.departureDate+":"+info.FirstDepartureDate.substring(0,16).replace("T","")}</Text>
                        <Text style={{color:'#666'}} numberOfLines={1}>{"下单时间："+info.CreateDate.substring(0,16).replace("T","")}</Text>
                        <Text style={{color:'#666'}} numberOfLines={1}>{"乘机人："+this.state.passengersName}</Text>
                    </View>
                    <Text style={{fontSize:16,color:COLORS.btnBg}}>{info.CustomerDocStatusCName}</Text>
                </View>
                <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
            </View>
        );
    }

    hotelView = (info) => {
        return(
            <View>
                <View style={styles.itemViewStyle}>
                    <Icon icon={'0xe661'} color={'#999'} style={{fontSize: 18,}} />
                    <View style={{flex:1,marginLeft:10}}>
                        <Text style={{color:'#333',fontSize:16}}>{info.Intro}</Text>
                        <Text style={{color:'#666'}}>{info.DepartureDate}</Text>
                    </View>
                    <Text style={{fontSize:16,color:COLORS.btnBg}}>{info.CustomerDocStatusCName}</Text>
                </View>
                <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
            </View>
        );
    }

    trainTicketView = (info) => {
        return(
            <View>
                <View style={styles.itemViewStyle}>
                <Icon icon={'0xe662'} color={'#999'} style={{fontSize: 18,}} />
                <View style={{flex:1,marginLeft:10}}>
                    <Text style={{color:'#333',fontSize:16}}>{info.Intro}</Text>
                    <Text style={{color:'#666'}}>{info.FirstDepartureDate.substring(0,16).replace("T","")}</Text>
                </View>
                <Text style={{fontSize:16,color:COLORS.btnBg}}>{info.CustomerDocStatusCName}</Text>
            </View>
            <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
            </View>
        );
    }

    insuranceView = (info) =>{
        return(
            <View>
                <View style={styles.itemViewStyle}>
                <Icon icon={'0xe697'} color={'#999'} style={{fontSize: 18,}} />
                <View style={{flex:1,marginLeft:10}}>
                    <Text style={{color:'#333',fontSize:16}}>{info.Intro}</Text>
                    <Text style={{color:'#666'}}>{info.FirstDepartureDate.substring(0,16).replace("T","")}</Text>
                </View>
                <Text style={{fontSize:16,color:COLORS.btnBg}}>{info.CustomerDocStatusCName}</Text>
            </View>
            <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
            </View>
        );
    }

    visaView = (info) => {
        return(
            <View>
                <View style={styles.itemViewStyle}>
                <Icon icon={'0xe696'} color={'#999'} style={{fontSize: 18,}} />
                <View style={{flex:1,marginLeft:10}}>
                    <Text style={{color:'#333',fontSize:16}}>{info.Intro}</Text>
                    <Text style={{color:'#666'}}>{info.FirstDepartureDate.substring(0,16).replace("T","")}</Text>
                </View>
                <Text style={{fontSize:16,color:COLORS.btnBg,}}>{info.CustomerDocStatusCName}</Text>
            </View>
            <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
            </View>
            
        );
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
                        'UserCode':this.state.serviceStaffInfo.UserCode,
                        'Name':this.state.serviceStaffInfo.Name,
                        'CustomerServiceCount':advInfo.Result.CustomerServiceCount!=null?advInfo.Result.CustomerServiceCount:768,
                        'UserAVGScore':this.state.serviceStaffInfo.Name.UserAVGScore,
                        'Mobile':this.state.serviceStaffInfo.Mobile,
                        'WXQRCode':this.state.serviceStaffInfo.WXQRCode,
                        'IsOnline':this.state.serviceStaffInfo.IsOnline,
                        'IsMobileOnline':this.state.serviceStaffInfo.IsMobileOnline,
                        'userImg':"http://m.woquguo.net/UserImg/" + this.state.serviceStaffInfo.UserCode + "/3",
                    }
                    this.getIMNr();
                }else{
                    Toast.info(value, 3, null, false);
                }
            },(err)=>{
                Toast.info(err,3,null,false);
            })
    }

    //获取IMNr
    getIMNr = () =>{
        let param = {
            "UserCode": this.state.serviceStaffInfo.UserCode,
            "UserName": null,
            "Password": null,
            "Platform": "MobileDevice",
            "Source": "抢单"
        }
        ServingClient.invoke("IM.GetToken",param,(value) => {
            if(value.IsSuccess){
                this.state.serviceStaffInfo.IMNr = value.User.IMNr;
                this.props.itemInfo.ServiceStaff.IMNr = value.User.IMNr;
            }
        });
    }

    chatWithAdviser = () => {
        
        // alert(JSON.stringify(this.state.serviceStaffInfo));
        Chat.createConversation(this.props.navigator,this.state.serviceStaffInfo.IMNr,this.state.serviceStaffInfo.Name,"C2C",null);
    }

    //获取单个产品价格
    getProductPrice = () => {
        let con = '';
        for (var value of this.props.itemInfo.ProductSalesOrders) {  
            if(value.ProductCategoryID == 8 || value.ProductCategoryID == 9) con = con+lan.flights+"¥"+value.TotalAmount+"+";
            else if(value.ProductCategoryID == 2) con = con+lan.hotel+"¥"+value.TotalAmount+"+";
            else if(value.ProductCategoryID == 4) con = con+lan.insurance+"¥"+value.TotalAmount+"+";
            else if(value.ProductCategoryID == 5) con = con+lan.visa+"¥"+value.TotalAmount+"+";
            else con = con+lan.trains+"¥"+value.TotalAmount+"+";
        }
        con = con.substring(0,con.length-1);
        return con;  
    }

    //马上支付
    // toPayOrder = (orderId,totalAmount) =>{
    //     this.props.navigator.push({
    //         component: PayWebview,
    //         passProps: {
    //             OrderID:orderId,
    //             LoginAccount:this.state.LoginAccount,
    //             AccountNo:this.state.AccountNo,
    //             PayMoney:totalAmount
    //         },
    //     })
    // }

    //取消订单
    // cancelOrder = () =>{
    //     Alert.alert(
    //         lan.remind,
    //         lan.isCancelApplication,
    //         [
    //             {text: lan.ok, onPress: () => {
    //                 let param={
    //                     "SOShortNr": this.props.itemInfo.TradeID,
    //                     "OperatorUserCode": this.props.itemInfo.BookerID
    //                 }
    //                 Toast.loading(lan.cancelOrder,60,()=>{
    //                     Toast.info(lan.timeOut, 3, null, false);
    //                 });
    //                 RestAPI.invoke("ABIS.SalesOrderCancel",JSON.stringify(param),(value)=>{
    //                     if(value.Code == 0){
    //                         Toast.info(lan.orderNum+":"+this.props.itemInfo.TradeID+lan.canceled, 3, null, false);
    //                         this.props.RefreshEvent();
    //                     }else{
    //                         Toast.info(value.Msg, 3, null, false);
    //                     }
    //                 },(err)=>{
    //                         Toast.info(err,3,null,false);
    //                 })
    //             }},
    //             {text: lan.cancel, onPress: () => {}},
    //         ]
    //       )
        
    // }

    //查看订单详情
    toOrderDetail = () =>{
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'OrderDetail',
                component: OrderDetail,
                passProps:{
                    ServiceStaffInfo:this.state.serviceStaffInfo,
                    OrderId:this.state.orderId,
                    BookerID:this.props.itemInfo.BookerID,
                    LoginAccount:this.state.LoginAccount,
                    AccountNo:this.state.AccountNo,
                    RefreshEvent:()=>this.props.RefreshEvent()
                }
            });
        }
    }

    //拨打营业员电话
    callPhoneEvent=(phoneNum)=>{
        Alert.alert(
            lan.call,
            phoneNum,
            [
              {text: lan.ok, onPress: () => NativeModules.MyNativeModule.callPhone(phoneNum)},
              {text: lan.cancel, onPress: () => console.log('Cancel Pressed!',phoneNum)},
            ]
          )
    }

    //跳转退改签
    // toSelectChangeTicket = (t) =>{
    //     this.store.list = [];
    //     this.store.count = 0;
    //     let param = {
    //         "TradeID": this.state.orderId,
    //         "OrderID": null,
    //         "BookerID": this.props.AccountNo,
    //         "UserCode": ""
    //     }
    //     Toast.loading(lan.loading, 60, () => {
    //         Toast.info(lan.loadingFail, 3, null, false);
    //     });
    //     RestAPI.invoke("ABIS.SimTradeGet", JSON.stringify(param), (value) => {
    //         if(value.Code == 0){
    //             this.store.orderDetail = value;
    //             this.store.departureTime = value.Result.Trade.Orders[0].EurailP2P.Segments[0].Trains[0].DepartureTime;
    //             this.store.ticketPrice = value.Result.Trade.Orders[0].EurailP2P.Expenses[0].TicketPrice
    //                                     ?value.Result.Trade.Orders[0].EurailP2P.Expenses[0].TicketPrice:0.0;
    //             for(var v of value.Result.Trade.Orders[0].Passengers){
    //                 let typeName = v.Type == 'ADT' ? lan.adult : v.Type == 'CHD' ? lan.child : lan.children;
    //                 let item = {
    //                     ID:v.ID,
    //                     Name:v.Name,
    //                     Type:v.Type,
    //                     CertType:v.CertType,
    //                     CertNr:v.CertNr,
    //                     Birthday:v.Birthday,
    //                     Sex:v.Sex,
    //                     StatusID:v.StatusID,
    //                     OrderID:value.Result.Trade.Orders[0].OrderID,
    //                     MiddleVendorOrderID:value.Result.Trade.Orders[0].EurailP2P.MiddleVendorOrderID,
    //                     ContactMobile:v.ContactMobile,
    //                     TicketNr:v.TicketNr,
    //                     typeName:typeName+"票",
    //                     CabinLevel:value.Result.Trade.Orders[0].EurailP2P.Segments[0].Trains[0].CabinLevel,
    //                     IsChange:false,
    //                     ChangeSuccess:false,
    //                     IsReturn:v.StatusID == 32 ? true : false,
    //                     ReturnSuccess:v.StatusID == 32 ? true : false,
    //                     ChangeFail:false,
    //                     ReturnFail:false
    //                 }
    //                 this.store.addListItem(item);
    //             }
    //             this.store.changeOrReturn = t;
    //             this.props.navigator.push({
    //                 name: 'Change',
    //                 component: Change,
    //             });
    //             Toast.hide();
    //         }else{
    //             Toast.info(value.Msg, 3, null, false);
    //         }
    //     }, (err) => {
    //         Toast.info(err, 3, null, false);
    //     })
    // }

    //判断国内机票行程是否可以退改签
    isCanChangeOrReturn = () =>{
        if(this.props.itemInfo.ProductSalesOrders.length == 1 && 
            (this.props.itemInfo.ProductSalesOrders[0].StatusID == 11 || this.props.itemInfo.ProductSalesOrders[0].StatusID == 13))
            this.state.isChangeReturn = true;
        else
        for(var i = 1;i < this.props.itemInfo.ProductSalesOrders.length;i++){
            if(i>0 && this.props.itemInfo.ProductSalesOrders[i].OrderID.indexOf(this.props.itemInfo.ProductSalesOrders[0].OrderID)<1){
                if((this.props.itemInfo.ProductSalesOrders[i-1].StatusID == 11 || this.props.itemInfo.ProductSalesOrders[i-1].StatusID == 13)
                    || (this.props.itemInfo.ProductSalesOrders[this.props.itemInfo.ProductSalesOrders.length-1].StatusID == 11 || 
                        this.props.itemInfo.ProductSalesOrders[this.props.itemInfo.ProductSalesOrders.length-1].StatusID == 13)){
                    this.state.isChangeReturn = true;
                    break;
                }
            }
        }
    }

    changeOrReturnToDetail = (type) =>{
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'OrderDetail',
                component: OrderDetail,
                passProps:{
                    ServiceStaffInfo:this.state.serviceStaffInfo,
                    OrderId:this.state.orderId,
                    BookerID:this.props.itemInfo.BookerID,
                    LoginAccount:this.state.LoginAccount,
                    AccountNo:this.state.AccountNo,
                    ticketType:type,
                    RefreshEvent:()=>this.props.RefreshEvent()
                }
            });
        }
    }

}

const styles = StyleSheet.create({
    titleViewStyle:{
        flexDirection:'row',
        backgroundColor:"#159E7D",
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
        paddingBottom:10,
    },
    titleViewStyle2:{
        flexDirection:'row',
        backgroundColor:"#fff",
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
        paddingBottom:10,
    },
    itemViewStyle:{
        backgroundColor:'#fff',
        flexDirection:'row',
        paddingLeft:15,
        paddingRight:15,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop:10,
        paddingBottom:10,
    },
    contactViewStyle:{
        flexDirection:'row',
        backgroundColor:"#f7f7f7",
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
        paddingBottom:10,
    },
    priceViewStyle:{
        flexDirection:'row',
        backgroundColor:"#fff",
        alignItems:'flex-end',
        justifyContent: 'center',
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
        paddingBottom:10,
    },
    checkOrderBorderStyle:{
        marginLeft:15,
        borderColor:'#333',
        borderRadius:5,
        borderWidth:0.5,
        padding:5,
    },
    payBorderStyle:{
        marginLeft:15,
        borderColor:COLORS.btnBg,
        borderRadius:5,
        borderWidth:0.5,
        padding:5,
    },
})