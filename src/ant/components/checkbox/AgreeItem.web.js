import React from 'react';
import classNames from 'classnames';
import Checkbox from './Checkbox.web';
import getDataAttr from '../_util/getDataAttr';
import omit from 'omit.js';
export default class AgreeItem extends React.Component {
    render() {
        const { prefixCls, style, className } = this.props;
        const wrapCls = classNames({
            [`${prefixCls}-agree`]: true,
            [className]: className,
        });
        return (<div {...getDataAttr(this.props)} className={wrapCls} style={style}>
      <Checkbox {...omit(this.props, ['style'])} className={`${prefixCls}-agree-label`}/>
    </div>);
    }
}
AgreeItem.defaultProps = {
    prefixCls: 'am-checkbox',
};
