/**
 * Created by yqf on 2017/10/25.
 */

import React, {
    Component
} from 'react'

import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    Dimensions
} from 'react-native'


import NavigationBar from 'react-native-navbar'
import Icon from './icon';
const width= Dimensions.get('window').width;



const styles = {
    navbar: {
        alignItems: 'center',
        backgroundColor:'rgb(220,220,220)'
    },
    title: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 35,
        //backgroundColor:'blue'
        // marginBottom: 5,
    },
    titleText: {
        fontSize: 20,
        color: 'rgb(51,51,51)',
        // fontWeight: 'bold',
        textAlign: 'center'

    },
    button: {
        width: 35,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 16,
        color: '#333'
    },
    buttonIconFontText: {
        fontSize: 26,
        fontFamily: 'iconfont'
    },
    text: {
        color: '#fff',
        fontSize: 16,
    }
}

export default class NavBar extends Component{

    static defaultProps={

        titleStyle:{}

    }

    _leftOnClick(){

        if(this.props.OnLeftClick){
            this.props.OnLeftClick()
        }
        else {
            if (this.props.navigator) this.props.navigator.pop()

        }


    }

    _leftContent() {
        let iconCode = this.props.leftIcon ? this.props.leftIcon : '0xe183'
        if (this.props.leftText) {
            return <Text style={styles.text}>{this.props.leftText}</Text>
        } else {
            return <Icon icon={iconCode} color={'rgb(51,51,51)'} size={20} />
        }
    }



    _leftButton() {
        let paddingTop = Platform.OS == 'ios' ? 12 : 0;
        return (

            <TouchableOpacity activeOpacity={.7} style={{ paddingLeft: 10, paddingRight: 30, paddingBottom: paddingTop, paddingTop: paddingTop }}
                              onPress={this._leftOnClick.bind(this)}>
                {this._leftContent()}
            </TouchableOpacity>

        )

    }

    _title(){

        return (
            <View style={{alignItems:'center'}}>

            <View style={[styles.title,this.props.titleStyle]}>
                <Text numberOfLines={1} style={styles.titleText}>{this.props.title ? this.props.title : '一起飞'}</Text>
            </View>

                <View style={{backgroundColor:'rgb(220,220,220)',width:width,height:0.5,}}></View>
            </View>
        )

    }


    _rightContent() {
        let paddingTop = Platform.OS == 'ios' ? 0 : 0;
        let iconCode = this.props.rightIcon ? this.props.rightIcon : '0xe66e';
        if (!this.props.rightText && !this.props.rightIcon) return
        return <TouchableOpacity activeOpacity={.7} style={{ paddingLeft: 10, paddingRight: 10, paddingTop: paddingTop }}
                                 onPress={this.props.onRightClick}>
            {this.props.rightText ? <Text style={styles.text}>{this.props.rightText}</Text> : <Icon icon={iconCode} color={'rgb(51,51,51)'} size={20} />}
        </TouchableOpacity>

    }

    _rightButton() {
        return (
            <View style={{ paddingRight: 10, }}>
                {this.props.rightView ? this.props.rightView : this._rightContent()}
            </View>
        )

    }


    render(){

        let onlyBar = this.props.onlyBar ? true : false;
        let style = {
            paddingTop: Platform.OS === 'android' ? onlyBar ? 20 : 0 : 0,
            height: Platform.OS === 'android' ? onlyBar ? 64 : 44 : 44,
            marginTop: onlyBar ? -22 : 0,
            backgroundColor:'rgb(255,255,255)'
        }


        if (Platform.OS === 'android' && Platform.Version >= 21) {
            style = {
                paddingTop: Platform.OS === 'android' ? onlyBar ? 0 : 20 : 0,
                height: Platform.OS === 'android' ? onlyBar ? 44 : 64 : 44,
                marginTop: Platform.OS === 'ios' ? onlyBar ? -22 : 0 : 0,
                // height: Platform.OS === 'android' ? 44 : 44,
                // marginTop:Platform.OS==='android' ? 0 : onlyBar? -22:0,
            }
        }
        const statusBar = {
            style: 'default',
            hidden: Platform.OS === 'android' ? false : false,

            // height: Platform.OS === 'android' ? 64 : 44,
            //  marginTop:onlyBar? -22:0,
            // height: Platform.OS === 'android' ? 0 : 0,
            // marginTop:Platform.OS==='android' ? 0 : onlyBar? -22:0,
        }

var tincolor='#162840';

        return (




            <View>



            <NavigationBar
                style={[styles.navbar, style]}
                containerStyle={{ backgroundColor: 'red' }}
                tintColor={'rgb(255,255,255)'}
                statusBar={statusBar}
                leftButton={this._leftButton()}
                rightButton={this._rightButton()}
                title={this._title()}
            />


            </View>

        )



    }


}