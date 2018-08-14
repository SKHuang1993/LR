
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
    Platform,
    TouchableOpacity, Alert, Modal, StatusBar

} from 'react-native';

import { List, WhiteSpace, Picker, SearchBar, Tabs } from 'antd-mobile';
import Flex from '../flex';
import ActivityIndicator from '../activity-indicator';
import NavBar from '../navBar';
import Icon from '../icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../button/';
import { observer } from 'mobx-react/native'
import Enumerable from 'linq';
import topView from 'rn-topview';
import { AccountInfo } from '../../utils/data-access/';
import NoDataTip from '../noDataTip.1';
import { PermissionInfo } from '../../utils/data-access/';
import { BaseComponent } from '../locale';
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import Highlighter from 'react-native-highlight-words';
import deepDiffer from 'deepDiffer';
import { Keyboard } from 'react-native';
import { ModalBox } from '../modalbox';

let lan = BaseComponent.getLocale();

const TabPane = Tabs.TabPane;

@observer
export default class Index extends ModalBox {
    @observable isDisplay = false;
    @observable isLoading = false;
    @observable data = [];
    @observable intl = [];
    @observable domestic = [];
    @observable history = [];
    @observable condition;
    constructor(props) {
        super(props);
        this.type = props.type;
        this.state = {
            seachValue: null,
            visible: true
        }
    }

    componentDidMount() {
        this.getHistory();
        this.getDomesticData();
        this.getIntlData();
    }

    getIntlData = () => {
        let key = this.type + "intl";
        global.storage.load({ key: key }).then(val => {
            if (val != null) {
                this.intl = val;
            }
        }).catch(err => {
            this.isLoading = true;
            let url = "https://mddctrl.yiqifei.com/service/fastDataSource?scheme=eeda3e68ba2a4b219f7cec23fabff8ad";
            if (this.type == "hotel")
                url = "https://mddctrl.yiqifei.com/service/fastDataSource?scheme=b4819f962b2d42e597b1656cce590cbe"
            else if (this.type == "train") {
                url = "https://mddctrl.yiqifei.com/service/fastDataSource?scheme=16851adfaf1c48b5b86e07d0a6eb156e";
            }
            fetch(url)
                .then((response) => {
                    response.json().then((json) => {
                        if (json) {
                            let obj = Enumerable.from(json).firstOrDefault(o => o, null);
                            let data = [];
                            for (let item of obj.value) {
                                data.push({
                                    cityCode: item.value,
                                    cityName: item.text,
                                    isDomestic: false
                                })
                            }
                            this.intl = data;
                            global.storage.save({
                                key: key,
                                rawData: data,
                                expires: 1000 * 3600 * 24
                            });
                            this.isLoading = false;
                        }
                    })
                })
        });

    }

    getDomesticData = () => {
        let key = this.type + "domestic";
        global.storage.load({ key: key }).then(val => {
            if (val != null) {
                this.domestic = val;
            }
        }).catch(err => {
            this.isLoading = true;
            let url = "https://mddctrl.yiqifei.com/service/fastDataSource?scheme=a82a7459fdc14c14927612dd6b5e1b2f";
            if (this.type == "hotel")
                url = "https://mddctrl.yiqifei.com/service/fastDataSource?scheme=8f4c234c71824f76aeda8ff106187569"
            if (this.type == "train") {
                url = "https://mddctrl.yiqifei.com/service/fastDataSource?scheme=59c64c0e53174436a810603169a0e51e";
            }
            fetch(url)
                .then((response) => {
                    response.json().then((json) => {
                        if (json) {
                            let obj = Enumerable.from(json).firstOrDefault(o => o, null);
                            let data = [];
                            for (let item of obj.value) {
                                data.push({
                                    cityCode: item.value,
                                    cityName: item.text,
                                    isDomestic: true
                                })
                            }
                            this.domestic = data;
                            global.storage.save({
                                key: key,
                                expires: 1000 * 3600 * 24,
                                rawData: data
                            });
                            this.isLoading = false;
                        }
                    })
                })
        })
    }

    getHistory = () => {
        global.storage.load({ key: this.type }).then(val => {
            if (val != null) {
                this.history = val;
            }
        }).catch(err => {

        });

    }

    saveHistory = (obj) => {
        let isExits = Enumerable.from(this.history).firstOrDefault(a => a.cityCode == obj.cityCode && a.cityName == obj.cityName, -1);
        if (isExits != -1)
            return;
        this.history.splice(0, 0, obj);
        this.history = Enumerable.from(this.history).take(10).toArray();
        global.storage.save({
            key: this.type,
            rawData: this.history
        });

    }

    onClose = (obj) => {
        if (obj)
            this.saveHistory(obj);
        this.remove();
    }

    onSearch = (text) => {
        if (this.type == "flight") {
            fetch("http://mddctrl.yiqifei.com/service/suggest?scheme=33e0d58a93784aceb3bc05a89c5eed61&extras%5Bsite%5D=53&keywords=" + text)
                .then((response) => {
                    response.json().then((json) => {
                        if (json) {
                            let data = [];
                            for (let item of json) {
                                let obj = {
                                    cityCode: item.cCity,
                                    cityName: item.nCity,
                                    cityNameEn: item.neCity,
                                    isAirport: item.isAirport,
                                    isDomestic: item.isDomestic,
                                    airportName: item.isAirport ? item.nAirport : "所有机场",
                                    airportCode: !item.cAirport ? null : item.cAirport,
                                    airportNameEn: item.isAirport ? item.neAirport : "ALL AIRPORT",
                                    countryCode: item.cCountry,
                                    countryName: item.nCountry,
                                };
                                obj.row1 = `(${obj.cityCode}) ${obj.airportName},${obj.cityName},${obj.countryName}`;
                                obj.row2 = `${obj.airportNameEn} ${obj.cityNameEn},${obj.cityCode},${obj.countryCode}`;
                                data.push(obj);
                            }
                            this.data = data;
                            this.scrollToTop();
                        }
                    })
                })
        }
        else if (this.type == "hotel") {
            fetch("http://mddctrl.yiqifei.com/Service/Suggest?scheme=ac05bdb4717b49028899f505ed30c88a&Keywords=" + text)
                .then((response) => {
                    response.json().then((json) => {
                        if (json) {
                            let data = [];
                            for (let item of json) {
                                let obj = {
                                    cityCode: item.c,
                                    cityName: item.n,
                                    cityNameEn: item.ne,
                                    countryCode: item.cne,
                                    countryName: item.cn,
                                };
                                obj.row1 = `(${obj.cityCode}) ${obj.cityName},${obj.countryName}`;
                                obj.row2 = `${obj.cityNameEn},${obj.cityCode},${obj.countryCode}`;
                                data.push(obj);
                            }
                            this.data = data;
                            this.scrollToTop();
                        }
                    })
                })
        }
        else if (this.type == "train") {
            fetch("http://mddctrl.yiqifei.com/Service/Suggest?scheme=59c64c0e53174436a810603169a0e51e&Keywords=" + text)
                .then((response) => {
                    response.json().then((json) => {
                        if (json) {
                            let data = [];
                            for (let item of json) {
                                let obj = {
                                    cityCode: item.c,
                                    cityName: item.n,
                                    cityNameEn: item.py,
                                    countryCode: item.cne,
                                    countryName: item.cn,
                                };
                                obj.row1 = `(${obj.cityCode}) ${obj.cityName}`;
                                obj.row2 = `${obj.cityNameEn},${obj.cityCode}`;
                                data.push(obj);
                            }
                            this.data = data;
                            this.scrollToTop();
                        }
                    })
                })
        }
    }

    searchBarLeftView() {
        return (
            <TouchableOpacity style={styles.filterBtn} onPress={() => 1}>
                <Icon icon={'0xe675'} style={styles.filterIcon}></Icon>
            </TouchableOpacity>
        )
    }


    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.data.slice());
    }

    scrollToTop = () => {
        setTimeout(() => {
            if (this.refs.list)
                this.refs.list.getScrollResponder().scrollTo({ x: 0, y: 0, animated: false })
        }, 0);
    }

    _renderRow = (rowData, sectionID, rowID) => {
        return (
            <TouchableOpacity activeOpacity={0.6} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }} onPress={() => {
                this.props.callback(rowData);
                this.onClose(rowData);
            }}>
                <Highlighter
                    highlightStyle={{ color: 'red' }}
                    searchWords={[this.condition]}
                    textToHighlight={rowData.row1}
                />
                <Highlighter
                    highlightStyle={{ color: 'red' }} style={{ marginTop: 4, color: 'gray', fontSize: 12, }}
                    searchWords={[this.condition]}
                    textToHighlight={rowData.row2}
                />
            </TouchableOpacity>
        );
    }


    render() {
        return (
            this.add(<View style={styles.container}>
                <NavBar navigator={this.props.navigator}
                    title={'城市列表'}
                    onLeftClick={() => this.onClose()}
                />
                <SearchBar
                    placeholder={this.type != "train" ? '拼音全称/英文全称/中文名/三字母' : '拼音全称/英文全称/中文名'}
                    ref={"SearchBar"}
                    value={this.condition}
                    onChange={(text) => {
                        if (typeof text != 'string') return;
                        this.isDisplay = true;
                        this.condition = text.trim();
                        if (!text || text.length == 0) {
                            this.isDisplay = false;
                            return;
                        }
                        clearTimeout(this.timer);
                        this.timer = setTimeout(() => {
                            this.onSearch(text);
                        })
                    }}
                    leftView={this.searchBarLeftView()}
                    showCancelButton={this.isDisplay}
                    onCancel={() => {
                        this.isDisplay = false;
                        this.condition = null;
                    }}
                    cancelText={<Text style={{ color: '#666' }}>取消</Text>}></SearchBar>
                {this.isDisplay && <ListView keyboardShouldPersistTaps='always'
                    onScrollBeginDrag={() => Keyboard.dismiss()}
                    dataSource={this.getDataSource} ref="list"
                    renderRow={this._renderRow}
                    enableEmptySections={true}
                />
                }
                {!this.isDisplay &&
                    <ScrollView>
                        {/*历史城市   */}
                        <View style={styles.title}>
                            <Text style={styles.titleText}>历史城市</Text>
                        </View>
                        <Flex style={[styles.city, styles.cityHistory]} wrap="wrap">
                            {this.history.map((v, i) => {
                                return (
                                    <TouchableOpacity key={i} style={styles.cityItem} activeOpacity={.8} onPress={() => {
                                        this.props.callback(v);
                                        this.onClose(v);
                                    }}>
                                        <Text numberOfLines={1} style={styles.cityItemText}>
                                            {v.cityName}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}

                        </Flex>

                        {/*热门城市   */}
                        <View style={styles.title}>
                            <Text style={styles.titleText}>热门城市</Text>
                        </View>
                        {this.type != "train" &&
                            <View style={{ height: Platform.OS == "ios" ? null : 300 }}>
                                <Tabs defaultActiveKey="1" textColor={'#333'} activeTextColor={COLORS.secondary} activeUnderlineColor={COLORS.secondary}>
                                    <TabPane tab={"国内城市"} key="1">
                                        <Flex style={[styles.city, styles.cityHistory]} wrap="wrap">
                                            {this.domestic.map((v, i) => {
                                                return (
                                                    <TouchableOpacity key={i} style={styles.cityItem} activeOpacity={.8} onPress={() => {
                                                        this.props.callback(v);
                                                        this.onClose(v);
                                                    }}>
                                                        <Text numberOfLines={1} style={styles.cityItemText}>
                                                            {v.cityName}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })}

                                        </Flex>
                                    </TabPane>
                                    <TabPane tab={"国际城市/港澳台"} key="2">
                                        <Flex style={[styles.city, styles.cityHistory]} wrap="wrap">
                                            {this.intl.map((v, i) => {
                                                return (
                                                    <TouchableOpacity key={i} style={styles.cityItem} activeOpacity={.8} onPress={() => {
                                                        this.props.callback(v);
                                                        this.onClose(v);
                                                    }}>
                                                        <Text numberOfLines={1} style={styles.cityItemText}>
                                                            {v.cityName}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })}

                                        </Flex>
                                    </TabPane>
                                </Tabs>
                            </View>}
                        {this.type == "train" &&
                            <Flex style={[styles.city, styles.cityHistory]} wrap="wrap">
                                {this.domestic.map((v, i) => {
                                    return (
                                        <TouchableOpacity key={i} style={styles.cityItem} activeOpacity={.8} onPress={() => {
                                            this.props.callback(v);
                                            this.onClose(v);
                                        }}>
                                            <Text numberOfLines={1} style={styles.cityItemText}>
                                                {v.cityName}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })}

                            </Flex>
                        }
                        {/*搜索   */}
                        {this.type != "train" &&
                            <View style={styles.title}>
                                <Flex>
                                    <Text style={styles.titleText}>搜索</Text><Text style={styles.titleDes}>
                                        (我们支持全球民航城市的便捷搜索)
                        </Text>
                                </Flex>
                                <Flex style={styles.eg}>
                                    <Text style={[styles.egTitle, styles.egText]}>
                                        例如搜索温哥华可输{'\n'}或
                        </Text>
                                    <Text style={styles.egText}>
                                        拼音全称：WENGEHUA {'\n'}
                                        英文全称：VANCOUVER {'\n'}
                                        中文全称：温哥华 {'\n'}
                                    </Text>
                                </Flex>
                            </View>}
                        <View>

                        </View>
                    </ScrollView>
                }
                <ActivityIndicator toast text={"加载中..."} animating={this.isLoading} />
            </View >)

        )
    }
}







const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',

    },
    inner: {
        padding: 10,
    },
    cityHistory: {
        marginBottom: 10,
    },
    title: {
        padding: 10, paddingBottom: 0
    },
    titleText: {
        fontSize: 14, color: '#666'
    },
    city: { padding: 10, paddingBottom: 0 },
    cityItem: {
        borderRadius: 3,
        borderWidth: 1 / FLEXBOX.pixel,
        borderColor: '#ddd',
        padding: 8,
        paddingLeft: 3,
        paddingRight: 3,
        backgroundColor: '#fff',
        width: (FLEXBOX.width - 60) / 4,
        marginRight: 10,
        marginBottom: 7,


    },
    cityItemText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#333'
    },
    titleDes: {
        fontSize: 12, color: '#999', marginLeft: 5,
    },
    egTitle: {
        textAlign: 'right',
        marginRight: 15
    },
    egText: {
        color: '#666',
        fontSize: 12,
        lineHeight: 17,
    },
    eg: {

        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginTop: 5,
    },



});

