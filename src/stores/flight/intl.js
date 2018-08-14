import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { ListView, NativeModules } from 'react-native'
import { xServer, RestAPI } from '../../utils/yqfws'
import Enumerable from 'linq'
import pako from 'pako'
import base64 from 'base-64'
import moment from 'moment'
import { PolicyInfo, EmployeeInfo } from '../../utils/data-access';
//import {LanguageType} from '../utils/languageType';
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
let lan = BaseComponent.getLocale();

class IntlFlight {
    @observable policy = lan.loading;
    @observable indicatorMessage = lan.loading;
    constructor(props) {
        this.passProps = props;
        this.flights = [];//航班数据
        this.breachPolicy = [];//违背差旅政策数据
        this.flightCondition = [];//筛选条件数据
        extendObservable(this, {
            includingTax: false,
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
        xServer.invoke('TicketAir.Shopping.searchFlight', JSON.stringify(this.passProps.param), (jobID) => {
            this.flights = [];
            this.exec(jobID);
        }, (err) => { this.isFinish = true });
    }

    //间隔1秒获取一次机票数据
    exec = (jobID) => {
        setTimeout(() => {
            xServer.invoke('TicketAir.InterAir.getInterAir', jobID, (value) => {
                //gzip字符串解压
                try {
                    let result = pako.ungzip(base64.decode(value), { to: 'string' });
                    result = JSON.parse(result);
                    this.isFinish = result.isFinish;
                    if (result.airSummary != null) {
                        if (this.flights.length == 0) {
                            this.flights = this.flights.slice().concat(result.airSummary);
                            this.airSummaries = result.airSummaries;
                        }
                        else {
                            this.getMinPriceFlight(this.flights, result.airSummary);
                            this.getMinPriceSummaries(this.airSummaries, result.airSummaries);
                        }
                        this.filterData.clear();
                        for (let item of this.flights) item.Segment._ClassAvail = [];
                        if (this.passProps.param.isPrivate == true) {
                            Enumerable.from(this.flights).doAction(o => Enumerable.from(o.BerthList).
                                doAction(o => { o.BreachPolicy = null; o.IsConformPolicy = true }).toArray()).toArray();
                        }
                        this.filterData = this.flights.slice();
                    }
                    if (result.policy != null) {
                        this.breachPolicy = this.breachPolicy.slice().concat(result.policy);
                    }
                    //超过30s结束查询
                    if (new Date() - this.startTime > 30000) {
                        this.isFinish = true;
                        return;
                    }
                    if (!result.isFinish)
                        this.exec(jobID);
                } catch (err) {
                    this.isFinish = true;
                }
            }, (err) => { this.isFinish = true })
        }, 1000);
    }

    getMinPriceFlight = (o1, o2) => {
        for (var i = 0; i < o2.length; i++) {
            let target = o1.findIndex((a) => a.Segment.SegmentCode === o2[i].Segment.SegmentCode);
            if (target == -1) {
                o1.push(o2[i]);
            } else {
                if (o1[target].Price > o2[i].Price) {
                    o1.splice(target, 1, o2[i]);
                }
            }

        }
        o1.sort((a, b) => a.Price - b.Price);
    }

    getMinPriceSummaries = (o1, o2) => {
        for (var item in o2) {
            if (o1[item] == null) {
                o1[item] = o2[item];
            } else {
                this.getMinPriceFlight(o1[item], o2[item]);
            }
        }
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

    getLegTitle = () => {
        let o = this.passProps.param;
        let tip = this.getLegTip(this.passProps.sequence);
        return `${o.departures[this.passProps.sequence].cityName} - ${o.arrivals[this.passProps.sequence].cityName}(${tip})`;
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
        let policy = result.PolicyDetail.PolicyContent.PolicyInternational;
        employee.PolicyContent = policy;
        this.policy = PolicyInfo.getPolicyDetail(0, policy).join("；");
    }

    //验价
    verifyPrice = async (officeIds, list) => {
        try {
            let flights = [];
            for (let flight of list) flights.push(toJS(flight));
            let obj = {
                "OfficeIds": officeIds,
                "Agency": flights[flights.length - 1].AgencyCode,
                "IntlSegments": [],
                "ABFareId": flights[0].ABFareId,
                "AdultQty": 1,
                "ChildQty": 0,
                "IsVerifyCabin": true,
                "IsVerifyPricing": true,
                "IsVerifyRule": true,
                "IsBestBuy": false,
                "PlatingCarrier": flights[0].MarketingAirline
            }
            for (let flight of flights) {
                for (let classAvail of flight.Segment.ClassAvail) {
                    obj.IntlSegments.push({
                        "IntlFlights": [
                            {
                                "Departure": classAvail.Flight.Departure,
                                "Arrival": classAvail.Flight.Arrival,
                                "DepartureDate": classAvail.Flight.DepartureDate,
                                "ArrivalDate": classAvail.Flight.ArrivalDate,
                                "Airline": classAvail.Flight.MarketingAirline,
                                "FlightNumber": classAvail.Flight.FlightNumber,
                                "Cabin": flight.selectedCabin.FlightCOS || classAvail.Flight.FlightCOS,
                            }
                        ]
                    });
                }
            }
            let result = await RestAPI.execute("IntlAir.IntlAirVerifyPriceV3", obj);
            if (!result) {
                return result;
            }

            let IntlFlights = [];
            let IntlSegments = result.Result.IntlSegments;
            for (let item of IntlSegments) {
                IntlFlights = IntlFlights.concat(item.IntlFlights);
            }
            let map = new Map();
            for (let item of IntlFlights) {
                map.set(item.Airline + item.Arrival + moment(item.ArrivalDate).format("YYYY-MM-DD HH:mm:ss") + item.Departure + moment(item.DepartureDate).format("YYYY-MM-DD HH:mm:ss") + item.FlightNumber, item);
            }
            for (let flight of flights) {
                let rule = result.Result.Rule;
                let multiOffices = result.Result.Pricings[0].MultiOffices[0];
                if (multiOffices) {
                    let price = multiOffices.SalePrice;
                    let tax = multiOffices.Tax;
                    let total = multiOffices.Total;
                    flight.TotalPrice = total;
                    flight.Tax = tax;
                    flight.Price = price;
                    flight.selectedCabin.Price = price;
                    flight.selectedCabin.SourcePrice = multiOffices.BasePrice;
                    flight.RmkCms = 0;
                    flight.EncourageFee = 0;
                    if (multiOffices.TicketDetails && multiOffices.TicketDetails.length > 0) {
                        flight.RmkCms = multiOffices.TicketDetails[0].RmkCms;
                        flight.EncourageFee = multiOffices.TicketDetails[0].EncourageFee;
                    }
                }
                flight.selectedCabin.Rule = `${lan.flights_refundRules}: ${rule.refund}\n${lan.flights_endorseRules}: ${rule.endorse}\n${lan.flights_baggageRules}: ${rule.baggage}\n${lan.other}: ${rule.other}`;
                for (let classAvail of flight.Segment.ClassAvail) {
                    let item = classAvail.Flight;
                    let key = item.MarketingAirline + item.ArrivalInfo.airportCode + item.ArrivalDate + item.DepartureInfo.airportCode + item.DepartureDate + item.FlightNumber;
                    let IntlFlight = map.get(key);
                    if (IntlFlight) {
                        item.Seats = IntlFlight.Seats;
                    }
                }
            }
            return flights;
        } catch (err) {
            return null;
        }
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

export default IntlFlight;