import React from 'react';
import { Platform } from 'react-native';
import DrawerLayout from 'react-native-drawer-layout';
import splitObject from '../_util/splitObject';
export default class Drawer extends React.Component {
    render() {
        let [{ children, sidebar, onOpenChange, position, drawerWidth, drawerBackgroundColor, }, restProps] = splitObject(this.props, ['children', 'sidebar', 'onOpenChange', 'position',
            'drawerWidth', 'drawerBackgroundColor']);
        if (Platform.OS === 'android') {
            position = DrawerLayout.positions.Left;
            if (position === 'right') {
                position = DrawerLayout.positions.Right;
            }
        }
        return (<DrawerLayout ref={drawer => this.drawer = drawer} renderNavigationView={() => sidebar} drawerWidth={drawerWidth} drawerBackgroundColor={drawerBackgroundColor} drawerPosition={position} onDrawerOpen={() => onOpenChange(true)} onDrawerClose={() => onOpenChange(false)} {...restProps}>
        {children}
      </DrawerLayout>);
    }
}
Drawer.defaultProps = {
    position: 'left',
    onOpenChange: () => { },
    drawerWidth: 300,
};
