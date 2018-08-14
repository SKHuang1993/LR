import React, {
    Component
} from 'react'

import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Platform,
    TouchableHighlight,
    ScrollView,
} from 'react-native'


import { COLORS, FLEXBOX } from '../../styles/commonStyle';
import assign from 'object-assign';
import List from '../list';
import Flex from '../flex';
import Icon from '../icons/icon';
import SubMenu from './SubMenu';
import CheckedItem from './checkedItem';
export default class Menu extends React.Component {
    static defaultProps = {
        data: [],
        level: 2,
        tabActiveBg: { backgroundColor: '#fff' },
        tabActiveTxt: { color: '#333' },
        onChange: () => { },
        height:350,
    }
    constructor(props) {
        super(props);
        this.onClickFirstLevelItem = (dataItem) => {
            this.setState({
                firstLevelSelectValue: dataItem.value,
            });
            if (dataItem.isLeaf && this.props.onChange) {
                this.props.onChange([dataItem.value]);
            }
        };
        this.onClickSubMenuItem = (dataItem) => {
            const { level, onChange } = this.props;
            //dataItem = dataItem.length > 1 ? [dataItem[0].value, dataItem[1].value,] : [dataItem[0].value];
            setTimeout(() => {
                if (onChange) {
                    onChange(level === 2 ? [this.state.firstLevelSelectValue, ...dataItem] : [dataItem.value]);
                }
            }, 0);
        };
        this.onClickCheckItem = (position, dataItem) => {
            const { level, onChange } = this.props;

            //dataItem = dataItem.length > 2 ? [dataItem[0].value, dataItem[1].value, dataItem[2].value] : [dataItem[0].value, dataItem[1].value];
            let a = [position, ...dataItem];
            if (onChange) {
                onChange(level === 2 ? [position, ...dataItem] : [dataItem.value]);
            }
        }
        this.state = {
            firstLevelSelectValue: this.getNewFsv(props),
            checkedData: [],
        };
    }
    getNewFsv(props) {
        const { value, data } = props;
        return value && value.length ? value[0] : !data[0].isLeaf ? data[0].value : '';
    }

    //是否显示 红点
    getDot(data) {
        let color = {
            color: COLORS.secondary,
        }
        for (let i = 0; i < data.children.length; i++) {

            if (data.children[i].checked && !data.children[i].all) {
                return color
            }
            if (data.children[i].children && data.children[i].value) {
                for (let k = 0; k < data.children[i].children.length; k++) {
                    if (data.children[i].children[k].checked && !data.children[i].children[k].all) {
                        return color
                    }
                }
            }
        }
    }
    getHeight=(v)=>{
      return  this.props.height(400);
    }
    render() {
        const { className, style, height, data = [], prefixCls, value, level } = this.props;
        const { firstLevelSelectValue } = this.state;
        let subMenuData = data[0].children || [];
        if (level !== 2) {
            subMenuData = data;
        }
        else if (firstLevelSelectValue) {
            subMenuData = data.filter(dataItem => dataItem.value === firstLevelSelectValue)[0].children || [];
        }
        //获取 this.props.value 二级Value
        const subValue = value && value.length && value[value.length - 1];
        //二级初始选中值
        const subSelInitItem = subMenuData.filter(dataItem => dataItem.value === subValue);
        //获取选择checked
        let checkedData = [];
        this.props.data.forEach((dataItem, index) => {
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

        checkedData.length >=1 ? this.getHeight :null; 
        
        
        return (
            <View style={[{ flex: 1, }  ]}>
                {/*已选*/}
                {checkedData.length >= 1 ? <CheckedItem onCheck={this.onClickCheckItem} data={this.props.data} /> : null }
                <Flex align="start" style={{ flex: 1 }}>
                    {level === 2 ? (
                        <ScrollView style={styles.tabBar} >
                            {data.map((dataItem, index) => (
                                <TouchableOpacity activeOpacity={.7} style={[styles.tabButton, dataItem.value === firstLevelSelectValue ? this.props.tabActiveBg : null]}

                                    onPress={() => this.onClickFirstLevelItem(dataItem)}
                                    key={`listitem-1-${index}`}
                                ><Text style={[styles.tabButtonTxt, dataItem.value === firstLevelSelectValue ? this.props.tabActiveTxt : null]}>
                                        <Text style={[styles.dot, this.getDot(dataItem)]} >•</Text>{dataItem.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : null}
                    <View style={styles.tabContent}>
                        <SubMenu style={styles.tabContent}
                            subMenuPrefixCls={this.props.subMenuPrefixCls}
                            radioPrefixCls={this.props.radioPrefixCls}
                            subMenuData={subMenuData}
                            selItem={subSelInitItem}
                            onSel={this.onClickSubMenuItem}
                            valsData={this.props.valData}
                        />
                    </View>
                </Flex>
            </View>);
    }
}


const styles = StyleSheet.create({

    tabs: {

    },
    tabBar: {
        flex: 0.3,
        width: FLEXBOX.width * 0.3,
        height:500,
        backgroundColor:'#e6eaf2'
        
    },
    tabContent: {
        flex: 0,
        width: FLEXBOX.width * 0.7,

    },
    tabButton: {
        paddingLeft: 0,
        paddingTop: 20,
        paddingBottom: 20,
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
        color: 'rgba(255,255,255,0)',
        marginRight: 3,
        fontSize: 14,
    },
    tabButtonTxt: {
        color: '#666',
    },
    selected: {
        height: 65,
        backgroundColor: COLORS.primary,
    },
    selectedText: {
        color: '#fff'
    },
    selectedIcon: {
        color: '#fff',
        fontSize: 12,
        marginTop: 2,
        marginLeft: 2,
    },
    selectedFlex: {
        flex: 1,
        paddingLeft: 5,

    },
    selectedBox: {
        borderRadius: 3,
        borderWidth: 1 / FLEXBOX.pixel,
        borderColor: 'rgba(255,255,255,.2)',
        padding: 3,
        paddingLeft: 5,
        paddingRight: 5,
        flexDirection: 'row',
        marginRight: 10,
        marginBottom: 8,
    }
});


