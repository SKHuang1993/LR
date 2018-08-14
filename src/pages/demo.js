"use strict";

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    Navigator, BackAndroid, TouchableOpacity,NativeModules
} from 'react-native';

import { Tabs, TabBar, List,Button } from 'antd-mobile';
import Icon from '../components/icons/icon';
// import {RestAPI} from '../utils/yqfws';

const TabPane = Tabs.TabPane;
const Item = List.Item;

let value={
    
};

class Cbutton extends Button {
 
}


export default class demo extends Component  {
    showList(){
        return NativeModules.Components.showCityList((result)=>{
                            alert(result);
                            console.log('机票数据',result)
                            })
    }
    render() {
        // var data = {
        //     "Account": "HS010117",
        //     "Password": "HS010117",
        //     "IsPasswordEncrypted": null,
        //     "AccountType": 4,
        //     "LoginIp": null,
        //     "OrganizaType": null
        // }

        // var p = '{"Account": "HS010117","Password": "HS010117","AccountType": 4}'

        // RestAPI.invokeAsync('CRM.AccountLogin',JSON.stringify(data),(test)=>{
        //     //成功后对test进行操作
        //     console.log('555',JSON.parse(test).Code);
        // },(err)=>{
        //     //失败后显示err
        //     console.log('666',err);
        // });
        return (
            <View style={{ flex: 1 }}>
                <View style={{ height: 54, backgroundColor: '#f44848' }}></View>
                <Tabs  activeUnderlineColor={'#f44848'} activeTextColor={'#f44848'}>
                    <TabPane tab="选项卡一" >
                        <Item  multipleLine align="top" wrap={true}>
                            多行标题文字，文字可能比较长、文字可能比较长、直接折行
                            <Icon icon={0xe669} color={'#2470d2'} style={{fontSize:20}}  />
                    </Item>
                    </TabPane>
                    <TabPane tab="选项卡二" >
                        <Text style={{ alignSelf: 'center', padding: 15 }}>选项卡二</Text>
                         <Button type='primary' activeOpacity={0.5} activeStyle={{backgroundColor:'blue'}}    style={{backgroundColor:'red'}}>primary button</Button>
                          <Cbutton type='primary' activeOpacity={0.5} activeStyle={{backgroundColor:'blue'}}    style={{backgroundColor:'red'}}>primary button</Cbutton>
                        <TouchableOpacity onPress={this.showList} >
                            <Text>{value.city} {value.bb}</Text>
                        </TouchableOpacity>
                    </TabPane>
                    <TabPane tab="选项卡三">
                        <Text style={{ alignSelf: 'center', padding: 15 }}>选项卡三</Text>
                    </TabPane>
                </Tabs>
            </View>

        )
    }
}