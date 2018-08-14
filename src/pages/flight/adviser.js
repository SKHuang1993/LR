// 查询不到数据 联系顾问模块 
import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Dimensions,
    ListView,
    NativeModules,
    Platform,
    Alert,
} from 'react-native';
import Icon from '../../components/icons/icon';
import RadiusImage from '../../components/radiusImage/index';
import { COLORS, FLEXBOX } from '../../styles/commonStyle';
import Navbar from '../../components/navBar/index';
import { observer } from 'mobx-react/native';

var { width, height } = Dimensions.get('window')

@observer
export default class MyAccount extends Component {

    static defaultProps = {
        height: 200
    };
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {

    }

    render() {
        return (
            <View style={{ height: 200 }}>
                <Text style={{ marginBottom: 5, marginLeft: 10, fontSize: 12, color: '#999' }}>您可以直接联系我们的差旅顾问为您预订</Text>
                {/*顾问列表 显示两条*/}
                {this.props.staffContacts && this.props.staffContacts.map((v, i) => {
                    return <View key={i}>{this.setAdviserView(v)}</View>
                })}

            </View>
        )
    }




    //差旅顾问布局
    setAdviserView = (value) => {
        return (
            <View>
                <View style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 15, alignItems: 'center', justifyContent: 'center' }}>
                    <View>
                        <RadiusImage pathType={1}
                            imagePath={"http://m.woquguo.net/UserImg/" + value.UserCode + "/3"}
                            imgWidth={60} imgHeight={60}>
                        </RadiusImage>
                        <View style={{
                            backgroundColor: '#45da84', position: 'absolute', bottom: 3, right: 3,
                            borderColor: '#fff', borderWidth: 3 / FLEXBOX.pixel, overflow: 'hidden',
                            width: 15, height: 15, borderRadius: 7.5, alignItems: 'center', justifyContent: 'center'
                        }}>
                            {/*显示在线的*/}
                            <Icon icon={'0xe699'} color={'#fff'} style={{ fontSize: 10 }} />
                        </View>
                    </View>

                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: '#333', fontSize: 17 }}>{value.StaffName}</Text>
                            <Icon icon={'0xe68c'} color={COLORS.btnBg} style={{ fontSize: 16, marginLeft: 15 }} />
                            <Text style={{ color: COLORS.btnBg, fontSize: 17 }}>{value.UserCommentScore.ObjectAVGScore}</Text>
                        </View>
                        <Text style={{ color: '#999', fontSize: 15, marginTop: 5 }}>{'服务客户数：' + value.UserServiceCount.CustomerServiceCount}</Text>
                        <Text style={{ color: '#999', fontSize: 15, }}>{'方案数：' + value.UserServiceCount.FormulaCount}</Text>
                    </View>
                    <TouchableOpacity onPress={() => this.callPhoneToAdviser(value.StaffWorkPhone)}>
                        <Icon icon={'0xe66f'} color={'#999'} style={{ fontSize: 23, }} />
                    </TouchableOpacity>
                </View>
                <View style={{ backgroundColor: '#ebebeb', height: 0.8 }} />
            </View>
        );
    }

    //电话联系差旅顾问
    //电话联系差旅顾问
    callPhoneToAdviser = (tel) => {
        if (Platform.OS == 'android')
            Alert.alert(
                '拨打电话',
                tel,
                [
                    { text: '确定', onPress: () => { NativeModules.MyNativeModule.callPhone(tel) } },
                    { text: '取消', onPress: () => { } },
                ]
            );
        else
            NativeModules.MyNativeModule.callPhone(tel);
    }
}