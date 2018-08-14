/**
 * Created by yqf on 2018/7/31.
 */
//联系人多选
//#TODO 7.31






import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { observer } from 'mobx-react/native';
import {observable, autorun} from 'mobx';
import React, { Component } from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'


import {

    StyleSheet,
    View,
    Image,
    Text,
    ListView,
    TouchableOpacity,
    DeviceEventEmitter

} from 'react-native';

import YQFNavBar from '../../components/yqfNavBar';

import Colors from '../../Themes/Colors';
import {Chat} from '../../utils/chat'

import ChatRoom from '../../pages/Chat/ChatRoom';

import YQFProgressHUD from '../../components/YQFProgressHUD';




export default  class FriendSearch {


    @observable aa="dd";



}




@observer
//联系人列表
export default class Multi_Contact extends Component
{

    constructor(props) {
        super(props);

        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2
        });

        //这里改为this.store来处理

        this.state = {

            Users: [],
            SelectList:[],//选中的人
            isLoad: true,
            dataSource: ds.cloneWithRowsAndSections({}),
        }
    }







    componentDidMount()
    {

        //账号被踢下线
        this.listener = RCTDeviceEventEmitter.addListener('KickOff',()=>{

            this.props.navigator.popToTop();
        });


        this._HandleData();


    }


    componentWillUnmount(){
        this.listener.remove();
    }











    render()
    {

        var rightTitle;
        if(this.props.type=='RemoveGroupMember'){
            rightTitle='删除';
        }
        else
        {
            rightTitle='确定';
        }

        return(

            <View style={{flex:1}}>





            </View>
        );
    }


}

