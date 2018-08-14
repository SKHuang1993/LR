import React from 'react';
import { View, Text } from 'react-native';
import Radio from './Radio';
import List from '../list';
import RadioItemStyle from './style/index';
const ListItem = List.Item;
const refRadio = 'radio';
export default class RadioItem extends React.Component {
    constructor() {
        super(...arguments);
        this.handleClick = () => {
            let radio = this.refs[refRadio];
            radio.handleClick();
        };
    }
    render() {
        let { style, radioStyle, defaultChecked, checked, disabled, children, onChange, styles } = this.props;
        let contentDom = null;
        if (children && React.isValidElement(children)) {
            contentDom = <View style={{ flex: 1 }}>{children}</View>;
        }
        else {
            let contentStyle = [styles.radioItemContent, disabled ? styles.radioItemContentDisable : {}];
            contentDom = (<Text style={contentStyle} numberOfLines={1}>
        {this.props.children}
      </Text>);
        }
        return (<ListItem style={style} onClick={disabled ? undefined : this.handleClick} extra={<Radio ref={refRadio} style={radioStyle} defaultChecked={defaultChecked} checked={checked} onChange={onChange} disabled={disabled}/>}>{contentDom}</ListItem>);
    }
}
RadioItem.defaultProps = {
    styles: RadioItemStyle,
};
