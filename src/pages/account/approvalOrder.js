import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    ListView,
    ScrollView,
    Platform,
    BackAndroid,
    TouchableOpacity,
    TextInput
} from 'react-native';
import {Tabs,Toast,Popup,DatePicker,List} from 'antd-mobile';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import ApprovalItem from './approvalItem';
import{ RestAPI } from '../../utils/yqfws'
import NoDataTip from '../../components/noDataTip/index';
import Form from '../../components/form/';

import moment from 'moment';
import 'moment/locale/zh-cn';

const defaultDate = moment().locale('zh-cn').utcOffset(8);
const minDate = moment('2010-01-01 +0800', 'YYYY-MM-DD Z').utcOffset(8);
const getField = new Form().getField;

const TabPane = Tabs.TabPane;
var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class ApprovalOrder  extends Component {
    constructor(props) {
        super(props);
        this.state={
            //全部订单listview关联的数据
            dataSource: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
             //待审批订单listview关联的数据
             waitApprovalData: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
             companyID:this.props.CompanyID,//公司代码
             accountNo:this.props.AccountNo,//个人ID
             activityKeyNum:1,
             approvalType:1,
             isData:true,
             isWaitData:true,
             orderNum:'',//订单号
             orderUser:'',//下单人
             productType:lan.domesticTicket,//产品类型
             productNum:8,//产品类型对应的数字
             startTime:'2010-01-01',//搜索订单的开始时间
             endTime:'2017-03-15',//搜索订单的结束时间
             startValue: undefined,
             endValue: undefined,
             count:0,

             waitApprovalNum:-1,
             waitApprovalList:[],
             approvalNum:-1,
             approvalList:[],

             waitApprovalTotal:0,
             approvalTotal:0,
        };
    }

    componentDidMount(){
        this.getWaitApprovalOrder();
        this.getAllOrderInfo();
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:'#fff'}}>
                <Navbar navigator={this.props.navigator} title={lan.myApproval} rightIcon={'0xe675'}
                        onRightClick={()=>this.searchEventView()}/>
                <Tabs activeKey={this.state.activityKeyNum} textColor='#999' defaultActiveKey={this.state.activityKeyNum}
                      animated={true} activeTextColor="#333"
                      activeUnderlineColor={COLORS.btnBg} onChange={(key)=>this.tabsClickEvent(key)}>
                    <TabPane tab={lan.waitApproval} key="1">
                        {this.state.isWaitData?
                         <View style={{backgroundColor:COLORS.containerBg}}>
                             <ListView
                                style={{height:height}}
                                enableEmptySections = {true}
                                dataSource={this.state.waitApprovalData}
                                renderRow={this.getWaitOrderItemInfo.bind(this)}
                                onEndReached={()=>{
                                    if(this.state.waitApprovalList.length<this.state.waitApprovalTotal)
                                        this.getWaitApprovalOrder()
                                }}  //this.getAllOrderInfo()
                                onEndReachedThreshold={10}  
                            />
                        </View>
                        :<View style={{backgroundColor:COLORS.containerBg}}>
                            <NoDataTip noDataState={4}/>
                            <View style={{backgroundColor:COLORS.containerBg,height:500}}></View>
                        </View>}
                    </TabPane>
                    <TabPane tab={lan.finished} key="2">
                        {this.state.isData ? 
                         <View style={{backgroundColor:COLORS.containerBg}}>
                             <ListView
                                style={{height:height}}
                                enableEmptySections = {true}
                                dataSource={this.state.dataSource}
                                renderRow={this.getFinishOrderItemInfo.bind(this)}
                                onEndReached={()=>{
                                    if(this.state.approvalList.length<this.state.approvalTotal)
                                        this.getAllOrderInfo()
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
                {/*<View style={{backgroundColor:'#ebebeb',height:0.8}}/>*/}
                <View style={{flexDirection:'row',height:45,alignItems:'center',backgroundColor:'#fff',paddingLeft:15,
                            borderBottomColor:'#ebebeb',borderBottomWidth:1/FLEXBOX.pixel,paddingRight:15}}>
                    <Text style={{color:'#333',fontSize:16,flex:1}}>{lan.orderUser}</Text>
                    <TextInput style={{flex:3,fontSize:16,textAlign:'right'}}
                                placeholder={lan.inputOrderUser} placeholderTextColor='#ccc' 
                                onChangeText={(val)=>this.state.orderUser = val}
                                underlineColorAndroid='#fff'
                                selectionColor='#333' />
                </View>
                {/*<View style={{backgroundColor:'#ebebeb',height:0.8}}/>*/}
                <View style={{flexDirection:'row',height:45,alignItems:'center',backgroundColor:'#fff',paddingLeft:15,
                            borderBottomColor:'#ebebeb',borderBottomWidth:1/FLEXBOX.pixel,paddingRight:15}}>
                    <Text style={{color:'#333',fontSize:16,flex:1}}>{lan.productType}</Text>
                    <TouchableOpacity style={{flex:3,flexDirection:'row'}} onPress={()=>this.showActionSheet()}>
                        <Text style={{flex:1,color:'#333',fontSize:16,textAlign:'right'}}>{this.state.productType}</Text>
                        <Icon icon={'0xe677'} color={'#999'} style={{fontSize: 18}} />
                    </TouchableOpacity>
                </View>
                {/*<View style={{backgroundColor:'#ebebeb',height:0.8}}/>*/}
                <DatePicker
                    defaultDate={defaultDate}
                    value={this.state.startValue}
                    mode="date"
                    minDate={this.date1MinDate || (this.date1MinDate = moment('2011-01-01','YYYY-MM-DD'))}
                    maxDate={this.date1MaxDate || (this.date1MaxDate = moment(moment().format('L'),'YYYY-MM-DD'))}
                    onChange={(val)=>{this.state.startValue = val;this.state.startTime = moment(val).format().substring(0,10);this.searchEventView()}}>
                    <List.Item arrow="horizontal">{lan.startTime}</List.Item>
                </DatePicker>
                {/*<View style={{backgroundColor:'#ebebeb',height:0.8}}/>*/}
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
                    onPress={()=>{
                        this.state.productNum = 8;
                        if(this.state.activityKeyNum == 1){
                            this.state.waitApprovalNum=-1;
                            this.state.waitApprovalList=[];
                            this.getWaitApprovalOrder();
                        }else{
                            this.state.approvalNum = -1,
                            this.state.approvalList = [],
                            this.getAllOrderInfo()
                        }
                    }}
                ><Text style={{fontSize:16,color:'#333'}}>全部</Text></TouchableOpacity>
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
                <View style={{height:0.8,backgroundColor:'#ebebeb',}}/>
            </View>
            ,{ animationType: 'slide-up', maskClosable: false }
        );
    }

    //查找订单方法
    searchEvent = () => {
        let p = this.state.activityKeyNum == 1 ?'PSOCARPUserCode':'PSOCAAUserCode';
        let param = {
            "BookerCompanyCode": this.state.companyID,
            p: this.state.accountNo,
            "TradeID": this.state.orderNum,
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
            //    alert(JSON.stringify(test))
               if(sOrderInfo.Result.Trades.length == 0){
                   Toast.info(lan.noFind,3,null,false);
               }else{
                   let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    // Toast.info(sOrderInfo.Result.TotalResults,5,null,false);
                    this.state.activityKeyNum = '1';
                    this.setState({
                        dataSource: ds.cloneWithRows(sOrderInfo.Result.Trades),
                    });  
               } 
            }else{
                Toast.info(test, 3, null, false);
            }
        },(err)=>{
            Toast.info(err, 5, null, false);
        });
    }

    //Tabs点击回调时间
    tabsClickEvent = (key) => {
        if(key == '1'){
            this.state.activityKeyNum = '1';
            // this.getWaitApprovalOrder();
        } else{
            this.state.activityKeyNum = '2';
            // this.getAllOrderInfo();
        } 
    }

    //获取已完成审批的订单信息
    getAllOrderInfo = () => {
        this.state.approvalNum++;
        let param={
            "BookerCompanyCode": this.state.companyID,
            "PSOCAAUserCode": this.state.accountNo,
            "PageNo": this.state.approvalNum,
            "PageSize": 10
        }
        if(this.state.count<2)
        Toast.loading(lan.loading,60,()=>{
             Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("ABIS.BizSimTradeGetList",JSON.stringify(param),(value)=>{
            this.state.count++;
            try {
                let orderInfo = value;
                if(orderInfo.Code == 0){
                    this.state.approvalTotal = orderInfo.Result.TotalResults;
                    if(orderInfo.Result.TotalResults>0){
                        let ds = new ListView.DataSource({
                            rowHasChanged: (row1, row2) => row1 !== row2,
                        });
                        this.state.isData = true;
                        for(var _v of orderInfo.Result.Trades)
                            this.state.approvalList.splice(this.state.approvalList.length,0,_v);
                        this.state.dataSource = ds.cloneWithRows(this.state.approvalList);
                        this.state.approvalType = 2;
                        if(this.state.count>=2){
                            Toast.hide();
                            this.setState({});
                        } 
                    }else{
                        this.state.isData = false;
                        if(this.state.count>=2){
                            Toast.hide();
                            this.setState({});
                        } 
                    }
                }else{
                    Toast.hide();
                    Toast.info(value.Msg, 3, null, false);
                }
            } catch (error) {
                console.log(error);
            }
        },(err)=>{
            this.state.count++;
            Toast.info(err,3,null,false);
        })
    }

    //获取待我审批订单的信息
    getWaitApprovalOrder = () => {
        this.state.waitApprovalNum++;
        let param={
            "BookerCompanyCode": this.state.companyID,
            "PSOCARPUserCode": this.state.accountNo,
            "PageNo": this.state.waitApprovalNum,
            "PageSize": 10
        }
        if(this.state.count<2 )
        Toast.loading(lan.loading,60,()=>{
             Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("ABIS.BizSimTradeGetList",JSON.stringify(param),(value)=>{
            this.state.count++;
            try {
                let orderInfo = value;
                if(orderInfo.Code == 0){
                    this.state.waitApprovalTotal = orderInfo.Result.TotalResults;
                    if(orderInfo.Result.Trades.length>0){
                        let ds = new ListView.DataSource({
                            rowHasChanged: (row1, row2) => row1 !== row2,
                        });
                        this.state.isWaitData = true;
                        for(var _v of orderInfo.Result.Trades)
                            this.state.waitApprovalList.splice(this.state.waitApprovalList.length,0,_v);
                        this.state.waitApprovalData = ds.cloneWithRows(this.state.waitApprovalList);
                        this.state.approvalType = 1;
                        if(this.state.count>=2){
                            Toast.hide();
                            this.setState({});
                        } 
                    }else{
                        this.state.isWaitData = false;
                        if(this.state.count>=2){
                            Toast.hide();
                            this.setState({});
                        } 
                    }
                    
                }else{
                    Toast.hide();
                    Toast.info(value.Msg, 3, null, false);
                }
            } catch (error) {
                console.log(error);
            }
        },(err)=>{
            this.state.count++;
            Toast.info(err,3,null,false);
        })
    }

    getWaitOrderItemInfo = (value) => {
        return <ApprovalItem  navigator={this.props.navigator} 
                                itemInfo={value} 
                                AccountNo={this.state.accountNo}
                                approvalType={1}
                                RefreshEvent={(content)=>{
                                    this.state.count = 0;
                                    this.state.waitApprovalNum = -1;
                                    this.state.approvalNum = -1;
                                    this.state.waitApprovalList = [];
                                    this.state.approvalList = [];
                                    this.props.RefreshEvent();
                                    this.getWaitApprovalOrder();
                                    this.getAllOrderInfo();
                                    Toast.success(content, 3);
                    }}/>
    }

    getFinishOrderItemInfo = (value) => {
        return <ApprovalItem  navigator={this.props.navigator} 
                                itemInfo={value} 
                                AccountNo={this.state.accountNo}
                                CompanyApproveTypeID={1}
                                approvalType={2}/>
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