import React from 'react';
import ListView from 'rmc-list-view';
import Icon from '../icon';
import assign from 'object-assign';
ListView.RefreshControl.defaultProps = assign({}, ListView.RefreshControl.defaultProps, {
    prefixCls: 'am-refresh-control',
    icon: [
        <div key="0" className="am-refresh-control-pull">
      <span>下拉可以刷新</span>
    </div>,
        <div key="1" className="am-refresh-control-release">
      <span>松开立即刷新</span>
    </div>,
    ],
    loading: <Icon type="loading"/>,
    refreshing: false,
    distanceToRefresh: 50 / 2 * (window.devicePixelRatio || 2),
});
export default ListView.RefreshControl;
