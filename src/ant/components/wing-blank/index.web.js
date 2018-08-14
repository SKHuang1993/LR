import React from 'react';
import classNames from 'classnames';
export default class WingBlank extends React.Component {
    render() {
        const { prefixCls, size, className, children, style } = this.props;
        let wrapCls = classNames({
            [`${prefixCls}`]: true,
            [`${prefixCls}-${size}`]: true,
            [className]: !!className,
        });
        return (<div className={wrapCls} style={style}>
        {children}
      </div>);
    }
}
WingBlank.defaultProps = {
    prefixCls: 'am-wingblank',
    size: 'lg',
};
