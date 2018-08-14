import React from 'react';

import {
    ListView,
    View,
    Text,
    StyleSheet, TextInput, Button, ScrollView, Modal
} from 'react-native';

import Message from './message';
import NavBar from '../components/navBar';
import { observer } from 'mobx-react/native';
import Conversation from './stores/chatRoom';
import InputToolbar, { MIN_INPUT_TOOLBAR_HEIGHT } from './inputToolbar';
import { COLORS, FLEXBOX } from '../styles/commonStyle';
import { Chat } from '../utils/chat';
import Enumerable from 'linq';
import Webview from '../pages/webviewView/webview';
import ActivityIndicator from '../components/activity-indicator';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import ImageViewer from 'react-native-image-zoom-viewer';
import Emoji from './emoji';
import { Storage } from './libs/storage';

@observer
export default class ChatRoom extends React.Component {

    constructor(props) {
        super(props);
        this.store = new Conversation();
        this.store.conversation = props.conversation;
        this.state = {
            isLoading: false,
            contentContainerStyle: false,
            a: true,
            imageViewer: false
        }
    }


    componentDidMount() {
        this.listener = RCTDeviceEventEmitter.addListener('OnChat', (message) => {
            Chat.setReadMessage(this.store.conversation);
            Chat.saveConversationList(Chat.obj.conversations);
            this.scrollToBottom(true);
        });
        this.reSend = RCTDeviceEventEmitter.addListener('ReSend', (message) => {
            //console.log(message);
            this.store.reSend(message);
        });
        this.openImageViewer = RCTDeviceEventEmitter.addListener('OpenImageViewer', (message) => {
            this.store.initImageViewer(message);
            this.toggle();
        });
        this.openWebView = RCTDeviceEventEmitter.addListener('OpenWebView', (message) => {
            this.props.navigator.push({
                component: Webview,
                passProps: { url: message.Url, title: message.Title }
            });
        });
        this.updateConversation = RCTDeviceEventEmitter.addListener('UpdateConversation', (conversations) => {
            let conversation = conversations.find(o => o.IMNr == this.store.conversation.IMNr);
            if (conversation) {
                Storage.selectMessage(this.store.conversation.IMNr, 0, 15, (messages) => {
                    conversation.Messages = Chat.insertDateMessages(messages);
                    this.store.conversation = conversation;
                    Chat.setReadMessage(this.store.conversation);
                    Chat.saveConversationList(Chat.obj.conversations);
                    this.scrollToBottom(true);
                });
            }
        });
        Chat.setReadMessage(this.store.conversation);
        Chat.saveConversationList(Chat.obj.conversations);
    }

    componentWillUnmount() {
        this.listener.remove();
        this.reSend.remove();
        this.openImageViewer.remove();
        this.openWebView.remove();
        this.updateConversation.remove();
    }

    renderRow = (message, sectionId, rowId) => {

        let position;
        // if (Math.floor(Math.random() * 2)) {  // 时间日期 || 其他提示
        //     position = "center";
        // } else {
        //     position = Math.floor(Math.random() * 2) ? 'right' : 'left'; //当前发信息用户是自己为true 否则为false
        // }
        if (message.MessageType === "Time") {
            message.position = "center";
            message.noteText = this.store.getTimeStamp(message.NoteText);
        }
        else if (message.ChatMessage.MessageType == "Notify") {
            message.position = "center";
            message.noteText = message.ChatMessage.NotifyContent.Notify;
        } else
            message.position = message.IsSender ? 'right' : 'left';
        const messageProps = {
            ...this.props,
            position: position,
            noteText: '上午6:00', // 时间日期内容 || 其他提示内容
            ...message
        };
        return <Message message={message} />;
    }

    toggle = () => {
        this.setState({
            imageViewer: !this.state.imageViewer
        })
    }

    renderInputToolbar = () => {
        const inputToolbarProps = {
            // onSend: this.onSend(),


        };
        return (
            <InputToolbar
                actionsList={
                    [{ title: '照片', icon: '0xe625', action: () => { this.store.launchImageLibrary(() => this.scrollToBottom()) } },
                    { title: '拍照', icon: '0xe62f', action: () => { this.store.launchCamera(() => this.scrollToBottom()) } }]}
                onFocus={() => {
                    //this.onfocus()

                    if (this.contentHeight < this.lvHeight) {
                        this.setState({ a: false });
                    }

                }}
                onBlur={() => {
                    //this.onblur()
                    this.setState({ a: true });
                }}
                value={this.store.text}
                onChangeText={(v) => {
                    if (this.store.text && v == this.store.text.substr(0, this.store.text.length - 1)) {
                        if (!this.delEmoji())
                            this.store.text = v;
                    } else
                        this.store.text = v;

                }}
                ref={"InputToolbar"}
                onSubmitEditing={() => {
                    Chat.sendTextMessage(this.store.conversation, this.store.text);
                    this.store.text = null;
                    this.scrollToBottom(true);
                }}
                handleEmojiClick={(v) => {
                    if (!this.store.text) this.store.text = v;
                    else
                        this.store.text += v
                }}
                onDelete={() => {
                    let index = this.store.text.lastIndexOf("[");
                    if (!this.delEmoji())
                        this.store.text = this.store.text.substr(0, this.store.text.length - 1);
                }}
                style={{ flex: 0.08 }}
            />
        );
    }

    delEmoji = () => {
        let index = this.store.text.lastIndexOf("[");
        if (index != -1) {
            let str = this.store.text.substr(index, this.store.text.length);
            if (Emoji.map.has(str)) {
                this.store.text = this.store.text.substr(0, this.store.text.length - str.length);
                return true;
            }
        }
        return false;
    }

    scrollToBottom = (animated) => {
        if (this.store.isLoading) return;
        setTimeout(() => {
            if ("listHeight" in this.state &&
                "footerY" in this.state &&
                this.state.footerY > this.state.listHeight) {
                var scrollDistance = this.state.listHeight - this.state.footerY;
                if (this.refs.ListView)
                    this.refs.ListView.getScrollResponder().scrollTo({ x: 0, y: -scrollDistance, animated: animated ? animated : false });
            }
        }, 200)
    }

    onfocus = () => {
        setTimeout(() => {
            if (this.refs.InputToolbar)
                this.refs.InputToolbar.measure((ox, oy, width, height, px, py) => {
                    if (this.contentHeight < this.lvHeight) {
                        if (this.refs.ListView)
                            this.refs.ListView.getScrollResponder().scrollTo({ x: 0, y: -(FLEXBOX.height - py) + 50, animated: false });
                    }
                });
        }, 400)
    }


    onblur = () => {
        setTimeout(() => {
            if (this.contentHeight < this.lvHeight) {
                if (this.refs.ListView)
                    this.refs.ListView.getScrollResponder().scrollTo({ x: 0, y: 0, animated: false });
            }
        }, 300)
    }

    render() {
        return (
            <View style={styles.container}>
                <NavBar titleStyle={{ width: FLEXBOX.width * 0.6 }} title={this.store.conversation.Name} navigator={this.props.navigator} />
                <ScrollView bounces={false} keyboardShouldPersistTaps="always" keyboardDismissMode={"on-drag"} showsVerticalScrollIndicator={false}>
                    <View style={{ height: FLEXBOX.height - 64 }}>
                        <ListView
                            onTouchStart={() => this.refs.InputToolbar.hideToolBar()}
                            ref={"ListView"}
                            style={{ flex: 1 }}
                            dataSource={this.store.getDataSource}
                            onLayout={(e) => {
                                this.lvHeight = e.nativeEvent.layout.height;
                                this.setState({
                                    listHeight: e.nativeEvent.layout.height
                                });
                                this.scrollToBottom(this.isDidMount);
                                this.isDidMount = true;
                            }}
                            enableEmptySections={true}
                            renderRow={this.renderRow}
                            keyboardDismissMode={"on-drag"}
                            initialListSize={300}
                            renderHeader={() => { return (this.state.isLoading && <ActivityIndicator text="加载中..." />) }}
                            onScroll={(e) => {
                                let y = e.nativeEvent.contentOffset.y;
                                if (y <= 0 && !this.store.isLoading) {
                                    Storage.selectMessage(this.store.conversation.IMNr, this.store.conversation.Messages.filter(o => !o.MessageType).length, 15, (messages) => {
                                        if (messages.length == 0) return;
                                        this.store.isLoading = true;
                                        this.setState({ isLoading: true })
                                        setTimeout(() => {
                                            this.store.conversation.Messages = Enumerable.from(this.store.conversation.Messages).insert(0,
                                                Chat.insertDateMessages(messages)).toArray()

                                            this.store.pageIndex++;
                                            setTimeout(() =>
                                                this.store.isLoading = false, 1000);
                                            this.setState({ isLoading: false })
                                        }, 1000);
                                    });

                                }
                            }}
                            onContentSizeChange={(width, height) => this.contentHeight = height}
                            contentContainerStyle={this.state.a ? { paddingTop: 10, } : { flexGrow: 1, justifyContent: 'flex-end', paddingTop: 10, }}
                            renderFooter={() => {
                                return <View onLayout={(event) => {
                                    var layout = event.nativeEvent.layout;
                                    this.setState({
                                        footerY: layout.y
                                    });
                                }}></View>
                            }}
                        />
                        <View>
                            {this.renderInputToolbar()}
                        </View>
                    </View>
                </ScrollView>
                <Modal onRequestClose={() => this.toggle()} visible={this.state.imageViewer} transparent={true}>
                    <ImageViewer renderIndicator={() => null} loadingRender={() => <ActivityIndicator />} imageUrls={this.store.ImagesUrl} index={this.store.ImageIndex} onClick={() => {
                        this.toggle();
                    }} />
                </Modal>
            </View >
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },

});