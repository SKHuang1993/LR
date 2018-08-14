import React from 'react';
import { TouchableWithoutFeedback, Image, View, Text } from 'react-native';
import CheckboxStyle from './style/index';
import Icon from '../../components/icons/icon'
export default class Checkbox extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.handleClick = () => {
            if (this.props.disabled) {
                return;
            }
            const checked = !this.state.checked;
            if (!('checked' in this.props)) {
                this.setState({
                    checked,
                });
            }
            if (this.props.onChange) {
                this.props.onChange({ target: { checked } });
            }
        };
        this.state = {
            checked: props.checked || props.defaultChecked || false,
        };
    }
    componentWillReceiveProps(nextProps) {
        if ('checked' in nextProps) {
            this.setState({
                checked: !!nextProps.checked,
            });
        }
    }
    render() {
        let { style, disabled, children, styles, wrapStyle } = this.props;
        let checked = this.state.checked;
        let imgSrc;
        if (checked) {
            if (disabled) {
                imgSrc = require('./image/checked_disable.png');
            }
            else {
                imgSrc = require('./image/checked.png');
            }
        }
        else {
            if (disabled) {
                imgSrc = require('./image/normal_disable.png');
            }
            else {
                imgSrc = require('./image/normal.png');
            }
        }
        const checkStyle = { marginRight: 10, color: '#999', fontSize: 20 }
        const disabledStyle = { color:  '#dcdcdc' }
        return (<TouchableWithoutFeedback onPress={this.handleClick}>
            <View style={[styles.wrapper]}>
                {!this.props.right ? <Icon icon={checked ? '0xe676' : '0xe674'} style={[checkStyle, checked ? styles.checked : null,disabled ? disabledStyle : null]} /> : null}
                {typeof children === 'string' ? (<Text style={styles.iconRight}>{this.props.children}</Text>) : children}
                {/*{this.props.right ? <Image source={imgSrc} style={[styles.icon, style,{marginLeft:5}]}/> :null }*/}
                {this.props.right ? <Icon icon={checked ? '0xe676' : '0xe674'} style={[checkStyle, checked ? styles.checked : null,disabled ? disabledStyle : null]} /> : null}
            </View>
        </TouchableWithoutFeedback>);
    }
}
Checkbox.defaultProps = {
    styles: CheckboxStyle,
};
