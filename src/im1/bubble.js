import React from 'react';
import {
    Clipboard,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableNativeFeedback,
    Image,
    View,
    Text,
    Platform,
    Dimensions,
    TouchableOpacity
} from 'react-native';

import MessageText from './messageText';
import MessageImage from './messageImage';
import MessageGraphic from './messageGraphic';
import Icon from '../components/icons/icon';
import { observer } from 'mobx-react/native';
import { ActivityIndicator } from 'antd-mobile';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';

@observer
export default class Bubble extends React.Component {
    constructor(props) {
        super(props);
    }

    //发送失败||正在发送 标志
    renderFlags() {
        const status = this.props.message.Status; //信息状态  1为失败状态 2为重发状态 3为正在发送
        let iconStyle = {
            color: '#eb6663',
            fontSize: 16,
        };
        if (status == 1) {
            return (
                <TouchableOpacity activeOpacity={1} onPress={() => RCTDeviceEventEmitter.emit('ReSend', this.props.message)}><Icon icon={'0xe610'} style={iconStyle} /></TouchableOpacity>

            );
        }
        else if (status == 2) {
            return (
                <View><Icon icon={'0xe614'} style={iconStyle} /></View>
            );
        }
        else if (status == 3) {
            return (
                // <Image style={{ alignSelf: "flex-end", width: 20, height: 20 }}
                //     source={require('../images/loading.gif')}>
                // </Image>
                < ActivityIndicator />
            );
        }
        else {
            return null;
        }
    }

    renderMessageText() {
        if (this.props.message.ChatMessage.MessageType === 'Text' && this.props.message.ChatMessage.TextContent) {
            const { ...other } = this.props.message;
            return <MessageText {...other} />;
        }
        return null;
    }

    renderMessageImage() {
        if (this.props.message.ChatMessage.MessageType === 'Image' && this.props.message.ChatMessage.ImageContent) {
            const { ...other } = this.props.message;
            return <MessageImage {...other} />;
        }
        return null;
    }

    renderMessageNews() {
        if (this.props.message.ChatMessage.MessageType === 'News' && this.props.message.ChatMessage.NewsContent) {
            const { ...other } = this.props.message;
            return <MessageGraphic {...other} />;
        }
        return null;
    }
    _renderContent() {
        return (
            <TouchableWithoutFeedback >
                <View style={[styles[this.props.message.position].contentBox]} >
                    {this.renderMessageImage()}
                    {this.renderMessageText()}
                    {this.renderMessageNews()}
                </View>
            </TouchableWithoutFeedback>
        )
    }
    renderLeft() {
        let source = this.props.message.Source;
        return (
            <View style={[styles['left'].container,]}>
                <View style={[styles['left'].inner,]}>
                    <View style={[styles['left'].wrapper,]}>
                        {this._renderContent()}
                    </View>
                    {this.renderFlags()}
                </View>
                {source && <Text style={styles['left'].client}>{`消息来自:${source}`}</Text>}
            </View>
        );
    }

    renderRight() {
        return (
            <View style={[styles['right'].container,]}>
                {this.renderFlags()}
                <View style={[styles['right'].wrapper,]}>
                    {this._renderContent()}
                </View>

            </View>
        );
    }

    renderTriangle() {
        var bkcolor = StyleSheet.flatten(styles[this.props.message.position].wrapperStyle).backgroundColor;
        return (
            <View style={[styles[this.props.message.position].triangleStyle, { borderBottomColor: bkcolor }]}>
                <Image resizeMode={'cover'} source={{ uri: 'http://img2.yiqifei.com/20161125/03aa429a67604d06bf93ae92366e6752.png!50' }} style={{ width: 100, height: 100 }} />
            </View>);
    }

    render() {
        if (this.props.message.position == 'left') {
            return this.renderLeft();
        } else if (this.props.message.position == 'right') {
            return this.renderRight();
        } else {
            return null;
        }
    }
}

const styles = {
    left: StyleSheet.create({
        container: {
            flex: 1,
           // marginRight: 60,

        },
        inner: {

            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: 'center',
        },

        wrapper: {

            marginRight: 5,
        },
        wrapperStyle: {
            borderRadius: 15,
            backgroundColor: '#f0f0f0',
            marginRight: 6,
            minHeight: 20,
            maxWidth: Dimensions.get('window').width - 80,
        },
        contentBox: {
            borderRadius: 5,
            backgroundColor: '#f0f0f0',
            minHeight: 20,
            justifyContent: 'flex-end',
        },
        containerToNext: {
            borderBottomLeftRadius: 3,
        },
        containerToPrevious: {
            borderTopLeftRadius: 3,
        },
        triangleStyle: {
            width: 20,
            height: 20,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderLeftWidth: 3,
            borderRightWidth: 3,
            borderBottomWidth: 6,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            overflow: 'hidden',
            transform: [
                { rotate: '-90deg' }
            ],
        },
        client: {
            fontSize: 10,
            color: '#999',
            marginTop: 5,
        }
    }),
    right: StyleSheet.create({
        container: {
            flex: 1,
           // marginLeft: 60,
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: 'center',
        },
        wrapper: {
            borderRadius: 5,
            backgroundColor: '#f54748',
            minHeight: 20,
            justifyContent: 'flex-end',
            marginLeft: 5,
        },
        contentBox: {
            borderRadius: 5,
            backgroundColor: '#f54748',
            minHeight: 20,
            justifyContent: 'flex-end',
        },

        containerToNext: {
            borderBottomRightRadius: 3,
        },
        containerToPrevious: {
            borderTopRightRadius: 3,
        },
        wrapperStyle: {
            borderRadius: 15,
            backgroundColor: '#0084ff',
            marginLeft: 6,
            minHeight: 20,
            maxWidth: Dimensions.get('window').width - 80,
        },
        triangleStyle: {
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderLeftWidth: 3,
            borderRightWidth: 3,
            borderBottomWidth: 6,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            transform: [
                { rotate: '90deg' }
            ],
        }
    }),
};



