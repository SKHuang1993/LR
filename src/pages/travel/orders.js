import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    ListView,
    ScrollView,
    Platform,
    BackAndroid,
    Navigator,
} from 'react-native';
import {Tabs,Toast} from 'antd-mobile';
import {LanguageType} from '../../utils/languageType';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';
import ApprovalItem from './approvalItem';

import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();
var {width,height} = Dimensions.get('window')

const TabPane = Tabs.TabPane;

export default class Orders  extends Component {
    constructor(props) {
        super(props);
        this.state={
             activityKeyNum:1,
             approvalType:1,
        };
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:'#fff'}}>
                <Navbar navigator={this.props.navigator} title={lan.order_waitMeApprove}/>
                <Tabs activeKey={this.state.activityKeyNum} textColor='#999' defaultActiveKey={this.state.activityKeyNum}
                      animated={true} activeTextColor="#333"
                      activeUnderlineColor={COLORS.btnBg}>
                    <TabPane tab={lan.order_waitApprove} key="1">
                         <ScrollView style={{backgroundColor:COLORS.containerBg}}>
                            {this.getOrderItemInfo()}
                        </ScrollView>
                    </TabPane>
                    <TabPane tab={lan.order_approved} key="2">
                         <ScrollView style={{backgroundColor:COLORS.containerBg}}>
                             {this.getOrderItemInfo()}
                        </ScrollView>
                    </TabPane>
                </Tabs>
            </View>
        )
    }  

    getOrderItemInfo = () => {
        return <ApprovalItem />
    }
     
}

const styles = StyleSheet.create({
    milescardViewStyle:{
        flexDirection:'row',
        backgroundColor:"#fff",
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
        paddingBottom:10,
    },
    viewStyle:{
        alignItems: 'center',
        backgroundColor:COLORS.containerBg,
        height:height,
    },
})