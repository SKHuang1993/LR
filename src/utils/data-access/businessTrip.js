import { RestAPI, ServingClient } from '../yqfws';

export class BusinessTrip {
    //创建/修改差旅申请 
    static BusinessTripApplicationCU = async (param) => {
        try {
            let result = await ServingClient.execute("BIZ.BusinessTripApplicationCU", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //读取申请详情
    static BusinessTripApplicationByID = async (param) => {
        try {
            let result = await ServingClient.execute("BIZ.BusinessTripApplicationByID", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //审批单据
    static ActuallyApprovalAdd = async (param) => {
        try {
            let result = await ServingClient.execute("BIZ.ActuallyApprovalAdd", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }


    //修改申请单状态
    static BTAUpdateStatus = async (param) => {
        try {
            let result = await ServingClient.execute("BIZ.BTAUpdateStatus", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

}