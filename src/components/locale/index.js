import React, { Component } from 'react';
import {
    NativeModules,
} from 'react-native';
import { observable, extendObservable } from 'mobx';
import { observer } from 'mobx-react/native';
import * as lang from '../../languages/';
import index from '../../pages/login/WelcomeOrMain';
import moment from 'moment';

export const zh_CN = {
    lang: 'ZH',
    ...lang.home.zh_CN,
    ...lang.account.zh_CN,
    ...lang.travelapplicate.zh_CN,
    ...lang.common.zh_CN,
    ...lang.flights.zh_CN,
    ...lang.booking.zh_CN,
    ...lang.passengers.zh_CN,
    ...lang.components.zh_CN,
    ...lang.hotels.zh_CN,
    ...lang.trainChange.zh_CN,
}
export const en_US = {
    lang: 'EN',
    ...lang.home.en_US,
    ...lang.account.en_US,
    ...lang.travelapplicate.en_US,
    ...lang.common.en_US,
    ...lang.flights.en_US,
    ...lang.booking.en_US,
    ...lang.passengers.en_US,
    ...lang.components.en_US,
    ...lang.hotels.en_US,
    ...lang.trainChange.en_US,
}

@observer
class BaseComponent extends Component {
    @observable static locale = zh_CN;

    static getLocale = () => {
        return BaseComponent.locale;
    };

    static setLocale = (type) => {
        extendObservable(BaseComponent.locale, type);
        type.lang == "EN" ? moment.locale("en") : moment.locale("zh-cn")
    };

    //更改当前语言
    changeLocale = (type) => {
        let storage = global.storage;
        storage.save({
            key: 'localeLang',
            rawData: type.lang == 'EN' ? 'EN' : "CN"

        });
        extendObservable(BaseComponent.locale, type);
        type.lang == "EN" ? moment.locale("en") : moment.locale("zh-cn")
        this.props.navigator.immediatelyResetRouteStack([{
            component: index
        }]);

    }

    //英文字段替换原先的字段
    static replaceData = (res) => {
        for (var item in res) {
            BaseComponent.setEn(res, item);
            if (typeof res[item] == "object")
                BaseComponent.replaceData(res[item]);
        }
    }

    static setEn = (res, key) => {
        try {
            if (key.slice(key.length - 2) == "En" && (key.substring(0, key.length - 2) in res)) {
                res[key.substring(0, key.length - 2)] = res[key];
            }
        } catch (err) {
            console.log(err);
        }
    }

}

exports.BaseComponent = BaseComponent;