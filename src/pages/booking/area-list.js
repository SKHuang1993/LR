import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();


import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    Navigator,
    ListView,
    TouchableOpacity,
    TouchableHighlight,
    Animated,
    RefreshControl, Alert
} from 'react-native';

import { WhiteSpace, InputItem, Picker, ActivityIndicator, Popup } from 'antd-mobile';
import Flex from '../../components/flex';
import List from '../../components/list';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../../components/button';
import Radio from '../../components/radio';
import PassgerEdit from './passagerEdit';
import AreaList from '../../stores/booking/area-list';
import { observer } from 'mobx-react/native';
import { CertificateInfo, AccountInfo } from '../../utils/data-access/';
import { toJS, observable } from 'mobx';
import NoDataTip from '../../components/noDataTip.1';
import Enumerable from 'linq';
const Item = List.Item;
const Brief = Item.Brief;
const RadioItem = Radio.RadioItem;

@observer
export default class PassagerList extends Component {

    constructor(props) {
        super(props);
        this.store = new AreaList();
        this.store.userInfo = AccountInfo.getUserInfo();
        this.store.getDistrictAreaCode();
    }

    _renderRow(rowData: string, sectionID: number, rowID: number, ) {
        return <View >
            <Item extra={rowData.Name} onClick={() => {
                if (this.props.confirm)
                    this.props.confirm(rowData);
                this.props.navigator.pop();
            }}>
                <View>
                    <Flex wrap='wrap' >
                        <Text style={[styles.name]} >
                            +{rowData.AreaCode}
                        </Text>
                        {/* <Text style={[styles.name, { marginLeft: 25 }]} >
                            {rowData.Name.trim()}
                        </Text> */}
                    </Flex>
                </View>
            </Item>
        </View>
    }

    render() {
        let flightList = this.props.selectedFlights;
        return (
            <View style={styles.container}>
                <NavBar title={"选择区号"} navigator={this.props.navigator} />
                <View style={{ flex: 1 }}>
                    <ListView
                        enableEmptySections={true}
                        dataSource={this.store.getDataSource}
                        renderRow={this._renderRow.bind(this)}
                    />
                </View>
                <ActivityIndicator toast text={lan.loading} animating={this.store.isLoading} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.containerBg,
    },

    //列表样式

    listTitle: {
        flex: 1,
        fontSize: 16,

    },
    listWarning: {
        color: '#fa5e5b',
        fontSize: 12,
    },
    iconWarning: {
        color: '#fa5e5b',
        fontSize: 14,
        marginRight: 2,

    },
    TextWarning: {
        color: '#fa5e5b',
        fontSize: 12,
    },
    iconEdit: {
        color: '#999'
    },
    name: {
        color: '#333'
    }


});

