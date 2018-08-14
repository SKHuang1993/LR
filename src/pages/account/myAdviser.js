import React, {Component} from 'react';
import {
	StyleSheet,
	View,
	TouchableOpacity,
    Text,
    Dimensions,
    ListView,
    NativeModules,
    Platform,
    Alert,
} from 'react-native';
import Icon from '../../components/icons/icon';
import RadiusImage from '../../components/radiusImage/index';
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import Navbar from '../../components/navBar/index';
import {Toast} from 'antd-mobile';
import{ RestAPI,ServingClient } from '../../utils/yqfws';
import NoDataTip from '../../components/noDataTip/index';
import {Chat} from '../../utils/chat';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class MyAccount  extends Component {
    constructor(props) {
        super(props);
        this.state={
            //全部订单listview关联的数据
            dataSource: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
             companyCode:this.props.CompanyCode,
             haveAdviser:true,
             aInfo:[],
             adviserInfo:[],
        };
    }

    componentDidMount(){
        this.state.adviserInfo = [];
        this.getAdviserListInfo();
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                <Navbar navigator={this.props.navigator} title={lan.myAdviser}/>
                {this.state.haveAdviser ?
                <ListView
                    enableEmptySections = {true}
                    dataSource={this.state.dataSource}
                    renderRow={this.setAdviserView.bind(this)}
                />
                :<View style={{backgroundColor:COLORS.containerBg,flex:1}}>
                    <NoDataTip noDataState={4}/>
                    <View style={{backgroundColor:COLORS.containerBg,height:500}}></View>
                </View>}
            </View>
        )
    }

    //获取我的差旅顾问列表信息
    getAdviserListInfo = () => {
        let param={
            "CompanyCode": this.state.companyCode
        }
        Toast.loading(lan.loading,60,()=>{
             Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("CRM.CommissionerListGetByCompanyCode",JSON.stringify(param),(value)=>{
            let advInfo = value;
            if(advInfo.Code == 0){
                // Toast.hide();
                if(advInfo.Result.Commissioners.length>0){
                    this.state.haveAdviser = true;
                    for(var v of advInfo.Result.Commissioners){
                        this.state.aInfo.splice(this.state.aInfo.length,0,{'account':v.Account});
                    }
                    this.getAdviserInfo();
                }else {
                    Toast.hide();
                    this.state.haveAdviser = false;
                    this.setState({});
                }
            }else{
                Toast.hide();
                Toast.info(value, 3, null, false);
            }
        },(err)=>{
            Toast.hide();
            Toast.info(err,3,null,false);
        })
    }

    //获取差旅顾问的详细信息
    getAdviserInfo = () => {
        let i = 0;
        for(var v of this.state.aInfo){
            let param={
                "UserCode": v.account,
                "UserName": null,
                "Password": null,
                "Platform": "MobileDevice",
                "Source": "差旅宝"
            }
            ServingClient.invoke("IM.GetToken",param,(value)=>{
                let advInfo = value;
                if(advInfo.IsSuccess){
                    this.state.adviserInfo.splice(this.state.adviserInfo.length,0,
                    {
                        'UserCode':advInfo.User.UserCode,
                        'StaffName':advInfo.User.Name,
                        'UserAVGScore':advInfo.User.CustomerService.UserCommentScore.AVGScore,
                        'CustomerServiceCount':advInfo.User.CustomerService.UserServiceCount.CustomerServiceCount,
                        'FormulaCount':advInfo.User.CustomerService.UserServiceCount.FormulaCount,
                        'StaffWorkPhone':advInfo.User.CustomerService.WorkPhone,
                        'IMNr':advInfo.User.IMNr,
                    });
                    i++;
                    if(i == this.state.aInfo.length){
                        Toast.hide();
                        let ds = new ListView.DataSource({
                            rowHasChanged: (row1, row2) => row1 !== row2,
                        });
                        this.state.dataSource = ds.cloneWithRows(this.state.adviserInfo);
                        this.setState({});
                    }
                }else{
                    i++;
                    if(i == this.state.aInfo.length){
                        Toast.hide();
                        Toast.info(value, 3, null, false);
                    }
                }
            },(err)=>{
                i++;
                if(i == this.state.aInfo.length){
                    Toast.hide();
                    Toast.info(err,3,null,false);
                }
            })
        }
    }

    //差旅顾问布局
    setAdviserView = (vaule) => {
        return(
            <View>
                <View style={{flexDirection:'row',backgroundColor:'#fff',padding:15,alignItems:'center',justifyContent:'center'}}>
                    <View>
                        <RadiusImage pathType={1}
                            imagePath={"http://m.woquguo.net/UserImg/" + vaule.UserCode + "/3"}
                            imgWidth={60} imgHeight={60}>
                        </RadiusImage>
                        <View style={{backgroundColor:'#45da84',position: 'absolute',bottom:3,right:3,
                        borderColor:'#fff',borderWidth:3/FLEXBOX.pixel,overflow:'hidden',
                        width:15,height:15,borderRadius:7.5,alignItems:'center',justifyContent:'center'}}>
                            <Icon icon={'0xe699'} color={'#fff'} style={{fontSize: 10}}/>
                        </View>
                    </View>
                    
                    <View style={{flex:1,marginLeft:8}}>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Text style={{color:'#333',fontSize:17}}>{vaule.StaffName}</Text>
                            <Icon icon={'0xe68c'} color={COLORS.btnBg} style={{fontSize: 16,marginLeft:15}}/>
                            <Text style={{color:COLORS.btnBg,fontSize:17}}>{vaule.UserAVGScore}</Text>
                        </View>
                        <Text style={{color:'#999',fontSize:15,marginTop:5}}>{lan.serviceCustomerNum+vaule.CustomerServiceCount}</Text>
                        <Text style={{color:'#999',fontSize:15,}}>{lan.programmeNum+vaule.FormulaCount}</Text>
                    </View>
                    <TouchableOpacity style={{marginRight:10}} onPress={()=>this.toChat(vaule.IMNr,vaule.StaffName)}>
                        <Icon icon={'0xe66b'} color={'#eac44a'} style={{fontSize: 23,}}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>this.callPhoneToAdviser(vaule.StaffWorkPhone)}>
                        <Icon icon={'0xe66f'} color={'#999'} style={{fontSize: 23,}}/>
                    </TouchableOpacity>
                </View>
                <View style={{backgroundColor:'#ebebeb',height:0.8}}/>
            </View>
        );
    }

    //电话联系差旅顾问
    callPhoneToAdviser = (tel) => {
        if(Platform.OS == 'android')
        Alert.alert(
            lan.call,
            tel,
            [
              {text: lan.ok, onPress: () => {NativeModules.MyNativeModule.callPhone(tel)}},
              {text: lan.cancel, onPress: () => {}},
            ]
          );
        else 
            NativeModules.MyNativeModule.callPhone(tel);
    }

    //跳转聊天界面
    toChat = (IMNr,name) => {
        Chat.createConversation(this.props.navigator,IMNr,name,"C2C",null);
    }
}