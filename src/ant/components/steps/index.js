import React from 'react';
import RNStepsItem from './StepsItem';
import { View } from 'react-native';
import StepStyle from './style';
export default class Steps extends React.Component {
    constructor(props) {
        super(props);
        this.onLayout = (e) => {
            this.setState({
                wrapWidth: e.nativeEvent.layout.width,
            });
        };
        this.state = {
            wrapWidth: 0,
        };
    }
    render() {
        const children = this.props.children;
        const wrapView = this.props.direction === 'vertical' ? '' : 'warp_row';
        const styles = this.props.styles;
        return (<View style={styles[wrapView]} onLayout={(e) => { this.onLayout(e); }}>
      {React.Children.map(children, (ele, idx) => {
            let errorTail = -1;
            if (idx < children.length - 1) {
                const status = children[idx + 1].props.status;
                if (status === 'error') {
                    errorTail = idx;
                }
            }
            return React.cloneElement(ele, {
                index: idx,
                last: idx === children.length - 1,
                direction: this.props.direction,
                current: this.props.current,
                width: 1 / (children.length - 1) * this.state.wrapWidth,
                size: this.props.size,
                finishIcon: this.props.finishIcon,
                errorTail,
                styles,
            });
        })}
      </View>);
    }
}
Steps.defaultProps = {
    direction: '',
    styles: StepStyle,
};
Steps.Step = RNStepsItem;
