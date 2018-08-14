import React from 'react';
import classNames from 'classnames';
import ReactCarousel from 'nuka-carousel';
import assign from 'object-assign';
export default class Carousel extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = (index) => {
            this.setState({
                selectedIndex: index,
            }, () => {
                if (this.props.afterChange) {
                    this.props.afterChange(index);
                }
            });
        };
        this.state = {
            selectedIndex: this.props.selectedIndex,
        };
    }
    render() {
        const { className, prefixCls } = this.props;
        let props = assign({}, this.props);
        props = assign(props, {
            wrapAround: props.infinite,
            slideIndex: props.selectedIndex,
            beforeSlide: props.beforeChange,
        });
        let Decorators = [];
        const current = this.state.selectedIndex;
        if (props.dots) {
            Decorators = [{
                    component: React.createClass({
                        render() {
                            const { slideCount, slidesToScroll } = this.props;
                            const arr = [];
                            for (let i = 0; i < slideCount; i += slidesToScroll) {
                                arr.push(i);
                            }
                            return (<div className={`${prefixCls}-wrap`}>
                {arr.map(function (index) {
                                const dotCls = classNames({
                                    [`${prefixCls}-wrap-dot`]: true,
                                    [`${prefixCls}-wrap-dot-active`]: index === current,
                                });
                                return (<div className={dotCls} key={index}>
                        <span></span>
                      </div>);
                            })}
              </div>);
                        },
                    }),
                    position: 'BottomCenter',
                }];
        }
        ['infinite', 'selectedIndex', 'beforeChange', 'afterChange', 'dots'].forEach(prop => {
            if (props.hasOwnProperty(prop)) {
                delete props[prop];
            }
        });
        const wrapCls = classNames({
            [className]: className,
            [prefixCls]: true,
            [`${prefixCls}-vertical`]: props.vertical,
        });
        return (<ReactCarousel {...props} className={wrapCls} decorators={Decorators} afterSlide={this.onChange}/>);
    }
}
Carousel.defaultProps = {
    prefixCls: 'am-carousel',
    dots: true,
    arrows: false,
    autoplay: false,
    infinite: false,
    edgeEasing: 'linear',
    cellAlign: 'center',
    selectedIndex: 0,
};
