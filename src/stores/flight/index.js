import { extendObservable, action, computed, toJS, observable, runInAction } from 'mobx';
import { Alert, NativeModules, Platform } from 'react-native'
import Enumerable from 'linq'
import deepDiffer from 'deepDiffer'
import moment from 'moment'
import { CabinInfo, EmployeeInfo, PolicyInfo, DepartmentInfo, PassengerInfo } from '../../utils/data-access/'

import { BaseComponent, en_US, zh_CN } from '../../components/locale';
import { showCityList } from '../../components/city-list';
import { showCalendar } from '../../components/calendar';
let lan = BaseComponent.getLocale();

class SearchAirRequest {
    //搜索历史
    @observable forMyself = false;
    @observable records = [];
    @observable staffData = [];
    @observable request = {
        tripType: 1,//0.单程 1.往返程 2.多航段
        ticketType: 0,//0.国内 1.国际 2.港澳 3.台湾
        adultQty: 1,
        childQty: 0,
        isPrivate: true,
        berthType: 'Y',
        departures: [],
        departureDates: [moment().add(20, 'd').format("YYYY-MM-DD"), moment().add(25, 'd').format("YYYY-MM-DD")],
        arrivals: [],
        officeIds: [this.userInfo.CorpCode],
        clientCode: null,
    }

    //日期 
    //type == 0 去程，type == 1 回程
    setDepartureDates = (position, type) => {
        let defaultDate;
        let disableArrDate = true;//是否禁止选择回程日期
        let departureDates = this.request.departureDates;//去程日期初始值
        if (type == 0) {
            if (this.request.tripType == 1)
                disableArrDate = false;
            if (this.request.tripType == 2 && position > 0)
                defaultDate = departureDates[position - 1];
        } else {
            disableArrDate = true;
            defaultDate = departureDates[position];
        }

        showCalendar(defaultDate, null, disableArrDate, (d1, d2) => {
            if (type == 0) {
                departureDates[position] = d1;
                if (d2 != null)
                    departureDates[position + 1] = d2;
            } else {
                departureDates[position + 1] = d1;
            }
            this.resetDate(this.request, position);
        })

    }


    //目的地 
    //type == 0 去程，type == 1 回程
    setDepartures = (position, type) => {
        showCityList("flight", (data) => {
            let val = data;
            if (type == 0) {
                this.request.departures.splice(position, 1, val);
            } else {
                this.request.arrivals.splice(position, 1, val);
                if (position < this.request.departures.length - 1)
                    this.request.departures.splice(position + 1, 1, val);
            }
            this.getTicketType(this.request);
        })
    }

    //如果回程小于去程日期，自动将日期加5天
    resetDate = (obj, position) => {
        let departureDates = obj.departureDates;
        for (var i = position; i < departureDates.length - 1; i++) {
            let d1 = moment(departureDates[i]);
            let d2 = moment(departureDates[i + 1]);
            if (d1.isAfter(d2))
                departureDates[i + 1] = d1.add(5, 'd').format("YYYY-MM-DD");

        }
    }

    //航节数
    @computed get getLegs() {
        if (this.request.tripType == 2)
            return this.request.departures.length == 0 ? this.request.departureDates.slice(0, 1) : this.request.departures;
        else
            return this.request.departureDates.slice(0, 1);
    }


    //转化为机票接口提交参数
    dataTransfer = () => {
        let obj = toJS(this.request);
        if (this.request.tripType == 0) {
            obj.departureDates = obj.departureDates.slice(0, 1);
            obj.departures = obj.departures.slice(0, 1);
            obj.arrivals = obj.arrivals.slice(0, 1);
        } else if (this.request.tripType == 1) {
            obj.departureDates = obj.departureDates.slice(0, 2);
            obj.departures = [obj.departures[0], obj.arrivals[0]];
            obj.arrivals = [obj.arrivals[0], obj.departures[0]];
        } else {
            obj.departureDates = obj.departureDates.slice(0, this.request.departures.length);
        }
        obj.resetDate = this.resetDate;
        if (this.staffData && this.staffData.length > 0) {
            obj.clientCode = this.staffData[0].PersonCode;
        }
        if (this.request.isPrivate) obj.clientCode = this.userInfo.EmpCode;
        obj.officeIds = [21];
        if (lan.lang != "ZH") {
            Enumerable.from(obj.departures).doAction(o => o.cityName = o.cityCode).toArray();
            Enumerable.from(obj.arrivals).doAction(o => o.cityName = o.cityCode).toArray();
        }
        return obj;
    }

    //验证是否满足查询条件
    validate = () => {
        let count = this.request.tripType == 2 ? this.request.departures.length : 1;
        if (this.request.departures.length == 0)
            count = 1;
        for (var i = 0; i < count; i++) {
            if (this.request.departures.length <= i) {
                Alert.alert(lan.flights_please_select_departure);
                return false;
            } else if (this.request.arrivals.length <= i) {
                Alert.alert(lan.flights_please_select_arrival);
                return false;
            } else if (moment(this.request.departureDates[i])
                .isBefore(moment(moment().format('YYYY-MM-DD')))) {
                Alert.alert(lan.flights_DepartureTimeLtNowTime);
                return false;
            } else if (i < this.request.departures.length && i < this.request.arrivals.length
                && this.request.departures[i].cityCode == this.request.arrivals[i].cityCode) {
                Alert.alert(lan.flights_cityNotTheSame);
                return false;
            }
        }
        return true;
    }

    //添加航段
    addLeg = () => {
        if (this.validate()) {
            let position = this.request.departures.length - 1;
            let d1 = moment(this.request.departureDates[this.request.departureDates.length - 1]);
            this.request.departureDates.push(d1.add(5, 'd').format("YYYY-MM-DD"));
            this.request.departures.push(this.request.arrivals[position]);
        }
    }

    //移除航段
    removeLeg = (position) => {
        if (this.request.departureDates.length > 2)
            this.request.departureDates.splice(position, 1);
        this.request.departures.splice(position, 1);
        this.request.arrivals.splice(position, 1);
    }

    //判断国内或国际航线
    getTicketType = (obj) => {
        let isDomestic_Departures = Enumerable.from(obj.departures)
            .count("$.isDomestic == true") == obj.departures.length;
        let isDomestic_Arrivals = Enumerable.from(obj.arrivals)
            .count("$.isDomestic == true") == obj.arrivals.length;
        if (isDomestic_Departures && isDomestic_Arrivals)
            obj.ticketType = 0;
        else
            obj.ticketType = 1;
        return obj.ticketType;
    }

    //每条历史记录显示格式
    getHistoryItemText = (o) => {
        let d1 = moment(o.departureDates[0]).format("M.D");
        let d2 = moment(o.departureDates[o.departureDates.length - 1]).format("M.D");
        let tripTypeName = lan.flights_tabbar_oneway;
        if (lan.lang == "ZH") {
            if (o.tripType == 1)
                tripTypeName = lan.flights_tabbar_roundtrip;
            else if (o.tripType == 2) {
                let destinations = [];
                for (let i = 0; i < o.departures.length; i++) {
                    if (o.departures[i].cityName != destinations[destinations.length - 1])
                        destinations.push(o.departures[i].cityName);
                    if (o.arrivals[i].cityName != destinations[destinations.length - 1])
                        destinations.push(o.arrivals[i].cityName);
                }
                return `${lan.flights_tabbar_multitrip} ${destinations.join('-')} ${d1}-${d2}`
            }
            return `${tripTypeName} ${o.departures[0].cityName}-${o.arrivals[0].cityName} ${d1}-${d2}`;
        } else {
            if (o.tripType == 1)
                tripTypeName = lan.flights_tabbar_roundtrip;
            else if (o.tripType == 2) {
                let destinations = [];
                for (let i = 0; i < o.departures.length; i++) {
                    if (o.departures[i].cityCode != destinations[destinations.length - 1])
                        destinations.push(o.departures[i].cityCode);
                    if (o.arrivals[i].cityCode != destinations[destinations.length - 1])
                        destinations.push(o.arrivals[i].cityCode);
                }
                return `${lan.flights_tabbar_multitrip} ${destinations.join('-')} ${d1}-${d2}`
            }
            return `${tripTypeName} ${o.departures[0].cityCode}-${o.arrivals[0].cityCode} ${d1}-${d2}`;
        }
    }

    //点击历史记录时替换当前搜索信息
    setCurrentHistory = (history, isPrivate) => {
        this.request = toJS(history);
        if (isPrivate != null)
            this.request.isPrivate = isPrivate;
    }

    //获取搜索记录
    getHistory = (isPrivate) => {
        storage.load({ key: 'searchHistory' }).then(val => {
            if (val != null) {
                runInAction(() => {
                    this.request = val[0];
                    this.records = val;
                    if (isPrivate != null)
                        this.request.isPrivate = isPrivate;
                })
            }
        }).catch(err => {
            if (isPrivate != null)
                this.request.isPrivate = isPrivate;
        });

    }

    //保存搜索记录
    saveHistory = () => {
        let storage = global.storage;
        let obj = JSON.parse(JSON.stringify(this.request));
        if (obj.tripType != 2) {
            obj.departureDates = obj.departureDates.slice(0, 2);
            obj.departures = [obj.departures[0], obj.arrivals[0]];
            obj.arrivals = [obj.arrivals[0], obj.departures[0]];
        }
        obj.berthType = "Y";
        obj.isPrivate = true;
        storage.load({ key: 'searchHistory' }).then(val => {
            if (val != null) {
                //存在相同记录不进行保存
                let isExits = Enumerable.from(val).firstOrDefault(a => !deepDiffer(a, obj), -1);
                if (isExits != -1)
                    return;
                //最多保存10条记录
                val.length > 10 ? val.splice(10, val.length - 10) : val.splice(0, 0, obj);
                this.records = val;
                storage.save({
                    key: 'searchHistory',
                    rawData: val
                });
            }
        }).catch(err => {
            storage.save({
                key: 'searchHistory',
                rawData: [obj]
            });
            this.records.push(obj);
        });
    }
    //清空搜索记录
    clearHistory = () => {
        let storage = global.storage;
        storage.remove({
            key: 'searchHistory'
        });
        this.records.clear();
    }

    //获取当前登录用户的员工信息(为自己预订)
    getEmployeeByMyself = async () => {
        try {
            let param = {
                "PersonCode": this.userInfo.EmpCode,
                "CostCenterID": null,
                "PageSize": 20,
                "PageCount": 1
            }
            let result = await EmployeeInfo.getList(param);
            let employeeInfos = result.Result.EmployeeInfos;
            if (employeeInfos.length > 0) {
                let index = this.staffData.findIndex(o => o.PersonCode == this.userInfo.EmpCode);
                if (index != -1) {
                    let employeeInfo = employeeInfos[0];
                    employeeInfo.checked = true;
                    this.staffData[index] = employeeInfo;
                }
            }
        } catch (err) {
            this.getEmployeeByMyself();
        }
    }

    //根据旅客代码获取旅客详情
    getMobilePassengerByCode = async (PersonCode) => {
        try {
            let param = {
                "PersonCode": PersonCode
            }
            let result = await PassengerInfo.getMobilePassengerByCode(param);
            let passenger = result.Result.Passenger;
            if (passenger) {
                let index = this.staffData.findIndex(o => o.PersonCode == PersonCode);
                if (index != -1) {
                    passenger.checked = true;
                    this.staffData[index] = passenger;
                }
            }
        } catch (err) {
            this.getMobilePassengerByCode(PersonCode);
        }
    }

    initCondition = (order) => {
        let flight = order.Trade.Orders[0].Ticket.Segments[0].Flights[0];
        let obj = {
            "tripType": 0,
            "ticketType": 0,
            "adultQty": 1,
            "childQty": 0,
            "isPrivate": false,
            "berthType": "Y",
            "departures": [
                {
                    "cityCode": flight.DepartureAirport.CityCode,
                    "cityName": flight.DepartureAirport.CityName,
                    "isDomestic": true
                },
            ],
            "departureDates": [
                moment(flight.DepartureTime).format("YYYY-MM-DD"),
            ],
            "arrivals": [
                {
                    "cityCode": flight.ArrivalAirport.CityCode,
                    "cityName": flight.ArrivalAirport.CityName,
                    "isDomestic": true
                },
            ],
            "officeIds": [
                this.userInfo.CorpCode
            ],
            "clientCode": this.userInfo.EmpCode
        }
        if (this.staffData && this.staffData.length > 0) {
            obj.clientCode = this.staffData[0].PersonCode;
        }
        return obj;
    }

}

export default SearchAirRequest;