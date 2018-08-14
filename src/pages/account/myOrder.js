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
    InteractionManager,
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

export default class MyOrder  extends Component {
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
             //待审批订单listview关联的数据
             waitApprovalData: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
             //待付款订单listview关联的数据
             waitPayData: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
             //已完成订单listview关联的数据
             finishData: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
            accountNo:this.props.AccountNo,//个人ID
            activityKeyNum:this.props.ActiveKeyNum,
            orderNum:'',//订单号
            passengerName:'',//旅客名字
            orderUser:'',//下单人
            productType:lan.domesticTicket,//产品类型
            productNum:8,//产品类型对应的数字
            startTime:'2010-01-01',//搜索订单的开始时间
            endTime:'',//搜索订单的结束时间
            startValue: undefined,
            endValue: undefined,
            isData:true,
            isWaitArv:true,
            isWaitPay:true,
            isFinish:true,
            count:0,

            foot:0,
            allDataNum:0,
            allDataList:[],
            waitApprovalNum:0,
            waitApprovalList:[],
            waitPayNum:0,
            waitPayList:[],
            finishDataNum:0,
            finishDataList:[],

            allDataTotal:0,
            waitApprovalTotal:0,
            waitPayTotal:0,
            finishDataTotal:0,
        };
    }

    componentDidMount(){
        // if(this.state.activityKeyNum == '1')
            this.getAllOrderInfo();
        // else if(this.state.activityKeyNum == '2') 
            this.getWaitApprovalOrder();
        // else if(this.state.activityKeyNum == '3') 
            this.getWaitPayOrder();
        // else 
            this.getFinishOrder();
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:'#fff'}}>
                <Navbar navigator={this.props.navigator} title={lan.myOrder} rightIcon={'0xe675'}
                        onRightClick={()=>this.searchEventView()}/>
                <Tabs activeKey={this.state.activityKeyNum} textColor='#999' defaultActiveKey={this.state.activityKeyNum}
                      animated={true} activeTextColor="#333"
                      activeUnderlineColor={"#159E7D"} onChange={(key)=>this.tabsClickEvent(key)}>
                    <TabPane tab={"待付款"} key="1">
                        {this.state.isData?
                        <View style={{backgroundColor:COLORS.containerBg}}>
                                <ListView
                                    enableEmptySections = {true}
                                    style={{height:height}}
                                    dataSource={this.state.dataSource}
                                    renderRow={(rowData,sectionID,rowID)=>this.getOrderItemInfo(rowData,rowID)}
                                    onEndReached={()=>{
                                        if(this.state.allDataList.length<this.state.allDataTotal)
                                            this.getAllOrderInfo()
                                    }}
                                    //renderFooter={ this._renderFooter.bind(this) }
                                    onEndReachedThreshold={2}  
                                />
                        </View>
                        :<View style={{backgroundColor:COLORS.containerBg}}>
                            <NoDataTip noDataState={4}/>
                            <View style={{backgroundColor:COLORS.containerBg,height:500}}></View>
                        </View>}
                    </TabPane>
                    <TabPane tab={"未付清"} key="2">
                        {this.state.isWaitArv?
                        <View style={{backgroundColor:COLORS.containerBg}}>
                                <ListView
                                    enableEmptySections = {true}
                                    style={{height:height}}
                                    dataSource={this.state.waitApprovalData}
                                    renderRow={(rowData,sectionID,rowID)=>this.getOrderItemInfo(rowData,rowID)}
                                    onEndReached={()=>{
                                        if(this.state.waitApprovalList.length<this.state.waitApprovalTotal)
                                            this.getWaitApprovalOrder()
                                    }} 
                                    onEndReachedThreshold={10}  
                                />
                        </View>
                        :<View style={{backgroundColor:COLORS.containerBg}}>
                            <NoDataTip noDataState={4}/>
                            <View style={{backgroundColor:COLORS.containerBg,height:500}}></View>
                        </View>}
                    </TabPane>
                    <TabPane tab={"未有委托书"} key="3">
                        {this.state.isWaitPay?
                        <View style={{backgroundColor:COLORS.containerBg}}>
                                <ListView
                                    enableEmptySections = {true}
                                    style={{height:height}}
                                    dataSource={this.state.waitPayData}
                                    renderRow={(rowData,sectionID,rowID)=>this.getOrderItemInfo(rowData,rowID)}
                                    onEndReached={()=>{
                                        if(this.state.waitPayList.length<this.state.waitPayTotal)
                                            this.getWaitPayOrder()
                                    }} 
                                    onEndReachedThreshold={10}  
                                />
                        </View>
                        :<View style={{backgroundColor:COLORS.containerBg}}>
                            <NoDataTip noDataState={4}/>
                            <View style={{backgroundColor:COLORS.containerBg,height:500}}></View>
                        </View>}
                    </TabPane>
                    <TabPane tab={"已有委托书"} key="4">
                        {this.state.isFinish?
                        <View style={{backgroundColor:COLORS.containerBg}}>
                                <ListView
                                    enableEmptySections = {true}
                                    style={{height:height}}
                                    dataSource={this.state.finishData}
                                    renderRow={(rowData,sectionID,rowID)=>this.getOrderItemInfo(rowData,rowID)}
                                    onEndReached={()=>{
                                        if(this.state.finishDataList.length<this.state.finishDataTotal)
                                            this.getFinishOrder()
                                    }}  //this.getAllOrderInfo()
                                    onEndReachedThreshold={10}  
                                />
                        </View>
                        :<View style={{backgroundColor:COLORS.containerBg}}>
                            <NoDataTip noDataState={4}/>
                            <View style={{backgroundColor:COLORS.containerBg,height:500}}></View>
                        </View>}
                    </TabPane>
                </Tabs>
            </View>
        )
    }

    //查找订单方法
    searchEvent = () => {
        let param = {
            "TradeID": this.state.orderNum,
            "PassengerName":this.state.passengerName,
            "BookerID":this.state.accountNo,
            "BookerName": this.state.orderNum == '' ? "" : this.state.orderUser,
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
                    this.state.allDataList=[];
                    this.state.allDataNum = 0;
                    for(var _v of sOrderInfo.Result.Trades)
                        this.state.allDataList.splice(this.state.allDataList.length,0,_v);
                    this.state.dataSource = ds.cloneWithRows(this.state.allDataList);
                    this.setState({});  
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
                <View style={{backgroundColor:COLORS.primary,height:44,alignItems:'center',flexDirection:'row'}}>
                    <TouchableOpacity style={{marginLeft:15,paddingRight:10}} onPress={() => Popup.hide()}>
                        <Text style={{color:'#fff',fontSize:15}}>{lan.cancel}</Text>
                    </TouchableOpacity>
                    <Text style={{flex:1,textAlign:'center',color:'#fff',fontSize:17}}>{lan.screen}</Text>
                    <TouchableOpacity style={{marginRight:15,paddingLeft:10}} onPress={()=>this.searchEvent()}>
                        <Text style={{color:'#fff',fontSize:15}}>{lan.ok}</Text>
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
                <View style={{flexDirection:'row',height:45,alignItems:'center',backgroundColor:'#fff',paddingLeft:15,
                            borderBottomColor:'#ebebeb',borderBottomWidth:1/FLEXBOX.pixel,paddingRight:15}}>
                    <Text style={{color:'#333',fontSize:16,flex:1}}>{lan.productType}</Text>
                    <TouchableOpacity style={{flex:3,flexDirection:'row'}} onPress={()=>this.showActionSheet()}>
                        <Text style={{flex:1,color:'#333',fontSize:16,textAlign:'right'}}>{this.state.productType}</Text>
                        <Icon icon={'0xe677'} color={'#999'} style={{fontSize: 18}} />
                    </TouchableOpacity>
                </View>
                {/*<View style={{backgroundColor:'#ebebeb',height:1/FLEXBOX.pixel}}/>*/}
                {/*<View style={{flexDirection:'row',height:45,alignItems:'center',backgroundColor:'#fff',paddingLeft:15,paddingRight:15}}>
                    <Text style={{color:'#333',fontSize:16,flex:1}}>{lan.startTime}</Text>
                    <TouchableOpacity style={{flex:3,flexDirection:'row'}} onPress={()=>this.searchData()}>
                        <Text style={{flex:1,color:'#333',fontSize:16}}>{this.state.startTime}</Text>
                        <Icon icon={'0xe677'} color={'#999'} style={{fontSize: 18}} />
                    </TouchableOpacity>
                </View>
                <View style={{backgroundColor:'#ebebeb',height:0.8}}/>
                <View style={{flexDirection:'row',height:45,alignItems:'center',backgroundColor:'#fff',paddingLeft:15,paddingRight:15}}>
                    <Text style={{color:'#333',fontSize:16,flex:1}}>{lan.endTime}</Text>
                    <TouchableOpacity style={{flex:3,flexDirection:'row'}} onPress={()=>this.searchData()}>
                        <Text style={{flex:1,color:'#333',fontSize:16}}>{this.state.endTime}</Text>
                        <Icon icon={'0xe677'} color={'#999'} style={{fontSize: 18}} />
                    </TouchableOpacity>
                </View>*/}
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
                    onPress={()=>{this.state.allDataList = [];this.state.allDataNum = -1;this.state.productNum = 8;this.getAllOrderInfo()}}
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

    searchData = () => {
    }

    //Tabs点击回调时间
    tabsClickEvent = (key) => {
        if(key == '1'){
            this.state.activityKeyNum = '1';
            // this.getAllOrderInfo();
        } else if(key == '2') {
            this.state.activityKeyNum = '2';
            // this.getWaitApprovalOrder();
        } else if(key == '3'){
            this.state.activityKeyNum = '3';
            // this.getWaitPayOrder();
        } else{
            this.state.activityKeyNum = '4';
            // this.getFinishOrder();
        } 
    }

    //获取待付款订单的信息
    getAllOrderInfo = () => {
        this.state.allDataNum++;
        let param={
            "StartDate":"2010-01-01",
            "EndDate":moment().format('L'),
            "DocStatusID":3,
            "UserCode": this.state.accountNo,
            "PageCount": this.state.allDataNum,
            "PageSize": 10
        }
        if(this.state.count<4)
            Toast.loading(lan.loading,60,()=>{
                Toast.info(lan.loadingFail, 3, null, false);
            });
        RestAPI.invoke("ABIS.SalesOrderByBookerIDAndDateGet",JSON.stringify(param),(value)=>{
            let orderInfo = value;
            this.state.foot = 0;
            this.state.count++;
            if(orderInfo.Code == 0){
                this.state.allDataTotal = orderInfo.Result.RowCount;
                if(orderInfo.Result.SalesOrders.length>0){
                    this.state.isData = true;
                    this.state.allDataResult = orderInfo.Result.RowCount;
                    let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    for(var _v of orderInfo.Result.SalesOrders)
                        this.state.allDataList.splice(this.state.allDataList.length,0,_v);
                    this.state.dataSource = ds.cloneWithRows(this.state.allDataList);
                    if(this.state.count >= 4){
                        Toast.hide();
                        this.setState({});
                    } 
                }else{
                    this.state.isData = false;
                    if(this.state.count >= 4){
                        Toast.hide();
                        this.setState({});
                    } 
                }
            }else{
                Toast.hide();
                Toast.info(value.Msg, 3, null, false);
            }
        },(err)=>{
            this.state.count++;
            Toast.info(err,3,null,false);
        })
    }

    //获取未付清订单的信息
    getWaitApprovalOrder = () => {
        this.state.waitApprovalNum++;
        let param={
            "StartDate":"2010-01-01",
            "EndDate":moment().format('L'),
            "DocStatusID":27,
            "UserCode": this.state.accountNo,
            "PageCount": this.state.waitApprovalNum,
            "PageSize": 10
        }
        // Toast.loading(lan.loading,60,()=>{
        //      Toast.info(lan.loadingFail, 3, null, false);
        // });
        RestAPI.invoke("ABIS.SalesOrderByBookerIDAndDateGet",JSON.stringify(param),(value)=>{
            let orderInfo = value;
            this.state.count++;
            if(orderInfo.Code == 0){
                this.state.waitApprovalTotal = orderInfo.Result.RowCount;
                if(orderInfo.Result.SalesOrders.length>0){
                    this.state.isWaitArv = true;
                    let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    for(var _v of orderInfo.Result.SalesOrders)
                        this.state.waitApprovalList.splice(this.state.waitApprovalList.length,0,_v);
                    this.state.waitApprovalData = ds.cloneWithRows(this.state.waitApprovalList);
                    if(this.state.count == 4){
                        Toast.hide();
                        this.setState({});
                    } 
                }else{
                    this.state.isWaitArv = false;
                    if(this.state.count == 4){
                        Toast.hide();
                        this.setState({});
                    } 
                }
            }else{
                Toast.hide();
                Toast.info(value.Msg, 3, null, false);
            }
        },(err)=>{
            this.state.count++;
            Toast.info(err,3,null,false);
        })
    }

    //获取未有委托书订单的信息
    getWaitPayOrder = () => {
        this.state.waitPayNum++;
        let param={
            "StartDate":"2010-01-01",
            "EndDate":moment().format('L'),
            "DocStatusID":21,
            "UserCode": this.state.accountNo,
            "PageCount": this.state.waitPayNum,
            "PageSize": 10
        }
        // Toast.loading(lan.loading,60,()=>{
        //      Toast.info(lan.loadingFail, 3, null, false);
        // });
        RestAPI.invoke("ABIS.SalesOrderByBookerIDAndDateGet",JSON.stringify(param),(value)=>{
            let orderInfo = value;
            this.state.count++;
            if(orderInfo.Code == 0){
                this.state.waitPayTotal = orderInfo.Result.RowCount;
                if(orderInfo.Result.SalesOrders.length>0){
                    this.state.isWaitPay = true;
                    let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    for(var _v of orderInfo.Result.SalesOrders)
                        this.state.waitPayList.splice(this.state.waitPayList.length,0,_v);
                    this.state.waitPayData = ds.cloneWithRows(this.state.waitPayList);
                    if(this.state.count == 4){
                        Toast.hide();
                        this.setState({});
                    } 
                }else{
                    this.state.isWaitPay = false;
                    if(this.state.count == 4){
                        Toast.hide();
                        this.setState({});
                    } 
                }
            }else{
                Toast.hide();
                Toast.info(value.Msg, 3, null, false);
            }
        },(err)=>{
            this.state.count++;
            Toast.info(err,3,null,false);
        })
    }

    //获取已有委托书订单的信息
    getFinishOrder = () => {
        this.state.finishDataNum++;
        let param={
            "StartDate":"2010-01-01",
            "EndDate":moment().format('L'),
            "DocStatusID":5,
            "UserCode": this.state.accountNo,
            "PageCount": this.state.finishDataNum,
            "PageSize": 10
        }
        // Toast.loading(lan.loading,60,()=>{
        //      Toast.info(lan.loadingFail, 3, null, false);
        // });
        RestAPI.invoke("ABIS.SalesOrderByBookerIDAndDateGet",JSON.stringify(param),(value)=>{
            let orderInfo = value;
            this.state.count++;
            if(orderInfo.Code == 0){
                this.state.finishDataTotal = orderInfo.Result.RowCount;
                if(orderInfo.Result.SalesOrders.length>0){
                    this.state.isFinish = true;
                    let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    for(var _v of orderInfo.Result.SalesOrders)
                        this.state.finishDataList.splice(this.state.finishDataList.length,0,_v);
                    this.state.finishData = ds.cloneWithRows(this.state.finishDataList);
                    if(this.state.count == 4){
                        Toast.hide();
                        this.setState({});
                    } 
                }else{
                    this.state.isFinish = false;
                    if(this.state.count == 4){
                        Toast.hide();
                        this.setState({});
                    } 
                }
            }else{
                Toast.hide();
                Toast.info(value.Msg, 3, null, false);
            }
        },(err)=>{
            this.state.count++;
            Toast.info(err,3,null,false);
        })
    }

    _toEnd() {
        const { reducer } = this.props;
        //ListView滚动到底部，根据是否正在加载更多 是否正在刷新 是否已加载全部来判断是否执行加载更多
        // if (reducer.isLoadingMore || reducer.products.length >= reducer.totalProductCount || reducer.isRefreshing) {
        //       return;
        // };
        InteractionManager.runAfterInteractions(() => {
            this.getAllOrderInfo();
        });
    }

    _renderFooter() {  
        //通过当前product数量和刷新状态（是否正在下拉刷新）来判断footer的显示
        if (this.state.dataSource.length < 1 ) {
            return null
        };
        if (this.state.dataSource.length <30) {
            //还有更多，默认显示‘正在加载更多...’
            return (  
                <View style={{height:40,alignItems:'center',justifyContent:'center',}}>  
                    <Text style={{color:'#999999',fontSize:12,marginTop:10}}>  
                       {lan.loading}
                    </Text>    
                </View>
            );  
        }else{
            // 加载全部
            return (
                <View style={{height:40,alignItems:'center',justifyContent:'flex-start',}}>  
                    <Text style={{color:'#999999',fontSize:12,marginTop:10}}>  
                        {lan.loaded}
                    </Text>  
                </View>
            );
        }
    }  

    getOrderItemInfo = (value,i) => {
        return <OrderModuleView  itemInfo={value} navigator={this.props.navigator} 
                    AccountNo={this.state.accountNo}
                    RefreshEvent={()=>{
                        let ds = new ListView.DataSource({
                            rowHasChanged: (row1, row2) => row1 !== row2,
                        });
                        if(this.state.activityKeyNum == 1){
                            this.state.allDataList[i].IsAllowClose = false;
                            this.state.allDataList[i].StatusID = 10;
                            this.state.dataSource = ds.cloneWithRows(this.state.allDataList);
                        }else if(this.state.activityKeyNum == 2){
                            this.state.waitApprovalList[i].IsAllowClose = false;
                            this.state.waitApprovalList[i].StatusID = 10;
                            this.state.waitApprovalData = ds.cloneWithRows(this.state.allDataList);
                        }else if(this.state.activityKeyNum == 3){
                            this.state.waitPayList[i].IsAllowClose = false;
                            this.state.waitPayList[i].StatusID = 10;
                            this.state.waitPayData = ds.cloneWithRows(this.state.allDataList);
                        }else{
                            this.state.finishDataList[i].IsAllowClose = false;
                            this.state.finishDataList[i].StatusID = 10;
                            this.state.finishData = ds.cloneWithRows(this.state.allDataList);
                        }
                        this.setState({})
                    }}
            />
    }

    //js数组去重操作
    unique = (arr)=> {
        var newArr = [];
        for(var i =0;i<arr.length;i++){
        　　 if(newArr.indexOf(arr[i]) == -1){
        　　　　newArr.push(arr[i]);
        　　}
        }
        return newArr;
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