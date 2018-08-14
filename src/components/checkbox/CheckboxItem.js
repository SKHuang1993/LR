import React from 'react';
import Checkbox from './Checkbox';
//import List from '../list/index';
import { List} from 'antd-mobile';
import CheckboxItemStyle from './style/index';
const ListItem = List.Item;
const refCheckbox = 'checkbox';
export default class CheckboxItem extends React.Component {
    constructor() {
        super(...arguments);
        this.handleClick = () => {
            let checkBox = this.refs[refCheckbox];
            checkBox.handleClick();
            if (this.props.onClick) {
                this.props.onClick();
            }
        };
    }
    render() {
        let { style, checkboxStyle, defaultChecked, checked, disabled, children, extra, line, onChange, styles } = this.props;
        return (<ListItem style={style} onClick={disabled ? undefined : this.handleClick} line={line} extra={extra} thumb={<Checkbox  ref={refCheckbox} style={[styles.checkboxItemCheckbox, checkboxStyle,{tintColor: '#fa5e5b'}]} defaultChecked={defaultChecked} checked={checked} onChange={onChange} disabled={disabled}/>}>{children}</ListItem>);
    }
}
CheckboxItem.defaultProps = {
    styles: CheckboxItemStyle,
};
