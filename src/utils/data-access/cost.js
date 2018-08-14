import { RestAPI } from '../yqfws'

export class CostInfo {
    //成本中心列表
    static getList = async (param) => {
        try {
            let result = await RestAPI.execute("Biz3.CostGetList", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

     //新建成本中心
     static costInsert = async (param) => {
        try {
            let result = await RestAPI.execute("Biz3.CostInsert", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}