import React from 'react';
import assign from 'object-assign';
import { View, Image, Text, TextInput, TouchableWithoutFeedback ,Platform} from 'react-native';
import variables from '../style/themes/default';
import TextAreaItemStyle from './style/index';
function fixControlledValue(value) {
    if (typeof value === 'undefined' || value === null) {
        return '';
    }
    return value;
}
export default class TextAreaItem extends React.Component {
    static defaultProps = {
        labelNumber: 4,
    }
    constructor(props) {
        super(props);
        this.onChange = (event) => {
            const text = event.nativeEvent.text;
            let height;
            const { autoHeight, rows, onChange } = this.props;
            if (autoHeight) {
                height = event.nativeEvent.contentSize.height;
            }
            else if (rows > 1) {
                height = 6 * rows * 4;
            }
            else {
                height = variables.list_item_height;
            }
            this.setState({
                inputCount: text.length,
                height,
            });
            if (onChange) {
                onChange(text);
            }
        };
        this.state = {
            inputCount: 0,
            height: props.rows > 1 ? 6 * props.rows * 4 : variables.list_item_height,
        };
    }
    render() {
        const { inputCount } = this.state;
        const { value, defaultValue, labelNumber, rows, error, clear, count, autoHeight, last, onErrorClick, styles, wrapStyle } = this.props;
        let valueProps;
        if ('value' in this.props) {
            valueProps = {
                value: fixControlledValue(value),
            };
        }
        else {
            valueProps = {
                defaultValue,
            };
        }
        const containerStyle = {
            borderBottomWidth: last ? 0 : variables.border_width_sm,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-start',

        };
        const textareaStyle = {
            color: error ? '#f50' : variables.color_text_base,
            paddingRight: error ? 2 * variables.h_spacing_lg : 0,
            flex: 1,
            paddingTop: 10,
            paddingLeft:0,
            paddingBottom: 10,
            //backgroundColor:'red'
        };
        const maxLength = count > 0 ? count : undefined;
        const restProps = assign({}, this.props);
        [
            'rows', 'error', 'clear', 'count', 'autoHeight', 'last', 'onErrorClick', 'styles',
        ].forEach(prop => {
            if (restProps.hasOwnProperty(prop)) {
                delete restProps[prop];
            }
        });
        const textStyle = {
            width: variables.font_size_heading * labelNumber * 1.05,
            paddingTop:Platform.OS == 'ios' ? 15 : 10,
           // backgroundColor:'red'
            
            
        };
        return (<View style={[styles.container, containerStyle, wrapStyle, { position: 'relative' }]}>
            {this.props.title ? <Text style={[styles.title, textStyle]}>{this.props.title}</Text> : null}
            <TextInput clearButtonMode={clear ? 'while-editing' : 'never'} underlineColorAndroid="transparent" style={[styles.input, textareaStyle, { height: Math.max(45, this.state.height), }]} {...restProps} {...valueProps} onChange={(event) => this.onChange(event)} multiline={rows > 1 || autoHeight} numberOfLines={rows} maxLength={maxLength} />
            {error ? <TouchableWithoutFeedback onPress={onErrorClick}>
                <View style={[styles.errorIcon]}>
                    <Image source={require('../style/images/error.png')} style={{ width: variables.icon_size_xs, height: variables.icon_size_xs }} />
                </View>
            </TouchableWithoutFeedback> : null}
            {rows > 1 && count > 0 ? <View style={[styles.count]}>
                <Text>
                    {inputCount} / {count}
                </Text>
            </View> : null}
        </View>);
    }
}
TextAreaItem.defaultProps = {
    onChange() {
    },
    onFocus() {
    },
    onBlur() {
    },
    onErrorClick() {
    },
    clear: true,
    error: false,
    editable: true,
    rows: 1,
    count: 0,
    keyboardType: 'default',
    autoHeight: false,
    last: false,
    styles: TextAreaItemStyle,
    getType: () => "TextAreaItem"
};
