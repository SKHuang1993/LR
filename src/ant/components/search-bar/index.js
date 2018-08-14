import React from 'react';
import assign from 'object-assign';
import { View, TextInput, Text, Image } from 'react-native';
import { defaultProps } from './PropsType';
import styles from './style/index';
export default class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.onSubmit = (e) => {
            e.preventDefault();
            if (this.props.onSubmit) {
                this.props.onSubmit(this.state.value);
            }
        };
        this.onChangeText = (value) => {
            if (!('value' in this.props)) {
                this.setState({ value });
            }
            if (this.props.onChange) {
                this.props.onChange(value);
            }
        };
        this.onCancel = () => {
            if (this.props.onCancel) {
                this.props.onCancel(this.state.value);
            }
        };
        let value;
        if ('value' in props) {
            value = props.value;
        }
        else if ('defaultValue' in props) {
            value = props.defaultValue;
        }
        else {
            value = '';
        }
        this.state = { value };
    }
    componentWillReceiveProps(nextProps) {
        if ('value' in nextProps) {
            this.setState({
                value: nextProps.value,
            });
        }
    }
    render() {
        const { showCancelButton, cancelText, disabled, styles } = this.props;
        const restProps = assign({}, this.props);
        [
            'showCancelButton', 'cancelText', 'styles', 'value', 'onChangeText', 'onSubmitEditing', 'disabled',
        ].forEach(prop => {
            if (restProps.hasOwnProperty(prop)) {
                delete restProps[prop];
            }
        });
        const { value } = this.state;
        return (<View style={styles.wrapper}>
        <TextInput value={value} onChangeText={this.onChangeText} style={styles.input} editable={!disabled} ref="searchInput" onSubmitEditing={this.onSubmit} clearButtonMode="always" underlineColorAndroid="transparent" {...restProps}/>
        <Image source={require('../style/images/search.png')} style={styles.search} resizeMode="stretch"/>
        {showCancelButton ? (<View style={styles.cancelTextContainer}>
              <Text style={styles.cancelText} onPress={this.onCancel}>
                {cancelText}
              </Text>
            </View>) : null}
      </View>);
    }
}
SearchBar.defaultProps = assign(defaultProps, { styles });
