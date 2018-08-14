import React, { Component } from 'react';
import {
    NativeModules,
} from 'react-native';
import { observable, extendObservable } from 'mobx';
import { observer } from 'mobx-react/native';
import * as lang from '../languages/';

export const zh_CN = {
    ...lang.home.zh_CN,
    ...lang.account.zh_CN,
}
export const en_US = {
    ...lang.home.en_US,
    ...lang.account.en_US,
}


@observer
class LanguageType extends Component {
    @observable static t = zh_CN;
    static getType = async () => {
        try {
            var { type } = await NativeModules.MyNativeModule.callNativeMethod(100, 100);
            if (type === 2) {
                LanguageType.t = en_US;
            } else {
                LanguageType.t = zh_CN;
            }
        } catch (error) {
            LanguageType.t = zh_CN;
        }
    };

    static setType = () => {
        return LanguageType.t;
    }
    static changeLocal = (type) => {
        extendObservable(LanguageType.t, type);
    }

}

exports.LanguageType = LanguageType;

