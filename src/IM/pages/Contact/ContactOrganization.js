/**
 * Created by yqf on 2017/11/8.
 */

//组织结构


import {observer} from 'mobx-react/native';

import {observable, autorun, computed, action} from 'mobx'
import {Component} from 'react';
import React, {PropTypes} from 'react';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import YQFEmptyView from '../../components/EmptyView';


import {
    TouchableOpacity,
    StyleSheet,
    Image,
    ListView,
    Text,
    View,
    RefreshControl,
    Dimensions

} from 'react-native';


import {IM} from '../../utils/data-access/im';
import contactList from '../../stores/Contact/ContactList';
import Colors from '../../Themes/Colors';
import Icon from '../../components/icon';
import YQFNavBar from '../../components/yqfNavBar';

import EmptyView from '../../components/EmptyView';
import ChatUserInfo from '../Chat/ChatUserInfo';
import {Chat} from '../../utils/chat';
import Enumerable from 'linq';
import FriendSearch from './FriendSearch';


let window = {

    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,

}


let ContactComponent = {

    margin: 10,
    iconW: 44,
    fontSize: 14,

};


export default class ContactOrganization extends Component {

    constructor(props) {
        super(props);
        this.state = {
            Arrays: [],
            dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
            isLoading: false
        }
    }


    //排列公司
    sortCompany = (array) => {

        var dic = {};

        array.map((user) => {

            var first = user.CompanyCode;

            if (first == undefined) {
            }

            if (dic[first] != undefined) {

                dic[first].push(user);
            }
            else {

                var data = [];
                data.push(user);
                dic[first] = data;

            }
        })


        if (dic) {


            return dic;
        }

        else {
            return null;
        }


    }

    //排列组织
    sortDepartment = (array) => {


        var dic = {};

        array.map((user) => {

            var first = user.DepartmentCode;

            if (first == undefined) {
            }

            if (dic[first] != undefined) {

                dic[first].push(user);
            }
            else {

                var data = [];
                data.push(user);
                dic[first] = data;

            }
        })


        if (dic) {

            return dic;
        }

        else {
            return null;
        }

    }

    //排列团队
    sortTeam = (array) => {


        var dic = {};

        array.map((user) => {

            var first = user.TeamCode;

            if (first == undefined) {
            }

            if (dic[first] != undefined) {

                dic[first].push(user);
            }
            else {

                var data = [];
                data.push(user);
                dic[first] = data;

            }
        })


        if (dic) {

            return dic;
        }

        else {
            return null;
        }

    }


    //排列IM组织结构
    static testIMOrganization = (array) => {


        var dic = {};

        array.map((user) => {


            var first = user.CompanyCode;

            if (first == undefined) {
            }

            if (dic[first] != undefined) {

                // dic['CompanyName'] =user.CompanyName;
                dic[first].push(user);
            }
            else {

                var data = [];
                data.push(user);
                dic[first] = data;
                // dic['CompanyName'] =user.CompanyName;

            }
        })


        if (dic) {

            return dic;
        }

        else {
            return null;
        }


    }


    _getSubType = async() => {


        //这里最好是直接去将Chat.

       // var result = await Chat._getSystemSubType();
        var result= Chat.obj.IMNrBySubType

        var test = this.sortCompany(result.IMUserLists);

        this.setState({
            isLoading: false,
            Arrays: test
        })

    }


    _renderHeader() {
        return (

            <TouchableOpacity onPress={() => {


                this.props.navigator.push({

                    component: FriendSearch,
                    passProps: {
                        type: 'INCU'
                    }

                })


            }} style={{backgroundColor: Colors.colors.Chat_Color230, flex: 1, height: 40}}>


                <View style={{
                    flex: 1,
                    margin: 8,
                    borderRadius: 3,
                    backgroundColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row'
                }}>

                    <Icon size={14} color={Colors.colors.Chat_Color153} icon={0xe171} style={{marginRight: 3}}/>

                    <Text style={[{fontSize: 14, marginLeft: 3, color: Colors.colors.Chat_Color153}]}>
                        {'搜索内部同事'}
                    </Text>


                </View>


            </TouchableOpacity>
        )
    }


    _ToChatUserInfo = async(data, rowID) => {

        var Peer = data.IMNr;
        var UserNrs = [Peer];


        //获取
        let usersInfo = await IM.getUserOrGroups({
            "UserNrs": UserNrs
        });

        this.props.navigator.push({


            //这里是组织架构，可以直接聊天，无需等待loading
            component: ChatUserInfo,
            passProps: {
                Peer: data.IMNr,
                User: usersInfo,
            }
        })

    }

    _renderIcon = (data) => {


        const {type} = this.props;
        var icon;

        if (type == 1) {
            icon = '0xe6bd';
        } else if (type == 2) {
            icon = '0xe6c1';
        } else if (type == 3) {
            icon = Chat.getFaceUrlPath(data.IconFile);
        }


        if (type == 1 || type == 2) {

            return (
                <View
                    style={{
                        margin: 10,
                        backgroundColor: '#FFA544',
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>

                    <Icon color={'white'} icon={icon} size={20} style={{}}/>

                </View>

            )
        }

        return (

            <Image source={{uri: icon}}
                   style={{margin: 10, width: 40, height: 40, borderRadius: 20}}>

            </Image>
        )


    }

    _renderRow(data, sectionID, rowID) {


        var type = this.props.type;
        var Name = this.props.type == 1 ? data[0].CompanyName : this.props.type == 2 ? data[0].DepartmentName : this.props.type == 3 ? data.AliasName : '';


        return (

            <TouchableOpacity onPress={() => {


                if (type == 1) {

                    this.props.navigator.push({
                        component: ContactOrganization,
                        passProps: {
                            type: 2,
                            array: data,
                            title: data[0].CompanyName
                        }
                    })

                }
                else if (type == 2) {


                    this.props.navigator.push({
                        component: ContactOrganization,
                        passProps: {
                            type: 3,
                            array: data,
                            title: data[0].DepartmentName
                        }
                    })


                } else {


                    this._ToChatUserInfo(data, rowID);


                }


            }}>


                <View style={[styles.row, {
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'white'
                }]}>


                    <View style={[styles.row, {alignItems: 'center', justifyContent: 'center'}]}>

                        {this._renderIcon(data)}

                        <Text style={{
                            fontSize: Chat.ContactComponent.fontSize,
                            color: Colors.colors.Chat_Color51,
                            padding: 10
                        }}>
                            {Name}
                        </Text>
                    </View>


                    <View style={{flexDirection: 'row', alignItems: 'center'}}>

                        <Text
                            style={{color: 'rgb(102,102,102)'}}>{type == 1 || type == 2 ? data.length + '人' : ''}</Text>
                        <Icon icon={'0xe177'} size={18} color={'rgb(51,51,51)'} style={{marginRight: 10}}></Icon>

                    </View>


                </View>


                <View style={{backgroundColor: Colors.colors.Chat_Color235, height: 0.5,}}></View>


            </TouchableOpacity>

        )


    }


    componentDidMount() {

        if (this.props.type == '1') {

            this._getSubType();

        } else if (this.props.type == '2') {

            var departments = this.sortDepartment(this.props.array);
            this.setState({
                Arrays: departments
            })
        }
        else if (this.props.type == '3') {


            var teams = this.props.array;


            this.setState({
                Arrays: teams
            })
        }

    }


    _renderContent() {


        if (this.state.isLoading == true) {

            return (
                <YQFEmptyView title={'正在加载组织架构...'} icon={'0xe653'}/>

            )
        }
        else {
            return (
                <ListView style={{marginTop: 0}}
                          renderHeader={this._renderHeader.bind(this)}
                          dataSource={this.state.dataSource.cloneWithRows(this.state.Arrays)}
                          renderRow={this._renderRow.bind(this)}>

                </ListView>
            )
        }


    }

    _renderNav() {
        return (
            <YQFNavBar title={this.props.title}
                       leftIcon={'0xe183'}
                       onLeftClick={() => {


                           this.props.navigator.pop();


                       }}/>
        )
    }

    render() {


        return (

            <View style={{backgroundColor: Colors.colors.Chat_Color235, flex: 1}}>


                {this._renderNav()}
                {this._renderContent()}

            </View>



        );

    }


}

const styles = StyleSheet.create({

    row: {

        flexDirection: 'row',

    },
    center: {

        justifyContent: 'center',
        alignItems: 'center',

    },

    flex: {
        backgroundColor: 'rgb(248,248,248)',
        flex: 1,
    },

    flex1: {
        flex: 1,
    }


});

