import React from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
export default class FlexItem extends React.Component {
    render() {
        let { style, children, flex, onPress } = this.props;
        const flexItemStyle = {
            flex: flex || 1,
        };
        return (<TouchableWithoutFeedback onPress={onPress}>
        <View style={[flexItemStyle, style]}>
          {children}
        </View>
      </TouchableWithoutFeedback>);
    }
}
FlexItem.defaultProps = {
    flex: 1,
};
