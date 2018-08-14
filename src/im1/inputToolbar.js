import React from 'react';
import {
    StyleSheet,
    View,
    Platform,
    Text,
    Dimensions,
    TextInput,
    Image,
    ActivityIndicator,
    Keyboard,
    LayoutAnimation,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    TouchableHighlight

} from 'react-native';
import { observer } from 'mobx-react/native';
import Swiper from 'react-native-swiper'
import Icon from '../components/icons/icon';
import { COLORS, FLEXBOX } from '../styles/commonStyle'
import Emoji from './emoji';


//输入框初始高度
const MIN_COMPOSER_HEIGHT = Platform.select({
    ios: 34,
    android: 41,
});

const emojiRowHeight = ((FLEXBOX.width - 30) * 252 / 588) / 3;
const MAX_COMPOSER_HEIGHT = 100;

export const MIN_INPUT_TOOLBAR_HEIGHT = Platform.select({
    ios: 44,
    android: 54,
});

const ACTION_BUTTON_HEIGHT = 220;
const EMOJI_HEIGHT = 200;

@observer
export default class InputToolbar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isEmoji: false,
            isActions: false,
        };

        this.composerHeight = MIN_COMPOSER_HEIGHT;
    }

    static defaultProps = {
        actionsList: [

        ]
    }

    handleChangeText = (v) => {
        // if (v.length > 0 && v[v.length - 1] == '\n') {
        //     if (this.props.onSend) {
        //         this.props.onSend();
        //     }
        // } else {
        //     if (this.props.onChangeText) {
        //         this.props.onChangeText(v);
        //     }
        // }
        if (this.props.onChangeText) {
            this.props.onChangeText(v);
        }
    }
    onChange(e) {

    }

    handleEmojiClick = (v) => {
        if (this.props.handleEmojiClick)
            this.props.handleEmojiClick(v);
    }
    //表情框
    //待优化
    renderEmoji() {
        if (!this.state.isEmoji) {
            return
        }

        const rowIconNum = 7;
        const emojis = [];

        Emoji.map.forEach((v, k, map) => {

            //let img =  require(`./emojiImgs/${k}.png`);
            emojis.push(<TouchableOpacity style={[styles.emojiRowItem]} key={k} onPress={() => {
                this.handleEmojiClick(k)
            }}>
                {/* <Text style={[styles.emoji,]}>
                    {v}
                </Text> */}
                {/* <Image style={{ width: 40, height: 40, }} source={v} /> */}


            </TouchableOpacity>)

        });
        return <View style={[styles.emojiRow]}>
            <Swiper style={styles.wrapper} loop={false} bounces={true}
                height={EMOJI_HEIGHT}
                dotStyle={{ bottom: - (emojiRowHeight - 30) }}
                activeDotStyle={{ bottom: - (emojiRowHeight - 30) }}

            >
                <View style={styles.slide}>
                    <Image resizeMode={'cover'} style={styles.emojiBg} source={require('./emoji/1@2x.png')} >
                        <View style={styles.slideRow}>
                            {emojis.slice(0, rowIconNum)}

                        </View>
                        <View style={styles.slideRow}>
                            {emojis.slice(1 * rowIconNum, rowIconNum * 2)}
                        </View>
                        <View style={styles.slideRow}>
                            {emojis.slice(2 * rowIconNum, rowIconNum * 3 - 1)}
                            <TouchableOpacity style={styles.del} onPress={() => { this.onDelete() }}>

                            </TouchableOpacity>
                        </View>
                    </Image>
                </View>
                <View style={styles.slide}>
                    <Image style={styles.emojiBg} source={require('./emoji/2@2x.png')} >
                        <View style={styles.slideRow}>
                            {emojis.slice(3 * rowIconNum - 1, rowIconNum * 4 - 1)}
                        </View>
                        <View style={styles.slideRow}>
                            {emojis.slice(4 * rowIconNum - 1, rowIconNum * 5 - 1)}
                        </View>
                        <View style={styles.slideRow}>
                            {emojis.slice(5 * rowIconNum - 1, rowIconNum * 6 - 2)}
                            <TouchableOpacity style={styles.del} onPress={() => { this.onDelete() }}>

                            </TouchableOpacity>
                        </View>
                    </Image>
                </View>
                <View style={styles.slide}>
                    <Image style={styles.emojiBg} source={require('./emoji/3@2x.png')} >
                        <View style={styles.slideRow}>
                            {emojis.slice(6 * rowIconNum - 2, rowIconNum * 7 - 1)}
                        </View>
                        <View style={styles.slideRow}>
                            {emojis.slice(7 * rowIconNum - 2, rowIconNum * 8 - 1)}
                        </View>
                        <View style={styles.slideRow}>
                            {emojis.slice(8 * rowIconNum - 2, rowIconNum * 9 - 3)}
                            <TouchableOpacity style={styles.del} onPress={() => { this.onDelete() }}>

                            </TouchableOpacity>
                        </View>
                    </Image>
                </View>
                <View style={styles.slide}>
                    <Image style={styles.emojiBg} source={require('./emoji/4@2x.png')} >
                        <View style={styles.slideRow}>
                            {emojis.slice(9 * rowIconNum - 3, rowIconNum * 10 - 1)}
                        </View>
                        <View style={styles.slideRow}>
                            {emojis.slice(10 * rowIconNum - 3, rowIconNum * 11 - 1)}
                        </View>
                        <View style={styles.slideRow}>
                            {emojis.slice(11 * rowIconNum - 3, rowIconNum * 12 - 4)}
                            <TouchableOpacity style={styles.del} onPress={() => { this.onDelete() }}>

                            </TouchableOpacity>
                        </View>
                    </Image>
                </View>
                {/* 表情一共89个，最后一栏特殊处理 */}
                <View style={styles.slide}>
                    <Image style={styles.emojiBg} source={require('./emoji/5@2x.png')} >
                        <View style={styles.slideRow}>
                            {emojis.slice(12 * rowIconNum - 4, rowIconNum * 13 - 1)}
                        </View>
                        <View style={[styles.slideRow, { justifyContent: 'flex-start' }]}>
                            {emojis.slice(13 * rowIconNum - 4, rowIconNum * 14 - 1)}
                        </View>
                        <View style={[styles.slideRow, { justifyContent: 'flex-end' }]}>
                            {emojis.slice(14 * rowIconNum - 3, rowIconNum * 15 - 5)}
                            <TouchableOpacity style={styles.del} onPress={() => { this.onDelete() }}>

                            </TouchableOpacity>
                        </View>
                    </Image>
                </View>
            </Swiper>
            <View style={{ height: 35, flexDirection: 'row', backgroundColor: '#fff' }}>
                <View style={{ flex: 1 }}>

                </View>
                <TouchableOpacity activeOpacity={.7} disabled={this.props.value ? false : true} onPress={() => {
                    if (this.props.onSubmitEditing && this.props.value) {
                        this.props.onSubmitEditing();
                    }
                }}
                    style={{ backgroundColor: this.props.value ? '#fa5e5b' : '#f0f0f0', justifyContent: 'center', alignItems: 'center', width: 55 }}>
                    <Text style={{ color: this.props.value ? '#fff' : '#666' }}>发送</Text>
                </TouchableOpacity>
            </View>
        </View>
    }

    onDelete = () => {
        if (this.props.onDelete)
            this.props.onDelete();
    }


    renderActions = () => {
        if (!this.state.isActions) {
            return
        }
        return <View style={styles.searchExtra}>
            {this.props.actionsList.map((v, i) => {
                return <TouchableOpacity activeOpacity={.7} key={i} onPress={v.action} style={styles.actionItem}>
                    <View style={styles.iconBox}>
                        <Icon icon={v.icon} style={styles.actionIcon} />
                    </View>
                    <Text style={styles.actionText}>{v.title}</Text>
                </TouchableOpacity>

            })}
        </View>
    }

    handleActionsList = (v) => {


    }

    hideToolBar = () => {
        this.setState({ isActions: false });
        this.setState({ isEmoji: false });
    }

    renderTextInput = () => {
        var height = this.composerHeight + (MIN_INPUT_TOOLBAR_HEIGHT - MIN_COMPOSER_HEIGHT);
        return (
            <View style={[styles.inputRow, { height: 50 }]}>
                <View style={styles.searchRow}>
                    <TextInput ref={"txtInput"}
                        onFocus={() => {
                            if (this.props.onFocus) {
                                this.props.onFocus();
                            }
                        }}
                        onBlur={() => {
                            if (this.props.onBlur) {
                                this.props.onBlur();
                            }
                        }}
                        style={[styles.searchInput]}
                        value={this.props.value}
                        editable={true}
                        returnKeyType='send'
                        autoCapitalize='none'
                        multiline={false}
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                            if (this.props.onSubmitEditing && this.props.value) {
                                this.props.onSubmitEditing();
                            }
                        }}
                        onChangeText={this.handleChangeText}
                        underlineColorAndroid='transparent'
                    />
                </View>
                {this.renderEmojiButton()}
                {this.renderSendButton()}

            </View>
        );
    }

    renderEmojiButton() {
        const { isEmoji } = this.state;
        return (
            <TouchableOpacity activeOpacity={.7} style={[styles.iconButonWrap]}
                onPress={() => {
                    this.hideToolBar();
                    this.setState({
                        isEmoji: !this.state.isEmoji,
                        isActions: false,
                    })
                    if (isEmoji) {
                        setTimeout(() =>
                            this.refs.txtInput.focus(), 250)
                    }
                }}>
                {
                    isEmoji ? <Icon style={styles.iconButton} icon="0xe6a0" />
                        : <Icon style={styles.iconButton} icon="0xe600" />
                }
            </TouchableOpacity>
        )
    }

    renderSendButton() {
        const { focused, value } = this.state;

        // return (Platform.OS === 'android') ? (
        //     <TouchableOpacity activeOpacity={.7} style={[styles.iconButonWrap, styles.sendBtn]}
        //         onPress={() => { }}>
        //         <Text style={styles.sendText}>发送</Text>
        //     </TouchableOpacity>

        // ) : (
        //         <TouchableOpacity activeOpacity={.7} style={styles.iconButonWrap} keyboardShouldPersistTaps='always'
        //             onPress={() => { this.setState({ isActions: !this.state.isActions }) }}>
        //             <Icon style={styles.iconButton} icon={'0xe605'} />
        //         </TouchableOpacity>
        //     );

        return <TouchableOpacity activeOpacity={.7} style={styles.iconButonWrap} keyboardShouldPersistTaps='always'
            onPress={() => { this.hideToolBar(); this.setState({ isActions: !this.state.isActions }) }}>
            <Icon style={styles.iconButton} icon={'0xe605'} />
        </TouchableOpacity>
    }


    render() {
        return (
            <View style={[styles.search,]}>
                {this.renderTextInput()}
                {this.renderEmoji()}
                {this.renderActions()}

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
    },
    search: {
        //marginTop: 5,
        flexDirection: 'column',
        //paddingTop: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',

    },
    inputRow: {
        // flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: "center",


    },
    iconRow: {
        flexDirection: 'row',
        padding: 15

    },
    actionIcon: {
        fontSize: 22,
        color: '#666'

    },
    iconTouch: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchRow: {
        flex: 1,
        flexDirection: 'column',
        //backgroundColor: Colors.snow,
        justifyContent: 'center',
        // marginLeft:5,
        // marginRight:5
        margin: 5,
    },
    searchInput: {
        flex: 1,
        borderRadius: 4,
        fontSize: 15,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff'
    },
    searchIcon: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    searchFocus: {
        flex: 0,
        width: 20,
        alignItems: 'center'
    },

    searchPlus: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendText: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center'
    },
    emojiRow: {
        backgroundColor: '#f6f6f6',
        height: 220,

    },
    emojiBg: {
        width: FLEXBOX.width - 30,
        height: (FLEXBOX.width - 30) * 252 / 588,
        paddingHorizontal: 0,
    },
    wrapper: {
        transform: [{ translateY: -5 }]
        //backgroundColor: '#f7f7f7',
    },
    slide: {
        height: 180,
        // paddingTop: 15,
        paddingHorizontal: 15,
        justifyContent: 'center',
        flexDirection: 'column',
        flexWrap: 'wrap',
    },
    slideRow: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        height: ((FLEXBOX.width - 30) * 252 / 588) / 3,
    },
    sendRow: {
        justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    emoji: {
        // flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 25,
        paddingLeft: 4,
        paddingBottom: 1,
        // height: 30
        color: '#fff'
    },
    send: {
        marginRight: 12,
        paddingVertical: 8,
        width: 50,
    }
    , iconButtonWrap: {
        paddingLeft: 5,
        paddingRight: 8,
        alignSelf: "stretch",
        justifyContent: "center"
    },

    iconButton: {
        fontSize: 28,
        color: '#7f8389'
    },
    sendBtn: {
        alignSelf: "stretch",
        justifyContent: "center",
        backgroundColor: COLORS.secondary,
        borderRadius: 3,

    },
    iconButonWrap: {
        width: Platform.OS === 'ios' ? 30 : 50,
        justifyContent: "center",
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
        marginRight: 5,
    },
    searchExtra: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#f5f4f6',
        paddingLeft: 30,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'flex-start',
        borderTopColor: '#ddd',
        borderTopWidth: 1 / FLEXBOX.pixel,


        height: 220,

    },
    iconBox: {
        borderRadius: 10,
        borderColor: '#dededf',
        borderWidth: 1 / FLEXBOX.pixel,
        backgroundColor: '#fbfbfc',
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: 'center',
        marginBottom: 5,

    },
    actionText: {
        fontSize: 12,
        color: '#666'
    },
    actionItem: {
        marginRight: 30,
        alignItems: 'center',
        justifyContent: "center",
        marginBottom: 10,
    },
    del: {
        width: (FLEXBOX.width - 30) / 7,
        height: ((FLEXBOX.width - 30) * 252 / 588) / 3,
        //  backgroundColor:'red'
    },
    emojiRowItem: {
        width: (FLEXBOX.width - 30) / 7, height: ((FLEXBOX.width - 30) * 252 / 588) / 3,
        // backgroundColor:'rgba(0,0,0,0.7)'
    }



});