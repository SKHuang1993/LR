import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    TouchableOpacity,
    Platform,
    BackAndroid,
} from 'react-native';
import {LanguageType} from '../../utils/languageType';
import Icon from '../../components/icons/icon';
import {COLORS} from '../../styles/commonStyle';
import Navbar from '../../components/navBar/index';

var {width,height} = Dimensions.get('window')
var lan = LanguageType.setType();

const orderSubmitState = {
    'PaymentMethodID':1,//1-现付,3-月结,5-欠款
    'BookState':lan.submitSuccess,
    'BookStateID':1,//1-订单提交成功,23-订座成功，15-订座失败,2-待审批，11-已出票
    'OrderNum':'PA8ZHY',
    'TotalAmount':'¥1388',
};

export default class index extends Component {
    static propTypes = {
        backToMainEvent:React.PropTypes.func,//点击回调函数
        toDetailEvent:React.PropTypes.func,//点击回调函数
	}

    constructor(props) {
        super(props);
    }

    render(){
        if(this.props.bookStateInfo != null) orderSubmitState = this.props.bookStateInfo;
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                <Navbar navigator={this.props.navigator} title={lan.orderSubmitView_title}/>
                <View style={{alignItems:'center',justifyContent:'center',marginTop:40,marginBottom:40}}>
                    <View style={{borderRadius:50,width:80,height:80,alignItems:'center',
                                    justifyContent:'center',backgroundColor:'#52aa39'}}>
                        <Icon icon={'0xe699'} color={'#fff'} style={{fontSize: 50,}}/>
                    </View>
                    <Text style={{color:'#333',fontSize:17,marginTop:8}}>{this.getOrderState()}</Text>
                </View>
                <View style={{flexDirection:'row'}}>
                    <Text style={{color:'#999',fontSize:14,flex:1.5,textAlign:'right'}}>{lan.orderNum+':'}</Text>
                    <Text style={{color:COLORS.link,fontSize:14,flex:1,}}>{orderSubmitState.OrderNum}</Text>
                    <Text style={{color:'#999',fontSize:14,}}>{lan.totalAmount+':'}</Text>
                    <Text style={{color:COLORS.btnBg,fontSize:14,flex:1.3,}}>{orderSubmitState.TotalAmount}</Text>
                </View>
                <Text style={{color:'#999',paddingLeft:15,paddingRight:15,fontSize:14,textAlign:'center'}}>{this.getRemark()}</Text>

                <View style={{flexDirection:'row',marginTop:25}}>
                    <View style={{flex:2}}/>
                    <TouchableOpacity style={{borderRadius:4,paddingLeft:20,paddingRight:20,paddingTop:10,paddingBottom:10,borderColor:'#999',borderWidth:1}}
                                        onPress={()=>this.props.backToMainEvent()==null?{}:this.props.backToMainEvent()}>
                        <Text style={{color:'#333',fontSize:15}}>{lan.backToMain}</Text>
                    </TouchableOpacity>
                    <View style={{flex:1}}/>
                    <TouchableOpacity style={{borderRadius:4,paddingLeft:20,paddingRight:20,paddingTop:10,paddingBottom:10,borderColor:'#999',borderWidth:1}}
                                        onPress={()=>this.props.toDetailEvent() == null ? {} : this.props.toDetailEvent()}>
                        <Text style={{color:'#333',fontSize:15}}>{lan.toDetail}</Text>
                    </TouchableOpacity>
                    <View style={{flex:2}}/>
                </View>
            </View>
        );
    }

    //获取订单状态名
    getOrderState = () => {
        if(orderSubmitState.BookStateID == 1) return lan.submitSuccess;
        else if(orderSubmitState.BookStateID == 15) return lan.bookFaile;
        else return lan.bookSuccess;
    }

    //根据订单状态给出的提示语
    getRemark = () => {
        if(orderSubmitState.BookStateID == 1)
            return lan.orderSubmitView_bookId1;
        else if(orderSubmitState.BookStateID == 15)
            return lan.orderSubmitView_bookId15;
        else if(orderSubmitState.BookStateID == 2)
            return lan.orderSubmitView_bookId2;
        else if(orderSubmitState.BookStateID ==3 && orderSubmitState.PaymentMethodID == 1)
            return lan.orderSubmitView_bookId3;
        else if(orderSubmitState.BookStateID ==26 && orderSubmitState.PaymentMethodID == 3)
            return lan.orderSubmitView_bookId26;
        else return "";
    }
}