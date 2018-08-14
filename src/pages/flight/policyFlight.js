

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    ListView,
    TouchableOpacity,
    TouchableHighlight,
    Animated
} from 'react-native';

import { List, WhiteSpace, Picker, Popup } from 'antd-mobile';
import Flex from '../../components/flex';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import '../../utils/date';
import { COLORS, FLEXBOX } from '../../styles/commonStyle';
import FormatPrice from '../../components/formatPrice/';
import Button from '../../components/button';
import Item from '../../components/flight/item';


import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();

export default class PolicyFlight extends Component {
    constructor(props) {
        super(props);
        let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource: ds.cloneWithRows(props.data),
        }
    }
    // 国内列表 右边信息

    domesticRightInfo(data) {
        return (
            <Flex.Item style={styles.mainRight}>
                {FormatPrice(data.Price, '', null, null, lan.flights_priceUp)}
                <Text style={styles.mainRigntTxt}>{lan.includes}</Text>
                <Text style={styles.mainRigntTxt}>&yen;50</Text>
            </Flex.Item>
        )
    }

    renderRow(rowData: string, sectionID: number, rowID: number) {
        return <Item data={rowData} onItemClick={() => this.props.onItemClick(rowData)} />

    }

    render() {
        //let flightType=this.props.flightType == domestic ? domesticRightInfo : null ;
        let flightData = this.props.data[0];
        return (
            <View >
                <View >
                    <View style={styles.title}>
                        <Text style={styles.titleTxt}>
                            {lan.flights_policyFlight_title}
                        </Text>
                    </View>
                    <View style={styles.hint}>
                        <Text style={styles.hintTxt}>
                            {lan.flights_policyFlight_desc1}{this.props.timeLowTicket}{lan.flights_policyFlight_desc2}”
                        </Text>
                    </View>
                    <ListView
                        style={{ backgroundColor: COLORS.containerBg,height:300 }}
                        dataSource={this.state.dataSource}
                        renderRow={this.renderRow.bind(this)}
                    />
                </View>
                <Flex style={styles.toolbar}>
                    <Button style={styles.cancelBtn} textStyle={styles.cancelBtnTxt} onClick={() => this.props.onClose()}>{lan.cancel}</Button>
                    <Button style={styles.confirmBtn} textStyle={styles.confirmBtnTxt} onClick={() => { Popup.hide(); this.props.next(); }}>{lan.flights_policyFlight_continueBooking}</Button>

                </Flex>
            </View>
        )

    }


}



const styles = StyleSheet.create({
    airlineIco: {
        width: 12,
        height: 12,
        alignSelf: 'center',
        marginRight: 2,
    },

    header: {
        backgroundColor: '#fff',
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1 / FLEXBOX.pixel

    },

    time: {
        fontSize: 24,


    },
    timeLeft: {

        textAlign: 'right'
    },
    airportBox: {
        flexDirection: 'row',
        justifyContent: 'flex-start',

    },
    airportBoxLeft: {
        justifyContent: 'flex-end'
    },
    airport: {
        fontSize: 12,
        color: '#666',
        width: FLEXBOX.width * 0.17,
        justifyContent: 'flex-end',
        textAlign: 'right',
    },
    airpotRight: {
        textAlign: 'left',
    },
    terminal: {
        marginLeft: 2,
        fontSize: 10,
        color: '#666',

    },
    mainTrip: {
        width: FLEXBOX.width * 0.2,

        flex: 1,



    },
    mainRight: {
        width: FLEXBOX.width * 0.35,
        alignItems: 'flex-end',
        marginRight: 10,
    },
    mainStops: {
        width: FLEXBOX.width * 0.15,
        alignItems: 'center',
        justifyContent: 'center',

    },


    stopsLine: {
        height: 1,
        backgroundColor: '#666',
        width: 30,

    },
    info: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 5,
        paddingLeft: 10,
        paddingRight: 15,
    },
    infoText: {
        color: '#999',
        fontSize: 12,
    },
    timeIcon: {
        fontSize: 14,
        color: '#999'
    },
    mainRigntTxt: {
        fontSize: 10, color: '#999'
    },
    toLine: {
        width: FLEXBOX.width * 0.15,
        height: 1 / FLEXBOX.pixel,

        backgroundColor: '#ddd'
    },
    stops: {
        fontSize: 10,
        color: '#999',
        marginBottom: 2,

    },
    stopsCity: {
        marginTop: 2,
        fontSize: 10,
        color: '#999'
    },
    nextDay: {
        fontSize: 12, color: '#999'
    },

    //toolbar
    toolbar: {
        borderTopColor: '#ddd',
        borderTopWidth: 1 / FLEXBOX.pixel
    },
    cancelBtn: {
        borderRadius: 0,
        borderWidth: 0,
        flex: .4
    },
    confirmBtn: {
        flex: .6,
        borderRadius: 0,
        borderWidth: 0,
        backgroundColor: COLORS.secondary,
    },
    cancelBtnTxt: {
        color: '#666',
        fontSize: 16,
    },
    confirmBtnTxt: {
        color: '#fff',
        fontSize: 16,
    },
    //
    hint: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingLeft: 15,
        backgroundColor: COLORS.containerBg
    },
    hintTxt: {
        color: '#999',
        fontSize: 12,
    },
    title: {
        padding: 10,
        paddingLeft: 15,

    }





});

