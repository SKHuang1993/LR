import React from 'react';
import Swipeout from 'rc-swipeout/lib/Swipeout';
class SwipeAction extends React.Component {
    render() {
        return (<Swipeout {...this.props}/>);
    }
}
SwipeAction.defaultProps = {
    autoClose: false,
    disabled: false,
    left: [],
    right: [],
    onOpen() { },
    onClose() { },
};
export default SwipeAction;
