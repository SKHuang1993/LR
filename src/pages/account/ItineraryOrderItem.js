import React, {Component} from 'react';
import PropTypes from 'prop-types';
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
    TextInput,
} from 'react-native';
import {Tabs,Toast,Popup,} from 'antd-mobile';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';
import OrderModuleView from './orderModuleView';
import{ RestAPI } from '../../utils/yqfws';
import ItineraryItem from './itineraryItem';
import moment from 'moment';
import {airData} from '../../utils/acCodeOrAcName'
import OrderDetail from './orderDetail2';
//import RNFS from 'react-native-fs';

import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();
var {width,height} = Dimensions.get('window');

export default class ItineraryOrderItem  extends Component {
    // static propTypes = {
    //     OrderInfo:PropTypes.object,
	// }
    // ds = new ListView.DataSource({
    //         rowHasChanged: (row1, row2) => row1 !== row2,
    // });
    constructor(props){
        super(props);
        this.state = {
             planeTicketData: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
             trainTicketData: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
             hotelData: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
             visaData: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
             insuranceData: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),

             orderInfo:this.props.OrderInfo,
             customerTickets:[],
             orderType:8,
             airName:'',
             SeqNr:this.props.OrderInfo.SeqNr,
             LoginAccount:'',
             AccountNo:'',
        }
    }

    componentWillMount(){
        let ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.state.planeTicketData = ds.cloneWithRows(this.state.orderInfo.Flights);
        this.state.trainTicketData = ds.cloneWithRows(this.state.orderInfo.Trains);
        this.state.hotelData = ds.cloneWithRows(this.state.orderInfo.Hotels);
        this.state.insuranceData = ds.cloneWithRows(this.state.orderInfo.Insurances);

        this.state.customerTickets = this.props.OrderInfo.Tickets;
        this.state.orderType = this.props.OrderInfo.ProductCategoryID;
    }

    componentDidMount(){
        let storage = global.storage;
        storage.load({ key: 'BIZACCOUNTINFO' }).then(val =>{
                if(val!=null){
                    let userInfo = JSON.parse(val);
                    this.state.LoginAccount = (userInfo.Phone == null || userInfo.Phone == '') ? 
                                                    userInfo.Email : userInfo.Phone;
                    this.state.AccountNo = userInfo.Account;

                    
                }
            }).catch(err => {
                console.log(err)
            });
    }

    render(){
        
        
        return(
            <View>
                <View style={{paddingLeft:10,paddingTop:5,paddingRight:15,paddingBottom:5,flexDirection:'row',}}>
                    <Icon icon={"0xe670"} color={'#666'} style={{fontSize:18,}}/>
                    <Text style={{fontSize:14,color:'#666',marginLeft:5,flex:1}}>{this.state.orderInfo.DepartureDate.replace("T"," ")}</Text>
                    {/*<TouchableOpacity onPress={()=>this.setShareView()}>
                        <Icon icon={"0xe692"} color={'#666'} style={{fontSize:18,}}/>
                    </TouchableOpacity>*/}
                </View>
                {/* <TouchableOpacity > */}
                <ListView
                    enableEmptySections = {true}
                    dataSource={this.state.planeTicketData}
                    renderRow={this.getPlaneTicketView.bind(this)}
                />
                
                {this.state.orderInfo.Hotels != '[]' ? 
                <ListView
                    enableEmptySections = {true}
                    dataSource={this.state.hotelData}
                    renderRow={this.getHotelView.bind(this)}
                />
                : null}
                
                {this.state.orderInfo.Trains != '[]' ? 
                <ListView
                    enableEmptySections = {true}
                    dataSource={this.state.trainTicketData}
                    renderRow={this.getTrainTicketlView.bind(this)}
                />
                : null}
                
                {this.state.orderInfo.Insurances != '[]' ? 
                <ListView
                    enableEmptySections = {true}
                    dataSource={this.state.insuranceData}
                    renderRow={this.getInsuranceView.bind(this)}
                />
                : null}
                {/* </TouchableOpacity> */}
            </View>
        );
    }

    getPlaneTicketView = (value) =>{
        let person = "";
        for (var v of this.state.customerTickets){
            person = person+v.PassengerName+"、";
        }

        if(person.length>0) person = person.substring(0,person.length-1);

        let ca = value.CarrierAirline;
        let an = '';
        for(var v of airData.NewDataSet.AirDataList){
            if(v.carriercode == value.CarrierAirline){
                an = v.shortname;
                break;
            }
        }
        let info = {
            "leftBordeColor":'#ed7571',
            "productType":this.state.orderType,
            "airIcon":ca,
            "prodyctName":an+' '+(value.FlightNr==null?"":value.FlightNr),//pInfo.Result+
            "aircraftType":lan.aircraftType+''+(value.AirEquipmentType==null?"":value.AirEquipmentType),
            "cabin":this.getCabinClassName(value.CabinClass)+(value.CabinCode==null?"":value.CabinCode),
            "productIcon":'0xe660',
            "borderViewColor":'#e9524e',
            "startTime":(value.TakeOffDate==null?'88:88':value.TakeOffDate.substring(11,16))+" "+value.DepartureAirportName+(value.DepartureTerminal == null ? "" :value.DepartureTerminal),
            "endTime":(value.ArrivalDate==null?"88:88":value.ArrivalDate.substring(11,16))+" "+value.ArrivalAirportName+(value.ArrivalTerminal== null ? "" :value.ArrivalTerminal),
            "timeLong":lan.times+':'+(value.ElapsedTime==null?'':value.ElapsedTime),
            "allRoad":lan.distance+':'+(value.Distance==null?'0':value.Distance)+"km",
            "passenger":this.state.customerTickets,
            "person":person,
            "address":'',
            "phoneNum":'',
            "roomType":'',
            "count":'',
        };
        if(this.state.SeqNr == value.SeqNr)
            return <ItineraryItem Info={info}/>
        else return <View />
    }

    getHotelView = (value) =>{
        let info = {
            "leftBordeColor":'#ca85d5',
            "productType":this.state.orderType,
            "airIcon":"",
            "prodyctName":value.HotelCName,
            "aircraftType":'',
            "cabin":'',
            "productIcon":'0xe661',
            "borderViewColor":'#bd67cd',
            "startTime":value.CheckInDate!=null?value.CheckInDate.substring(0,10):'',
            "endTime":value.CheckOutDate!=null?value.CheckOutDate.substring(0,10):'',
            "timeLong":'',
            "allRoad":'',
            "passenger":'',
            "person":'',
            "address":value.HotelStreet!=null?value.HotelStreet:'',
            "phoneNum":value.HotelReceptionTel!=null?value.HotelReceptionTel:'',
            "roomType":value.RoomTypeName!=null?value.RoomTypeName:'',
            "count":(value.RoomQty!=null?value.RoomQty:0)+lan.jian+(value.DayQty!=null?value.DayQty:0)+lan.night,
        };
        return <ItineraryItem Info={info}/>
    }

    getTrainTicketlView = (value) =>{
        let person = "";
        for (var v of this.state.customerTickets){
            person = person+v.PassengerName+"、";
        }
        if(person.length>0) person = person.substring(0,person.length-1);
        let info = {
            "leftBordeColor":'#8587d5',
            "productType":this.state.orderType,
            "airIcon":"",
            "prodyctName":value.TrainNr!=null?value.TrainNr:'',
            "aircraftType":this.getSeatType(value.CabinClass),
            "cabin":value.ElapsedTime!=null?value.ElapsedTime:'',
            "productIcon":'0xe662',
            "borderViewColor":'#6769cb',
            "startTime":(value.DepartureDate==null?'88:88':value.DepartureDate.substring(11,16))+" "+value.DepartureTrainStationName,
            "endTime":(value.ArrivalDate==null?"88:88":value.ArrivalDate.substring(11,16))+" "+value.ArrivalTrainStationName,
            "timeLong":'',
            "allRoad":'',
            "passenger":this.state.customerTickets,
            "person":'',
            "address":'',
            "phoneNum":'',
            "roomType":'',
            "count":'',
        };
        return <ItineraryItem Info={info}/>
    }

    getInsuranceView = (value) => {
        let person = "";
        for (var v of this.state.customerTickets){
            person = person+v.PassengerName+"、";
        }
        if(person.length>0) person = person.substring(0,person.length-1);
        let info = {
            "leftBordeColor":'#75bb61',
            "productType":this.state.orderType,
            "airIcon":"",
            "prodyctName":value.ProductName,
            "aircraftType":"",
            "cabin":"",
            "productIcon":'0xe697',
            "borderViewColor":'#52aa39',
            "startTime":value.EffectiveStart==null?'':value.EffectiveStart.substring(0,10),
            "endTime":value.EffectiveEnd==null?'':value.EffectiveEnd.substring(0,10),
            "timeLong":'',
            "allRoad":'',
            "passenger":'',
            "person":person,
            "address":'',
            "phoneNum":'',
            "roomType":'',
            "count":'',
        };
        return <ItineraryItem Info={info}/>
    } 

    getCabinClassName = (type) =>{
        if (type == 'Y') return lan.economyClass;
        else if (type == 'C') return lan.businessClass;
        else if (type == 'F') return lan.firstClass;
        else return lan.highEeconomyClass;
    }

    getSeatType = (seatType) =>{
        if(seatType == "0") return lan.businessSeat;
        else if(seatType == "1") return lan.specialSeat;
        else if(seatType == "2") return lan.firstClassSeat;
        else if(seatType == "3") return lan.secondClassSeat;
        else if(seatType == "4") return lan.highGradeSoftBerth;
        else if(seatType == "5") return lan.softSleeper;
        else if(seatType == "6") return lan.hardSleeper;
        else if(seatType == "7") return lan.softSeats;
        else if(seatType == "8") return lan.hardSeat;
        else if(seatType == "9") return lan.noSeat;
        else return lan.other;
    }

    getTrainNr = (key) =>{
        if(key == 'G') return lan.highSpeedRail;
        else if(key == 'D') return lan.EMU;
        else if(key == 'T') return lan.express;
        else if(key == 'Z') return lan.direct;
        else return lan.ordinaryTrain;
    }

    //分享模块页面
    setShareView = () => {
        Popup.show(
            <View style={{backgroundColor:COLORS.containerBg}}>
                <Text style={{width:width,textAlign:'center',color:'#999',marginTop:8,fontSize:13}}>{lan.share}</Text>
                <ScrollView 
                    style={{marginTop:12,marginLeft:5,marginRight:5}}
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}>
                    <View style={{justifyContent:'center',alignItems:'center'}}>
                        <TouchableOpacity style={styles.shareItemStyle}>
                            <Icon icon={'0xe694'} color={'#333'} style={{fontSize: 25}} />
                        </TouchableOpacity>
                        <Text style={styles.shareItemText}>{lan.email}</Text>
                    </View>
                    <View style={{justifyContent:'center',alignItems:'center'}}>
                        <TouchableOpacity style={styles.shareItemStyle}>
                            <Icon icon={'0xe66b'} color={'#333'} style={{fontSize: 25}} />
                        </TouchableOpacity>
                        <Text style={styles.shareItemText}>{lan.msg}</Text>
                    </View>
                    <View style={{justifyContent:'center',alignItems:'center'}}>
                        <TouchableOpacity style={styles.shareItemStyle}>
                            <Icon icon={'0xe68d'} color={'#333'} style={{fontSize: 25}} />
                        </TouchableOpacity>
                        <Text style={styles.shareItemText}>{lan.QQ}</Text>
                    </View>
                    <View style={{justifyContent:'center',alignItems:'center'}}>
                        <TouchableOpacity style={styles.shareItemStyle}>
                            <Icon icon={'0xe68e'} color={'#333'} style={{fontSize: 25}} />
                        </TouchableOpacity>
                        <Text style={styles.shareItemText}>{lan.wechat}</Text>
                    </View>
                    <View style={{justifyContent:'center',alignItems:'center'}}>
                        <TouchableOpacity style={styles.shareItemStyle} onPress={()=>this.saveFile()}>
                            <Icon icon={'0xe693'} color={'#333'} style={{fontSize: 25}} />
                        </TouchableOpacity>
                        <Text style={styles.shareItemText}>{lan.download}</Text>
                    </View>
                </ScrollView>
                <TouchableOpacity style={{width:width,height:45,alignItems:'center',
                        justifyContent:'center',marginTop:15,backgroundColor:'#fff'}} onPress={()=>Popup.hide()}>
                    <Text style={{color:'#333',fontSize:15}}>{lan.cancel}</Text>
                </TouchableOpacity>
            </View>,
        { animationType: 'slide-up', maskClosable: false });
    }

    saveFile = () =>{
        Toast.loading("行程单下载中...",60,()=>{
             Toast.info(lan.loadingFail, 3, null, false);
        });
        // let fName =this.state.orderInfo.DepartureDate.replace(/[^0-9]+/g, '');
        // let path = RNFS.CachesDirectoryPath+'/'+fName +'.txt';//RNFS.DocumentDirectoryPath + storage/emulated/0/Android/data
        // RNFS.writeFile(path, JSON.stringify(this.state.orderInfo), 'utf8').then((success) => {
        //     Toast.hide();
        //     alert(path);
        //     Toast.info('已将文件保存于'+path+'目录下', 3, null, false);
        // }).catch((err) => {
        //     Toast.hide();
        //     Toast.info('下载失败\n'+err.message, 3, null, false);
        // });
    }

    toOrderDetail = () => {
            this.props.navigator.push({
                name: 'OrderDetail',
                component: OrderDetail,
                passProps:{
                    // ServiceStaffInfo:{},
                    OrderId:this.state.orderInfo.SOShortNr,
                    BookerID:this.state.orderInfo.BookerID,
                    LoginAccount:this.state.LoginAccount,
                    AccountNo:this.state.AccountNo,
                    // RefreshEvent:()=>{}
                }
            });
    }
}

const styles = StyleSheet.create({
    shareItemStyle:{
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#fff',
        borderRadius:8,
        marginLeft:5,
        marginRight:5,
        width:55,
        height:55,
    },
    shareItemText:{
        color:'#999',
        fontSize:13,
        marginTop:3,
    },
})