import React, { Component } from 'react';

import {
    AppRegistry,
    Navigator,
    Text,
    Dimensions,
    StyleSheet,
    Image,
    TouchableOpacity,
    AsyncStorage,
    View,
    StatusBar,
} from 'react-native';
import ViewPager from 'react-native-viewpager';

import { IntlProvider } from 'react-intl';
import { FormattedMessage as Ttext } from 'react-intl-native';
import{ Button,Carousel }from 'antd-mobile';
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import {LanguageType} from '../../utils/languageType';

import login from '../login/login';

var {width,height} = Dimensions.get('window');

// 数据对应的key
var STORAGE_KEY = 'FIRST_KEY';

var IMGS = [
    {"Background":require('../../images/page_1.png'),"ID":1},
    {"Background":require('../../images/page_2.png'),"ID":2},
    {"Background":require('../../images/page_3.png'),"ID":3},
    {"Background":require('../../images/page_4.png'),"ID":4}
];
// var IMGS = [
//     {"Background":'',"ID":1},
//     {"Background":'',"ID":2},
//     {"Background":'',"ID":3},
//     {"Background":'',"ID":4},
// ];

export default class WelcomeUI extends Component {
    constructor(props) {
         super(props);
         lan = LanguageType.setType();
         ds = new ViewPager.DataSource({
            pageHasChanged: (p1, p2) => p1 !== p2,
        });
         this.state={
             lanType:null,
             dataSource:new ViewPager.DataSource({
                pageHasChanged: (p1, p2) => p1 !== p2,
            }),
         };
     }

     componentDidMount() {  
         
            //这里获取从FirstPageComponent传递过来的参数: id  
            // LanguageType.getType().done(()=>{
            //         this.lan=LanguageType.setType(), 
            //         this.setState({  
            //     });  
            // });  
    }  

    render() {
        this.state.dataSource = ds.cloneWithPages(IMGS);
        return(
            <View style={{backgroundColor:'#42a6da',paddingBottom:20,width:width,height:height,}}>
                <StatusBar
                    animated={true}
                    hidden={false}
                    backgroundColor={'transparent'}
                    translucent={true}
                    barStyle="light-content"
                    showHideTransition={'fade'}
                />
                <ViewPager
                    dataSource={this.state.dataSource}
                    renderPage={this._renderPage.bind(this)}
                    isLoop={false}
                    autoPlay={false}>
                </ViewPager>
            </View>
        );
    }

    _renderPage = (value) => {
        return (
            <View style={{alignItems:'center',justifyContent:'flex-end'}}>
                <Image source={value.Background}
                       style={{width:width,height:height}}
                       resizeMode={'contain'} />
                {value.ID == 4 ? 
                <View style={{position: 'absolute',bottom:70,alignItems:'center',justifyContent:'center',width:width}}>
                    <TouchableOpacity style={{width:200,height:50,alignItems:'center',justifyContent:'center',
                                    borderColor:'#fff',borderRadius:8,borderWidth:1,}}
                                    onPress={()=>this.onClick()} >
                        <Text style={{color:'#fff',fontSize:18}}>进入应用</Text>
                    </TouchableOpacity>
                </View>
                : null}
            </View>
        );
    }
    onClick = () =>{
        this._save('noFirst');
        const {navigator} = this.props;
        if(navigator) {
            navigator.replace({
                name: 'login',
                component: login,
                params:{
                    lanType:this.state.lanType,
                }
            })
        }
    }

    // 保存
    _save = async (value) =>{
        try {
            await AsyncStorage.setItem(STORAGE_KEY, value);
        } catch (error) {
            await AsyncStorage.setItem(STORAGE_KEY, null);
            console.log('_save error: ',error.message);
        }
    }

}

var styles = StyleSheet.create({
    viewStyle: {
        height:height,
        width:width,
        backgroundColor: '#F5FCFF',
        flexDirection: 'column',
        alignItems: 'center',
     },
     buttonBgStyle:{
         borderRadius:20,
         backgroundColor:'#f44848',
         width:250,
         height:40,
         flexDirection: 'column',
         alignItems: 'center',
         justifyContent: 'center',
     },
     buttonStyle:{
         width:200,
         height:40,
         alignItems: 'center',
         justifyContent: 'center',
         backgroundColor:COLORS.btnBg,
     },
});
