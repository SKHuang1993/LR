import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native'
import Enumerable from 'linq'
import { RestAPI } from '../../utils/yqfws'
import { CabinInfo, EmployeeInfo, PolicyInfo, DepartmentInfo, PassengerInfo } from '../../utils/data-access/';
import moment from 'moment';
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
let lan = BaseComponent.getLocale();


export default class Employee {
    @observable PSOPassengerList = [];
    @observable employeeList = [];
    @observable isLoading = false;//是否显示loading
    @observable checkedData = [];
    pageIndex = 1;//页数索引
    @observable condition = null;
    departmentCode = null;
    policyID = null;
    @observable isEmployeeLoaded = false;//是否加载完成员工数据
    @observable departments = [];
    @observable policies = []
    @observable isEmptyData = false;

    //获取员工列表
    getEmployeeByCondition = async (pageIndex) => {
        this.isEmptyData = false;
        if (this.isEmployeeLoaded)
            return
        this.pageIndex = pageIndex;
        this.isLoading = true;
        let param = {
            "PersonCode": this.PersonCode,
            "CompanyCode": this.userInfo.CorpCode,
            "DepartmentCode": this.departmentCode,
            "BizcommissionerUserCode": null,
            "Condition": this.condition,
            "PolicyID": this.policyID,
            "CostCenterID": null,
            "PageSize": 20,
            "PageCount": pageIndex
        }
        let result = await EmployeeInfo.getList(param);
        result = result.Result;
        if (this.type == 1)
            result.EmployeeInfos = Enumerable.from(result.EmployeeInfos).where(o => o.PersonCode != this.userInfo.EmpCode).toArray();
        let employeeInfos = Enumerable.from(result.EmployeeInfos).join(this.checkedData, '$.PersonCode', '$.PersonCode').toArray();
        for (let i of employeeInfos) i.checked = true;

        this.employeeList = this.employeeList.concat(result.EmployeeInfos);
        if (this.employeeList.length == 0) {
            this.isEmptyData = true;
            this.isEmployeeLoaded = true;
        }
        await this.getPSOPassengerByBookerID();
        this.isLoading = false;
        if (this.employeeList.length >= result.RowCount) {
            this.isEmployeeLoaded = true;
            this.employeeList = this.employeeList.slice();
        }

    }

    //获取员工信息
    getEmployeeByMyself = async (PersonCode) => {
        let param = {
            "PersonCode": PersonCode,
            "CostCenterID": null,
            "PageSize": 3,
            "PageCount": 1
        }
        let result = await EmployeeInfo.getList(param);
        let employeeInfos = result.Result.EmployeeInfos;
        return employeeInfos;

    }

    getPSOPassengerByBookerID = async () => {
        let param = {
            "BookerID": this.userInfo.Account,
            "StartDate": moment().subtract(10, 'd'),
            "EndDate": moment().format(),
            "PageSize": 3,
            "PageCount": 1
        }
        let result = await PassengerInfo.getPSOPassengerByBookerID(param);
        let PSOPassengerList = result.PSOPassengerList;
        let PersonCode = Enumerable.from(PSOPassengerList).take(3).select(o => o.PersonCode).toArray().join(',');
        result = await this.getEmployeeByMyself(PersonCode);
        let employeeInfos = Enumerable.from(result).join(this.checkedData, '$.PersonCode', '$.PersonCode', (a, b) => a).toArray();
        for (let i of employeeInfos) i.checked = true;
        this.PSOPassengerList = result;
    }

    //获取差旅政策
    getPolicy = async (policyID, ticketType) => {
        if (!policyID || policyID == 53) {
            return lan.noData;
        }
        let param = {
            "PolicyID": policyID
        }
        let result = await PolicyInfo.getPolicy(param);
        result = result.Result;
        let policy;
        if (ticketType == 0)
            policy = result.PolicyDetail.PolicyContent.PolicyDomestic;
        else if (ticketType == 1)
            policy = result.PolicyDetail.PolicyContent.PolicyInternational;
        else if (ticketType == 2)
            policy = result.PolicyDetail.PolicyContent.PolicyHotel;
        else if (ticketType == 3)
            policy = result.PolicyDetail.PolicyContent.PolicyDomesticTrain;
        if (!policy) {
            return lan.noData;
        }
        let msg = PolicyInfo.getPolicyDetail(ticketType, policy).join("\n");
        return msg;
    }

    //获取差旅政策列表
    getPolicyList = async (CompanyCode) => {
        let param = {
            "CompanyCode": this.userInfo.CorpCode
        }
        let result = await PolicyInfo.getList(param);
        result = result.Result;
        for (let item of result.PolicyDetails) item.checked = false;
        this.policies = result.PolicyDetails;
    }

    //取得部门列表 
    getDeparmentGetList = async (companyCode) => {
        let param = {
            "CompanyCode": this.userInfo.CorpCode,
            "DepartmentInvalid": false
        }
        let result = await DepartmentInfo.getList(param);
        result = result.Result;
        let deparments = Enumerable.from(result.Deparments)
            .where(o => o.ParentDepartmentCode == null).toArray();
        for (let item of deparments) {
            this.creatDeparmentTree(result, item, this.codes);
        }
        this.departments = deparments;
    }

    creatDeparmentTree = (result, item, deparments) => {
        let subDepartments = Enumerable.from(result.Deparments)
            .where(o => o.ParentDepartmentCode == item.DepartmentCode).toArray();
        item.subDepartments = subDepartments;
        item.checked = false;
        item.disabled = !Enumerable.from(this.codes).any(a => a == item.DepartmentCode);
        item._subDepartments = [];
        if (subDepartments.length == 0) return;
        for (let item of subDepartments) {
            this.creatDeparmentTree(result, item, this.codes);
        }
    }

    traversalTree = () => {
        let isChecked = [];
        for (let item of this.departments) {
            if (item.checked)
                isChecked.push(item);
            this.DFS(item, isChecked);
        }
        return isChecked;
    }

    DFS = (deparments, isChecked) => {
        for (let item of deparments.subDepartments) {
            if (item.checked)
                isChecked.push(item);
            this.DFS(item, isChecked);
        }
    }

    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.employeeList.slice());
    }

    @computed get getDepartments() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.departments.slice());
    }

    @computed get getPolicies() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.policies.slice());
    }

}