import { RestAPI } from '../yqfws'
import { Log } from './';

export class ApproveInfo {
    //读取差旅宝审批规则 
    static getApproveRule = async (param) => {
        try {
            let result = await RestAPI.execute("Biz3.CustomerApproveByCondition", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //查询客公司的审批人 
    static getCustomerCompanyApproveByCompCode = async (param) => {
        try {
            let result = await RestAPI.execute("Biz3.CustomerCompanyApproveByCompCode", param, (err) => {
                Log.YiqifeiComLogs(err, "Biz3.CustomerCompanyApproveByCompCode", param, 2);
            });
            if (result.Code != 0) {
                Log.YiqifeiComLogs(result, "Biz3.CustomerCompanyApproveByCompCode", param, 2);
            }
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取审批规则 
    static getCusApproveUserByUserCode = async (param) => {
        try {
            let result = await RestAPI.execute("Biz3.CusApproveUserByUserCode", param, (err) => {
                Log.YiqifeiComLogs(err, "Biz3.CusApproveUserByUserCode", param, 2);
            });
            if (result.Code != 0) {
                Log.YiqifeiComLogs(result, "Biz3.CusApproveUserByUserCode", param, 2);
            }
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //配置差旅宝3.0客审批路线 
    static addPSOCustomerApproveRouting = async (param) => {
        try {
            let result = await RestAPI.execute("Biz3.PSOCustomerApproveRoutingAdd", param, (err) => {
                Log.YiqifeiComLogs(err, "Biz3.PSOCustomerApproveRoutingAdd", param, 2);
            });
            if (result.Code != 0) {
                Log.YiqifeiComLogs(result, "Biz3.PSOCustomerApproveRoutingAdd", param, 2);
            }
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}