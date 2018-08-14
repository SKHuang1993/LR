import React from 'react';
import RcDrawer from 'rc-drawer';
export default class Drawer extends React.Component {
    render() {
        return <RcDrawer {...this.props}/>;
    }
}
Drawer.defaultProps = {
    prefixCls: 'am-drawer',
    enableDragHandle: false,
};
