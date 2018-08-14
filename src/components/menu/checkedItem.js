import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    StyleSheet,
    ScrollView
} from 'react-native'
import classNames from 'classnames';
import List from '../list/index';
import Flex from '../flex';
import Icon from '../icons/icon';
//import Radio from '../radio/Radio';
import { Radio } from 'antd-mobile';
import { COLORS, FLEXBOX } from '../../styles/commonStyle';
import Checkbox from '../checkbox/'
export default class SubMenu extends React.Component {
    constructor(props) {
        super(props);
        this.rowId = 0;
        this.onClick = (tabPosition, dataItem) => {


            //  dataItem = dataItem.length >= 1 ? dataItem : [dataItem]
            // 单选
            this.setState({
                selItem: dataItem,
            });

            if (this.props.onCheck) {
                this.props.onCheck(tabPosition, dataItem);
            }
        };
        this.state = {
            // 单选
            selItem: props.selItem,
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.subMenuData !== this.props.subMenuData) {
            this.setState({
                selItem: nextProps.selItem,
            });
        }
    }

    //是否选中

    isChecked(dataVal) {
        //   return  this.props.valsData.length > 0 ?  (this.props.valsData.indexOf(dataVal.value) !==-1 ? true : false) : dataVal.checked ? true: false  ;
        return dataVal.checked ? true : false;
    }

    listItem(item, index, tabPosition) {
        let items = item.length >= 1 ? item[item.length - 1] : item;
        return (
            <TouchableOpacity key={this.rowId++} onPress={this.onClick.bind(this, tabPosition, [items])} activeOpacity={.7} style={styles.selectedBox}>
                <Text style={styles.selectedText}>
                    {items.label}
                </Text>
                <Icon icon={'0Xe65f'} style={styles.selectedIcon} />
            </TouchableOpacity>
        )
    }

    getCheckedList() {
        let list = [];
        this.props.data.forEach((dataItem, index) => {
            if (dataItem.value && dataItem.children) {
                // 二级
                dataItem.children.forEach((cItem, index1) => {
                    // 三级
                    if (cItem.value && cItem.children) {
                        cItem.children.forEach((sItem, index2) => {

                            if (sItem.checked && !sItem.all) {
                                list.push(this.listItem([dataItem, cItem, sItem], sItem.value, index + 1));
                            }
                        })
                    } else {
                        if (cItem.checked && !cItem.all) {
                            list.push(this.listItem([dataItem, cItem], cItem.value, index + 1));
                        }
                    }
                });

            }
        })
        return list;
    }





    render() {
        const { subMenuPrefixCls, radioPrefixCls, subMenuData } = this.props;
        const { selItem } = this.state;

        const selected = dataItem => selItem.length > 0 && selItem[0].value === dataItem.value;
        return (
            <View style={styles.selected}>
                <ScrollView  >
                    <Flex wrap='wrap' style={styles.selectedFlex} >
                        {this.getCheckedList()}
                    </Flex>

                </ScrollView>
            </View>
        );
    }
}


const styles = StyleSheet.create({

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
        color: COLORS.secondary,
        marginRight: 3,
        fontSize: 14
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



