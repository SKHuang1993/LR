const React = require('react');
const ReactNative = require('react-native');
const {
  StyleSheet,
    Text,
    View,
    Animated,
} = ReactNative;
import moment from 'moment';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'

const DefaultTabBar = React.createClass({
    propTypes: {
        goToPage: React.PropTypes.func,
        activeTab: React.PropTypes.number,
        tabs: React.PropTypes.array,
        backgroundColor: React.PropTypes.string,
        activeTextColor: React.PropTypes.string,
        inactiveTextColor: React.PropTypes.string,
        textStyle: Text.propTypes.style,
        tabStyle: View.propTypes.style,
        renderTab: React.PropTypes.func,
        underlineStyle: View.propTypes.style,
    },

    getInitialState: function () {
        return { tabs: this.props.tabs, translateValue: new Animated.ValueXY({ x: 0, y: 0 }), }
    },

    getDefaultProps() {
        return {
            activeTextColor: 'navy',
            inactiveTextColor: 'black',
            backgroundColor: null,
        };
    },

    renderTabOption(name, page) {
    },

    componentWillReceiveProps(props) {
        this.setState({ tabs: props.tabs });
        const containerWidth = props.containerWidth;
        const numberOfTabs = props.tabs.length;
        Animated.timing(
            this.state.translateValue,
            {
                toValue: { x: props.position * (containerWidth / numberOfTabs), y: 0 },
                duration: 500,
            }
        ).start();
    },

    renderTab(name, page, isTabActive, onPressHandler) {
        const { activeTextColor, inactiveTextColor, textStyle, } = this.props;
        const textColor = COLORS.primary;
        const fontWeight = isTabActive ? 'normal' : 'normal';
        return <ReactNative.TouchableOpacity activeOpacity={1} disabled={page == 0 ? false : true}
            style={{ flex: 1, }}
            key={name}
            accessible={true}
            accessibilityLabel={name}
            accessibilityTraits='button'
            onPress={() => onPressHandler(page)}
        >
            <View style={[styles.tab, this.props.tabStyle,]}>
                <Text style={[{ color: textColor, fontWeight, }, textStyle, { marginTop: 10, marginBottom: 5 }]}>
                    {name}
                </Text>
                <Text style={[{ color: "#666", fontWeight, }, textStyle,]}>
                    {this.props.date[page] ? moment(this.props.date[page]).format("YYYY-MM-DD") : null}
                </Text>
            </View>
        </ReactNative.TouchableOpacity>;
    },

    render() {
        const containerWidth = this.props.containerWidth;
        const numberOfTabs = this.props.tabs.length;
        const tabUnderlineStyle = {
            position: 'absolute',
            width: containerWidth / numberOfTabs,
            height: 2,
            backgroundColor: COLORS.secondary,
            bottom: 0,
        };

        const left = this.props.scrollValue.interpolate({
            inputRange: [0, 1,], outputRange: [0, containerWidth / numberOfTabs,],
        });
        return (
            <View style={[styles.tabs, { backgroundColor: this.props.backgroundColor }, this.props.style,]}>
                {this.state.tabs.map((name, page) => {
                    const isTabActive = this.props.position === page;
                    const renderTab = this.props.renderTab || this.renderTab;
                    return renderTab(name, page, isTabActive, this.props.goToPage);
                })}
                <Animated.View style={[tabUnderlineStyle, {
                    transform: [
                        { translateX: this.state.translateValue.x }
                    ]
                }, this.props.underlineStyle,]} />
            </View>
        );
    },
});

const styles = StyleSheet.create({
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
    },
    tabs: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderWidth: 1,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: '#EBEBEB',
    },
});

module.exports = DefaultTabBar;
