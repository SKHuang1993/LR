/**
 * Created by yqf on 2018/1/23.
 */

//获取远江的


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
import { observer } from 'mobx-react/native'
import Enumerable from 'linq';
import { AccountInfo } from '../../utils/data-access/';
const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;
import Modal from '../../components/modal';

import NoDataTip from '../../components/noDataTip.1';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { BaseComponent } from '../../components/locale';

import Colors from '../../Themes/Colors';

// import SearchBookingPassager from './searchBookingPassager';
// import BookingPassagerEdit from './bookingPassagerEdit';

import { observable } from 'mobx';
let lan = BaseComponent.getLocale();
const TabPane = Tabs.TabPane;




class Passager extends  Component{

    searchRequst = null;
    @observable passengers_sell = [];
    @observable passengers_contacted = [];
    @observable search_result = [];
    @observable isLoading = false;
    @observable isFinish = false;
    @observable condition = '';
    passengers_sell_index = 1;
    search_result_index = 1;
    search_result_finish = false;

    //读取我的旅客信息
    getPassengerList = async () => {
        let param = {
            "UserCode": this.userInfo.Account,
            "PageSize": 15,
            "PageCount": this.passengers_sell_index++
        }
        this.isLoading = true;
        let result = await PassengerInfo.getClientManByUserCode(param);
        Enumerable.from(result.Result.ServiceStaffs).doAction((o, i) => {
            o.checked = false;
        }).toArray();
        this.passengers_sell = this.passengers_sell.concat(result.Result.ServiceStaffs);
        if (this.passengers_sell.length == result.Result.RowCount)
            this.isFinish = true;
        this.isLoading = false;
    }

    //获取最近的联系人
    getRecentlyContacts = async () => {
        this.isLoading = true;
        if (!this.Owner) {
            let result = await IM.getToken({
                "Platform": 'MobileDevice',
                "UserCode": this.userInfo.Account,
                "Source": '抢单'
            });
            this.Owner = result.User.IMNr;
        }
        let result = await IM.getRecentlyContacts({
            Owner: this.Owner
        });
        Enumerable.from(result.Users).doAction((o, i) => {
            o.checked = false;
        }).toArray();
        this.passengers_contacted = result.Users;
        this.isLoading = false;
    }

    //根据条件查询客户信息
    getClientManByFuzzys = async () => {
        let param = {
            "Condition": this.condition,
            "PageSize": 15,
            "PageCount": this.search_result_index++
        }
        this.isLoading = true;
        let result = await PassengerInfo.getClientManByFuzzys(param);
        console.log(result);
        if (result.Result) {
            for (let item of result.Result.Customers) {
                let anntInfos = Enumerable.from(result.Result.AnntInfos).where(o => o.PersonCode == item.PersonCode).toArray();
                if (anntInfos.length > 0) {
                    for (let anntInfo of anntInfos) {
                        item[anntInfo.AnntType] = anntInfo.Annt;
                    }
                }
            }
            let customers = Enumerable.from(result.Result.Customers).select((o, i) => {
                return {
                    UserCode: o.AccountCode,
                    checked: false,
                    Name: o.FullName,
                    Phone: o.Phone,
                    Email: o.Email
                }
            }).toArray();

            this.search_result = this.search_result.concat(customers);
            if (this.search_result.length == result.Result.RowCount)
                this.search_result_finish = true;
        } else
            this.search_result_finish = true;
        this.isLoading = false;
    }

    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.passengers_sell.slice());
    }

    @computed get getDataContactedSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.passengers_contacted.slice());
    }


    @computed get getSearchDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.search_result.slice());
    }

}



@observer
export default class BookingPassager extends Component {
    @observable display = false;
    constructor(props) {
        super(props);
        this.init();
    }

    componentDidMount() {

    }

    init = async () => {
        this.store = new Passager();
        this.store.userInfo = AccountInfo.getUserInfo();
        await this.store.getRecentlyContacts();
        await this.store.getPassengerList();
    }

    _renderRow(rowData, sectionID, rowID) {
        return <PassagerItem rowData={rowData} store={this.store} />
    }



    // 导航栏右边内容
    navBarRight() {
        return <TouchableOpacity activeOpacity={0.7} style={styles.add} onPress={() => {
            this.props.navigator.push({
                component: BookingPassagerEdit,
                passProps: {
                    confirm: this.props.confirm
                }
            })
        }}>
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
                        title={'选择订票人'}
                        rightView={
                            this.navBarRight()
                        }
                />
                <TouchableOpacity activeOpacity={1} style={[FLEXBOX.flexStart, styles.search]}
                                  onPress={() => {
                                      this.props.navigator.push({
                                          component: SearchBookingPassager,
                                          passProps: {
                                              confirm: this.props.confirm
                                          }
                                      })
                                  }} >
                    <TextInput
                        editable={false}
                        placeholder={'姓名/电话/邮箱'}
                        style={styles.searchInput}
                        onChangeText={(text) => {
                            this.store.condition = text;
                            if (this.store.condition.length == 0)
                                this.display = false;
                        }}
                        value={this.store.condition}
                        returnKeyType='search'
                        onSubmitEditing={() => {
                            if (this.store.condition.length > 0) {
                                this.store.search_result_finish = false;
                                this.display = true;
                                this.store.getClientManByFuzzys();
                            }
                        }}
                    />

                </TouchableOpacity>
                {this.display &&
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <ListView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                              onMomentumScrollEnd={({ nativeEvent }) => {
                                  if (this.isCloseToBottom(nativeEvent) && !this.store.search_result_finish) {
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
                </View>
                }
                {!this.display &&
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <ScrollableTabView tabBarActiveTextColor={COLORS.secondary} tabBarUnderlineStyle={{ height: 3, backgroundColor: COLORS.secondary }}>
                        <TabPane tabLabel={"最近联系的"} key="1">
                            <View style={styles.tabConent}>
                                <ListView style={{ flex: 1, }}
                                          enableEmptySections={true}
                                          removeClippedSubviews={false}
                                          dataSource={this.store.getDataContactedSource}
                                          renderRow={(rowData) => <PassagerItem rowData={rowData} store={this.store} passengers={this.store.passengers_contacted} />}
                                          keyboardDismissMode={"on-drag"}
                                          keyboardShouldPersistTaps='always'
                                />
                            </View>
                            {this.store.passengers_contacted.length == 0 && this.store.isLoading == false && <NoDataTip />}
                        </TabPane>
                        <TabPane tabLabel={"服务销售过的"} key="2">
                            <View style={styles.tabConent}>
                                <ListView style={{ flex: 1, }}
                                          onMomentumScrollEnd={({ nativeEvent }) => {
                                              if (this.isCloseToBottom(nativeEvent) && !this.store.isFinish) {
                                                  this.store.getPassengerList();
                                              }
                                          }}
                                          enableEmptySections={true}
                                          removeClippedSubviews={false}
                                          dataSource={this.store.getDataSource}
                                          renderRow={(rowData) => <PassagerItem rowData={rowData} store={this.store} passengers={this.store.passengers_sell} />}
                                          keyboardDismissMode={"on-drag"}
                                          keyboardShouldPersistTaps='always'
                                          renderFooter={() => {
                                              // return ((this.store.isEmployeeLoaded || this.store.isLoading) ? null : <TouchableOpacity style={{ alignItems: 'center', padding: 10 }}
                                              //     onPress={() => this._onEndReached()}><Text>{lan.passengers_loadHint}</Text></TouchableOpacity>)
                                          }}
                                />
                                {this.store.passengers_sell.length == 0 && this.store.isLoading == false && <NoDataTip />}
                            </View>
                        </TabPane>
                    </ScrollableTabView>
                </View>
                }
                <Button style={styles.confirmBtn} onClick={() => {
                    if (this.props.confirm) {
                        this.props.confirm(this.store.booker);
                    }
                    this.props.navigator.pop();
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
        flex: 1,
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



