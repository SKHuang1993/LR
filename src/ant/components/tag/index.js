import React from 'react';
import { View, Text, TouchableWithoutFeedback, Platform } from 'react-native';
import TagStyle from './style/index';
export default class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = () => {
            const { disabled, onChange } = this.props;
            if (disabled) {
                return;
            }
            const isSelect = this.state.selected;
            this.setState({
                selected: !isSelect,
            }, () => {
                if (onChange) {
                    onChange(!isSelect);
                }
            });
        };
        this.onTagClose = () => {
            if (this.props.onClose) {
                this.props.onClose();
            }
            this.setState({
                closed: true,
            }, this.props.afterClose);
        };
        this.onPressIn = () => {
            const styles = this.props.styles;
            this.closeDom.setNativeProps({
                style: [styles.close, Platform.OS === 'ios' ? styles.closeIOS : styles.closeAndroid, {
                        backgroundColor: '#888',
                    }],
            });
        };
        this.onPressOut = () => {
            const styles = this.props.styles;
            this.closeDom.setNativeProps({
                style: [styles.close, Platform.OS === 'ios' ? styles.closeIOS : styles.closeAndroid],
            });
        };
        this.state = {
            selected: props.selected,
            closed: false,
        };
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.selected !== nextProps.selected) {
            this.setState({
                selected: nextProps.selected,
            });
        }
    }
    render() {
        const { children, disabled, small, closable, styles, style } = this.props;
        const selected = this.state.selected;
        let wrapStyle;
        let textStyle;
        if (!selected && !disabled) {
            wrapStyle = styles.normalWrap;
            textStyle = styles.normalText;
        }
        if (selected && !disabled) {
            wrapStyle = styles.activeWrap;
            textStyle = styles.activeText;
        }
        if (disabled) {
            wrapStyle = styles.disabledWrap;
            textStyle = styles.disabledText;
        }
        const sizeWrapStyle = small ? styles.wrapSmall : {};
        const sizeTextStyle = small ? styles.textSmall : {};
        return !this.state.closed ? (<View style={[styles.tag, style]}>
        <TouchableWithoutFeedback onPress={this.onClick}>
          <View style={[styles.wrap, sizeWrapStyle, wrapStyle]}>
            <Text style={[styles.text, sizeTextStyle, textStyle]}>{children} </Text>
          </View>
        </TouchableWithoutFeedback>
        {closable && !small && !disabled && <TouchableWithoutFeedback onPressIn={this.onPressIn} onPressOut={this.onPressOut} onPress={this.onTagClose}>
          <View ref={component => this.closeDom = component} style={[styles.close, Platform.OS === 'ios' ? styles.closeIOS : styles.closeAndroid]}>
            <Text style={[styles.closeText, Platform.OS === 'android' ? styles.closeTransform : {}]}>×</Text>
          </View>
        </TouchableWithoutFeedback>}
      </View>) : null;
    }
}
Modal.defaultProps = {
    disabled: false,
    small: false,
    selected: false,
    closable: false,
    onClose() { },
    afterClose() { },
    onChange() { },
    styles: TagStyle,
};
