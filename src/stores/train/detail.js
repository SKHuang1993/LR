import { extendObservable, action, computed, toJS, observable, runInAction } from 'mobx';
import { ListView, NativeModules, Alert } from 'react-native'
import { RestAPI } from '../../utils/yqfws'
import Enumerable from 'linq'
import pako from 'pako'
import base64 from 'base-64'
import moment from 'moment'
import { PolicyInfo, EmployeeInfo, AccountInfo } from '../../utils/data-access';
import deepDiffer from 'deepDiffer'
import { showCalendar } from '../../components/calendar';
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
let lan = BaseComponent.getLocale();

export default class Detail {
    constructor(props) {
        this.props = props;
        this.request = toJS(props.param);
    }
    @observable data = [];
    @observable request;
    @observable station = [];
    @observable isLoading = false;

    getList = (data) => {
        let arr = [];
        if (data.train_code.substr(0, 1) === "G" || data.train_code.substr(0, 1) === "D" || data.train_code.substr(0, 1) === "C") {
            arr.push({ type: '二等座', num: data.rz2_num, price: data.rz2, code: "rz2" });
            arr.push({ type: '一等座', num: data.rz1_num, price: data.rz1, code: "rz1" });
            arr.push({ type: '特等座', num: data.tdz_num, price: data.tdz, code: "tdz" });
            arr.push({ type: '商务座', num: data.swz_num, price: data.swz, code: "swz" });
        } else {
            arr.push({ type: '硬座', num: data.yz_num, price: data.yz, code: "yz" });
            arr.push({ type: '硬卧', num: data.yw_num, price: data.ywx, code: "ywx" });
            arr.push({ type: '软卧', num: data.rw_num, price: data.rwx, code: "rwx" });
            arr.push({ type: '高级软卧', num: data.gw_num, price: data.gwx, code: "gwx" });
        }
        if (data.wz_num != '-') {
            arr.push({ type: '无座', num: data.wz_num, price: data.wz, code: "wz" });
        }
        this.data = arr;
    }

    getTrainDetail = async (code) => {
        try {
            this.data.clear();
            this.isLoading = true;
            let obj = this.request;
            let param = {
                "travel_time": obj.departureDates[0],
                "from_station": obj.departures[0].cityName,
                "arrive_station": obj.arrivals[0].cityName,
                "train_code": code
            }
            let result = await RestAPI.execute("Train.QueryLeftTicketByTrainCode", param);
            this.isLoading = false;
            this.getList(result.Result.train_data);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    queryStopStation = async (code) => {
        this.isLoading = true;
        let param = { "train_code": code };
        let result = await RestAPI.execute("Train.QueryStopStation", param);
        this.station = result.Result.train_stationinfo;
        this.isLoading = false;
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
        let policy = result.PolicyDetail.PolicyContent.PolicyHotel;
        if (!policy) {
            this.policy = lan.noBusinessTripPolicy;
            return;
        }
        employee.PolicyContent = policy;
        this.policy = PolicyInfo.getPolicyDetail(2, policy).join("；");
    }

    //获取违反差旅政策
    getPolicyViolations = (policyViolations) => {
        if (!policyViolations) return;
        let msg = [];
        for (let item of policyViolations) {
            if (item.Key == "StarLimit") {
                msg.push("酒店星级最高只能为" + item.Value + "星级");
            }
            else if (item.Key == "ConfigCityPriceLimits") {
                let matches = item.Value.match(/<Price>(\d+)<\/Price>/);
                if (matches.length == 2)
                    msg.push("当前城市最高价格不能超过 ￥" + matches[1]);
            }
            else if (item.Key == "AgreementAirline") {
                msg.push(lan.hotelPriority);
            }
            else if (item.Key == "OtherCityPriceLimit") {
                msg.push("其他城市价格限制" + ":" + item.Value + "元/间/夜");
            }
        }
        return msg.join("\n");
    }

    addDays = (days) => {
        this.request.departureDates[0] = moment(this.request.departureDates[0]).add(days, 'd')
            .format("YYYY-MM-DD");
        this.flightCondition = [];
        this.getTrainDetail(this.props.data.train_code);
    }

    removeDays = (days) => {
        this.request.departureDates[0] = moment(this.request.departureDates[0]).subtract(days, 'd')
            .format("YYYY-MM-DD");
        this.flightCondition = [];
        this.getTrainDetail(this.props.data.train_code);
    }

    changeDate = () => {
        showCalendar(null, moment().add(31, 'd').format("YYYY-MM-DD"), true, (d1, d2) => {
            this.request.departureDates[0] = d1;
            this.flightCondition = [];
            this.getTrainDetail(this.props.data.train_code);
        })
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
        return ds.cloneWithRows(this.data.slice());
    }

    @computed get getStationStops() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.station.slice());
    }
}