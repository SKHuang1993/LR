import React from 'react';
import { Image, View, TouchableHighlight, Text } from 'react-native';
import listItemStyles from './style/index';
import Icon from '../icons/icon';

function noop() {
}
class Brief extends React.Component {
    render() {
        const { children, style, styles = listItemStyles, wrap } = this.props;
        let numberOfLines = {};
        if (wrap === false) {
            numberOfLines = {
                numberOfLines: 1,
            };
        }
        return (<View style={[styles.Brief]}>
            <Text style={[styles.BriefText, style]} {...numberOfLines}>{children}</Text>
        </View>);
    }
}
export default class Item extends React.Component {
    render() {
        const { styles = listItemStyles, check, children, multipleLine, thumb, extra, arrow = '', style, onClick, onPressIn = noop, onPressOut = noop, wrap, disabled, align, labelNumber, extraTextStyle, line = true } = this.props;
        let numberOfLines = {};
        if (wrap === false) {
            numberOfLines = {
                numberOfLines: 1,
            };
        }
        let underlayColor = {};
        if (!disabled && onClick) {
            underlayColor = {
                underlayColor: listItemStyles.underlayColor,
                activeOpacity: 0.5,
            };
        }
        else {
            underlayColor = {
                activeOpacity: 1,
            };
        }
        let alignStyle = {};
        if (align === 'top') {
            alignStyle = {
                alignItems: 'flex-start',
            };
        }
        else if (align === 'bottom') {
            alignStyle = {
                alignItems: 'flex-end',
            };
        }
        let contentDom;
        const labelStyle = labelNumber ? {
            width: 16 * labelNumber * 1.05, // 标题宽度
            // backgroundColor:'red',
            marginRight: 5,
            flex: 0,
        } : null;
        if (Array.isArray(children)) {
            const tempContentDom = [];
            children.forEach((el, index) => {
                if (React.isValidElement(el)) {
                    tempContentDom.push(el);
                }
                else {
                    tempContentDom.push(<Text style={[styles.Content]} {...numberOfLines} key={`${index}-children`}>{el}</Text>);
                }
            });
            contentDom = <View style={[styles.column, labelStyle]}>{tempContentDom}</View>;
        }
        else {
            if (React.isValidElement(children)) {
                contentDom = <View style={[styles.column, labelStyle]}>{children}</View>;
            }
            else {
                contentDom = (<View style={[styles.column, labelStyle]}>
                    <Text style={[styles.Content]} {...numberOfLines}>{children}</Text>
                </View>);
            }
        }
        let extraDom;
        let extraStyle = labelNumber ? {
            flex: 1, justifyContent: 'flex-start',
            // backgroundColor:'red',
            paddingLeft: 0
        } : null;
        let extraTxtStyle = labelNumber ? { textAlign: 'left' } : null;
        if (extra) {
            extraDom = (<View style={[styles.column, extraStyle]}>
                <Text style={[styles.Extra, extraTxtStyle, extraTextStyle]} {...numberOfLines}>{extra}</Text>
            </View>);
            if (React.isValidElement(extra)) {
                const extraChildren = extra.props.children;
                if (Array.isArray(extraChildren)) {
                    const tempExtraDom = [];
                    extraChildren.forEach((el, index) => {
                        if (typeof el === 'string') {
                            tempExtraDom.push(<Text {...numberOfLines} style={[styles.Extra]} key={`${index}-children`}>
                                {el}
                            </Text>);
                        }
                        else {
                            tempExtraDom.push(el);
                        }
                    });
                    /*extraDom = (<View style={[styles.column]}>
                        {extra.props.children}
                    </View>);*/
                    extraDom = extra.props.children;
                }
                else {
                    extraDom = extra;
                }
            }
        }
        const arrEnum = {
            horizontal: <Icon icon={'0xe677'} style={styles.iconArrow} />,
            down: <Image source={require('../style/images/arrow-down.png')} style={styles.ArrowV} />,
            up: <Image source={require('../style/images/arrow-up.png')} style={styles.ArrowV} />,
        };
        const checkStyle = { marginRight: 10, color: '#999', fontSize: 20 }
        const itemView = (<View {...this.props} style={[styles.Item, style]}>

            {check != null ? <Icon icon={check ? '0xe676' : '0xe674'} style={[checkStyle, check ? styles.checked : null]} /> :
                typeof thumb === 'string' ? (<Image source={{ uri: thumb }} style={[styles.Thumb, multipleLine && styles.multipleLine.Thumb]} />) : thumb}
            <View style={[multipleLine && styles.multipleLine.Line, multipleLine && alignStyle, line ? styles.Line : null]}>
                {contentDom}
                {extraDom}
                {arrEnum[arrow] || <View style={styles.Arrow} />}
            </View>
        </View>);
        return (<TouchableHighlight {...underlayColor} disabled={disabled} onPress={onClick ? onClick : undefined} onPressIn={onPressIn} onPressOut={onPressOut}>
            {itemView}
        </TouchableHighlight>);
    }
}
Item.defaultProps = {
    error: false,
    multipleLine: false,
    wrap: false,
    getType: () => "ListItem"
};
Item.Brief = Brief;
