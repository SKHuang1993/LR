
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

import { WhiteSpace, Toast } from 'antd-mobile';
import ActivityIndicator from '../../components/activity-indicator';
import Flex from '../../components/flex';
import NavBar from '../../components/navBar';
import List from '../../components/list';
import Picker from '../../components/picker'
import Icon from '../../components/icons/icon';
import Checkbox from '../../components/checkbox/'
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import SearchBar from '../../components/search-bar/';
import InputItem from '../../components/input-item/';
import DatePicker from '../../components/date-picker';
import Form from '../../components/form/';
import Button from '../../components/button/'
import Employee from '../../stores/staff/'
import { observer } from 'mobx-react/native'
import ClientManInfo from '../../stores/staff/add'
import { AccountInfo } from '../../utils/data-access/';
import CostCenter from '../booking/costCenter';
import { extendObservable, action, computed, toJS, observable } from 'mobx';
const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;
import moment from 'moment';
import 'moment/locale/zh-cn';
import Filter from './filter';

const defaultDate = moment().locale('zh-cn').utcOffset(8);
const getField = new Form().getField;

import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();

/*** 
 ## Base.InsertClientManInfo 新增员工
 ## CRM.ClientManNoInsert 新增第三方客户(账号)信息 
***/

//旅客接口 CRM.ProofTypeGet  获取旅客证件类型
//账号类型
const AccountTypes = [
    {
        "value": "0",
        "label": lan.phoneNumber,

    },
    {
        "value": "1",
        "label": lan.emial,

    },]
// 新增员工 第一步
@observer
export default class AddEmployee extends Component {
    constructor(props) {
        super(props);
        this.store = new ClientManInfo();
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

    componentDidMount() {
        this.store.getProofTypes();//证件列表
        this.store.getDeparmentGetList();//部门列表
    }

    //下一步
    confirm() {
        this.refs.form.validateFields((error) => {
            if (!error) {
                this.props.navigator.push({
                    component: AddPolicy,
                    passProps: {
                        store: this.store,
                        refresh: this.props.refresh
                    }
                })
            }
        })
    }


    render() {
        let clientMan = this.store.info.ClientMan;
        return <View style={styles.container}>
            <NavBar navigator={this.props.navigator} title={lan.passengers_newEmployees} />
            {/*步骤*/}
            {steps('active', null, null)}
            <ScrollView keyboardDismissMode={"on-drag"}>
                <Form ref="form">
                    <List renderHeader={() => `${lan.passengers_essentialInformation}*`}>
                        <InputItem
                            {...getField(clientMan.Name) }
                            onChange={(name) => { clientMan.Name = name }}
                            value={clientMan.Name}
                            labelNumber={5}
                            placeholder={lan.passengers_namePh}>{lan.fullName}</InputItem>
                        <Picker
                            {...getField(clientMan.Sex ? [clientMan.Sex] : null) }
                            data={this.state.sexData} cols={1}
                            title={lan.sex}
                            labelNumber={5}
                            extra={lan.passengers_selectHint}

                            value={clientMan.Sex ? [clientMan.Sex] : null}
                            triggerType="onClick"
                            onChange={(sex) => clientMan.Sex = sex[0]}>
                            <List.Item arrow="horizontal" labelNumber={5}   >{lan.sex}</List.Item>
                        </Picker>
                        <InputItem
                            {...getField(clientMan.Annts[0].Value, 'phone') }
                            placeholder={lan.passengers_phoneNumPh}
                            labelNumber={5}
                            value={clientMan.Annts[0].Value}
                            type="number"
                            onChange={(phoneValue) => clientMan.Annts[0].Value = phoneValue}>{lan.phoneNumber}</InputItem>
                        <InputItem
                            {...getField(clientMan.Annts[1].Value, 'email') }
                            labelNumber={5}
                            optional={true}
                            placeholder={lan.passengers_emailPh}
                            value={clientMan.Annts[1].Value}
                            onChange={(emailValue) => clientMan.Annts[1].Value = emailValue}>{lan.emial}</InputItem>

                        {/*所属组织 */}
                        <Picker
                            {...getField(clientMan.DepartmentCode ? [clientMan.DepartmentCode] : null) }
                            data={this.store.deparmentGetList} cols={1}
                            title={lan.passengers_organization}
                            extra={lan.passengers_selectHint}
                            value={clientMan.DepartmentCode ? [clientMan.DepartmentCode] : null}
                            triggerType="onClick"
                            onChange={(departmentCode) => clientMan.DepartmentCode = departmentCode[0]}>
                            <List.Item arrow="horizontal" labelNumber={5} last >{lan.passengers_organization}</List.Item>
                        </Picker>

                    </List>
                    {/*证件信息*/}
                    {clientMan.Proofs.map((o, i) =>
                        <List key={i} renderHeader={i == 0 ? () => `${lan.passengers_IDInformation}*` : null} style={FLEXBOX.bottomSpace}>
                            <ProofItem proof={o}  {...getField() } />
                        </List>
                    )}
                    {/*新增一个证件--按钮*/}
                    <View style={[styles.addBtn, FLEXBOX.bottomSpace]}>
                        <TouchableOpacity activeOpacity={0.7} style={styles.addBtn_box} onPress={() => {
                            clientMan.Proofs.push({
                                "Name": null,
                                "Value": null,
                                "EndDate": null
                            })
                        }}>
                            <Text style={styles.addBtn_txt}>
                                {lan.passengers_btnNewID}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {/*护照信息*/}
                    {clientMan.Proofs.filter((o) => o.Name && o.Name != 'ID' && o.Name != '10').length > 0 ?
                        < List renderHeader={() => `${lan.passengers_passportInformation}*`}>
                            <InputItem
                                labelNumber={5}
                                placeholder={lan.passengers_lastNamePh}
                                onChange={(lastNameEn) => {
                                    clientMan.LastNameEn = lastNameEn
                                }}
                                value={clientMan.LastNameEn}>{lan.passengers_lastName}</InputItem>
                            <InputItem
                                labelNumber={5}
                                placeholder={lan.passengers_firstNamePh}
                                onChange={(firstNameEn) => {
                                    clientMan.FirstNameEn = firstNameEn
                                }}
                                value={clientMan.FirstNameEn}>{lan.passengers_firstName}</InputItem>
                        </List> : null}
                    {/*其他信息*/}
                    {clientMan.Milescards.map((o, i) =>
                        <List key={i} renderHeader={i == 0 ? () => lan.passengers_otherInformation : null} style={FLEXBOX.bottomSpace}>
                            {i == 0 ?
                                <InputItem
                                    labelNumber={5}
                                    placeholder={lan.passengers_inputHint}
                                    onChange={(employeeNumber) => { clientMan.ThirdPartyID = employeeNumber }}
                                    value={clientMan.ThirdPartyID}>{lan.passengers_employeeNumber}</InputItem> : null}
                            <MilescardsItem milescard={o} />
                        </List>
                    )}
                    {/*新增一个--按钮*/}
                    <View style={[styles.addBtn, FLEXBOX.bottomSpace]}>
                        <TouchableOpacity activeOpacity={0.7} style={styles.addBtn_box} onPress={() => {
                            clientMan.Milescards.push({
                                "Name": null,
                                "Value": null,
                                "EndDate": null
                            })
                        }}>
                            <Text style={styles.addBtn_txt}>
                                {lan.passengers_addOne}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Form>
            </ScrollView>
            <Flex style={styles.buttonBar}>
                <Button style={styles.confirmBtn} onClick={this.confirm.bind(this)} textStyle={styles.confirmBtnTxt} >{lan.passengers_next}</Button>
            </Flex>
        </View >

    }
}

// 相关政策 第二步
@observer
class AddPolicy extends Component {
    constructor(props) {
        super(props);
        this.store = props.store;
        this.store.costGetList();
        this.store.getCustomerApproveByCondition();
        this.store.roleMTRGetList();
        this.store.getPolicyList();
        this.state = {

        }
    }

    //下一步
    confirm() {
        this.refs.form.validateFields((error) => {
            if (!error) {
                this.store.insertClientManInfo(toJS(this.store.info), (personCode) => {
                    if (personCode) {
                        this.props.refresh();
                        if (this.props.navigator) {
                            this.props.navigator.push({
                                component: AddAccount,
                                passProps: {
                                    store: this.store,
                                    personCode: personCode,
                                    refresh: this.props.refresh
                                }
                            })
                        }
                    }
                });
            }
        })
    }

    //跳转回员工列表
    jumpToEmployeeList = () => {
        let currentRouteStack = this.props.navigator.getCurrentRoutes();
        this.props.navigator.jumpTo(currentRouteStack[currentRouteStack.length - 3]);
    }

    render() {
        let clientMan = this.store.info.ClientMan;
        return <View style={styles.container}>
            <NavBar navigator={this.props.navigator} title={lan.passengers_newEmployees} />
            {/*步骤*/}
            {steps('gray', 'active', null)}
            <ScrollView keyboardDismissMode={"on-drag"}>
                <Form ref="form">
                    <List renderHeader={() => `${lan.passengers_relevantPolicy}*`}>
                        <Picker
                            {...getField(clientMan.PolicyID ? [clientMan.PolicyID] : null) }
                            data={this.store.policyList} cols={1}
                            title={lan.businessTripPolicy}
                            labelNumber={5}
                            extra={lan.passengers_selectHint}
                            value={clientMan.PolicyID ? [clientMan.PolicyID] : null}
                            triggerType="onClick"
                            onChange={(policyID) => clientMan.PolicyID = policyID[0]}>
                            <List.Item arrow="horizontal" last >差旅政策</List.Item>
                        </Picker>
                        <Picker
                            {...getField(this.store.info.ApproveID ? [this.store.info.ApproveID] : null) }
                            data={this.store.approveRules} cols={1}
                            title={lan.passengers_approvalRules}
                            labelNumber={5}
                            extra={lan.passengers_selectHint}
                            value={this.store.info.ApproveID ? [this.store.info.ApproveID] : null}
                            triggerType="onClick"
                            onChange={(approveID) => this.store.info.ApproveID = approveID[0]}>
                            <List.Item arrow="horizontal" last >{lan.passengers_approvalRules}</List.Item>
                        </Picker>
                        <List.Item arrow="horizontal"
                            onClick={() => {
                                this.props.navigator.push({
                                    component: CostCenter,
                                    passProps: {
                                        costCenterID: clientMan.CostCenterID,
                                        confirm: (val) => {
                                            if (val) {
                                                clientMan.CostCenterInfo = val.CostName;
                                                clientMan.CostCenterID = val.CostID;
                                            }
                                        }
                                    }
                                })
                            }}
                            {...getField(clientMan.CostCenterID) }
                            optional={false}
                            extra={clientMan.CostCenterInfo ? clientMan.CostCenterInfo : lan.passengers_selectHint}>{lan.booking_cost_center}</List.Item>
                        <Picker
                            {...getField(this.store.info.RoleID ? [this.store.info.RoleID] : null) }
                            data={this.store.roles} cols={1}
                            title={lan.passengers_employeeRole}
                            labelNumber={5}
                            extra={lan.passengers_selectHint}
                            value={this.store.info.RoleID ? [this.store.info.RoleID] : null}
                            triggerType="onClick"
                            onChange={(roleID) => this.store.info.RoleID = roleID[0]}>
                            <List.Item arrow="horizontal" last >{lan.passengers_employeeRole}</List.Item>
                        </Picker>
                    </List>
                </Form>
            </ScrollView>
            <Flex style={styles.buttonBar}>
                <Button style={[styles.backBtn]} onClick={this.jumpToEmployeeList.bind(this)} textStyle={styles.backBtnTxt} >{lan.passengers_returnList}</Button>
                <Button style={styles.confirmBtn} onClick={this.confirm.bind(this)} textStyle={styles.confirmBtnTxt} >{lan.passengers_save}</Button>
            </Flex>
            <ActivityIndicator toast text={lan.loading} animating={this.store.isLoading} />
        </View>

    }
}
// 开通账号 第三步
@observer
class AddAccount extends Component {
    constructor(props) {
        super(props);
        this.store = props.store;
        this.state = {
            type: ['0']
        }
    }

    confirm = () => {
        this.refs.form.validateFields((error) => {
            if (!error) {
                this.store.clientManNoInsert(toJS(this.store.clientMan), this.props.personCode, (account) => {
                    if (account) {
                        Alert.alert(
                            "", lan.passengers_accountSuccessfully,
                            [
                                {
                                    text: lan.confirm, onPress: () => {
                                        this.props.refresh();
                                        let currentRouteStack = this.props.navigator.getCurrentRoutes();
                                        this.props.navigator.jumpTo(currentRouteStack[currentRouteStack.length - 4]);
                                    }
                                }
                            ]
                        )
                    }
                })
            }
        })
    }

    //跳转回员工列表
    jumpToEmployeeList = () => {
        let currentRouteStack = this.props.navigator.getCurrentRoutes();
        this.props.navigator.jumpTo(currentRouteStack[currentRouteStack.length - 4]);
    }

    render() {
        let clientManNoInsert = this.store.clientMan;
        return <View style={styles.container}>
            <NavBar navigator={this.props.navigator} title={lan.passengers_newEmployees} />
            {/*步骤*/}
            {steps('gray', 'gray', 'active')}
            <ScrollView keyboardDismissMode={"on-drag"}>
                <Form ref="form">
                    <List renderHeader={() => `${lan.passengers_accountDredge}*`}>
                        <Picker
                            data={AccountTypes} cols={1}
                            title={lan.passengers_accountType}
                            labelNumber={5}
                            value={this.state.type}
                            triggerType="onClick"
                            onChange={(type) => this.setState({ type })}>
                            <List.Item arrow="horizontal" labelNumber={5} last >{lan.passengers_accountType}</List.Item>
                        </Picker>
                        {this.state.type == 0 ?
                            <InputItem optional={this.state.type == 1}
                                {...getField(clientManNoInsert.Phone, 'phone') }
                                placeholder={lan.passengers_phoneNumPh}
                                labelNumber={5}
                                onChange={(phone) => {
                                    clientManNoInsert.Phone = phone
                                }}
                                value={clientManNoInsert.Phone}>{lan.phoneNumber}</InputItem> :
                            <InputItem
                                {...getField(clientManNoInsert.Email, 'email') }
                                optional={this.state.type == 0}
                                placeholder={`${lan.passengers_inputHint}${lan.emial}`}
                                labelNumber={5}
                                onChange={(email) => {
                                    clientManNoInsert.Email = email
                                }}
                                value={clientManNoInsert.Email}>{lan.email}</InputItem>}
                        <InputItem
                            {...getField(clientManNoInsert.PassWord) }
                            labelNumber={5}
                            password
                            placeholder={`${lan.passengers_inputHint}${lan.passengers_password}`}
                            onChange={(password) => {
                                clientManNoInsert.PassWord = password
                                if (!password)
                                    clientManNoInsert.RePassWord = null
                            }}
                            value={clientManNoInsert.PassWord}>{lan.passengers_password}</InputItem>
                        <InputItem
                            {...getField(this.state.RePassWord) }
                            labelNumber={5}
                            password
                            errorInfo={lan.passengers_passwordDifferent}
                            editable={clientManNoInsert.PassWord ? true : false}
                            placeholder={lan.passengers_passwordConfirm}
                            validator={(text) =>
                                text == clientManNoInsert.PassWord ? true : false
                            }
                            onChange={(RePassWord) => {
                                clientManNoInsert.RePassWord = RePassWord
                            }}
                            value={clientManNoInsert.RePassWord}>{lan.passengers_passwordConfirm}</InputItem>
                    </List>
                </Form>
            </ScrollView>
            <Flex style={styles.buttonBar}>
                <Button style={[styles.backBtn]} onClick={this.jumpToEmployeeList.bind(this)} textStyle={styles.backBtnTxt} >{lan.passengers_returnList}</Button>
                <Button style={styles.confirmBtn} onClick={() => this.confirm()} textStyle={styles.confirmBtnTxt} >{lan.passengers_dredge}</Button>
            </Flex>
            <ActivityIndicator toast text={lan.loading} animating={this.store.isLoading} />
        </View>

    }
}




//*证件信息*/
@observer
class ProofItem extends Component {
    static defaultProps = {
        onDelClick: (v) => { },
    };
    constructor(props) {
        super(props);
        this.state = {
            focused: '',
            proofValue: [],
            dataValue: undefined,
            value: ''
        }
    }
    render() {
        let proof = this.props.proof;
        let store = this._reactInternalInstance._currentElement._owner._instance.store;
        let proofs = store.info.ClientMan.Proofs;
        return (
            <View style={[FLEXBOX.flexBetween, this.props.style]} >
                <View style={{ flex: 1 }}>
                    <Picker
                        {...getField(proof.Name ? [proof.Name] : []) }
                        data={store.proofTypes} cols={1}
                        title={lan.passengers_IDType}
                        extra={lan.passengers_selectHint}
                        value={proof.Name ? [proof.Name] : []}
                        triggerType="onClick"
                        onChange={(Name) => {
                            if (proofs.filter((o) => o.Name == Name).length > 0)
                                setTimeout(() =>
                                    Alert.alert(lan.passengers_duplicateCredentials), 500)
                            else
                                proof.Name = Name[0]
                        }}>
                        <List.Item labelNumber={5} arrow="horizontal" last >{lan.passengers_IDType}</List.Item>
                    </Picker>
                    <InputItem
                        {...getField(proof.Value) }
                        labelNumber={5}
                        placeholder={`${lan.passengers_inputHint}${lan.passengers_IDNumber}`}
                        onChange={(Value) => {
                            proof.Value = Value
                        }}
                        value={proof.Value}

                    >{lan.passengers_IDNumber}</InputItem>
                    <DatePicker
                        defaultDate={defaultDate}
                        value={proof.EndDate ? moment(proof.EndDate).locale('zh-cn').utcOffset(8) : null}
                        mode="date"
                        title='日期'
                        extra="请选择"
                        minDate={defaultDate}
                        onChange={(EndDate) => proof.EndDate = EndDate.format('YYYY-MM-DD')} >
                        <List.Item arrow="horizontal" labelNumber={5}>
                            {lan.passengers_validDate}
                        </List.Item>
                    </DatePicker>

                </View>
                {/*删除按钮*/}
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.del}
                    onPress={() => {
                        if (proofs.length == 1) {
                            for (let item in proof)
                                proof[item] = null;
                        } else
                            proofs.remove(proof)
                    }}
                >
                    <Icon icon={'0xe67c'} style={styles.delIcon} />
                </TouchableOpacity>
            </View >


        )
    }

}
// Milescards  里程卡信息 
@observer
class MilescardsItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: '',
        }
    }
    render() {
        let milescard = this.props.milescard;
        let store = this._reactInternalInstance._currentElement._owner._instance.store;
        let milescards = store.info.ClientMan.Milescards;
        return (
            <View style={[FLEXBOX.flexBetween, this.props.style]} >
                <View style={{ flex: 1 }}>
                    <InputItem
                        labelNumber={5}
                        placeholder={lan.passengers_inputHint}
                        onChange={(name) => {
                            milescard.Name = name
                        }}
                        value={milescard.Name}>{lan.passengers_sailingCard}</InputItem>
                    <InputItem
                        labelNumber={5}
                        placeholder={lan.passengers_inputHint}
                        onChange={(value) => {
                            milescard.Value = value
                        }}
                        value={milescard.Value}>{lan.passengers_travelCardNumber}</InputItem>
                </View>
                {/*删除按钮*/}
                <TouchableOpacity
                    onPress={() => {
                        if (milescards.length == 1) {
                            for (let item in milescard)
                                milescard[item] = null;
                        } else
                            milescards.remove(milescard);
                    }}
                    activeOpacity={1}
                    style={styles.del}>
                    <Icon icon={'0xe67c'} style={styles.delIcon} />
                </TouchableOpacity>
            </View>
        )
    }
}

// 步骤

/**
   * 参数  active 当前状态 null 已选状态 gray 未选状态 

   */
const steps = (one = 'active', two = null, three = null) => {

    one = { color: one == 'active' ? COLORS.secondary : one == 'gray' ? '#333' : '#999' };
    two = { color: two == 'active' ? COLORS.secondary : two == 'gray' ? '#333' : '#999' };
    three = { color: three == 'active' ? COLORS.secondary : three == 'gray' ? '#333' : '#999' };
    return <Flex justify='between' style={styles.steps}>
        <Flex><Text style={[styles.steps_num, styles.steps_textActive, one]}>①</Text><Text style={[styles.steps_text, one]}>{lan.passengers_employeeInformation}</Text></Flex>
        <Icon icon='0xe677' style={styles.steps_icon} />
        <Flex><Text style={[styles.steps_num, two]}>②</Text><Text style={[styles.steps_text, two]}>{lan.passengers_relevantPolicy}</Text></Flex>
        <Icon icon='0xe677' style={styles.steps_icon} />
        <Flex><Text style={[styles.steps_num, three]}>③</Text><Text style={[styles.steps_text, three]}>{lan.passengers_accountDredge}</Text></Flex>
    </Flex>
}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.containerBg,
    },

    del: {

        width: FLEXBOX.width * 0.12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    delIcon: {
        color: '#999',
        fontSize: 20
    },

    addBtn: {
        alignItems: 'center',

    },
    addBtn_box: {
        padding: 10,
        borderRadius: 20,
        width: FLEXBOX.width * .6,
        backgroundColor: '#fff'
    },
    addBtn_txt: {
        color: '#333',
        textAlign: 'center'
    },
    //底部栏
    buttonBar: {
        borderTopColor: '#ddd',
        borderTopWidth: 1 / FLEXBOX.pixel
    },
    confirmBtn: {
        flex: 1,
        borderRadius: 0,
        borderWidth: 0,
        backgroundColor: COLORS.secondary,
    },
    confirmBtnTxt: {
        color: '#fff',
        fontSize: 14,
    },
    backBtn: {
        borderRadius: 0,
        borderWidth: 0,
        backgroundColor: '#fff',
    },
    backBtnTxt: {
        color: '#666',
        fontSize: 14,
    },
    //步骤组件
    steps: {
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#fff'
    },
    steps_num: {
        fontSize: 18
    },
    steps_icon: {
        fontSize: 12,
        color: '#8f8f8f'
    },
    steps_txt: {
        fontSize: 14,
        color: '#333'
    },
    steps_textActive: {
        color: COLORS.secondary
    },




});

