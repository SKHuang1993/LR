import { RestAPI,ServingClient } from '../yqfws'

export class DestInfo {
    //读取目的地对应区号
    static getList = async (param) => {
        try {
            let result = await ServingClient.execute("BaseDest.DistrictAreaCodeGet", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}