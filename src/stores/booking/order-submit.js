import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { RestAPI } from '../../utils/yqfws';
import { OrderInfo, ApproveInfo, RoleInfo } from '../../utils/data-access/';
import moment from 'moment';

export default class OrderSubmit {
    @observable obj;
    @observable seconds = 30;
    constructor(props) {
        this.obj = props;
    }

    getOrderState = async () => {
        let param = {
            "TradeID": this.obj.bookStateInfo.OrderNum,
            "BookerID": this.userInfo.Account,
        }
        let result = await OrderInfo.getSimTrade(param);
        // let value = Enumerable.from(result.Result.Trade.Orders).firstOrDefault(o => o.OrderType == 8 || o.OrderType == 9, -1);
        let value = result.Result.Trade.Orders[0];
        if (value) {
            return { StatusID: value.StatusID, StatusName: value.StatusName };
        }
    }

    addApproveRouting = async (Approves, Roles, SOID) => {
        let CusApproveRoutingPlans = { "CusApproveRoutingPlans": [] };
        if (Approves && Approves.length > 0) {
            for (let Approve of Approves) {
                for (let ApprovalPerson of Approve.ApprovalPersons) {
                    CusApproveRoutingPlans.CusApproveRoutingPlans.push({
                        "SOID": SOID,
                        "RoleID": 0,
                        "RoleName": lan.booking_approval_list,
                        "SeqNr": ApprovalPerson.SeqNr,
                        "CusApproveRoleUsers": Enumerable.from(ApprovalPerson.ApprovalUsers).select("{UserCode:$.UserCode}").toArray()
                    });
                }
            }
        } else if (Roles) {
            for (let role of Roles) {
                let param = {
                    "ResourceID": 10,
                    "RoleIDs": role.ID,
                    "DepartmentCode": this.userInfo.DeptCode
                }
                let result = await RoleInfo.getUserRoleList(param);
                CusApproveRoutingPlans.CusApproveRoutingPlans.push({
                    "SOID": SOID,
                    "RoleID": role.ID,
                    "RoleName": role.Name,
                    "SeqNr": role.SeqNr,
                    "CusApproveRoleUsers": Enumerable.from(result.Result.UserRoles).select("{UserCode:$.UserCode}").toArray()
                });
            }
        }
        if (CusApproveRoutingPlans.CusApproveRoutingPlans.length > 0) {
            let result = await ApproveInfo.addPSOCustomerApproveRouting(CusApproveRoutingPlans);
            console.log(CusApproveRoutingPlans);
            return result;
        }
    }
}