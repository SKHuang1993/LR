import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text
} from 'react-native';

export default class Icon extends Component {
    static defaultProps = {
        size: 16,
        color: '#000',
        icon:'0xe65c',
        onPress:null
    };

    render() {
        return (
            <Text onPress={this.props.onPress} style={[{ fontFamily: 'iconfont', fontSize: this.props.size, color: this.props.color },this.props.style]}>{String.fromCharCode(this.props.icon)}</Text>
        );
    }
}
