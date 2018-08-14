
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    ListView,
    Switch,
    TouchableOpacity, Alert,
} from 'react-native';

import { List, WhiteSpace, DatePicker, ActivityIndicator } from 'antd-mobile';
import Flex from '../../components/flex';
import NavBar from '../../components/navBar';
import Picker from '../../components/picker'
import Icon from '../../components/icons/icon';
import Checkbox from '../../components/checkbox/'
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import SearchBar from '../../components/search-bar/';
import Button from '../../components/button/'
import Employee from '../../stores/staff/'
import { observer } from 'mobx-react/native'
import InputItem from '../../components/input-item/'
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import Enumerable from 'linq'
import Form from '../../components/form/';
const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;
import moment from 'moment';
import 'moment/locale/zh-cn';

const defaultDate = moment().locale('zh-cn').utcOffset(8);
const getField = new Form().getField;
//旅客接口 CRM.ProofTypeGet  获取旅客证件类型
// 以下是修改过的数组
const ProofTypes = [
    {
        "value": "10",
        "label": "军人证",

    },
    {
        "value": "11",
        "label": "回乡证",

    },
    {
        "value": "12",
        "label": "台胞证",

    },
    {
        "value": "13",
        "label": "港澳通行证",

    },
    {
        "value": "ID",
        "label": "身份证",

    },
    {
        "value": "NI",
        "label": "其他证件",

    },
    {
        "value": "PP",
        "label": "护照",

    }
]
// 新增员工 第一步
@observer
export default class AddEmployee extends Component {
    @observable obj = {
        name: undefined,
        list: [{ name: undefined, date: undefined }, { name: undefined, date: undefined }],
        num: "123"
    };

    constructor(props) {
        super(props);
        this.state = {

            sex: [{
                "value": "0",
                "label": "女",
            },
            {
                "value": "1",
                "label": "男",
            }
            ],

            sexValue: [],
            proofValue: [],
            dataValue: "",
        }
    }


    render() {
        return <View style={styles.container}>
            <NavBar title={'新增员工'} />
            <ScrollView>
                <Form ref="form">
                    <List renderHeader={() => '基本信息*'}>
                        <InputItem
                            {...getField(this.obj.name) }
                            errorInfo={"长度不能超过4"}
                            onChange={(text) => this.obj.name = text}
                            validator={(text) => {
                                if (text.length > 4)
                                    return false
                                else
                                    return true
                            }}
                            labelNumber={5}
                            placeholder="请输入姓名"
                            autoFocus
                        >姓名
                </InputItem>
                        <Picker
                            {...getField(this.state.sexValue) }
                            data={this.state.sex} cols={1}
                            title="性别"
                            labelNumber={5}
                            triggerType="onClick"
                            onChange={(sexValue) => this.setState({ sexValue })}
                        >
                            <List.Item arrow="horizontal" last >性别</List.Item>
                        </Picker>

                        <InputItem optional
                            labelNumber={5}
                            placeholder=""
                            focused={this.state.focused}

                        >联系号码</InputItem>
                        <InputItem optional
                            labelNumber={5}
                            clear
                            placeholder="联系人我们会有专人与您联系"
                            focused={this.state.focused}

                        >电子邮箱</InputItem>
                        <Picker   {...getField(this.state.proofValue) }
                            data={ProofTypes} cols={1}
                            title="所属组织"
                            triggerType="onClick"
                            onChange={(proofValue) => this.setState({ proofValue })}
                        >
                            <List.Item arrow="horizontal" last >所属组织</List.Item>
                        </Picker>

                    </List>
                    {/*证件信息*/}

                    <List renderHeader={() => '证件信息*'} style={FLEXBOX.BottomSpace}>
                        {this.obj.list.map((o, i) =>
                            <View style={styles.proof} key={i}>
                                <View style={styles.proofMain}>
                                    <Picker
                                        data={ProofTypes} cols={1}
                                        title="证件类型"
                                        value={this.state.proofValue}
                                        triggerType="onClick"
                                        onChange={(proofValue) => this.setState({ proofValue })}
                                    >
                                        <List.Item arrow="horizontal" last >证件类型</List.Item>
                                    </Picker>
                                    <InputItem optional
                                        labelNumber={5}
                                        placeholder="请输入证件号码"
                                        focused={this.state.focused}

                                    >证件号码</InputItem>
                                    <InputItem optionalal
                                        labelNumber={5}
                                        placeholder="如：LI"
                                        focused={this.state.focused}

                                    >姓(拼音)</InputItem>
                                    <InputItem {...getField(o.name) }
                                        onChange={(text) => o.name = text}
                                        validator={(text) => {
                                            if (text.length > 4)
                                                return false
                                            else
                                                return true
                                        }}
                                        errorInfo={"长度不能超过4"}
                                        labelNumber={5}
                                        placeholder="如：LEI"
                                        focused={this.state.focused}

                                    >名(拼音)</InputItem>
                                    <DatePicker {...getField(o.date) }
                                        defaultDate={defaultDate}
                                        mode="date"
                                        title='日期'
                                        onChange={(dataValue) => o.date = dataValue}
                                    >
                                        <List.Item arrow="horizontal">
                                            选择时间
                         </List.Item>
                                    </DatePicker>
                                </View>
                                {/*删除按钮*/}
                                < TouchableOpacity
                                    activeOpacity={1}
                                    style={styles.del}
                                    onPress={() => alert(1)}
                                >
                                    <Icon icon={'0xe67c'} style={styles.delIcon} />
                                </TouchableOpacity>
                            </View>)}

                    </List>

                    {/*新增一个证件--按钮*/}
                    <View style={[styles.addBtn, FLEXBOX.BottomSpace]}>
                        <TouchableOpacity activeOpacity={0.7} style={styles.addBtn_box} onPress={() => {
                            this.obj.list.push({ name: "", date: undefined });
                        }}>
                            <Text style={styles.addBtn_txt}>
                                新增一个证件
                    </Text>
                        </TouchableOpacity>
                    </View>
                    {/*其他信息*/}

                    <Item obj={this.obj} {...getField() } />

                </Form>
            </ScrollView >
            <Button style={styles.confirmBtn} onClick={() => {
                console.log(toJS(this.obj));
                console.log(this.state);
                this.refs.form.validateFields((error) => {
                    console.log(error);
                })

            }} textStyle={styles.confirmBtnTxt} >下一步</Button>

        </View >

    }
}

@observer
class Item extends Component {
    render() {
        return (<List renderHeader={() => '证件信息*'} style={FLEXBOX.BottomSpace}>
            <View style={styles.proof} >
                <View style={styles.proofMain}>
                    <InputItem   {...getField(this.props.obj.num) }
                        onChange={(text) => this.props.obj.num = text}
                        labelNumber={5}
                        placeholder="请输入证件号码"

                    >证件号码</InputItem>
                </View>
            </View>
        </List>)
    }
}

//*证件信息*/
class proofItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            proofValue: [],
            dataValue: undefined,
        }
    }
    render() {
        return (
            <List renderHeader={() => '证件信息*'} style={FLEXBOX.BottomSpace}>
                <View style={styles.proof} >
                    <View style={styles.proofMain}>
                        <Picker
                            data={ProofTypes} cols={1}
                            title="证件类型"
                            value={this.state.proofValue}
                            triggerType="onClick"
                            onChange={(proofValue) => this.setState({ proofValue })}
                        >
                            <List.Item arrow="horizontal" last >证件类型</List.Item>
                        </Picker>
                        <InputItem
                            labelNumber={5}
                            placeholder="请输入证件号码"
                            focused={this.state.focused}

                        >证件号码</InputItem>
                        <InputItem
                            labelNumber={5}
                            clear
                            placeholder="如：LI"
                            focused={this.state.focused}

                        >姓(拼音)</InputItem>
                        <InputItem
                            labelNumber={5}
                            clear
                            placeholder="如：LEI"
                            focused={this.state.focused}

                        >名(拼音)</InputItem>
                        <DatePicker
                            defaultDate={defaultDate}
                            value={this.state.value}
                            mode="date"
                            title='选择日期'
                            onChange={this.onChange}
                            format={val => val.fromNow()}
                        >
                            <List.Item arrow="horizontal">
                                选择时间
                         </List.Item>
                        </DatePicker>
                    </View>
                    {/*删除按钮*/}
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.del}
                        onPress={() => alert(1)}
                    >
                        <Icon icon={'0xe67c'} style={styles.delIcon} />
                    </TouchableOpacity>
                </View>

            </List>
        )
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.containerBg,
    },
    proof: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    del: {

        width: FLEXBOX.width * 0.12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    delIcon: {
        color: '#999',
        fontSize: 20
    },
    proofMain: {
        flex: 1,
        width: 300

    },
    addBtn: {
        alignItems: 'center',

    },
    addBtn_box: {
        padding: 10,
        borderRadius: 20,
        width: FLEXBOX.width * .6,
        backgroundColor: '#fff'
    },
    addBtn_txt: {
        color: '#333',
        textAlign: 'center'
    },
    confirmBtn: {
        borderRadius: 0,
        borderWidth: 0,
        backgroundColor: COLORS.secondary,
    },
    confirmBtnTxt: {
        color: '#fff'
    },



});

