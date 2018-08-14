import React from 'react';
import classNames from 'classnames';
export default class FlexItem extends React.Component {
    render() {
        let { children, className, prefixCls, style, onClick } = this.props;
        const wrapCls = classNames({
            [`${prefixCls}-item`]: true,
            [className]: className,
        });
        return (<div className={wrapCls} style={style} onClick={onClick}>{children}</div>);
    }
}
FlexItem.defaultProps = {
    prefixCls: 'am-flexbox',
};
