import React from 'react';
import classNames from 'classnames';
import splitObject from '../_util/splitObject';
import Touchable from 'rc-touchable';
export default class Item extends React.Component {
    render() {
        let [{ children, className, prefixCls, icon, disabled, firstItem, activeStyle }, restProps] = splitObject(this.props, ['children', 'className', 'prefixCls', 'icon', 'disabled', 'firstItem', 'activeStyle']);
        const cls = {
            [className]: !!className,
            [`${prefixCls}-item`]: true,
            [`${prefixCls}-item-disabled`]: disabled,
        };
        let activeClass = `${prefixCls}-item-active `;
        if (firstItem) {
            activeClass += `${prefixCls}-item-fix-active-arrow`;
        }
        return (<Touchable disabled={disabled} activeClassName={activeClass} activeStyle={activeStyle}>
        <div className={classNames(cls)} {...restProps}>
          <div className={`${prefixCls}-item-container`}>
            {icon ? <span className={`${prefixCls}-item-icon`}>{icon}</span> : null}
            <span className={`${prefixCls}-item-content`}>{children}</span>
          </div>
        </div>
      </Touchable>);
    }
}
Item.defaultProps = {
    prefixCls: 'am-popover',
    disabled: false,
};
Item.myName = 'PopoverItem';
