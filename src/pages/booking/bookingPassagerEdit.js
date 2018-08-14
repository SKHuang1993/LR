import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    ListView,
    Switch,
    TouchableOpacity, Alert,
} from 'react-native';

import { WhiteSpace, Toast, Popup } from 'antd-mobile';
import ActivityIndicator from '../../components/activity-indicator';
import Flex from '../../components/flex';
import NavBar from '../../components/navBar';
import Picker from '../../components/picker';
import List from '../../components/list';
import Icon from '../../components/icons/icon';
import Checkbox from '../../components/checkbox/'
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import SearchBar from '../../components/search-bar/';
import InputItem from '../../components/input-item/';
import DatePicker from '../../components/date-picker'
import Form from '../../components/form/';
import Button from '../../components/button/'
import Employee from '../../stores/staff/'
import { observer } from 'mobx-react/native'
import ClientManInfo from '../../stores/staff/add'
import Radio from '../../components/radio';
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { CertificateInfo, AccountInfo } from '../../utils/data-access';
const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;
import moment from 'moment';
import Enumerable from 'linq';
import 'moment/locale/zh-cn';
import PassagerEdit from '../../stores/booking/booking-passager-edit';
import AreaList from './area-list';
const RadioItem = Radio.RadioItem;
const defaultDate = moment().locale('zh-cn').utcOffset(8);
const getField = new Form().getField;

/*** 
 ## Base.InsertClientManInfo 新增员工
 ## CRM.ClientManNoInsert 新增第三方客户(账号)信息 
***/

//旅客接口 CRM.ProofTypeGet  获取旅客证件类型


@observer
export default class BookingPassagerEdit extends Component {
    constructor(props) {
        super(props);
        this.store = new PassagerEdit();
        this.store.userInfo = AccountInfo.getUserInfo();
        this.state = {
            sexData: [{
                "value": "Female",
                "label": lan.women,
            },
            {
                "value": "Male",
                "label": lan.man,
            }
            ],
        }
    }

    render() {
        let info = this.store.info;
        return <View style={styles.container}>
            <NavBar navigator={this.props.navigator} title={'新增订票人'} />
            <ScrollView>
                <Form ref="form">
                    <List >
                        <InputItem
                            {...getField(info.ClientMan.Name) }
                            onChange={(name) => { info.ClientMan.Name = name }}
                            value={info.ClientMan.Name}
                            labelNumber={5}
                            placeholder={lan.booking_please_enter_your_name}>{lan.booking_full_name}</InputItem>

                        <View>
                            <InputItem
                                {...getField(info.ClientMan.Annts[0].Value) }
                                placeholder={"请输入电话号码"}
                                labelNumber={8}
                                type="number"
                                onChange={(phoneValue) => { info.ClientMan.Annts[0].Value = phoneValue }}>{lan.booking_phone_number}</InputItem>
                            <TouchableOpacity activeOpacity={.7} style={styles.countryCode} onPress={() => {
                                this.props.navigator.push({
                                    component: AreaList,
                                    passProps: {
                                        confirm: (val) => {
                                            this.store.areaCode = "+" + val.AreaCode
                                        }
                                    }
                                })
                            }}>
                                <Text style={styles.countryCodeText}>
                                    {this.store.areaCode}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <InputItem
                            labelNumber={5}
                            placeholder={`${lan.booking_forExample}:LI`}
                            onChange={(lastNameEn) =>
                                info.ClientMan.LastNameEn = lastNameEn
                            }
                            value={info.ClientMan.LastNameEn}>{lan.booking_surname + `(${lan.booking_pinyin})`}</InputItem>
                        <InputItem
                            labelNumber={5}
                            placeholder={`${lan.booking_forExample}:LEI`}
                            onChange={(firstNameEn) =>
                                info.ClientMan.FirstNameEn = firstNameEn
                            }
                            value={info.ClientMan.FirstNameEn}>{lan.booking_name + `(${lan.booking_pinyin})`}</InputItem>
                        <InputItem
                            labelNumber={5}
                            optional={false}
                            placeholder={''}
                            onChange={(val) => { info.ClientMan.PetName = val }
                            }
                            value={info.ClientMan.PetName}>会员昵称</InputItem>
                        <Picker

                            data={this.state.sexData} cols={1}
                            title={lan.sex}
                            labelNumber={5}
                            extra={lan.passengers_selectHint}
                            value={info.ClientMan.Sex ? [info.ClientMan.Sex] : null}
                            triggerType="onClick"
                            onChange={(sex) => { info.ClientMan.Sex = sex[0] }}>
                            <List.Item arrow="horizontal" labelNumber={5}>{lan.sex}</List.Item>
                        </Picker>
                        <InputItem
                            {...getField(info.ClientMan.Annts[1].Value, 'email') }
                            labelNumber={5}
                            optional={true}
                            placeholder={''}
                            onChange={(val) => { info.ClientMan.Annts[1].Value = val }
                            }
                        >邮箱</InputItem>


                    </List>


                </Form>
            </ScrollView>
            <Button type={'barButton'} onClick={() => {
                this.refs.form.validateFields((error) => {
                    if (!error) {
                        let info = toJS(this.store.info);
                        info.ClientMan.Annts[0].Value = this.store.areaCode + info.ClientMan.Annts[0].Value;
                        this.store.insertClientManInfo(info, (personCode) => {
                            if (personCode) {
                                Alert.alert('', '添加订票人成功', [
                                    { text: lan.booking_determine, onPress: () => { this.props.navigator.pop(); } },
                                ])

                            } else {
                                Alert.alert('', '添加失败', [
                                    { text: lan.booking_determine, onPress: () => { } },
                                ])
                            }
                        });
                    }
                })
            }}>{lan.booking_submit}</Button>
            <ActivityIndicator toast text={lan.booking_loading} animating={this.store.isLoading} />
        </View >

    }
}












const styles = StyleSheet.create({
    container: {
        flex: 1,

        backgroundColor: COLORS.containerBg,
    },
    //证件
    proofTitle: {
        flex: .5
    },
    proofText: {

    },
    proofList: {
        alignItems: 'center',
        // justifyContent: 'center',
        padding: 15,
        paddingLeft: 0,
    },
    countryCode: {
        position: 'absolute', left: 100, top: 12,
    },
    countryCodeText: {
        fontSize: 16,
        color: COLORS.link
    }







});

