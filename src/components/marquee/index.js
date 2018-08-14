import React, { Component } from 'react'
import {
    Text,
    View,
    Animated,
    Easing,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity
} from 'react-native'

export default class Marquee extends Component {
     static defaultProps = {
        alert: false, //是否点击弹出 alert 文本
        data: '林钦、远江预订了差旅政策：原因有1明天去美国上班开会2一起飞国际机票我'
    }
    constructor(props) {
        super(props)
        let content = props.data;

        this.state = {
            translateValue: new Animated.ValueXY({ x: 0, y: 0 }),
            // 滚屏宽度
            scrollWidth: this.props.scrollWidth || 100,
            // 滚屏内容
            scrollContent: [content, content, content],
            // Animated.View 滚动到的 x轴坐标
            scrollXValue: 0,
            // 最大偏移量
            scrollContentOffsetX: 0,
            // 每一次滚动切换之前延迟的时间
            delay: this.props.delay || 0,
            // 每一次滚动切换的持续时间
            duration: this.props.duration || 10000
        }
    }
    render() {
        let content = [this.props.data, this.props.data];
        return (
            <View style={[styles.container,this.props.bgColor]}>
                {
                    content.length !== 0 ?
                        <Animated.View
                            horizontal={true}
                            style={[
                                { flexDirection: 'row' },
                                {
                                    transform: [
                                        { translateX: this.state.translateValue.x }
                                    ]
                                }
                            ]}>
                            {content.map(this.scrollItem.bind(this))}
                        </Animated.View> : null
                }

            </View>
        )
    }

    getRefsAttr() {
        this.refs.ScrollTxt0.measure((a, b, width, height, px, py) => {
            let content = this.props.data || [];
            let w = 2 * width
            if (width != this.state.scrollWidth) {
                this.setState({
                    scrollWidth: width,
                    scrollContentOffsetX: w
                })
            }


        });
    }

    componentDidMount() {
        let content = this.props.data || [];
        setTimeout(this.getRefsAttr.bind(this), 200);

        // 开始动画
         setTimeout(this._startAnimation.bind(this), 300);


    }
    componentDidUpdate() {
        setTimeout(this.getRefsAttr.bind(this), 0);
      // setTimeout(this._startAnimation.bind(this), 300);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data == this.props.data) {
            this.setState({
                data: nextProps.data
            });
        }

    }

    scrollItem(item, index) {
        return (
            <TouchableOpacity onPress={() => {
                this.props.alert ? Alert.alert(null, item) : null
            }
            } activeOpacity={.7} key={index} ref={`ScrollTxt${index}`}
                style={[styles.scrollStyle, this.props.scrollWidth ? { width: this.props.scrollWidth } : null, this.props.scrollStyle]}>
                <Text style={[styles.textStyle, this.props.textStyle]}>{item}</Text>
            </TouchableOpacity>
        )
    }

    _startAnimation() {
        this.state.scrollXValue -= this.state.scrollWidth;
        Animated.sequence([
            Animated.delay(this.props.delay ? this.props.delay : 0),
            Animated.timing(
                this.state.translateValue,
                {
                    toValue: { x: this.state.scrollXValue, y: 0 },
                    duration: this.props.duration ? this.props.duration : this.state.scrollWidth * 10000 / 500, // 动画持续的时间（单位是毫秒），默认为500
                    easing: Easing.linear
                }
            ),
        ])
            .start(() => {
                // 无缝切换
                if (this.state.scrollXValue  >= -this.state.scrollContentOffsetX) {
                    // 快速拉回到初始状态
                    this.state.translateValue.setValue({ x: 0, y: 0 })
                    this.state.scrollXValue = 0
                }
                this._startAnimation()
            })
    }
}

const styles = StyleSheet.create({
    container: {
        // 必须要有一个背景或者一个border，否则本身高度将不起作用
        backgroundColor: 'transparent',
        overflow: 'hidden',
        width: 2000
    },
    scrollStyle: {
        paddingRight: 30,
        backgroundColor: 'transparent',
    },
    textStyle: {
        fontSize: 14,
        color: '#666',
        paddingTop: 5,
        paddingBottom: 5,
    }
})

