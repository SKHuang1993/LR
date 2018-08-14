

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    StatusBar,
    ScrollView,
    Navigator,
    ListView,
    TouchableOpacity,
    TouchableHighlight,
    Animated
} from 'react-native';

import { WhiteSpace, InputItem, Picker, ActivityIndicator, Popup } from 'antd-mobile';
import Flex from '../../components/flex';
import List from '../../components/list';
import TextareaItem from '../../components/textarea-item';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../../components/button';
import DomesticFlight from '../../stores/flight/domestic'
import Accordion from 'react-native-collapsible/Accordion';
import { observer } from 'mobx-react/native';
import ToolBar from '../../components/toolBar/';
import FlightList from '../../components/booking/flightList';
import FlightInfo from '../../components/booking/flightInfo';
import FormatPrice from '../../components/formatPrice';
import Enumerable from 'linq';
import Form from '../../components/form/';
import PriceBar from '../../components/price-bar';
import Modal from '../../components/modal';
import PassgerList from './passagerList';
import PassgerEdit from './passagerEdit';
import InSure from './inSure';
import Radio from '../../components/radio/';
const getField = new Form().getField;
const Item = List.Item;
const Brief = Item.Brief;
const RadioItem = Radio.RadioItem;

/** 需要的接口
 * "Base.UpdateClientManInfo", "修改客户(订票人|人员资料)信息(支持角色和审批)--员工旅客和非员工旅客同一接口",
 * "Biz3.SysPolicyReasonGetList", "查询违反差旅政策原因",
 * Biz3.SysTravelReasonGetList 查询出差原因
 * ABIS.ProductsMultiSearch  综合推荐产品(附加产品)
 *

 */




const ProofTypes = [
    {
        "value": "10",
        "label": "军人证",

    },
    {
        "value": "11",
        "label": "回乡证",

    },
    {
        "value": "12",
        "label": "台胞证",

    },
    {
        "value": "13",
        "label": "港澳通行证",

    },
    {
        "value": "ID",
        "label": "身份证",

    },
    {
        "value": "NI",
        "label": "其他证件",

    },
    {
        "value": "PP",
        "label": "护照",

    },
    {
        "value": "PolicyReasonCustom",
        "label": "自定义",

    }
]


export default class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            getEndorseText: '网络请求中',
            clearingFormValue: 1, //结算方式
        }
    }

    componentDidMount() {
        this.getEndorseText()
        // this.timer = setTimeout(
        //     () => this.getEndorseText(),
        //     2000
        // );
    }
    componentWillUnmount() {
        // 如果存在this.timer，则使用clearTimeout清空。  
        // 如果你使用多个timer，那么用多个变量，或者用个数组来保存引用，然后逐个clear  
        // this.timer && clearTimeout(this.timer);
    }
    // 获取退改签文本
    getEndorseText = () => {
        return this.setState({
            getEndorseText: '获取退改签文本'
        })
    }
    onPopupClose = () => {

        Popup.hide();
    };


    //航节提示
    getLeg = (position) => {
        if (this.props.param) {
            if (this.props.param.departureDates.length <= 2) {
                return position == 0 ? '去' : '回';
            }
            else {
                return position;
            }
        }
    }

    //航班信息
    getFlightInfo = (leg, info) => {
        return {
            //标题
            title: {
                leg: leg,
                date: info.DepartureDate,
                city: `${info.Departure.cityNameCn} - ${info.Arrival.cityNameCn}`,
            },
            //列表
            list: Enumerable.from(info.Segment.ClassAvail).select('$.Flight').toArray()
        }
    }

    //舱位信息
    getCabinInfo = (info) => {
        return {
            cabin: info.CabinName,
            discount: info.Discount,
            price: info.Price,
            extraPrice: '机建+燃油费:￥50'
        }
    }




    showModal = (e) => {
        // 现象：如果弹出的弹框上的 x 按钮的位置、和手指点击 button 时所在的位置「重叠」起来，
        // 会触发 x 按钮的点击事件而导致关闭弹框 (注：弹框上的取消/确定等按钮遇到同样情况也会如此)
        e.preventDefault(); // 修复 Android 上点击穿透
        this.setState({
            visible: true,
        });
    }
    //
    onModalClose = () => {
        this.setState({
            visible: false,
        });
    }
    onClose(sel, num) {
        this.setState({ [`sel${num}`]: sel });
        Popup.hide();
    }

    render() {
        let flightList = this.props.selectedFlights;
        return (
            <View style={styles.container}>
                <NavBar title='填写资料' navigator={this.props.navigator} />
                <ScrollView>
                    <Form ref="form">
                        {/*结算方式*/}
                        <View style={styles.clearingForm}>
                            <RadioItem checked={this.state.clearingFormValue === 1}  onChange={(event) => {
                                if (event.target.checked) {
                                    this.setState({ clearingFormValue: 1 });
                                }
                            }}>先付</RadioItem>
                            <RadioItem checked={this.state.clearingFormValue === 2} onChange={(event) => {
                                if (event.target.checked) {
                                    this.setState({ clearingFormValue: 2 });
                                }
                            }}>月结 <Text style={styles.clearingFormTxt}>企业额度剩余：￥2644</Text></RadioItem>

                        </View>
                        {/*机票信息*/}
                        {/*<View style={[styles.flights, FLEXBOX.bottomSpace]}>
                        {flightList.map((o, i) =>
                            <View key={i} style={styles.flightList}>
                                <FlightList data={this.getFlightInfo(this.getLeg(i), o)} onBackPress={() => { }} />
                                <FlightInfo data={this.getCabinInfo(o.selectedCabin)} endorseText={o.selectedCabin.Rule} />
                            </View>)
                        }
                    </View>*/}
                        {/*差旅政策*/}
                        <List >
                            <List.Item >
                                <Flex justify='between'  >
                                    <Text style={styles.listTitle} numberOfLines={1}>
                                        您所选的航班已违背差旅政策
                                </Text>
                                    <Text style={styles.listWarning} onPress={() => {
                                        Modal.alert('违背明细', ('alert 内容内容'), [

                                            { text: 'OK', onPress: () => { } },
                                        ]);
                                    }}>
                                        <Icon style={styles.iconWarning} icon={'0xe67a'} />违背明细
                                </Text>
                                </Flex>
                            </List.Item>

                            <Picker
                                data={ProofTypes} cols={1}
                                title="违背原因"
                                extra="请选择或填写原因"
                                value={this.state.Name}
                                triggerType="onClick"
                                onChange={(PolicyReason) => this.setState({ PolicyReason })}
                            >
                                <List.Item arrow="horizontal" last >违背原因</List.Item>
                            </Picker>

                            {/*违背原因自定义选项输入框*/}
                            {this.state.PolicyReason == 'PolicyReasonCustom' ?
                                <TextareaItem title={'新增原因'} placeholder="新增原因" autoHeight />
                                : null}

                            <Picker
                                data={ProofTypes} cols={1}
                                title="出差原因"
                                extra="请选择出差原因"
                                value={this.state.Name}
                                triggerType="onClick"
                                onChange={(Name) => this.setState({ Name })}
                            >
                                <List.Item arrow="horizontal"  >出差原因</List.Item>
                            </Picker>
                            <Picker
                                data={ProofTypes} cols={1}
                                title="成本中心"
                                extra="请选择成本中心"
                                value={this.state.Name}
                                triggerType="onClick"
                                onChange={(Name) => this.setState({ Name })}
                            >
                                <List.Item arrow="horizontal"  >成本中心</List.Item>
                            </Picker>

                        </List>
                        {/*已选出差员工*/}
                        <List renderHeader={() => '已选出差员工(2)'} >

                            <List.Item arrow='horizontal'>
                                姆米色 <Brief>身份证：44172319801212122</Brief>
                            </List.Item>
                            <List.Item arrow='horizontal'>
                                周瑶瑶 <Brief><Icon icon={'0xe67a'} style={styles.iconWarning} /><Text style={styles.TextWarning}>信息不全，请点击补充</Text></Brief>
                            </List.Item>
                        </List>
                        {/*非员工旅客*/}
                        <List renderHeader={() => '非员工旅客'} style={FLEXBOX.bottomSpace} >

                            <List.Item arrow='horizontal' onClick={() => {
                                if (this.props.navigator) {
                                    this.props.navigator.push({
                                        component: InSure,
                                        type: 'Bottom'
                                    })
                                }
                            }}>
                                新增其他旅客
                        </List.Item>
                            <List.Item arrow='horizontal'>
                                姆米色 <Brief>身份证：44172319801212122</Brief>
                            </List.Item>
                        </List>
                        {/*保险、签证*/}

                        <List >
                            <Item arrow="horizontal" extra={'未选'}

                                onClick={() => {
                                    if (this.props.navigator) {
                                        this.props.navigator.push({
                                            component: InSure,
                                            type: 'Bottom'
                                        })
                                    }
                                }}>保险 <Brief><Text style={{ fontSize: 12, }} numberOfLines={1}>保险名，一路为您守护！</Text></Brief></Item>
                        </List>
                        <List >
                            <Item arrow="horizontal" extra={'已选2份'}

                                onClick={() => {
                                    if (this.props.navigator) {
                                        this.props.navigator.push({
                                            component: InSure,
                                            type: 'Bottom'
                                        })
                                    }
                                }}>保险 <Brief><Text style={{ fontSize: 12, }} numberOfLines={1}>保险名，一路为您守护！</Text></Brief></Item>
                        </List>
                        <List >
                            <Item arrow="horizontal" extra={<View style={{ flex: 1.9 }}><Text numberOfLines={1}>不需要</Text></View>} onClick={() => { }}>座位偏好</Item>
                        </List>
                        {/*保险、签证*/}

                        <List renderHeader={() => '联系人信息*'}>
                            <InputItem
                                onChange={() => { }}
                                value={null}
                                labelNumber={5}
                                placeholder="请输入">姓名</InputItem>
                            <InputItem
                                {...getField(null, 'phone') }
                                placeholder="请输入"
                                labelNumber={5}
                                value={null}
                                onChange={(phoneValue) => { }}>联系号码</InputItem>
                            <InputItem
                                {...getField(null, 'email') }
                                labelNumber={5}
                                placeholder="请输入"
                                value={null}
                                onChange={(emailValue) => { }}>电子邮箱</InputItem>
                            <TextareaItem labelNumber={5} title={'附加信息'} placeholder="附加信息" autoHeight />
                        </List>
                    </Form>

                </ScrollView>
                {/*底部工具栏*/}
                <PriceBar totalPrice={88} onClick={() => alert(1)} />
                {/*退改签*/}



            </View>
        )

    }


}








const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.containerBg,
    },
    flights: {
        padding: 5,
        backgroundColor: COLORS.primary,
    },

    flightList: {
        borderBottomWidth: 1 / FLEXBOX.pixel,
        borderBottomColor: '#ddd',
        padding: 5,
        backgroundColor: '#fff',
    },
    //列表样式
    listTitle: {
        flex: 1,
        fontSize: 16,

    },
    listWarning: {
        color: '#fa5e5b',
        fontSize: 12,
    },
    iconWarning: {
        color: '#fa5e5b',
        fontSize: 14,
        marginRight: 2,

    },
    TextWarning: {
        color: '#fa5e5b',
        fontSize: 12,
    },
    // 结算方式
    clearingForm:{
        backgroundColor:COLORS.primary,
        padding:5,
    },
    clearingFormTxt:{
        fontSize:14,
        color:'#999',
         
    }


});

