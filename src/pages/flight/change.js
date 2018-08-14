import React, { Component } from 'react'
import { View, Text, TextInput, TouchableHighlight, StyleSheet,TouchableOpacity,Alert,ScrollView } from 'react-native'
import {observer} from 'mobx-react/native'
import Navbar from '../../components/navBar/index';
import flight from './index'
import ListStore from '../../stores/flight/change'
import Icon from '../../components/icons/icon';
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import moment from 'moment';
import { RestAPI,ServingClient } from '../../utils/yqfws';
import { Toast } from 'antd-mobile';
import Main from '../index';
import Enumerable from 'linq';

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
      "Name": 4,
    },
    {
      "TypeCode": "13",
      "Name": 3,
    },
    {
      "TypeCode": "ID",
      "Name": 2,
    },
    {
      "TypeCode": "NI",
      "Name": lan.other,
    },
    {
      "TypeCode": "PP",
      "Name": 5,
    }
];

var testCount = 0;

@observer
class TodoList extends Component {
  constructor () {
    super()
    this.store = ListStore;
    this.state={
      intervalDay:0,
      intervalMin:0,
      intervalHour:0,
      selectPerson:[],
      text:'',
      poundage:0.0,
      airlineRefund:0.0,
      ChangeSeqNr:1,
    }
  }

  componentDidMount() {
    this.calculationCost();
  }

  render() {
    const { list } = this.store;
    this.state.ChangeSeqNr = this.store.orderDetail.Result.Trade.Orders.length;
    return (
      <View style={{flex:1,backgroundColor: COLORS.containerBg}}>
        <Navbar navigator={this.props.navigator} title={
                  this.store.changeOrReturn == 1?lan.change_changeTicket:lan.change_returnTicket}/>
        <ScrollView style={{flex:1}}>
          {list.map((l, i) => {
            if((this.store.changeOrReturn == 1 && !l.items.IsChange && !l.items.ChangeSuccess&& !l.items.IsReturn && !l.items.ReturnSuccess) || 
              (this.store.changeOrReturn == 2 && !l.items.IsReturn && !l.items.ReturnSuccess))
                return (
                    <TouchableOpacity key={i} style={styles.itemContainer} onPress={()=>this.store.toSelect(i)}>
                        <Icon icon={l.isSelect?'0xe676':'0xe674'} color={l.isSelect?COLORS.btnBg:COLORS.listColor} style={{fontSize: 18}} />
                        <Text style={{color:'#333',marginLeft:5,fontSize:16}}>{l.items.Name}</Text>
                        <Text style={{flex:2,textAlign:'center',color:'#999',fontSize:16}}>{lan.ticketNum+"："+l.items.TicketNr}</Text>
                    </TouchableOpacity>
                )
            })
          }
          {this.store.isResult ?
          <View style={{alignItems:'center',justifyContent:'center',backgroundColor:'#fff',margin:15,padding:15}}>
            <Text style={{color:'#333'}}>{this.store.changeOrReturn == 1 ? 
                    lan.change_changeCost : lan.change_returnCost}</Text>
            <Text style={{color:COLORS.btnBg}}>{"¥"+
                  (this.store.count == 0 ? this.state.poundage : this.state.poundage+"x"+this.store.count)}
            </Text>
            <Text style={{color:'#333',textAlign:'center'}}>
                  {this.store.changeOrReturn == 1 ? (this.store.intervalTime>2 ? 
                        lan.change_more48:lan.change_less48)+lan.change_costChangeResult
                  : lan.change_costResult}
            </Text>
          </View>
          :<View style={{height:100,alignItems:'center',justifyContent:'center',backgroundColor:'#fff',margin:15,}}>
            <Text style={{color:'#999'}}>{this.store.changeOrReturn == 1?"改签手续费暂时没提供，需改签后由营业员处理！":lan.costCalculating}</Text>
        </View>}
        </ScrollView>
        <View style={{flexDirection:'row',height:45,borderTopColor:'#ccc',borderTopWidth:1}}>
            <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center',
                                borderLeftColor:'#ccc',borderLeftWidth:0.5,}}
                                onPress={()=>this.cancelChange()}>
                <Text style={{fontSize:15}}>{lan.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center',
                                borderLeftColor:'#ccc',borderLeftWidth:0.5,
                                backgroundColor:this.store.count>0?COLORS.btnBg:'#ddd'}}
                                onPress={()=>{this.store.count>0?this.sureClickEvent():''}}>
                <Text style={{color:'#fff',fontSize:15}}>{lan.ok}</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  }

  //计算退改签费用
  calculationCost = () =>{
    // this.getTimeLength();
    if(this.store.changeOrReturn == 2){
      this.getReturnCost();
    }
  }

  //获取退票费用
  getReturnCost = () =>{
    let param = {
      "IATANumber": null,
      "OfficeID": "CAN131",
      "OTCityCode": null,
      "TicketRefundDetail": {
        "TicketDetail": {
          "RefundFormNo": null,
          "ETicketType": 8,
          "TicketNumber": this.store.list[0].items.TicketNr,
          "PassengerType": this.store.list[0].items.Type
        },
        "PrinterNumber": 19,
        "CreditCard": null
      }
    };
    ServingClient.invoke("ASAirTicket.TravelSky.IBEPlus.IBEPlusAirTicketRefundCompute",param,(value)=>{
      if(value.Code == 0){
        this.state.airlineRefund = value.RefundFormDetail.RefundInfo.AirlineRefund;
        this.state.poundage = this.store.Amount-value.RefundFormDetail.RefundInfo.AirlineRefund;
        this.store.isResult = true;
      }else{
        Alert.alert(lan.remind,"可能办理了值机或其他原因无法查询到退票费用，需退票请直接联系营业员操作！",
        [
            {text: lan.ok, onPress: () => {}},
        ])
      }
    },(err)=>{
      Toast.info(err,3,null,false);
    });
  }

  //取消事件
  cancelChange = () => {
    this.store.count = 0;
    for(var v of this.store.list){
      v.isSelect = false;
    }
  }

  //确定按钮事件
  sureClickEvent = () =>{
    Toast.loading(lan.loading, 60, () => {
      Toast.info(lan.loadingFail, 3, null, false);
    });
    this.state.selectPerson = [];
    for(var v of this.store.list){
      if(v.isSelect){
        let sel = {
          "ID":v.items.ID,
          "Name":v.items.Name,
          "Type":v.items.Type,
          "CertType":v.items.CertType,
          "CertNr":v.items.CertNr,
          "Birthday":v.items.Birthday,
          "Sex":v.items.Sex,
          "ContactMobile":v.items.ContactMobile,
          "TicketNr":v.items.TicketNr,
          "OrderID":v.items.OrderID,
          "MiddleVendorOrderID":v.items.MiddleVendorOrderID
        }
        this.state.selectPerson.splice(this.state.selectPerson.length,0,sel)
      }
    }
    this.store.orderDetail.Result.Trade.Orders = [this.store.orderDetail.Result.Trade.Orders[this.store.LEG]];
    this.store.orderDetail.Result.Trade.Orders[0].Passengers = this.state.selectPerson;
    if(this.store.changeOrReturn == 1){
        Toast.hide();
        let _this = this;
        this.props.navigator.push({
            name: 'flight',
            component: flight,
            passProps: {
                orderDetail: _this.store.orderDetail.Result,
                toChange: true,
                ChangeSeqNr:_this.state.ChangeSeqNr
            }
        });
    }else this.returnTicket();
  }

  //退票
  returnTicket = () => {
    let refundAmounts = [];
    let ticketNrs = '';
    for(var v of this.store.list){
      let refundAmount = {
        "PassengerTypeCode":v.items.Type,
        "TicketTotalAmount":this.state.airlineRefund,
        "OrderID":v.items.OrderID
      };
      ticketNrs = ticketNrs+v.items.TicketNr+",";
      refundAmounts.push(refundAmount);
    }
    ticketNrs.substring(0,ticketNrs.length-1);
    let param = {
      "RefundAmounts":refundAmounts,
      "TicketNrs":ticketNrs,
      "TradeID":this.store.orderDetail.TradeID
    }
    ServingClient.invoke("LvRui.CreateRefundNoteByPSOShortNr ",param,(value)=>{
        Toast.hide();
        if(value.Code != 0){
          Toast.info(value.Msg, 3, null, false);
        }else{
          Alert.alert(
            lan.remind,
            lan.change_returnRemind,
            [
              {text: lan.ok, onPress: () => {
                storage.load({ key: 'BIZACCOUNTINFO' }).then(v => {
                  global.userInfo = JSON.parse(v);
                  this.props.navigator.replace({
                      name: 'Main',
                      component: Main,
                      passProps: {
                          IsLogin: false,
                          My_Info: JSON.parse(v).MyInfo,
                          Company_Name: JSON.parse(v).MyInfo.Result.Company.CompanyName,
                          _IsWait: JSON.parse(v).IsWait,
                          UserAccount: JSON.parse(v).MyInfo.Result.Account.UserName,
                          Permission: JSON.parse(v).Permission,
                      }
                  })
              }).catch(err => {
              });
            }},])
        }
    },(err)=>{
        Toast.info(err, 3, null, false);
    });
  }

  //根据证件的类型ID获取证件的名字
  getProofName = (type) => {
    for (var v of proofType) {
        if (v.TypeCode == type)
            return v.Name;
    }
    return lan.other;
}

  //计算时间间隔
  getTimeLength = () => {
    startDate = moment().format('X');
    endDate = moment(moment(this.store.departureTime).format('YYYY-MM-DD HH:mm')).format('X');
    let millisec = Math.abs((startDate - endDate))
    let dd = parseInt(millisec / 60 / 60 / 24); // 天数
    let mm = parseInt(millisec / 60 % 60); // 分
    let hh = parseInt(millisec / 60 / 60 % 24); //小时
    this.store.intervalTime = this.state.intervalDay = dd;
    this.state.intervalHour = hh;
    this.state.intervalMin = mm;
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ededed',
    flexDirection: 'row',
    padding:15,
    alignItems:'center',
    backgroundColor:'#fff'
  },
  item: {
    color: '#156e9a',
    fontSize: 18,
    flex: 3,
    padding: 20
  },
  deleteItem: {
    flex: 1,
    padding: 20,
    color: '#a3a3a3',
    fontWeight: 'bold',
    marginTop: 3
  },
  button: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#156e9a'
  },
  buttonText: {
    color: '#156e9a',
    fontWeight: 'bold'
  },
  heading: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#156e9a'
  },
  headingText: {
    color: '#156e9a',
    fontWeight: 'bold'
  },
  input: {
    height: 70,
    backgroundColor: '#f2f2f2',
    padding: 20,
    color: '#156e9a'
  },
  noList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noListText: {
    fontSize: 22,
    color: '#156e9a'
  },
})

export default TodoList