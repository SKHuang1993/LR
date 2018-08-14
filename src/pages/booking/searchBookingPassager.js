
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

import { List, WhiteSpace, Picker, SearchBar, Tabs } from 'antd-mobile';
import Flex from '../../components/flex';
import ActivityIndicator from '../../components/activity-indicator';
import TabButton from '../../components/tabButton/';

import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import Checkbox from '../../components/checkbox/'
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../../components/button/';
import Passager from '../../stores/booking/booking-passager'
import { observer } from 'mobx-react/native'
import Enumerable from 'linq';
import { AccountInfo } from '../../utils/data-access/';
const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;
import Modal from '../../components/modal';
import NoDataTip from '../../components/noDataTip.1';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { BaseComponent } from '../../components/locale';
import Colors from '../../IM/Themes/Colors';
import { observable } from 'mobx';
let lan = BaseComponent.getLocale();
const TabPane = Tabs.TabPane;

@observer
export default class BookingPassager extends Component {
    constructor(props) {
        super(props);
        this.store = new Passager();
        this.store.userInfo = AccountInfo.getUserInfo();
        this.store.getPassengerList();
        this.store.getRecentlyContacts();
    }

    componentDidMount() {
        setTimeout(() =>
            this.refs.search.focus(), 300);
    }

    searchBarLeftView() {
        return (
            <TouchableOpacity style={styles.filterBtn} onPress={() => 1}>
                <Text>新增</Text>
            </TouchableOpacity>
        )
    }

    _renderRow(rowData, sectionID, rowID) {
        return <PassagerItem rowData={rowData} store={this.store} />
    }



    // 导航栏右边内容
    navBarRight() {
        return <TouchableOpacity activeOpacity={0.7} style={styles.add} onPress={() => 1}>
            <Text style={styles.addText}>新增</Text>
        </TouchableOpacity>
    }

    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        let paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
    };



    render() {

        return (
            <View style={styles.container}>
                {this.store.isEmptyData ? <NoDataTip /> : null}
                <NavBar navigator={this.props.navigator}
                    title={'搜索订票人'}
                />
                <View style={[FLEXBOX.flexStart, styles.search]}>
                    <TextInput
                        ref={"search"}
                        placeholder={'姓名/电话/邮箱'}
                        style={styles.searchInput}
                        onChangeText={(text) => {
                            this.store.condition = text;
                        }}
                        value={this.store.condition}
                        returnKeyType='search'
                        onSubmitEditing={() => {
                            if (this.store.condition.length > 0) {
                                this.store.search_result_index = 1;
                                this.store.search_result.clear();
                                this.store.search_result_finish = false;
                                this.store.getClientManByFuzzys();
                            }
                        }}
                    />
                    <TouchableOpacity style={styles.searchBtn} onPress={(text) => {
                        if (this.store.condition.length > 0) {
                            this.store.search_result_index = 1;
                            this.store.search_result.clear();
                            this.store.search_result_finish = false;
                            this.store.getClientManByFuzzys();
                        }
                    }}>
                        <Text style={styles.searchBtnTxt}>搜索</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                    <ListView
                        onMomentumScrollEnd={({ nativeEvent }) => {
                            if (this.isCloseToBottom(nativeEvent) && this.store.search_result.length > 0 && !this.store.search_result_finish) {
                                this.store.getClientManByFuzzys();
                            }
                        }}
                        enableEmptySections={true}
                        removeClippedSubviews={false}
                        dataSource={this.store.getSearchDataSource}
                        renderRow={(rowData) => <PassagerItem rowData={rowData} store={this.store} passengers={this.store.search_result} />}
                        keyboardDismissMode={"on-drag"}
                        keyboardShouldPersistTaps='always'
                        renderFooter={() => {
                            // return ((this.store.isEmployeeLoaded || this.store.isLoading) ? null : <TouchableOpacity style={{ alignItems: 'center', padding: 10 }}
                            //     onPress={() => this._onEndReached()}><Text>{lan.passengers_loadHint}</Text></TouchableOpacity>)
                        }}
                    />
                    {this.store.search_result.length == 0 && this.store.search_result_finish == true && <NoDataTip />}
                </View>
                <Button style={styles.confirmBtn} onClick={() => {
                    if (this.props.confirm) {
                        this.props.confirm(this.store.booker);
                    }
                    let currentRouteStack = this.props.navigator.getCurrentRoutes();
                    this.props.navigator.jumpTo(currentRouteStack[currentRouteStack.length - 3]);
                }} textStyle={styles.confirmBtnTxt} >{lan.confirm}</Button>
                <ActivityIndicator toast text={lan.loading} animating={this.store.isLoading} />

            </View >
        )
    }
}

@observer
class PassagerItem extends Component {
    render() {
        let rowData = this.props.rowData;
        let store = this.props.store;
        let passengers = this.props.passengers;
        return <View >
            <CheckboxItem checked={rowData.checked} disabled={false} onChange={() => {
                Enumerable.from(passengers).doAction((o, i) => {
                    o.checked = false;
                }).toArray();
                rowData.checked = !rowData.checked;
                store.booker = rowData;
            }}>
                <View>
                    <Flex wrap='wrap' >
                        <Text style={[styles.name]} >
                            {rowData.Name}
                        </Text>
                        <Text style={[styles.phone]}>
                            {rowData.Phone}
                        </Text>

                    </Flex>

                </View>
            </CheckboxItem>
        </View>
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
        flex: 0.4,
        //width: FLEXBOX.width * 0.15,
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
        marginBottom: 10,
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
    add: {
        padding: 5,
    },
    addText: {
        color: '#fff',
        fontSize: 16,
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
        paddingLeft: 10,
        paddingRight: 10,
    },
    tabButtonI: {
        borderBottomWidth: 3 / FLEXBOX.pixel,
        borderBottomColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabConent: {
        height: FLEXBOX.height - 200,
        // backgroundColor:'red'
    }


});

