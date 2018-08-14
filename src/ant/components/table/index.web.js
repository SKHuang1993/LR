import React from 'react';
import assign from 'object-assign';
import RcTable from 'rc-table';
export default class Table extends React.Component {
    render() {
        const { prefixCls, columns, dataSource, direction, scrollX, titleFixed } = this.props;
        const newProps = assign({}, this.props, { data: dataSource });
        let table;
        // 默认纵向
        if (!direction || direction === 'vertical') {
            if (titleFixed) {
                table = <RcTable {...newProps} columns={columns} scroll={{ x: true }} showHeader={false}/>;
            }
            else {
                table = <RcTable {...newProps} columns={columns} scroll={{ x: scrollX }}/>;
            }
        }
        else if (direction === 'horizon') {
            columns[0].className = `${prefixCls}-horizonTitle`;
            table = <RcTable {...newProps} columns={columns} showHeader={false} scroll={{ x: scrollX }}/>;
        }
        else if (direction === 'mix') {
            columns[0].className = `${prefixCls}-horizonTitle`;
            table = <RcTable {...newProps} columns={columns} scroll={{ x: scrollX }}/>;
        }
        return table;
    }
}
Table.defaultProps = {
    dataSource: [],
    prefixCls: 'am-table',
};
