import { extendObservable, action, computed, toJS, observable, autorun } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { RestAPI } from '../../utils/yqfws';
import { BusinessTrip, OrderInfo, PaymentInfo, PassengerInfo, CertificateInfo, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo, ReasonInfo } from '../../utils/data-access/';
import moment from 'moment';
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
import { showCityList } from '../../components/city-list';
let lan = BaseComponent.getLocale();

export default class BusinessApplication {
    @observable tripTypes = [
        {
            "value": 0,
            "label": "单程",

        },
        {
            "value": 1,
            "label": "往返",

        }
    ]
    //     @observable transportations = [
    //     {
    //         "value": 1,
    //         "label": "飞机",

    //     },
    //     {
    //         "value": 2,
    //         "label": "火车",

    //     },
    //     {
    //         "value": 3,
    //         "label": "其他",

    //     }
    // ]
    @observable transportations = [
        {
            "value": 1,
            "label": "飞机",

        },
        {
            "value": 2,
            "label": "火车",

        },
    ]
    @observable totalDays;
    @observable travelReasonList;
    @observable travelPurposeID;
    @observable travelPurpose;
    @observable costCenterID;
    @observable policy;
    @observable isLoading = false;
    @observable costList = [];
    @observable staffData = [];
    @observable referenceTrips = [];
    @observable userRoles = [];
    @observable ticketType = 0;
    @observable trips = [{
        tripType: 1,//0.单程 1.往返程 2.多航段
        adultQty: 1,
        transportation: 1,
        childQty: 0,
        isPrivate: false,
        berthType: 'Y',
        departures: [],
        departureDates: [moment().add(20, 'd'), moment().add(25, 'd')],
        arrivals: [],
        referenceTrips: [],
    }];
    constructor(props) {
        this.props = props;
        //获取总天出差数
        autorun(() => this.getTotalDays());
        //旅客数
        autorun(() => Enumerable.from(this.trips).doAction(o => Enumerable.from(o.referenceTrips).doAction(o => o.PassengerQty = this.staffData.length + 1).toArray()).toArray());
    }

    //读取成本中心列表
    costGetList = async () => {
        let param = {
            "CompanyCode": this.userInfo.CorpCode
        }
        let result = await CostInfo.getList(param);
        let costDetails = result.Result.CostDetails;
        this.costList = Enumerable.from(costDetails).select("{value: $.CostID,label: $.CostName}").toArray();
    }

    //目的地 
    //type == 0 去程，type == 1 回程
    setDepartures = (o, type) => {
        let key = "flight";
        if (o.transportation == 2)
            key = "train";
        showCityList(key, (data) => {
            let val = data;
            if (type == 0)
                o.departures[0] = val;
            else
                o.arrivals[0] = val;
            if (Enumerable.from(o.departures).where(o => o).any(o => !o.isDomestic) || Enumerable.from(o.arrivals).where(o => o).any(o => !o.isDomestic)) {
                o.ticketType = 1;
            } else
                o.ticketType = 0;
        })
    }

    //查询出差原因
    getTravelReasonList = async () => {
        let param = {
            "CompanyCode": this.userInfo.CorpCode
        }
        let result = await ReasonInfo.getTravelReasonList(param);
        let reasons = result.Result.Reasons;
        this.travelReasonList = Enumerable.from(reasons).select("{value: $.ID,label: $.ReasonContent}").toArray();
        this.travelReasonList.push({ value: -2, label: lan.lang == 'EN' ? 'Custom' : '自定义' });
    }

    //获取差旅政策
    getPolicy = async (policyID) => {
        if (!policyID || policyID == 53) {
            return;
        }
        let param = {
            "PolicyID": policyID
        }
        let result = await PolicyInfo.getPolicy(param);
        result = result.Result;
        this.policy = result.PolicyDetail.PolicyContent;
    }

    getTotalDays = () => {
        let last = this.trips[this.trips.length - 1];
        let departureDate = this.trips[0].departureDates[0];
        this.totalDays = last.departureDates[last.departureDates.length - 1].diff(departureDate, 'd') + 1 + "";
    }

    //获取审批信息
    getCusApproveUserByUserCode = async () => {
        let param = {
            "UserCodes": this.userInfo.Account
        }
        let result = await ApproveInfo.getCusApproveUserByUserCode(param);
        let approveRules = result.Result.ApproveRules;
        if (approveRules.length > 0) {
            let condition = approveRules[0].ApproveContent;
            let Roles = approveRules[0].Roles;
            let UserRoles = [];
            if (!Roles)
                return;
            for (let role of Roles) {
                let param = {
                    "ResourceID": 10,
                    "RoleIDs": role.ID,
                    "SeqNr": role.SeqNr,
                    "Name": role.Name
                }
                let result = await RoleInfo.getUserRoleList(param);
                param.userRoles = result.Result.UserRoles;
                UserRoles.push(param);
            }
            this.userRoles = UserRoles;
        }
    }

    //创建差旅申请
    createBusinessTripApplication = async () => {
        this.isLoading = true;
        let param = {
            "Action": 1,
            "OANr": null,
            "DisplayName": null,
            "Reason": this.travelPurposeID == -2 ? this.travelPurpose : this.travelReasonList.find(o => o.value == this.travelPurposeID).label,
            "TravelPolicyID": this.userInfo.PolicyDetail.PolicyID,
            "CostCenterID": this.costCenterID,
            "CostCenterInfo": this.costList.find(o => o.value == this.costCenterID).label,
            "ContrPolicyTermID": null,
            "ContrPolicyTermReason": null,
            "StatusID": 1,
            "ApplicantUserCode": this.userInfo.Account,
            "UserCode": this.userInfo.Account,
            "Reamrk": null,
            "BTAJourneys": Enumerable.from(this.trips).select((o, i) => {
                let obj = toJS(o);
                let segment = {
                    ArrivalCityCode: obj.arrivals[0].cityCode,
                    ArrivalCityName: obj.arrivals[0].cityName,
                    ArrivalDate: o.departureDates[1].format("YYYY-MM-DD"),
                    DepartureCityCode: obj.departures[0].cityCode,
                    DepartureCityName: obj.departures[0].cityName,
                    DepartureDate: o.departureDates[0].format("YYYY-MM-DD"),
                    TripType: o.transportation == 1 ? (o.tripType == 0 ? "OW" : "RT") : null
                };
                let flights = Enumerable.from(o.referenceTrips).select((o, i) => {
                    let flight = toJS(o);
                    delete flight.BerthList;
                    delete flight._berthList;
                    return flight;
                }).toArray();
                let productCategoryID = 8;
                if (o.transportation == 1)
                    productCategoryID = o.ticketType == 0 ? 8 : 9;
                else if (o.transportation == 2)
                    productCategoryID = 3;
                else
                    productCategoryID = 796;
                let content = { Segment: segment, ProductCategoryID: productCategoryID, ReferenceJourney: flights.length > 0 ? { Air: JSON.stringify(flights) } : null };
                return { Route: content, Action: 1, SegmentNr: i + 1 }
            }).toArray(),
            "BTAApproveRoutingPlans": Enumerable.from(this.userRoles).select((o, i) => {
                return {
                    RoleID: o.RoleIDs, Name: o.Name, Action: 1, SeqNr: o.SeqNr,
                    BTAARPApproveRoleUsers: Enumerable.from(o.userRoles).select("{Action:1,UserCode:$.UserCode}").toArray()
                }
            }).toArray(),
            "BTACompantions": Enumerable.from(this.staffData).select("{Action: 1, PersonCode: $.PersonCode}").toArray(),
            "TravelPolicyContent": this.getPolicies.join(";")
        }
        let result = await BusinessTrip.BusinessTripApplicationCU(param);
        this.isLoading = false;
        return result;
    }


    @computed get getPolicies() {
        if (!this.policy)
            return;
        let arr = [];
        if (this.trips.find(o => o.transportation == 2)) {
            let policy = this.policy.PolicyDomesticTrain;
            arr = arr.concat(PolicyInfo.getPolicyDetail(3, policy));
        }
        if (this.trips.find(o => o.transportation == 1)) {
            let isIntl = Enumerable.from(this.trips).any(o => Enumerable.from(o.departures).where(o => o).any(o => !o.isDomestic))
                || Enumerable.from(this.trips).any(o => Enumerable.from(o.arrivals).where(o => o).any(o => !o.isDomestic));
            if (isIntl) {
                this.ticketType = 1;
                let policy = this.policy.PolicyInternational;
                arr = arr.concat(PolicyInfo.getPolicyDetail(1, policy));
            } else {
                this.ticketType = 0;
                let policy = this.policy.PolicyDomestic;
                arr = arr.concat(PolicyInfo.getPolicyDetail(0, policy));
            }
        }
        return arr;
    }
}