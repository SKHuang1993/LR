import React from 'react';
import topView from 'rn-topview';
import Container from './container';
import moment from 'moment';
import {ModalBox} from '../modalbox';
import deepDiffer from 'deepDiffer';
import {
    Modal, WebView, View, Platform
} from 'react-native';
export function showCalendar(...args) {
    // let navigator = global.navigatorInstance;
    // let isAndroid = Platform.OS === 'android';
    // if (navigator) {
    //     if (isAndroid) {
    //         navigator.push({
    //             type: 'Bottom',
    //             component: Container,
    //             passProps: {
    //                 minDate: args[0],
    //                 maxDate: args[1],
    //                 disabled: args[2],
    //                 callback: args[3],
    //                 defaultValues: args[4] ? args[4] : [],
    //                 isAndroid: isAndroid
    //             }
    //         })
    //     } else {
    //         let currentRouteStack = navigator.getCurrentRoutes();
    //         currentRouteStack.push({
    //             type: 'Bottom',
    //             component: Container,
    //             passProps: {
    //                 minDate: args[0],
    //                 maxDate: args[1],
    //                 disabled: args[2],
    //                 callback: args[3],
    //                 defaultValues: args[4] ? args[4] : [],
    //                 isAndroid: isAndroid
    //             }
    //         })
    //         if (currentRouteStack.length > 1) {
    //             if (!deepDiffer(currentRouteStack[currentRouteStack.length - 1], currentRouteStack[currentRouteStack.length - 2])) {
    //                 return;
    //             }
    //         }
    //         navigator.immediatelyResetRouteStack(currentRouteStack);
    //     }
    // }
    ModalBox.set(Container, {
        minDate: args[0],
        maxDate: args[1],
        disabled: args[2],
        callback: args[3],
        defaultValues: args[4] ? args[4] : [],
    });
    //topView.set(<Container minDate={args[0]} maxDate={args[1]} disabled={args[2]} callback={args[3]} defaultValues={args[4]} />);
}

export function initData(obj) {
    let data = [];
    let date = moment(moment().format("YYYY-MM-01")).subtract(1, 'd');
    for (let i = 0; i < 12; i++) {
        let isPass = true;
        data.push(date.clone().add(1, 'd'));
        for (let j = 0; j < (date.daysInMonth() + date.clone().add(1, 'd').weekday() + 1) / 7; j++) {
            let arr = new Array(7);
            for (let k = date.clone().add(2, 'd').weekday(); k < 7; k++) {
                let temp = date.add(1, 'd').clone();
                arr[k] = { date: temp, disabled: false, day: temp.format('D') };
                if (date.clone().add(1, 'd').month() != arr[k].date.month()) {
                    isPass = false;
                    break;
                }
            }
            data.push(arr);
            if (!isPass)
                break;
        }
    }
    global.calendarData = data;
}
