import React from 'react';
import Tooltip from 'rc-tooltip';
import Item from './Item.web';
function recursiveCloneChildren(children, cb = (ch, _i) => ch) {
    return React.Children.map(children, (child, index) => {
        const newChild = cb(child, index);
        if (newChild && newChild.props && newChild.props.children) {
            return React.cloneElement(newChild, {}, recursiveCloneChildren(newChild.props.children, cb));
        }
        return newChild;
    });
}
export default class Popover extends React.Component {
    render() {
        const { overlay, onSelect = () => { } } = this.props;
        const overlayNode = recursiveCloneChildren(overlay, (child, index) => {
            const extraProps = { firstItem: false };
            if (child && child.type && child.type.myName === 'PopoverItem' && !child.props.disabled) {
                extraProps.onClick = () => onSelect(child, index);
                extraProps.firstItem = (index === 0);
                return React.cloneElement(child, extraProps);
            }
            return child;
        });
        return <Tooltip {...this.props} overlay={overlayNode}/>;
    }
}
Popover.defaultProps = {
    prefixCls: 'am-popover',
    placement: 'bottomRight',
    popupAlign: { overflow: { adjustY: 0, adjustX: 0 } },
    trigger: ['click'],
};
Popover.Item = Item;
