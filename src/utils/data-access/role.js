import { RestAPI } from '../yqfws'
import { Log } from './';

export class RoleInfo {
    //查询角色列表
    static getsUserRole = async (param) => {
        try {
            let result = await RestAPI.execute("Base.RoleMTRGetList", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //根据角色读取人员账号
    static getUserRoleList = async (param) => {
        try {
            let result = await RestAPI.execute("Base.UserRoleByResourceIDAndRoleIDGet", param, (err) => {
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