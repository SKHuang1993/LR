import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
} from 'react-native';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class DetailProblem  extends Component {
    render(){
        return(
            <View style={{flex:1,backgroundColor:'#fff'}}>
                <Navbar navigator={this.props.navigator} title={lan.detail} />
                <Text style={{color:'#333',fontSize:17,marginTop:10,marginLeft:15,marginRight:15}}>{this.props.Title}</Text>
                <Text style={{color:'#333',fontSize:15,marginTop:20,marginLeft:15,marginRight:15}}>{this.props.Content}</Text>
            </View>
        );
    }
}