import React from 'react';
import PopupDatePicker from 'rmc-date-picker/lib/Popup';
import PopupStyles from '../picker/styles';
import { formatFn, getProps as getDefaultProps } from './utils';
import assign from 'object-assign';
import RCDatePicker from 'rmc-date-picker/lib/DatePicker';
export default class DatePicker extends React.Component {
    render() {
        const { props } = this;
        const { children, extra, value, defaultDate, styles } = props;
        const extraProps = {
            extra: value ? formatFn(this, value) : extra,
            extraTextStyle:value? {color:'#333'} : {color:'#c7c7cd'}
        };
        const dataPicker = (<RCDatePicker locale={props.locale} mode={props.mode} minDate={props.minDate} maxDate={props.maxDate} defaultDate={value || defaultDate} />);
        return (<PopupDatePicker datePicker={dataPicker} styles={styles} {...props} date={value || defaultDate}>
            {React.cloneElement(children, extraProps)}
        </PopupDatePicker>);
    }
}
DatePicker.defaultProps = assign({
    triggerType: 'onClick',
    styles: PopupStyles,
    getType: () => "DatePicker"
}, getDefaultProps());
