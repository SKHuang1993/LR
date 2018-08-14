import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    ListView,
    Alert,
    TouchableOpacity,
    Platform,
    NativeModules,
    BackAndroid,
} from 'react-native';
import {Tabs,Toast} from 'antd-mobile';
import Icon from '../../components/icons/icon';
import RadiusImage from '../../components/radiusImage/index';
import {COLORS, FLEXBOX} from '../../styles/commonStyle';
import {Chat} from '../../utils/chat';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

const adviserInfo = {};


export default class AdviserModule extends Component {
    static propTypes = {
        serviceStaffInfo:React.PropTypes.object,
	}

    constructor(props) {
        super(props);
        this.state={
        };
    }

    componentDidMount(){
    }

    render(){
        adviserInfo = this.props.serviceStaffInfo;
        // alert(this.props.serviceStaffInfo.IsOnline == false);
        return(
            <View style={[{flex:1,backgroundColor:"#fff",marginBottom:10},FLEXBOX.flexBetween]}>
                <View style={styles.adviserViewStyle}>
                    <View>
                        <RadiusImage pathType={1}
                            imagePath={adviserInfo.userImg}
                            imgWidth={60} imgHeight={60}>
                        </RadiusImage>
                        {this.props.serviceStaffInfo.IsOnline.IsOnline || this.props.serviceStaffInfo.IsOnline.IsMobileOnline ?
                        <View style={{backgroundColor:'#52aa39',position: 'absolute',bottom:3,right:3,width:16,borderColor:'#fff',
                                        overflow:'hidden',borderWidth:2,height:16,borderRadius:8,alignItems:'center',justifyContent:'center'}}>
                            <Icon icon={'0xe699'} color={'#fff'} style={{fontSize: 10}}/>
                        </View>
                         :
                         <View style={{backgroundColor:'#ccc',position: 'absolute',bottom:3,right:3,width:16,borderColor:'#fff',
                                        overflow:'hidden',borderWidth:2,height:16,borderRadius:8,alignItems:'center',justifyContent:'center'}}>
                            <Icon icon={'0xe699'} color={'#fff'} style={{fontSize: 10}}/>
                        </View>}
                    </View>

                    <View style={{marginLeft:8}}>
                        <Text style={{fontSize:16,color:'#333'}}>{adviserInfo.Name}</Text>
                        {adviserInfo.CustomerServiceCount ?
                        <Text style={{fontSize:14,color:'#999',marginTop:5}}>{lan.serviceCustomerNum+adviserInfo.CustomerServiceCount}</Text>
                        : null}
                        <Text style={{ fontSize: 14, color: '#999', marginTop: 5 }}>
                            {lan.score}:{adviserInfo.UserAVGScore}
                        </Text>
                       
                    </View>
                    
                </View>
                <View style={{
                    flexDirection: 'row', flex: .5, alignItems: 'center',
                    justifyContent: 'center',}}>
                    <TouchableOpacity style={styles.contactIconStyle} onPress={()=>this.callPhoneEvent(adviserInfo.Mobile)}>
                        <Icon icon={'0xe66f'} color={'#fff'} style={{fontSize: 25,}}/>
                    </TouchableOpacity>
                   
                    <TouchableOpacity style={[styles.contactIconStyle, styles.contactWrap]} onPress={()=>this.chatWithAdviser()}>
                        <Icon icon={'0xe66b'} color={'#fff'} style={{fontSize: 25,}}/>
                    </TouchableOpacity>
                   
                </View>
            </View>
        );
    }

    //拨打电话
    callPhoneEvent=(phoneNum)=>{
        if(Platform.OS == 'android')
        Alert.alert(
            lan.call,
            phoneNum,
            [
              {text: lan.ok, onPress: () => {NativeModules.MyNativeModule.callPhone(phoneNum)}},
              {text: lan.cancel, onPress: () => {}},
            ]
          );
        else
            NativeModules.MyNativeModule.callPhone(phoneNum);
    }

    //聊天功能
    chatWithAdviser = () => {
        Chat.createConversation(this.props.navigator,this.props.serviceStaffInfo.IMNr,this.props.serviceStaffInfo.Name,"C2C",null);
        // Alert.alert(
        //     '聊天',
        //     '此功能在加急开发，敬请期待',
        //     [
        //       {text: lan.ok, onPress: () => {}},
        //     ]
        //   )
    }

    //点击QQ或者微信图标
    chaoWithQQOrWechat = () => {
        Alert.alert(
            '聊天',
            '第三方平台聊天跳转功能开发中，敬请期待',
            [
              {text: lan.ok, onPress: () => {}},
            ]
          )
    }
}

const styles = StyleSheet.create({
    adviserViewStyle:{
        flexDirection:'row',
        alignItems: 'center',
       // justifyContent: 'center',
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
        paddingBottom:10,
        flex:.5
    },
    contactIconStyle:{
       
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
        width:40,
        height:40,
        backgroundColor:'#19df67',
        borderRadius:20,
       marginLeft:30,
    },
    contactWrap:{
        backgroundColor: '#fbad3d',
    }
})