import React from 'react';
import { TouchableWithoutFeedback, Image, View, Text } from 'react-native';
import CheckboxStyle from './style/index';
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
        let { style, disabled, children, styles } = this.props;
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
        return (<TouchableWithoutFeedback onPress={this.handleClick}>
        <View style={[styles.wrapper]}>
          <Image source={imgSrc} style={[styles.icon, style]}/>
          {typeof children === 'string' ? (<Text style={styles.iconRight}>{this.props.children}</Text>) : children}
        </View>
      </TouchableWithoutFeedback>);
    }
}
Checkbox.defaultProps = {
    styles: CheckboxStyle,
};
