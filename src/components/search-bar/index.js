
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
} from 'react-native';

import Flex from '../../components/flex';
import Icon from '../../components/icons/icon';

import { COLORS, FLEXBOX } from '../../styles/commonStyle'

import TextFixled from '../../components/text-fixled/'
export default class SearchBar extends Component {
    static defaultProps = {
        btnTxt: '搜索',
        placeHolder: '请输入员工姓名进行搜索',
        onBtnPress: () => { },
        alertTxt: '请输入内容'
    };

    constructor(props) {
        super(props);
        this.state = {
            inputVal: '',
        };

    }

    leftView(data) {
        return data ? data : null
    }
    getInputVal = () => {

        this.props.onBtnPress(this.state.inputVal)

    }

    getText() {
        return this.state.inputVal;
    }

    render() {
        return (

            <Flex wrap='wrap' justify='start' align='center' style={styles.searchBar}>
                {this.leftView(this.props.leftView)}

                <View style={styles.textInputBox}>
                    <TextInput
                        placeholder={this.props.placeHolder}
                        numberOfLines={1}
                        style={styles.textInput}
                        onChangeText={(text) => { this.setState({ inputVal: text }); this.props.textChange(text) }}
                        value={this.state.inputVal}
                    />
                    <Icon icon='0xe671' style={styles.searhIcon} />
                </View>
                <TouchableOpacity onPress={this.getInputVal} activeOpacity={1}>
                    <Text style={styles.btnTxt}>{this.props.btnTxt}</Text>
                </TouchableOpacity>
            </Flex>

        )
    }
}







const styles = StyleSheet.create({
    searchBar: {

        height: 44,
        justifyContent: 'center',
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,

    },
    textInput: {

        height: 30,

        backgroundColor: '#e6eaf2',
        borderRadius: 3,
        borderColor: '#cccccc',
        borderWidth: 1 / FLEXBOX.pixel,
        paddingLeft: 22,
        fontSize: 14,

    },
    searhIcon: {
        position: 'absolute',
        top: 6,
        left: 5,
        fontSize: 16,
        color: '#a1a1a2',
        backgroundColor: 'rgba(255,255,255,0)'


    },
    btnTxt: {
        color: '#333'
    },
    textInputBox: {
        flex: 1,
        width: FLEXBOX.width * 0.6,
        marginRight: 10,
    }



});

