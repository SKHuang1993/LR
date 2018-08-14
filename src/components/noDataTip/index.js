import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Image,
    Dimensions,
} from 'react-native';
import {LanguageType} from '../../utils/languageType';
import {COLORS} from '../../styles/commonStyle';

import { BaseComponent } from '../locale';
let lan = BaseComponent.getLocale();



export default class Index extends Component {

    static defaultProps={
         noDataState:1,//1-查询不到数据,2-查询已超时,3-网络不给力,4-暂无任何信息
    }
    constructor(props) {
        super(props);
    }
    

    render(){
        return(
            <View style={{justifyContent:'center',alignItems:'center',paddingTop:100}}>
                {this.getNoDataImg(this.props.noDataState)}
                <Text style={{color:'#666',fontSize:15,marginTop:10,marginBottom:10}}>{this.getNoDataName(this.props.noDataState)}</Text>
            </View>
        );
    }

    //根据无数据状态给出不同状态图片
    getNoDataImg = (val) => {
        if(val == 1)
            return (<Image source={require('../../images/search_no_data.png')}
                        style={{width:120,height:120,}}/>
            );
        else if(val == 2)
            return (<Image source={require('../../images/timeout.png')}
                        style={{width:120,height:120,}}/>
            );
        else if(val == 3)
            return (<Image source={require('../../images/network.png')}
                        style={{width:120,height:120,}}/>
            );
        else
            return (<Image source={require('../../images/no_data.png')}
                        style={{width:120,height:120,}}/>
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