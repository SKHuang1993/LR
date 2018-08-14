import React from 'react';
import classNames from 'classnames';
export default class CardBody extends React.Component {
    render() {
        const { prefixCls, children, className } = this.props;
        const wrapCls = classNames({
            [`${prefixCls}-body`]: true,
            [className]: className,
        });
        return (<div className={wrapCls}>{children}</div>);
    }
}
CardBody.defaultProps = {
    prefixCls: 'am-card',
};
