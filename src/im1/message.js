import React from 'react';
import {
    View,
    Image,
    StyleSheet, Text
} from 'react-native';

import Avatar from './avatar';
import Bubble from './bubble';
import Note from './messageNote';
import { observer } from 'mobx-react/native';

@observer
export default class Message extends React.Component {
    //是否同一时间段
    isSameDay() {
        return false;
    }
    //是同用户
    isSameUser() {
        return false;
    }
    // 时间日期 || 其他提示
    renderNote() {
        const { noteText, ...other } = this.props.message;
        const noteProps = {
            noteText: noteText //
        };
        return <Note {...noteProps} />;

    }
    //气泡
    renderBubble() {
        const { ...other } = this.props.message;
        const bubbleProps = {
            ...other,
        };
        return <Bubble message={this.props.message} />;
    }
    //头像
    renderAvatar() {
        const { FaceUrlPath, position, ...other } = this.props.message;
        const avatarProps = {
            position,
            avatarPath: FaceUrlPath,
        };

        return <Avatar {...avatarProps} />;
    }
    //名字
    renderName() {
        const { position, ConversationType, Name } = this.props.message;
        //群聊 其他用户加名字
        if (position === 'left' && ConversationType === 'Group') {
            return (
                <View style={{ flexDirection: 'column' }}>
                    <Text style={{ color: '#666666', fontSize: 10, marginBottom: 3 }}>{Name}</Text>
                    {this.renderBubble()}
                </View>
            )
        }
        return this.renderBubble();
    }
    render() {
        return (
            <View>
                {this.props.message.position === 'center' ? this.renderNote() : <View style={[styles[this.props.message.position].container,]}>
                    {this.props.message.position === 'left' ? this.renderAvatar() : null}
                    {this.renderName()}
                    {this.props.message.position === 'right' ? this.renderAvatar() : null}
                </View>}

            </View>
        );
    }
}

const styles = {
    left: StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            marginLeft: 8,
            marginRight: 0,
            marginBottom: 10,
        },
    }),
    right: StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            marginLeft: 0,
            marginRight: 8,
            marginBottom: 10,
        },
    }),
    center: StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',

        },
    }),
};

