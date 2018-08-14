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
import Picker from '../../components/picker'
import Icon from '../../components/icons/icon';
import List from '../../components/list';
import Checkbox from '../../components/checkbox/'
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import SearchBar from '../../components/search-bar/';
import InputItem from '../../components/input-item/';
import Form from '../../components/form/';
import Button from '../../components/button/'
import DatePicker from '../../components/date-picker'
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
import Passenger from '../../stores/booking/employee-edit';
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
export default class EmployeeEdit extends Component {
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
        let contact = Enumerable.from(passenger.Annts).firstOrDefault(o => o.Name.toLowerCase() == 'phone', -1);
        return <View style={styles.container}>
            <NavBar navigator={this.props.navigator} title={lan.booking_editor_in_flight} />
            <ScrollView>
                <Form ref="form">
                    <List style={[FLEXBOX.bottomSpace]} >
                        <InputItem
                            {...getField(passenger.PersonName) }
                            onChange={(name) => {
                                passenger.PersonName = name;
                                passenger.Name = name;
                            }}
                            value={passenger.PersonName}
                            labelNumber={5}
                            placeholder={lan.booking_please_enter_your_name}>{lan.booking_full_name}</InputItem>
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
                        <InputItem
                            {...getField(contact.Value, 'phone') }
                            placeholder={lan.booking_please_enter_your_cell_phone_number}
                            labelNumber={5}
                            type="number"
                            value={contact.Value}
                            onChange={(phoneValue) => { contact.Value = phoneValue }}>{lan.booking_phone_number}</InputItem>
                        <List.Item extra={this.store.selectedCertificate.CertificateName} arrow="horizontal" onClick={() => Popup.show(<ProofList
                            store={this.store} credentials={passenger.Proofs} navLeftClick={() => Popup.hide()} />, {
                                maskClosable: true,
                                animationType: 'slide-up',
                                onMaskClose: () => { },
                            })} labelNumber={5}>{lan.booking_document_type}</List.Item>
                        <InputItem
                            {...getField(this.store.selectedCertificate.Value) }
                            placeholder={lan.booking_please_enter_your_identification_number}
                            labelNumber={5}
                            value={this.store.selectedCertificate.Value}
                            onChange={(val) => this.store.selectedCertificate.Value = val}>{lan.booking_identification_number}</InputItem>

                    </List>
                    {/*护照信息*/}
                    {!this.store.isOptional ?
                        < List style={[FLEXBOX.bottomSpace]} >
                            <InputItem
                                {...getField(passenger.PersonLastNameEN) }
                                optional={this.store.isOptional}
                                labelNumber={5}
                                placeholder={`${lan.booking_forExample}:LI`}
                                onChange={(lastNameEn) => {
                                    passenger.PersonLastNameEN = lastNameEn;
                                    passenger.LastNameEn = lastNameEn;
                                }}
                                value={passenger.PersonLastNameEN}>{lan.booking_surname}({lan.booking_pinyin})</InputItem>
                            <InputItem
                                {...getField(passenger.PersonFirstNameEN) }
                                labelNumber={5}
                                optional={this.store.isOptional}
                                placeholder={`${lan.booking_forExample}:LEI`}
                                onChange={(firstNameEn) => {
                                    passenger.PersonFirstNameEN = firstNameEn;
                                    passenger.FirstNameEn = firstNameEn;
                                }}
                                value={passenger.PersonFirstNameEN}>{lan.booking_name}({lan.booking_pinyin})</InputItem>
                        </List> : null}
                    {/*常旅客卡*/}
                    {this.store.passenger.Milescards.map((o, i) =>
                        <List key={i} style={[FLEXBOX.bottomSpace]} >
                            <InputItem
                                labelNumber={5}
                                optional
                                placeholder={lan.booking_optional}
                                value={o.Name}
                                onChange={(val) =>
                                    o.Name = val
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
                                value={o.Value}
                                onChange={(val) =>
                                    o.Value = val
                                }
                            // value={milescard.Value}
                            >{lan.booking_card_number}</InputItem>

                        </List>)}
                </Form>
            </ScrollView>
            <Button type={'barButton'} onClick={() => {
                this.refs.form.validateFields(async (error) => {
                    if (!error) {
                        let result = await this.store.updateClientManInfo();
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
        Enumerable.from(this.props.credentials).join(Enumerable.from(proofTypes), "$.Name", "$.TypeCode", (a, b) => { b.Number = a.Value; }).toArray();
        let selectedCertificate = this.props.store.selectedCertificate;
        if (selectedCertificate) {
            let target = Enumerable.from(proofTypes).firstOrDefault(o => o.TypeCode == selectedCertificate.Name, -1);
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
                    let target = Enumerable.from(this.props.credentials).firstOrDefault(o => o.Name == proof.TypeCode, -1);
                    if (target == -1) {
                        let obj = {
                            CertificateName: proof.Name,
                            Name: proof.TypeCode,
                            Value: null,
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
    }






});

