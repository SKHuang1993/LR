import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
import { extendObservable, action, computed, toJS, observable, autorun } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { RestAPI } from '../../utils/yqfws';
import { OrderInfo, PaymentInfo, PassengerInfo, CertificateInfo, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo, ReasonInfo } from '../../utils/data-access/';
import moment from 'moment';
import OrderDetail from '../../stores/travel/orderDetail'

export default class Hotel {
    constructor(props) {
        this.props = props;
        autorun(() => {
            this.booking.ContactPerson = this.contactPersonFirstName + "/" + this.contactPersonLastName;
        })
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
    @observable otherDemand = [
        { value: 0, label: '禁烟/No-Smoking', checked: false },
        { value: 1, label: '禁烟/No-Smoking', checked: false },
        { value: 2, label: '蜜月布置/Honeymoon', checked: false },
        { value: 3, label: '高层楼/Higher-Floor', checked: false },
        { value: 4, label: '提前入住/Early-Arrival', checked: false },
        {
            value: 5, label: '晚点入住/Late Arriva', des: '晚到请务必申明，以免酒店无法正常保留房间，造成客人无法入住',
            checked: false
        },
        { value: 6, label: '原房续住/Extened stay in original room', checked: false },
        { value: 7, label: '请提供内部相通的房间/Connecting rooms', checked: false },
        { value: 8, label: '加婴儿床/Baby Cot', des: '酒店可能会另外收取加床费用', checked: false },

    ];
    @observable otherDemandShow = true;
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
    @observable otherRequirements;
    @observable contactPersonFirstName;
    @observable contactPersonLastName;
    @observable termsCeckbox;
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
        this.availableBalance = result.Result.LedgerAccountCashs.find(o => o.AccountTypeID == 2).AvailableBalance;
        this.depositAmount = result.Result.LedgerAccountCashs.find(o => o.AccountTypeID == 1).DepositAmount;
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
            if (this.props.isPrivate || this.props.param.BTANr) {
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
        Enumerable.from(obj).doAction(o => { o.CertIssue = "CN"; o.CertIssueName = "中国大陆" }).toArray();
        this.employeeList = obj;
    }

    //明细
    @computed get getDetailData() {
        let roomInfo = this.props.data;
        let arr = [
            { title: roomInfo.RoomName, price: roomInfo.AveragePrice * this.props.param.RoomCount, number: this.dayQty },
            { title: "税&服务费", price: roomInfo.VendorTaxExchange, number: 1 },
            { title: "总房价", price: roomInfo.TotalAmount, number: 1 },
        ];
        return arr;
    }

    setProductSalesOrder = () => {
        let autoFlowNr = this.info.PaymentMethodID == 5 ? "FF002-GF001-008" : "FF002-GF001-007";
        let flowRouteNr = this.info.PaymentMethodID == 5 ? "FF002-GF001-008-02" : "FF002-GF001-007-02";
        let obj = {
            "GDSCode": this.props.data.Vendor,
            "CustomerDocStatusID": 1,
            "ProductCategoryID": 2,
            "CompanyCode": this.userInfo.CorpCode,
            "AutoFlowNr": autoFlowNr,
            "FlowRouteNr": flowRouteNr,
            "CheckCustomerDocStatus": "1",
            "PaymentMethodID": this.info.PaymentMethodID == 9 ? 1 : this.info.PaymentMethodID,
            "SettlementTypeID": this.info.PaymentMethodID == 9 ? 8 : 11,
            "CustomerApproveStatusID": 13,
            "FirstUserCode": this.userInfo.Account,
            "OwnerUserCode": this.userInfo.Account,
            "StaffCode": this.userInfo.Account,
            "UserCode": this.userInfo.Account,
            "TotalAmount": this.props.data.TotalAmount,
            "ReceivedAmount": 0.0,
            "BalanceAmount": 0.0,
            "CashCouponAmount": 0.0,
            "CurrencyID": 4,
            "VendorTotalAmount": this.props.data.VendorTotalAmount,
            "MiddleVendorTotalAmount": 0,
            "IP": null,
            "BigCustomerCode": null,
            "LatestDocStatusID": 14,
            "LatestOperationStatusID": 4,
            "IsApprove": false,
            "IsAllowCustomerApprove": null,
            "CreateDate": moment().format(),
            "IsProxyNote": false,
            "IsSettlementNote": false,
            "DeliveryMethodID": 3,
            "DeliveryAddress": null,
            "TransferOrderFormulaID": "13a8cb26-e5d4-48c0-8569-b4061c1d728c",
            "TransferOrderFormulaNr": "FN00002",
            "TravelPurpose": this.info.TravelPurpose,
            "PreBookingDay": null,
            "TravelNatureCode": this.props.isPrivate ? "Private" : "Public",
            "IsContrPolicy": null,
            "ContrReason": null,
            "ContrContent": null,
            "Discount": null,
            "ServerCacheID": "c2204453-290d-4f3e-934a-4ee87b1352fd",
            "PriceSourceRawData": this.setPriceSourceRawData(),
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
                "EI": this.props.data.CancelPolicy.PolicyDetails.join('#'),
                "TicketTimeLimit": this.props.data.CancelPolicy.FreeCancelDate,
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

    setPSOHotel = () => {
        let param = this.props.param;
        let detail = this.props.detail;
        let data = this.props.data;
        let obj = {
            "CityCode": param.DistrictCode,
            "CityName": param.DistrictName,
            "HotelCode": detail.HotelCode,
            "HotelCName": detail.HotelName,
            "HotelEName": detail.HotelEName,
            "CheckInDate": param.CheckInDate,
            "CheckOutDate": param.CheckOutDate,
            "CheckStartTime": null,
            "CheckEndTime": null,
            "IsCheckIn": true,
            "InternalCityCode": null,
            "InternalHotelCode": detail.HotelID,
            "InternalHotelCName": detail.HotelName,
            "BusinessModeID": 2,
            "HotelStar": detail.Star,
            "HotelAddress": detail.Address,
            "HotelTel": detail.Tel,
            "HotelFax": detail.Fax,
            "CustDisplayVendor": "Travelscape LLC",
            "Intro": data.SpecialCheckInInstructions,
            "HotelRoomTypes": [
                {
                    "Action": 1,
                    "ID": null,
                    "HotelInfoID": null,
                    "RoomTypeCode": data.RoomName,
                    "RoomTypeName": data.RoomName,
                    "IsIncludeBreakfast": data.Breakfast.Breakfast,
                    "Intro": data.RoomDescription,
                    "RoomPrice": data.AveragePrice,
                    "VendorRoomPrice": data.VendorAveragePrice,
                    "ServiceTax": 0.0,
                    "HolidayTax": 0.0,
                    "TotalTax": data.VendorTax,
                    "SaleTax": 0.0,
                    "RoomQty": param.RoomCount,
                    "DayQty": this.dayQty,
                    "TotalAmount": data.TotalAmount,
                    "VendorTotalAmount": data.VendorTotalAmount,
                    "CurrencyID": 4,
                    "RoomPassengers": Enumerable.range(0, param.RoomCount).select((o, i) => {
                        return {
                            "RoomNr": data.RoomName,
                            "HotelPassengers": [
                                {
                                    "PassengerName": [this.employeeList[i].PersonFirstNameEN, this.employeeList[i].PersonLastNameEN].join('/'),
                                    "PassengerTypeCode": "ADT",
                                    "PassengerAge": 18,
                                    "PassengerSex": 0
                                }
                            ]
                        }
                    }).toArray()
                }
            ]
        }
        return obj;
    }

    setHotelDetail = (i) => {
        let param = this.props.param;
        let detail = this.props.detail;
        let data = this.props.data;
        let avgTax = data.VendorTaxExchange / this.dayQty;
        let obj = {
            "RoomTypeCode": data.VendorRateCode,
            "RoomTypeName": data.RoomName,
            "InternalRoomTypeCode": null,
            "InternalRoomTypeName": null,
            "BreakfastCode": data.Breakfast.BreakfastDesc,
            "BreakfastName": data.Breakfast.BreakfastDesc,
            "BreakfastQty": 1,
            "DisplayPassengerName": [this.employeeList[i].PersonFirstNameEN, this.employeeList[i].PersonLastNameEN].join('/'),
            "RoomNr": null,
            "ADTQty": 1,
            "CHDQty": 0,
            "DisplayOrder": 1,
            "HotelSubDetails": Enumerable.range(0, this.dayQty).select((o, i) => {
                return {
                    "InDate": moment(param.CheckInDate).add(i, "d").format("YYYY-MM-DD"),
                    "RoomPrice": data.VendorAveragePrice + avgTax,
                    "ExtraBedPrice": 0.0,
                    "ExtraBreakfastPrice": 0.0,
                    "TotalAmount": data.VendorAveragePrice + avgTax,
                    "CurrencyID": 4,
                    "VendorRebatePercentage": null,
                    "VendorRebateAmount": null,
                    "VendorRoomPrice": data.VendorAveragePriceExchange + avgTax,
                    "VendorExtraBedPrice": 0.0,
                    "VendorExtraBreakfastPrice": 0.0,
                    "VendorTotalAmount": data.VendorAveragePriceExchange + avgTax,
                    "VendorCurrencyID": 4,
                    "Effectiveness": true,
                    "OTVendorExpenseID": null,
                    "OTVendorRoomPrice": null,
                    "OTVendorExtraBedPrice": null,
                    "OTVendorExtraBreakfastPrice": null,
                    "OTVendorTotalAmount": null,
                    "OTVendorCurrencyID": null
                }
            }).toArray()
            ,
            "HotelPassengerDetails": [
                {
                    "Action": 0,
                    "PassengerIndex": 0,
                    "BookingTicketNr": null,
                    "StatusID": null,
                    "DisplayOrder": 0
                }
            ]
        };
        return obj;
    }

    setPSORawData = () => {
        let data = this.props.data;
        let obj = {
            "OutTicketAgentRebates": [{
                "DisplayType": data.RoomName,
                "Percentage": data.GrossProfit,
                "CurrencyID": "4"
            }]
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

    setHotelExpenses = () => {
        let obj = {
            "RoomTypeName": this.props.data.RoomName,
            "RoomQty": this.props.param.RoomCount,
            "DayQty": this.dayQty,
            "RoomPrice": this.props.data.TotalAmount,
            "ExtraBedPrice": 0.0,
            "ExtraBreakfastPrice": 0.0,
            "TotalAmount": this.props.data.TotalAmount,
            "CurrencyID": 4,
            "VendorRoomPrice": this.props.data.VendorTotalAmount,
            "VendorExtraBedPrice": 0.0,
            "VendorExtraBreakfastPrice": 0.0,
            "VendorTotalAmount": this.props.data.VendorTotalAmountExchange,
            "VendorCurrencyID": null,
            "DisplayOrder": 0
        };
        return [obj];
    }

    setPriceSourceRawData = () => {
        let param = this.props.param;
        let detail = this.props.detail;
        let data = this.props.data;
        let str = "";
        str += `<OrderBookingRequest>`;
        str += `<CustomerUserAgent>Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3100.0 Safari/537.36</CustomerUserAgent>`;
        str += `<CustomerIpAddress>14.215.172.143</CustomerIpAddress>`;
        str += `<OfficeID>${this.userInfo.CorpCode}</OfficeID>`;
        str += `<Vendor>${data.Vendor}</Vendor>`;
        str += `<VendorCityID>${data.VendorCityID}</VendorCityID>`;
        str += `<VendorHotelID>${data.VendorHotelID}</VendorHotelID>`;
        str += `<VendorRateCode>${data.VendorRateCode}</VendorRateCode>`;
        str += `<PartnerBookingID />`;
        str += `<CheckInDate>${param.CheckInDate}</CheckInDate>`;
        str += `<CheckOutDate>${param.CheckOutDate}</CheckOutDate>`;
        str += `<Adult>${param.Adult}</Adult>`;
        str += `<Children>${param.Children}</Children>`;
        str += `<ChildrenAge />`;
        str += `<RoomCount>${param.RoomCount}</RoomCount>`;
        str += `<GuestRemarks />`;
        str += `<ConfirmType>OnRequest</ConfirmType>`;
        str += `<VendorCurrency>${data.VendorCurrency}</VendorCurrency>`;
        str += `<VendorTotalAmount>${data.VendorTotalAmount}</VendorTotalAmount>`;
        str += `<RoomList>`;
        str += `<HotelRoom>`;
        str += `<RoomContactList>`;
        for (var i = 0; i < this.employeeList.length; i++) {
            str += ` <HotelRoomContact>`;
            str += `<FirstName>${this.employeeList[i].PersonFirstNameEN}</FirstName>`;
            str += `<LastName>${this.employeeList[i].PersonLastNameEN}</LastName>`;
            str += `<Gender>${this.employeeList[i].Sex ? "Male" : "Female"}</Gender>`;
            str += `</HotelRoomContact>`;
        }
        str += `</RoomContactList>`;
        str += `</HotelRoom>`;
        str += `</RoomList>`;
        str += `<ContactName>${this.booking.ContactPerson}</ContactName>`;
        str += `<ContactPhone>${this.booking.ContactMobile}</ContactPhone>`;
        str += `<ContactEmail>${this.booking.ContactEmail}</ContactEmail>`;
        str += `</OrderBookingRequest>`;
        return str;

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
            let contacts = Enumerable.from(item.Annts).firstOrDefault(o => o.Name.toLocaleLowerCase() == "phone", -1);
            let obj = {
                "PassengerCode": item.PersonCode,
                "PassengerName": Enumerable.from([item.PersonLastNameEN, item.PersonFirstNameEN]).where(o => o && o.length > 0).toArray().join("/"),
                "CertTypeCode": "ID",
                "CertNr": null,
                "Birthday": item.Birthday,
                "Sex": item.Sex ? item.Sex : 0,
                "ContactMobile": contacts == -1 ? null : contacts.Value,
                "PassengerTypeCode": item.Birthday ? PassengerInfo.getPassengerAgeSection(item.Birthday) : "ADT",
                "CertIssue": item.CertIssue
            }
            passengers.push(obj);
        }

        return passengers;
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
        if (this.info.PaymentMethodID == 9 && this.props.data.TotalAmount >= this.depositAmount) {
            return { Code: -1, Msg: "请联系企业管理员充值，或者暂时更换其他方式进行结算", Title: '现金账户余额不足' };;
        }
        this.errorInfo = { Code: 0 };
        this.isLoading = true;
        let bookingInfo = toJS(this.booking);
        bookingInfo.Passengers = this.setPassengers();
        //let groupList = Enumerable.from(ticketDetail).groupBy(o => o.MarketingAirline).toArray();
        let productSalesOrders = [];

        let ProductSalesOrder = this.setProductSalesOrder();
        await this.setCustomerApproveStatusID(bookingInfo.Passengers, ProductSalesOrder);
        ProductSalesOrder.PSOHotel = this.setPSOHotel();
        let details = [];
        for (let i = 0; i < this.props.param.RoomCount; i++) {
            details.push(this.setHotelDetail(i));
        }
        ProductSalesOrder.HotelDetails = details;
        ProductSalesOrder.HotelExpenses = this.setHotelExpenses();
        ProductSalesOrder.PSORawData = this.setPSORawData();
        ProductSalesOrder.PSOPassengers = this.setPSOPassengers(bookingInfo.Passengers.length);
        productSalesOrders.push(ProductSalesOrder);
        bookingInfo.ProductSalesOrders = productSalesOrders;

        let result = Enumerable.from(this.otherDemand).where(o => o.checked).select("$.label").toArray();
        let arr = [];
        arr.push(bookingInfo.Remark);
        arr.push(result.join(','));
        arr.push(this.otherRequirements);
        bookingInfo.Remark = arr.filter(o => o && o.trim().length > 0).join(',');

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

        result = await OrderInfo.salesOrderAddServer(bookingInfo);
        let orderDetail = new OrderDetail();
        if (this.props.param.BTANr)
            await orderDetail.BTAUpdateStatus(this.props.param.BTANr.ID, 5);
        console.log(bookingInfo);
        //console.log('结果2', JSON.stringify(bookingInfo));
        console.log(result);
        this.isLoading = false;
        return result;
        // for (let flight of ticketDetail) {
        //     let flights = [flight];
        //     let Price = ticketType == 0 ? Enumerable.from(flights).sum(o => o.selectedCabin.Price) : this.props.selectedFlights[this.props.selectedFlights.length - 1].Price;
        //     let Tax = ticketType == 0 ? Enumerable.from(flights).sum("$.Tax") : this.props.selectedFlights[this.props.selectedFlights.length - 1].Tax;
        //     let OtherFee = Enumerable.from(flights).sum(o => o.selectedCabin.TicketFee);
        //     let VendorOtherFee = Enumerable.from(flights).sum(o => o.selectedCabin.Commission);
        //     let TotalPrice = (Price + Tax) * bookingInfo.Passengers.length;
        //     let Discount = Enumerable.from(flights).sum(o => o.selectedCabin.DiscountRate ? o.selectedCabin.DiscountRate : 10) / flights.length;

        //     let ProductSalesOrder = this.setProductSalesOrder(OtherFee, VendorOtherFee, TotalPrice, flight);
        //     await this.setCustomerApproveStatusID(bookingInfo.Passengers, ProductSalesOrder);
        //     ProductSalesOrder.TicketDetails = flights;
        //     ProductSalesOrder.TicketExpenses = this.setTicketExpenses(bookingInfo.Passengers.length, OtherFee, VendorOtherFee, TotalPrice, Price, Tax);
        //     ProductSalesOrder.PSOPassengers = this.setPSOPassengers(bookingInfo.Passengers.length);
        //     ProductSalesOrder.PSOQuotePrices = [this.setPSOQuotePrices(Price, Discount)];
        //     productSalesOrders.push(ProductSalesOrder);

        //保险
        if (this.productInsure && this.productInsure.PassengersQty > 0) {
            let ProductSalesOrder = {
                "GDSCode": this.props.selectedFlights[this.props.selectedFlights.length - 1].AgencyCode,
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
        // let result = await OrderInfo.salesOrderAddServer(bookingInfo);
        // let orderDetail = new OrderDetail();
        // if (this.props.param.BTANr)
        //     await orderDetail.BTAUpdateStatus(this.props.param.BTANr.ID, 5);
        console.log(bookingInfo);
        // console.log('结果2',JSON.stringify(bookingInfo));
        console.log(result);
        this.isLoading = false;
        return result;
    }

}