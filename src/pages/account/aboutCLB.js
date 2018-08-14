import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    ScrollView,
    Alert,
    NativeModules,
    Platform,
    Linking,
} from 'react-native';
import RadiusImage from '../../components/radiusImage/index';
import EntryBar from '../../components/entryBar/index';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import { COLORS } from '../../styles/commonStyle';
import { RestAPI } from '../../utils/yqfws';
import UseGuide from './useGuide';
import IntroduceCLB from './introduceCLB';
import Package from '../../../package';
import CodePush from 'react-native-code-push';

let CodePushOptions = { checkFrequency: CodePush.CheckFrequency.MANUAL };

var { width, height } = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class AboutCLB extends Component {
    constructor(props) {
        super(props);
        this.state = {
            buildVersion: 'v100',
            version: ""
        }


    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.containerBg }}>
                <Navbar navigator={this.props.navigator} title={lan.aboutCLB} />
                <ScrollView>
                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 40, marginBottom: 40 }}>
                        <RadiusImage pathType={2} radiusNum={8} imgWidth={70} imgHeight={70} />
                        <Text style={{ fontSize: 22, color: '#333', marginTop: 10 }}>{lan.appName}</Text>
                        <Text style={{ fontSize: 13, color: '#999', marginTop: 1 }}>{lan.versionCode + this.state.version}</Text>
                        <Text style={{ fontSize: 13, color: '#999', marginTop: 1 }}>Build:{this.state.buildVersion}</Text>
                    </View>
                    <EntryBar leftText={lan.useGuide} leftColor={'#333'} clickEvent={() => { this.toUseGuide() }} />
                    <EntryBar leftText={lan.checkToUpdata} leftColor={'#333'} clickEvent={() => this.checkToUpdataEvent()} />
                    <View style={{ height: 20 }} />
                    <EntryBar leftText={lan.introduce_clb} leftColor={'#333'} clickEvent={() => { this.toIntroduceCLB() }} />
                    <EntryBar leftText={lan.serviceCalls} leftColor={'#333'} clickEvent={() => { this.callPhoneEvent('4008-380-380') }} />
                </ScrollView>
            </View >
        );
    }

    //使用指南
    toUseGuide = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.push({
                name: 'UseGuide',
                component: UseGuide,
            });
        }
    }
    // 获取 code-push label版本号
    componentDidMount() {
        CodePush.getUpdateMetadata().then((metadata) => {
            if (metadata) {
                this.setState({
                    buildVersion: metadata.label
                })
            }

        });
        NativeModules.MyNativeModule.getAppVersion().done((result) => {
            this.setState({ version: result.version });
        });

    }

    //差旅宝介绍
    toIntroduceCLB = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.push({
                name: 'IntroduceCLB',
                component: IntroduceCLB,
            });
        }
    }

    //24小时服务电话
    callPhoneEvent = (phoneNum) => {
        if (Platform.OS == 'android')
            Alert.alert(
                lan.call,
                phoneNum,
                [
                    { text: lan.ok, onPress: () => { NativeModules.MyNativeModule.callPhone(phoneNum) } },
                    { text: lan.cancel, onPress: () => console.log('Cancel Pressed!', phoneNum) },])
        else
            NativeModules.MyNativeModule.callPhone(phoneNum);
    }

    //检测更新
    checkToUpdataEvent = () => {
        let idCode = Platform.OS == 'ios' ? 'OqkvcKzoviYkuDnmUW0QVZNQggL24ksvOXqog' : 'QwIw7CtbrfR8p9AwJcP1R7HxzYoN4ksvOXqog';
        CodePush.checkForUpdate(idCode).then((update) => {
            if (!update) {
                Alert.alert(
                    lan.checkToUpdata,
                    lan.latestVersion,
                    [
                        { text: lan.ok, onPress: () => { } },
                    ]
                )
            } else {
                CodePush.sync({
                    updateDialog: {
                        optionalIgnoreButtonLabel: lan.later,
                        optionalInstallButtonLabel: lan.backstageUpdate,
                        optionalUpdateMessage: lan.isUpdate,
                        mandatoryUpdateMessage: lan.isUpdate,
                        title: lan.updateRemind
                    },
                    installMode: CodePush.InstallMode.IMMEDIATE
                });
            }
        });
    }
}