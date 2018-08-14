import React, {Component} from 'react';
import PropTypes from 'prop-types';
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
    TextInput,
} from 'react-native';
import {Tabs,Toast,Popup} from 'antd-mobile';
import Icon from '../../components/icons/icon';
import RadiusImage from '../../components/radiusImage/index';
import {COLORS} from '../../styles/commonStyle';
import{ ServingClient } from '../../utils/yqfws'
import OrderDetail from './orderDetail2';
import ApprovalDetail from '../travel/orderDetail';
import moment from 'moment';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class ApprovalItem2 extends Component {
    static propTypes = {
        itemInfo:PropTypes.object,//每张订单的信息
        approvalType:PropTypes.number,//1表示待我审批订单，2表示已审批订单
        info:PropTypes.object,
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
            reason:'',
        };
    }

    componentDidMount(){
    }

    render(){
        this.state.accountNo = this.props.AccountNo;
        this.state.moduleInfo = this.props.itemInfo;
        let ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.state.dataSource = ds.cloneWithRows(this.props.itemInfo.Contents);
        return(
            <View style={{marginTop:3,marginBottom:12}}>
                <View style={styles.titleViewStyle}>
                    <Text style={{fontSize:15,color:"#666",flex:1}}>{this.state.moduleInfo.ApplicantUserName+"的订单审批申请"}</Text>
                    {this.props.approvalType == 1 ? 
                        <Text style={{fontSize:15,color:"#666",}}>{lan.waitApproval}</Text>
                     : null}
                </View>
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this.productInfo.bind(this)}
                />

                {this.props.approvalType == 1 ? 
                    <View style={styles.titleViewStyle}>
                        <Text style={{flex:1}}></Text>
                        <TouchableOpacity style={styles.payBorderStyle} onPress={()=>
                                this.inputReason(this.props.itemInfo.ID, false)}>
                            <Text style={{color:COLORS.btnBg}}>{lan.refuseApproval}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkOrderBorderStyle} onPress={()=>
                                this.inputReason(this.props.itemInfo.ID, true)}>
                            <Text style={{color:'#333'}}>{lan.agreeApproval}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkOrderBorderStyle} onPress={()=>this.toProcess2()}>
                            <Text style={{color:'#333'}}>{lan.checkOrder}</Text>
                        </TouchableOpacity>
                    </View>
                    : 
                    <View style={styles.titleViewStyle}>
                        <Text style={{flex:1}}></Text>
                        <TouchableOpacity style={styles.checkOrderBorderStyle} onPress={()=>this.toProcess2()}>
                            <Text style={{color:'#333'}}>{lan.checkOrder}</Text>
                        </TouchableOpacity>
                    </View>
                }
                {this.props.approvalType == 2 ? 
                    <Icon icon={this.state.moduleInfo.ApproveResults[0].IsPass ? '0xe68f' : '0xe690'} 
                            color={this.state.moduleInfo.ApproveResults[0].IsPass ? '#fca7a5' : '#8f8f8f'}
                            style={{fontSize: 88,position: 'absolute',right: 50,top:-10,backgroundColor:'transparent'}}/>
                 : null}
            </View>
        );
    }

    //8-国内机票，9-国际机票，2-酒店，5-签证，4-保险,3-火车票
    productInfo = (value) => {
        if(value.Content.ProductCategoryID == 8 || value.Content.ProductCategoryID == 9) return this.planeTicketView(value.Content);
        else if(value.Content.ProductCategoryID == 2) return this.hotelView(value.Content);
        else if(value.Content.ProductCategoryID == 4) return this.insuranceView(value.Content);
        else if(value.Content.ProductCategoryID == 5) return this.visaView(value.Content);
        else return this.trainTicketView(value.Content);
    }

    planeTicketView = (info) => {
        info = info.Segment;
        return(
            <View>
                <View style={styles.itemViewStyle}>
                    <Icon icon={'0xe660'} color={'#999'} style={{fontSize: 18,}} />
                    <View style={{flex:1,marginLeft:10}}>
                        <Text style={{color:'#333',fontSize:16}}>{info.DepartureCityName+"-"+info.ArrivalCityName}</Text>
                        <Text style={{color:'#666'}}>{moment(info.DepartureDate).format("YYYY.MM.DD")+"-"
                            +moment(info.ArrivalDate).format("YYYY.MM.DD")+"("+
                            +this.getTimeLength(info.DepartureDate,info.ArrivalDate)+")"}
                        </Text>
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
        info = info.Segment;
        return(
            <View>
                <View style={styles.itemViewStyle}>
                    <Icon icon={'0xe662'} color={'#999'} style={{fontSize: 18,}} />
                    <View style={{flex:1,marginLeft:10}}>
                        <Text style={{color:'#333',fontSize:16}}>{info.DepartureCityName+"-"+info.ArrivalCityName}</Text>
                        <Text style={{color:'#666'}}>{moment(info.DepartureDate).format("YYYY.MM.DD")+"-"
                            +moment(info.ArrivalDate).format("YYYY.MM.DD")+"("+
                            +this.getTimeLength(info.DepartureDate,info.ArrivalDate)+")"}</Text>
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

    //审批单据
    addActuallyApproval = (id,isPass) =>{
        let param = {
            "BTAID": id,
            "UserCode": this.state.accountNo,
            "IsPass": isPass,
            "Remark":this.state.reason
        };
        Toast.loading(lan.approving,60,()=>{
            Toast.info(lan.loadingFail, 3, null, false);
        });
        ServingClient.invoke("BIZ.ActuallyApprovalAdd",param,(value)=>{
            if(value.Code == null){
                this.props.RefreshEvent(isPass ? lan.beAgreed : lan.beRefuse);
            }else{
                Toast.info(value.Msg, 3, null, false);
            }
        },(err)=>{
            Toast.info(err,3,null,false);
        })
    }

    //流程2查看待我审批订单详情
    toProcess2 = () => {
        this.props.navigator.push({
            component: ApprovalDetail,
            passProps: {
                ID: this.props.itemInfo.ID,
                type:1,
                RefreshEvent:(id,statu)=>this.props.RefreshEvent(''),
            },
        })
    }

    //计算时间间隔
    getTimeLength = (startDate, endDate) =>{
        startDate = moment(moment(startDate).format('YYYY-MM-DD HH:mm')).format('X');
        endDate = moment(moment(endDate).format('YYYY-MM-DD HH:mm')).format('X');
        let millisec = Math.abs((startDate - endDate))
        let dd = parseInt(millisec / 60 / 60 / 24); // 天数
        let mm = millisec / 60 % 60; // 分
        let hh = parseInt(millisec / 60 / 60 % 24); //小时
        return (dd+1);
    }

    //审批原因输入界面
    inputReason = (id,isPass) => {
        Popup.show(
            <View>
                <View style={{backgroundColor:COLORS.primary,height:44,alignItems:'center',flexDirection:'row'}}>
                    <TouchableOpacity style={{flex:1,marginLeft:15,paddingRight:10}} onPress={() => Popup.hide()}>
                        <Text style={{color:'#fff',fontSize:15}}>{lan.cancel}</Text>
                    </TouchableOpacity>
                    <Text style={{flex:5,textAlign:'center',color:'#fff',fontSize:17}}>{lan.remark}</Text>
                    <TouchableOpacity style={{flex:1,marginLeft:15,paddingRight:10}}>
                        <Text style={{color:'#fff',fontSize:15}}></Text>
                    </TouchableOpacity>
                </View>
                <TextInput style={{fontSize:16,textAlignVertical: "top",height:200}} 
                            onChangeText={(txt)=>{this.state.reason = txt;}}
                            placeholder={lan.inputReason} placeholderTextColor='#ccc' 
                            underlineColorAndroid='#fff' 
                            selectionColor='#333'/>
                <TouchableOpacity style={{height:45,backgroundColor:COLORS.btnBg,
                                    alignItems:"center",justifyContent:'center'}}
                                    onPress={()=>{Popup.hide();this.addActuallyApproval(id,isPass)}}>
                    <Text style={{color:'#fff',fontSize:16}}>{isPass?lan.agreeApproval:lan.refuseApproval}</Text>
                </TouchableOpacity>
            </View>,
        { animationType: 'slide-up', maskClosable: false });
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