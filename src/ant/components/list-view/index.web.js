import React from 'react';
import MListView from 'rmc-list-view';
import handleProps from './handleProps';
import IndexedList from './Indexed.web';
export default class ListView extends React.Component {
    render() {
        const { restProps, extraProps } = handleProps(this.props, false);
        let { useZscroller, refreshControl } = this.props;
        if (refreshControl) {
            useZscroller = true;
        }
        return <MListView ref="listview" {...restProps} {...extraProps} useZscroller={useZscroller}/>;
    }
}
ListView.defaultProps = {
    prefixCls: 'am-list-view',
    listPrefixCls: 'am-list',
};
ListView.DataSource = MListView.DataSource;
ListView.IndexedList = IndexedList;
