import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    ListView,
    Alert,
    TouchableOpacity,
    Platform,
    BackAndroid,
} from 'react-native';
import {Tabs,Toast} from 'antd-mobile';
import Icon from '../../components/icons/icon';
import RadiusImage from '../../components/radiusImage/index';
import {COLORS} from '../../styles/commonStyle';
import{ RestAPI } from '../../utils/yqfws'
import OrderDetail from './orderDetail2';
import ApprovalDetail from '../travel/orderDetail';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class ApprovalItem extends Component {
    static propTypes = {
        itemInfo:React.PropTypes.object,//每张订单的信息
        approvalType:React.PropTypes.number,//1表示待我审批订单，2表示已审批订单
        info:React.PropTypes.object,
	}

    constructor(props) {
        super(props);
        this.state={
            imgType:2,
            userImg:"",
            accountNo:'',
            moduleInfo:{},//每张订单的信息
            dataSource:new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            serviceStaffInfo:{},
        };
    }

    componentDidMount(){
        this.getServiceStaffInfo();
    }

    getServiceStaffInfo = () =>{
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
            }else{
                Toast.info(value, 3, null, false);
            }
        },(err)=>{
            Toast.info(err,3,null,false);
        })
    }

    render(){
        this.state.accountNo = this.props.AccountNo;
        this.state.moduleInfo = this.props.itemInfo;
        this.state.serviceStaffInfo = {
            "UserCode":this.props.itemInfo.ServiceStaff.UserCode,
            'Name':this.props.itemInfo.ServiceStaff.Name,
            'CustomerServiceCount':'768',
            'UserAVGScore':this.props.itemInfo.ServiceStaff.UserAVGScore,
            'Mobile':this.props.itemInfo.ServiceStaff.Mobile,
            'WXQRCode':this.props.itemInfo.ServiceStaff.WXQRCode,
            'IsOnline':this.props.itemInfo.ServiceStaff.IsOnline,
            'IsMobileOnline':this.props.itemInfo.ServiceStaff.IsMobileOnline,
            'userImg':"http://m.woquguo.net/UserImg/" + this.props.itemInfo.ServiceStaff.UserCode + "/3",
        };
        let ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.state.dataSource = ds.cloneWithRows(this.props.itemInfo.Orders);
        return(
            <View style={{marginTop:3,marginBottom:12}}>
                <View style={styles.titleViewStyle}>
                    <Text style={{fontSize:15,color:"#666",flex:1}}>{this.state.moduleInfo.BookerName+lan.approvalApplication}</Text>
                    {this.props.approvalType == 1 ? 
                        <Text style={{fontSize:15,color:"#666",}}>{lan.waitApproval}</Text>
                     : null}
                </View>
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this.productInfo.bind(this)}
                />
                <View style={styles.contactViewStyle}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{fontSize:15,color:'#666'}}>{lan.tripReason+":"}</Text>
                        <Text style={{fontSize:15,color:'#333'}}>{this.state.moduleInfo.Orders[0].TravelPurpose}</Text>
                    </View>
                    {this.state.moduleInfo.Orders[0].ContrReason==null||this.state.moduleInfo.Orders[0].ContrReason==''
                    ?<Text style={{fontSize:15,color:'#666',marginTop:2}}>{lan.meetPolicy}</Text>:
                    <View style={{flexDirection:'row',marginTop:2}}>
                        <Text style={{fontSize:15,color:'#666'}}>{lan.contraryReason+":"}</Text>
                        <Text style={{fontSize:15,color:'#333'}}>{this.state.moduleInfo.Orders[0].ContrReason}</Text>
                    </View>
                    }
                    
                </View>

                {this.props.approvalType == 1 ? 
                    <View style={styles.titleViewStyle}>
                        <Text style={{flex:1}}></Text>
                        <TouchableOpacity style={styles.payBorderStyle} onPress={()=>this.refuseApprovalEvent()}>
                            <Text style={{color:COLORS.btnBg}}>{lan.refuseApproval}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkOrderBorderStyle} onPress={()=>this.agreeApprovalEvent()}>
                            <Text style={{color:'#333'}}>{lan.agreeApproval}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkOrderBorderStyle} onPress={()=>this.toOrderDetail()}>
                            <Text style={{color:'#333'}}>{lan.checkOrder}</Text>
                        </TouchableOpacity>
                    </View>
                    : 
                    <View style={styles.titleViewStyle}>
                        <Text style={{flex:1}}></Text>
                        <TouchableOpacity style={styles.checkOrderBorderStyle} onPress={
                            ()=>this.props.CompanyApproveTypeID == 1 ? this.toOrderDetail() : this.toProcess2()}>
                            <Text style={{color:'#333'}}>{lan.checkOrder}</Text>
                        </TouchableOpacity>
                    </View>
                }
                {this.props.approvalType == 2 ? 
                    <Icon icon={this.state.moduleInfo.Orders[0].StatusID == 7 ? '0xe690' : '0xe68f'} 
                            color={this.state.moduleInfo.Orders[0].StatusID == 7 ? '#8f8f8f' : '#fca7a5'}
                            style={{fontSize: 88,position: 'absolute',right: 50,top:-10,backgroundColor:'transparent'}}/>
                 : null}
            </View>
        );
    }

    //8-国内机票，9-国际机票，2-酒店，5-签证，4-保险,3-火车票
    productInfo = (value) => {
        if(value.OrderType == 8 || value.OrderType == 9) return this.planeTicketView(value);
        else if(value.OrderType == 2) return this.hotelView(value);
        else if(value.OrderType == 4) return this.insuranceView(value);
        else if(value.OrderType == 5) return this.visaView(value);
        else return this.trainTicketView(value);
    }

    planeTicketView = (info) => {
        return(
            <View>
                <View style={styles.itemViewStyle}>
                    <Icon icon={'0xe660'} color={'#999'} style={{fontSize: 18,}} />
                    <View style={{flex:1,marginLeft:10}}>
                        <Text style={{color:'#333',fontSize:16}}>{info.Intro}</Text>
                        <Text style={{color:'#666'}}>{lan.departureDate+":"+info.DepartureDate}</Text>
                    </View>
                    <View style={{alignItems:'flex-end'}}>
                        <Text style={{fontSize:18,color:COLORS.btnBg}}>{"¥"+info.TotalAmount}</Text>
                        {info.Policy.IsContrPolicy ? 
                        <TouchableOpacity onPress={()=>this.contraryDetail(info.ContrContent)}>
                            <Text style={{fontSize:12,color:COLORS.titleBar}}>{lan.contraryDetail}</Text>
                        </TouchableOpacity>
                     : null}
                    </View>
                    
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
                    <View style={{alignItems:'flex-end'}}>
                        <Text style={{fontSize:18,color:COLORS.btnBg}}>{"¥"+info.TotalAmount}</Text>
                        {info.Policy.IsContrPolicy ? 
                        <TouchableOpacity onPress={()=>this.contraryDetail(info.ContrContent)}>
                            <Text style={{fontSize:12,color:COLORS.titleBar}}>{lan.contraryDetail}</Text>
                        </TouchableOpacity>
                     : null}
                    </View>
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
                    <Text style={{color:'#666'}}>{info.DepartureDate}</Text>
                </View>
                <View style={{alignItems:'flex-end'}}>
                    <Text style={{fontSize:18,color:COLORS.btnBg}}>{"¥"+info.TotalAmount}</Text>
                    {info.Policy.IsContrPolicy ? 
                     <TouchableOpacity onPress={()=>this.contraryDetail(info.ContrContent)}>
                        <Text style={{fontSize:12,color:COLORS.titleBar}}>{lan.contraryDetail}</Text>
                     </TouchableOpacity>
                     : null}
                </View>
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
                    <Text style={{color:'#666'}}>{info.DepartureDate}</Text>
                </View>
                <View style={{alignItems:'flex-end'}}>
                    <Text style={{fontSize:18,color:COLORS.btnBg}}>{"¥"+info.TotalAmount}</Text>
                    {info.Policy.IsContrPolicy ? 
                        <TouchableOpacity onPress={()=>this.contraryDetail(info.ContrContent)}>
                            <Text style={{fontSize:12,color:COLORS.titleBar}}>{lan.contraryDetail}</Text>
                        </TouchableOpacity>
                     : null}
                </View>
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
                    <Text style={{color:'#666'}}>{info.DepartureDate}</Text>
                </View>
                <View style={{alignItems:'flex-end'}}>
                    <Text style={{fontSize:18,color:COLORS.btnBg}}>{"¥"+info.TotalAmount}</Text>
                    {info.Policy.IsContrPolicy ? 
                        <TouchableOpacity onPress={()=>this.contraryDetail(info.ContrContent)}>
                            <Text style={{fontSize:12,color:COLORS.titleBar}}>{lan.contraryDetail}</Text>
                        </TouchableOpacity>
                     : null}
                </View>
            </View>
            <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
            </View>
            
        );
    }

    contraryDetail = (detail) =>{
        Alert.alert(
            lan.contraryDetail,
            detail,
            [
              {text: lan.ok, onPress: () => {}},
            ]
          )
    }

    //同意审批
    agreeApprovalEvent = () =>{
            let param={
                "SOID": this.state.moduleInfo.InnerID.ID,
                "IsPass": true,
                "UserCode": this.state.accountNo,
            }
            Toast.loading(lan.approving,60,()=>{
                Toast.info(lan.loadingFail, 3, null, false);
            });
            RestAPI.invoke("Biz3.PSOCustomerActuallyApprovalAdd",JSON.stringify(param),(value)=>{
                Toast.hide();
                if(value.Code == 0 && value.Result.Flag == 0){
                    this.props.RefreshEvent(lan.beAgreed);
                }else{
                    Toast.info(value.Msg, 3, null, false);
                }
            },(err)=>{
                Toast.info(err,3,null,false);
            })
    }

    //拒绝审批
    refuseApprovalEvent = () =>{
            let param={
                "SOID": this.state.moduleInfo.InnerID.ID,
                "IsPass": false,
                "UserCode": this.state.accountNo,
            }
            Toast.loading(lan.approving,60,()=>{
                Toast.info(lan.loadingFail, 3, null, false);
            });
            RestAPI.invoke("Biz3.PSOCustomerActuallyApprovalAdd",JSON.stringify(param),(value)=>{
                Toast.hide();
                if(value.Code == 0 && value.Result.Flag == 0){
                    this.props.RefreshEvent(lan.beRefuse);
                }else{
                    Toast.info(value.Msg, 3, null, false);
                }
            },(err)=>{
                Toast.info(err,3,null,false);
            });
    }

     //查看订单详情
    toOrderDetail = () =>{
        this.props.navigator.push({
            component: OrderDetail,//ApprovalDetail
            passProps: {
                ServiceStaffInfo:this.state.serviceStaffInfo,
                OrderId:this.props.itemInfo.TradeID,
                BookerID:this.props.itemInfo.BookerID,
                IsApproval:this.props.approvalType == 1 ? true : false,
                RefreshEvent:(content)=>this.props.RefreshEvent(content),
            },
        })
    }

    //流程2查看待我审批订单详情
    toProcess2 = () => {
        this.props.navigator.push({
            component: ApprovalDetail,
            passProps: {
                ID: this.props.itemInfo.InnerID.ID,
                type:1,
                RefreshEvent:(id,statu)=>{this.props.RefreshEvent('');},
            },
        })
    }
}

export class ItemInfo {
    static t1 = 'aa'
}

const styles = StyleSheet.create({
    titleViewStyle:{
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
        backgroundColor:'#f7f7f7',
        flexDirection:'row',
        paddingLeft:15,
        paddingRight:15,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop:10,
        paddingBottom:10,
    },
    contactViewStyle:{
        backgroundColor:"#f7f7f7",
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
    viewStyle:{
        position: 'absolute',
    },
})