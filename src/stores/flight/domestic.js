import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { ListView, NativeModules } from 'react-native'
import { xServer } from '../../utils/yqfws'
import Enumerable from 'linq'
import pako from 'pako'
import base64 from 'base-64'
import moment from 'moment'
import { PolicyInfo, EmployeeInfo } from '../../utils/data-access';
import { showCalendar } from '../../components/calendar';
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
let lan = BaseComponent.getLocale();

class DomesticFlight {
    @observable policy = lan.loading;
    @observable staffContacts = [];
    constructor(props) {
        this.passProps = props;
        this.flights = [];//航班数据
        this.breachPolicy = [];//违背差旅政策数据
        this.flightCondition = [];//筛选条件数据
        extendObservable(this, {
            filterData: [],
            isFinish: false,
            isLowToHight: true,
            isEarlyToLate: false,
        });
    }

    //调用机票查询接口
    searchFlight = () => {
        //获取jobID
        this.startTime = new Date();
        xServer.invoke('TicketAir.Shopping.searchFlight', JSON.stringify(this.domesticFlight), (jobID) => {
            this.flights = [];
            this.exec(jobID);
        }, (err) => { this.isFinish = true });
    }

    //间隔1秒获取一次机票数据
    exec = (jobID) => {
        setTimeout(() => {
            xServer.invoke('TicketAir.DomesticAir.getDomesticAir', jobID, (value) => {
                //gzip字符串解压
                try {
                    let result = pako.ungzip(base64.decode(value), { to: 'string' });
                    result = JSON.parse(result);
                    this.isFinish = result.isFinish;
                    if (result.airSummary != null) {
                        this.flights = this.flights.slice().concat(result.airSummary);
                        if (this.passProps.param.isPrivate == true) {
                            Enumerable.from(this.flights).doAction(o => Enumerable.from(o.BerthList).
                                doAction(o => { o.BreachPolicy = null; o.IsConformPolicy = true }).toArray()).toArray();
                        }
                        //筛选舱位
                        for (let item of this.flights) {
                            item.BerthList = Enumerable.from(item.BerthList).where(o => o.Cabin == this.passProps.param.berthType).toArray();
                        }
                        this.flights = Enumerable.from(this.flights).where(o => o.BerthList.length > 0).toArray();
                        if (this.passProps.toChange) {
                            //1）只显示同原行程一样航司的航班；2）只显示等于或者高于原行程航班的舱位；
                            this.flights = this.flights.filter(o => o.MarketingAirline == this.orderDetail.Trade.Orders[0].Ticket.Segments[0].Flights[0].MarketingAirline.Code);
                            for (let item of this.flights) {
                                item.BerthList = Enumerable.from(item.BerthList).where(o => o.Price >= this.orderDetail.Trade.Orders[0].Ticket.Expenses[0].TicketPrice).toArray();
                            }
                            this.flights = Enumerable.from(this.flights).where(o => o.BerthList.length > 0).toArray();
                        }
                    }
                    if (result.policy != null) {
                        this.breachPolicy = this.breachPolicy.slice().concat(result.policy);
                    }
                    this.filterData.clear();
                    for (let item of this.flights)
                        item._berthList = [];
                    this.filterData = this.flights.slice();
                    //超过30s结束查询
                    if (new Date() - this.startTime > 30000) {
                        this.isFinish = true;
                        return;
                    }
                    if (!result.isFinish)
                        this.exec(jobID);
                    // else {
                    //     let arrival = this.passProps.param.arrivals[this.passProps.sequence];
                    //     let conditions = this.getFlightCondition();
                    //     let t = conditions[1].children.find(o => o.value == arrival.airportCode);
                    //     if (t) {
                    //         Enumerable.from(conditions[1].children).where(o => o.id == 2).doAction(o => o.checked = false).toArray();
                    //         t.checked = true;
                    //     }
                    //     this.flightCondition = conditions;
                    //     this.execSifteData(conditions);
                    // }
                } catch (err) {
                    this.isFinish = true;
                }
            }, (err) => { this.isFinish = true });
        }, 1000);
    }

    //根据起飞时间排序
    orderByDepartureDate = () => {
        let filterData = [];
        if (!this.isEarlyToLate)
            filterData = Enumerable.from(this.filterData.slice()).orderBy('$.DepartureDate')
                .thenBy('$.Price').toArray();
        else
            filterData = Enumerable.from(this.filterData.slice()).orderByDescending('$.DepartureDate')
                .thenBy('$.Price').toArray();
        this.isEarlyToLate = !this.isEarlyToLate;

        setTimeout(() => {
            this.filterData.clear();
            this.filterData = filterData;
        }, 0);
    }

    //根据价格排序
    orderByPrice = () => {
        let filterData = [];
        if (!this.isLowToHight)
            filterData = Enumerable.from(this.filterData.slice()).orderBy('$.Price')
                .thenBy('$.DepartureDate').toArray();
        else
            filterData = Enumerable.from(this.filterData.slice()).orderByDescending('$.Price')
                .thenBy('$.DepartureDate').toArray();
        this.isLowToHight = !this.isLowToHight;

        setTimeout(() => {
            this.filterData.clear();
            this.filterData = filterData;
        }, 0);
    }

    //直飞优先
    directFlight = () => {
        let filterData = [];
        let direct = Enumerable.from(this.filterData.slice()).where(o => o.Segment.ClassAvail.length == 1).orderBy('$.Price').toArray();
        let transfer = Enumerable.from(this.filterData.slice()).where(o => o.Segment.ClassAvail.length > 1).orderBy('$.Price').toArray();
        filterData = direct.concat(transfer);

        setTimeout(() => {
            this.filterData.clear();
            this.filterData = filterData;
        }, 0);
    }

    addDays = (days) => {
        this.setDepartureDate(moment(this.domesticFlight.departureDates[0]).add(days, 'd')
            .format("YYYY-MM-DD"));
    }

    removeDays = (days) => {
        this.setDepartureDate(moment(this.domesticFlight.departureDates[0]).subtract(days, 'd')
            .format("YYYY-MM-DD"));
    }

    changeDate = () => {
        let date = moment().format("YYYY-MM-DD")
        if (this.passProps.sequence != 0)
            date = moment(this.passProps.param.departureDates[this.passProps.sequence - 1])
                .format("YYYY-MM-DD");
        showCalendar(date, null, true, (d1, d2) => {
            this.setDepartureDate(d1);
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
        //机场
        let airport = {
            value: 2, label: lan.flights_filter_airPort, children: [{
                id: 1,
                label: lan.flights_filter_unlimited,
                checked: true,
                subtitle: lan.flights_filter_arrivalAirport,
                all: true,
            }]
        };
        airport.children = lan.lang == 'EN' ? airport.children.concat(Enumerable.from(this.filterData).distinct("$.Departure.airportCode")
            .select(
            "{label: $.Departure.airportCode,parentid:1, value: $.Departure.airportCode, checked: false}"
            ).toArray()) : airport.children.concat(Enumerable.from(this.filterData).distinct("$.Departure.airportCode")
                .select(
                "{label: $.Departure.airportNameCn,parentid:1, value: $.Departure.airportCode, checked: false}"
                ).toArray());

        let arrAirport = {
            children: [{
                id: 2,
                label: lan.flights_filter_unlimited,
                checked: true,
                subtitle: lan.flights_filter_arrivalAirport,
                all: true,
            }]
        };
        arrAirport.children = lan.lang == 'EN' ? arrAirport.children.concat(Enumerable.from(this.filterData).distinct("$.Arrival.airportCode")
            .select(
            "{label: $.Arrival.airportCode, parentid:2,value: $.Arrival.airportCode, checked: false}"
            ).toArray()) : arrAirport.children.concat(Enumerable.from(this.filterData).distinct("$.Arrival.airportCode")
                .select(
                "{label: $.Arrival.airportNameCn, parentid:2,value: $.Arrival.airportCode, checked: false}"
                ).toArray());
        airport.children = airport.children.concat(arrAirport.children);

        //转机
        let transfer = {
            value: 3, label: lan.flights_filter_turn, children: [{
                id: 1,
                label: lan.flights_filter_unlimited,
                checked: true,
                all: true,
            }]
        };
        transfer.children = lan.lang == 'EN' ? transfer.children.concat(Enumerable.from(this.filterData).distinct("$.Segment.ClassAvail.length")
            .select(
            "{label: $.Segment.ClassAvail.length == 1? 'non-Stops' :''+($.Segment.ClassAvail.length - 1)+'stop', parentid:1 ,value: $.Segment.ClassAvail.length, checked: false}"
            ).toArray()) : transfer.children.concat(Enumerable.from(this.filterData).distinct("$.Segment.ClassAvail.length")
                .select(
                "{label: $.Segment.ClassAvail.length == 1? '直飞':'中转'+($.Segment.ClassAvail.length - 1)+'次', parentid:1 ,value: $.Segment.ClassAvail.length, checked: false}"
                ).toArray());
        //航空公司
        let airline = {
            value: 4, label: lan.flights_filter_airlineCompany, children: [{
                id: 1,
                label: lan.flights_filter_unlimited,
                checked: true,
                all: true,
            }]
        };
        airline.children = lan.lang == 'EN' ? airline.children.concat(Enumerable.from(this.filterData).distinct("$.MarketingAirline")
            .select("{label: $.MarketingAirline,parentid:1,value: $.MarketingAirline,icon:'http://airlineico.b0.upaiyun.com/'+$.MarketingAirline+'.png', checked: false}")
            .toArray()) : airline.children.concat(Enumerable.from(this.filterData).distinct("$.MarketingAirline")
                .select("{label: $.MarketingAirlineName,parentid:1,value: $.MarketingAirline,icon:'http://airlineico.b0.upaiyun.com/'+$.MarketingAirline+'.png', checked: false}")
                .toArray());
        return [time, airport, transfer, airline];
    }

    execSifteData = (data) => {
        //筛选起抵时间
        let sifteData = this.screeningData(this.flights, data[0].children, (groupIndex, o1, o2) => {
            if (groupIndex == 0)
                return o1.value[0] <= o2.DepartureDate.substring(11, 16) && o1.value[1] >= o2.DepartureDate.substring(11, 16);
            else
                return o1.value[0] <= o2.ArrivalDate.substring(11, 16) && o1.value[1] >= o2.ArrivalDate.substring(11, 16);
        });
        //筛选机场
        sifteData = this.screeningData(sifteData, data[1].children, (groupIndex, o1, o2) => {
            if (groupIndex == 0)
                return o1.value == o2.Departure.airportCode;
            else
                return o1.value == o2.Arrival.airportCode;
        });
        //筛选转机
        sifteData = this.screeningData(sifteData, data[2].children, (groupIndex, o1, o2) => {
            return o1.value == o2.Segment.ClassAvail.length;
        });
        //筛选航司
        sifteData = this.screeningData(sifteData, data[3].children, (groupIndex, o1, o2) => {
            return o1.value == o2.MarketingAirline;
        });

        setTimeout(() => {
            this.filterData.clear();
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
        return moment(this.domesticFlight.departureDates[0]).format("YYYY.MM.DD");
    }

    @computed get getWeekDay() {
        return moment(this.domesticFlight.departureDates[0]).format("ddd");
    }

    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.filterData.slice());
    }


}

export default DomesticFlight;