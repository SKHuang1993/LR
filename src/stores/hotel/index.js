import { extendObservable, action, computed, toJS, observable, runInAction } from 'mobx';
import { ListView, NativeModules } from 'react-native'
import { xServer } from '../../utils/yqfws'
import Enumerable from 'linq'
import pako from 'pako'
import base64 from 'base-64'
import moment from 'moment'
import { PolicyInfo, EmployeeInfo, AccountInfo } from '../../utils/data-access';
import deepDiffer from 'deepDiffer'
import { showCityList } from '../../components/city-list';
import { showCalendar } from '../../components/calendar';
import { BaseComponent, en_US, zh_CN } from '../../components/locale';

let lan = BaseComponent.getLocale();

export default class Index {
    constructor(props) {
        this.userInfo = props;
    }
    @observable request = {
        "StaffCode": AccountInfo.getUserInfo().EmpCode,
        "DistrictCode": null,
        "DistrictName": null,
        "Location": null,
        "CheckInDate": moment().add(1, "d").format("YYYY-MM-DD"),
        "CheckOutDate": moment().add(2, "d").format("YYYY-MM-DD"),
        "OfficeID": "21",
        "Adult": 1,
        "Children": 0,
        "ChildrenAge": [],
        "RoomCount": 1,
        "SearchTimeoutSeconds": 30,
        "CustomerUserAgent": ".NET Framework/4.0.30319.42000 (Microsoft Windows NT 6.2.9200.0) HotelServiceDemo/1.1.0.24",
        "CustomerIpAddress": null
    };
    @observable staffData = [];
    @observable records = [];
    @observable isPrivate = true;
    //目的地 
    setDistrict = () => {
        showCityList("hotel", (data) => {
            let val = data;
            this.request.DistrictCode = val.cityCode;
            this.request.DistrictName = val.cityName;
        })
    }

    //入住时间
    setCheckInDate = () => {
        showCalendar(null, null, true, (d1, d2) => {
            this.request.CheckInDate = d1;
            let checkInDate = moment(this.request.CheckInDate);
            let checkOutDate = moment(this.request.CheckOutDate);
            if (checkInDate.isSameOrAfter(checkOutDate))
                this.request.CheckOutDate = checkInDate.add(1, 'd').format("YYYY-MM-DD");
        })
    }


    //退房时间 
    setCheckOutDate = (date) => {
        showCalendar(moment(date).add(1, 'd').format("YYYY-MM-DD"), null, true, (d1, d2) => {
            this.request.CheckOutDate = d1;
        })
    }


    //相隔天数
    @computed get getDiffDays() {
        return moment(this.request.CheckOutDate).diff(moment(this.request.CheckInDate), "d");
    }

    //每条历史记录显示格式
    getHistoryItemText = (o) => {
        let d1 = moment(o.CheckInDate).format("M.D");
        let d2 = moment(o.CheckOutDate).format("M.D");
        return `${o.DistrictName} ${d1}-${d2}`;
    }

    //点击历史记录时替换当前搜索信息
    setCurrentHistory = (history, isPrivate) => {
        this.request = toJS(history);
        if (isPrivate != null)
            this.isPrivate = isPrivate;
    }

    //获取搜索记录
    getHistory = (isPrivate) => {
        storage.load({ key: 'hotelQuery' }).then(val => {
            if (val != null) {
                runInAction(() => {
                    this.request = val[0];
                    this.records = val;
                    if (isPrivate != null)
                        this.isPrivate = isPrivate;
                })
            }
        }).catch(err => {
            if (isPrivate != null)
                this.isPrivate = isPrivate;
        });

    }

    //保存搜索记录
    saveHistory = () => {
        let storage = global.storage;
        let obj = toJS(this.request);
        storage.load({ key: 'hotelQuery' }).then(val => {
            if (val != null) {
                //存在相同记录不进行保存
                let isExits = Enumerable.from(val).firstOrDefault(a => !deepDiffer(a, obj), -1);
                if (isExits != -1)
                    return;
                //最多保存10条记录
                val.length > 10 ? val.splice(10, val.length - 10) : val.splice(0, 0, obj);
                this.records = val;
                storage.save({
                    key: 'hotelQuery',
                    rawData: val
                });
            }
        }).catch(err => {
            storage.save({
                key: 'hotelQuery',
                rawData: [obj]
            });
            this.records.push(obj);
        });
    }

    //清空搜索记录
    clearHistory = () => {
        let storage = global.storage;
        storage.remove({
            key: 'hotelQuery'
        });
        this.records.clear();
    }
}