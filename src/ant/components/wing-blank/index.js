import React from 'react';
import { View } from 'react-native';
import varibles from '../style/themes/default';
class WingBlank extends React.Component {
    render() {
        const { size, style, children } = this.props;
        return (<View style={[{
                marginLeft: varibles[`h_spacing_${size}`],
                marginRight: varibles[`h_spacing_${size}`] }, style]}>
      {children}
    </View>);
    }
}
WingBlank.defaultProps = {
    size: 'lg',
};
export default WingBlank;
