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
    Animated
} from 'react-native';

import { List, WhiteSpace, Picker, ActivityIndicator, Popup } from 'antd-mobile';
import Flex from '../../components/flex';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import Modal from '../../components/modal';
import { COLORS, FLEXBOX } from '../../styles/commonStyle';
import Button from '../../components/button';
import Accordion from 'react-native-collapsible/Accordion';
import { observer } from 'mobx-react/native';
import FormatPrice from '../../components/formatPrice';
import Enumerable from 'linq';
import { BaseComponent, zh_CN, en_US } from '../locale';
let lan = BaseComponent.getLocale();

import Change from '../../pages/trains/change';

// 组件数据格式
const initData = {
    type:3,
    CabinName: lan.economyClass,
    DiscountRate: '5.0',
    Price: '98990',
    ExtraPrice: `${lan.flights_enginePlusFuel}:￥50`
}


export default class Index extends Component {

    static defaultProps = {
        endorseText: lan.loading // 退改签文本

    };
    constructor(props) {
        super(props);

        this.state = {
            visible: false,

        }
    }
    showModal = (e) => {
        // 现象：如果弹出的弹框上的 x 按钮的位置、和手指点击 button 时所在的位置「重叠」起来，
        // 会触发 x 按钮的点击事件而导致关闭弹框 (注：弹框上的取消/确定等按钮遇到同样情况也会如此)
        e.preventDefault(); // 修复 Android 上点击穿透
        this.setState({
            visible: true,
        });
    }
    onClose = () => {
        this.setState({
            visible: false,
        });
    }

    render() {
        let data = this.props.data ? this.props.data : initData;
        let CabinName = data.CabinName;
        if (lan.lang == "EN") {
            let target = Enumerable.from(zh_CN).firstOrDefault(o => o.value == CabinName, null);
            if (target) CabinName = en_US[target.key] + " ";
        }
        return (
            <View style={styles.container}>
                <Flex justify='between' >
                    <Flex justify='between'>
                        <Text style={[styles.infoText, styles.cabin, data.CabinName || data.DiscountRate ? { marginRight: 10 } : null]}>{CabinName ? CabinName + ' | ' : null}{data.DiscountRate ? (data.DiscountRate < 10 ? data.DiscountRate + lan.flights_discount : lan.flights_fullPrice) : null}</Text>
                        <Text style={[styles.endorse,{color:data.changeColor?COLORS.link:'#999'}]} 
                                onPress={data.isBottom?null:this.showModal} >
                                {data.isBottom?
                                    (lan.change_changeSpend+":")
                                :(data.type == 2 ? lan.flights_cancelPolicy : lan.flights_ticketChangesBack)}
                        </Text>
                        {data.isBottom?FormatPrice(data.Price):null}
                    </Flex>
                    {data.isBottom?null:
                    <Flex>
                        <Text style={[styles.infoText, { marginRight: 2 }]}>
                            {data.ExtraPrice}
                        </Text>
                        {FormatPrice(data.Price)}
                    </Flex>
                    }
                    
                </Flex>
                <Modal
                    title="退改签"
                    transparent
                    maskClosable={false}
                    visible={this.state.visible}
                    onClose={this.onClose}
                    footer={[
                        { text: lan.confirm, onPress: () => { } },

                    ]}
                >

                    <Text>{this.props.endorseText}</Text>
                </Modal>
                
            </View>
        )

    }

}








const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },


    infoText: {
        color: '#999',
        fontSize: 10,

    },

    type: {
        marginLeft: 14,
    },
    days: {
        fontSize: 10,
        color: '#666',
        transform: [{ translateY: -3 },]

    },
    endorse: {
        textDecorationLine: 'underline',
        color: COLORS.link,
        fontSize: 12,

    },
    cabin: {
        color: '#333'
        // marginRight:10
    }




});

