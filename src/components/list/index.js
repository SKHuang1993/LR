import React from 'react';
import { View, Text } from 'react-native';
import Item from './ListItem';
import listStyles from './style/index';
export default class List extends React.Component {
    render() {
        let { children, style, renderHeader, renderHeaderStyle, renderFooter, styles = listStyles, bottomLine = true } = this.props;
        let headerDom = null;
        let footerDom = null;
        let isEmpty = false;
        if (!children)
            isEmpty = true;
        else
            isEmpty = children instanceof Array ? children.filter(o => !o).length == children.length : false;
        if (renderHeader) {
            let content = typeof renderHeader === 'function' ? renderHeader() : renderHeader;
            if (typeof content === 'string') {
                content = <Text style={[styles.Header, renderHeaderStyle]}>{content}</Text>;
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
            {isEmpty ? null :
                <View style={styles.Body}>
                    {children}
                    {bottomLine ? <View style={[styles.BodyBottomLine]}></View> : null}
                </View>}
            {footerDom}
        </View>);
    }
}
List.Item = Item;
