import React from 'react';
import classNames from 'classnames';
import splitObject from '../_util/splitObject';
import RcInputNumber from 'rc-input-number';
export default class Stepper extends React.Component {
    render() {
        const [{ className, showNumber }, restProps] = splitObject(this.props, ['className', 'showNumber']);
        const stepperClass = classNames({
            [className]: !!className,
            ['showNumber']: !!showNumber,
        });
        return (<RcInputNumber {...restProps} ref="inputNumber" className={stepperClass}/>);
    }
}
Stepper.defaultProps = {
    prefixCls: 'am-stepper',
    step: 1,
    readOnly: false,
    showNumber: false,
    focusOnUpDown: false,
};
