

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
import List from '../../components/list';
import Checkbox from '../../components/checkbox/index';
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

import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();

/*数组说明  
-- subtitle 将当前objcet标示为 小标题
-- selected 默认已选择项
-- all  不限，不限对象的标示 方便选择不限项时同级清空
*/
const data = [
    {

        value: '1',
        label: lan.flights_filter_departureArrivalTime,

        children: [
            {
                id: 1,
                label: lan.flights_filter_unlimited,
                value: '1-1-1',
                subtitle: lan.flights_filter_arrivalTime,
                checked: true,
                all: true,
            }, {
                label: `${lan.flights_filter_morning}（06:00-12:00）`,
                value: '1-1-2',
                parentid: 1,
                checked: false,

            },
            {
                label: `${lan.flights_filter_afternoon}（12:00-18:00）`,
                value: '1-1-3',
                parentid: 1,
                checked: false,

            },
            {
                label: `${lan.flights_filter_night}（18:00-24:00）`,
                value: '1-1-4',
                parentid: 1,
                checked: false,
            },
            {
                label: `${lan.flights_filter_beforeDawn}（00:00-06:00）`,
                value: '1-1-5',
                parentid: 1,
                checked: false,
            },

            {
                id: 2,
                label: lan.flights_filter_unlimited,
                value: '1-2-1',
                checked: true,
                subtitle: lan.flights_filter_arrivalTime,
                all: true,
            }, {
                label: `${lan.flights_filter_morning}（06:00-12:00）`,
                value: '1-2-2',
                parentid: 2,
                checked: false,

            },
            {
                label: `${lan.flights_filter_afternoon}（12:00-18:00）`,
                value: '1-2-3',
                parentid: 2,
                checked: false,

            },
            {
                label: `${lan.flights_filter_night}（18:00-24:00）`,
                value: '1-2-4',
                parentid: 2,
                checked: false,
            },
            {
                label: `${lan.flights_filter_beforeDawn}（00:00-06:00）`,
                value: '1-2-5',
                parentid: 2,
                checked: false,
            },
        ]




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
                id: 1,
                label: '不限',
                value: '3-1-1',
                checked: true,
                subtitle: '出发机场',
                all: true,
            },
            {
                parentid: 1,
                label: '厦门国际机场',
                value: '3-1-2',
            },
            {
                id: 2,
                label: '不限',
                value: '3-2-1',
                checked: true,
                subtitle: '抵达机场',
                all: true,
            },
            {
                parentid: 2,
                label: '厦门国际机场',
                value: '3-2-2',
                checked: false,
            }

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


export default class Filter extends Component {

    state = {
        initData: this.props.data,
        checkedData: [],
        popupHeight:350,
    }

    //获取 回调 当前选择的值
    onChange(value) {
        let label = '';
        let checkedData = [];
        let newData = this.state.initData;
        let tabPosition = value[0];
        let dataItem = newData[tabPosition - 1];
        //当有"不限"选项选中时，撤销对应parentid所有已选择状态
        if (value[1].all && !value[1].checked) {
            let filter = dataItem.children.filter((o, i, arr) =>
                o.parentid === value[1].id
            );
            for (let item of filter)
                item.checked = false;
            value[1].checked = true;
        }
        else {
            //已选择"不限"时，禁止撤销选择
            if (value[1].parentid == null)
                return;
            let position = dataItem.children.findIndex(o => o.id === value[1].parentid);
            //当有选项选中时，撤销"不限"的已选择状态
            if (position != -1)
                dataItem.children[position].checked = false;
            value[1].checked = !value[1].checked;
            //当没有选项选择时，自动勾选不限
            let exits_selected = dataItem.children.filter((o) =>
                o.checked && o.parentid === value[1].parentid
            );
            if (exits_selected.length == 0) {
                dataItem.children[position].checked = true;
            }
        }



        // newData.forEach((dataItem, index1) => {
        //     if (dataItem.value === value[0]) {
        //         label = dataItem.label;

        //         // 二级
        //         if (dataItem.children && value[1]) {
        //             dataItem.children.forEach((cItem, index2) => {
        //                 if (cItem.value === value[1]) {
        //                     label += ` ${cItem.label}`;
        //                     let isCecked = newData[index1].children[index2];
        //                     let isThree = cItem.children && value[2];
        //                     if (!isThree) {
        //                         //是否为无限
        //                         if (cItem.all) {
        //                             dataItem.children.forEach((sItem, index6) => {
        //                                 let isCecked = newData[index1].children[index6];
        //                                 isCecked.checked = false;
        //                             })
        //                         } else {
        //                             dataItem.children.forEach((sItem, index7) => {
        //                                 let isCecked = newData[index1].children[index7];
        //                                 sItem.all ? isCecked.checked = false : null;
        //                             })
        //                         }
        //                         isCecked.checked = !isCecked.checked
        //                     }
        //                 }
        //                 // 三级
        //                 if (cItem.children && value[2]) {
        //                     cItem.children.forEach((sItem, index3) => {
        //                         let isCecked = newData[index1].children[index2].children[index3];
        //                         if (sItem.value === value[2]) {
        //                             label += ` ${sItem.label}`;
        //                             //是否为无限
        //                             if (sItem.all) {
        //                                 cItem.children.forEach((sItem, index4) => {
        //                                     let isCecked = newData[index1].children[index2].children[index4];
        //                                     isCecked.checked = false;
        //                                 })
        //                             } else {
        //                                 cItem.children.forEach((sItem, index5) => {
        //                                     let isCecked = newData[index1].children[index2].children[index5];
        //                                     sItem.all ? isCecked.checked = false : null;
        //                                 })
        //                             }
        //                             isCecked.checked = !isCecked.checked
        //                         }
        //                     })
        //                 }

        //             });
        //         }
        //     }
        // });

        this.setState({
            initData: newData,
        });
        //this.getFilterData(newData)
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

        //回调给父级属性
        if (this.props.getFilterData) {
            this.props.getFilterData(checkedData);
        }


        this.setState({
            checkedData: checkedData,
        });

    }


    render() {

        return this.state.initData ?
            <View style={{ height: this.state.popupHeight }}>
                <NavBar onlyBar leftText={lan.cancel} title={lan.filter} rightText={lan.confirm} onLeftClick={() => Popup.hide()} onRightClick={() => {
                    this.props.getFilterData(this.props.data);
                    Popup.hide();
                }} />
                <Menu data={this.state.initData} height={(v)=>{this.setState({popupHeight:v})}} onChange={this.onChange.bind(this)} />
            </View>
            : null;
    }

}
/*class FilterDemo extends React.Component {
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
               <NavBar />
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
                           { title: '从早到晚', icon: '0xe670', onPress: () => 1 },
                           { title: '从早低到高', icon: '0xe681', },
                       ]
                   }
               />
           </View>
       );
   }
}*/

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

