import React from 'react';
import { Image, ScrollView, View, Text } from 'react-native';
import { List, Switch, Stepper, Button } from 'antd-mobile';
//import InputItem from '../../ant/components/input-item/index';
import InputItem from '../../components/input-item/index';
import { createForm } from 'rc-form';
const Item = List.Item;
const Brief = Item.Brief;

class Form extends React.Component {
    state = {
        value: 1,
    }
    onSubmit = () => {
        console.log(this.refs.list);
        this.props.form.validateFields({ force: true }, (error) => {
            if (!error) {
                console.log(this.props.form.getFieldsValue());
            } else {
                alert('校验失败');
            }
        });
    }
    onReset = () => {
        this.props.form.resetFields();
    }
    validateAccount = (rule, value, callback) => {
        if (value && value.length > 4) {
            callback();
        } else {
            callback(new Error('帐号至少4个字符'));
        }
    }
    validatePs = (rule, value, callback) => {
        if (value && value.length >= 6) {
            callback();
        } else {
            callback(new Error('密码至少6个字符'));
        }
    }
    render() {
        let errors;
        const { getFieldProps, getFieldError } = this.props.form;
        return (<View>

            <List renderHeader={() => '验证表单'} ref="list"
                renderFooter={() => getFieldError('account') && getFieldError('account').join(',') || getFieldError('password') && getFieldError('password').join(',')}
            >
                <PItem form={this.props.form}/>


                <InputItem {...getFieldProps('password', {
                    rules: [
                        { required: false, message: '请输入密码' },
                        { validator: this.validatePs },
                    ],
                }) }
                    clear
                    error={!!getFieldError('password')}
                    onErrorClick={() => {
                        alert(getFieldError('password').join('、'));
                    }}
                    placeholder="请输入密码" type="password">
                    密码
        </InputItem>
                <Item
                    extra={<Switch {...getFieldProps('1', { initialValue: true, valuePropName: 'checked' }) } />}
                >确认信息</Item>


                <Item>
                    <Button type="primary" onClick={this.onSubmit} inline>提交验证</Button>
                    <Button onClick={this.onReset} inline style={{ marginLeft: 5 }}><Text>重置</Text></Button>
                </Item>
            </List>



        </View>)
    }
}

class PItem extends React.Component {
    render() {
        const { getFieldProps, getFieldError } = this.props.form;
        return (<List renderHeader={() => '证件信息*'} >
            <View  >
                <View >
                    <InputItem
                        {...getFieldProps('account', {
                            // initialValue: '小蚂蚁',
                            rules: [
                                { required: true, message: '请输入帐号' }, //required:false 否则会报警告
                                
                            ],
                        }) }
                        clear
                        error={!!getFieldError('account')}
                        onErrorClick={() => {
                            alert(getFieldError('account').join('、'));
                        }}
                        placeholder="请输入账号"
                    >帐号</InputItem>
                </View>
            </View>
        </List>)
    }
}

export default createForm()(Form)
