import React, {Component} from 'react';
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
    Alert,
} from 'react-native';
import {Toast} from 'antd-mobile';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import AdviserModule from './adviserModule';
import ExhibitionView from '../../components/exhibitionView/index';
import{ RestAPI } from '../../utils/yqfws';
import FlightView from '../../components/booking/flightList';
import FlightInfo from '../../components/booking/flightInfo';
import Flex from '../../components/flex';
import formatPrice from '../../components/formatPrice';
import moment from 'moment';
import Modal from '../../components/modal';
import 'moment/locale/zh-cn';


var {width,height} = Dimensions.get('window')
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

export default class orderDetail  extends Component {
    constructor(props) {
        super(props);
        this.state={
            title:{},
            list:[],
            data:{},
            fInfo:{},
            orderType:8,
            hotelInfo:{},
            Hotel_Info:{},
            pasInfo:[],
            Segments:[],
            orderId:this.props.OrderId,
            isInsure:false,
            isVisa:false,
            insureId:this.props.InsureId,
            visaId:this.props.VisaId,
            insureInfo:{},
            visaInfo:{},
            bookingInfo:this.props.BookingInfo,
            orderTitleInfo:this.props.OrderTitleInfo,
            //旅客信息listview关联的数据
            passengersData: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            domesticInfo: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            trainInfo: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            mMobile:'',
            mEmail:'',
        };
    }

    componentDidMount(){
        let storage = global.storage;
        storage.load({ key: 'BIZACCOUNTINFO' }).then(val =>{
            if(val!=null){
                let userInfo = JSON.parse(val);
                this.state.mMobile = userInfo.Phone;
                this.state.mEmail = userInfo.Email;
            }
        }).catch(err => {
            console.log(err)
        });
        if(this.state.insureId != null) this.getInsureOrderDetailInfo();
        if(this.state.visaId != null) this.getVisaOrderDetailInfo();
        this.getOrderDetailInfo();
    }

    render(){
        
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                <Navbar navigator={this.props.navigator} title={lan.orderDetail}/>
                <ScrollView>
                    {this.getOrderTitleView()}

                    {this.state.orderType == 8 || this.state.orderType == 9 ? 
                    <View style={{paddingLeft:15,paddingRight:15,paddingBottom:10,backgroundColor:'#fff',marginTop:10}}>
                        <ListView
                                enableEmptySections = {true}
                                dataSource={this.state.domesticInfo}
                                renderRow={(rowData,sectionId,rowId)=>this.getPlaneView(rowData)}
                        />
                    </View>
                     : null}

                    {this.state.orderType == 8 || this.state.orderType == 9  ? 
                    <View>
                        <Text style={{color:'#999',fontSize:14,marginLeft:15,marginBottom:3,marginTop:8}}>{lan.passengInfo}</Text>
                        <ListView
                            dataSource={this.state.passengersData}
                            renderRow={this.setPlanePassengView.bind(this)}
                    />
                    </View>
                    : this.state.orderType == 3 ?
                    <View>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardHeaderText}>{lan.trainInfo}</Text>
                        </View>
                        <ListView
                                enableEmptySections = {true}
                                dataSource={this.state.trainInfo}
                                renderRow={(rowData,sectionId,rowId)=>this.getTrainView(rowData)}
                        />
                        <Text style={{color:'#999',fontSize:14,marginLeft:15,marginBottom:3,marginTop:8}}>{lan.passengInfo}</Text>
                        <ListView
                            dataSource={this.state.passengersData}
                            renderRow={(rowData,sectionId,rowId) =>this.setTrainPassengView(rowData,rowId)}
                    />
                    </View>
                     : null}

                     {this.state.orderType == 2 ? this.setHotelPassengView(this.state.hotelInfo,this.state.pasInfo) : null}

                     {this.state.isInsure ? this.setInsureOrVisaView(4,this.state.insureInfo):null}
                     {this.state.isVisa ? this.setInsureOrVisaView(5,this.state.visaInfo):null}
                    
                    <Text style={{color:'#999',fontSize:14,marginLeft:15,marginBottom:3,marginTop:8}}>{lan.contactInfo}</Text>
                    <ExhibitionView leftText={lan.name} rightText={this.state.bookingInfo.ContactPerson} 
                                    rightColor={'#333'} bottomLine={true} leftColor={'#666'}/>
                    <ExhibitionView leftText={lan.mpNumber} rightText={this.state.bookingInfo.ContactMobile == ''?
                                    this.state.mMobile:this.state.bookingInfo.ContactMobile} 
                                    rightColor={'#333'} bottomLine={true} leftColor={'#666'}/>
                    <ExhibitionView leftText={lan.email} rightText={this.state.bookingInfo.ContactEmail == ''?
                                    this.state.mEmail:this.state.bookingInfo.ContactEmail} rightColor={'#333'} 
                                    leftColor={'#666'} bottomLine={true} />
                    <ExhibitionView leftText={lan.remark} rightText={this.state.bookingInfo.Remark ==''?lan.noWrite:this.state.bookingInfo.Remark} rightColor={'#333'} 
                                    leftColor={'#666'} />
                
                    <Text style={{color:'#999',fontSize:14,marginLeft:15,marginBottom:3,marginTop:8}}>{lan.consultant}</Text>
                    <AdviserModule serviceStaffInfo={this.props.ServiceStaffInfo}/>
                </ScrollView>
            </View>
        );
    }

    //获取订单详情
    getOrderDetailInfo = () => {
        let param={
            "TradeID": this.state.orderId,
            "OrderID": null,
            "BookerID": this.state.orderTitleInfo.BookerID,
            "UserCode": "" 
        }
        Toast.loading(lan.loading,60,()=>{
             Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("ABIS.SimTradeGet",JSON.stringify(param),(value)=>{
            Toast.hide();
            let orderInfo = value;
            if(orderInfo.Code == 0){
                this.state.orderTitleInfo = {
                    'BookerName':this.state.orderTitleInfo.BookerName,
                    'StatusName':orderInfo.Result.Order.StatusName,
                    'OrderID':orderInfo.Result.Order.OrderID,
                    'DepartureDate':orderInfo.Result.Order.OrderType ==5 ? "" : orderInfo.Result.Order.DepartureDate,
                    'PaymentMethodID':this.state.orderTitleInfo.PaymentMethodID,
                    'CostCenterInfo':orderInfo.Result.Order.Policy.CostCenterInfo,
                    'TravelPurpose':orderInfo.Result.Order.TravelPurpose,
                    'ContrReason':orderInfo.Result.Order.Policy.ContrReason,
                    'ContrContent':orderInfo.Result.Order.Policy.ContrContent,
                    'TotalAmount':this.state.orderTitleInfo.TotalAmount,
                };
                this.state.orderType = orderInfo.Result.Order.OrderType;
                if(orderInfo.Result.Order.OrderType == 2){
                    this.state.hotelInfo = orderInfo.Result.Order.Hotal;
                    this.state.pasInfo = orderInfo.Result.Order.Passengers;
                    this.state.Hotel_Info={
                        "HotelName":orderInfo.Result.Order.Hotal.HotelName,
                        "RoomTypeName":orderInfo.Result.Order.Hotal.Rooms[0].RoomTypeName,
                        "BreakfastName":orderInfo.Result.Order.Hotal.Rooms[0].BreakfastName,
                        "IsContrPolicy":orderInfo.Result.Order.Policy.IsContrPolicy,
                        "ContrContent":orderInfo.Result.Order.Policy.ContrContent,
                        "HotelAddress":orderInfo.Result.Order.Hotal.HotelAddress,
                        "EI":orderInfo.Result.Order.Policy.EI,
                        "RoomPrice":lan.housingPrice+":¥"+orderInfo.Result.Order.Hotal.Expenses[0].RoomPrice+"x"+
                                orderInfo.Result.Order.Hotal.Expenses[0].RoomQty+"x"+lan.jian+
                                orderInfo.Result.Order.Hotal.Expenses[0].DayQty+"x"+lan.night,
                        "TotalAmount":"¥"+orderInfo.Result.Order.TotalAmount
                    }
                    this.setState({});
                }else if(orderInfo.Result.Order.OrderType == 3){
                    let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    this.state.Segments = orderInfo.Result.Order.EurailP2P.Segments;
                    let traInfo = [];
                    let T_info = {};
                    for(var i = 0;i<orderInfo.Result.Order.EurailP2P.Segments.length;i++){
                        var v = orderInfo.Result.Order.EurailP2P.Segments[i];
                        T_info = {
                            "DepartureTime":v.Trains[0].DepartureTime.substring(11,16),
                            "ArrivalTime":v.Trains[0].ArrivalTime.substring(11,16),
                            "TotalElapsedTime":this.getDateDiff(v.Trains[0].DepartureTime,v.Trains[0].ArrivalTime,null),
                            "dayNum":this.getDateDiff(v.Trains[0].DepartureTime,v.Trains[0].ArrivalTime,true),
                            "DepartureCity":v.DepartureCity.CityName,//split('|')
                            "ArrivalCity":v.ArrivalCity.CityName,
                            "TrainNumber":v.Trains[0].TrainNumber,
                            "EI":orderInfo.Result.Order.Policy.EI,
                            "CabinLevel":v.Trains[0].CabinLevel,
                            "TicketPrice":orderInfo.Result.Order.EurailP2P.Expenses[i].TicketPrice,
                            "PassengerQty":orderInfo.Result.Order.EurailP2P.Expenses[i].PassengerQty,
                            "TotalAmount":orderInfo.Result.Order.TotalAmount
                        }
                        traInfo.splice(traInfo.length,0,T_info);
                    }
                    this.setState({
                        trainInfo:ds.cloneWithRows(traInfo),
                        passengersData: ds.cloneWithRows(orderInfo.Result.Order.Passengers),
                    });
                }else if(orderInfo.Result.Order.OrderType == 8||orderInfo.Result.Order.OrderType == 9){
                    let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    let allFlightInfo = [];
                    for(var i = 0;i<orderInfo.Result.Order.Ticket.Segments.length;i++){
                        let titInfo = {};
                        if(orderInfo.Result.Order.Ticket.Segments.length<2){
                            titInfo ={
                                leg: i == 0 ? lan.go : lan.comeBack,
                                date: orderInfo.Result.Order.Ticket.Segments[i].Flights[0].DepartureTime, // 格式 2015-10-23T22:50:00 || 2015-10-23 22:50:00
                                city: orderInfo.Result.Order.Intro,
                            };
                        }else{
                            titInfo ={
                                leg: (i+1)+"",
                                date: orderInfo.Result.Order.Ticket.Segments[i].Flights[0].DepartureTime, // 格式 2015-10-23T22:50:00 || 2015-10-23 22:50:00
                                city: orderInfo.Result.Order.Intro,
                            };
                        }
                        this.state.title = titInfo;

                        let j = 0;
                        for(var v of orderInfo.Result.Order.Ticket.Segments[i].Flights){
                            j++;
                            let turnInfo = false;//记录是否中间有转机
                            if(j>1) turnInfo = true;
                            let isVisBottom = true;
                            if(orderInfo.Result.Order.Ticket.Segments[i].Flights.length>1 
                                    && j<orderInfo.Result.Order.Ticket.Segments[i].Flights.length) 
                                isVisBottom = false;

                            let sInfo = {
                                "TurnInfo":turnInfo,
                                "IsVisBottom":isVisBottom,
                                "IsTurn":turnInfo?(lan.stops+"  "+
                                            this.getDateDiff(orderInfo.Result.Order.Ticket.Segments[i].Flights[j-1].ArrivalTime,
                                            v.DepartureTime,null)+"  "+lan.transitArea+"  "+v.DepartureAirport.AirportName):"",
                                "Departure": v.DepartureAirport.CityCode,
                                "Arrival": v.ArrivalAirport.CityCode,
                                "DepartureInfo": {
                                    "airportCode": v.DepartureAirport.AirportCode,
                                    "airportNameEn": "",
                                    "airportNameCn": v.DepartureAirport.AirportName,
                                    "cityCode": v.DepartureAirport.CityCode,
                                    "cityIataCode": '',
                                    "cityNameEn": "",
                                    "cityNameCn": v.DepartureAirport.CityName,
                                    "countryCode": v.DepartureAirport.CountryCode,
                                    "countryNameEn": '',
                                    "countryNameCn": v.DepartureAirport.CountryName,
                                    "continentCode": "",
                                    "continentNameCn": "",
                                    "timeZone": ""
                                },
                                "ArrivalInfo": {
                                    "airportCode": v.ArrivalAirport.AirportCode,
                                    "airportNameEn": "",
                                    "airportNameCn": v.ArrivalAirport.AirportName,
                                    "cityCode": v.ArrivalAirport.CityCode,
                                    "cityIataCode": '',
                                    "cityNameEn": "",
                                    "cityNameCn": v.ArrivalAirport.CityName,
                                    "countryCode": v.ArrivalAirport.CountryCode,
                                    "countryNameEn": '',
                                    "countryNameCn": v.ArrivalAirport.CountryName,
                                    "continentCode": "",
                                    "continentNameCn": "",
                                    "timeZone": ""
                                },
                                "DepartureDate": v.DepartureTime,
                                "ArrivalDate": v.ArrivalTime,
                                "MarketingAirline": v.MarketingAirline.Code,
                                "FlightNumber": v.FlightNumber,
                                "DepartureTerminal": v.DepartureAirport.Terminal,
                                "ArrivalTerminal": v.ArrivalAirport.Terminal,
                                "Equipment": v.Equipment,
                                "ElapsedTime": parseInt(v.ElapsedTime/60)+"h"+(v.ElapsedTime%60)+"m",
                                "Miles": "",//英里
                                "StopQuantity": "0",
                            }
                            this.state.fInfo = {
                                Rule:orderInfo.Result.Order.Ticket.Rule,
                                CabinName: this.getCabinClassName(v.CabinLevel)+v.Cabin,
                                DiscountRate: orderInfo.Result.Order.Discount == null ? '10' : orderInfo.Result.Order.Discount,
                                Price: orderInfo.Result.Order.TotalAmount,
                                ExtraPrice: this.state.orderType == 8 ? lan.includes+":¥"+orderInfo.Result.Order.Ticket.Expenses[i].Tax : (lan.ticketPrice+":¥"+orderInfo.Result.Order.Ticket.Expenses[i].TicketPrice+"  "+lan.tax+":¥"+orderInfo.Result.Order.Ticket.Expenses[i].Tax)
                            }
                            // this.state.list.splice(this.state.list.length,0,sInfo);
                            this.state.data = {"title":turnInfo ? "" : this.state.title,"list":[sInfo],"FilInfo":this.state.fInfo};
                            allFlightInfo.splice(allFlightInfo.length,0,this.state.data);
                        }
                        
                    }
                    
                    this.setState({
                        domesticInfo:ds.cloneWithRows(allFlightInfo),
                        passengersData: ds.cloneWithRows(orderInfo.Result.Order.Passengers),
                    });
                }else{
                    this.setState({});
                }
            }else{
                Toast.info(value, 3, null, false);
            }
        },(err)=>{
            Toast.info(err,3,null,false);
        })
    }

    //获取保险订单详情
    getInsureOrderDetailInfo = () => {
        let param={
            "OrderID": this.state.insureId,
        }
        RestAPI.invoke("ABIS.SimOrderGet",JSON.stringify(param),(value)=>{
            let orderInfo = value;
            if(orderInfo.Code == 0){
                this.state.insureInfo = {
                    "Intro":orderInfo.Result.Order.Intro,
                    "EffectiveStart":orderInfo.Result.Order.Insure.EffectiveStart.substring(0,11).replace("-",".").replace("-","."),
                    "EffectiveEnd":orderInfo.Result.Order.Insure.EffectiveEnd.substring(0,11).replace("-",".").replace("-","."),
                    "TotalAmount":orderInfo.Result.Order.TotalAmount,
                }
                this.state.isInsure = true;
                this.setState({});
            }else{
                Toast.info(value, 3, null, false);
            }
        },(err)=>{
            Toast.info(err,3,null,false);
        })
    }

    //获取签证订单详情
    getVisaOrderDetailInfo = () => {
        let param={
            "OrderID": this.state.visaId,
        }
        RestAPI.invoke("ABIS.SimOrderGet",JSON.stringify(param),(value)=>{
            let orderInfo = value;
            if(orderInfo.Code == 0){
                this.state.visaInfo = {
                    "Intro":orderInfo.Result.Order.Intro,
                    "StopMaxDay":orderInfo.Result.Order.Visa.StopMaxDay,
                    "ValidDay":orderInfo.Result.Order.Visa.ValidDay,
                    "TotalAmount":orderInfo.Result.Order.TotalAmount,
                }
                this.state.isVisa = true;
                    this.setState({});
            }else{
                Toast.info(value, 3, null, false);
            }
        },(err)=>{
            Toast.info(err,3,null,false);
        })
    }

    //订单信息头部布局
    getOrderTitleView = () => {
        return(
            <View style={{backgroundColor:'#fff',padding:10}}>
                <View style={{flexDirection:'row'}}>
                    <Text style={{color:'#999',fontSize:15,textAlign:'left',flex:0.2}}>{lan.bookerName+":"}</Text>
                    <View style={{flexDirection:'row',flex:0.4,alignItems:'center'}}>
                        <Text style={{color:'#333',fontSize:15,}}>{this.state.orderTitleInfo.BookerName}</Text>
                        <TouchableOpacity onPress={()=>this.getPolicyContent()}>
                            <Icon icon={'0xe67a'} color={COLORS.link} style={{fontSize: 15,marginLeft:3}}/>
                        </TouchableOpacity>
                    </View>
                    <Text style={{color:COLORS.btnBg,fontSize:15,flex:0.3}}>{this.state.orderTitleInfo.StatusName}</Text>
                </View>
                <View style={{flexDirection:'row',marginTop:5}}>
                    <Text style={{color:'#999',fontSize:15,textAlign:'left',flex:0.2}}>{lan.orderNum+":"}</Text>
                    <Text style={{color:'#333',fontSize:15,flex:0.4}}>{this.state.orderTitleInfo.OrderID}</Text>
                    <Text style={{color:'#333',fontSize:15,flex:0.3}}>{this.state.orderTitleInfo.DepartureDate}</Text>
                </View>
                <View style={{flexDirection:'row',marginTop:5}}>
                    <Text style={{color:'#999',fontSize:15,textAlign:'left',flex:0.2}}>{lan.payWay+":"}</Text>
                    <Text style={{color:'#333',fontSize:15,flex:0.4}}>{this.state.orderTitleInfo.PaymentMethodID}</Text>
                    <Text style={{color:'#333',fontSize:15,flex:0.3}}>{this.state.orderTitleInfo.CostCenterInfo}</Text>
                </View>
                <View style={{flexDirection:'row',marginTop:5}}>
                    <Text style={{color:'#999',fontSize:15,textAlign:'left',flex:0.2}}>{lan.travelPurpose+":"}</Text>
                    <Text style={{color:'#333',fontSize:15,flex:0.7}}>{this.state.orderTitleInfo.TravelPurpose}</Text>
                </View>
                <View style={{flexDirection:'row',marginTop:5}}>
                    <Text style={{color:'#999',fontSize:15,textAlign:'left',flex:0.2}}>{lan.contrReason+":"}</Text>
                    <Text style={{color:'#333',fontSize:15,flex:0.7}}>{this.state.orderTitleInfo.ContrReason}</Text>
                </View>
                <View style={{flexDirection:'row',marginTop:5}}>
                    <Text style={{color:'#999',fontSize:15,textAlign:'left',flex:0.2}}>{lan.totalAmount+":"}</Text>
                    <Text style={{color:'#333',fontSize:15,flex:0.7}}>{'¥'+this.state.orderTitleInfo.TotalAmount}</Text>
                </View>
            </View>
        );
    }

    //机票类型乘客信息界面布局
    setPlanePassengView = (value) =>{
        return(
            <View>
                <View style={{paddingLeft:15,paddingRight:15,paddingTop:10,paddingBottom:10,backgroundColor:'#fff'}}>
                    <Text style={{color:'#333',fontSize:16}}>{value.Name}</Text>
                    <Text style={{color:'#999',fontSize:14,marginTop:3}}>
                            {this.getProofName(value.CertType)+":"+value.CertNr}</Text>
                </View>
                <View style={{backgroundColor:'#ebebeb',height:0.8}}/>
            </View>
        );
    }

    //火车票类型乘客信息界面布局(CHD-小孩，ADT-成人)
    setTrainPassengView = (value,i) =>{
        let tInfo = this.state.Segments[i];
        let typeName = value.Type == 'ADT' ? lan.adult : value.Type == 'CHd' ? lan.child : lan.children;
        return(
            <View>
                <View style={{paddingLeft:15,paddingRight:15,paddingTop:10,paddingBottom:10,backgroundColor:'#fff'}}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{color:'#333',fontSize:16}}>{value.Name}</Text>
                        <Text style={{color:'#333',fontSize:16,marginLeft:30,marginRight:30}}>{typeName}</Text>
                        <Text style={{color:'#333',fontSize:16}}>{tInfo.Trains[0].CabinLevel}</Text>
                    </View>
                    <Text style={{color:'#999',fontSize:14,marginTop:3}}>
                            {this.getProofName(value.CertType)+":"+value.CertNr}</Text>
                    <Text style={{color:'#999',fontSize:14,marginTop:3}}>
                            {tInfo.Trains[0].CabinCode +"   "+tInfo.Trains[0].Seat}</Text>
                </View>
                <View style={{backgroundColor:'#ebebeb',height:0.8}}/>
            </View>
        );
    }

    //酒店类型乘客信息界面布局
    setHotelPassengView = (value,passengersInfo) =>{
        let pInfo = '';
        for(var v of passengersInfo){
            pInfo = v.Name+"、";
        }
        if(pInfo.length>0){
            pInfo = pInfo.substring(0,pInfo.length-1);
        }
        let sd = this.DateDiff(value.CheckInDate,value.CheckOutDate);
        return(
            <View >
                {this.getHotelView()}
                <Text style={{color:'#999',fontSize:14,marginLeft:15,marginBottom:3,marginTop:8}}>{lan.passengInfo}</Text>
                <View style={{paddingLeft:10,paddingRight:15,paddingTop:10,paddingBottom:10,backgroundColor:'#fff'}}>
                <View style={{flexDirection:'row'}}>
                    <Text style={{color:'#999',fontSize:15,flex:0.3,textAlign:'left'}}>{lan.checkIn}</Text>
                    <Text style={{color:'#333',fontSize:15,flex:.7}}>{value.CheckInDate.replace("-",".").replace("-",".")
                                            +"-"+value.CheckOutDate.replace("-",".").replace("-",".")}
                                            <Text style={{color:'#999',fontSize:15,textAlign:'left'}}>{'('+sd+'晚)'}</Text>
                                            </Text>
                    
                </View>
                <View style={{flexDirection:'row'}}>
                    <Text style={{color:'#999',fontSize:15,flex:0.3,textAlign:'left'}}>{lan.passenger}</Text>
                    <Text style={{color:'#333',fontSize:15,flex:.7}}>{pInfo}
                        <Text style={{color:'#999',fontSize:15,textAlign:'left'}}>{'('+passengersInfo.length+'人)'}</Text>
                    </Text>
                    
                </View>
                <View style={{flexDirection:'row',}}>
                    <Text style={{color:'#999',fontSize:15,flex:0.3,textAlign:'left'}}>{lan.roomNum}</Text>
                    <Text style={{color:'#333',fontSize:15,flex:.7}}>{value.Rooms.length+lan.jian}</Text>
                </View>
            </View>
            </View>
        );
    }

    //保险及签证的模块布局
    setInsureOrVisaView = (t,info) => {
        let ins = "";
        if(t== 4)
            ins = info.EffectiveStart+" - "+info.EffectiveEnd
        else ins = lan.stayDays+"："+info.StopMaxDay
        return(
            <View style={{backgroundColor:'#fff',padding:15,marginTop:10}}>
                <Text style={{color:'#333',fontSize:16}}>{info.Intro}</Text>
                <View style={{flexDirection:'row'}}>
                    <Text style={{color:'#999',fontSize:14,marginTop:3,flex:1}}>{ins}</Text>
                    {t == 5 ? 
                    <Text style={{color:'#999',fontSize:14,marginTop:3,flex:1}}>{lan.expiryDate+":"+info.ValidDay}</Text>
                     : null}
                </View>
                <View style={{flexDirection:'row',marginTop:8,alignItems:'flex-end'}}>
                    {t == 4 ? 
                    <TouchableOpacity style={{flex:1}} onPress={()=>this.insureExplain()}>
                        <Text style={{color:COLORS.link,fontSize:14}}>{lan.insInstructions}</Text>
                    </TouchableOpacity>
                     : 
                     <View style={{flex:1,}}/>}
                     <Text style={{color:'#999',fontSize:14}}></Text>
                     <Text style={{color:COLORS.btnBg,fontSize:15,}}>¥</Text>
                     <Text style={{color:COLORS.btnBg,fontSize:17}}>{info.TotalAmount}</Text>
                </View>
            </View>
        )
    }

    //根据证件的类型ID获取证件的名字
    getProofName = (type) => {
        for(var v of proofType){
            if(v.TypeCode == type)
                return v.Name;
        }
        return lan.other;
    }

    //计算天数差的函数，通用  
   DateDiff = (startDate,endDate) => {    //sDate1和sDate2是2006-12-18格式  
        var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime();     
        var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();     
        var dates = Math.abs((startTime - endTime))/(1000*60*60*24);     
        return  dates;   
   }

   //差旅政策违背原因
   getPolicyContent = () =>{
       Alert.alert(
            lan.breachTravelPolicy,
            this.state.orderTitleInfo.ContrContent,
            [
              {text: lan.ok, onPress: () => {}},
            ]
          )
   }

   insureExplain = () => {
       Alert.alert(
            "保险说明",
            '保险名称：华泰财产保险“安翔无忧”的交通工具意外伤害保险\n 适用于乘坐国内航班的旅客\n'+
            '保险费：20元/份\n份数：不超过3份\n保险有效期：乘机日起7天内有效\n保额：40万\n'+
            '年龄：凡零周岁（出生满 6个月）-70周岁\n'+
            '乘机日之前可退//保险公司将委托一起飞在各地有资质的服务商为有需要的客户提供发票，保险定额发票仅作报销凭证，不是保单凭证'
            +'\n数据电文是合法的合同表现形式，电子保单和纸质保单具有同等法律效力，请妥善保存，电子保单可凭保单号或身份证号登陆华泰保险网站http://www.ehuatai.com验真和打印'
            +'\n产品详细条款可致电华泰财产保险股份有限公司热线4006095509进行咨询。<br />备注：根据中国保监会《关于父母为其未成年子女投保以死亡为给付保险金条件人身保险有关问题的通知》（保监发 [2010]95 号）文件的规定，自2011年4月1日起，父母为其未成年子女（未满 18 周岁）投保人身保险，在被保险人成年之前，各保险合同约定的被保险人死亡给付的保险金额总和、被保险人死亡时各保险公司实际支付的保险金总和均不得超过人民币 10 万元',
            [
              {text: lan.ok, onPress: () => {}},
            ]
          )
   }

   getPlaneView = (value) =>{
       let fiData = value.FilInfo;
       let fvData = {"title":value.title,"list":value.list}
       return(
           <View>
               {fvData.list[0].TurnInfo ? 
               <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',borderStyle:'dashed',
                            marginTop:2,marginBottom:2,borderWidth: 2 / FLEXBOX.pixel,borderColor:'#999',borderRadius:10,}}>
                   <Text style={{fontSize:12,paddingLeft:8,paddingRight:8,color:'#666',
                            paddingBottom:2,paddingTop:2}}>{fvData.list[0].IsTurn}</Text>
               </View>
               : null}

               <FlightView data={fvData}/>

               {fvData.list[0].IsVisBottom ? 
               <FlightInfo data={fiData} endorseText={fiData.Rule.replace(new RegExp("<br />","gm"),'\n')} />
               : null}
           </View>
       )
   }

   getTrainView = (value) =>{
       let _info = {
           Rule:value.EI,
           CabinName: '',
           DiscountRate: '',
           Price:value.TotalAmount,
           ExtraPrice: value.CabinLevel+'¥'+value.TicketPrice+"x"+value.PassengerQty
       }
       return(
       <View style={[styles.card, styles.train]}>
                    {/*body*/}
                    <Flex justify={'between'} style={styles.cardBody}>
                        {/*左栏*/}
                        <View style={{ flex: .7 }}>
                            <Flex>
                                <Text style={styles.trainTime}>{value.DepartureTime}</Text>
                                <Text style={styles.trainName}>{value.DepartureCity}</Text>
                            </Flex>
                            <Flex>
                                <Text style={styles.trainTime}>{value.ArrivalTime}
                                    <Text style={styles.trainIsday}>{value.dayNum>0?('+'+value.dayNum):''}</Text></Text>
                                <Text style={styles.trainName}>{value.ArrivalCity}</Text>
                            </Flex>
                        </View>
                        {/*右栏*/}
                        <View style={{ flex: .3 }}>
                            <Text style={styles.trainNumber}>
                                {value.TrainNumber}
                            </Text>
                            <Flex>
                                <Icon icon={'0xe670'} style={styles.iconTime} />
                                <Text style={styles.trainTotalTime}>{value.TotalElapsedTime}</Text>
                            </Flex>
                        </View>
                    </Flex>
                    {/*底部*/}
                    <Flex justify={'between'} style={styles.cardFooter}>
                        <FlightInfo data={_info} endorseText={_info.Rule.replace(new RegExp("<br />","gm"),'\n')} />
                    </Flex>
                </View>
       );
   }

   getHotelView = () =>{
       let _info = {
           Rule:this.state.Hotel_Info.EI,
           CabinName: '',
           DiscountRate: '',
           Price:this.state.Hotel_Info.TotalAmount,
           ExtraPrice:this.state.Hotel_Info.RoomPrice
       }
       return(
           <View style={[styles.card, styles.hotel]}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderText}>{lan.hotelInfo}</Text>
                    </View>
                    <View justify={'between'} style={styles.cardBody}>
                        <Flex >
                            {/*左栏*/}
                            <View style={{ flex: .7 }}>
                                <View>
                                    <Text style={styles.hotelName} numberOfLines={1}>{this.state.Hotel_Info.HotelName}</Text>
                                </View>
                                <Flex >
                                    <Text style={[styles.hotelInfo,{marginRight:40}]}>{this.state.Hotel_Info.RoomTypeName}</Text>
                                    <Text style={styles.hotelInfo}>{this.state.Hotel_Info.BreakfastName}</Text>
                                </Flex>
                                <Flex align={'center'} style={{marginTop:3}}>
                                    <Icon icon={'0xe691'} style={styles.iconSpace} />
                                    <Text style={styles.hotelAdress}>{this.state.Hotel_Info.HotelAddress}</Text>
                                </Flex>
                            </View>
                            {/*右栏*/}
                            <View style={{ flex: .2 }}>
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity activeOpacity={.7} onPress={() => {
                                        Modal.alert(lan.breachTravelPolicy, 
                                            this.state.Hotel_Info.IsContrPolicy?this.state.Hotel_Info.ContrContent:"", 
                                            [{ text: lan.ok, onPress: () => { } },
                                        ]);
                                    }}>
                                        <Text style={styles.hotelPolicy}>{lan.breachTravelPolicy}</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </Flex>


                    </View>
                    {/*底部*/}
                    <Flex justify={'between'} style={styles.cardFooter}>
                        <FlightInfo data={_info} endorseText={_info.Rule.replace(new RegExp("<br />","gm"),'\n')} />
                    </Flex>
                </View>
       );
   }

   getCabinClassName = (type) =>{
        if (type == 'Y') return lan.economyClass;
        else if (type == 'C') return lan.businessClass;
        else if (type == 'F') return lan.firstClass;
        else return lan.HighEeconomyClass;
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
}

const styles = StyleSheet.create({
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
        marginBottom:10,
    },

    trainTime: {
        flex: .35,
        fontSize: 16,
        color:'#333',
    },
    trainName: {
        flex: .65,
        fontSize: 16,
        color:'#333',
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
        fontSize:14,
        
    }


})