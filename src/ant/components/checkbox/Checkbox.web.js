import React from 'react';
import RcCheckbox from 'rc-checkbox';
import omit from 'omit.js';
import classNames from 'classnames';
export default class Checkbox extends React.Component {
    render() {
        const { prefixCls, className, style, children } = this.props;
        const wrapCls = classNames({
            [className]: !!className,
            [`${prefixCls}-wrapper`]: true,
        });
        const mark = (<label className={wrapCls} style={style}>
        <RcCheckbox {...omit(this.props, ['className', 'style'])}/>
        {children}
      </label>);
        if (this.props.wrapLabel) {
            return mark;
        }
        return <RcCheckbox {...this.props}/>;
    }
}
Checkbox.defaultProps = {
    prefixCls: 'am-checkbox',
    wrapLabel: true,
};
