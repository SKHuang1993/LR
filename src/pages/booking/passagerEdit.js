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
import Passenger from '../../stores/booking/passenger-edit';
import AreaList from './area-list';
const RadioItem = Radio.RadioItem;
const defaultDate = moment().locale('zh-cn').utcOffset(8);
const getField = new Form().getField;

/*** 
 ## Base.InsertClientManInfo 新增员工
 ## CRM.ClientManNoInsert 新增第三方客户(账号)信息 
***/

//旅客接口 CRM.ProofTypeGet  获取旅客证件类型
//账号类型
const AccountTypes = [
    {
        "value": "0",
        "label": lan.booking_phone_number,

    },
    {
        "value": "1",
        "label": lan.booking_mail_box,

    },]

@observer
export default class PassagerEdit extends Component {
    constructor(props) {
        super(props);
        if (props.passenger)
            this.store = new Passenger(props.passenger, props.selectedCertificate);
        else {
            this.store = new Passenger(null, props.selectedCertificate);
        }
        this.store.userInfo = AccountInfo.getUserInfo();
    }

    render() {
        let passenger = this.store.passenger;
        let contact = Enumerable.from(passenger.Contacts).firstOrDefault(o => o.AnntType.toLowerCase() == 'phone', -1);
        return <View style={styles.container}>
            <NavBar navigator={this.props.navigator} title={this.props.passenger ? lan.booking_editor_in_flight : lan.booking_add_opportunity} />
            <ScrollView>
                <Form ref="form">
                    <List style={[FLEXBOX.bottomSpace]} >
                        <InputItem
                            {...getField(passenger.Name) }
                            onChange={(name) => { passenger.Name = name }}
                            value={passenger.Name}
                            labelNumber={5}
                            placeholder={lan.booking_please_enter_your_name}>{lan.booking_full_name}</InputItem>

                        <View>
                            <InputItem
                                {...getField(contact.Annt) }
                                placeholder={lan.booking_please_enter_your_cell_phone_number}
                                labelNumber={5}
                                value={contact.Annt}
                                onChange={(phoneValue) => { contact.Annt = phoneValue }}>{lan.booking_phone_number}</InputItem>
                            {/* <TouchableOpacity activeOpacity={.7} style={styles.countryCode} onPress={() => {
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
                            </TouchableOpacity> */}
                        </View>
                        <List.Item extra={<Text style={{ fontSize: 16, color: '#333', flex: 1, }}>{this.store.selectedCertificate.CertificateName}</Text>} arrow="horizontal" onClick={() => Popup.show(<ProofList
                            store={this.store} credentials={passenger.Credentials} navLeftClick={() => Popup.hide()} />, {
                                maskClosable: true,
                                animationType: 'slide-up',
                                onMaskClose: () => { },
                            })} labelNumber={5}>{lan.booking_document_type}</List.Item>
                        <InputItem
                            {...getField(this.store.selectedCertificate.Number) }
                            placeholder={lan.booking_please_enter_your_identification_number}
                            labelNumber={5}
                            value={this.store.selectedCertificate.Number}
                            onChange={(val) => this.store.selectedCertificate.Number = val}>{lan.booking_identification_number}</InputItem>
                        <DatePicker
                            value={this.store.selectedCertificate.EndDate ? moment(this.store.selectedCertificate.EndDate) : null}
                            mode="date"
                            title={lan.booking_term_of_validity}
                            extra={lan.booking_please_select}
                            onChange={(date) => this.store.selectedCertificate.EndDate = date.format('YYYY-MM-DD')}>
                            <List.Item arrow="horizontal" labelNumber={5}>
                                {lan.booking_term_of_validity}
                            </List.Item>
                        </DatePicker>

                    </List>
                    {/*护照信息*/}
                    {!this.store.isOptional ?
                        < List style={[FLEXBOX.bottomSpace]} >
                            <InputItem
                                {...getField(passenger.LastNameEn) }
                                optional={this.store.isOptional}
                                labelNumber={5}
                                placeholder={`${lan.booking_forExample}:LI`}
                                onChange={(lastNameEn) =>
                                    passenger.LastNameEn = lastNameEn
                                }
                                value={passenger.LastNameEn}>{lan.booking_surname + `(${lan.booking_pinyin})`}</InputItem>
                            <InputItem
                                {...getField(passenger.FirstNameEn) }
                                labelNumber={5}
                                optional={this.store.isOptional}
                                placeholder={`${lan.booking_forExample}:LEI`}
                                onChange={(firstNameEn) =>
                                    passenger.FirstNameEn = firstNameEn
                                }
                                value={passenger.FirstNameEn}>{lan.booking_name + `(${lan.booking_pinyin})`}</InputItem>
                        </List> : null}
                    {/*常旅客卡*/}
                    {this.store.passenger.Milescards.map((o, i) =>
                        <List key={i} style={[FLEXBOX.bottomSpace]} >
                            <InputItem
                                labelNumber={5}
                                optional
                                placeholder={lan.booking_optional}
                                value={o.CardType}
                                onChange={(val) =>
                                    o.CardType = val
                                }
                            >{lan.booking_frequent_passenger_card}</InputItem>
                            <InputItem
                                labelNumber={5}
                                placeholder={lan.booking_optional}
                                value={o.Issuer}
                                onChange={(val) =>
                                    o.Issuer = val
                                }
                            >{lan.booking_airline_company}</InputItem>
                            <InputItem
                                labelNumber={5}
                                placeholder={lan.booking_optional}
                                value={o.MilesCardNo}
                                onChange={(val) =>
                                    o.MilesCardNo = val
                                }
                            // value={milescard.Value}
                            >{lan.booking_card_number}</InputItem>

                        </List>)}
                </Form>
            </ScrollView>
            <Button type={'barButton'} onClick={() => {
                this.refs.form.validateFields(async (error) => {
                    if (!error) {
                        let result;
                        if (this.store.passenger.PassengerCode)
                            result = await this.store.updatePassenger(this.props.booker.UserCode);
                        else
                            result = await this.store.addPassenger(this.props.booker.UserCode);
                        this.props.refresh(result, this.store.selectedCertificate);
                        this.props.navigator.pop();
                    }
                });
            }}>{lan.booking_submit}</Button>
            <ActivityIndicator toast text={lan.booking_loading} animating={this.store.isLoading} />
        </View >

    }
}
//证件列表
@observer
class ProofList extends Component {
    @observable proofTypes = [];
    static defaultProps = {
        navLeftClick: () => { },
        navRightClick: () => { },
    }
    constructor(props) {
        super(props);
        this.setProofTypes();
    }

    setProofTypes = async () => {
        let proofTypes = (await CertificateInfo.getList()).Result.ProofTypes;
        for (let item of proofTypes) {
            item.checked = false;
        }
        for (let item of proofTypes)
            item.Number = null;
        Enumerable.from(this.props.credentials).join(Enumerable.from(proofTypes), "$.ProofType", "$.TypeCode", (a, b) => { b.Number = a.Number; }).toArray();
        let selectedCertificate = this.props.store.selectedCertificate;
        if (selectedCertificate) {
            let target = Enumerable.from(proofTypes).firstOrDefault(o => o.TypeCode == selectedCertificate.ProofType, -1);
            if (target != -1) {
                target.checked = true;
            }
        }
        this.proofTypes = proofTypes;
    }

    render() {
        return <View>
            <NavBar onlyBar title={lan.booking_select_documents} leftText={lan.booking_cancel} onLeftClick={this.props.navLeftClick}
                rightText={lan.booking_determine} onRightClick={() => {
                    let proof = Enumerable.from(this.proofTypes).firstOrDefault(o => o.checked);
                    let target = Enumerable.from(this.props.credentials).firstOrDefault(o => o.ProofType == proof.TypeCode, -1);
                    if (target == -1) {
                        let obj = {
                            CertificateName: proof.Name,
                            ProofType: proof.TypeCode,
                            Number: null,
                            EndDate: null
                        };
                        this.props.store.selectedCertificate = obj;
                    } else {
                        this.props.store.selectedCertificate = target;
                    }
                    Popup.hide();
                }} />
            <List>
                {this.proofTypes.map((d, i) => {
                    return <RadioItem key={i} checked={d.checked} onChange={(event) => {
                        for (let item of this.proofTypes)
                            item.checked = false;
                        d.checked = true;
                    }}>
                        <Flex style={styles.proofList}>
                            <Text style={styles.proofTitle}>{d.Name}</Text>
                            <Text style={styles.proofText}>{d.Number}</Text>
                        </Flex>

                    </RadioItem>
                })}

            </List>
        </View>
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
        color: '#333'
    }






});

