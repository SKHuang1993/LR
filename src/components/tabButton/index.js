import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';




export default class TabButton extends Component {

    static defaultProps = {
        activeTab: 0,
        onClink: () => { },
        tabNames: ['yiqife', 'chailvbao']
    }
    constructor(props) {
        super(props);

        this.state = {
            activeTab: props.activeTab
        }
    }
    onActiveTab(i) {
        this.setState({
            activeTab: i,
        })
        this.props.onClink(i)
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.activeTab !== this.props.activeTab) {
            this.setState({
                activeTab: nextProps.activeTab
            });
        }
    }
    renderTabOption(tab, i) {
        // 判断i是否是当前选中的tab，设置不同的颜色

        // console.log(44444,(this.state.activeTab==i + 'rr'+ this.props.activeTab ==i));
        let activeState = this.state.activeTab == i;
        let textActiveStyle = activeState ? this.props.textActiveStyle ? this.props.textActiveStyle : this.styles.textActiveStyle : null;
        let tabActiveStyle = activeState ? this.props.tabActiveStyle : null;
        let tabItemActiveStyle = activeState ? this.props.tabItemActiveStyle : null;
        let radiusFirst = this.props.radius && i == 0 ? { borderTopLeftRadius: this.props.radius, borderBottomLeftRadius: this.props.radius } : null;
      
        let radiusLast = this.props.radius && this.props.tabNames.length - 1 == i ? { borderTopRightRadius: this.props.radius, borderBottomRightRadius: this.props.radius } : null;
        return (
            <TouchableOpacity activeOpacity={1} key={i} onPress={() => {
                this.onActiveTab(i);
                if (this.props.goToPage) {
                    this.props.goToPage(i)
                }
            }
            } style={[this.styles.tab, this.props.tabStyle, tabActiveStyle,radiusFirst, radiusLast]}>
                <View style={[this.styles.tabItem, this.props.tabItemStyle, tabItemActiveStyle, ]}>
                    <Text style={[this.styles.textStyle, this.props.textStyle, textActiveStyle]}>
                        {this.props.tabNames[i]}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
    //切换样式
    styles = {
        tabs: {
            flexDirection: 'row',
            height: 44,
            backgroundColor: '#fff',
            justifyContent: 'space-between',

        },

        tab: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },

        tabItem: {

        },
        textActiveStyle: {
            color: 'red'
        }
    }

    render() {
        let radius = this.props.radius ? { borderRadius: this.props.radius } : null;
        return (
            <View style={[this.styles.tabs, this.props.style, radius]}>
                {this.props.tabNames.map((tab, i) => this.renderTabOption(tab, i))}
            </View>

        );
    }

}