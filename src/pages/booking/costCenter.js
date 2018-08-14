
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

import { observer } from 'mobx-react/native'
import Enumerable from 'linq';
import { AccountInfo } from '../../utils/data-access/';
const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;
import Modal from '../../components/modal';
import NoDataTip from '../../components/noDataTip.1';
import { PermissionInfo } from '../../utils/data-access/';
import { BaseComponent } from '../../components/locale';
import Cost_Center from '../../stores/booking/cost-center';
let lan = BaseComponent.getLocale();


@observer
export default class CostCenter extends Component {
    constructor(props) {
        super(props);
        this.store = new Cost_Center();
        this.store.userInfo = AccountInfo.getUserInfo();
        this.store.costGetList(this.props.costCenterID);
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
    //单选    
    _renderRow = (rowData, sectionID, rowID) => {
        return <Item rowData={rowData} store={this.store} />
    }



    render() {
        return (
            <View style={styles.container}>
                {/*{this.store.isEmptyData ? <NoDataTip /> : null}*/}
                <NavBar navigator={this.props.navigator}
                    title={'成本中心'}
                    rightView={
                        () => { }
                    }
                />
                <SearchBar
                    placeholder={'查找成本中心'}
                    ref={"SearchBar"}
                    value={this.store.keyWords}
                    onChange={(text) => {
                        if (typeof text != 'string') return;
                        this.store.keyWords = text;
                        this.store.search();
                    }}
                    leftView={this.searchBarLeftView()} />
                {/* 成本中心 */}
                <View style={[FLEXBOX.flexStart, styles.custom]}>
                    <TextInput
                        placeholder={'添加自定义成本中心'}
                        style={styles.customInput}
                        onChangeText={(customValue) => this.store.customValue = customValue}
                        value={this.store.customValue}
                    />
                    <TouchableOpacity style={styles.coustomBtn} onPress={() => {
                        this.store.addCostItem();
                    }}>
                        <Text style={styles.coustomBtnTxt}>添加</Text>
                    </TouchableOpacity>
                </View>
                {/* 添加自定义成本中心且该数据显示第一位并勾选 */}
                <ListView style={{ flex: 1, marginTop: 0 }}
                    enableEmptySections={true}
                    keyboardShouldPersistTaps='always'
                    keyboardDismissMode={"on-drag"}
                    removeClippedSubviews={false}
                    dataSource={this.store.getDataSource}
                    renderRow={this._renderRow}
                    renderFooter={() => {
                        return (1 ? null : <TouchableOpacity style={{ alignItems: 'center', padding: 10 }}
                            onPress={() => this._onEndReached()}><Text>{lan.passengers_loadHint}</Text></TouchableOpacity>)
                    }}
                />
                <Button style={styles.confirmBtn} onClick={() => {
                    if (this.props.confirm) {
                        let val = Enumerable.from(this.store.filterData).firstOrDefault(o => o.Checked, null);
                        this.props.confirm(val);
                    }
                    this.props.navigator.pop();
                }} textStyle={styles.confirmBtnTxt} >{lan.confirm}</Button>
                <ActivityIndicator toast text={lan.loading} animating={this.store.isLoading} />
            </View >
        )
    }
}

@observer
class Item extends Component {
    render() {
        let rowData = this.props.rowData;
        let store = this.props.store;
        return (<View >
            <CheckboxItem checked={rowData.Checked} onChange={() => {
                Enumerable.from(store.filterData).doAction(o => o.Checked = false).toArray();
                rowData.Checked = !rowData.Checked;
            }}>
                <Flex wrap='wrap' >
                    <Text style={[styles.title]} >
                        {rowData.CostName}
                    </Text>
                </Flex>
            </CheckboxItem>
        </View>);
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

    title: {

        color: '#333'
    },
    sex: {
        marginRight: 15,
        color: '#333'
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
    }
    ,
    custom: {
        // height: 30,
        flex: 0,
        paddingLeft: 10,
        paddingRight: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor:'red'
    },
    customInput: {
        backgroundColor: '#fff',
        height: 30,
        lineHeight: 30,
        flex: .8,
        marginRight: 10,
        padding:0,
        paddingLeft: 10,
        fontSize: 14,
        borderRadius: 4,

    },
    coustomBtn: {
        backgroundColor: COLORS.secondary,
        // width:50,
        flex: .15,
        borderRadius: 4,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',

    },
    coustomBtnTxt: {
        color: '#fff'

    },


});

