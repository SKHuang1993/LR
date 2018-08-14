import React from 'react';
import topView from 'rn-topview';
import Container from './container';
import deepDiffer from 'deepDiffer';
import {
    Modal, WebView, View, Platform
} from 'react-native';
import { ModalBox } from '../modalbox';

export function showCityList(...args) {
    let type = args[0] ? args[0] : "flight";
    ModalBox.set(Container,{
        type: type,
        callback: args[1],
    });
    //topView.set(<Container type={type} callback={args[1]} />);
}


export function init(obj) {
    global.navigatorInstance = obj.navigator;
}
