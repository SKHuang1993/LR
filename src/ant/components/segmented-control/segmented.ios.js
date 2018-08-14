import React from 'react';
import { SegmentedControlIOS } from 'react-native';
import assign from 'object-assign';
export default class SegmentedControl extends React.Component {
    render() {
        const { tintColor, selectedIndex, disabled } = this.props;
        const restProps = assign({}, this.props);
        delete restProps.tintColor;
        delete restProps.disabled;
        delete restProps.selectedIndex;
        return (<SegmentedControlIOS tintColor={tintColor} selectedIndex={selectedIndex} {...restProps} enabled={!disabled}/>);
    }
}
SegmentedControl.defaultProps = {
    tintColor: '#108ee9',
    selectedIndex: 0,
};
