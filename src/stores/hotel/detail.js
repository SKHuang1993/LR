import { extendObservable, action, computed, toJS, observable, runInAction } from 'mobx';
import { ListView, NativeModules, Alert } from 'react-native'
import { xServer } from '../../utils/yqfws'
import Enumerable from 'linq'
import pako from 'pako'
import base64 from 'base-64'
import moment from 'moment'
import { PolicyInfo, EmployeeInfo, AccountInfo } from '../../utils/data-access';
import deepDiffer from 'deepDiffer'

import { BaseComponent, en_US, zh_CN } from '../../components/locale';
let lan = BaseComponent.getLocale();

export default class Detail {
    constructor(props) {
        this.props = props;
    }
    @observable rateList = [];
    @observable isLoading = true;
    //获取酒店详情  "OfficeID": AccountInfo.getUserInfo().CorpCode,
    getHotelDetail = (id) => {
        xServer.invoke('HotelService.MainService.Serving.HotelDetail', {
            "HotelID": id,
            "CheckInDate": this.props.param.CheckInDate,
            "CheckOutDate": this.props.param.CheckOutDate,
            "OfficeID": "21",
            "Location": null,
            "CustomerUserAgent": ".NET Framework/4.0.30319.42000 (Microsoft Windows NT 6.2.9200.0) HotelServiceDemo/1.1.0.24",
            "CustomerIpAddress": null
        }, (value) => {
            try {
                let result = pako.ungzip(base64.decode(value), { to: 'string' });
                result = JSON.parse(result);
                console.log(result);
            } catch (err) {
                this.isFinish = true;
            }
        }, (err) => { this.isFinish = true }, "http://106.75.132.4:20000/");
    }

    //获取酒店价格查询ID
    getHotelPriceAsyncId = (id) => {
        let obj = toJS(this.props.param);
        obj.HotelID = id;
        if (this.props.employee.length > 0)
            obj.StaffCode = this.props.employee[0].PersonCode;
        xServer.invoke('HotelService.MainService.Serving.BizHotelPriceAsync', obj, (value) => {
            try {
                let result = pako.ungzip(base64.decode(value), { to: 'string' });
                result = JSON.parse(result);
                //console.log(result);
                setTimeout(() => this.getHotelPrice(result.AsyncId), 1000);
            } catch (err) {
                this.isFinish = true;
            }
        }, (err) => { this.isFinish = true }, "http://106.75.132.4:20000/");
    }

    //获取酒店价格
    getHotelPrice = (asyncId) => {
        this.isLoading = true;
        let obj = {
            "StaffCode": AccountInfo.getUserInfo().EmpCode,
            "AsyncId": asyncId,
            "CustomerUserAgent": ".NET Framework/4.0.30319.42000 (Microsoft Windows NT 6.2.9200.0) HotelServiceDemo/1.1.0.24",
            "CustomerIpAddress": null
        };
        if (this.props.employee.length > 0)
            obj.StaffCode = this.props.employee[0].PersonCode;
        xServer.invoke('HotelService.MainService.Serving.BizHotelPriceAsyncResult', obj, (value) => {
            try {
                let result = pako.ungzip(base64.decode(value), { to: 'string' });
                result = JSON.parse(result);
                //this.rateList = this.rateList.concat(result.RateList);
                this.rateList = result.RateList;
                this.rateList = Enumerable.from(this.rateList).orderBy(o => o.AveragePrice).toArray();
                Enumerable.from(this.rateList).doAction(o => o.ServerCacheID = asyncId).toArray();
                //console.log(this.rateList);
                if (!result.IsCompleted)
                    setTimeout(() => this.getHotelPrice(asyncId), 1000);
                else
                    this.isLoading = false;
            } catch (err) {
                this.isFinish = true;
            }
        }, (err) => { this.isFinish = true }, "http://106.75.132.4:20000/");
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

    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.rateList.slice());
    }
}