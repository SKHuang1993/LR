import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native'
import Enumerable from 'linq'
import { RestAPI } from '../../utils/yqfws'
import Employee from './'
import { CertificateInfo, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo } from '../../utils/data-access/'

export default class BookingPassagerEdit {
    @observable isLoading = false;
    @observable proofTypes;
    @observable costList;
    @observable approveRules;
    @observable roles;
    @observable areaCode = "+86";
    @observable policyList;
    @observable deparmentGetList;
    @observable clientMan = {
        Email: null,
        Phone: null,
        PersonCode: null,
        OperateId: null,
        PassWord: null,
        RePassWord: null,
        IP: null,
        LoginName: null,
        MemeberCardNo: null,
    }
    @observable info = {
        "RoleID": null,
        "ApproveID": null,
        "IsLogin": true,
        "ClientMan": {
            "LoginName": null,
            "PassWord": null,
            "OperateID": this.userInfo.Account,
            "CompanyCode": 'USADM',
            "DepartmentCode": 'USADM01',
            "WorkGroup": null,
            "Name": null,
            "PetName": null,
            "Position": null,
            "CostCenterID": null,
            "CostCenterInfo": null,
            "PolicyID": null,
            "ThirdPartyID": null,
            "LastNameEn": null,
            "FirstNameEn": null,
            "Nationality": null,
            "Sex": null,
            "Birthday": null,
            "Annts": [
                {
                    "Name": "PHONE",
                    "Value": null,
                    "IsOpen": null,
                    "FuncRequired": null
                },
                {
                    "Name": "Email",
                    "Value": null,
                    "IsOpen": null,
                    "FuncRequired": null
                }
            ],
            "Addrs": null,
            "Proofs": [
                {
                    "Name": null,
                    "Value": null,
                    "Issuer": null,
                    "IssuerDate": null,
                    "StartDate": null,
                    "EndDate": null
                }
            ],
            "Milescards": [{
                "Name": null,
                "Value": null,
                "Issuer": null,
                "IssuerDate": null,
                "StartDate": null,
                "EndDate": null
            }]
        }
    }

    //获取旅客证件类型
    getProofTypes = async () => {
        let result = await CertificateInfo.getList();
        let proofTypes = result.Result.ProofTypes;
        this.proofTypes = Enumerable.from(proofTypes).where(o => o.Invalid == 0).select("{value: $.TypeCode,label: $.Name}").toArray();
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

    //读取差旅宝审批规则 
    getCustomerApproveByCondition = async () => {
        let param = {
            "CompanyCode": this.userInfo.CorpCode
        }
        let result = await ApproveInfo.getApproveRule(param);
        let approveRules = result.Result.ApproveRules;
        this.approveRules = Enumerable.from(approveRules).select("{value: $.ID,label: $.Name}").toArray();
    }

    //查询角色列表  
    roleMTRGetList = async () => {
        let param = {
            "ResourceID": 10,
            "CompanyCode": this.userInfo.CorpCode
        }
        let result = await RoleInfo.getsUserRole(param);
        let roles = result.Result.Roles;
        this.roles = Enumerable.from(roles).select("{value: $.ID,label: $.RoleName}").toArray();

    }

    //获取差旅政策列表 
    getPolicyList = async () => {
        let param = {
            "CompanyCode": this.userInfo.CorpCode
        }
        let result = await PolicyInfo.getList(param);
        let policyList = result.Result.PolicyDetails;
        this.policyList = Enumerable.from(policyList).select("{value: $.PolicyID,label: $.PolicyName}").toArray();

    }

    //取得部门列表 
    getDeparmentGetList = async () => {
        let param = {
            "CompanyCode": this.userInfo.CorpCode,
            "DepartmentInvalid": false
        }
        let result = await DepartmentInfo.getList(param);
        let deparments = Enumerable.from(result.Result.Deparments)
            .where(o => o.ParentDepartmentCode == null).toArray();
        let array = [];
        for (let item of deparments) {
            array.push(item);
            this.getSubDeparments(item, array, result.Result.Deparments);
        }
        //console.log(array);
        this.deparmentGetList = Enumerable.from(array).select("{value: $.DepartmentCode,label: $.NameCn}").toArray();
    }

    getSubDeparments = (item, array, deparments) => {
        let list = Enumerable.from(deparments).where(o => o.ParentDepartmentCode === item.DepartmentCode).toArray();
        for (let obj of list) {
            array.push(obj);
            this.getSubDeparments(obj, array, deparments);
        }
    }


    //新增客户(人员资料)信息biz3.0(支持角色和审批)
    insertClientManInfo = async (info, callback) => {
        this.isLoading = true;
        let result = await EmployeeInfo.insertClientManInfo(info);
        this.isLoading = false;
        if (result.Code != 0) {
            Alert.alert(result.Msg);
            return;
        }
        else {
            if (callback)
                callback(result.Result.PersonCode)
        }
    }


    //新增第三方客户(账号)信息
    clientManNoInsert = async (clientMan, PersonCode, callback) => {
        this.isLoading = true;
        let res = await fetch("http://pv.sohu.com/cityjson?ie=utf-8");
        let text = await res.text();
        eval(text);
        let IP = returnCitySN.cip;
        clientMan.IP = IP;
        clientMan.OperateID = this.userInfo.Account;
        clientMan.PersonCode = PersonCode;
        let result = await EmployeeInfo.establishAccount(clientMan);
        this.isLoading = false;
        if (result.Code != 0) {
            Alert.alert(result.Msg);
            return;
        }
        if (callback)
            callback(result.Result.Account);

    }
}