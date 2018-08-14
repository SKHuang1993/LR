import React from 'react';
import classNames from 'classnames';
export default class CardFooter extends React.Component {
    render() {
        const { prefixCls, content, className, extra } = this.props;
        const wrapCls = classNames({
            [`${prefixCls}-footer`]: true,
            [className]: className,
        });
        return (<div className={wrapCls}>
        <div className={`${prefixCls}-footer-content`}>{content}</div>
        {extra ? (<div className={`${prefixCls}-footer-extra`}>{extra}</div>) : null}
      </div>);
    }
}
CardFooter.defaultProps = {
    prefixCls: 'am-card',
};
