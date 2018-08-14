
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
import moment from 'moment';
import { AccountInfo } from '../../utils/data-access/';
import NoDataTip from '../noDataTip.1';
import { PermissionInfo } from '../../utils/data-access/';
import { BaseComponent } from '../locale';
import { extendObservable, action, computed, toJS, observable } from 'mobx';
// import Highlighter from 'react-native-highlight-words';
import deepDiffer from 'deepDiffer';
import { Keyboard } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from './tab-bar';
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
    @observable page = 0;
    @observable depDate;
    @observable arrDate;

    constructor(props) {
        super(props);
        this.type = props.type;
        this.state = {
            seachValue: null,
            visible: true,
            dates: [null, null],
        }
    }

    componentDidMount() {
        this.initData();
    }

    initData = () => {
        this.data = global.calendarData;
        if (this.props.minDate) {
            this.setMinDate(moment(this.props.minDate), true);
        }
        else
            this.setDepDate(moment());
        if (this.props.maxDate) {
            this.setDepDate(moment());
            this.setMaxDate(moment(this.props.maxDate));
        }
    }

    setDepDate = (minDate, scrollable) => {
        let position = 0;
        let date = minDate;
        for (let i = 0; i < this.data.length; i++) {
            let items = this.data[i];
            if (items instanceof Array) {
                for (let j = 0; j < items.length; j++) {
                    let o = items[j];
                    if (o) {
                        if (o.date.isBefore(moment(date.format("YYYY-MM-DD")))) {
                            o.disabled = true;
                            position = i;
                        }
                        else
                            break;
                    }
                }
            }
        }
        if (scrollable)
            this.scrollTo(position);
    }

    setMinDate = (minDate, scrollable) => {
        let date = minDate;
        let position = 0;
        for (let i = 0; i < this.data.length; i++) {
            let items = this.data[i];
            if (typeof (items) === 'object') {
                if (moment(items).month() == date.month()) {
                    position = i;
                    break;
                }
            }
        }
        this.data = this.data.slice(position, this.data.length);
        for (let i = 0; i < this.data.length; i++) {
            let items = this.data[i];
            if (items instanceof Array) {
                Enumerable.from(items).doAction(o => {
                    if (o && o.date.isBefore(moment(date.format("YYYY-MM-DD"))))
                        o.disabled = true;
                }).toArray();
            }
        }
        // if (scrollable)
        //     this.scrollTo(position);
    }


    setMaxDate = (maxDate) => {
        let date = maxDate;
        let position = 0;
        for (let i = 0; i < this.data.length; i++) {
            let items = this.data[i];
            if (typeof (items) === 'object') {
                if (moment(items).isAfter(maxDate)) {
                    position = i;
                    break;
                }
            }
        }
        this.data = Enumerable.from(this.data).take(position).toArray();
        for (let i = 0; i < this.data.length; i++) {
            let items = this.data[i];
            if (items instanceof Array) {
                Enumerable.from(items).doAction(o => {
                    if (o && o.date.isAfter(moment(date.format("YYYY-MM-DD"))))
                        o.disabled = true;
                }).toArray();
            }
        }
    }

    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.data.slice());
    }

    scrollToTop = (animated) => {
        setTimeout(() => {
            if (this.refs.list)
                this.refs.list.getScrollResponder().scrollTo({ x: 0, y: 0, animated: true })
        }, 0);
    }

    _renderRow = (rowData, sectionID, rowID) => {
        return <RowItem rowData={rowData} rowID={rowID} onItemClick={(date) => {
            if (this.props.disabled) {
                this.depDate = date;
                if (this.props.callback)
                    this.props.callback(moment(this.depDate).format("YYYY-MM-DD"), null);
                this.remove();
                return;
            }
            if (!this.depDate) {
                this.depDate = date;
                this.setState({ dates: [date, null] })
                this.page = 1;
            }
            else {
                this.arrDate = date;
                if (this.props.callback)
                    this.props.callback(moment(this.depDate).format("YYYY-MM-DD"), moment(this.arrDate).format("YYYY-MM-DD"));
                this.remove();
                return;
            }
            this.setDepDate(date, true);
        }} />;
    }

    scrollTo = (position) => {
        setTimeout(() => {
            if (this.refs.ListView) {
                this.refs.ListView.getScrollResponder().scrollTo({ x: 0, y: position * 50, animated: true })
            }
        }, 0);
    }

    render() {
        return (
            this.add(
                <View style={styles.container}>
                    <NavBar navigator={this.props.navigator}
                        title={'选择日期'}
                        onLeftClick={() => this.remove()}
                    />
                    {!this.props.disabled &&
                        <View style={{ height: 50 }}>
                            <ScrollableTabView onChangeTab={(o) => {
                                if (o.i == 0) {
                                    this.page = 0;
                                    this.depDate = null;
                                    this.initData();
                                    this.setState({ dates: [null, null] })
                                    this.scrollTo(0);
                                }
                            }}
                                renderTabBar={() => <TabBar date={this.state.dates} position={this.page} />}>
                                <Text tabLabel={!this.props.defaultValues[0] ? "去程日期" : this.props.defaultValues[0]} />
                                <Text tabLabel={!this.props.defaultValues[1] ? "回程日期" : this.props.defaultValues[1]} />
                            </ScrollableTabView>
                        </View>
                    }
                    <View style={{ backgroundColor: '#f5f5f5', height: 26, flexDirection: "row", alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[styles.weekday, { color: COLORS.secondary }]}>日</Text>
                        <Text style={styles.weekday}>一</Text>
                        <Text style={styles.weekday}>二</Text>
                        <Text style={styles.weekday}>三</Text>
                        <Text style={styles.weekday}>四</Text>
                        <Text style={styles.weekday}>五</Text>
                        <Text style={[styles.weekday, { color: COLORS.secondary }]}>六</Text>
                    </View>
                    <ListView
                        ref={"ListView"}
                        showsVerticalScrollIndicator={false}
                        dataSource={this.getDataSource}
                        enableEmptySections={true}
                        renderRow={this._renderRow} />
                </View >
            )
        )
    }
}

@observer
class RowItem extends Component {
    render() {
        let rowData = this.props.rowData;
        let rowID = this.props.rowID;
        if (rowData instanceof Array) {
            return (
                <View style={{ flexDirection: 'row', height: 50 }}>
                    {
                        Enumerable.range(0, 7).toArray().map((o, i) =>
                            <TouchableOpacity activeOpacity={1} onPress={() => {
                                this.props.onItemClick(rowData[i].date);
                            }} disabled={rowData[i] ? rowData[i].disabled : true} key={i} style={{ paddingTop: 18, paddingBottom: 18, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16, color: rowData[i] ? (rowData[i].disabled ? "#ccc" : "#333") : '#333' }}>{rowData[i] ? rowData[i].day : null}</Text>
                            </TouchableOpacity>)
                    }
                </View >
            );
        } else {
            return (
                <View style={{ height: 50 }}>{rowID > 0 &&
                    <View style={{ height: 0.5, backgroundColor: "#EBEBEB" }}></View>}
                    <Text style={{ fontSize: 15, alignSelf: "center", padding: 8, color: '#333' }}>{rowData.format("YYYY年MM月")}</Text>
                </View>
            );
        }
    }
}





const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',

    },
    weekday: { flex: 1, textAlign: 'center', color: '#666' },
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

