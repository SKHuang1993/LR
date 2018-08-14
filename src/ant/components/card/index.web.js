import React from 'react';
import classNames from 'classnames';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import CardFooter from './CardFooter';
export default class Card extends React.Component {
    render() {
        const { prefixCls, full, children, className } = this.props;
        const wrapCls = classNames({
            [prefixCls]: true,
            [`${prefixCls}-full`]: full,
            [className]: className,
        });
        return (<div className={wrapCls}>
        {children}
      </div>);
    }
}
Card.defaultProps = {
    prefixCls: 'am-card',
    full: false,
};
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
