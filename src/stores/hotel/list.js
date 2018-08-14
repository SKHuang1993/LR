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

export default class List {
    constructor(props) {
        this.props = props;
        this.request = props.param;
        this.initData.Filter.Keywords.HotelName = props.keyWords;
        this.keyWords = props.keyWords;
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
    @observable isLoading = true;
    @observable isCompleted = false;
    @observable keyWords = null;
    //获取酒店列表查询ID
    getHotelListAsyncId = () => {
        this.startTime = new Date();
        xServer.invoke('HotelService.MainService.Serving.BizHotelListAsync', this.request, (value) => {
            let result = JSON.parse(pako.ungzip(base64.decode(value), { to: 'string' }));
            setTimeout(() =>
                this.getHotelList(result.AsyncId), 1000);
        }, (err) => { this.isLoading = true }, "http://106.75.132.4:20000/");
    }

    //获取酒店列表
    getHotelList = (asyncId) => {
        this.isLoading = true;
        if (asyncId)
            this.initData.AsyncId = asyncId;
        xServer.invoke('HotelService.MainService.Serving.HotelListAsyncResult', this.initData, (value) => {
            try {
                let result = pako.ungzip(base64.decode(value), { to: 'string' });
                result = JSON.parse(result);
                if (result.Code != 0) {
                    this.isLoading = false;
                    Alert.alert("", result.Msg + "请重新搜索",
                        [{ text: '确定', onPress: () => this.props.navigator.pop() }]);
                    return;
                }
                this.data = Enumerable.from(this.data.concat(result.HotelList)).distinct(o => o.HotelCode).toArray();
                //console.log(result);
                if (!this.summary)
                    this.summary = result.Summary;
                this.isCompleted = this.data.length >= result.TotalResults;
                if (!result.IsCompleted && !this.summary)
                    setTimeout(() => {
                        this.getHotelList(asyncId)
                    }, 1000);
                else
                    this.isLoading = false;
            } catch (err) {
                this.isLoading = true;
            }
        }, (err) => { this.isLoading = true }, "http://106.75.132.4:20000/");
    }

    //默认排序
    orderByDefault = () => {
        this.data.clear();
        this.initData.PageNo = 0;
        this.initData.Sorter = {
            "Sortord": "Default",
            "Ascending": true
        }
        this.getHotelList();
    }

    //星级排序
    orderByStar = () => {
        this.data.clear();
        this.initData.PageNo = 0;
        this.initData.Sorter = {
            "Sortord": "Star",
            "Ascending": this.initData.Sorter.Sortord === "Star" ? !this.initData.Sorter.Ascending : true
        }
        this.getHotelList();
    }

    //价格排序
    orderByPrice = () => {
        this.data.clear();
        this.initData.PageNo = 0;
        this.initData.Sorter = {
            "Sortord": "Price",
            "Ascending": this.initData.Sorter.Sortord === "Price" ? !this.initData.Sorter.Ascending : true
        }
        this.getHotelList();
    }

    //筛选数据
    execSifteData = (data) => {
        let filter = {
            "Price": {
                "Ranges": []
            },
            "Star": {
                "Stars": []
            },
            "Location": {
                "Locations": []
            },
            "Brand": {
                "Brands": []
            },
        };
        if (!data[0].children[0].checked) {
            filter.Location.Locations = Enumerable.from(data[0].children).where(o => !o.id && o.checked).select("$.value").toArray();
        }
        if (!data[1].children[0].checked) {
            filter.Price.Ranges = Enumerable.from(data[1].children).where(o => !o.id && o.checked).select("$.value").toArray();
        }
        if (!data[2].children[0].checked) {
            filter.Star.Stars = Enumerable.from(data[2].children).where(o => !o.id && o.checked).select("$.value").flatten().distinct().toArray();
        }
        if (!data[3].children[0].checked) {
            filter.Brand.Brands = Enumerable.from(data[3].children).where(o => !o.id && o.checked).select("$.value").toArray();
        }
        Object.assign(this.initData.Filter, filter);
        this.data.clear();
        this.getHotelList();
    }

    //初始化筛选条件
    getFilterData = () => {
        if (this.filterData && this.filterData.length > 0)
            return this.filterData;
        //酒店位置
        let location = {
            value: 1,
            label: '酒店位置',
            children: [
                {
                    id: 1,
                    label: lan.flights_filter_unlimited,
                    checked: true,
                    all: true,
                }
            ]
        };
        location.children = location.children.concat(Enumerable.from(this.summary.Location.Locations).select("{label: $.Label,parentid:1, value: $.Location, checked: false}").toArray())
        //价格范围
        let price = {
            value: 2,
            label: '价格范围',
            children: [
                {
                    id: 1,
                    label: lan.flights_filter_unlimited,
                    checked: true,
                    all: true,
                }
            ]
        };
        price.children = price.children.concat(Enumerable.from(this.summary.Price.Prices).select("{label: $.Label,parentid:1, value: {MaxPrice:$.MaxPrice,MinPrice:$.MinPrice}, checked: false}").toArray())
        //酒店星级
        let star = {
            value: 3,
            label: '酒店星级',
            children: [
                {
                    id: 1,
                    label: lan.flights_filter_unlimited,
                    checked: true,
                    all: true,
                }
            ]
        };
        star.children = star.children.concat(Enumerable.from(this.summary.Star.Stars).select("{label: $.Label,parentid:1, value: $.Stars, checked: false}").toArray())
        //连锁品牌
        let brand = {
            value: 4,
            label: '连锁品牌',
            children: [
                {
                    id: 1,
                    label: lan.flights_filter_unlimited,
                    checked: true,
                    all: true,
                }
            ]
        };
        brand.children = brand.children.concat(Enumerable.from(this.summary.Brand.Brands).select("{label: $.Label,parentid:1, value: $.Brand, checked: false}").toArray())
        return [location, price, star, brand];
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
        return ds.cloneWithRows(this.data.slice());
    }
}