import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import BadgeStyle from './style/index';
export default class Badge extends React.Component {
  render() {
    const { size, overflowCount, corner, dot, text, children, styles, style, textViewStyle, badgeTextStyle } = this.props;
    const overflowNum = overflowCount || 99;
    const badgeText = typeof text === 'number' && text > overflowNum ? `${overflowNum}+` : text;
    const badgeCls = corner ? 'textCorner' : 'textDom';

    return (<View style={[styles.wrap, style]}>
      <View style={[styles[`${badgeCls}Wrap`]]}>
        {children}
        {text > 0 && (!dot ? (<TouchableWithoutFeedback>
          <View style={[styles[badgeCls], styles[`${badgeCls}${size}`], textViewStyle]}>
            <Text style={[styles.text, badgeTextStyle]}>{badgeText}</Text>
          </View>
        </TouchableWithoutFeedback>) : (<TouchableWithoutFeedback>
          <View style={[styles.dot, styles[`dotSize${size}`]]} />
        </TouchableWithoutFeedback>))}

      </View>
    </View>);
  }
}
Badge.defaultProps = {
  size: 'small',
  overflowCount: 99,
  corner: false,
  dot: false,
  styles: BadgeStyle,
};
