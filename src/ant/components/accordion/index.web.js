import React from 'react';
import RcCollapse, { Panel } from 'rc-collapse';
export default class Accordion extends React.Component {
    render() {
        return <RcCollapse {...this.props}/>;
    }
}
Accordion.Panel = Panel;
Accordion.defaultProps = {
    prefixCls: 'am-accordion',
};
