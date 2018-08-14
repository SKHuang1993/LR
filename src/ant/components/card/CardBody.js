import React from 'react';
import { View } from 'react-native';
export default class CardBody extends React.Component {
    render() {
        let { children, style, styles } = this.props;
        return (<View style={[styles.body, style]}>{children}</View>);
    }
}
CardBody.defaultProps = {
    style: {},
};
