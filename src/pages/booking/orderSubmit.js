import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Platform,
    BackAndroid,
} from 'react-native';
import { LanguageType } from '../../utils/languageType';
import Icon from '../../components/icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle';
import Navbar from '../../components/navBar/index';
import Flex from '../../components/flex';
import Button from '../../components/button';
import { observer } from 'mobx-react/native'
import SubmitInfo from '../../stores/booking/order-submit'
import { AccountInfo } from '../../utils/data-access/';
import orderDetailById from '../account/orderDetail2';
var { width, height } = Dimensions.get('window')

@observer
export default class orderSubmit extends Component {

    static defaultProps = {
        bookStateInfo: {
            'PaymentMethodID': 1,//1-现付,5-月结
            'BookState': lan.submitSuccess,
            'BookStateID': 1,//1-订单提交成功,23-订座成功，15-订座失败,2-待审批，11-已出票
            'OrderNum': 'PA8ZHY',
            'TotalAmount': '1388',
        },
        onPayPress: () => alert(1),
        onBackHome: () => alert(1),
        onToDetail: () => { },
    };

    constructor(props) {
        super(props);
        this.store = new SubmitInfo(props);
        this.store.userInfo = AccountInfo.getUserInfo();
        if (!props.bookStateInfo.ToChange) {
            this.addApproveRouting();

            this.timer = setInterval(async () => {
                if (this.store.seconds > 0) {
                    this.store.seconds -= 1;
                } else {
                    clearInterval(this.timer);
                    if (props.bookStateInfo.CustomerApproveStatusID == 25) {
                        this.store.obj.bookStateInfo.BookStateID = 2;
                    }
                    else {
                        let orderState = await this.store.getOrderState();
                        this.store.obj.bookStateInfo.BookStateID = orderState.StatusID;
                        this.store.obj.bookStateInfo.BookState = lan.booking_order + orderState.StatusName;
                        console.log(this.store.obj.bookStateInfo.BookStateID);
                    }
                }
            }, 1000);
        }
    }

    addApproveRouting = async () => {
        let props = this.props;
        if (props.bookStateInfo.CustomerApproveStatusID == 25) {
            let result = await this.store.addApproveRouting(props.bookStateInfo.Approves, props.bookStateInfo.Roles, props.bookStateInfo.ID);
            if (!result)
                result = await this.store.addApproveRouting(props.bookStateInfo.Approves, props.bookStateInfo.Roles, props.bookStateInfo.ID);
        }
    }

    //回首页
    onBackHome = () => {
        this.props.navigator.popToTop();
    }

    //跳转订单详情
    onToDetail = () => {
        let serviceStaffInfo = {
            'UserCode': '',
            'Name': lan.booking_online_customer_service,
            'CustomerServiceCount': '888',
            'UserAVGScore': '4.80',
            'Mobile': '400-6786622',
            'WXQRCode': '',
            'IsOnline': '',
            'IsMobileOnline': false,
            'userImg': "http://m.yiqifei.com/userimg/CMC05T5D/2",
        };
        this.props.navigator.push({
            component: orderDetailById,
            passProps: {
                ServiceStaffInfo: serviceStaffInfo,
                OrderId: this.props.bookStateInfo.OrderNum,
                BookerID: this.store.userInfo.Account,
            }
        })
    }

    render() {
        let orderSubmitState = this.store.obj.bookStateInfo;
        return (
            <View style={styles.container}>
                <Navbar navigator={this.props.navigator} title={lan.booking_order_status} />
                <View style={styles.iconwrap}>
                    <View style={[styles.iconBg, orderSubmitState.BookStateID == 15 ? styles.iconWarnBg : null]}>
                        <Icon icon={orderSubmitState.BookStateID == 15 ? '0xe65f' : '0xe699'} color={'#fff'} style={{ fontSize: orderSubmitState.BookStateID == 15 ? 30 : 50, }} />
                    </View>
                    <Text style={styles.iconText}>{orderSubmitState.BookState}</Text>
                </View>
                <Flex justify='center' style={{ marginBottom: 5, }} >
                    <Text style={styles.infoTitle}>{lan.orderNum + ':'}</Text>
                    <Text style={styles.orderNum} > {orderSubmitState.OrderNum}</Text>
                    <Text style={styles.infoTitle} >{lan.totalAmount + ':'} </Text>
                    <Text style={styles.price} >¥{orderSubmitState.TotalAmount}</Text>
                </Flex>

                <Text style={styles.stateHint}>{this.getRemark(orderSubmitState)}</Text>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Flex justify='center' style={{ marginTop: 25 }}>
                        <Button onClick={() => this.onBackHome()} style={styles.button} textStyle={styles.buttonText}　>{lan.backToMain}</Button>
                        <View style={{ width: 20 }} />
                        <Button onClick={() => this.onToDetail()} style={styles.button} textStyle={styles.buttonText}　>{lan.toDetail}</Button>
                    </Flex>
                    {/*马上支付*/}
                    {(orderSubmitState.BookStateID == 3 || orderSubmitState.BookStateID == 999) && orderSubmitState.PaymentMethodID == 1 ?
                        <Button onClick={this.props.onPayPress} textStyle={styles.payButtonText} style={styles.payButton}>{lan.booking_pay_immediately}</Button> : null}
                </View>


            </View>
        );
    }

    //获取订单状态名
    getOrderState = (orderSubmitState) => {
        if (orderSubmitState.BookStateID == 1 || orderSubmitState.BookStateID == 2) return lan.submitSuccess;
        else if (orderSubmitState.BookStateID == 3 || orderSubmitState.BookStateID == 5) return lan.booking_reservation_success;
        else if (orderSubmitState.BookStateID == 15) return lan.bookFaile;
        else if (orderSubmitState.BookStateID == 21) return lan.booking_stay_in_the_reservation;
        else if (orderSubmitState.BookStateID == 22) return lan.booking_reservations_to_alternate;
        else if (orderSubmitState.BookStateID == 23) return lan.booking_the_reservation_has_been_confirmed;
        else if (orderSubmitState.BookStateID == 14) return lan.booking_the_reservation_has_been_cancelled;
        else if (orderSubmitState.BookStateID == 999) return "改签申请提交成功";
    }


    //根据订单状态给出的提示语
    getRemark = (orderSubmitState) => {
        if (orderSubmitState.BookStateID == 1)
            return <Text >{lan.booking_you_are_working_for_a_reservation_please_wait}...<Text style={styles.countTimer}>{this.store.seconds}s</Text></Text>;
        else if (orderSubmitState.BookStateID == 15)
            return '有可能因为位置不够而导致订座失败，稍后我们的差旅顾问将会联系您确定订单!';
        else if (orderSubmitState.BookStateID == 2)
            return lan.booking_the_order_is_subject_to_approval_and_has_been_sent_to_the_appropriate_approver_for_approval;
        else if (orderSubmitState.BookStateID == 3 && orderSubmitState.PaymentMethodID == 1)
            return '您所选的结算方式为：现付，请及时完成付款';
        else if (orderSubmitState.BookStateID == 26 && orderSubmitState.PaymentMethodID == 5)
            return '您所选的结算方式为：月付，正在为您出票';
        else return "";
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.containerBg,
    },
    iconwrap: {
        alignItems: 'center', justifyContent: 'center', marginTop: 40, marginBottom: 40
    },
    iconBg: {
        borderRadius: 50, width: 80, height: 80, alignItems: 'center',
        justifyContent: 'center', backgroundColor: '#52aa39'
    },
    iconWarnBg: {
        backgroundColor: '#fa5e5b'
    },
    iconText: {
        color: '#333', fontSize: 17, marginTop: 8
    },
    infoTitle: {
        color: '#999', fontSize: 14,
    },
    orderNum: { color: COLORS.link, fontSize: 14, marginRight: 15 },
    price: {
        color: COLORS.secondary,
        fontSize: 14,
    },
    stateHint: {
        color: '#999', paddingLeft: 15, paddingRight: 15, fontSize: 14, textAlign: 'center'
    },
    button: {
        backgroundColor: 'transparent',
        borderColor: '#cccccc'
    },
    buttonText: {
        color: '#333', fontSize: 15
    },
    countTimer: {
        color: COLORS.link,
        fontSize: 20,
    },
    payButton: {
        backgroundColor: COLORS.secondary,
        marginTop: 10,
        width: 206,
        borderWidth: 0

    },
    payButtonText: {
        color: '#fff'
    }


});