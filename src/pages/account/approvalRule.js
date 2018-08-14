import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    ScrollView,
    ListView,
    Platform,
    BackAndroid,
} from 'react-native';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';
import NoData from '../../components/noDataTip'

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class ApprovalRule  extends Component {
    constructor(props) {
        super(props);
        this.state={
            approvalName:'',
            approveContent:'',//审批规则
            roles:'',//审批人角色
            dataSource:new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
        };
    }

    render(){
        let myinfo = this.props.myInfo;
        if(myinfo.Result.ApproveRule != null){
            let ds = new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            });
            this.state.approvalName = myinfo.Result.ApproveRule.Name;
            this.state.approveContent = myinfo.Result.ApproveRule.ApproveContent != null ? myinfo.Result.ApproveRule.ApproveContent : '{}';//审批规则
            this.state.roles = myinfo.Result.ApproveRule.Roles != null ? myinfo.Result.ApproveRule.Roles : '[]';//审批人角色
            {this.state.roles=='[]' ? null : this.state.dataSource = ds.cloneWithRows(this.state.roles)};
            return(
                <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                    <Navbar navigator={this.props.navigator} title={lan.approvalRule}/>
                    <ScrollView style={{backgroundColor:COLORS.containerBg}}>
                        {this.state.approveContent=='{}' ? null 
                                        : this.getApprovalInfo(this.state.approveContent)}
                    </ScrollView>
                </View>
            )
        }else{
            return(
                <View style={{ flex: 1 }}>
                    <Navbar navigator={this.props.navigator} title={lan.approvalRule}/>
                    <NoData noDataState={4}/>
                </View>
            );
        }
    }

    getApprovalInfo = (rule) => {
        return(
            <View style={{marginTop:10,}}>
                <Text style={styles.policyTextStyle}>{this.state.approvalName}</Text>
                {rule.NoNeed ? this.approvalInfoView(lan.noNeed) : null }
                {rule.ViolationApproval ? this.approvalInfoView(lan.violationApproval) : null }
                {rule.HasPassenger ? this.approvalInfoView(lan.hasPassenger) : null }
                {rule.PersonalPayment ? this.approvalInfoView(lan.personalPayment) : null }
                {rule.CompanyMonthPayment ? this.approvalInfoView(lan.companyMonthPayment) : null }
                {rule.CompanyPayment ? this.approvalInfoView(lan.companyPayment) : null }
                {this.state.roles=='[]' ? null : this.approvalRole()}
            </View>
        );
    }

    //审批规则样式
    approvalInfoView = (text) =>{
        return(
            <View>
                <View style={styles.itemViewStyle}>
                    <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                    <Text style={styles.itemTextStyle}>{text}</Text>
                </View>
                <View style={{backgroundColor:'#ebebeb',height:0.8}}/>
            </View>
        );
    }

    //审批人角色样式
    approvalRole = () =>{
        return(
            <ListView
                 dataSource={this.state.dataSource}
                 renderRow={this.approvalRoleView.bind(this)}
             />
        );
    }

    approvalRoleView = (value) => {
        return(
                <View>
                    <View style={styles.itemViewStyle}>
                        <Text style={styles.itemTextStyle}>{lan.appRole+value.Name}</Text>
                    </View>
                    <View style={{backgroundColor:'#ebebeb',height:0.8}}/>
                </View>
            );
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
    policyTextStyle:{
        fontSize:14,
        color:'#999',
        paddingLeft:15,
        paddingBottom:2,
    },
    itemViewStyle:{
        paddingLeft:15,
        paddingRight:15,
        flexDirection:'row',
        paddingBottom:10,
        paddingTop:10,
        backgroundColor:'#fff',
        alignItems: 'center',
    },
    itemTextStyle:{
        color:'#333',
        fontSize:16,
        marginLeft:5,
        paddingRight:15
    },
})