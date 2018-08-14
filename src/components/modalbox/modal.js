import {
    Modal, WebView, View, Platform
} from 'react-native';
import React, { Component } from 'react';
export default class Container extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
        }
    }
    render() {
        console.log(this.props.views);
        return React.createElement(this.props.isAndroid ? View : Modal, {
            animationType: "slide",
            visible: this.state.visible,
            onClose: this.onClose,

        }, this.props.views);
    }
}
