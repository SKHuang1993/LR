
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
    TextInput,
    TouchableOpacity, Alert,
} from 'react-native';

import { List, WhiteSpace, Picker, SearchBar } from 'antd-mobile';
import Flex from '../../components/flex';
import ActivityIndicator from '../../components/activity-indicator';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import Checkbox from '../../components/checkbox/'
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../../components/button/';
import Filter from './filter';
import Employee from '../../stores/staff/'
import { observer } from 'mobx-react/native'
import Enumerable from 'linq';
import { AccountInfo } from '../../utils/data-access/';
const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;
import Modal from '../../components/modal';
import NoDataTip from '../../components/noDataTip.1';
import { PermissionInfo } from '../../utils/data-access/';
import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();

const makeCancelable = (promise) => {
    let hasCanceled_ = false;
    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then((val) =>
            hasCanceled_ ? reject({ isCanceled: true }) : resolve(val)
        );
        promise.catch((error) =>
            hasCanceled_ ? reject({ isCanceled: true }) : reject(error)
        );
    });
    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled_ = true;
        },
    };
};

@observer
export default class Staff extends Component {
    constructor(props) {
        super(props);
        this.store = new Employee();
        this.store.userInfo = AccountInfo.getUserInfo();
        //是否有为他人预订的权限
        let BookingFor_Custom = PermissionInfo.hasPermission(this.store.userInfo.Permission.DataAccessPermissions, "BookingFor_Custom");
        let BookingFor_Organization = PermissionInfo.hasPermission(this.store.userInfo.Permission.DataAccessPermissions, "BookingFor_Organization");

        if (BookingFor_Custom) {
            let deptCodes = Enumerable.from(this.store.userInfo.Permission.AccessOUs).where(o => o.ResourcePropertyID == BookingFor_Custom.ResourcePropertyID).select("$.OUCode").toArray().join(",");
            if (deptCodes.length > 0)
                this.store.departmentCode = deptCodes;
        }
        if (BookingFor_Organization) {
            this.store.departmentCode = [this.store.departmentCode, this.store.userInfo.DeptCode].join(",");
        }
        if (!BookingFor_Organization && !BookingFor_Custom) {
            this.store.PersonCode = this.store.userInfo.EmpCode;
        }
        if (this.store.departmentCode)
            this.store.codes = this.store.departmentCode.split(',');
        this.store.checkedData = this.props.staffData.slice();
        this.store.type = props.type;
        //获取员工列表
        this.store.getEmployeeByCondition(this.store.pageIndex);
    }

    componentDidMount() {

    }

    searchBarLeftView() {
        return (
            <TouchableOpacity style={styles.filterBtn} onPress={() => 1}>
                <Icon icon={'0xe675'} style={styles.filterIcon}></Icon>
            </TouchableOpacity>
        )
    }

    _renderRow(rowData, sectionID, rowID) {
        //性别
        let sex = rowData.Sex == 0 ? lan.women : lan.man;
        let proof = Enumerable.from(rowData.Proofs).firstOrDefault(o => o.Name == "ID", null);
        let disabled = false;
        if (this.store.checkedData.length > 0 && !this.props.routetrip) {
            let PolicyID = this.store.checkedData[0].PolicyID;
            if (rowData.PolicyID != PolicyID)
                disabled = true;
        }
        let disabledStyle = disabled ? { color: '#999' } : null;
        return <View >
            <CheckboxItem checked={rowData.checked} disabled={disabled} onChange={this.getSelect.bind(this, rowData)}>
                <View>
                    <Flex wrap='wrap' >
                        <Text style={[styles.name, disabledStyle]} >
                            {rowData.PersonName}
                        </Text>
                        <Text style={[styles.sex, disabledStyle]}>
                            {sex}
                        </Text>
                        <Text style={[styles.belong, disabledStyle]} numberOfLines={1} >
                            {rowData.DepartmentName}
                        </Text>
                        <Text style={[styles.belong, disabledStyle]}>
                            {proof && proof.Value.replace(proof.Value.substring(2, proof.Value.length - 4), "***")}
                        </Text>
                    </Flex>
                    {rowData.checked ? <View style={[styles.policy]}>

                        <Text style={[styles.policyTxt, disabledStyle]} numberOfLines={1} onPress={
                            async () => {
                                //获取差旅政策
                                if (!rowData.PolicyDetail) {
                                    this.store.isLoading = true;
                                    let msg = await this.store.getPolicy(rowData.PolicyID, this.props.productType);
                                    rowData.PolicyDetail = msg;
                                    this.store.isLoading = false;
                                }
                                // Alert.alert(rowData.PolicyDetail);
                                Modal.alert(lan.businessTripPolicy, (rowData.PolicyDetail), [
                                    { text: lan.confirm, onPress: () => { } },
                                ]);

                            }}>
                            {rowData.PolicyID ? rowData.PolicyName : lan.noBusinessTripPolicy}



                        </Text>
                        <Icon icon='0xe67a' style={[styles.wranIcon, disabledStyle]} />
                    </View> : null}
                </View>
            </CheckboxItem>
        </View>

    }
    // 处理点击数据
    getSelect = (rowData) => {
        let checked = false;
        let position = this.store.employeeList.findIndex(o => o.PersonCode == rowData.PersonCode);
        if (position != -1) {
            let employee = this.store.employeeList[position];
            if (this.props.productType == 3 && this.store.checkedData.length == 5 && !employee.checked) {
                Alert.alert("", "火车票下单最多为5名乘客");
                return;
            }
            employee.checked = checked = !employee.checked;
            this.store.employeeList.splice(position, 1, employee);
        }
        position = this.store.checkedData.findIndex(o => o.PersonCode == rowData.PersonCode);
        if (position == -1) {
            checked = true;
            this.store.checkedData.push(rowData);
        } else {
            checked = false;
            this.store.checkedData.splice(position, 1);
        }
        let target = this.store.PSOPassengerList.find(o => o.PersonCode == rowData.PersonCode);
        if (target) {
            target.checked = checked;
        }
        this.store.employeeList = this.store.employeeList.slice();
    }

    //点击确认数据发送到上一页面
    sendData() {
        let checkedData = this.store.checkedData.filter((o) => o.checked);
        if (this.props.limitNum && checkedData.length != this.props.limitNum) {
            Alert.alert(`请选择${this.props.limitNum}个员工`);
            return;
        }
        if (this.props.checkedData) {
            this.props.checkedData(checkedData);
        }
        if (this.props.navigator) {
            this.props.navigator.pop();
        }

    }
    // 显示 已选的信息列表
    showChecked() {
        let data = [];
        this.store.checkedData.filter((o) => o.checked).map((item, index) => {
            let list = <TouchableOpacity key={index} onPress={this.getSelect.bind(this, item)} style={styles.selectedItem} activeOpacity={.7}>
                <Text style={styles.selectedItemTxt}>{item.PersonName}</Text>
                <Icon style={styles.selectedItemIcon} icon='0xe65f'></Icon>
            </TouchableOpacity>
            data.push(list);
        });

        return data.length >= 1 ? <Flex wrap='wrap' style={styles.selected}>
            {data}
        </Flex> : null;
    }

    getPSOPassengerList() {
        let data = [];
        this.store.PSOPassengerList.map((item, index) => {
            let disabled = false;
            if (this.store.checkedData.length > 0 && !this.props.routetrip) {
                let PolicyID = this.store.checkedData[0].PolicyID;
                if (item.PolicyID != PolicyID)
                    disabled = true;
            }
            let list = <Checkbox disabled={disabled} key={index} checked={item.checked} onChange={() => {
                item.checked = !item.checked;
                this.getSelect(item);
            }}>
                <Text style={styles.name}>{item.PersonName}</Text>
            </Checkbox>
            data.push(list);
        });

        return data.length >= 1 ? <Flex wrap='wrap' style={[styles.selected, { paddingLeft: 14 }]}>
            {data}
        </Flex> : null;
    }

    _onEndReached = () => {
        //console.log('onEndReached');
        if (this.store.employeeList.length >= 20)
            this.store.getEmployeeByCondition(this.store.pageIndex + 1);
    }

    onSearch = (text) => {
        this.store.isEmployeeLoaded = false;
        this.store.employeeList.clear();
        this.store.getEmployeeByCondition(1);
    }

    getFilterData = (departments, policies) => {
        this.store.isEmployeeLoaded = false;
        this.store.employeeList.clear();
        this.store.policyID = Enumerable.from(policies).where(o => o.checked).select('$.PolicyID').toArray().join(',');
        let codes = Enumerable.from(departments).where(o => o.checked).select('$.DepartmentCode').toArray().join(',');
        this.store.departmentCode = codes.length == 0 ? this.store.codes.join(',') : codes;
        this.store.getEmployeeByCondition(1);
    }
    // 导航栏右边内容
    navBarRight() {
        return <View style={{ marginRight: -10 }}>
            <Filter store={this.store} navigator={this.props.navigator} getFilterData={(departments, policies) => this.getFilterData(departments, policies)} />
        </View>
    }



    render() {

        return (
            <View style={styles.container}>
                {this.store.isEmptyData ? <NoDataTip /> : null}
                <NavBar navigator={this.props.navigator}
                    title={this.props.type == 1 ? lan.passengers_choosingPeers : lan.passengers_EmployeeSelection}
                    rightView={
                        this.navBarRight()
                    }
                />
                <View style={[FLEXBOX.flexStart, styles.search]}>
                    <TextInput
                        placeholder={lan.passengers_staffSearchPlaceholder}
                        style={styles.searchInput}
                        onChangeText={(text) => { this.store.condition = text; }}
                        value={this.store.condition}
                        returnKeyType='search'
                        onSubmitEditing={() => this.onSearch(this.store.condition)}
                    />
                    <TouchableOpacity style={styles.searchBtn} onPress={(text) => {
                        this.onSearch(this.store.condition);
                    }}>
                        <Text style={styles.searchBtnTxt}>搜索</Text>
                    </TouchableOpacity>
                </View>
                {/*显示 已选的信息列表*/}
                {this.getPSOPassengerList()}
                {this.showChecked()}

                <ListView style={{ flex: 1, marginTop: 10 }}
                    enableEmptySections={true}
                    removeClippedSubviews={false}
                    dataSource={this.store.getDataSource}
                    renderRow={this._renderRow.bind(this)}
                    keyboardDismissMode={"on-drag"}
                    keyboardShouldPersistTaps='always'
                    renderFooter={() => {
                        return ((this.store.isEmployeeLoaded || this.store.isLoading) ? null : <TouchableOpacity style={{ alignItems: 'center', padding: 10 }}
                            onPress={() => this._onEndReached()}><Text>{lan.passengers_loadHint}</Text></TouchableOpacity>)
                    }}
                />
                <Button style={styles.confirmBtn} onClick={this.sendData.bind(this)} textStyle={styles.confirmBtnTxt} >{lan.confirm}</Button>
                <ActivityIndicator toast text={lan.loading} animating={this.store.isLoading} />
            </View >
        )
    }
}







const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.containerBg,
    },
    filterBtn: {
        flex: 0,
        width: 30,
        height: 30,
        borderWidth: 1 / FLEXBOX.pixel,
        borderColor: '#ccc',
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    policy: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        marginTop: 2,
        //justifyContent: 'flex-start',
    },
    name: {
        marginRight: 15,
        flex: 0,
        width: FLEXBOX.width * 0.15,
        color: '#333'
    },
    sex: {
        marginRight: 15,
        color: '#333'
    },
    belong: {
        flex: 1,
        //width: FLEXBOX.width * 0.2,
        color: '#333'

    },
    wranIcon: {
        fontSize: 12,
        color: '#999',
        marginRight: 2,
    },
    policyTxt: {
        color: '#666',
        fontSize: 12,
        // width: FLEXBOX.width * 0.2,
    },
    confirmBtn: {
        borderRadius: 0,
        borderWidth: 0,
        backgroundColor: COLORS.secondary,
    },
    confirmBtnTxt: {
        color: '#fff'
    },
    selectedItem: {
        borderRadius: 3,
        backgroundColor: COLORS.secondary,
        flexDirection: 'row',
        padding: 5,
        paddingLeft: 5,
        paddingRight: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5,
        marginBottom: 5,

    },
    selectedItemTxt: {
        color: '#fff'
    },
    selectedItemIcon: {
        color: '#fff',
        fontSize: 10
    },
    selected: {
        padding: 10,
        paddingBottom: 0,
    },
    search: {
        // height: 30,
        flex: 0,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 10,

        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor:'red'
    },
    searchInput: {
        backgroundColor: '#fff',
        height: 30,
        lineHeight: 30,
        flex: .8,
        marginRight: 10,
        padding: 0,
        paddingLeft: 10,
        fontSize: 14,
        borderRadius: 4,

    },
    searchBtn: {
        backgroundColor: COLORS.secondary,
        // width:50,
        flex: .15,
        borderRadius: 4,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',

    },
    searchBtnTxt: {
        color: '#fff'

    },


});

