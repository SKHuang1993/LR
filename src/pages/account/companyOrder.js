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
import {Tabs,Toast,Popup } from 'antd-mobile';
import DatePicker from '../../components/date-picker';
import List from '../../components/list';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import OrderModuleView from './orderModuleView';
import{ RestAPI } from '../../utils/yqfws'
import Form from '../../components/form/';
import NoDataTip from '../../components/noDataTip/index'

const TabPane = Tabs.TabPane;
var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

import moment from 'moment';
import 'moment/locale/zh-cn';

const defaultDate = moment().locale('zh-cn').utcOffset(8);
const minDate = moment('2010-01-01 +0800', 'YYYY-MM-DD Z').utcOffset(8);
const getField = new Form().getField;

export default class CompanyOrder  extends Component {
    constructor(props) {
        super(props);
         this.onChange = (value) => {
            this.setState({ value });
        };
        this.state={
            //全部订单listview关联的数据
            dataSource: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
             depSource: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
            accountNo:this.props.AccountNo,//个人ID
            activityKeyNum:this.props.ActiveKeyNum,
            orderNum:'',//订单号
            passengerName:'',//旅客姓名
            orderUser:'',//下单人
            productType:lan.domesticTicket,//产品类型
            productNum:8,//产品类型对应的数字
            startTime:'2010-01-01',//搜索订单的开始时间
            endTime:'',//搜索订单的结束时间
            value: undefined,
            startValue: undefined,
            endValue: undefined,
            departmentCode:this.props.DepartmentCode,//公司部门代码
            choiceDepCode:this.props.DepartmentCode,
            choiceDepName:'',
            isData:true,//判断该类型是否有订单数据
            pageCount:-1,
            orderDataList:[],
            orderDataTotal:0
        };
    }

    componentDidMount(){
        this.getAllOrderInfo();
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:'#fff'}}>
                <Navbar navigator={this.props.navigator} title={lan.companyOrder} rightIcon={'0xe675'}
                        onRightClick={()=>this.searchEventView()}/>
                {this.state.isData?
                <View style={{backgroundColor:COLORS.containerBg}}>
                        <ListView
                            enableEmptySections = {true}
                            style={{marginBottom:10,height:height}}
                            dataSource={this.state.dataSource}
                            renderRow={(rowData,sectionID,rowID)=>this.getOrderItemInfo(rowData,rowID)}
                            onEndReached={()=>{
                                if(this.state.orderDataList.length<this.state.orderDataTotal)
                                    this.getAllOrderInfo()
                            }}
                            onEndReachedThreshold={10}  
                        />
                </View>
                :<View style={{backgroundColor:COLORS.containerBg}}>
                    <NoDataTip noDataState={4}/>
                    <View style={{backgroundColor:COLORS.containerBg,height:500}}></View>
                </View>}
            </View>
        )
    }

    //查找订单方法
    searchEvent = () => {
        let param = {
            "TradeID": this.state.orderNum,
            "PassengerName":this.state.passengerName,
            "BookerName": this.state.orderNum == '' ? "" : this.state.orderUser,
            "BookerDepartmentCode":this.state.choiceDepCode,
            "OrderType": this.state.productNum,
            "StartDate":this.state.orderNum == '' ? this.state.startTime : "",
            "EndDate":this.state.orderNum == '' ? this.state.endTime : "",
        };
        Toast.loading(lan.loading,60,()=>{
            Toast.info(lan.loadingFail, 5, null, false);
        });
        RestAPI.invoke("ABIS.BizSimTradeGetList",JSON.stringify(param),(test)=>{
            Toast.hide();
            let sOrderInfo = test;
            if(sOrderInfo.Code == 0){
               Toast.hide();
               if(sOrderInfo.Result.Trades.length == 0){
                   Toast.info(lan.noFind,3,null,false);
               }else{
                   let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    this.state.activityKeyNum = '1';
                    this.state.pageCount = 0;
                    this.state.orderDataList = [];
                    for(var _v of sOrderInfo.Result.Trades)
                        this.state.orderDataList.splice(this.state.orderDataList.length,0,_v);
                    this.setState({
                        dataSource: ds.cloneWithRows(this.state.orderDataList),
                    });  
               } 
            }else{
                Toast.info(test, 3, null, false);
            }
        },(err)=>{
            Toast.info(err, 5, null, false);
        });
    }

    //筛选界面
    searchEventView = () => {
        Popup.show(
            <View>
                <View style={{backgroundColor:COLORS.primary,height:44,alignItems:'center',flexDirection:'row',}}>
                    <TouchableOpacity style={{marginLeft:15,paddingRight:10}} onPress={() => Popup.hide()}>
                        <Text style={{color:'#fff',fontSize:15}}>{lan.cancel}</Text>
                    </TouchableOpacity>
                    <Text style={{flex:1,textAlign:'center',color:'#fff',fontSize:17}}>{lan.screen}</Text>
                    <TouchableOpacity style={{marginRight:15,paddingLeft:10}} onPress={()=>this.searchEvent()}>
                        <Text style={{color:'#fff',fontSize:15}}>{lan.ok}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flexDirection:'row',height:45,alignItems:'center',backgroundColor:'#fff',paddingLeft:15,
                                borderBottomColor:'#ebebeb',borderBottomWidth:1/FLEXBOX.pixel,paddingRight:10}}>
                    <Text style={{color:'#333',fontSize:16,flex:1}}>{lan.departmentName}</Text>
                    <TouchableOpacity style={{flex:3,flexDirection:'row'}} onPress={()=>this.getDepartmentInfo()}>
                        <Text style={{flex:1,color:'#333',fontSize:16,textAlign:'right'}}>{this.state.choiceDepName}</Text>
                        <Icon icon={'0xe677'} color={'#999'} style={{fontSize: 18}} />
                    </TouchableOpacity>
                </View>
                <View style={{flexDirection:'row',height:45,alignItems:'center',backgroundColor:'#fff',paddingLeft:15,
                            borderBottomColor:'#ebebeb',borderBottomWidth:1/FLEXBOX.pixel,paddingRight:15}}>
                    <Text style={{color:'#333',fontSize:16,flex:1}}>{lan.orderNum}</Text>
                    <TextInput style={{flex:3,fontSize:16,textAlign:'right'}} 
                                autoCapitalize="characters" keyboardType="email-address"
                                placeholder={lan.inputOrderNum} placeholderTextColor='#ccc' 
                                onChangeText={(val)=>this.state.orderNum = val}
                                underlineColorAndroid='#fff'
                                selectionColor='#333' />
                </View>
                <View style={{flexDirection:'row',height:45,alignItems:'center',backgroundColor:'#fff',paddingLeft:15,
                            borderBottomColor:'#ebebeb',borderBottomWidth:1/FLEXBOX.pixel,paddingRight:15}}>
                    <Text style={{color:'#333',fontSize:16,flex:1}}>{lan.passenger}</Text>
                    <TextInput style={{flex:3,fontSize:16,textAlign:'right'}} 
                                autoCapitalize="characters"
                                placeholder={lan.passengers_name} placeholderTextColor='#ccc' 
                                onChangeText={(val)=>this.state.passengerName = val}
                                underlineColorAndroid='#fff'
                                selectionColor='#333' />
                </View>
                {/*<View style={{backgroundColor:'#ebebeb',height:1/FLEXBOX.pixel}}/>*/}
                <View style={{flexDirection:'row',height:45,alignItems:'center',backgroundColor:'#fff',paddingLeft:15,
                            borderBottomColor:'#ebebeb',borderBottomWidth:1/FLEXBOX.pixel,paddingRight:15}}>
                    <Text style={{color:'#333',fontSize:16,flex:1}}>{lan.orderUser}</Text>
                    <TextInput style={{flex:3,fontSize:16,textAlign:'right'}}
                                placeholder={lan.inputOrderUser} placeholderTextColor='#ccc' 
                                onChangeText={(val)=>this.state.orderUser = val}
                                underlineColorAndroid='#fff'
                                selectionColor='#333' />
                </View>
                {/*<View style={{backgroundColor:'#ebebeb',height:1/FLEXBOX.pixel}}/>*/}
                <View style={{flexDirection:'row',height:45,alignItems:'center',backgroundColor:'#fff',
                        borderBottomColor:'#ebebeb',borderBottomWidth:1/FLEXBOX.pixel,paddingLeft:15,paddingRight:10}}>
                    <Text style={{color:'#333',fontSize:16,flex:1}}>{lan.productType}</Text>
                    <TouchableOpacity style={{flex:3,flexDirection:'row'}} onPress={()=>this.showActionSheet()}>
                        <Text style={{flex:1,color:'#333',fontSize:16,textAlign:'right'}}>{this.state.productType}</Text>
                        <Icon icon={'0xe677'} color={'#999'} style={{fontSize: 18}} />
                    </TouchableOpacity>
                </View>
                {/*<View style={{backgroundColor:'#ebebeb',height:1/FLEXBOX.pixel}}/>*/}
                <DatePicker
                    defaultDate={defaultDate}
                    value={this.state.startValue}
                    mode="date"
                    minDate={this.date1MinDate || (this.date1MinDate = moment('2011-01-01','YYYY-MM-DD'))}
                    maxDate={this.date1MaxDate || (this.date1MaxDate = moment(moment().format('L'),'YYYY-MM-DD'))}
                    onChange={(val)=>{this.state.startValue = val;this.state.startTime = moment(val).format().substring(0,10);this.searchEventView()}}>
                    <List.Item arrow="horizontal">{lan.startTime}</List.Item>
                </DatePicker>
                <DatePicker
                    defaultDate={defaultDate}
                    value={this.state.endValue}
                    mode="date"
                    minDate={this.date1MinDate || (this.date1MinDate = moment(this.state.startTime,'YYYY-MM-DD'))}
                    maxDate={this.date1MaxDate || (this.date1MaxDate = moment(moment().format('L'),'YYYY-MM-DD'))}
                    onChange={(val)=>{this.state.endValue = val;this.state.endTime = moment(val).format().substring(0,10);this.searchEventView()}}>
                    <List.Item arrow="horizontal">{lan.endTime}</List.Item>
                </DatePicker>
            </View>,
        { animationType: 'slide-up', maskClosable: false });
    }

    //产品类型选择界面
    showActionSheet = () => {
        Popup.show(
            <View>
                <TouchableOpacity style={{height:45,alignItems:'center',justifyContent:'center'}}
                    onPress={()=>{this.state.orderDataList = [];this.state.pageCount = -1;this.state.productNum = 8;this.getAllOrderInfo()}}
                ><Text style={{fontSize:16,color:'#333'}}>{lan.all}</Text></TouchableOpacity>
                <View style={{height:1/FLEXBOX.pixel,backgroundColor:'#ebebeb'}}/>
                <TouchableOpacity style={{height:45,alignItems:'center',justifyContent:'center'}}
                    onPress={()=>{this.state.productType = lan.domesticTicket;this.state.productNum = 8;this.searchEventView()}}
                ><Text style={{fontSize:16,color:'#333'}}>{lan.domesticTicket}</Text></TouchableOpacity>
                <View style={{height:1/FLEXBOX.pixel,backgroundColor:'#ebebeb'}}/>
                <TouchableOpacity style={{height:45,alignItems:'center',justifyContent:'center'}}
                    onPress={()=>{this.state.productType = lan.internaTicket;this.state.productNum = 9;this.searchEventView()}}
                ><Text style={{fontSize:16,color:'#333'}}>{lan.internaTicket}</Text></TouchableOpacity>
                <View style={{height:1/FLEXBOX.pixel,backgroundColor:'#ebebeb'}}/>
                <TouchableOpacity style={{height:45,alignItems:'center',justifyContent:'center'}}
                    onPress={()=>{this.state.productType = lan.hotel;this.state.productNum = 2;this.searchEventView()}}
                ><Text style={{fontSize:16,color:'#333'}}>{lan.hotel}</Text></TouchableOpacity>
                <View style={{height:1/FLEXBOX.pixel,backgroundColor:'#ebebeb'}}/>
                <TouchableOpacity style={{height:45,alignItems:'center',justifyContent:'center'}}
                    onPress={()=>{this.state.productType = lan.trainTicket;this.state.productNum = 3;this.searchEventView()}}
                ><Text style={{fontSize:16,color:'#333'}}>{lan.trainTicket}</Text></TouchableOpacity>
                <View style={{height:1/FLEXBOX.pixel,backgroundColor:'#ebebeb'}}/>
                <TouchableOpacity style={{height:45,alignItems:'center',justifyContent:'center'}}
                    onPress={()=>{this.state.productType = lan.insurance;this.state.productNum = 4;this.searchEventView()}}
                ><Text style={{fontSize:16,color:'#333'}}>{lan.insurance}</Text></TouchableOpacity>
                <View style={{height:1/FLEXBOX.pixel,backgroundColor:'#ebebeb'}}/>
                <TouchableOpacity style={{height:45,alignItems:'center',justifyContent:'center'}}
                    onPress={()=>{this.state.productType = lan.visa;this.state.productNum = 5;this.searchEventView()}}
                ><Text style={{fontSize:16,color:'#333'}}>{lan.visa}</Text></TouchableOpacity>
                <View style={{height:1/FLEXBOX.pixel,backgroundColor:'#ebebeb'}}/>
                <TouchableOpacity style={{height:45,alignItems:'center',justifyContent:'center'}}
                    onPress={()=>{this.state.productType = '';this.searchEventView()}}
                ><Text style={{fontSize:16,color:COLORS.btnBg}}>{lan.cancel}</Text></TouchableOpacity>
                <View style={{height:1/FLEXBOX.pixel,backgroundColor:'#ebebeb',}}/>
            </View>
            ,{ animationType: 'slide-up', maskClosable: false }
        );
  }

    //获取全部订单的信息
    getAllOrderInfo = () => {
        this.state.pageCount++;
        let param={
            "BookerDepartmentCode": this.state.departmentCode,
            "PageNo": this.state.pageCount,
            "PageSize": 10
        }
        if(this.state.pageCount<1)
            Toast.loading(lan.loading,60,()=>{
                Toast.info(lan.loadingFail, 3, null, false);
            });
        RestAPI.invoke("ABIS.BizSimTradeGetList",JSON.stringify(param),(value)=>{
            let orderInfo = value;
            Toast.hide();
            if(orderInfo.Code == 0){
                this.state.orderDataTotal = orderInfo.Result.TotalResults;
                if(orderInfo.Result.Trades.length>0){
                    this.state.isData = true;
                    let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    for(var _v of orderInfo.Result.Trades)
                        this.state.orderDataList.splice(this.state.orderDataList.length,0,_v);
                    this.state.dataSource = ds.cloneWithRows(this.state.orderDataList);
                }else{
                    this.state.isData = false;
                }
                this.setState({});
            }else{
                Toast.info(value, 3, null, false);
            }
        },(err)=>{
            Toast.info(err,3,null,false);
        })
    }

    //获得所有的部门
    getDepartmentInfo= ()=>{
        let param = {
            "CompanyCode": this.props.CompanyCode
        }
        Toast.loading(lan.loading,60,()=>{
             Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("CRM.DeparmentGetList",JSON.stringify(param),(value)=>{
            let userInfo = value;
            if(userInfo.Code == 0){
                let ds = new ListView.DataSource({
                    rowHasChanged: (row1, row2) => row1 !== row2,
                });
                let dCode=[];
                for(var _v of userInfo.Result.Deparments){
                    if(this.state.departmentCode.indexOf(_v.DepartmentCode) >= 0)
                        dCode.splice(dCode.length,0,_v)
                }
                this.setState({
                    depSource:ds.cloneWithRows(dCode),
                });
                Toast.hide();
                Popup.show(
                    this.departmentList() ,{animationType:'slide-up'}
                );
            }else{
                Toast.info(value, 3, null, false);
            }
        },(err)=>{
            Toast.info(err,3,null,false);
        })
    }

    //适配部门list的内容
    renderDepart=(depInfo)=>{
        return (
             <TouchableOpacity onPress={()=>{
                 this.state.choiceDepCode = depInfo.DepartmentCode;
                 this.state.choiceDepName = depInfo.NameCn;
                 this.searchEventView();
                 }}> 
                 <Text style={{fontSize:16,color:'#333',padding:15,textAlign:'center'}}>{depInfo.NameCn}</Text>
                 <View style={{backgroundColor:'#ebebeb',height:1/FLEXBOX.pixel}}/>
            </TouchableOpacity>
         );
    }

    //部门列表样式
    departmentList = ()=>{
        return(
            <View style={{height:300}}>
                <View style={{padding:15,flexDirection:'row',backgroundColor:COLORS.primary}}>
                    <Text style={{flex:1,fontSize:16,color:'#fff'}}>{lan.theDeparment}</Text>
                    <Text style={{textAlign:'right',fontSize:15,color:'#fff'}} onPress={()=>{this.searchEventView()}}>{lan.cancel}</Text>
                </View>
                
                <ListView
                    dataSource={this.state.depSource}
                    renderRow={this.renderDepart.bind(this)}
                    style={styles.listView}
                />
            </View>
        )
    }

    getOrderItemInfo = (value,i) => {
        if(value.BookerID != this.state.accountNo){
            value.StatusID = 10;
            value.IsAllowClose = false;
        }
        return <OrderModuleView  itemInfo={value} navigator={this.props.navigator}
                                AccountNo={this.state.accountNo}
                                RefreshEvent={()=>{
                                    let ds = new ListView.DataSource({
                                        rowHasChanged: (row1, row2) => row1 !== row2,
                                    });
                                    this.state.orderDataList[i].IsAllowClose = false;
                                    this.state.orderDataList[i].StatusID = 10;
                                    this.state.dataSource = ds.cloneWithRows(this.state.orderDataList);
                                    this.setState({})
                                }}/>
    }

    componentWillMount(){
         if(Platform.OS === 'android'){
             BackAndroid.addEventListener('hardwareBackPress',this.onBackAndroid);
         };
     }

     componentWillUnmount(){
         if(Platform.OS === 'android'){
             BackAndroid.removeEventListener('hardwareBackPress',this.onBackAndroid);
         }
     }
     onBackAndroid = ()=>{
        const {navigator} = this.props;
         if(navigator){
             navigator.pop();
             return true;
         }
         return false;
     }
}

const styles = StyleSheet.create({
    milescardViewStyle:{
        flexDirection:'row',
        backgroundColor:"#fff",
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
        paddingBottom:10,
    },
    viewStyle:{
        alignItems: 'center',
        backgroundColor:COLORS.containerBg,
        height:height,
    },
})