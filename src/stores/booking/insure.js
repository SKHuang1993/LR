import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { RestAPI } from '../../utils/yqfws';
import { ProductInfo, PassengerInfo, CertificateInfo, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo, ReasonInfo } from '../../utils/data-access/';
import moment from 'moment';
import deepDiffer from 'deepDiffer';

export default class Insurance {
    @observable ProductInsure = {};
    @observable isLoading = false;
    @observable multInsurances = [];
    passengers = [];
    selectedFlights = [];
    constructor(passengers, selectedFlights, insuranceResult, props) {
        this.param = props;
        this.selectedFlights = selectedFlights;
        for (let i = 0; i < selectedFlights.length; i++) {
            let _passengers = [];
            for (let item of passengers) {
                let obj = observable(toJS(item));
                extendObservable(obj, {
                    group: i,
                    checked: false
                })
                _passengers.push(obj);
            }
            if (insuranceResult && insuranceResult.length > 0) {
                Enumerable.from(_passengers).join(insuranceResult[i], "$.PersonCode", "$.PersonCode", (a, b) => { a.checked = b.checked }).toArray();
            }
            if (_passengers.length > 0)
                this.passengers.push(_passengers);
        }
    }

    getProductConfigure = async () => {
        this.isLoading = true;
        let param = {
            "CompanyCode": this.userInfo.CorpCode
        }
        let result = await ProductInfo.getProductConfigure(param);
        this.ProductInsure = result.Result.ProductConfigures[0].Content.ProductInsure;
        this.isLoading = false;
        return result.Result.ProductConfigures[0].Content;
    }

    productQuery = async () => {
        this.isLoading = true;
        let param = {
            "OfficeID": null,
            "ProductCode": this.ProductInsure.ProductCode,
            "ProductCategoryID": "743"
        }
        let result = await ProductInfo.productQuery(param);
        extendObservable(this.ProductInsure, result.Result.Products[0]);
        this.isLoading = false;
    }

    insuranceRateReport = async (start, end) => {
        this.isLoading = true;
        let param = {
            "Start": start,
            "End": end,
            "ProductCode": this.ProductInsure.ProductCode,
            "PlanCode": this.ProductInsure.PlanCode
        }
        let result = await ProductInfo.insuranceRateReport(param);
        let target = Enumerable.from(result.Result.InsuranceRates).firstOrDefault(o => o.InsuredType == "IND", null);
        if (target) {
            extendObservable(this.ProductInsure, target);
            let goodOwners = await ProductInfo.getGoodOwners({
                "GoodTypeCode": "I",
                "PageIndex": 1,
                "PageSize": 100
            });
            let goodOwner = Enumerable.from(goodOwners.Result.GoodOwners).firstOrDefault(o => o.GoodOwnerCode == this.ProductInsure.Provider, null);
            if (goodOwner) {
                this.ProductInsure.ProviderName = goodOwner.OwnerNameCn;
            }
            //console.log(this.ProductInsure);
        } else {
            throw exception();
        }
        this.isLoading = false;
    }

    getProducts = async (productInsure) => {
        try {
            this.isLoading = true;
            let param = {
                "OfficeID": this.userInfo.CorpCode,
                "TravelStartDate": this.param.departureDates[0],
                "TravelEndDate": this.param.departureDates[this.param.departureDates.length - 1],
                "DestinationIataCode": this.param.arrivals[0].cityCode,
                "ProductCategoryID": "4,5,768,803,837,840,839,810,844,834,867,872,854,724",
                "TrafficAir": {}
            };
            let Departures = [];
            let Arrival = [];
            let DepartureDates = [];
            for (let item of this.selectedFlights) {
                let flightStart = item.Segment.ClassAvail[0].Flight;
                let flightEnd = item.Segment.ClassAvail[item.Segment.ClassAvail.length - 1].Flight;
                Departures.push(flightStart.DepartureInfo.cityCode);
                Arrival.push(flightEnd.ArrivalInfo.cityCode);
                DepartureDates.push(flightStart.DepartureDate);
            }
            param.TrafficAir.Departures = Departures;
            param.TrafficAir.Arrivals = Arrival;
            param.TrafficAir.DepartureDates = DepartureDates;
            //console.log(JSON.stringify(param));
            let result = await ProductInfo.productsMultiSearch(param);
            this.multInsurances = Enumerable.from(result.Result.MultInsurances).where(o => o.InsuredType == "IND").doAction(o => {
                o.checked = false;
                if (productInsure && o.ProductCode == productInsure.ProductCode && o.Premium == productInsure.AdultPrice) {
                    o.checked = true;
                }
            }).orderBy("$.Premium").toArray();
            this.isLoading = false;
        } catch (err) {
            console.log(err);
        }
    }

    @computed get getDataSource() {
        ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2
        });
        return ds.cloneWithRowsAndSections(this.passengers.slice());
    }
}