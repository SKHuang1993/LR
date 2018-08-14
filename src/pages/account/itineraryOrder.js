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
    TextInput,
} from 'react-native';
import {Tabs,Toast,Popup,} from 'antd-mobile';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';
import OrderModuleView from './orderModuleView';
import{ RestAPI } from '../../utils/yqfws';
import ItineraryItem from './itineraryItem';
import ItineraryOrderItem from './ItineraryOrderItem';
import moment from 'moment';
import NoDataTip from '../../components/noDataTip/index';
import OrderDetail from './orderDetail2';

const TabPane = Tabs.TabPane;
var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();


export default class ItineraryOrder  extends Component {
    constructor(props){
        super(props);
        this.state = {
            time:'',
            personCode:'',
             //全部订单listview关联的数据
            toTravelData: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
             //待审批订单listview关联的数据
             alreadyTravelData: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
             account:this.props.AccountNo,
             companyCode:'',
             activityKeyNum:'1',
             isTriped:true,//已出行
             isTrip:true,//待出行
             isRefresh:true,
             isRefreshed:true,
             isVisTitle:this.props.Visible,
             count:0,

             travelDataNum:0,
             travelDataList:[],
             alreadyDataNum:0,
             alreadyDataList:[],

             travelDataTotal:0,
             alreadyDataTotal:0,
        }
    }

    componentDidMount(){
        // storage.load({ key: 'USERINFO' }).then(val => {
        //     if (val != null) {
        //         let userInfo = JSON.parse(val);
        //         this.state.personCode = userInfo.PersonCode;
        //         this.getToTravelInfo();
        //         this.getAlreadyTravelInfo();
        //     }
        // }).catch(err => {
        //     console.log(err)
        // });
        storage.load({ key: 'BIZACCOUNTINFO' }).then(val => {
            if (val != null) {
                this.state.personCode = JSON.parse(val).MyInfo.Result.Account.PersonCode
                this.state.companyCode = JSON.parse(val).MyInfo.Result.Company.CompanyCode
                this.getToTravelInfo();
                this.getAlreadyTravelInfo();
            }
        }).catch(err => {
            console.log(err)
        });
        
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:'#fff'}}>
                {this.state.isVisTitle ? 
                <Navbar navigator={this.props.navigator} title={"客户行程"} />
                 : null}
                
                <Tabs activeKey={this.state.activityKeyNum} textColor='#999' defaultActiveKey={this.state.activityKeyNum}
                      animated={true} activeTextColor="#333" style={{backgroundColor:'#fff'}}
                      activeUnderlineColor={COLORS.btnBg} onChange={(key)=>this.tabsClickEvent(key)}>
                    <TabPane tab={lan.toTravel} key="1">
                        {this.state.isTrip ?
                        <View style={{backgroundColor:COLORS.containerBg}}>
                            <ListView
                                enableEmptySections = {true}
                                style={{height:height}}
                                dataSource={this.state.toTravelData}
                                renderRow={(rowData,sectionId,rowId)=>this.setTravelView(rowData)}
                                onEndReached={()=>{
                                    if(this.state.travelDataList.length<this.state.travelDataTotal)
                                        this.getToTravelInfo()
                                }}
                                onEndReachedThreshold={10}  
                            />
                        </View>
                        : <View style={{backgroundColor:COLORS.containerBg}}>
                            <NoDataTip noDataState={4} />
                            <View style={{backgroundColor:COLORS.containerBg,height:500}}></View>
                          </View>
                        }
                    </TabPane>
                    <TabPane tab={lan.alreadyTravel} key="2">
                        {this.state.isTriped?
                        <View style={{backgroundColor:COLORS.containerBg}}>
                            <ListView
                                enableEmptySections = {true}
                                dataSource={this.state.alreadyTravelData}
                                renderRow={(rowData,sectionId,rowId)=>this.setTravelView(rowData)}
                                onEndReached={()=>{
                                    if(this.state.alreadyDataList.length<this.state.alreadyDataTotal)
                                        this.getAlreadyTravelInfo()
                                }}
                                onEndReachedThreshold={10}  
                            />
                        </View>
                        :<View style={{backgroundColor:COLORS.containerBg}}>
                            <NoDataTip noDataState={4} />
                            <View style={{backgroundColor:COLORS.containerBg,height:500}}></View>
                        </View>}
                    </TabPane>
                </Tabs>
            </View>
        );
    }

    //获取待出行行程单信息
    getToTravelInfo = () =>{
        this.state.travelDataNum++;
        let endTime = "2025-12-31";
        let startTime = moment().format();
        let param = {
            //"BookerID": this.state.account,//"NE300V43",//
            "BookerCompanyCode": this.state.companyCode,
            "UserCode":this.state.personCode,
            "ProductCategoryID": "2,3,8,9",
            "PageSize": 10,
            "PageCount": this.state.travelDataNum,
            "IsPassengerOutTicket": true,
            "StartDate": startTime,
            "EndDate": endTime
        }
        Toast.loading(lan.loading,180,()=>{
             Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("ABIS.CustomerJourneyByConditionGet",JSON.stringify(param),(value)=>{
            let orderInfo = value;
            if(orderInfo.Code == 0){
                this.state.count++;
                this.state.travelDataTotal = orderInfo.Result.RowCount;
                if(orderInfo.Result.RowCount != 0){
                    this.state.isTrip = true;
                    let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    for(var _v of orderInfo.Result.JourneyInfos)
                        this.state.travelDataList.splice(this.state.travelDataList.length,0,_v);
                    this.state.toTravelData = ds.cloneWithRows(this.state.travelDataList);
                    if(this.state.count >= 2){
                        Toast.hide();
                        this.setState({});
                    }
                }else{
                    this.state.isTrip = false;
                    if(this.state.count >= 2){
                        Toast.hide();
                        this.setState({});
                    }
                } 
            }else{
                this.state.count++;
                Toast.hide();
                Toast.info(value, 5, null, false);
            }
        },(err)=>{
            this.state.count++;
            Toast.hide();
            Toast.info(err,3,null,false);
        })
    }

    //获取已出行行程单信息
    getAlreadyTravelInfo = () =>{
        this.state.alreadyDataNum++;
        let endTime = moment().format();
        let startTime = "2010-01-01";
        let param = {
            //"BookerID": this.state.account,//"NE300V43",//
            "BookerCompanyCode": this.state.companyCode,
            "UserCode":this.state.personCode,
            "ProductCategoryID": "2,3,8,9",
            "PageSize": 10,
            "PageCount": this.state.alreadyDataNum,
            "IsPassengerOutTicket": true,
            "StartDate": startTime,
            "EndDate": endTime,
            "IsDesc":true
        }
        Toast.loading(lan.loading,180,()=>{
             Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("ABIS.CustomerJourneyByConditionGet",JSON.stringify(param),(value)=>{
            let orderInfo = value;
            if(orderInfo.Code == 0){
                Toast.hide();
                this.state.count++;
                this.state.alreadyDataTotal = orderInfo.Result.RowCount;
                if(orderInfo.Result.RowCount != 0){
                    this.state.isTriped = true;
                    let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    for(var _v of orderInfo.Result.JourneyInfos)
                        this.state.alreadyDataList.splice(this.state.alreadyDataList.length,0,_v);
                    this.state.alreadyTravelData = ds.cloneWithRows(this.state.alreadyDataList);
                    if(this.state.count >= 2){
                        Toast.hide();
                        this.setState({});
                    }
                }
                else{
                    Toast.hide();
                    this.state.isTriped = false;
                    if(this.state.count >= 2){
                        Toast.hide();
                        this.setState({});
                    }
                } 
            }else{
                this.state.count++;
                Toast.info(value, 5, null, false);
            }
        },(err)=>{
            this.state.count++;
            Toast.hide();
            Toast.info(err,3,null,false);
        })
    }

    setTravelView = (value) =>{
        return (
            <TouchableOpacity onPress={()=>this.toOrderDetail(value)}>
                <ItineraryOrderItem navigator={this.props.navigator} OrderInfo={value}/>
            </TouchableOpacity>
        );
    }

    //Tabs点击回调时间
    tabsClickEvent = (key) => {
        let ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });        
        if(key == '1'){
            this.state.activityKeyNum = '1';
            // this.setState({
            //     activityKeyNum:'1',
            //     toTravelData:ds.cloneWithRows([]),
            // });
            // this.state.activityKeyNum = '1';
            // this.state.toTravelData = ds.cloneWithRows([]);
            
            // this.getToTravelInfo();
        } else if(key == '2') {
            // this.setState({});
            this.state.activityKeyNum = '2';
            // this.state.alreadyTravelData = ds.cloneWithRows([]);
            // this.getAlreadyTravelInfo();
        }
    }

    //JSon转为map
    jsonToMap = (jsonStr) => {
            JsonUitl.objToStrMap(JSON.parse(jsonStr));
    }
    objToStrMap = (obj) => {
        let strMap = new Map();
        let map = new Map()
        for (let jou of Object.keys(obj)) {
            for(let k of Object.keys(jou)){
                let param = {
                    "CarrierCode": k.CarrierAirline,
                }
                RestAPI.invoke("Base.AirlineGet",JSON.stringify(param),(va)=>{
                    let pInfo = va;
                    if(pInfo.Code == 0){
                        k.CarrierAirline = v.CarrierAirline+"&"+pInfo.Result.Airline.ShortName;
                        // this.state.airName = pInfo.Result.ShortName;
                    }else{
                        Toast.info(va, 3, null, false);
                    }
                    map.set(k,obj[k])
                },(err)=>{
                    Toast.info(err,3,null,false);
                })
            }
            strMap.set(jou,obj[jou]);
        }
        alert(strMap);
        // return strMap;
    }

    toOrderDetail = (v) => {
        let storage = global.storage;
        storage.load({ key: 'BIZACCOUNTINFO' }).then(val =>{
            if(val!=null){
                let userInfo = JSON.parse(val);
                this.state.LoginAccount = (userInfo.Phone == null || userInfo.Phone == '') ? 
                                                    userInfo.Email : userInfo.Phone;
                this.state.AccountNo = userInfo.Account;
                this.props.navigator.push({
                    name: 'OrderDetail',
                    component: OrderDetail,
                    passProps:{
                        OrderId:v.SOShortNr,
                        BookerID:v.BookerID,
                        LoginAccount:(userInfo.Phone == null || userInfo.Phone == '') ? 
                                        userInfo.Email : userInfo.Phone,
                        AccountNo:userInfo.Account,
                        // RefreshEvent:()=>{}
                    }
                });
            }
        }).catch(err => {
                console.log(err)
        });
    }
}