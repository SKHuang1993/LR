import React from 'react';
import classNames from 'classnames';
export default class CardHeader extends React.Component {
    render() {
        const { prefixCls, className, title, thumb, thumbStyle, extra } = this.props;
        const wrapCls = classNames({
            [`${prefixCls}-header`]: true,
            [className]: className,
        });
        return (<div className={wrapCls}>
        <div className={`${prefixCls}-header-content`}>
          {thumb ? <img style={thumbStyle} src={thumb}/> : null}
          {title}
        </div>
        {extra ? <div className={`${prefixCls}-header-extra`}>{extra}</div> : null}
      </div>);
    }
}
CardHeader.defaultProps = {
    prefixCls: 'am-card',
    thumbStyle: {},
};
