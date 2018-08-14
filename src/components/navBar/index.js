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

import NavigationBar from 'react-native-navbar';
import Icon from '../icons/icon';
import { isIphoneX } from 'react-native-iphone-x-helper'


const width = Dimensions.get('window').width;
import { BaseComponent } from '../locale';
let lan = BaseComponent.getLocale();

const styles = {
    navbar: {
        alignItems: 'center',




    },
    title: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 30,
        //backgroundColor:'blue'
        // marginBottom: 5,


    },
    titleText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
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

function _renderBarButton(text, handler, icon = false, buttonStyle = {}, buttonTextStyle = {}) {
    let buttonText = [styles.buttonText, buttonTextStyle]
    if (icon) {
        text = iconfontConf(text)
        buttonText = [buttonText, styles.buttonIconFontText]
    }
    return (
        <TouchableOpacity
            onPress={handler}
            style={[styles.button, buttonStyle]}>
            <Text style={buttonText}>{text}</Text>
        </TouchableOpacity>
    )
}

export default class Navbar extends Component {

    static defaultProps = {
        // actions:{
        //     left: { title: '取消', icon: '0xe683', onPress: () => 1 },
        //     center: { title: '一起飞', },
        //     right: { title: '确定', icon: '', onPress: () => 1 }
        // }
        titleStyle: {}
    };
    constructor(props) {
        super(props)
        this.state = {

        }
    }


    _leftOnClick() {
        if (this.props.onLeftClick) {
            this.props.onLeftClick()
        } else {
            if (this.props.navigator) this.props.navigator.pop()
        }

    }
    _leftContent() {
        let iconCode = this.props.leftIcon ? this.props.leftIcon : '0xe66e'
        if (this.props.leftText) {
            return <Text style={styles.text}>{this.props.leftText}</Text>
        } else {
            return <Icon icon={iconCode} color={'#fff'} size={20} />
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

    _rightContent() {
        let paddingTop = Platform.OS == 'ios' ? 0 : 0;
        let iconCode = this.props.rightIcon ? this.props.rightIcon : '0xe66e';
        if (!this.props.rightText && !this.props.rightIcon) return
        return <TouchableOpacity activeOpacity={.7} style={{ paddingLeft: 10, paddingRight: 10, paddingTop: paddingTop }}
            onPress={this.props.onRightClick}>
            {this.props.rightText ? <Text style={styles.text}>{this.props.rightText}</Text> : <Icon icon={iconCode} color={'#fff'} size={20} />}
        </TouchableOpacity>

    }

    _rightButton() {
        return (
            <View style={{ paddingRight: 10, }}>
                {this.props.rightView ? this.props.rightView : this._rightContent()}
            </View>
        )

    }

    _title() {
        if (typeof this.props.title == "object") {
            return (
                <View style={[styles.title, this.props.titleStyle]}>
                    {this.props.title}
                </View>
            )
        } else {
            return (<View style={[styles.title, this.props.titleStyle]}>
                <Text numberOfLines={1} style={styles.titleText}>{this.props.title ? this.props.title : lan.yiqifei}</Text>
            </View>)
        }
    }


    render() {
        let onlyBar = this.props.onlyBar ? true : false;
        let style = {
            paddingTop: Platform.OS === 'android' ? onlyBar ? 20 : 0 : 0,
            height: Platform.OS === 'android' ? onlyBar ? 64 : 44 : 44,
            marginTop: onlyBar ? -22 : 0,
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
            style: 'light-content',
            hidden: Platform.OS === 'android' ? false : false,

            // height: Platform.OS === 'android' ? 64 : 44,
            //  marginTop:onlyBar? -22:0,

            // height: Platform.OS === 'android' ? 0 : 0,
            // marginTop:Platform.OS==='android' ? 0 : onlyBar? -22:0,
        }
        return (


            <View>

        {isIphoneX() && !onlyBar && <View style={{ height: 24, backgroundColor: '#159E7D'}} />}

        <NavigationBar
                style={[styles.navbar, style]}
                containerStyle={{ backgroundColor: 'red' }}
                tintColor={'#159E7D'}
                statusBar={statusBar}
                leftButton={this._leftButton()}
                rightButton={this._rightButton()}
                title={this._title()}
            />

            </View>
        )
    }
}

