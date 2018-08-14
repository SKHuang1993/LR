import { RestAPI, ServingClient } from '../yqfws'
import moment from 'moment'

export class PassengerInfo {
    //读取我的旅客信息 
    static getList = async (param) => {
        try {
            let result = await RestAPI.execute("CRM.MobilePassengerGet", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //修改旅客信息 
    static updatePassenger = async (param) => {
        try {
            let result = await RestAPI.execute("CRM.MobilePassengerUpdate", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //添加旅客信息 
    static addPassenger = async (param) => {
        try {
            let result = await RestAPI.execute("CRM.MobilePassengerAdd", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //旅客类型 
    static getPassengerAgeSection = (birthday) => {
        if (birthday) {
            let years = moment(moment()).diff(birthday, 'years');
            if (years >= 18)
                return "ADT";
            else if (years >= 2)
                return "CHD";
            else
                return "INF";
        }
    }

    //读取订票人最近下单的旅客
    static getPSOPassengerByBookerID = async (param) => {
        try {
            let result = await ServingClient.execute("LvRui.PSOPassengerByBookerID", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }


    //读取为我服务过的常用订票人(客户)
    static getClientManByUserCode = async (param) => {
        try {
            let result = await RestAPI.execute("CRM.ClientManByUserCode", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //根据条件查询客户信息
    static getClientManByFuzzys = async (param) => {
        try {
            let result = await RestAPI.execute("CRM.ClientManByFuzzysGet", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取我的常旅客
    static getPassengerByCondition = async (param) => {
        try {
            let result = await RestAPI.execute("CRM.PassengerByCondition", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //根据旅客代码获取旅客详情
    static getMobilePassengerByCode = async (param) => {
        try {
            let result = await RestAPI.execute("CRM.MobilePassengerByCodeGet", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}