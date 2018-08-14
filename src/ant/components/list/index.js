import React from 'react';
import { View, Text } from 'react-native';
import Item from './ListItem';
import listStyles from './style/index';
export default class List extends React.Component {
    render() {
        let { children, style, renderHeader, renderFooter, styles = listStyles } = this.props;
        let headerDom = null;
        let footerDom = null;
        if (renderHeader) {
            let content = typeof renderHeader === 'function' ? renderHeader() : renderHeader;
            if (typeof content === 'string') {
                content = <Text style={styles.Header}>{content}</Text>;
            }
            headerDom = <View>{content}</View>;
        }
        if (renderFooter) {
            let content = typeof renderHeader === 'function' ? renderFooter() : renderFooter;
            if (typeof content === 'string') {
                content = <Text style={styles.Footer}>{content}</Text>;
            }
            footerDom = <View>{content}</View>;
        }
        return (<View {...this.props} style={[style]}>
      {headerDom}
      <View style={styles.Body}>
        {children}
        <View style={[styles.BodyBottomLine]}></View>
      </View>
      {footerDom}
    </View>);
    }
}
List.Item = Item;
