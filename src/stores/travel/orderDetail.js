import { extendObservable, action, computed, toJS, observable, autorun } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { Toast } from 'antd-mobile';
import { RestAPI } from '../../utils/yqfws';
import { BusinessTrip, OrderInfo, PaymentInfo, PassengerInfo, CertificateInfo, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo, ReasonInfo } from '../../utils/data-access/';
import moment from 'moment';

import { BaseComponent, en_US, zh_CN } from '../../components/locale';
let lan = BaseComponent.getLocale();

export default class OrderDetail {
    @observable detail = {};
    @observable isLoading = false;
    businessTripApplicationByID = async (ID, event) => {
        this.isLoading = true;
        let param = {
            "ID": ID
        }
        let result = await BusinessTrip.BusinessTripApplicationByID(param);
        console.log(result);
        this.isLoading = false;
        this.detail = result.Detail;
        if (this.RefreshEvent)
            this.RefreshEvent(ID, this.detail.StatusID);
    }

    //获取当前登录用户的员工信息
    getEmployeeByMyself = async (PersonCode) => {
        let param = {
            "PersonCode": PersonCode,
            "CostCenterID": null,
            "PageSize": 20,
            "PageCount": 1
        }
        let result = await EmployeeInfo.getList(param);
        let employeeInfos = result.Result.EmployeeInfos;
        return employeeInfos;

    }

    addActuallyApproval = async (ID, IsPass,reason) => {
        this.isLoading = true;
        let param = {
            "BTAID": ID,
            "UserCode": this.userInfo.Account,
            "IsPass": IsPass,
            "Remark": reason
        }
        let result = await BusinessTrip.ActuallyApprovalAdd(param);
        this.isLoading = false;
        await this.businessTripApplicationByID(ID);
        if (result && result.Code == -1) {
            Alert.alert(result.Msg);
            return;
        }
        Toast.info(IsPass ? lan.approvalPassed : lan.approvalRefused, Toast.SHORT);
    }


    BTAUpdateStatus = async (ID, StatusID) => {
        this.isLoading = true;
        let param = {
            "ID": ID,
            "StatusID": StatusID
        }
        let result = await BusinessTrip.BTAUpdateStatus(param);
        this.isLoading = false;
        if (result && result.Code == -1) {
            Alert.alert(result.Msg);
            return;
        }
        this.detail.StatusID = StatusID;
        if (StatusID == 6) {
            this.detail.StatusCName = lan.shutDown;
            Alert.alert(lan.approvalClosed);
        }
    }
}