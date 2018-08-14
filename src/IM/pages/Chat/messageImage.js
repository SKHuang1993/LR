/**
 * Created by yqf on 2017/11/3.
 */


import {Component} from 'react';
import React, { PropTypes } from 'react';
import {
    Image,
    StyleSheet,
    View,Platform,
    TouchableOpacity
} from 'react-native';

import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';

export default class MessageImage extends React.Component {
    constructor(props) {
        super();
    }
    render() {
        const { Url, Width, Height } = this.props.ChatMessage.ImageContent;
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => RCTDeviceEventEmitter.emit('OpenImageViewer', this.props)} style={[styles.container, this.props.containerStyle]}>
                <Image
                    style={[styles.image, this.props.imageStyle, { width: 150, height: 150 * (Height / Width) }]}
                    source={{ uri: Url }}
                />
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
    },
    image: {
        borderRadius: 5
    },
});

