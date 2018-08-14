import Enumerable from 'linq'
import { BaseComponent, en_US, zh_CN } from '../../components/locale';

let lan = BaseComponent.getLocale();

export class CabinInfo {
    //舱位等级列表
    static getCabinList = () => {
        return [{
            "value": "Y",
            "label": lan.economyClass,
        },
        {
            "value": "P",
            "label": lan.highEeconomyClass,
        },
        {
            "value": "C",
            "label": lan.businessClass,
        },
        {
            "value": "F",
            "label": lan.firstClass,
        },
        ]
    }

    //根据舱位代码获取舱位等级
    static getCabinName = (cabin) => {
        let list = CabinInfo.getCabinList();
        return Enumerable.from(list).first((o) => o.value === cabin).label;
    }

}