/**
 * Created by yqf on 2017/11/23.
 */
import React from 'react';

import {
    Linking,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity
} from 'react-native';

import { FLEXBOX } from '../../styles/commonStyle';
import Enumerable from 'linq';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';


export default class MessageGraphic extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let articles = this.props.ChatMessage.NewsContent.Articles;
        return <View style={styles.graphic}>
            <TouchableOpacity activeOpacity={.7} style={styles.header} onPress={() => RCTDeviceEventEmitter.emit('OpenWebView', articles[0])}>
                <Image style={styles.thumb} source={{ uri: articles[0].PicUrl }}>
                    <View style={styles.title}>
                        <Text style={styles.titleText} numberOfLines={1}>
                            {articles[0].Title}
                        </Text>
                    </View>
                </Image>
            </TouchableOpacity>
            <View style={styles.body}>
                {/* list */}
                {Enumerable.from(articles).skip(1).toArray().map((v, k) => {
                    return <TouchableOpacity activeOpacity={.7} key={k} style={[FLEXBOX.flexBetween, styles.list]} onPress={() => RCTDeviceEventEmitter.emit('OpenWebView', v)}>
                        <Text style={styles.listTitle} numberOfLines={2}>
                            {v.Title}
                        </Text>
                        <Image style={styles.listImg} source={{ uri: v.PicUrl }} />
                    </TouchableOpacity>
                })}
            </View>
        </View>
    }
}



const styles = StyleSheet.create({
    graphic: {
        // width: FLEXBOX.width - 80,
        padding: 10,
        backgroundColor: '#f6f6f6',
        borderRadius: 4,
        marginRight: 0,
    },
    thumb: {
        width: FLEXBOX.width - 100,
        height: (FLEXBOX.width - 80) * 1 / 1.9,
    },
    body: {
        width: FLEXBOX.width - 100,

    },
    title: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: FLEXBOX.width - 100,
        height: 30,
        backgroundColor: 'rgba(0,0,0,0.5)',

    },
    titleText: {
        color: '#fff',
        lineHeight: 30,
        marginLeft: 10
    },
    list: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1 / FLEXBOX.pixel,
        borderTopColor: '#ddd',
        paddingVertical: 5,

    },
    listImg: {
        flex: 0,
        width: 40,
        height: 40,
        marginRight: 5,
    },
    listTitle: {
        color: '#333',
        flex: .6,
        marginLeft: 10,
    }

})