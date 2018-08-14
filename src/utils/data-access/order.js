import { RestAPI, ServingClient } from '../yqfws'

export class OrderInfo {
    //新增订单(下单并订座)
    static salesOrderAddServer = async (param) => {
        try {
            let result = await RestAPI.execute("ABIS.SalesOrderAddServer", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取交易单明细
    static getSimTrade = async (param) => {
        try {
            let result = await RestAPI.execute("ABIS.SimTradeGet", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //退改签单(修改订单)
    static updateSalesOrder = async (param) => {
        try {
            let result = await RestAPI.execute("ABIS.SalesOrderUpdate", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取衍生单的序号
    static getPSODerivativeSeqNrByPSOID = async (param) => {
        try {
            let result = await RestAPI.execute("ABIS.PSODerivativeSeqNrByPSOID", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //按公司代码获取支付卡授权信息 
    static getCompanyAuthPaymentByCompCode = async (param) => {
        try {
            let result = await ServingClient.execute("CRM.CompanyAuthPaymentByCompCode", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}