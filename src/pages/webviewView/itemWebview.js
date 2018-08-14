import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    Platform,
    WebView,
    TouchableOpacity,
    BackAndroid,
} from 'react-native';
import {LanguageType} from '../../utils/languageType';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';
import {Toast } from 'antd-mobile';
import hotelWebView from './hotelWebview';

var {width,height} = Dimensions.get('window')
var lan = LanguageType.setType();

export default class HotelWebview  extends Component {
    constructor(props) {
        super(props);
        this.state={
            url:this.props.Url,
        };
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                {/*<Navbar navigator={this.props.navigator} title={'酒店'}/>*/}
                <WebView
                    style={{backgroundColor:COLORS.containerBg,marginTop:20}}
                    source ={{uri:this.state.url}}
                    javaScriptEnabled={true}
                    autoCapitalize="none"   
                    onSubmitEditing={this.onSubmitEditing}
                    clearButtonMode="while-editing"
                    onNavigationStateChange={(value)=>{
                    }}
                    onLoadStart={(value)=>{
                        
                    }}
                    onLoadEnd={()=>{
                        Toast.hide();
                    }}
                />
            </View>
        )
    }

    

    componentWillMount(){
         if(Platform.OS === 'android'){
             BackAndroid.addEventListener('hardwareBackPress',this.onBackAndroid);
         };
     }

     componentWillUnmount(){
         if(Platform.OS === 'android'){
             BackAndroid.removeEventListener('hardwareBackPress',this.onBackAndroid);
         }
     }
     onBackAndroid = ()=>{
        const {navigator} = this.props;
         if(navigator){
             navigator.pop();
             return true;
         }
         return false;
     }
}

const styles = StyleSheet.create({
    policyTextStyle:{
        fontSize:14,
        color:'#999',
        paddingLeft:15,
        paddingBottom:2,
    },
    itemViewStyle:{
        paddingLeft:15,
        paddingRight:15,
        flexDirection:'row',
        paddingBottom:10,
        paddingTop:10,
        backgroundColor:'#fff',
        alignItems: 'center',
    },
    itemTextStyle:{
        color:'#333',
        fontSize:16,
        marginLeft:5,
        paddingRight:15
    },
})