import React, { Component } from 'react';
import {
    Text
} from 'react-native';

export default class TextField extends Component {
    render() {
        return (
            <Text style={[{color:(this.props.text || '') == ''?'#C5C5C5':'#000'},this.props.style]}>{(this.props.text || '') == '' ? this.props.placeHolder : this.props.text}</Text>
        );
    }
}


