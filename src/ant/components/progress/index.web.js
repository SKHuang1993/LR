import React from 'react';
import classNames from 'classnames';
import assign from 'object-assign';
export default class Progress extends React.Component {
    componentWillReceiveProps() {
        this.noAppearTransition = true;
    }
    componentDidMount() {
        if (this.props.appearTransition) {
            setTimeout(() => {
                this.refs.bar.style.width = `${this.props.percent}%`;
            }, 10);
        }
    }
    render() {
        const { prefixCls, position, unfilled, style = {} } = this.props;
        const percentStyle = {
            width: this.noAppearTransition || !this.props.appearTransition ? `${this.props.percent}%` : 0,
            height: 0,
        };
        const wrapCls = classNames({
            [`${prefixCls}-outer`]: true,
            [`${prefixCls}-fixed-outer`]: position === 'fixed',
            [`${prefixCls}-hide-outer`]: unfilled === 'hide',
        });
        return (<div className={wrapCls}>
        <div ref="bar" className={`${prefixCls}-bar`} style={assign({}, style, percentStyle)}></div>
      </div>);
    }
}
Progress.defaultProps = {
    prefixCls: 'am-progress',
    percent: 0,
    position: 'fixed',
    unfilled: 'show',
    appearTransition: false,
};
