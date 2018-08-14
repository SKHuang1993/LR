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
import ApprovalItem2 from './approvalItem2';
import{ ServingClient } from '../../utils/yqfws'
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

export default class ApprovalOrder2  extends Component {
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
                <Navbar navigator={this.props.navigator} title={lan.myApproval}/>
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
            "ApprovedUserCode": this.state.accountNo,
            "PageSize": 10,
            "PageCount": this.state.approvalNum
        }
        if(this.state.count<2)
        Toast.loading(lan.loading,60,()=>{
             Toast.info(lan.loadingFail, 3, null, false);
        });
        ServingClient.invoke("BIZ.BTAByApplicantByCondition",param,(value)=>{
            this.state.count++;
            try {
                let orderInfo = value;
                if(orderInfo.RowCount > 0){
                    this.state.approvalTotal = orderInfo.RowCount;
                    let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    this.state.isData = true;
                    for(var _v of orderInfo.ApplicantUsers)
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
            "ApprovingUserCode": this.state.accountNo,
            "PageSize": 10,
            "PageCount": this.state.waitApprovalNum
        }
        if(this.state.count<2 )
        Toast.loading(lan.loading,60,()=>{
             Toast.info(lan.loadingFail, 3, null, false);
        });
        ServingClient.invoke("BIZ.BTAByApplicantByCondition",param,(value)=>{
            this.state.count++;
            try {
                let orderInfo = value;
                if(orderInfo.RowCount > 0){
                    this.state.waitApprovalTotal = orderInfo.RowCount;
                    let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    this.state.isWaitData = true;
                    for(var _v of orderInfo.ApplicantUsers)
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
            } catch (error) {
                console.log(error);
            }
        },(err)=>{
            this.state.count++;
            Toast.info(err,3,null,false);
        })
    }

    getWaitOrderItemInfo = (value) => {
        return <ApprovalItem2  navigator={this.props.navigator} 
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
        return <ApprovalItem2  navigator={this.props.navigator} 
                                itemInfo={value} 
                                AccountNo={this.state.accountNo}
                                CompanyApproveTypeID={2}
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