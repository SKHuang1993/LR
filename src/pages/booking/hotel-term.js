import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
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
    Animated, TextInput, Alert,
    WebView
} from 'react-native';

import { WhiteSpace, Popup, SearchBar } from 'antd-mobile';
import ActivityIndicator from '../../components/activity-indicator';
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
import InputItem from '../../components/input-item'
import PriceBar from '../../components/price-bar';
import Checkbox from '../../components/checkbox';
import Form from '../../components/form/';
import Modal from '../../components/modal';
import Picker from '../../components/picker';
import PassgerList from './passagerList';
import PassgerEdit from './passagerEdit';
import EmployeeEdit from './employeeEdit';
import InSure from './inSure';
import Visa from './visa';
import Booking from '../../stores/booking/';
import Confirm from './hotel';
import OrderSubmit from './orderSubmit';
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { CertificateInfo, AccountInfo, NationalityInfo, PermissionInfo } from '../../utils/data-access/';
import Radio from '../../components/radio/';
import moment from 'moment';
import Hotel from '../../stores/booking/hotel';
import { Keyboard } from 'react-native';
import CostCenter from './costCenter';
import BookingPassager from './bookingPassager';

const Item = List.Item;
const Brief = Item.Brief;
const RadioItem = Radio.RadioItem;
const CheckboxItem = Checkbox.CheckboxItem;

const alert = Modal.alert;
@observer
export default class Term extends Component {
    @observable store;
    constructor(props) {
        super(props);
    }

    render() {
        let termsHtml1 = <View style={styles.roomIntroduce}>
            <WebView source={{ uri: 'http://developer.ean.com/terms/en/' }} />
        </View>
        let termsHtml2 = <View style={styles.roomIntroduce}>
            <WebView source={{ uri: 'http://developer.ean.com/terms/zh/' }} />
        </View>
        let termsHtml3 = <View style={styles.roomIntroduce}>
            <WebView source={{ uri: 'http://developer.ean.com/terms/agent/en/' }} />
        </View>
        let termsHtml4 = <View style={styles.roomIntroduce}>
            <WebView source={{ uri: 'http://developer.ean.com/terms/agent/zh-cn/' }} />
        </View>
        return (
            <View style={styles.container}>
                <NavBar title={"条款"} navigator={this.props.navigator} />
                {/*条件内容 */}
                <View style={[styles.termsContent]}>
                    <Text style={styles.termsTitle}>
                        {lan.hotels_agreedClausetitle1}：
                            </Text>
                    <Text style={styles.termsLink} onPress={() => {
                        Modal.alert(lan.hotels_agreedClausetitle1, termsHtml1, [
                            { text: lan.confirm, onPress: () => { } },
                        ]);
                    }} >
                        http://developer.ean.com/terms/en/
                            </Text>
                    <Text style={styles.termsLink} onPress={() => {
                        Modal.alert(lan.hotels_agreedClausetitle1, termsHtml2, [
                            { text: lan.confirm, onPress: () => { } },
                        ]);
                    }}>
                        http://developer.ean.com/terms/zh/
                            </Text>
                    <Text style={styles.termsTitle}>
                        {lan.hotels_agreedClausetitle2}：
                            </Text>
                    <Text style={styles.termsLink} onPress={() => {
                        Modal.alert(lan.hotels_agreedClausetitle2, termsHtml3, [
                            { text: lan.confirm, onPress: () => { } },
                        ]);
                    }}>
                        http://developer.ean.com/terms/agent/en/
                            </Text>
                    <Text style={styles.termsLink} onPress={() => {
                        Modal.alert(lan.hotels_agreedClausetitle2, termsHtml4, [
                            { text: lan.confirm, onPress: () => { } },
                        ]);
                    }}>
                        http://developer.ean.com/terms/agent/zh-cn/
                            </Text>
                </View>
            </View>)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.containerBg,
    },
    countriesBg: {
        backgroundColor: '#fff'
    },
    otherDemandTitle: {

        alignItems: 'center',
        padding: 10,
    },
    title: {
        color: '#333',
    },
    titleDes: {
        color: '#999',
        fontSize: 12,
    },
    inconHint: {
        fontSize: 14,
        color: '#666'
    },

    roomIntroduce: {
        width: FLEXBOX.width * .8,
        height: FLEXBOX.height * .6,
    },
    hotelInfo: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,

    },
    roomInfo: {
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        padding: 10,
    },
    hotelName: {
        fontSize: 16, color: '#333',
        marginBottom: 5,
    },
    roomItem: {
        padding: 10,
    },
    countriesItem: {
        borderColor: '#ccc',
        borderBottomWidth: 1 / FLEXBOX.pixel,
        padding: 10,
    },
    roomLine: {
        borderColor: '#ccc',
        borderBottomWidth: 1 / FLEXBOX.pixel,
    },
    iconArrow: { fontSize: 12, color: '#666' },
    otherDemand: {
        backgroundColor: '#fff',

    },
    demandItem: {
        width: FLEXBOX.width * 0.8,
        paddingTop: 5,
        paddingBottom: 5,
    },

    demandDes: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    checkInInfo: {
        backgroundColor: '#fff',
        padding: 10,
        paddingBottom: -10,
        marginBottom: 10,
    },
    checkInInfoList: {
        height: 40,
        alignItems: 'center',
        borderBottomWidth: 1 / FLEXBOX.pixel,
        borderColor: '#ddd',
    },
    checkInInput: {
        height: 40, flex: .3,
        fontSize: 14,
    },
    checkInInfoLabel: {
        flex: .15,
        color: '#666',

    },
    checkInInfoCountry: {
        flex: .2,

    },
    checkInfoItem: {
        borderBottomWidth: 1 / FLEXBOX.pixel,
        borderColor: '#ddd',
        paddingTop: 10,
        paddingBottom: 10,
    },
    iconArrowDown: {
        color: '#666',
        width: 20,
        marginLeft: 10,
        flex: 0
    },
    textareaItem: {
        fontSize: 12,
        height: 50,
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
    itemExtraVal: {
        fontSize: 16,
        color: '#888888'
    },
    // 结算方式
    clearingForm: {
        backgroundColor: COLORS.primary,
        padding: 5,
    },
    clearingFormTxt: {
        fontSize: 14,
        color: '#999',

    },
    termsCeckbox: {
        alignItems: 'center'
    },
    termsLink: {
        color: '#007aff',
        marginBottom: 2,
    },
    termsTitle: {
        marginBottom: 5,
        marginTop: 5,
    },
    termsContent: {
        //backgroundColor: '#fff',

        paddingLeft: 15,
    },
    termsToggle: {
        color: '#007aff',
        textDecorationLine: 'underline'
    },


});