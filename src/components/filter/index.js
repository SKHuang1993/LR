

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ListView,
    TouchableOpacity,
    TouchableHighlight,
    Animated
} from 'react-native';




import { Popup, WhiteSpace, Button, Tabs } from 'antd-mobile';
import List from '../list/';
import Checkbox from '../checkbox/index';
const AgreeItem = Checkbox.AgreeItem;
const CheckboxItem = Checkbox.CheckboxItem;

import Flex from '../../components/flex';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import ToolBar from '../../components/toolBar/'
import Menu from '../../components/menu/index'
import '../../utils/date';
import { COLORS, FLEXBOX } from '../../styles/commonStyle';

const TabPane = Tabs.TabPane;



/*数组说明  
-- subtitle 将当前objcet标示为 小标题
-- selected 默认已选择项
-- all  不限，不限对象的标示 方便选择不限项时同级清空
*/
const data = [
    {

        value: '1',
        label: '起抵时间',

        children: [
            {
                value: '1-1',
                label: '出发时间',
                subtitle: true,
                checked: false,
                children: [

                    {
                        label: '不限',
                        value: '1-1-1',
                        checked: true,
                        all: true,
                    }, {
                        label: '上午（06:00-12:00）',
                        value: '1-1-2',
                        checked: false,

                    },
                    {
                        label: '下午（12:00-18:00）',
                        value: '1-1-3',
                        checked: false,

                    },
                    {
                        label: '夜晚（18:00-24:00）',
                        value: '1-1-4',
                        checked: false,
                    },
                    {
                        label: '凌晨（00:00-06:00）',
                        value: '1-1-5',
                        checked: false,
                    },
                ]
            },
            {
                value: '1-2',
                label: '抵达时间',
                subtitle: true,
                checked: false,
                children: [

                    {
                        label: '不限',
                        value: '1-2-1',
                        checked: true,
                        all: true,
                    }, {
                        label: '上午（06:00-12:00）',
                        value: '1-2-2',
                        checked: false,

                    },
                    {
                        label: '下午（12:00-18:00）',
                        value: '1-2-3',
                        checked: false,

                    },
                    {
                        label: '夜晚（18:00-24:00）',
                        value: '1-2-4',
                        checked: false,
                    },
                    {
                        label: '凌晨（00:00-06:00）',
                        value: '1-2-5',
                        checked: false,
                    },
                ]
            }]


    }, {
        value: '2',
        label: '转机',

        children: [
            {
                label: '不限',
                value: '2-1',
                checked: true,
                all: true,
            }, {
                label: '直飞',
                value: '2-2',


            },

        ]
    },
    {
        value: '3',
        label: '机场',

        children: [
            {
                label: '出发机场',
                value: '3-1',
                subtitle: true,
                disabled: true,
                children: [
                    {
                        label: '不限',
                        value: '3-1-1',
                        checked: true,
                        all: true,
                    },
                    {
                        label: '厦门国际机场',
                        value: '3-1-2',
                    }
                ]
            }, {
                label: '抵达机场',
                value: '3-2',
                subtitle: true,
                disabled: true,
                children: [
                    {
                        label: '不限',
                        value: '3-2-1',
                        checked: true,
                        all: true,
                    },
                    {
                        label: '厦门国际机场',
                        value: '3-2-2',
                        checked: false,
                    }
                ]
            },

        ]
    },
    {
        value: '4',
        label: '航空公司',

        children: [
            {
                label: '不限',
                value: '4-1',
                checked: true,
                all: true,
            }, {
                label: '北京首都',
                value: '4-2',
                checked: false,

            },

        ]
    },
];


class Filter extends Component {

    state = {
        initData: data,
        checkedData: [],
    }

    //获取 回调 当前选择的值
    onChange(value) {
        let label = '';
        let checkedData = [];
        let newData = this.state.initData;
        // 改变  this.state.initData 数据结构
        newData.forEach((dataItem, index1) => {
            if (dataItem.value === value[0]) {
                label = dataItem.label;

                // 二级
                if (dataItem.children && value[1]) {
                    dataItem.children.forEach((cItem, index2) => {
                        if (cItem.value === value[1]) {
                            label += ` ${cItem.label}`;
                            let isCecked = newData[index1].children[index2];
                            let isThree = cItem.children && value[2];
                            if (!isThree) {
                                //是否为无限
                                if (cItem.all) {
                                    dataItem.children.forEach((sItem, index6) => {
                                        let isCecked = newData[index1].children[index6];
                                        isCecked.checked = false;
                                    })
                                } else {
                                    dataItem.children.forEach((sItem, index7) => {
                                        let isCecked = newData[index1].children[index7];
                                        sItem.all ? isCecked.checked = false : null;
                                    })
                                }
                                isCecked.checked = !isCecked.checked
                            }
                        }
                        // 三级
                        if (cItem.children && value[2]) {
                            cItem.children.forEach((sItem, index3) => {
                                let isCecked = newData[index1].children[index2].children[index3];
                                if (sItem.value === value[2]) {
                                    label += ` ${sItem.label}`;
                                    //是否为无限
                                    if (sItem.all) {
                                        cItem.children.forEach((sItem, index4) => {
                                            let isCecked = newData[index1].children[index2].children[index4];
                                            isCecked.checked = false;
                                        })
                                    } else {
                                        cItem.children.forEach((sItem, index5) => {
                                            let isCecked = newData[index1].children[index2].children[index5];
                                            sItem.all ? isCecked.checked = false : null;
                                        })
                                    }
                                    isCecked.checked = !isCecked.checked
                                }
                            })
                        }

                    });
                }
            }
        });

        this.setState({
            initData: newData,
        });
        this.getFilterData(newData)
    }

    // get fliter 选中数据
    getFilterData(data) {
        let checkedData = [];
        data.forEach((dataItem, index) => {
            if (dataItem.value && dataItem.children) {
                // 二级
                dataItem.children.forEach((cItem, index) => {
                    // 三级
                    if (cItem.value && cItem.children) {
                        cItem.children.forEach((sItem, index) => {

                            if (sItem.checked && !sItem.all) {
                                checkedData.push(sItem);
                            }
                        })
                    } else {
                        if (cItem.checked && !cItem.all) {
                            checkedData.push(cItem);
                        }
                    }
                });

            }
        });


        this.setState({
            checkedData: checkedData,
        });

    }


    render() {
        return this.state.initData ? <Menu data={this.state.initData} onChange={this.onChange.bind(this)} />
            : null;
    }

}
export default class FilterDemo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sel0: '',
            sel1: '',
        };
    }
    getPopupContent = (num) => {
        return (
            <View style={{ height: 400 }}>
                <NavBar onlyBar leftText='取消' title='筛选' rightText='确定' onLeftClick={() => Popup.hide()} onRightClick={() => Popup.hide()} />
                <Filter />
            </View>
        );
    }
    onClose(sel, num) {
        this.setState({ [`sel${num}`]: sel });
        Popup.hide();
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <NavBar  />
                <View style={{ flex: 1 }}>

                </View>
                <ToolBar activeTab={1}
                    actions={
                        [
                            {
                                title: '筛选', icon: '0xe675', onPress: () => Popup.show(
                                    this.getPopupContent(1),
                                    {
                                        maskClosable: true,
                                        animationType: 'slide-up',
                                        onMaskClose: () => new Promise(resolve => { setTimeout(resolve, 1000); }),
                                    }
                                )
                            },
                            { title: '从早到晚', icon: '0xe670',onPress: ()=>1 },
                            { title: '从早低到高', icon: '0xe681', },
                        ]
                    }
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    tabs: {

    },
    tabBar: {
        flex: 0,
        width: FLEXBOX.width * 0.3,
    },
    tabContent: {
        flex: 0,
        width: FLEXBOX.width * 0.7,
    },
    tabButton: {

        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e6eaf2',
        flexDirection: 'row',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1 / FLEXBOX.pixel

    },

    tabItem: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    dot: {
        color: COLORS.secondary,
        marginRight: 3,
        fontSize: 14
    },
});

