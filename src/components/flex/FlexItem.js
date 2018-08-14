import React from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
export default class FlexItem extends React.Component {
    render() {
        let { style, children, flex, onPress } = this.props;
        const flexItemStyle = {
            flex: flex || 1,
        };
        return (
        <View style={[flexItemStyle, style]}>
          {children}
        </View>
      );
    }
}
FlexItem.defaultProps = {
    flex: 1,
};
