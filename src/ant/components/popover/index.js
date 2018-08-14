import React from 'react';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
export default class Popover extends React.Component {
    render() {
        const { children, onSelect, overlay, disabled, contextStyle, name, style, triggerStyle, overlayStyle, renderOverlayComponent, } = this.props;
        const menuOptionsProp = {
            optionsContainerStyle: overlayStyle,
            renderOptionsContainer: renderOverlayComponent,
        };
        return (<MenuContext ref="menuContext" style={contextStyle}>
        <Menu name={name} onSelect={onSelect} style={style}>
          <MenuTrigger disabled={disabled} style={triggerStyle}>
            {children}
          </MenuTrigger>
          <MenuOptions {...menuOptionsProp}>
            {overlay}
          </MenuOptions>
        </Menu>
      </MenuContext>);
    }
}
Popover.defaultProps = {
    onSelect: () => { },
};
Popover.Item = MenuOption;
