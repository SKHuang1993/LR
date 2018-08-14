import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    Dimensions,
} from 'react-native';
import { LanguageType } from '../../utils/languageType';
import { COLORS } from '../../styles/commonStyle';

import { BaseComponent } from '../locale';
let lan = BaseComponent.getLocale();



export default class Index extends Component {

    static defaultProps = {
        noDataState: 1,//1-查询不到数据,2-查询已超时,3-网络不给力,4-暂无任何信息,
        size:'large',
        
    }
    constructor(props) {
        super(props);
        this.state={
            imgSize:props.size=='small' ? 100 : 120,
            textSize: props.size == 'small' ? 12 : 15
        }
    }

    render() {

        return (
            <View style={{
                position: 'absolute',
                top: this.props.top ? 50 : 50,
                bottom: 0,
                left: 0,
                marginTop:this.props.size == 'small' ? -120 : 0,
               // backgroundColor:'red',
                right: 0, justifyContent: 'center', alignItems: 'center'
            }}>
                {this.getNoDataImg(this.props.noDataState)}
                <Text style={{ color: '#666', fontSize: this.state.textSize, marginTop: 10, marginBottom: 10 }}>{this.getNoDataName(this.props.noDataState)}</Text>
            </View>
        );
    }

    //根据无数据状态给出不同状态图片
    getNoDataImg = (val) => {
        if (val == 1)
            return (<Image source={require('../../images/search_no_data.png')}
                style={{ width: this.state.imgSize, height: this.state.imgSize, }} />
            );
        else if (val == 2)
            return (<Image source={require('../../images/timeout.png')}
                style={{ width: 120, height: 120, }} />
            );
        else if (val == 3)
            return (<Image source={require('../../images/network.png')}
                style={{ width: 120, height: 120, }} />
            );
        else
            return (<Image source={require('../../images/no_data.png')}
                style={{ width: 120, height: 120, }} />
            );
    }

    //根据无数据状态给出不同状态名称
   
    getNoDataName = (val) => {
        if(val == 1)
            return lan.noDataTip_val1;
        else if(val == 2)
            return lan.noDataTip_val2;
        else if(val == 3)
            return lan.noDataTip_val3;
        else
            return lan.noDataTip_val;
    }
}