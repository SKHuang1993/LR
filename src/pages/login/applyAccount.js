import React, { Component } from 'react';
import {
    AppRegistry,
    Navigator,
    Text,
    Dimensions,
    StyleSheet,
    View,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Platform,
    BackAndroid,
    ScrollView,
    Alert,
    NativeModules,
} from 'react-native';

import { Toast, TextareaItem } from 'antd-mobile';
import { COLORS } from '../../styles/commonStyle';
//import { LanguageType } from '../../utils/languageType';
import { RestAPI } from '../../utils/yqfws'
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';

var { width, height } = Dimensions.get('window');
import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();

export default class ApplyAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            companyName: '',//公司名称
            contact: '',//联系人姓名
            contactNumber: '',//联系号码
            email: '',//电子邮箱
            msg: '',//留言
        };
    }

    render() {
        return (
            <View style={{ backgroundColor: COLORS.containerBg }}>
                <Navbar navigator={this.props.navigator} title={lan.applayAccount} style={{ marginTop: 10, }} />
                <ScrollView >
                    <Text style={styles.applyRemindStyle}>{lan.applyOnline}</Text>

                    <View style={styles.infoViewStyle}>
                        <Text style={styles.infoTextStyle}>{lan.companyName + ":"}</Text>
                        <TextInput style={{ flex: .7, fontSize: 16, }}
                            placeholder={lan.companyName} placeholderTextColor='#ccc'
                            onChangeText={(txt) => { this.state.companyName = txt; }}
                            underlineColorAndroid="transparent"
                            selectionColor='#333' />
                    </View>

                    <View style={styles.infoViewStyle}>
                        <Text style={styles.infoTextStyle}>{lan.contact + ":"}</Text>
                        <TextInput style={{ flex: .7, fontSize: 16, }}
                            placeholder={lan.contact + lan.name} placeholderTextColor='#ccc'
                            onChangeText={(txt) => { this.state.contact = txt; }}

                            underlineColorAndroid="transparent"
                            selectionColor='#333' />
                    </View>

                    <View style={styles.infoViewStyle}>
                        <Text style={styles.infoTextStyle}>{lan.contactNumber + ":"}</Text>
                        <TextInput style={{ flex: .7, fontSize: 16 }}
                            placeholder={lan.contactNumber} placeholderTextColor='#ccc'
                            onChangeText={(txt) => { this.state.contactNumber = txt; }}
                            underlineColorAndroid="transparent" keyboardType={'numeric'}

                            selectionColor='#333' />
                    </View>

                    <View style={styles.infoViewStyle}>
                        <Text style={styles.infoTextStyle}>{lan.email + ":"}</Text>
                        <TextInput style={{ flex: .7, fontSize: 16, }}
                            placeholder={lan.email} placeholderTextColor='#ccc'
                            onChangeText={(txt) => { this.state.email = txt; }}
                            underlineColorAndroid="transparent" keyboardType={'email-address'}

                            selectionColor='#333' />
                    </View>

                    <View style={{ flexDirection: 'row', backgroundColor: '#fff', height: 100, alignItems: 'flex-start', marginBottom: 1 }}>
                        <Text style={[styles.infoTextStyle, { flex: .3, fontSize: 16, paddingTop: 10, }]}>{lan.message + ":"}</Text>

                        <TextInput style={[{ flex: .7, fontSize: 16, textAlignVertical: 'top',   }, Platform.OS == 'ios' ? { padding: 5 } : { padding: 10,fontSize:16 }]}
                            placeholder={lan.message} placeholderTextColor={'#ccc'}
                            onChangeText={(txt) => { this.state.msg = txt; }}
                            underlineColorAndroid="transparent"
                            multiline={true}
                            selectionColor='#333' />

                    </View>
                    <View style={{ backgroundColor: "#fff" }}>
                        <TouchableOpacity style={styles.submitBtnStyle} onPress={() => this.submitBtnEvent()}>
                            <Text style={styles.submitTextStyle}>{lan.submit}</Text>
                        </TouchableOpacity>
                    </View>
                    <View >
                        <Text style={styles.contactTextStyle}>{lan.contactWay}</Text>
                    </View>

                    <TouchableOpacity style={styles.contactViewStyle} onPress={() => this.callPhoneEvent("18620030898")}>
                        <Text style={{ flex: 1.3, color: "#666", fontSize: 16, }}>{lan.salesManager}</Text>
                        <Text style={{ flex: 1.2, color: "#666", fontSize: 16 }}>{lan.salesManagerName}</Text>
                        <Text style={{ flex: 2.5, color: "#666", fontSize: 16 }}>18620030898</Text>
                        <Icon style={{ fontSize: 20 }} icon={'0xe66f'} color={'#64B6FF'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactViewStyle} onPress={() => this.callPhoneEvent("18620030872")}>
                        <Text style={{ flex: 1.3, color: "#666", fontSize: 16, }}>{lan.divManager}</Text>
                        <Text style={{ flex: 1.2, color: "#666", fontSize: 16 }}>{lan.divManagerName}</Text>
                        <Text style={{ flex: 2.5, color: "#666", fontSize: 16 }}>18620030872</Text>
                        <Icon style={{ fontSize: 20 }} icon={'0xe66f'} color={'#64B6FF'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactViewStyle} onPress={() => this.callPhoneEvent("18620030812")}>
                        <Text style={{ flex: 1.3, color: "#666", fontSize: 16, }}>{lan.accManager}</Text>
                        <Text style={{ flex: 1.2, color: "#666", fontSize: 16 }}>{lan.accManagerName}</Text>
                        <Text style={{ flex: 2.5, color: "#666", fontSize: 16 }}>18620030812</Text>
                        <Icon style={{ fontSize: 20 }} icon={'0xe66f'} color={'#64B6FF'} />
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    submitBtnEvent = () => {
        if (this.state.companyName == '' || this.state.contact == '' || this.state.contactNumber == ''
            || this.state.email == '' || this.state.msg == '') {
            Toast.info(lan.incomplete, 3, null, false);
        } else {
            let param = {
                "ID": null,
                "CustomerCompanyName": this.state.companyName,
                "ContactPerson": this.state.contact,
                "ContactMobile": this.state.contactNumber,
                "ContactEmail": this.state.email,
                "Content": this.state.msg
            }
            Toast.loading(lan.submit, 60, () => {
                Toast.info(lan.loginFail, 5, null, false);
            });
            console.log('12345', JSON.stringify(param));
            RestAPI.invoke("Biz3.BIZCompanyApplyCU", JSON.stringify(param), (test) => {
                Toast.hide();
                let verInfo = test;
                console.log('12346', test);
                if (verInfo.Code == 0) {
                    Toast.info(lan.submitApply, 3, null, false);
                    const { navigator } = this.props;
                    if (navigator) {
                        navigator.pop()
                    }
                } else {
                    Toast.info(test, 5, null, false);
                }
            }, (err) => {
                Toast.info(err, 5, null, false);
            });
        }
    }

    callPhoneEvent = (phoneNum) => {
        Alert.alert(
            lan.call,
            phoneNum,
            [
                { text: lan.ok, onPress: () => NativeModules.MyNativeModule.callPhont(phoneNum) },
                { text: lan.cancel, onPress: () => console.log('Cancel Pressed!', phoneNum) },
            ]
        )
    }

    componentWillMount() {
        if (Platform.OS === 'android') {
            BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
        };
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
        }
    }
    onBackAndroid = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
            return true;
        }
        return false;
    }

    goBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    }
}

const styles = StyleSheet.create({
    infoViewStyle: {
        marginBottom: 1,
        flexDirection: 'row',
        height: 45,
        width: width,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyRemindStyle: {
        backgroundColor: COLORS.containerBg,
        color: '#999',
        paddingLeft: 10,
        paddingTop: 5,
        paddingBottom: 5,
        fontSize: 12,
    },
    infoTextStyle: {
        flex: .3,
        fontSize: 16,
        color: '#333',
        paddingLeft: 15,
    },
    submitBtnStyle: {
        backgroundColor: COLORS.btnBg,
        borderRadius: 5,
        margin: 15,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitTextStyle: {
        color: "#fff",
        fontSize: 17,
        textAlign: "center",
    },
    contactTextStyle: {
        marginTop: 50,
        marginLeft: 15,
        marginBottom: 3,
        color: "#999",
        fontSize: 14
    },
    contactViewStyle: {
        marginBottom: 1,
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: "#fff",
        height: 50,
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: 'center',
    },
})