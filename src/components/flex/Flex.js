import React from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
export default class Flex extends React.Component {
    render() {
        let { style, direction, wrap, justify, align, children, onPress } = this.props;
        let transferConst = [justify, align];
        transferConst = transferConst.map((el) => {
            let tempTxt;
            switch (el) {
                case 'start':
                    tempTxt = 'flex-start';
                    break;
                case 'end':
                    tempTxt = 'flex-end';
                    break;
                case 'between':
                    tempTxt = 'space-between';
                    break;
                case 'around':
                    tempTxt = 'space-around';
                    break;
                default:
                    tempTxt = el;
                    break;
            }
            return tempTxt;
        });
        const flexStyle = {
            flexDirection: direction,
            flexWrap: wrap,
            justifyContent: transferConst[0],
            alignItems: transferConst[1],
        };
        return (
       
        <View style={[flexStyle, style]}>
          {children}
        </View>
     
    );
    }
}
Flex.defaultProps = {
    direction: 'row',
    wrap: 'nowrap',
    justify: 'start',
    align: 'center',
    onPress: () => { },
};
