import { RestAPI } from '../yqfws'

export class EmployeeInfo {
    //新增员工
    static insertClientManInfo = async (param) => {
        try {
            let result = await RestAPI.execute("Base.InsertClientManInfo", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取员工列表
    static getList = async (param) => {
        try {
            let result = await RestAPI.execute("Biz3.EmployeeByCondition", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //修改员工信息
    static updateClientManInfo = async (param) => {
        try {
            let result = await RestAPI.execute("Base.UpdateClientManInfo", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //开通员工账号
    static establishAccount = async (param) => {
        try {
            let result = await RestAPI.execute("CRM.ClientManNoInsert", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //随机获取在线旅行顾问
    static getOnlineStaffProfileGet = async (param) => {
        try {
            let result = await RestAPI.execute("CRM.OnlineStaffProfileGet", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

}