import React from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import styles, { vars as variables } from './style/index';
import Modal from 'rc-dialog/lib/Modal';
const ActionSheetAndroid = React.createClass({
    getDefaultProps() {
        return {
            share: false,
        };
    },
    getInitialState() {
        return {
            visible: this.props.visible || false,
        };
    },
    confirm(index) {
        const { callback } = this.props;
        if (callback) {
            callback(index);
        }
        this.close();
    },
    close() {
        this.setState({
            visible: false,
        });
    },
    render() {
        const { config, share, onAnimationEnd } = this.props;
        const { title, message, url, options, destructiveButtonIndex, cancelButtonIndex, excludedActivityTypes, } = config;
        const titleMsg = share ? (url && <View style={styles.title} key="0"><Text>{url}</Text></View>) : (title && <View style={styles.title} key="0"><Text style={styles.titleText}>{title}</Text></View>);
        return (<Modal animationDuration={200} animateAppear visible={this.state.visible} onAnimationEnd={onAnimationEnd} style={styles.content} animationType="slide-up" maskClosable onClose={this.close}>
        <View>
          {titleMsg}
          {message && <View style={styles.message} key="1"><Text>{message}</Text></View>}
          <View>
            {share ? (excludedActivityTypes.map((item, index) => <View key={index}>{item}</View>)) : options.map((item, index) => (<View key={index} style={[cancelButtonIndex === index ? styles.cancelBtn : null]}>
                    <TouchableHighlight style={[styles.btn]} underlayColor={variables.fill_tap} onPress={() => this.confirm(index)}>
                      <Text style={[destructiveButtonIndex === index ? styles.destructiveBtn : null]}>
                        {item}
                      </Text>
                    </TouchableHighlight>
                    {cancelButtonIndex === index ? <View style={styles.cancelBtnMask}/> : null}
                  </View>))}
          </View>
        </View>
      </Modal>);
    },
});
export default ActionSheetAndroid;
