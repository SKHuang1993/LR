import React from 'react';
import { View, TouchableWithoutFeedback, Text } from 'react-native';
import Checkbox from './Checkbox';
import AgreeItemstyle from './style/index';
const refCheckbox = 'checkbox';
export default class AgreeItem extends React.Component {
    constructor() {
        super(...arguments);
        this.handleClick = () => {
            let checkBox = this.refs[refCheckbox];
            checkBox.handleClick();
        };
    }
    render() {
        let { style, checkboxStyle, children, disabled, checked, defaultChecked, onChange, styles } = this.props;
        let contentDom;
        if (React.isValidElement(children)) {
            contentDom = children;
        }
        else {
            contentDom = <Text>{children}</Text>;
        }
        return (<TouchableWithoutFeedback onPress={this.handleClick}>
      <View style={[styles.agreeItem, style]}>
        <Checkbox ref={refCheckbox} style={[styles.agreeItemCheckbox, checkboxStyle]} disabled={disabled} checked={checked} defaultChecked={defaultChecked} onChange={onChange}/>
        <View style={{ flex: 1 }}>
          {contentDom}
        </View>
      </View>
    </TouchableWithoutFeedback>);
    }
}
AgreeItem.defaultProps = {
    styles: AgreeItemstyle,
};
