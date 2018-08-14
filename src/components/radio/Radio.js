import React from 'react';
import { TouchableWithoutFeedback, Image, Text, View } from 'react-native';
import RadioStyle from './style/index';
import Icon from '../icons/icon'
export default class Radio extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.handleClick = () => {
            if (this.props.disabled) {
                return;
            }
            if (!('checked' in this.props)) {
                this.setState({
                    checked: true,
                });
            }
            if (this.props.onChange) {
                this.props.onChange({ target: { checked: true } });
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
        let imgSrc = undefined;
        let iconStyle={
            color:'transparent',
            
        };
        if (checked) {
            if (disabled) {
                imgSrc = require('./image/checked_disable.png');
                iconStyle={
                    color:'#ddd',
                     fontSize:18,
                }
            }
            else {
                imgSrc = require('./image/checked.png');
                 iconStyle={
                    color:'#fa5e5b',
                    fontSize:18,
                }
            }
        }
        return (<TouchableWithoutFeedback onPress={this.handleClick}>
        <View style={[styles.wrapper]}>
          {/*<Image source={imgSrc} style={[styles.icon, style]}/>*/}
          <Icon icon={'0xe676'} style={[iconStyle, style]} />
          {typeof children === 'string' ? <Text>{this.props.children}</Text> : children}
        </View>
      </TouchableWithoutFeedback>);
    }
}
Radio.defaultProps = {
    styles: RadioStyle,
};
