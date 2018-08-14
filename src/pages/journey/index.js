
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    Navigator, 
    TouchableOpacity,
    Dimensions,
    StatusBar,
} from 'react-native';

import NoData from '../../components/noDataTip'
import ItineraryOrder from '../account/itineraryOrder';
import {COLORS} from '../../styles/commonStyle';

var { width, height } = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class Journey extends Component {
   
    render() {
        return (
            <View style={{ flex: 1 }}>
                <StatusBar
                    animated={true}
                    hidden={false}
                    backgroundColor={'transparent'}
                    translucent={true}
                    barStyle="light-content"
                    showHideTransition={'fade'}
                />
                <View style={{height:Platform.OS == 'ios' ? 64 : 64,width:width,backgroundColor:COLORS.primary,
                            paddingTop:Platform.OS == 'ios' ? 20 : 20,alignItems:'center',justifyContent:'center'}}>
                    <Text style={{color:'#fff',fontSize:18}}>{lan.home_nav_journey}</Text>
                </View>
                <ItineraryOrder navigator={this.props.navigator}
                                AccountNo={this.props.My_Info.Result.Account.AccountNo}
                                CompanyID={this.props.My_Info.Result.Company.CompanyCode}
                                Visible={false}/>
            </View>
        )
    }
}