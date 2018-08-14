import {
    WebView, View, Platform, Modal
} from 'react-native';
import React, { Component } from 'react';
import deepDiffer from 'deepDiffer';
import { observer } from 'mobx-react/native';
import { extendObservable, action, computed, toJS, observable } from 'mobx';

@observer
class ModalBox extends Component {
    @observable visible = true;
    static set(component, props) {
        let navigator = global.navigatorInstance;
        let isAndroid = Platform.OS === 'android';
        if (navigator) {
            if (isAndroid) {
                navigator.push({
                    type: 'Bottom',
                    component: component,
                    passProps: props
                })
            } else {
                let currentRouteStack = navigator.getCurrentRoutes();
                currentRouteStack.push({
                    type: 'Bottom',
                    component: component,
                    passProps: props
                })
                //防止连续点击导致连续启动同个页面
                if (currentRouteStack.length > 1) {
                    if (!deepDiffer(currentRouteStack[currentRouteStack.length - 1], currentRouteStack[currentRouteStack.length - 2])) {
                        return;
                    }
                }
                navigator.immediatelyResetRouteStack(currentRouteStack);
            }
        }
    }

    add(container) {
        let isAndroid = Platform.OS === 'android';
        return React.createElement(isAndroid ? View : Modal, {
            animationType: "slide",
            visible: this.visible,
            onClose: this.remove,
            style: {
                flex: 1
            },
        }, container);
    }

    remove() {
        this.visible = false;
        let navigator = global.navigatorInstance;
        let isAndroid = Platform.OS === 'android';
        if (navigator) {
            if (isAndroid) {
                navigator.pop();
            } else {
                let currentRouteStack = navigator.getCurrentRoutes();
                currentRouteStack = currentRouteStack.slice(0, currentRouteStack.length - 1);
                navigator.immediatelyResetRouteStack(currentRouteStack);
            }
        }
    }

    static init(o) {
        global.navigatorInstance = o.navigator;
    }
}

exports.ModalBox = ModalBox;

