import React from 'react';
import { View, Animated, Dimensions } from 'react-native';
import ProgressStyle from './style/index';
export default class Progress extends React.Component {
    constructor(props) {
        super(props);
        this.onLayout = (e) => {
            this.setState({
                wrapWidth: e.nativeEvent.layout.width,
            });
        };
        this.normalPercent = (percent) => {
            let widthPercent = 0;
            if (percent > 0) {
                widthPercent = percent > 100 ? 100 : percent;
            }
            return widthPercent;
        };
        this.getWidth = (percent = this.props.percent) => {
            return this.state.wrapWidth * (this.normalPercent(percent) / 100);
        };
        this.state = {
            wrapWidth: props.wrapWidth || Dimensions.get('window').width,
            percentage: new Animated.Value(0),
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.wrapWidth !== this.props.wrapWidth) {
            this.setState({ wrapWidth: nextProps.wrapWidth });
        }
        if (this.props.appearTransition && nextProps.percent !== this.props.percent) {
            this.setState({ percentage: new Animated.Value(this.getWidth(nextProps.percent)) });
        }
    }
    componentDidMount() {
        if (this.props.appearTransition) {
            this.state.percentage.setValue(0);
            Animated.timing(this.state.percentage, {
                toValue: this.getWidth(),
                duration: 1000,
            }).start();
        }
    }
    render() {
        const { position, unfilled, style, styles } = this.props;
        const percentStyle = {
            width: this.getWidth(),
            height: 0,
        };
        let child = <View style={[styles.progressBar, style, percentStyle]}/>;
        if (this.props.appearTransition) {
            percentStyle.width = this.state.percentage;
            child = <Animated.View style={[styles.progressBar, style, percentStyle]}/>;
        }
        return (<View onLayout={this.onLayout} style={[
            styles.progressOuter,
            position === 'fixed' ? { position: 'absolute', top: 0 } : null,
            unfilled === 'hide' ? { backgroundColor: 'transparent' } : null,
        ]}>
      {child}
    </View>);
    }
}
Progress.defaultProps = {
    percent: 0,
    position: 'normal',
    unfilled: 'show',
    appearTransition: false,
    styles: ProgressStyle,
};
