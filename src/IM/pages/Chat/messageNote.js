/**
 * Created by yqf on 2017/11/3.
 */


import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';


export default class MessageNote extends React.Component {
    render() {
        return (
            <View style={[styles.container, this.props.containerStyle]}>
                <View style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text style={[styles.text, this.props.textStyle]}>
                        {this.props.noteText}
                    </Text>
                </View>
            </View>
        );
        return null;
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        marginBottom: 10,
    },
    wrapper: {
        backgroundColor: '#cecece',
        borderRadius: 5,
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 3,
        paddingBottom: 3,
    },
    text: {
        backgroundColor: 'transparent',
        color: '#fff',
        fontSize: 12,
        fontWeight: '400',
    },
});

