import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { RestAPI } from '../../utils/yqfws';
import { OrderInfo, PaymentInfo, PassengerInfo, CertificateInfo, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo, ReasonInfo } from '../../utils/data-access/';
import moment from 'moment';
import { airData } from '../../utils/acCodeOrAcName';
import OrderDetail from '../../stores/travel/orderDetail'

export default class Booking {
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
    @observable passengerDatas = [];
    @observable insuranceResult;
    @observable productInsure;
    @observable productVisa;
    @observable costList;
    @observable isLoading = false;
    @observable seatPreference;
    @observable travelReasonList;
    @observable policyReasonList;
    @observable action = 1;
    @observable booker = null;
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
            if (this.errorInfo.Code == -1)
                return;
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
        //国内航班
        if (ticketType == 0) {
            let certificate = Enumerable.from(certificates).firstOrDefault((o) => o.Name == 'ID', -1);
            if (certificate != -1)
                return certificate;
            else
                return certificates[0];
        }
        //国际航班
        else {
            let certificate = Enumerable.from(certificates).firstOrDefault((o) => o.Name == 'PP', -1);
            if (certificate != -1)
                return certificate;
            else
                return certificates[0];
        }
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

    //获取我的常旅客
    getPassengerByCondition = async (account) => {
        this.isLoading = true;
        let param = { AccountCode: account };
        let info = await PassengerInfo.getList(param);
        Enumerable.from(info.Result.PassengerDatas).doAction((o, i) => {
            o.checked = false;
        }).toArray();
        this.passengerDatas = info.Result.PassengerDatas;
        console.log(info);
        this.isLoading = false;
    }

    //明细
    @computed get getDetailData() {
        let arr = [
            { title: lan.booking_ticket_price, price: this.getTicketPrice(), number: this.employeeList.length + this.passengers.length },
            { title: this.props.param.ticketType == 0 ? lan.flights_enginePlusFuel : lan.flights_taxation, price: this.getTax(), number: this.employeeList.length + this.passengers.length },
            { title: '付票价', price: this.getSourcePrice(), number: this.employeeList.length + this.passengers.length },
        ];
        if (!this.props.selectedFlights[0].EncourageFee)
            this.props.selectedFlights[0].EncourageFee = 0;
        if (this.props.param.ticketType != 0) {
            arr.push({ title: '返点', price: this.props.selectedFlights[0].EncourageFee + "%"});
        }
        if (this.productInsure && this.productInsure.PassengersQty > 0) {
            arr.push({ title: lan.booking_insurance, price: this.getInsurance(), number: this.productInsure.PassengersQty });
        }
        if (this.productVisa && this.productVisa.PassengersQty > 0) {
            arr.push({ title: lan.booking_visa, price: this.getVisa(), number: this.productVisa.PassengersQty });
        }
        return arr;
    }

    //票价
    getTicketPrice = () => {
        let ticketType = this.props.param.ticketType;
        let price = ticketType == 0 ? Enumerable.from(this.props.selectedFlights).sum(o => o.selectedCabin.Price) : this.props.selectedFlights[this.props.selectedFlights.length - 1].Price;
        return price;
    }

    //付票价
    getSourcePrice = () => {
        let ticketType = this.props.param.ticketType;
        let price = ticketType == 0 ? Enumerable.from(this.props.selectedFlights).sum(o => o.selectedCabin.SourcePrice) : this.props.selectedFlights[this.props.selectedFlights.length - 1].selectedCabin.SourcePrice;
        return price;
    }

    //税费
    getTax = () => {
        let ticketType = this.props.param.ticketType;
        let tax = ticketType == 0 ? Enumerable.from(this.props.selectedFlights).sum("$.Tax") : this.props.selectedFlights[this.props.selectedFlights.length - 1].Tax;
        return tax;
    }

    //保险价格
    getInsurance = () => {
        return this.productInsure.AdultPrice;
    }

    //签证价格
    getVisa = () => {
        return this.productVisa.UninPrice;
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

    setProductSalesOrder = (OtherFee, VendorOtherFee, TotalPrice, flight, passengers) => {
        let autoFlowNr = this.info.PaymentMethodID == 5 ? "FF002-GF001-003" : "FF002-GF001-004";
        let flowRouteNr = this.info.PaymentMethodID == 5 ? "FF002-GF001-003-01" : "FF002-GF001-004-01";
        if (this.props.param.ticketType == 0) {
            autoFlowNr = this.info.PaymentMethodID == 5 ? "FF002-GF001-001" : "FF002-GF001-002";
            flowRouteNr = this.info.PaymentMethodID == 5 ? "FF002-GF001-001-01" : "FF002-GF001-002-01";
        }
        let obj = {
            "Action": this.action,
            "GDSCode": this.props.selectedFlights[this.props.selectedFlights.length - 1].AgencyCode,
            "CustomerDocStatusID": 1,
            "ProductCategoryID": this.props.param.ticketType == 0 ? 8 : 9,
            "CompanyCode": this.userInfo.CorpCode,
            "AutoFlowNr": autoFlowNr,
            "FlowRouteNr": flowRouteNr,
            "CheckCustomerDocStatus": "1",
            "FirstUserCode": this.userInfo.Account,
            "OwnerUserCode": this.userInfo.Account,
            "StaffCode": this.userInfo.Account,
            "PaymentMethodID": this.info.PaymentMethodID == 9 ? 1 : this.info.PaymentMethodID,
            "SettlementTypeID": this.info.PaymentMethodID == 9 ? 8 : 11,
            "CustomerApproveStatusID": 13,
            "UserCode": this.userInfo.Account,
            "TotalAmount": TotalPrice + (OtherFee * passengers),
            "ReceivedAmount": 0.0,
            "BalanceAmount": 0.0,
            "CashCouponAmount": 0.0,
            "CurrencyID": 4,
            "VendorTotalAmount": TotalPrice - (VendorOtherFee * passengers),
            "MiddleVendorTotalAmount": TotalPrice - (VendorOtherFee * passengers),
            "IP": null,
            "BigCustomerCode": this.props.selectedFlights[0].selectedCabin.BigCustomerCode,
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
            "PreBookingDay": moment(this.props.selectedFlights[0].DepartureDate).diff(moment(), 'd'),
            "TravelNatureCode": this.props.param.isPrivate ? "Private" : "Public",
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
                "Action": this.action,
                "TravelPolicyID": null,
                "CostCenterID": this.info.CostCenterID,
                "CostCenterInfo": this.info.CostCenterInfo,
                "JourneyType": this.props.param.tripType + 1,
                "IsContrPolicy": this.info.IsContrPolicy,
                "ContrReason": this.info.ContrReason,
                "ContrContent": this.info.ContrContent,
                "EI": flight.selectedCabin.Rule,
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

    setTicketExpenses = (PassengerQty, OtherFee, VendorOtherFee, TotalPrice, Price, Tax) => {
        let obj = {
            "Action": this.action,
            "PassengerTypeCode": "ADT",
            "TicketPrice": Price,
            "Tax": Tax,
            "OtherFee": OtherFee,
            "ExtraFee": 0.0,
            "PassengerQty": PassengerQty,
            "TotalAmount": TotalPrice + (OtherFee * PassengerQty),
            "CurrencyID": 4,
            "DisplayOrder": 0,
            "OTVendorExpenseID": null,
            "OTVendorTicketPrice": Price,
            "OTVendorTax": Tax,
            "OTVendorOtherFee": -VendorOtherFee,
            "OTVendorExtraFee": 0.0,
            "OTVendorTotalAmount": TotalPrice - (VendorOtherFee * PassengerQty),
            "OTVendorCurrencyID": 4,
            "VendorExpenseID": null,
            "VendorTicketPrice": Price,
            "VendorTax": Tax,
            "VendorOtherFee": -VendorOtherFee,
            "VendorExtraFee": 0.0,
            "VendorTotalAmount": TotalPrice - (VendorOtherFee * PassengerQty),
            "VendorCurrencyID": 4,
            "TicketExpenseDetails": null
        };
        return [obj];
    }

    setPSOPassengers = (PassengerQty) => {
        let PSOPassengers = [];
        Enumerable.range(0, PassengerQty).forEach((a, index) => {
            PSOPassengers.push({
                Action: this.action,
                PassengerIndex: index
            });
        });
        return PSOPassengers;
    }

    setPSOQuotePrices = (TotalPrice, Discount, OtherFee) => {
        let obj = {
            "Action": this.action,
            "DisplayType": "ADT",
            "Discount": Discount,
            "RebatePercentage": null,
            "AfterRebatePercentage": null,
            "TicketPrice": TotalPrice + OtherFee,
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

    setFlightInfo = (v1) => {
        let target = airData.NewDataSet.AirDataList.find(o => v1.MarketingAirline.Code == o.carriercode);
        let obj = {
            title: {
                leg: "旧",
                date: v1.DepartureTime,
                city: lan.lang == "ZH" ? `${v1.DepartureAirport.CityName} - ${v1.ArrivalAirport.CityName}` : `${v1.DepartureAirport.AirportCode} - ${v1.ArrivalAirport.AirportCode}`,
            },
            //列表
            list: [{
                "Departure": v1.DepartureAirport.CityCode,
                "Arrival": v1.ArrivalAirport.CityCode,
                "DepartureInfo": {
                    "airportCode": v1.DepartureAirport.AirportCode,
                    "airportNameEn": "",
                    "airportNameCn": v1.DepartureAirport.AirportName,
                    "cityCode": v1.DepartureAirport.CityCode,
                    "cityIataCode": '',
                    "cityNameEn": "",
                    "cityNameCn": v1.DepartureAirport.CityName,
                    "countryCode": v1.DepartureAirport.CountryCode,
                    "countryNameEn": '',
                    "countryNameCn": v1.DepartureAirport.CountryName,
                    "continentCode": "",
                    "continentNameCn": "",
                    "timeZone": ""
                },
                "ArrivalInfo": {
                    "airportCode": v1.ArrivalAirport.AirportCode,
                    "airportNameEn": "",
                    "airportNameCn": v1.ArrivalAirport.AirportName,
                    "cityCode": v1.ArrivalAirport.CityCode,
                    "cityIataCode": '',
                    "cityNameEn": "",
                    "cityNameCn": v1.ArrivalAirport.CityName,
                    "countryCode": v1.ArrivalAirport.CountryCode,
                    "countryNameEn": '',
                    "countryNameCn": v1.ArrivalAirport.CountryName,
                    "continentCode": "",
                    "continentNameCn": "",
                    "timeZone": ""
                },
                "DepartureDate": v1.DepartureTime,
                "ArrivalDate": v1.ArrivalTime,
                "MarketingAirline": v1.MarketingAirline.Code,
                "MarketingAirlineName": target ? target.shortname : null,
                "FlightNumber": v1.FlightNumber,
                "DepartureTerminal": v1.DepartureAirport.Terminal,
                "ArrivalTerminal": v1.ArrivalAirport.Terminal,
                "Equipment": v1.Equipment,
                "ElapsedTime": parseInt(v1.ElapsedTime / 60) + "h" + (v1.ElapsedTime % 60) + "m",
                "Miles": "",//英里
                "StopQuantity": "0",
            }]
        }
        return obj;
    }

    //改签
    updateSalesOrder = async (detail) => {
        try {
            this.isLoading = true;
            let bookingInfo = toJS(this.booking);
            bookingInfo.Passengers = this.employeeList;
            let ticketDetail = this.setTicketDetail(this.props.selectedFlights);
            //let groupList = Enumerable.from(ticketDetail).groupBy(o => o.MarketingAirline).toArray();
            let productSalesOrders = [];
            let ticketType = this.props.param.ticketType;
            //国内机票
            if (ticketType == 0)
                for (let flight of ticketDetail) {
                    let flights = [flight];
                    let Price = ticketType == 0 ? Enumerable.from(flights).sum(o => o.selectedCabin.SourcePrice) : this.props.selectedFlights[this.props.selectedFlights.length - 1].Price;
                    let Tax = ticketType == 0 ? Enumerable.from(flights).sum("$.Tax") : this.props.selectedFlights[this.props.selectedFlights.length - 1].Tax;
                    let OtherFee = Enumerable.from(flights).sum(o => o.selectedCabin.TicketFee);
                    let VendorOtherFee = Enumerable.from(flights).sum(o => o.selectedCabin.Commission);
                    let TotalPrice = (Price + Tax) * bookingInfo.Passengers.length;
                    let Discount = Enumerable.from(flights).sum(o => o.selectedCabin.DiscountRate ? o.selectedCabin.DiscountRate : 10) / flights.length;

                    let ProductSalesOrder = this.setProductSalesOrder(OtherFee, VendorOtherFee, TotalPrice, flight, bookingInfo.Passengers.length);
                    ProductSalesOrder.TicketDetails = flights;
                    ProductSalesOrder.TicketExpenses = this.setTicketExpenses(bookingInfo.Passengers.length, OtherFee, VendorOtherFee, TotalPrice, Price, Tax);
                    ProductSalesOrder.PSOPassengers = this.setPSOPassengers(bookingInfo.Passengers.length);
                    ProductSalesOrder.PSOQuotePrices = [this.setPSOQuotePrices(Price, Discount, OtherFee)];
                    ProductSalesOrder.PSOTypeID = 2;
                    ProductSalesOrder.PSORelated = this.setPSORelated(detail.Trade.Orders[0].InnerID.ID);
                    productSalesOrders.push(ProductSalesOrder);
                } else {
                let flights = ticketDetail;
                let Price = ticketType == 0 ? Enumerable.from(flights).sum(o => o.selectedCabin.Price) : this.props.selectedFlights[this.props.selectedFlights.length - 1].Price;
                let Tax = ticketType == 0 ? Enumerable.from(flights).sum("$.Tax") : this.props.selectedFlights[this.props.selectedFlights.length - 1].Tax;
                let OtherFee = Enumerable.from(flights).sum(o => o.selectedCabin.TicketFee);
                let VendorOtherFee = Enumerable.from(flights).sum(o => o.selectedCabin.Commission);
                let TotalPrice = (Price + Tax) * bookingInfo.Passengers.length;
                let Discount = Enumerable.from(flights).sum(o => o.selectedCabin.DiscountRate ? o.selectedCabin.DiscountRate : 10) / flights.length;

                let ProductSalesOrder = this.setProductSalesOrder(OtherFee, VendorOtherFee, TotalPrice, flight, bookingInfo.Passengers.length);
                ProductSalesOrder.TicketDetails = flights;
                ProductSalesOrder.TicketExpenses = this.setTicketExpenses(bookingInfo.Passengers.length, OtherFee, VendorOtherFee, TotalPrice, Price, Tax);
                ProductSalesOrder.PSOPassengers = this.setPSOPassengers(bookingInfo.Passengers.length);
                ProductSalesOrder.PSOQuotePrices = [this.setPSOQuotePrices(Price, Discount, OtherFee)];
                ProductSalesOrder.PSOTypeID = 2;
                ProductSalesOrder.PSORelated = this.setPSORelated(detail.Trade.Orders[0].InnerID.ID);
                productSalesOrders.push(ProductSalesOrder);
            }
            let PSODerivative = await OrderInfo.getPSODerivativeSeqNrByPSOID({
                "PSOShortNr": detail.Trade.Orders[0].OrderID
            });
            let param = {
                "Action": 0,
                "OriginalSOShortNr": detail.Trade.TradeID,
                "ChangeSeqNr": PSODerivative.Result.SeqNr + 1,
                "OriginalPSOShortNr": detail.Trade.Orders[0].OrderID,
                "ProductSalesOrders": productSalesOrders
            }
            let result = await OrderInfo.updateSalesOrder(param);
            this.isLoading = false;
            console.log(result);
            return result;
        } catch (err) {
            Alert.alert("改签失败，请重试");
        }
    }

    setPSORelated = (ID) => {
        let obj = {
            Action: 1,
            OriginalID: ID
        }
        return obj;
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
                    "Action": this.action,
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
        let ticketDetail = this.setTicketDetail(this.props.selectedFlights);
        //let groupList = Enumerable.from(ticketDetail).groupBy(o => o.MarketingAirline).toArray();
        let productSalesOrders = [];
        let ticketType = this.props.param.ticketType;
        //国内机票
        if (ticketType == 0)
            for (let flight of ticketDetail) {
                let flights = [flight];
                let Price = ticketType == 0 ? Enumerable.from(flights).sum(o => o.selectedCabin.SourcePrice) : this.props.selectedFlights[this.props.selectedFlights.length - 1].Price;
                let Tax = ticketType == 0 ? Enumerable.from(flights).sum("$.Tax") : this.props.selectedFlights[this.props.selectedFlights.length - 1].Tax;
                let OtherFee = Enumerable.from(flights).sum(o => o.selectedCabin.TicketFee);
                let VendorOtherFee = Enumerable.from(flights).sum(o => o.selectedCabin.Commission);
                let TotalPrice = (Price + Tax) * bookingInfo.Passengers.length;
                let Discount = Enumerable.from(flights).sum(o => o.selectedCabin.DiscountRate ? o.selectedCabin.DiscountRate : 10) / flights.length;

                let ProductSalesOrder = this.setProductSalesOrder(OtherFee, VendorOtherFee, TotalPrice, flight, bookingInfo.Passengers.length);
                await this.setCustomerApproveStatusID(bookingInfo.Passengers, ProductSalesOrder);
                ProductSalesOrder.TicketDetails = flights;
                ProductSalesOrder.TicketExpenses = this.setTicketExpenses(bookingInfo.Passengers.length, OtherFee, VendorOtherFee, TotalPrice, Price, Tax);
                ProductSalesOrder.PSOPassengers = this.setPSOPassengers(bookingInfo.Passengers.length);
                ProductSalesOrder.PSOQuotePrices = [this.setPSOQuotePrices(Price, Discount, OtherFee)];
                productSalesOrders.push(ProductSalesOrder);
            } else {
            let flights = ticketDetail;
            let Price = ticketType == 0 ? Enumerable.from(flights).sum(o => o.selectedCabin.Price) : this.props.selectedFlights[this.props.selectedFlights.length - 1].Price;
            let Tax = ticketType == 0 ? Enumerable.from(flights).sum("$.Tax") : this.props.selectedFlights[this.props.selectedFlights.length - 1].Tax;
            let OtherFee = Enumerable.from(flights).sum(o => o.selectedCabin.TicketFee);
            let VendorOtherFee = Enumerable.from(flights).sum(o => o.selectedCabin.Commission);
            let TotalPrice = (Price + Tax) * bookingInfo.Passengers.length;
            let Discount = Enumerable.from(flights).sum(o => o.selectedCabin.DiscountRate ? o.selectedCabin.DiscountRate : 10) / flights.length;

            let ProductSalesOrder = this.setProductSalesOrder(OtherFee, VendorOtherFee, TotalPrice, flights[0], bookingInfo.Passengers.length);
            await this.setCustomerApproveStatusID(bookingInfo.Passengers, ProductSalesOrder);
            ProductSalesOrder.TicketDetails = flights;
            ProductSalesOrder.TicketExpenses = this.setTicketExpenses(bookingInfo.Passengers.length, OtherFee, VendorOtherFee, TotalPrice, Price, Tax);
            ProductSalesOrder.PSOPassengers = this.setPSOPassengers(bookingInfo.Passengers.length);
            ProductSalesOrder.PSOQuotePrices = [this.setPSOQuotePrices(Price, Discount, OtherFee)];
            productSalesOrders.push(ProductSalesOrder);
        }
        //保险
        if (this.productInsure && this.productInsure.PassengersQty > 0) {
            let ProductSalesOrder = {
                "SubProductCategoryID": this.productInsure.SubProductCategoryID,
                "GDSCode": "ISP",
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
        //签证
        if (this.productVisa && this.productVisa.PassengersQty > 0) {
            let ProductSalesOrder = {
                "GDSCode": this.props.selectedFlights[this.props.selectedFlights.length - 1].AgencyCode,
                "CustomerDocStatusID": 1,
                "ProductCategoryID": 5,
                "CompanyCode": this.userInfo.CorpCode,
                "StaffCode": "CMC02A53",
                "PaymentMethodID": 5,
                "SettlementTypeID": 9,
                "TotalAmount": this.productVisa.PassengersQty * this.productVisa.UninPrice,
                "ReceivedAmount": 0.0,
                "BalanceAmount": this.productVisa.PassengersQty * this.productVisa.UninPrice,
                "CashCouponAmount": 0.0,
                "CurrencyID": 4,
                "VendorTotalAmount": this.productVisa.PassengersQty * this.productVisa.CostPrice,
                "VendorCurrencyID": 4,
                "MiddleVendorTotalAmount": 0.0,
                "IP": null,
                "LatestDocStatusID": 14,
                "LatestOperationStatusID": 4,
                "CreateDate": moment().format(),
                "IsProxyNote": false,
                "IsSettlementNote": false,
            };
            ProductSalesOrder.PSOVisa = toJS(this.productVisa);
            ProductSalesOrder.VisaDetails = this.setVisaDetails(bookingInfo.Passengers.length);
            ProductSalesOrder.VisaExpenses = this.setVisaExpenses();
            ProductSalesOrder.PSOVisaCertMgts = this.setPSOVisaCertMgts();
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