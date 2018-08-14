import React from 'react';
import { Switch } from 'react-native';
export default class AntmSwitch extends React.Component {
    onChange(value) {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }
    ;
    render() {
        let { style, disabled, checked } = this.props;
        return (<Switch style={style} onValueChange={(value) => { this.onChange(value); }} value={checked} disabled={disabled}/>);
    }
}
AntmSwitch.defaultProps = {
    name: '',
    checked: false,
    disabled: false,
    onChange() { },
};
