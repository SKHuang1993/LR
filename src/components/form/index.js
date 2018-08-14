
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

import { BaseComponent } from '../locale';
let lan = BaseComponent.getLocale();

export default class Form extends Component {
    readonly = false;
    id = 0;
    obj = {};
    ref = () => {
        return this.id++;
    }

    constructor(readonly) {
        super();
        this.readonly = readonly;
    }

    isEmail = (mail) => {
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (filter.test(mail)) {
            return true;
        } else {
            return false;
        }
    }

    isPhone = (phone) => {
        var filter = /^[0-9]{11}$/;
        if (filter.test(phone)) {
            return true;
        } else {
            return false;
        }
    }

    getField = (value, type) => {
        let validator;
        let errorInfo;
        if (type) {
            if (type.toLowerCase() === 'email') {
                validator = (text) => {
                    if (!text) return true
                    return this.isEmail(text);
                }
                errorInfo = lan.form_emailErrorInfo
            }
            else if (type.toLowerCase() === 'phone') {
                validator = (text) => {
                    if (!text) return true
                    return this.isPhone(text);
                }
                errorInfo = lan.form_phoneErrorInfo
            }
        }
        return { ref: this.ref(), value: value, validator: validator, errorInfo: errorInfo, disabled: this.readonly, editable: !this.readonly, arrow: this.readonly ? '' : "horizontal", validate: true }
    }

    validateFields = (error) => {
        this.isComplete = true
        this.validate(this._reactInternalInstance._currentElement._owner._instance.refs);
        error(!this.isComplete);
    }

    validate = (child) => {
        for (let item in child) {
            if (child[item].props.getType) {
                if (child[item].props.getType() === 'InputItem' || child[item].props.getType() === 'TextAreaItem') {
                    if (!child[item].props.value) {
                        if (!child[item].props.optional) {
                            child[item].setState({ error: true });
                            if (this.isComplete) {
                                this.isComplete = false;
                                Alert.alert(lan.form_enterHint + (child[item].props.getType() === 'TextAreaItem' ? child[item].props.placeholder : (child[item].props.children ? child[item].props.children : child[item].props.placeholder)));
                            }
                        } else {
                            child[item].setState({ error: false });
                        }
                    }
                    else {
                        this.obj[item] = child[item].props.value;
                        if (child[item].props.validator &&
                            !child[item].props.validator(child[item].props.value)) {
                            if (this.isComplete) {
                                child[item].setState({ error: true });
                                this.isComplete = false;
                                Alert.alert(child[item].props.errorInfo);
                            }
                        }
                    }
                }
                else if (child[item].props.getType() === 'Picker' || child[item].props.getType() === 'DatePicker') {
                    if ((!child[item].props.value || child[item].props.value.length == 0) && !child[item].props.optional) {
                        if (this.isComplete) {
                            this.isComplete = false;
                            Alert.alert(lan.form_selectHint + child[item].props.title);
                        }
                    }
                }
                else if (child[item].props.getType() === 'ListItem') {
                    if (child[item].props.validator &&
                        !child[item].props.validator(child[item].props.value)) {
                        if (this.isComplete) {
                            this.isComplete = false;
                            Alert.alert(child[item].props.errorInfo);
                        }
                    }
                    else if ((!child[item].props.value || child[item].props.value.length == 0) && child[item].props.optional == false) {
                        if (this.isComplete) {
                            this.isComplete = false;
                            Alert.alert(child[item].props.extra);
                        }
                    }
                }
            }

            this.validate(child[item].refs);
        }
    }

    getObjectClass = (obj) => {
        if (obj && obj.constructor && obj.constructor.toString) {
            console.log(obj.constructor.toString());
            if (obj.constructor.toString().indexOf("autoHeight") >= 0)
                return "TextAreaItem";
            else if (obj.constructor.toString().indexOf("password") >= 0)
                return "InputItem";
            else if (obj.constructor.toString().indexOf("_arrayTreeFilter2") >= 0)
                return "Picker";
            else if (obj.constructor.toString().indexOf("_possibleConstructorReturn3") >= 0)
                return "DatePicker";
        }
        return undefined;
        //         console.log(child);
        // if (child instanceof Array) child = child
        // else if (child instanceof Object) child = [child]
        // else return
        // for (let item of child) {
        //     if (item.type.name === 'InputItem') {
        //         if (!item.props.value) {
        //             if (!item.props.option) {
        //                 item._owner._instance.refs[item.ref].setState({ error: true });
        //                 if (this.isComplete) {
        //                     this.isComplete = false;
        //                     Alert.alert(item.props.children + "不能为空");
        //                 }
        //             }
        //         } else {
        //             if (item.props.validator) {
        //                 if (this.isComplete) {
        //                     this.isComplete = item.props.validator(item.props.value);
        //                     if (!this.isComplete && item.props.errorInfo) {
        //                         Alert.alert(item.props.errorInfo);
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     else if (item.type.name === 'Picker' || item.type.name === 'DatePicker') {
        //         if (item.props.value.length == 0) {
        //             if (this.isComplete) {
        //                 this.isComplete = false;
        //                 Alert.alert("请选择" + item.props.title);
        //             }
        //         }
        //     }
        //     this.validate(item.props.children);
        // }
    }

    // init = (child) => {
    //     if (child instanceof Array) child = child
    //     else if (child instanceof Object) child = [child]
    //     else return;
    //     let list = [];
    //     for (let item of child) {
    //         this.init(item.props.children);
    //         let a = React.cloneElement(item, {
    //             ref: this.list.length
    //         })
    //         list.push(a);
    //         this.list.push(list);
    //     }
    // }

    render() {
        return (<View>
            {this.props.children}
        </View>)
    }
}