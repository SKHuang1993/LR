import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    ListView,
    PixelRatio,
    StyleSheet, Image
} from 'react-native'
import classNames from 'classnames';
import List from '../list/index';
//import Radio from '../radio/Radio';
import { Radio } from 'antd-mobile';

import Checkbox from '../checkbox/'
export default class SubMenu extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = (dataItem) => {


            dataItem = dataItem.length >= 1 ? dataItem : [dataItem]
            // 单选
            this.setState({
                selItem: dataItem,
            });

            if (this.props.onSel) {
                this.props.onSel(dataItem);
            }
        };
        let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            //二级
            dataSource: ds.cloneWithRows(this.props.subMenuData),


            // 单选
            selItem: props.selItem,
        };
    }
    componentWillReceiveProps(nextProps) {
        //if (nextProps.subMenuData !== this.props.subMenuData) {
        let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.setState({
            selItem: nextProps.selItem,

            dataSource: ds.cloneWithRows(nextProps.subMenuData),
        });
        //}
    }



    //是否选中

    isChecked(dataVal) {
        //   return  this.props.valsData.length > 0 ?  (this.props.valsData.indexOf(dataVal.value) !==-1 ? true : false) : dataVal.checked ? true: false  ;
        return dataVal.checked ? true : false;
    }
    //是否有子标题
    isSubTitle(val,rowID) {
        return val ? <View style={[styles.subTitle,rowID != 0 ? {paddingTop:10} : null]}><Text style={styles.subTitleTxt}>{val}</Text></View> : true
    }

    secondList(dataItem,sectionID, rowID) {
        return (
            <View style={[styles.list,]}>

                {this.isSubTitle(dataItem.subtitle,rowID)}
                <Checkbox right
                    checked={this.isChecked(dataItem)}
                    // defaultChecked={selected(dataItem)}
                    disabled={dataItem.disabled}
                    onChange={() => {

                        this.onClick(dataItem)
                    }}
                    style={{ tintColor: '#fa5e5b' }}
                    wrapStyle={styles.checkbox}
                ><View style={{ flexDirection: 'row', flex: 1 }}>
                        {dataItem.icon ? <Image style={{ width: 13, height: 13, marginRight: 6 }} source={{ uri: dataItem.icon }} /> : null}
                        <Text style={{color:'#333'}}>
                            {dataItem.label}
                        </Text>
                    </View>
                </Checkbox>




            </View>)
    }

    threeList(subdata) {
        return <List.Item  >
            <Checkbox right
                checked={this.isChecked(subdata)}
                // defaultChecked={selected(dataItem)}
                disabled={subdata.disabled}
                onChange={() => {

                    this.onClick([dataItem, subdata])
                }}

                style={{ tintColor: '#fa5e5b' }}  >
                <Text style={{ flex: 1 }}>
                    {subdata.label}
                </Text>
            </Checkbox>
        </List.Item>
    }
    _renderRow(rowData,sectionID, rowID) {
        return this.secondList(rowData,sectionID, rowID)
    }


    render() {
        const { subMenuPrefixCls, radioPrefixCls, subMenuData } = this.props;
        const { selItem } = this.state;

        const selected = dataItem => selItem.length > 0 && selItem[0].value === dataItem.value;
        return (
            <ListView
                initialListSize={8}
                dataSource={this.state.dataSource}
                renderRow={
                    this._renderRow.bind(this)
                }

            />
        )
    }
}


const styles = StyleSheet.create({
    subTitle: {
        borderBottomWidth: 1 / PixelRatio.get(),
        borderBottomColor: '#ddd',
        paddingBottom: 10,
        marginBottom: 10,


    },
    subTitleTxt: {
        color: '#999',
        fontSize:12,

    },
    list: {
        borderBottomWidth: 1 / PixelRatio.get(),
        borderBottomColor: '#ddd',
        marginLeft: 10,
        paddingTop: 10,
        paddingBottom: 10,

    },
    checkbox: {
        paddingRight: 10,
    }
})