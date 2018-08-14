import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ListView,
    TouchableOpacity,
    TouchableHighlight,
    Animated,
    ScrollView,
    Navigator,
    Dimensions,
    Alert,
} from 'react-native';
import {Toast } from 'antd-mobile';
import Flex from '../../components/flex';
import List from '../../components/list';
import InputItem from '../../components/input-item';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import NavBar from '../../components/navBar/index';
import Icon from '../../components/icons/icon';
import ToolBar from '../../components/toolBar/index';
import Button from '../../components/button/index';
import moment from 'moment';
import {ServingClient,RestAPI} from '../../utils/yqfws';
import NoDataTip from '../../components/noDataTip/index';
import OrderDetail from './orderDetail';
import detail from '../account/orderDetail2'

var {width,height} = Dimensions.get('window');
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class TravelApplicate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //全部订单listview关联的数据
            dataSource: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            productSource: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            relatedOrderList: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            index:0,
            isData:true,
            pageCount:0,
            allDataList:[],
            allDataTotal:0,
        };
    }

    componentDidMount(){
        this.getApplicalData();
    }

    render() {
        return (
            <View style={styles.container}>
                <NavBar title={lan.traApplicate_travelApplicate} navigator={this.props.navigator} />
                {this.state.isData ?
                <ListView 
                    enableEmptySections = {true}
                    style={{height:height}}
                    dataSource={this.state.dataSource}
                    renderRow={(rowData,sectionID,rowID)=>this.applicateModuleView(rowData,rowID)}
                    onEndReached={()=>{
                        if(this.state.allDataList.length<this.state.allDataTotal)
                            this.getApplicalData()
                    }}
                    onEndReachedThreshold={10}  />
                :<View style={{backgroundColor:COLORS.containerBg}}>
                    <NoDataTip noDataState={4}/>
                    <View style={{backgroundColor:COLORS.containerBg,height:500}}></View>
                </View>}
            </View>
        );
    }

    //获取我的差旅申请列表数据
    getApplicalData = () =>{
        this.state.pageCount++;
        if(this.state.pageCount<2 && this.state.pageCount>0)
            Toast.loading(lan.loading,60,()=>{
                Toast.info(lan.loadingFail, 3, null, false);
            });
        if(this.state.pageCount == -1) this.state.pageCount++;
        let param = {
            "ApplicantUserCode": this.props.AccountNo,
            "ApprovingUserCode": null,
            "StatusID": null,
            "PageSize": 10,
            "PageCount": this.state.pageCount
        };
        this.state.index = 0;
        ServingClient.invoke("BIZ.BTAByApplicantByCondition",param,(value)=>{
            if(value.RowCount > 0){
                this.state.allDataTotal = value.RowCount;
                this.state.isData = true;
                for(var j = 0;j< value.ApplicantUsers.length;j++)
                    this.getRelationOrder(value.ApplicantUsers[j],value.ApplicantUsers.length);
            }else{
                this.state.isData = false;
                Toast.hide();
                this.setState({});
            }
            
        },(err)=>{
            Toast.info(err,3,null,false);
        })
    }

    //获取相关订单
    getRelationOrder = (info,len) =>{
        this.state.index++;
        let param = {
            "Nr": info.BTANr,
            "InputIDType": 4,
            "OutputIDType": 1
        };
        let ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        RestAPI.invoke("ABIS.OrderNrByNrGet",JSON.stringify(param),(value)=>{
            //value.Code == 0 && value.Result.OrderShortNr != null && value.Result.OrderShortNr != ""
            if(value.Result.SourceTypeID == 6 ){
                let p = {
                    "TradeID": value.Result.OrderShortNr,
                    "BookerID": this.props.AccountNo
                }
                RestAPI.invoke("ABIS.SimTradeGet", JSON.stringify(p), (v)=>{
                    let rOrder = [];
                    info.ServiceStaffInfo = {
                        'UserCode':v.Result.Trade.ServiceStaff.UserCode,
                        'Name':v.Result.Trade.ServiceStaff.Name,
                        'CustomerServiceCount':'768',
                        'UserAVGScore':v.Result.Trade.ServiceStaff.UserAVGScore,
                        'Mobile':v.Result.Trade.ServiceStaff.Mobile,
                        'WXQRCode':'',
                        'IsOnline':v.Result.Trade.ServiceStaff.IsOnline,
                        'IsMobileOnline':v.Result.Trade.ServiceStaff.IsMobileOnline,
                        'userImg':v.Result.Trade.ServiceStaff.Face,
                    };
                    for(var i of v.Result.Trade.Orders){
                        let ic = "";
                        if(i.OrderType == 8 || i.OrderType == 9) ic = "0xe660";
                        else if(i.OrderType == 2) ic = "0xe661";
                        else if(i.OrderType == 4) ic = "0xe697";
                        else if(i.OrderType == 5) ic = "0xe696";
                        else ic = "0xe662";
                        let oInfo = {
                            "ID":i.InnerID.ID,
                            "Intro":i.Intro,
                            "time":i.DepartureDate,
                            "StatusName":i.StatusName,
                            "Icon":ic,
                        }
                        rOrder.splice(rOrder.length,0,oInfo);
                    }
                    info.RelOrder = rOrder;
                    info.OrderID = v.Result.Trade.TradeID;
                    this.state.allDataList.splice(this.state.allDataList.length,0,info);
                    if(this.state.allDataList.length-(this.state.pageCount-1)*10 == len){
                        this.state.dataSource = ds.cloneWithRows(this.state.allDataList);
                        Toast.hide();
                        this.setState({});
                    }
                });
            }else{
                this.state.allDataList.splice(this.state.allDataList.length,0,info);
                if(this.state.allDataList.length-(this.state.pageCount-1)*10 == len){
                    this.state.dataSource = ds.cloneWithRows(this.state.allDataList);
                    Toast.hide();
                    this.setState({});
                }
            }
        });
        
    }

    //申请单模块界面
    applicateModuleView = (value,index) =>{
        let ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.state.productSource = ds.cloneWithRows(value.Contents);
        if(value.RelOrder!=null)
            this.state.relatedOrderList = ds.cloneWithRows(value.RelOrder);
        return(
            <View style={{ marginBottom: 15 }}>
                <View style={styles.titleViewStyle}>
                    <Text style={{ fontSize: 15, color: "#666", flex: 1 }}>{value.ApplicantUserName+"的差旅申请"}</Text>
                    <Text style={{ fontSize: 15, color: COLORS.secondary, }}>{value.StatusCName}</Text>
                </View>
                <ListView
                    enableEmptySections = {true}
                    dataSource={this.state.productSource}
                    renderRow={(rowData,sectionID,rowID)=>this.setProductView(rowData)}
                 />
                <View style={styles.titleViewStyle}>
                    <Text style={{ flex: 1 }}></Text>
                    {value.StatusID != 6 ?
                    <TouchableOpacity style={styles.checkOrderBorderStyle} onPress={()=>this.revokeOrder(value.ID)}>
                        <Text style={styles.checkOrderTxt}>{lan.cancel}</Text>
                    </TouchableOpacity>
                    : null}
                    
                    <TouchableOpacity style={styles.checkOrderBorderStyle} onPress={()=>this.toOrderDetail(value.ID)}>
                        <Text style={styles.checkOrderTxt}>{lan.traApplicate_orderDetailed}</Text>
                    </TouchableOpacity>
                </View>
                {value.RelOrder!=null ?
                <View style={styles.extraViewStyle}>
                    <View style={styles.extraView_hd}>
                        <Text style={{ color: '#666' }}>{lan.traApplicate_relatedOrders}</Text>
                    </View>
                    <ListView 
                        enableEmptySections = {true}
                        dataSource={this.state.relatedOrderList}
                        renderRow={(rowData,sectionID,rowID)=>this.getRelatedOrders(rowData,index)}
                    />
                </View>
                :null}
                
            </View>
        );
    }

    //查看申请单明细
    toOrderDetail = (id) =>{
        this.props.navigator.push({
            component: OrderDetail,
            passProps: {
                ID: id,
                RefreshEvent:(id,statu)=>{
                    this.state.pageCount = -1;
                    this.state.allDataList = [];
                    this.getApplicalData();
                }
            },
        })
    }

    //查看相关订单详情
    toRelatedOrderDatail = (id) =>{
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'detail',
                component: detail,
                passProps:{
                    ServiceStaffInfo:this.state.allDataList[id].ServiceStaffInfo,
                    OrderId:this.state.allDataList[id].OrderID,
                    BookerID:this.props.AccountNo,
                    LoginAccount:'',
                    AccountNo:this.props.AccountNo,
                    RefreshEvent:()=>{}
                }
            });
        }
    }

    //取消申请单
    revokeOrder = (id) =>{
        Alert.alert(
            lan.remind,
            lan.traApplicate_cancelApplicate,
            [
                {text: lan.ok, onPress: () => {
                    let param = {
                        "ID": id,
                        "StatusID": 6
                    };
                    Toast.loading(lan.traApplicate_cancelled,60,()=>{
                        Toast.info(lan.traApplicate_cancelFailed, 3, null, false);
                    });
                    ServingClient.invoke("BIZ.BTAUpdateStatus",param,(value)=>{
                        this.state.pageCount = -2;
                        this.state.allDataList = [];
                        this.getApplicalData();
                        Toast.success(lan.traApplicate_cancelSuccess, 3);
                    },(err)=>{
                        Toast.info(err,3,null,false);
                    })
                }},
                {text: lan.cancel, onPress: () => {}},
            ]
          )
        
    }

    //出差行程模块界面
    setProductView = (value) =>{
        if(value.Content.ProductCategoryID == 8 || value.Content.ProductCategoryID == 9)
            return this.planeTicketView(value)
        else if(value.Content.ProductCategoryID == 3)
            return this.trainTicketView(value);
        else if(value.Content.ProductCategoryID == 2)
            return this.hotelView(value);
        else if(value.Content.ProductCategoryID == 4)
            return this.insuranceView(value);
        else return this.visaView(value);
    }

    /*图标区别，机票为icon={'0xe660'}，酒店为icon={'0xe661'}，火车票为icon={'0xe662'}，保险为icon={'0xe697'}，签证为icon={'0xe696'}*/
    planeTicketView = (info) => {
        return (
            <View style={styles.itemViewStyle}>                
                <Icon icon={'0xe660'} color={'#999'} style={{ fontSize: 18, }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: '#333', fontSize: 16 }}>{info.Content.Segment.TripType == "RT" ?
                           info.Content.Segment.DepartureCityName+"-"+info.Content.Segment.ArrivalCityName+"、"+
                           info.Content.Segment.ArrivalCityName+"-"+info.Content.Segment.DepartureCityName :
                           info.Content.Segment.DepartureCityName+"-"+info.Content.Segment.ArrivalCityName}</Text>
                    <Text style={{ color: '#666' }}>{info.Content.Segment.DepartureDate.substring(0,10).replace(/-/g, ".")
                        +"-"+info.Content.Segment.ArrivalDate.substring(0,10).replace(/-/g, ".")+"  ("
                        +this.getDateDiff(info.Content.Segment.DepartureDate.substring(0,10),
                                info.Content.Segment.ArrivalDate.substring(0,10))+lan.traApplicate_day+")"}</Text>
                </View>
            </View>
        );
    }

    hotelView = (info) => {
        return (
            <View style={styles.itemViewStyle}>
                <Icon icon={'0xe661'} color={'#999'} style={{ fontSize: 18, }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: '#333', fontSize: 16 }}>新加坡瑞吉874酒店</Text>
                    <Text style={{ color: '#666' }}>2017.01.12-2017-01-15（3天）</Text>
                </View>
            </View>
        );
    }

    trainTicketView = (info) => {
        return (
            <View style={styles.itemViewStyle}>
                <Icon icon={'0xe662'} color={'#999'} style={{ fontSize: 18, }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: '#333', fontSize: 16 }}>{info.Content.Segment.DepartureCityName+"-"+info.Content.Segment.ArrivalCityName}</Text>
                    <Text style={{ color: '#666' }}>{info.Content.Segment.DepartureDate.substring(0,10).replace(/-/g, ".")
                        +"-"+info.Content.Segment.ArrivalDate.substring(0,10).replace(/-/g, ".")+"  ("
                        +this.getDateDiff(info.Content.Segment.DepartureDate.substring(0,10),
                                info.Content.Segment.ArrivalDate.substring(0,10))+lan.traApplicate_day+")"}</Text>
                </View>
            </View>
        );
    }

    insuranceView = () => {
        return (
            <View style={styles.itemViewStyle}>
                <Icon icon={'0xe697'} color={'#999'} style={{ fontSize: 18, }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: '#333', fontSize: 16 }}>国泰保险</Text>
                    <Text style={{ color: '#666' }}>2017.01.12-2017-01-15（3天）</Text>
                </View>
            </View>
        );
    }

    visaView = () => {
        return (
            <View style={styles.itemViewStyle}>
                <Icon icon={'0xe696'} color={'#999'} style={{ fontSize: 18, }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: '#333', fontSize: 16 }}>泰国签证</Text>
                    <Text style={{ color: '#666' }}>2017.01.12-2017-01-15（3天）</Text>
                </View>
            </View>

        );
    }
    // 相关订单
    getRelatedOrders = (value,index) => {
        return (
                <View style={styles.extraView_bd}>                    
                    <TouchableOpacity activeOpacity={1} style={styles.orderView_item} onPress={()=>this.toRelatedOrderDatail(index)}>
                        <Flex justify='start'>
                            <Icon icon={value.Icon} color={'#999'} style={{ fontSize: 18, }} />
                            <Text style={styles.orderView}>{value.Intro}</Text>
                            <Text style={{color:'#999'}}>{value.time}</Text>
                            <View style={styles.orderView_state}>
                                <Text style={styles.orderView_statetxt}>{value.StatusName}</Text>
                            </View>
                            <Icon icon={'0xe677'} color={'#999'} style={{ fontSize: 16, }} />
                        </Flex>
                    </TouchableOpacity>

                    <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
                </View>
        );
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

        return dd+1;
    }


}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.containerBg, },
    titleViewStyle: {
        flexDirection: 'row',
        backgroundColor: "#fff",
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
    },
    itemViewStyle: {
        backgroundColor: '#f7f7f7',
        flexDirection: 'row',
        paddingLeft: 15,
        paddingRight: 15,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
        paddingBottom: 10,
    },
    checkOrderBorderStyle: { marginLeft: 15, borderColor: '#333', borderRadius: 5, borderWidth: 0.5, padding: 5, width: 80, },
    checkOrderTxt: { color: '#333', textAlign: 'center' },
    extraViewStyle: { backgroundColor: "#fff", paddingLeft: 10, paddingRight: 10, },
    extraView_hd: { borderBottomWidth: 0.5, borderBottomColor: '#ddd', paddingBottom: 5, },
    extraView_bd: { paddingLeft: 5, paddingRight: 5, },
    orderView_item: { marginBottom: 10, marginTop: 10, },
    orderView: { fontSize: 16,marginLeft:5,marginRight:5,},
    orderView_state: {flex:1,marginRight:5,},
    orderView_statetxt:{color:COLORS.secondary,textAlign:'right'},
})