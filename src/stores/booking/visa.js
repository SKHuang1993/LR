import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { RestAPI } from '../../utils/yqfws';
import { ProductInfo, PassengerInfo, CertificateInfo, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo, ReasonInfo } from '../../utils/data-access/';
import moment from 'moment';
import deepDiffer from 'deepDiffer';

export default class Visa {
    @observable isLoading = false;
    @observable multVisa = [];
    @observable isEmptyData = false;
    passengers = [];
    selectedFlights = [];
    constructor(selectedFlights, props) {
        this.param = props;
        this.selectedFlights = selectedFlights;
    }

    getProducts = async (productVisa) => {
        try {
            this.isLoading = true;
            let target = Enumerable.from(this.param.arrivals).firstOrDefault(o => !o.isDomestic, -1);
            let param = {
                "OfficeID": this.userInfo.CorpCode,
                "TravelStartDate": this.param.departureDates[0],
                "TravelEndDate": this.param.departureDates[this.param.departureDates.length - 1],
                "DestinationIataCode": target.cityCode,
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
            let result = await ProductInfo.productsMultiSearch(param);
            this.multVisa = Enumerable.from(result.Result.MultVisas).doAction(o => {
                o.checked = false;
                if (productVisa && o.GoodCode == productVisa.ProductCode) {
                    o.checked = true;
                }
            }).orderBy("$.Premium").toArray();
            if (this.multVisa.length == 0)
                this.isEmptyData = true;
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