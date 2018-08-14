import React from 'react';
import Tabs, { TabPane } from 'rc-tabs';
import Tab from './Tab.web';
import TabContent from 'rc-tabs/lib/TabContent';
import TabBar from 'rc-tabs/lib/TabBar';
import getDataAttr from '../_util/getDataAttr';
class AntTabBar extends React.Component {
    constructor() {
        super(...arguments);
        this.onChange = key => {
            React.Children.forEach(this.props.children, (c) => {
                if (c.key === key && c.props.onPress) {
                    c.props.onPress();
                }
            });
        };
        this.renderTabBar = () => {
            const { barTintColor, hidden, prefixCls } = this.props;
            const barCls = hidden ? `${prefixCls}-bar-hidden` : '';
            return <TabBar className={barCls} style={{ backgroundColor: barTintColor }}/>;
        };
        this.renderTabContent = () => {
            return <TabContent animated={false}/>;
        };
    }
    render() {
        let activeKey;
        const children = [];
        React.Children.forEach(this.props.children, (c) => {
            if (c.props.selected) {
                activeKey = c.key;
            }
            children.push(c);
        });
        const { tintColor, unselectedTintColor } = this.props;
        const panels = children.map((c) => {
            const cProps = c.props;
            const tab = (<Tab prefixCls={`${this.props.prefixCls}-tab`} badge={cProps.badge} selected={cProps.selected} icon={cProps.icon} selectedIcon={cProps.selectedIcon} title={cProps.title} tintColor={tintColor} unselectedTintColor={unselectedTintColor} dataAttrs={getDataAttr(cProps)}/>);
            return (<TabPane placeholder={this.props.placeholder} tab={tab} key={c.key}>
          {cProps.children}
        </TabPane>);
        });
        return (<Tabs renderTabBar={this.renderTabBar} renderTabContent={this.renderTabContent} tabBarPosition="bottom" prefixCls={this.props.prefixCls} activeKey={activeKey} onChange={this.onChange}>
        {panels}
      </Tabs>);
    }
}
AntTabBar.defaultProps = {
    prefixCls: 'am-tab-bar',
    barTintColor: 'white',
    tintColor: '#108ee9',
    hidden: false,
    unselectedTintColor: '#888',
    placeholder: '正在加载',
};
AntTabBar.Item = React.createClass({ render() { return null; } });
export default AntTabBar;
