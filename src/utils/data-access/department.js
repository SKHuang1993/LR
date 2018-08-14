import { RestAPI } from '../yqfws'

export class DepartmentInfo {
    //读取部门列表
    static getList = async (param) => {
        try {
            let result = await RestAPI.execute("CRM.DeparmentGetList", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}