import React from 'react';
import Swipeout from 'rc-swipeout';
import classNames from 'classnames';
class SwipeAction extends React.Component {
    render() {
        const { className, prefixCls, left = [], right = [], autoClose, disabled, onOpen, onClose, children, } = this.props;
        const wrapClass = classNames({
            [`${prefixCls}`]: 1,
            [className]: !!className,
        });
        return (left.length || right.length) ? (<div className={wrapClass}>
        <Swipeout prefixCls={prefixCls} left={left} right={right} autoClose={autoClose} disabled={disabled} onOpen={onOpen} onClose={onClose}>
          {children}
        </Swipeout>
      </div>) : (<div className={wrapClass}>{children}</div>);
    }
}
SwipeAction.defaultProps = {
    prefixCls: 'am-swipe',
    title: '请确认操作',
    autoClose: false,
    disabled: false,
    left: [],
    right: [],
    onOpen() { },
    onClose() { },
};
export default SwipeAction;
