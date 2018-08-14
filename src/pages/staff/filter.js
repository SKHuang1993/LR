

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ListView,
    TouchableOpacity,
    TouchableHighlight,
    Animated,
    ScrollView,
} from 'react-native';

import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();


import { Popup, WhiteSpace, Button, Tabs } from 'antd-mobile';
import List from '../../components/list';
import Checkbox from '../../components/checkbox/index';
const AgreeItem = Checkbox.AgreeItem;
const CheckboxItem = Checkbox.CheckboxItem;

import Flex from '../../components/flex';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import ToolBar from '../../components/toolBar/';
import TabButton from '../../components/tabButton/';
import Menu from '../../components/menu/index';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { COLORS, FLEXBOX } from '../../styles/commonStyle';
import Employee from '../../stores/staff/'
import { observer } from 'mobx-react/native';
import Add from './add'
const TabPane = Tabs.TabPane;
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { PermissionInfo } from '../../utils/data-access';

// 差旅政策列表
//## 接口名称 BIZ.PolicyGetList  获取差旅政策列表
const Policys = [
    {
        "PolicyID": 21,
        "PolicyName": "yqf差旅政策1",
        "Apps": "1,0",
        "CreateTime": "2012-12-14T00:00:00",
        "CreateUser": "RCN003AA",
        "LastModifyTime": "2013-04-17T09:52:41.13",
        "LastModifyUser": "RCN003AA",
        "ThirdPartyID": "ff8080813bd60d82013c42d1707b004c"
    },
    {
        "PolicyID": 22,
        "PolicyName": "yqf差旅政策2",
        "Apps": "1,0",
        "CreateTime": "2012-12-14T00:00:00",
        "CreateUser": "RCN003AA",
        "LastModifyTime": "2013-01-16T00:00:00",
        "LastModifyUser": "RCN003AA",
        "ThirdPartyID": "ff8080813bd60d82013c42d19586004d"
    },

];

// 部门列表
//## CRM.DeparmentGetList  取得部门列表
Deparments = [
    {
        "CompanyCode": "HS001",
        "DepartmentCode": "HS00101",
        "NameCn": "管理组",
        "IsInvalid": false,
        "Remark": ""
    },
    {
        "CompanyCode": "HS001",
        "DepartmentCode": "HS00102",
        "NameCn": "销售部",
        "IsInvalid": false,
        "Remark": ""
    },
    {
        "CompanyCode": "HS001",
        "DepartmentCode": "HS00103",
        "NameCn": "财务部",
        "IsInvalid": true,
        "Remark": ""
    },
    {
        "CompanyCode": "HS001",
        "DepartmentCode": "HS00104",
        "NameCn": "销售组1",
        "ParentDepartmentCode": "HS00102",
        "IsInvalid": false,
        "Remark": ""
    },
    {
        "CompanyCode": "HS001",
        "DepartmentCode": "HS00105",
        "NameCn": "销售组1-1",
        "ParentDepartmentCode": "HS00102",
        "IsInvalid": false,
        "Remark": ""
    },
    {
        "CompanyCode": "HS001",
        "DepartmentCode": "HS00107",
        "NameCn": "销售组1-1-2",
        "ParentDepartmentCode": "HS00102",
        "IsInvalid": false,
        "Remark": ""
    },
    {
        "CompanyCode": "HS001",
        "DepartmentCode": "HS00106",
        "NameCn": "销售组1-13",
        "ParentDepartmentCode": "HS00103",
        "IsInvalid": false,
        "Remark": ""
    }
]

@observer
export default class Filter extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store;
        this.store.getDeparmentGetList();
        this.store.getPolicyList();
    }

    policysList() {
        let data = [];
        Policys.map((item, index) => {
            let list = <List.Item style={styles.listItem} key={item.PolicyID}  >
                <Checkbox right onChange={() => { }}
                    style={{ tintColor: '#fa5e5b' }}  >
                    <Text style={{ flex: 1 }}>{item.PolicyName}</Text>
                </Checkbox>
            </List.Item>
            return data.push(list)
        })
        return data;
    }

    //部门
    deparmentsList() {
        let data = [];
        Deparments.map((item, index) => {
            console.log(111, item)
            let list = Object.keys(item)[3].indexOf('Parent') == -1 ? <View key={item.DepartmentCode}><List.Item style={styles.listItem}   >
                <Checkbox right onChange={() => { }}
                    style={{ tintColor: '#fa5e5b' }}  >
                    <Text style={{ flex: 1 }}>{item.NameCn}</Text>
                </Checkbox>
            </List.Item>
                <View style={{ paddingLeft: 25 }}>
                    <List.Item style={styles.listItem}  >
                        <Checkbox right onChange={() => { }}
                            style={{ tintColor: '#fa5e5b' }}  >
                            <Text style={{ flex: 1 }}>{item.NameCn}</Text>
                        </Checkbox>
                    </List.Item>
                </View>

            </View> : null;
            return data.push(list)
        })
        return treeMenu(Deparments);
    }
    //转分类数组
    treeMenu(tree) {
        var newTree = [];
        var tmp = [];
        var item = [];
        //遍历数组，建立临时扁平数据
        for (var x in tree) {
            item[tree[x].DepartmentCode] = { NameCn: tree[x].NameCn };

        }
        //遍历数组，同时获取每个对象的父节点和子节点数据
        for (var x in tree) {
            var parentId = tree[x].ParentDepartmentCode;
            var childCode = tree[x].DepartmentCode;
            var childName = tree[x].NameCn;
            //该对象的父元素节点在临时数据中的对应位置有数据存在时
            //说明这是一个二级以上的节点
            //将它的数据传递给父节点对应的子节点位置

            if (item[parentId]) {
                //item[parentId][childId] = item[tree[x].DepartmentCode];
                //item[parentId][childId] = item[tree[x].DepartmentCode];

                if (!item[parentId]['children']) {
                    item[parentId]['children'] = [];
                }
                item[parentId]['children'].push({ DepartmentCode: childCode, NameCn: childName });

            }
            //如果没有，说明这是一个一级节点，直接传递给最终结果
            else {
                item[tree[x].DepartmentCode]['DepartmentCode'] = tree[x].DepartmentCode;
                //newTree.push(item[tree[x].DepartmentCode]);
                newTree.push(item[tree[x].DepartmentCode]);
            }
            //因为传递的值为引用值，所以当处理数据时
            //对子节点进行操作后,同样会反映到父节点中，最后体现在最终结果里        
        }
        item = null; // 解除临时数据

        return newTree;
    }
    //  console.log(2222, treeMenu(Deparments));
    // 根据部门数据生成无限分级
    generateMenu(menuObj) {

        let vdom = [];

        if (menuObj instanceof Array) {
            let list = [];
            for (var item of menuObj) {
                list.push(this.generateMenu(item));
            }
            vdom.push(
                list
            );
        } else {
            vdom.push(
                <View key={menuObj.DepartmentCode} style={{ paddingLeft: 10 }}>
                    <List.Item style={styles.listItem}   >
                        <Checkbox right onChange={() => { }}
                            style={{ tintColor: '#fa5e5b' }}  >
                            <Text style={{ flex: 1 }}>{menuObj.NameCn}</Text>
                        </Checkbox>
                    </List.Item>
                    {menuObj.children ? this.generateMenu(menuObj.children) : null}
                </View>
            );
        }
        return vdom;
    }

    _row(rowData, sectionID, rowID) {
        let deparmentsList = [];
        this.fun(rowData, deparmentsList)
        return <View>
            <List.Item style={styles.listItem}   >
                <Checkbox right onChange={() => { }}
                    style={{ tintColor: '#fa5e5b' }}  >
                    <Text style={{ flex: 1 }}>{rowData.NameCn}</Text>
                </Checkbox>
            </List.Item>
            {deparmentsList}
        </View>
    }

    fun = (r, deparmentsList) => {
        for (let rowData of r.subDepartments) {
            let _deparmentsList = [];
            this.fun(rowData, _deparmentsList);
            deparmentsList.push(
                <View key={rowData.DepartmentCode} style={{ paddingLeft: 20 }}>
                    <List.Item style={styles.listItem}   >
                        <Checkbox right onChange={() => { }}
                            style={{ tintColor: '#fa5e5b' }}  >
                            <Text style={{ flex: 1 }}>{rowData.NameCn}</Text>
                        </Checkbox>
                    </List.Item>
                    {_deparmentsList}
                </View>)
        }
    }


    _renderRow(rowData, sectionID, rowID) {
        return <DeparmentItem rowData={rowData} />
    }

    _renderPoliceItem(rowData, sectionID, rowID) {
        return <PolicyItem store={this.store} rowData={rowData} />
    }

    getPopupContent = (num) => {
        return (
            <View style={{ height: 400 }}>
                <NavBar onlyBar leftText={lan.cancel} title={lan.filter} rightText={lan.confirm} onLeftClick={() => Popup.hide()} onRightClick={() => {
                    this.props.getFilterData(this.store.traversalTree(), this.store.policies);
                    Popup.hide();
                }} />

                <ScrollableTabView
                    prerenderingSiblingsNumber={2}
                    renderTabBar={() => <TabButton textActiveStyle={styles.tabButtonAT} style={styles.tabButton} tabItemActiveStyle={styles.tabButtonAI} textStyle={styles.tabButtonT} tabItemStyle={styles.tabButtonI} tabNames={[lan.passengers_organization, lan.businessTripPolicy]}
                    />}
                    tabBarPosition='top'>
                    <ListView enableEmptySections={true}
                        style={{ flex: 1, backgroundColor: '#e6eaf2' }}
                        renderRow={this._renderRow.bind(this)}
                        dataSource={this.store.getDepartments}>
                    </ListView>

                    <ListView enableEmptySections={true}
                        style={{ flex: 1, backgroundColor: '#e6eaf2' }}
                        renderRow={this._renderPoliceItem.bind(this)}
                        dataSource={this.store.getPolicies}>
                    </ListView>
                    {/*<ListView enableEmptySections={true}
                        style={{ flex: 1 }}
                        renderRow={this._row.bind(this)}
                        dataSource={this.store.getDepartments}>
                    </ListView>*/}

                </ScrollableTabView>


            </View >
        );
    }

    render() {
        return (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={{ padding: 5 }} activeOpacity={0.8} onPress={() => Popup.show(
                    this.getPopupContent(1),
                    {
                        maskClosable: true,
                        animationType: 'slide-up',
                        onMaskClose: () => { },
                    }
                )}>
                    <Icon icon={'0xe675'} style={styles.icon} />
                </TouchableOpacity>
                {PermissionInfo.hasPermission(this.store.userInfo.Permission.DataAccessPermissions, "Employee_Add") ?
                    <TouchableOpacity style={{ marginLeft: 0, padding: 5, }} activeOpacity={0.8} onPress={() => this.props.navigator.push({
                        component: Add,
                        passProps: {
                            refresh: () => {
                                this.store.isEmployeeLoaded = false;
                                this.store.condition = null;
                                this.store.employeeList.clear();
                                this.store.getEmployeeByCondition(1);
                            }
                        }
                    })}>
                        <Icon icon={'0xe680'} style={styles.icon} />
                    </TouchableOpacity> : null}
            </View>
        );
    }
}


@observer
class DeparmentItem extends Component {

    _renderRow(rowData, sectionID, rowID) {
        return <DeparmentItem rowData={rowData} />
    }

    render() {
        let rowData = this.props.rowData;
        return (
            <View style={{ paddingLeft: rowData.ParentDepartmentCode ? 55 : 8 }}>
                <List.Item style={styles.listItem}>
                    <Checkbox checked={rowData.checked} right disabled={rowData.disabled} onChange={() => { rowData.checked = !rowData.checked }}
                        style={{ tintColor: '#fa5e5b' }}  >
                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            {rowData.subDepartments.length == 0 ? null :
                                <TouchableOpacity activeOpacity={.7} style={{ paddingRight: 5, paddingLeft: 0, }} onPress={() => this.toggleChecked(rowData)}>
                                    {rowData._subDepartments.length == 0 ? <Icon icon={'0xe677'} style={styles.accordionIcon} /> : <Icon icon={'0xe679'} style={styles.accordionIcon} />}
                                </TouchableOpacity>}
                            <Text>{rowData.NameCn}</Text>
                        </View>
                    </Checkbox>
                </List.Item>
                {rowData._subDepartments.length == 0 ? null :
                    <ListView dataSource={this.getDataSource}
                        enableEmptySections={true}
                        renderRow={this._renderRow.bind(this)}></ListView>
                }
            </View>
        )
    }

    toggleChecked = (rowData) => {
        if (rowData._subDepartments.length > 0)
            rowData._subDepartments = [];
        else
            rowData._subDepartments = rowData.subDepartments;
    }

    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.props.rowData._subDepartments.slice());
    }
}

@observer
class PolicyItem extends Component {
    render() {
        let rowData = this.props.rowData;
        return (
            <View style={{ paddingLeft: 20 }}>
                <List.Item style={styles.listItem}>
                    <Checkbox checked={rowData.checked} right onChange={() => {
                        for (let item of this.props.store.policies)
                            if (item !== rowData) item.checked = false;
                        rowData.checked = !rowData.checked
                    }}
                    >
                        <Text style={{ flex: 1 }}>{rowData.PolicyName}</Text>
                    </Checkbox>
                </List.Item>
            </View>
        )
    }
}




const styles = StyleSheet.create({
    icon: {
        color: '#fff', marginRight: 10,
    },
    accordionIcon: {
        color: '#999',
        fontSize: 14,
        padding: 5,
        paddingTop: 2
    },
    listItem: {
        backgroundColor: '#e6eaf2'
    },
    //tab 切换
    tabButton: {
        borderBottomWidth: 1 / FLEXBOX.pixel,
        borderBottomColor: '#ddd'
    },
    tabButtonAT: {
        color: '#333'
    },
    tabButtonT: {
        color: '#999'
    },
    tabButtonAI: {
        borderBottomColor: COLORS.secondary,

    },
    tabButtonI: {
        borderBottomWidth: 3 / FLEXBOX.pixel,
        borderBottomColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }

});

