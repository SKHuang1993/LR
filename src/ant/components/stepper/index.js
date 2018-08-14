import React from 'react';
import RcInputNumber from 'rc-input-number/lib';
import objectAssign from 'object-assign';
import styles from 'rc-input-number/lib/styles';
import { Platform } from 'react-native';
export default class Stepper extends React.Component {
    render() {
        const restProps = objectAssign({}, this.props);
        const inputAndroidStyle = Platform.OS === 'android' ? {
            top: 6,
            paddingTop: 0,
        } : {};
        const inputStyle = objectAssign({}, inputAndroidStyle, this.props.inputStyle);
        delete restProps.inputStyle;
        return (<RcInputNumber {...restProps} inputStyle={inputStyle}/>);
    }
}
Stepper.defaultProps = {
    step: 1,
    readOnly: true,
    disabled: false,
    styles,
};
