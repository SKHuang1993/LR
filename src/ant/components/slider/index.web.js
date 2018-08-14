import React from 'react';
import RcSlider from 'rc-slider';
export default class Slider extends React.Component {
    render() {
        return (<div className={`${this.props.prefixCls}-wrapper`}><RcSlider {...this.props}/></div>);
    }
}
Slider.defaultProps = {
    prefixCls: 'am-slider',
    tipTransitionName: 'zoom-down',
};
