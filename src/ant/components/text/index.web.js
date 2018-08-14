import React from 'react';
import View from '../view';
export default class Text extends React.Component {
    render() {
        return <View {...this.props}/>;
    }
}
Text.defaultProps = {
    Component: 'span',
};
