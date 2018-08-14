import { extendObservable, action, computed, toJS, observable, runInAction } from 'mobx';
import { ListView, NativeModules, Alert } from 'react-native'
import { RestAPI } from '../../utils/yqfws'
import Enumerable from 'linq'
import pako from 'pako'
import base64 from 'base-64'
import moment from 'moment'
import { PolicyInfo, EmployeeInfo, AccountInfo } from '../../utils/data-access';
import deepDiffer from 'deepDiffer'
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
import { showCalendar } from '../../components/calendar';
let lan = BaseComponent.getLocale();

export default class List {
    constructor(props) {
        this.props = props;
        this.request = observable(props.param);
        this.initData.Filter.Keywords.HotelName = props.keyWords;
        this.keyWords = props.keyWords;
        this.flightCondition = [];
        extendObservable(this, {
            isLowToHight: true,
            isEarlyToLate: false,
        });
        //console.log(toJS(this.request));
    }
    initData = {
        "AsyncId": null,
        "PageNo": 0,
        "PageSize": 20,
        "Filter": {
            "Keywords": {
                "HotelName": null
            },
        },
        "Sorter": {},
        "CustomerUserAgent": ".NET Framework/4.0.30319.42000 (Microsoft Windows NT 6.2.9200.0) HotelServiceDemo/1.1.0.24",
        "CustomerIpAddress": null
    };
    @observable policy = "正在获取差旅政策";
    @observable request;
    @observable data = [];
    @observable filterData = [];
    @observable isLoading = true;
    @observable isCompleted = false;
    @observable keyWords = null;
    //获取火车列表
    getTrainList = async () => {
        try {
            this.data.clear();
            this.filterData.clear();
            this.isLoading = true;
            let obj = this.request;
            let param = {
                "travel_time": obj.departureDates[0],
                "from_station": obj.departures[0].cityName,
                "arrive_station": obj.arrivals[0].cityName
            }
            let result = await RestAPI.execute("Train.QueryLeftTicket", param);
            this.isLoading = false;
            if (result.Result.train_data) {
                this.data = result.Result.train_data;
                this.filterData = toJS(this.data);
            } else {
                this.getTrainList();
            }
            return result;
        } catch (err) {
            console.log(err);
        }
    }


    //根据时间排序
    orderByDepartureDate = () => {
        let filterData = [];
        if (!this.isEarlyToLate)
            filterData = Enumerable.from(this.filterData.slice()).orderBy('$.from_time')
                .toArray();
        else
            filterData = Enumerable.from(this.filterData.slice()).orderByDescending('$.from_time')
                .toArray();
        this.isEarlyToLate = !this.isEarlyToLate;

        setTimeout(() => {
            this.filterData = filterData;
        }, 0);
    }

    //根据价格排序
    orderByPrice = () => {
        let filterData = [];
        if (!this.isLowToHight)
            filterData = Enumerable.from(this.filterData.slice()).orderBy('$.wz')
                .toArray();
        else
            filterData = Enumerable.from(this.filterData.slice()).orderByDescending('$.wz')
                .toArray();
        this.isLowToHight = !this.isLowToHight;

        setTimeout(() => {
            this.filterData = filterData;
        }, 0);
    }

    addDays = (days) => {
        this.request.departureDates[0] = moment(this.request.departureDates[0]).add(days, 'd')
            .format("YYYY-MM-DD");
        this.flightCondition = [];
        this.getTrainList();
    }

    removeDays = (days) => {
        this.request.departureDates[0] = moment(this.request.departureDates[0]).subtract(days, 'd')
            .format("YYYY-MM-DD");
        this.flightCondition = [];
        this.getTrainList();
    }

    changeDate = () => {
        showCalendar(null, moment().add(31, 'd').format("YYYY-MM-DD"), true, (d1, d2) => {
            this.request.departureDates[0] = d1;
            this.flightCondition = [];
            this.getTrainList();
        })
    }

    setDomesticFlight = (obj) => {
        this.domesticFlight = observable(obj);
    }

    //根据索引获取航节
    getLegOfNum = (o, i) => {
        let obj = JSON.parse(JSON.stringify(o));
        obj.departureDates = obj.departureDates.slice(i, i + 1);
        obj.departures = obj.departures.slice(i, i + 1);
        obj.arrivals = obj.arrivals.slice(i, i + 1);
        return obj;
    }

    //日期更改时再次执行机票查询
    setDepartureDate = (date) => {
        this.flightCondition = [];
        this.isFinish = false;
        this.passProps.param.departureDates[this.passProps.sequence] = date;
        //如果回程小于去程日期，自动将日期加5天
        this.passProps.param.resetDate(this.passProps.param, this.passProps.sequence);
        this.domesticFlight.departureDates[0] = date;
        this.searchFlight();
    }

    getLegTitle = () => {
        let o = this.domesticFlight;
        let tip = this.getLegTip(this.passProps.sequence);
        return `${o.departures[0].cityName} - ${o.arrivals[0].cityName}(${tip})`;
    }

    getLegTip = (position) => {
        let tip = lan.flights_trip;
        if (position == 1)
            tip = lan.flights_returnTrip;
        if (this.passProps.param.tripType == 2) {
            tip = lan.lang == 'EN' ? `${position + 1}leg` : `第${position + 1}程`;
        }
        return tip;
    }

    //初始化筛选条件
    getFlightCondition = () => {
        if (this.flightCondition.length > 0)
            return this.flightCondition;
        //起抵时间
        let time = {
            value: '1',
            label: lan.flights_filter_departureArrivalTime,
            children: [
                {
                    id: 1,
                    label: lan.flights_filter_unlimited,
                    subtitle: lan.flights_filter_departureTime,
                    checked: true,
                    all: true,
                },
                {
                    parentid: 1,
                    label: `${lan.flights_filter_morning}（06:00-12:00）`,
                    value: ['06:00', '12:00'],
                    checked: false,

                },
                {
                    parentid: 1,
                    label: `${lan.flights_filter_afternoon}（12:00-18:00）`,
                    value: ['12:00', '18:00'],
                    checked: false,

                },
                {
                    parentid: 1,
                    label: `${lan.flights_filter_night}（18:00-24:00）`,
                    value: ['18:00', '24:00'],
                    checked: false,
                },
                {
                    parentid: 1,
                    label: `${lan.flights_filter_beforeDawn}（00:00-06:00）`,
                    value: ['00:00', '06:00'],
                    checked: false,
                },
            ]
        };
        time.children.push({
            id: 2,
            label: lan.flights_filter_unlimited,
            checked: true,
            subtitle: lan.flights_filter_arrivalTime,
            all: true,
        });
        for (let item of time.children.slice(1, 5)) {
            let _item = Object.assign({}, item);
            _item.parentid = 2;
            time.children.push(_item);
        }
        //车次类型
        let type = {
            value: 2,
            label: "车次类型",
            children: [
                {
                    id: 1,
                    label: lan.flights_filter_unlimited,
                    checked: true,
                    all: true,
                },
                {
                    parentid: 1,
                    label: `高铁(G,C)`,
                    value: ['G', 'C'],
                    checked: false,

                },
                {
                    parentid: 1,
                    label: `动车(D)`,
                    value: ['D'],
                    checked: false,

                },
                {
                    parentid: 1,
                    label: `普通Z/K/T`,
                    value: ['Z', 'K', 'T'],
                    checked: false,
                },
                {
                    parentid: 1,
                    label: `其他(L/Y)等`,
                    value: ['L', 'Y'],
                    checked: false,
                },
            ]
        };
        //出发站/到达站
        let station = {
            value: 3, label: '起抵车站', children: [{
                id: 1,
                label: lan.flights_filter_unlimited,
                checked: true,
                subtitle: "出发站",
                all: true,
            }]
        };
        station.children = station.children.concat(Enumerable.from(this.filterData).distinct("$.from_station")
            .select(
            "{label: $.from_station,parentid:1, value: $.from_station, checked: false}"
            ).toArray());

        let arrStation = {
            children: [{
                id: 2,
                label: lan.flights_filter_unlimited,
                checked: true,
                subtitle: '到达站',
                all: true,
            }]
        };
        arrStation.children = arrStation.children.concat(Enumerable.from(this.filterData).distinct("$.arrive_station")
            .select(
            "{label: $.arrive_station, parentid:2,value: $.arrive_station, checked: false}"
            ).toArray());
        station.children = station.children.concat(arrStation.children);
        return [time, type, station];
    }

    execSifteData = (data) => {
        //筛选起抵时间
        let sifteData = this.screeningData(this.data, data[0].children, (groupIndex, o1, o2) => {
            if (groupIndex == 0)
                return o1.value[0] <= o2.from_time && o1.value[1] >= o2.from_time;
            else
                return o1.value[0] <= o2.arrive_time && o1.value[1] >= o2.arrive_time;
        });
        //筛选车次类型
        sifteData = this.screeningData(sifteData, data[1].children, (groupIndex, o1, o2) => {
            return Enumerable.from(o1.value).any(o => o == o2.train_code.substr(0, 1));
        });
        //筛选车站
        sifteData = this.screeningData(sifteData, data[2].children, (groupIndex, o1, o2) => {
            if (groupIndex == 0)
                return o1.value == o2.from_station;
            else
                return o1.value == o2.arrive_station;
        });

        setTimeout(() => {
            this.filterData = sifteData;
        }, 0);
    }

    screeningData = (flights, data, comparetor) => {
        let group = Enumerable.from(data).where(o => o.id != null).toArray();
        let sifteData = flights;
        for (var i = 0; i < group.length; i++) {
            if (group[i].checked)
                continue;
            sifteData = Enumerable.from(sifteData).where(o => Enumerable.from(data).where(b =>
                b.id == null && b.parentid == group[i].id && b.checked && comparetor(i, b, o)
            ).count() > 0).toArray();
        }
        return sifteData;
    }

    //航班价格前后多少分钟内是否存在最低航班
    getTimeLowTicket = (airSummary, minutes) => {
        let startTime = moment(airSummary.DepartureDate).subtract(minutes, "m");
        let endDate = moment(airSummary.DepartureDate).add(minutes, "m");
        let result = Enumerable.from(this.flights).where(o => moment(o.DepartureDate).isBetween(startTime, endDate, null, '[]')).toArray();
        let flights = [];
        for (let item of result) {
            let cabins = Enumerable.from(item.BerthList).where(o => o.Price < airSummary.selectedCabin.Price).toArray();
            for (let cabin of cabins) {
                item.selectedCabin = cabin;
                flights.push(Object.assign({}, item, cabin));
            }
        }
        if (flights.length > 0) {
            let minPrice = Enumerable.from(flights).min(o => o.Price);
            flights = Enumerable.from(flights).where(o => o.Price === minPrice).toArray();
        }
        return flights;
    }

    //获取差旅政策
    getPolicy = async (employee) => {
        let policyID = employee.PolicyID;
        if (!policyID || policyID == 53) {
            this.policy = lan.noBusinessTripPolicy;
            return;
        }
        let param = {
            "PolicyID": policyID
        }
        let result = await PolicyInfo.getPolicy(param);
        result = result.Result;
        let policy = result.PolicyDetail.PolicyContent.PolicyDomestic;
        employee.PolicyContent = policy;
        this.policy = PolicyInfo.getPolicyDetail(0, policy).join("；");
    }

    //随机获取在线旅行顾问
    getOnlineStaffProfileGet = async () => {
        let param = {
            "UserCount": 2,
            "BizCommissionerCompanyCode": this.userInfo.CorpCode
        };
        let result = await EmployeeInfo.getOnlineStaffProfileGet(param);
        this.staffContacts = result.Result.StaffContacts;
    }

    //获取当前航段日期
    @computed get getDate() {
        return moment(this.request.departureDates[0]).format("YYYY.MM.DD");
    }

    @computed get getWeekDay() {
        return moment(this.request.departureDates[0]).format("ddd");
    }

    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.filterData.slice());
    }
}