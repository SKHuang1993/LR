

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    StatusBar,
    ScrollView,
    Navigator,
    ListView,
    TouchableOpacity,
    TouchableHighlight,
} from 'react-native';

import { WhiteSpace, InputItem, Picker, ActivityIndicator, Popup } from 'antd-mobile';
import Flex from '../../components/flex';
import List from '../../components/list';
import TextareaItem from '../../components/textarea-item';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import FormatPrice from '../../components/formatPrice';
const Item = List.Item;
const Brief = Item.Brief;


import { BaseComponent } from '../locale';
let lan = BaseComponent.getLocale();

export default class Index extends Component {
    static propTypes = {
        onClick: React.PropTypes.func,

    }

    static defaultProps = {
        //价格明细数据
        detailData: [
            { title: '票价', price: 890, number: 2 },
            { title: '机建', price: 100, number: 2 },
            { title: '燃油', price: 70, number: 2 },
            { title: '保险', price: 20, number: 3 },
        ],
        //总价格
        totalPrice: 8999,
        //下一步
        onClick: () => { }
    }
    constructor(props) {
        super(props);

        this.state = {
            popupState: false,
        }
    }
    onPopupClose = () => {
        Popup.hide();
        this.setState({
            popupState: false,
        })
    };
    //明细
    getPopupContent = () => {
        return <View>
            <NavBar onlyBar title={lan.priceBar_priceDetails} leftText={lan.cancel} onLeftClick={this.onPopupClose} onRightClick={this.onPopupClose} rightText={lan.confirm} />
            <List >
                {this.props.detailData.map((item, index) => {
                    return <Item key={index} extra={<Text>{typeof (item.price) == 'string' ? <Text>{item.price}</Text> : FormatPrice(item.price, '', 16, null, '')}<Text style={styles.priceDetail_sym}>{item.number != null ? "X" : ""}</Text><Text style={styles.priceDetail_unit}>{item.number}</Text></Text>}>
                        {item.title}
                    </Item>
                })}
            </List>
            {this.toolbarContent()}
        </View>
    }
    //打开明细事件
    onShowPress = () => {
        if (this.state.popupState) {
            Popup.hide();
            this.setState({
                popupState: true,
            })
        } else {
            Popup.show(this.getPopupContent(), {
                maskClosable: true,
                animationType: 'slide-up',
                onMaskClose: () => new Promise(resolve => { setTimeout(resolve, 1); }),
            })
            this.setState({
                popupState: false,
            })
        }

    }

    toolbarContent = () => {

        return (
            <Flex style={[styles.toolBar,]}>
                {!this.props.hide &&
                    <Flex justify='between' style={styles.toolBar_left}>

                        <Text>
                            <Text>{lan.priceBar_amountPayable}：</Text><Text style={styles.toolBar_priceSym}>￥</Text><Text style={styles.toolBar_price}>{this.props.totalPrice}</Text>
                        </Text>
                        <TouchableOpacity style={styles.toolBar_detail} onPress={this.onShowPress} activeOpacity={.7}>
                            <Text style={styles.toolBar_detailBtn}>
                                {lan.priceBar_detailed} <Icon icon={'0xe679'} style={styles.toolBar_arrowIco} />
                            </Text>
                        </TouchableOpacity>

                    </Flex>
                }
                <TouchableOpacity style={styles.toolBar_btn} activeOpacity={1} onPress={this.props.onClick}>
                    <Text style={styles.toolBar_btnText}>{lan.priceBar_next}</Text>
                </TouchableOpacity>
            </Flex>
        )
    }

    render() {
        return (
            <View style={[styles.container, this.state.popupState ? { borderTop: 0 } : null]}>
                {this.toolbarContent()}
            </View>
        )

    }


}








const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderTopColor: '#ddd',
        borderTopWidth: 1 / FLEXBOX.pixel,
        height: 49,
    },

    //底部工具栏
    toolBar: {


    },
    toolBar_left: {
        flex: 1,
        paddingLeft: 10,
        paddingRight: 10,
    },
    toolBar_priceSym: {
        fontSize: 10,
        color: 'red',
        transform: [{ translateY: 0 }, { translateX: 10 }]
    },
    toolBar_price: {
        fontSize: 16,
        color: COLORS.price,
        transform: [{ translateY: 0 }, { translateX: 10 }]
    },
    toolBar_btn: {
        flex: .6,
        backgroundColor: COLORS.secondary,
        height: 49,
        alignItems: 'center',
        justifyContent: 'center'
    },
    toolBar_btnText: {
        fontSize: 16,
        color: '#fff'
    },
    toolBar_arrowIco: {
        fontSize: 12,
        color: COLORS.link
    },
    toolBar_detailBtn: {
        color: COLORS.link
    },
    toolBar_detail: {
        padding: 5,
    },
    //价格明细
    priceDetail_sym: {
        color: '#999',
        margin: 3,
    },
    priceDetail_unit: {
        color: '#666',

    }

});

