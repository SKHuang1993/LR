import React from 'react';
import classNames from 'classnames';
export default class WhiteSpace extends React.Component {
    render() {
        const { prefixCls, size, className, style, onClick } = this.props;
        let wrapCls = classNames({
            [`${prefixCls}`]: true,
            [`${prefixCls}-${size}`]: true,
            [className]: !!className,
        });
        return (<div className={wrapCls} style={style} onClick={onClick}/>);
    }
}
WhiteSpace.defaultProps = {
    prefixCls: 'am-whitespace',
    size: 'md',
};
