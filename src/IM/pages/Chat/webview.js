/**
 * Created by yqf on 2017/11/23.
 */
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
    TouchableOpacity, Alert, WebView,
} from 'react-native';

// import { List, WhiteSpace, Picker, SearchBar } from 'antd-mobile';
// import Flex from '../../components/flex';
// import ActivityIndicator from '../../components/activity-indicator';
import NavBar from '../../components/yqfNavBar';
// import Icon from '../../components/icons/icon';
// import Checkbox from '../../components/checkbox/'
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
// import Button from '../../components/button/';

import { observer } from 'mobx-react/native'
import Enumerable from 'linq';
// import { AccountInfo } from '../../utils/data-access/';
// const CheckboxItem = Checkbox.CheckboxItem;
// const AgreeItem = Checkbox.AgreeItem;
// import Modal from '../../components/modal';
// import NoDataTip from '../../components/noDataTip.1';
// import { PermissionInfo } from '../../utils/data-access/';
// import { BaseComponent } from '../../components/locale';
// let lan = BaseComponent.getLocale();


@observer
export default class CostCenter extends Component {
    constructor(props) {
        super(props);
    }



    componentDidMount() {

    }

    render() {
        let url = this.props.url;
        let title = this.props.title;
        return (
            <View style={styles.container}>
                <NavBar navigator={this.props.navigator}
                        title={title}
                        leftIcon={'0xe183'}
                />
                <WebView source={{ uri: url }} />
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