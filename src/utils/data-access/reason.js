import { RestAPI } from '../yqfws'

export class ReasonInfo {
    //出差原因
    static getTravelReasonList = async (param) => {
        try {
            let result = await RestAPI.execute("Biz3.SysTravelReasonGetList", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //查询违反差旅政策原因
    static getPolicyReasonList = async (param) => {
        try {
            let result = await RestAPI.execute("Biz3.SysPolicyReasonGetList", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}