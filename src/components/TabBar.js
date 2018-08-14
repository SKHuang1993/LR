'use strict';
import React, {Component} from 'react';

import {
	StyleSheet,
	View,
	TouchableOpacity,
	Text,
    Dimensions,
} from 'react-native';

var {width,height} = Dimensions.get('window')


class TabBar  extends Component {

    static propTypes = {
		goToPage: React.PropTypes.func, // 跳转到对应tab的方法
		activeTab: React.PropTypes.number, // 当前被选中的tab下标
		tabs: React.PropTypes.array, // 所有tabs集合

		tabNames: React.PropTypes.array, // 保存Tab名称
		tabIconNames: React.PropTypes.array, // 保存Tab图标
		tabTextSize:React.PropTypes.number,//保存Tab名称字体大小
		tabChoiceColor:React.PropTypes.string,//保存Tab名称选中字体颜色
		tabUnchoiceColor:React.PropTypes.string,//保存Tab名称未选择字体颜色
	}

    constructor(props) {
        super(props);
    }

	setAnimationValue({value}) {
		// console.log(value);
	}

	componentDidMount() {
		// Animated.Value监听范围 [0, tab数量-1]
		this.props.scrollValue.addListener(this.setAnimationValue);
	}


    renderTabOption(tab,i){
		// 判断i是否是当前选中的tab，设置不同的颜色
        let color = this.props.activeTab == i ? this.props.tabChoiceColor : this.props.tabUnchoiceColor;
        return (
            <TouchableOpacity key={i} onPress={()=>this.props.goToPage(i)} style={styles.tab}>
                <View style={styles.tabItem}>
                    <Text style={{flex: 1,fontSize:this.props.tabTextSize,color: color}}>{this.props.tabNames[i]}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    render() {
		return (
            <View>
                <View style={styles.tabs}>
					{this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
				</View>
            </View>
		);
    }

}

const styles = StyleSheet.create({
        tabMenuStyle:{
        flexDirection:'row',
        width:width,
        height:45,
        backgroundColor:'#fff',
    },
    tabs: {
		flexDirection: 'row',
		height: 45,
	},

	tab: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},

	tabItem: {
		flexDirection: 'column',
		alignItems: 'center',
    },
});

export default TabBar;