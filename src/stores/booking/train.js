import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { RestAPI } from '../../utils/yqfws';
import { OrderInfo, PaymentInfo, PassengerInfo, CertificateInfo, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo, ReasonInfo } from '../../utils/data-access/';
import moment from 'moment';
import OrderDetail from '../../stores/travel/orderDetail'

export default class TrainBooking {
    constructor(props) {
        this.props = props;
    }
    //结算方式ID，1-现付，3-欠款，5-月结
    @observable info = {
        ContrReasonID: null,
        ContrReason: null,
        TravelPurposeID: null,
        TravelPurpose: null,
        CostCenterID: null,
        CostCenterInfo: null,
        PaymentMethodID: 5,
        ContrContent: null,
        IsContrPolicy: null
    };
    seatPreferenceInfo = [{
        "value": 1,
        "label": lan.booking_beside_the_window

    }, {
        "value": 2,
        "label": lan.booking_aisle,

    }, {
        "value": 3,
        "label": lan.booking_other,

    }];
    @observable depositAmount;
    @observable availableBalance;
    @observable employeeList;
    @observable passengers = [];
    @observable insuranceResult;
    @observable productInsure;
    @observable productVisa;
    @observable costList;
    @observable booker;
    @observable isLoading = false;
    @observable seatPreference;
    @observable travelReasonList;
    @observable policyReasonList;
    @observable station = [];
    @observable seatStyle = [];
    //SourceTypeID = 253
    @observable booking = {
        "IsWait": false,
        "OfficeCode": "CAN999",
        "BookerID": null,
        "BookerName": null,
        "ContactPerson": null,
        "ContactMobile": null,
        "ContactEmail": null,
        "LastesDocStatusID": 9,
        "CustomerApproveStatusID": 0,
        "OrderDate": moment().format(),
        "SourceTypeID": 318,
        "CompanyCode": "CAN999",
        "TotalAmount": 0.0,
        "CurrencyID": 4,
        "StaffCode": null,
        "UserCode": null,
        "Remark": "",
        "Memo": null,
        "SalesOrderRawData": {
            "LatestStatusID": 3
        },
        "SalesOrderAdvanceReceipts": null,
        "SalesOrderTags": null,
        "Watcher": null
    }

    //读取成本中心列表
    costGetList = async (info) => {
        let param = {
            "CompanyCode": this.userInfo.CorpCode
        }
        let result = await CostInfo.getList(param);
        let costDetails = result.Result.CostDetails;
        this.costList = Enumerable.from(costDetails).select("{value: $.CostID,label: $.CostName}").toArray();
        if (info) {
            this.info.CostCenterID = info.costCenterID;
            let obj = Enumerable.from(costDetails).firstOrDefault(o => o.CostID == info.costCenterID, null);
            if (obj)
                this.info.CostCenterInfo = obj.CostName;
        }
        if (!this.info.CostCenterID && this.employeeList.length > 0) {
            this.info.CostCenterID = this.employeeList[0].CostCenterID;
            this.info.CostCenterInfo = this.employeeList[0].CostCenterName;
        }
    }

    //查询出差原因
    getTravelReasonList = async (info) => {
        let param = {
            "CompanyCode": this.userInfo.CorpCode
        }
        let result = await ReasonInfo.getTravelReasonList(param);
        let reasons = result.Result.Reasons;
        this.travelReasonList = Enumerable.from(reasons).select("{value: $.ID,label: $.ReasonContent}").toArray();
        this.travelReasonList.push({ value: -2, label: lan.booking_custom });
        if (info) {
            let obj = Enumerable.from(reasons).firstOrDefault(o => o.ReasonContent == info.reason, null);
            if (obj) {
                this.info.TravelPurposeID = obj.ID;
            } else {
                this.info.TravelPurposeID = -2;
            }
            this.info.TravelPurpose = info.reason;
        }
        if (!this.info.TravelPurposeID && this.travelReasonList.length > 0) {
            this.info.TravelPurposeID = this.travelReasonList[0].value;
            this.info.TravelPurpose = this.travelReasonList[0].label;
        }
    }

    //查询违反差旅政策原因
    getPolicyReasonList = async () => {
        let param = {
            "CompanyCode": this.userInfo.CorpCode
        }
        let result = await ReasonInfo.getPolicyReasonList(param);
        let reasons = result.Result.Reasons;
        this.policyReasonList = Enumerable.from(reasons).select("{value: $.ID,label: $.ReasonContent}").toArray();
        this.policyReasonList.push({ value: -2, label: lan.booking_custom });
        if (!this.info.ContrReasonID && this.policyReasonList.length > 0) {
            this.info.ContrReasonID = this.policyReasonList[0].value;
            this.info.ContrReason = this.policyReasonList[0].label;
        }
    }

    getSeats = (code, num) => {
        let arr = ['A', 'B', 'C', 'D', 'F'];
        for (let i = 0; i < arr.length; i++) {
            arr[i] = {
                code: arr[i],
                checked: false
            }
        }
        if (code == 'rz1') {
            arr.splice(1, 1);
            let result = [arr.slice(0, 2), arr.slice(2, 4)];
            if (num == 1) return [result];
            else return [result, result];
        }
        else if (code == 'swz' || code == 'tdz') {
            arr.splice(1, 1);
            arr.splice(2, 1);
            let result = [arr.slice(0, 2), arr.slice(2, 3)];
            if (num == 1) return [result];
            else return [result, result];
        }
        else {
            let result = [arr.slice(0, 3), arr.slice(3, 5)];
            if (num == 1) return [result];
            else return [result, result];
        }
    }

    @computed get getSelectSeats() {
        let result = [];
        this.seatStyle.forEach((v, i) => {
            result = result.concat(Enumerable.from(v[0]).where(o => o.checked).select(o => (i + 1) + o.code).toArray());
            result = result.concat(Enumerable.from(v[1]).where(o => o.checked).select(o => (i + 1) + o.code).toArray());
        })
        return result;
    }

    getSeatType = (key) => {
        var map = new Map();
        map.set("商务座", 0);
        map.set("特等座", 1);
        map.set("一等座", 2);
        map.set("二等座", 3);
        map.set("高级软卧", 4);
        map.set("软卧", 5);
        map.set("硬卧", 6);
        map.set("软座", 7);
        map.set("硬座", 8);
        map.set("无座", 9);

        if (map.get(key))
            return map.get(key) + "";
        else return "10";
    }

    //请求改签（改签占座）
    trainToChange = async (order, detail, data) => {
        this.isLoading = true;
        let train = order.Trade.Orders[0].EurailP2P.Segments[0].Trains[0];
        let passengers = order.Trade.Orders[0].Passengers;
        let param = {
            "order_id": order.Trade.Orders[0].EurailP2P.MiddleVendorOrderID,
            "merchant_order_id": order.Trade.Orders[0].OrderID,
            "from_station_code": this.props.param.departures[0].cityCode,
            "from_station_name": detail.from_station,
            "to_station_code": this.props.param.arrivals[0].cityCode,
            "to_station_name": detail.arrive_station,
            "isChangeTo": "0",
            "out_ticket_billno": order.Trade.Orders[0].EurailP2P.OriginalVendorOrderID,
            "change_train_no": detail.train_code,
            "change_from_time": `${this.props.param.departureDates[0]}T${detail.from_time}`,
            "change_to_time": moment(this.props.param.departureDates[0] + "T" + detail.from_time).add(detail.cost_time, 'm').format("YYYY-MM-DDTHH:mm:ss"),
            "seat_type": this.getSeatType(train.CabinLevel),
            "change_seat_type": this.getSeatType(data.type),
            "callbackurl": "https://biz.yiqifei.com/Train/Applichange",
            "ticketinfo": Enumerable.from(passengers).select(o => {
                return {
                    "user_name": o.Name,
                    "user_ids": o.CertNr,
                    "old_ticket_no": order.Trade.Orders[0].EurailP2P.OriginalVendorOrderID
                }
            }).toArray(),
            "ExpenseInfos": [{
                PassengerTypeCode: "ADT",
                Qty: this.employeeList.length,
                TicketPrice: this.getTicketPrice(),
                OtherFee: 0,
                TotalAmount: this.getTicketPrice() * this.employeeList.length,
                CurrencyID: 4
            }]
        }
        let result = await RestAPI.execute("Train.ToChange", param);
        this.isLoading = false;
        result = result.Result;
        if (result.ToChangeInfo && result.ToChangeInfo.return_code == "000")
            await this.trainConfirmChange(order, result);
        else
            Alert.alert("请求改签失败")
    }

    //确认改签接口
    trainConfirmChange = async (order, result) => {
        this.isLoading = true;
        let train = order.Trade.Orders[0].EurailP2P.Segments[0].Trains[0];
        let param = {
            "order_id": order.Trade.Orders[0].EurailP2P.MiddleVendorOrderID,
            "new_merchant_order_id": result.new_merchant_order_id,
            "callbackurl": "https://biz.yiqifei.com/Train/AppliComfigChange",
            "ToChangeInfo": result.ToChangeInfo,
            "UseStatus": 1
        }

        result = await RestAPI.execute("Train.ConfirmChange", param);
        this.isLoading = false;
        Alert.alert('', '改签申请已经提交 ，请稍后返回订单详情查看改签结果', [
            {
                text: '确定', onPress: () => {
                    this.props.navigator.popToTop();
                }
            }]);
    }

    //获取证件名称
    setCertificateName = async () => {
        let result = await CertificateInfo.getList();
        let proofTypes = result.Result.ProofTypes;
        for (let item of this.employeeList) {
            Enumerable.from(item.Proofs).join(proofTypes, "$.Name", "$.TypeCode", (a, b) => { a.CertificateName = b.Name }).toArray();
        }
        for (let item of this.employeeList) {
            item.defaultCertificate = this.setDefaultCertificate(item.Proofs, this.props.param.ticketType);
        }

    }

    queryStopStation = async (code) => {
        this.isLoading = true;
        let param = { "train_code": code };
        let result = await RestAPI.execute("Train.QueryStopStation", param);
        this.station = result.Result.train_stationinfo;
        this.isLoading = false;
    }

    //读取用户现金，信用账号情况
    getLedgerAccountCash = async () => {
        let param = {
            "OwnerTypeID": 3,
            "OwnerCode": this.userInfo.Account
        }
        let result = await PaymentInfo.getLedgerAccountCash(param);
        if (result.Result.LedgerAccountCashs.length > 0) {
            this.availableBalance = result.Result.LedgerAccountCashs.find(o => o.AccountTypeID == 2).AvailableBalance;
            this.depositAmount = result.Result.LedgerAccountCashs.find(o => o.AccountTypeID == 1).DepositAmount;
        }
    }

    getCustomerCompanyApproveByCompCode = async (passengers) => {
        try {
            let param = {
                "CompanyCode": this.userInfo.CorpCode
            }
            let result = await ApproveInfo.getCustomerCompanyApproveByCompCode(param);
            let ticketType = this.props.param.ticketType == 0 ? 8 : 9
            let CusCompanyApproves = Enumerable.from(result.Result.CusCompanyApproves).where(o => Enumerable.from(o.ApproveContent.ApplyProducts).count(o => o == ticketType) > 0).toArray();
            let Approves = [];
            for (let item of CusCompanyApproves) {
                let ApprovalUsers = item.ApproveContent.ApprovalUsers;
                let ApproveUser = Enumerable.from(ApprovalUsers).join(passengers, "$.PersonCode", "$.PassengerCode").toArray();
                if (ApproveUser.length > 0) {
                    item.ApproveContent.ApprovalUsers = ApproveUser;
                    Approves.push(item.ApproveContent);
                }
            }
            this.Approves = Approves;
            return Approves;
        } catch (error) {
            this.errorInfo = { Code: -1, Msg: "客公司的审批人获取失败，请检查网络后重试" };
        }
    }

    setCustomerApproveStatusID = async (passengers, ProductSalesOrder) => {
        try {
            if (this.props.param.isPrivate || this.props.param.BTANr) {
                ProductSalesOrder.CustomerApproveStatusID = 13;
                this.CustomerApproveStatusID = ProductSalesOrder.CustomerApproveStatusID;
                return;
            }
            let ApproveUser = await this.getCustomerCompanyApproveByCompCode(passengers);
            if (ApproveUser.length > 0)
                ProductSalesOrder.CustomerApproveStatusID = 25;
            else {
                let param = {
                    "UserCodes": this.userInfo.Account
                }
                let result = await ApproveInfo.getCusApproveUserByUserCode(param);
                let approveRules = result.Result.ApproveRules;
                if (approveRules.length > 0) {
                    let condition = approveRules[0].ApproveContent;
                    this.Roles = approveRules[0].Roles;
                    if (condition.NoNeed)
                        ProductSalesOrder.CustomerApproveStatusID = 0;
                    else if (condition.HasPassenger && this.employeeList.length > 0)
                        ProductSalesOrder.CustomerApproveStatusID = 25;
                    else if (condition.ViolationApproval && this.info.IsContrPolicy)
                        ProductSalesOrder.CustomerApproveStatusID = 25;
                    else if (condition.CompanyMonthPayment && this.info.PaymentMethodID == 5)
                        ProductSalesOrder.CustomerApproveStatusID = 25;
                    else if (condition.PersonalPayment && this.info.PaymentMethodID == 1)
                        ProductSalesOrder.CustomerApproveStatusID = 25;
                }
            }
            this.CustomerApproveStatusID = ProductSalesOrder.CustomerApproveStatusID;
        } catch (error) {
            this.errorInfo = { Code: -1, Msg: "审批规则获取失败，请检查网络后重试" };
        }
    }

    //设置默认证件
    setDefaultCertificate = (certificates, ticketType) => {
        if (!certificates || certificates.length == 0)
            return null;

        let certificate = Enumerable.from(certificates).firstOrDefault((o) => o.Name == 'ID', -1);
        if (certificate != -1)
            return certificate;
        else
            return certificates[0];

    }

    //初始化员工证件信息
    setEmployeeList = (obj) => {
        obj = toJS(obj);
        for (let item of obj) {
            item.defaultCertificate = null;
            for (let proof of item.Proofs) {
                proof.CertificateName = null;
            }
        }
        this.employeeList = obj;
    }

    //初始化员工证件信息
    initEmployeeList = async (obj) => {
        obj = toJS(obj);
        for (let item of obj) {
            item.CertName = null;
        }
        this.employeeList = obj;
        for (let item of this.employeeList) {
            let info = await CertificateInfo.getCertificateInfo(item.CertType);
            item.CertName = info.Name;
        }
    }

    //明细
    @computed get getDetailData() {
        let arr = [
            { title: lan.booking_ticket_price, price: this.getTicketPrice(), number: this.employeeList.length + this.passengers.length },
            { title: lan.booking_insurance, price: 20, number: this.productInsure ? this.productInsure.PassengersQty : 0 },
        ];
        return arr;
    }

    //票价
    getTicketPrice = () => {
        if (this.props.toChange) {
            let price = this.props.orderDetail.Trade.Orders[0].TotalAmount;
            if (price >= parseFloat(this.props.data.price))
                return 0;
            else
                return parseFloat(this.props.data.price);
        } else
            return parseFloat(this.props.data.price);
    }

    //税费
    getTax = () => {
        return 0;
    }

    //服务费
    getOtherFee = () => {
        return 10;
    }

    //保险价格
    getInsurance = () => {
        return this.productInsure.AdultPrice;
    }

    //签证价格
    getVisa = () => {
        return this.productVisa.UninPrice;
    }

    @computed get getStationStops() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.station.slice());
    }

    //总价
    @computed get getTotalPrice() {
        let totalPrice = this.getTicketPrice() * this.employeeList.length + this.getTax() * this.employeeList.length;
        totalPrice += this.getTicketPrice() * this.passengers.length + this.getTax() * this.passengers.length;
        if (this.productInsure) {
            totalPrice += this.getInsurance() * this.productInsure.PassengersQty;
        }
        if (this.productVisa) {
            totalPrice += this.getVisa() * this.productVisa.PassengersQty;
        }
        return totalPrice;
    }

    setProductSalesOrder = () => {
        let num = this.employeeList.length + this.passengers.length;
        let obj = {
            "GDSCode": "CRH",
            "CustomerDocStatusID": 1,
            "ProductCategoryID": 3,
            "SubProductCategoryID": 94,
            "CompanyCode": this.userInfo.CorpCode,
            "AutoFlowNr": "FF002-GF001-005",
            "FlowRouteNr": "FF002-GF001-005-01",
            "CheckCustomerDocStatus": "1",
            "FirstUserCode": this.userInfo.Account,
            "OwnerUserCode": this.userInfo.Account,
            "StaffCode": this.userInfo.Account,
            "UserCode": this.userInfo.Account,
            "PaymentMethodID": this.info.PaymentMethodID == 9 ? 1 : this.info.PaymentMethodID,
            "SettlementTypeID": this.info.PaymentMethodID == 9 ? 8 : 11,
            "CustomerApproveStatusID": 13,
            "TotalAmount": (this.getTicketPrice() + this.getOtherFee()) * num,
            "ReceivedAmount": 0.0,
            "BalanceAmount": 0.0,
            "CashCouponAmount": 0.0,
            "CurrencyID": 4,
            "VendorTotalAmount": this.getTicketPrice() * num,
            "MiddleVendorTotalAmount": this.getTicketPrice() * num,
            "IP": null,
            "BigCustomerCode": null,
            "LatestDocStatusID": 14,
            "LatestOperationStatusID": 4,
            "IsApprove": false,
            "IsAllowCustomerApprove": null,
            "CreateDate": moment().format(),
            "IsProxyNote": false,
            "IsSettlementNote": false,
            "DeliveryMethodID": null,
            "DeliveryAddress": null,
            "TransferOrderFormulaID": "13a8cb26-e5d4-48c0-8569-b4061c1d728c",
            "TransferOrderFormulaNr": "FN00002",
            "TravelPurpose": this.info.TravelPurpose,
            "PreBookingDay": null,
            "TravelNatureCode": "Public",
            "IsContrPolicy": null,
            "ContrReason": null,
            "ContrContent": null,
            "Discount": null,
            "CustomerRefundAmount": null,
            "ReschedulingTicketAmount": null,
            "ReschedulingIntro": null,
            "CostCenterID": null,
            "CostCenterInfo": null,
            "TicketPrice": null,
            "Tax": null,
            "IsAllowClose": false,
            "PSOTicket": {
                "TravelPolicyID": null,
                "CostCenterID": this.info.CostCenterID,
                "CostCenterInfo": this.info.CostCenterInfo,
                "JourneyType": null,
                "IsContrPolicy": this.info.IsContrPolicy,
                "ContrReason": this.info.ContrReason,
                "ContrContent": this.info.ContrContent,
                "EI": null,
                "TicketTimeLimit": null,
                "CoreFareid": null,
                "CustomerCode": null
            },
            "TicketExpenses": null,
            "PSOPassengers": null,
            "PSOQuotePrices": null,
            "PSOInsurance": null,
            "InsuranceDetails": null,
            "InsuranceExpenses": null,
            "PSOTravelProducts": null,
            "SalesOrderAdvanceCashCoupon": null
        }
        return obj;
    }

    setPSOTrain = () => {
        let data = this.props.detail;
        let param = this.props.param;
        let obj = {
            "TrainTypeCode": null,
            "TrainTypeName": null,
            "ValidDate": null,
            "ProductCode": data.train_code,
            "ProductName": null,
            "Email": this.booking.ContactEmail,
            "DepartureDate": `${param.departureDates[0]}T${data.from_time}`,
            "TrainUseCountrys": null,
            "FirstTravelDate": `${param.departureDates[0]}T${data.from_time}`,
            "NAdditionalRailDays": null,
            "NAdditionalCarDays": null,
            "RailProtectionPlan": null,
            "NAdditionalCountries": null
        }
        return obj;
    }

    setTrainDetail = () => {
        let data = this.props.data;
        let detail = this.props.detail;
        let param = this.props.param;
        let obj = {
            "RouteName": `${param.departures[0].cityName}-${param.arrivals[0].cityName}`,
            "SegmentNr": null,
            "SegmentQty": null,
            "OriginDate": param.departureDates[0],
            "TrainNr": detail.train_code,
            "CabinClass": data.type,
            "CabinCode": null,
            "Seat": this.getSelectSeats.join(''),
            "DepartureCity": param.departures[0].cityName,
            "InternalDepartureCity": null,
            "DepartureTrainStationCode": param.departures[0].cityCode,
            "DepartureTrainStationName": detail.from_station,
            "DepartureDate": `${param.departureDates[0]}T${detail.from_time}`,
            "ArrivalCity": param.arrivals[0].cityName,
            "InternalArrivalCity": null,
            "ArrivalTrainStationCode": param.arrivals[0].cityCode,
            "ArrivalTrainStationName": detail.arrive_station,
            "ArrivalDate": moment(this.props.param.departureDates[0] + "T" + detail.from_time).add(detail.cost_time, 'm').format("YYYY-MM-DDTHH:mm:ss"),
            "ElapsedTime": detail.cost_time,
            "Direction": 1,
            "DirectionSeqNr": null,
            "DisplayOrder": 0,
            "FirstTravelDate": null,
            "Email": null,
            "FareID": null,
            "PrintingOption": null,
            "RailProtectionPlan": null
        }
        return obj;
    }

    setInsuranceExpenses = () => {
        if (!this.productInsure)
            return null;
        let insuranceExpenses = [];
        insuranceExpenses.push({
            "PassengerTypeCode": "ADT",
            "UnitPrice": this.productInsure.AdultPrice,
            "Qty": this.productInsure.PassengersQty,
            "TotalAmount": this.productInsure.PassengersQty * this.productInsure.AdultPrice,
            "CurrencyID": 4,
            "DisplayOrder": 0,
            "VendorUnitPrice": 2.5,
            "VendorExtraFee": 0,
            "VendorTotalAmount": 2.5 * this.productInsure.PassengersQty,
            "OTVendorUnitPrice": 2.5,
            "OTVendorExtraFee": 0,
            "OTVendorTotalAmount": 2.5 * this.productInsure.PassengersQty,
        });
        return insuranceExpenses;
    }

    setInsuranceDetails = (PassengerQty) => {
        if (!this.productInsure)
            return null;
        let insuranceDetails = [];
        Enumerable.range(0, PassengerQty).forEach((a, index) => {
            insuranceDetails.push({
                "PassengerIndex": index,
                "DisplayOrder": 0
            });
        })
        return insuranceDetails;
    }

    setVisaDetails = (PassengerQty) => {
        if (!this.productVisa)
            return null;
        let visaDetails = [];
        Enumerable.range(0, PassengerQty).forEach((a, index) => {
            visaDetails.push({
                "PassengerIndex": index,
                "DisplayOrder": 0
            });
        })
        return visaDetails;
    }

    setPSOVisaCertMgts = () => {
        return [];
    }

    setVisaExpenses = () => {
        if (!this.productVisa)
            return null;
        let visaExpenses = [];
        visaExpenses.push({
            "UnitPrice": this.productVisa.UninPrice,
            "ExtraFee": 0.0000,
            "Qty": this.productVisa.PassengersQty,
            "TotalAmount": this.productVisa.UninPrice * this.productVisa.PassengersQty,
            "CurrencyID": 4,
            "VendorExtraFee": 0.0000,
            "VendorCurrencyID": 4,
            "DisplayOrder": 1
        });
        return visaExpenses;
    }

    setTrainExpense = () => {
        let num = this.employeeList.length + this.passengers.length;
        let obj = {
            "PassengerTypeCode": "ADT",
            "CabinClass": null,
            "TicketPrice": this.getTicketPrice(),
            "Tax": null,
            "OtherFee": 10.0,
            "ExtraFee": null,
            "Qty": num,
            "TotalAmount": (this.getTicketPrice() + this.getOtherFee()) * num,
            "CurrencyID": 4,
            "VendorTicketPrice": this.getTicketPrice(),
            "VendorExtraFee": null,
            "VendorTax": null,
            "VendorOtherFee": 0.0,
            "VendorTotalAmount": this.getTicketPrice() * num,
            "VendorCurrencyID": null,
            "OTVendorTicketPrice": this.getTicketPrice(),
            "OTVendorExtraFee": null,
            "OTVendorTax": 0.0,
            "OTVendorOtherFee": 0.0,
            "OTVendorTotalAmount": this.getTicketPrice() * num,
            "OTVendorCurrencyID": 4
        };
        return obj;
    }

    setTicketExpenses = (PassengerQty, OtherFee, VendorOtherFee, TotalPrice, Price, Tax) => {
        let obj = {
            "PassengerTypeCode": "ADT",
            "TicketPrice": Price,
            "Tax": Tax,
            "OtherFee": OtherFee,
            "ExtraFee": 0.0,
            "PassengerQty": PassengerQty,
            "TotalAmount": TotalPrice,
            "CurrencyID": 4,
            "DisplayOrder": 0,
            "OTVendorExpenseID": null,
            "OTVendorTicketPrice": Price,
            "OTVendorTax": Tax,
            "OTVendorOtherFee": -VendorOtherFee,
            "OTVendorExtraFee": 0.0,
            "OTVendorTotalAmount": TotalPrice - VendorOtherFee,
            "OTVendorCurrencyID": 4,
            "VendorExpenseID": null,
            "VendorTicketPrice": Price,
            "VendorTax": Tax,
            "VendorOtherFee": -VendorOtherFee,
            "VendorExtraFee": 0.0,
            "VendorTotalAmount": TotalPrice - VendorOtherFee,
            "VendorCurrencyID": 4,
            "TicketExpenseDetails": null
        };
        return [obj];
    }

    setPSOPassengers = (PassengerQty) => {
        let PSOPassengers = [];
        Enumerable.range(0, PassengerQty).forEach((a, index) => {
            PSOPassengers.push({
                PassengerIndex: index
            });
        });
        return PSOPassengers;
    }

    setPSOQuotePrices = (TotalPrice, Discount) => {
        let obj = {
            "DisplayType": "ADT",
            "Discount": Discount,
            "RebatePercentage": null,
            "AfterRebatePercentage": null,
            "TicketPrice": TotalPrice,
            "FullTickPrice": null,
            "EconomizeAmount": null,
            "CurrencyID": 4
        }
        return obj;
    }

    setPassengers = () => {
        let passengers = [];
        for (let item of this.employeeList) {
            let passengerName = item.defaultCertificate.Name == "ID" || item.defaultCertificate.Name == "10" ? item.PersonName :
                Enumerable.from([item.PersonLastNameEN, item.PersonFirstNameEN]).where(o => o && o.length > 0).toArray().join("/");
            let contacts = Enumerable.from(item.Annts).firstOrDefault(o => o.Name.toLocaleLowerCase() == "phone", -1);
            let obj = {
                "PassengerCode": item.PersonCode,
                "PassengerName": passengerName,
                "CertTypeCode": item.defaultCertificate.Name,
                "CertNr": item.defaultCertificate.Value,
                "Birthday": item.Birthday,
                "Sex": item.Sex,
                "ContactMobile": contacts == -1 ? null : contacts.Value,
                "PassengerTypeCode": item.Birthday ? PassengerInfo.getPassengerAgeSection(item.Birthday) : "ADT",
            }
            passengers.push(obj);
        }

        for (let item of this.passengers) {
            let passengerName = item.defaultCertificate.ProofType == "ID" || item.defaultCertificate.ProofType == "10" ? item.FullName :
                Enumerable.from([item.LastNameEn, item.FirstNameEn]).where(o => o && o.length > 0).toArray().join("/");
            let contacts = Enumerable.from(item.Contacts).firstOrDefault(o => o.AnntType.toLocaleLowerCase() == "phone", -1);
            let obj = {
                "PassengerCode": item.PersonCode,
                "PassengerName": passengerName,
                "CertTypeCode": item.defaultCertificate.ProofType,
                "CertNr": item.defaultCertificate.Number,
                "Birthday": item.BirthDay,
                "Sex": item.Sex,
                "Nation": item.Nationality,
                "ContactMobile": contacts == -1 ? null : contacts.Annt,
                "PassengerTypeCode": item.BirthDay ? PassengerInfo.getPassengerAgeSection(item.BirthDay) : "ADT",
            }
            passengers.push(obj);
        }

        return passengers;
    }

    setTicketDetail = (flights) => {
        let detail = [];
        let direction = 1;
        for (let flight of flights) {
            let DirectionSeqNr = 1;
            for (let classAvail of flight.Segment.ClassAvail) {
                let ticktPrice = this.props.param.ticketType == 0 ? flight.selectedCabin.Price : flight.Price;
                let Seats = this.props.param.ticketType == 0 ? flight.selectedCabin.Seats : classAvail.Flight.Seats;
                let CabinCode = this.props.param.ticketType == 0 ? flight.selectedCabin.FlightCOS : classAvail.Flight.FlightCOS;
                let CabinClass = this.props.param.ticketType == 0 ? flight.selectedCabin.Cabin : classAvail.Flight.Cabin;
                let ElapsedTime = classAvail.Flight.ElapsedTime.replace(/h/, ":").replace(/m/, ":") + '00'; //by linqin 时间格式为 12:00:00
                let obj = {
                    "ElapsedTime": ElapsedTime,
                    "SegmentNr": detail.length + 1,
                    "SegmentQty": Enumerable.from(flights).sum(o => o.Segment.ClassAvail.length),
                    "OriginDate": moment(classAvail.Flight.DepartureDate).format('YYYY-MM-DD'),
                    "MarketingAirline": classAvail.Flight.MarketingAirline,
                    "FlightNr": classAvail.Flight.FlightNumber,
                    "CabinClass": CabinClass,
                    "CabinCode": CabinCode,
                    "DepartureAirport": classAvail.Flight.Departure,
                    "DepartureTerminal": classAvail.Flight.DepartureTerminal,
                    "TakeOffDate": classAvail.Flight.DepartureDate,
                    "ArrivalAirport": classAvail.Flight.Arrival,
                    "ArrivalTerminal": classAvail.Flight.ArrivalTerminal,
                    "ArrivalDate": classAvail.Flight.ArrivalDate,
                    "CarrierAirline": classAvail.Flight['OperatingAirlineCode'] || classAvail.Flight.MarketingAirline,
                    "CarrierFlightNr": classAvail.Flight.FlightNumber,
                    "Stopover": classAvail.Flight.StopQuantity ? parseInt(classAvail.Flight.StopQuantity) : 0,
                    "Direction": direction,
                    "DirectionSeqNr": DirectionSeqNr,
                    "FlightTypeID": classAvail.count > 1 ? 2 : 1,
                    "AirEquipmentType": classAvail.Flight.Equipment,
                    "TicktPrice": ticktPrice,
                    "CurrencyID": 4,
                    "Availability": Seats,
                    "Tax": flight.Tax,
                    "selectedCabin": flight.selectedCabin
                }
                DirectionSeqNr += 1;
                detail.push(obj);
            }
            direction += 1;
        }
        return detail;
    }

    //是否需要补充英文姓名
    needSupplement = (arr, certificateType) => {
        let isNull = Enumerable.from(arr).any(o => !o || o.length == 0);
        if (certificateType && certificateType != "ID" && certificateType != "10" && isNull)
            return true;
        return false;
    }

    //提交订单
    submit = async () => {
        if (this.info.PaymentMethodID == 9 && this.getTotalPrice >= this.depositAmount) {
            return { Code: -1, Msg: "请联系企业管理员充值，或者暂时更换其他方式进行结算", Title: '现金账户余额不足' };;
        }
        this.errorInfo = { Code: 0 };
        this.isLoading = true;
        let bookingInfo = toJS(this.booking);
        bookingInfo.Passengers = this.setPassengers();
        let productSalesOrders = [];
        let ProductSalesOrder = this.setProductSalesOrder();
        await this.setCustomerApproveStatusID(bookingInfo.Passengers, ProductSalesOrder);
        ProductSalesOrder.PSOTrain = this.setPSOTrain();
        ProductSalesOrder.TrainDetails = [this.setTrainDetail()];
        ProductSalesOrder.TrainExpenses = [this.setTrainExpense()];
        ProductSalesOrder.PSOPassengers = this.setPSOPassengers(bookingInfo.Passengers.length);
        productSalesOrders.push(ProductSalesOrder);
        //保险
        if (this.productInsure && this.productInsure.PassengersQty > 0) {
            let ProductSalesOrder = {
                "SubProductCategoryID": this.productInsure.SubProductCategoryID,
                "CustomerDocStatusID": 1,
                "ProductCategoryID": 4,
                "CompanyCode": this.userInfo.CorpCode,
                "StaffCode": "CMC02A53",
                "PaymentMethodID": 5,
                "SettlementTypeID": 9,
                "TotalAmount": this.productInsure.PassengersQty * this.productInsure.AdultPrice,
                "ReceivedAmount": 0.0,
                "BalanceAmount": 0.0,
                "CashCouponAmount": 0.0,
                "CurrencyID": 4,
                "VendorTotalAmount": this.productInsure.PassengersQty * 2.5,
                "VendorCurrencyID": 4,
                "MiddleVendorTotalAmount": 0.0,
                "IP": null,
                "LatestDocStatusID": 14,
                "LatestOperationStatusID": 4,
                "CreateDate": moment().format(),
                "IsProxyNote": false,
                "IsSettlementNote": false,
            };
            ProductSalesOrder.PSOInsurance = toJS(this.productInsure);
            ProductSalesOrder.InsuranceDetails = this.setInsuranceDetails(bookingInfo.Passengers.length);
            ProductSalesOrder.InsuranceExpenses = this.setInsuranceExpenses();
            productSalesOrders.push(ProductSalesOrder);
        }
        bookingInfo.ProductSalesOrders = productSalesOrders;
        let seatPreference = this.seatPreferenceInfo.find(o => o.value == this.seatPreference);
        bookingInfo.Remark = bookingInfo.Remark;
        if (seatPreference)
            bookingInfo.Remark += " " + lan.booking_seat_preference + ":" + seatPreference.label;

        if (this.errorInfo.Code != 0) {
            this.isLoading = false;
            return this.errorInfo;
        }

        let authPayment = await OrderInfo.getCompanyAuthPaymentByCompCode({
            CompanyCode: this.userInfo.CorpCode
        });

        if (authPayment.CompanyAuthPayment) {
            bookingInfo.ProductSalesOrders[0].SettlementTypeID = 9;
        }

        let result = await OrderInfo.salesOrderAddServer(bookingInfo);
        let orderDetail = new OrderDetail();
        if (this.props.param.BTANr)
            await orderDetail.BTAUpdateStatus(this.props.param.BTANr.ID, 5);
        console.log(bookingInfo);
        // console.log('结果2',JSON.stringify(bookingInfo));
        console.log(result);
        this.isLoading = false;
        return result;
    }

}