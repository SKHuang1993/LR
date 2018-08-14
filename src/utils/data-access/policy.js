import { RestAPI } from '../yqfws'
import { CabinInfo } from './cabin'
import Enumerable from 'linq';

import { BaseComponent, en_US, zh_CN } from '../../components/locale';

let lan = BaseComponent.getLocale();

export class PolicyInfo {
    //获取差旅政策列表
    static getList = async (param) => {
        try {
            let result = await RestAPI.execute("Biz3.PolicyGetList", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取差旅政策
    static getPolicy = async (param) => {
        try {
            let result = await RestAPI.execute("Biz3.PolicyByIDGet", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //差旅政策描述
    //type == 0 国内机票
    //type == 1 国际机票
    //type == 2 酒店
    static getPolicyDetail = (type, policy) => {
        let arr = new Array();
        if (type === 0) {
            if (policy.HighestCabin)
                arr.push(`${lan.TravelPolicyDesc_txt1}${CabinInfo.getCabinName(policy.HighestCabin)}`);
            if (policy.TicketDiscountUpperLimit)
                arr.push(`${lan.TravelPolicyDesc_txt2}${policy.TicketDiscountUpperLimit}${lan.TravelPolicyDesc_txt10}`);
            if (policy.DepartureTimeStart && policy.DepartureTimeEnd)
                arr.push(`${lan.TravelPolicyDesc_txt3} ${policy.DepartureTimeStart}-${policy.DepartureTimeEnd} ${lan.TravelPolicyDesc_txt4}`);
            if (policy.ArriveTimeStart && policy.ArriveTimeEnd)
                arr.push(`${lan.TravelPolicyDesc_txt5} ${policy.ArriveTimeStart}-${policy.ArriveTimeEnd} ${lan.TravelPolicyDesc_txt4}`);
            if (policy.LatestBooking)
                arr.push(`${lan.TravelPolicyDesc_txt6}${policy.LatestBooking}${lan.day}`);
            if (policy.AgreementAirline)
                arr.push(`${lan.TravelPolicyDesc_txt7}`);
            if (policy.TimeLowTicket)
                arr.push(`${lan.TravelPolicyDesc_txt8}${policy.TimeLowTicket}${lan.TravelPolicyDesc_txt9}`);
        }
        else if (type === 1) {
            if (policy.HighestCabin)
                arr.push(`${lan.TravelPolicyDesc_txt1}${CabinInfo.getCabinName(policy.HighestCabin)}`);
            if (policy.TicketDiscountUpperLimit)
                arr.push(`${lan.TravelPolicyDesc_txt2}${policy.TicketDiscountUpperLimit}${lan.TravelPolicyDesc_txt9}`);
            if (policy.DepartureTimeStart && policy.DepartureTimeEnd)
                arr.push(`${lan.TravelPolicyDesc_txt3} ${policy.DepartureTimeStart}-${policy.DepartureTimeEnd} ${lan.TravelPolicyDesc_txt4}`);
            if (policy.ArriveTimeStart && policy.ArriveTimeEnd)
                arr.push(`${lan.TravelPolicyDesc_txt5} ${policy.ArriveTimeStart}-${policy.ArriveTimeEnd} ${lan.TravelPolicyDesc_txt4}`);
            if (policy.LatestBooking)
                arr.push(`${lan.TravelPolicyDesc_txt6}${policy.LatestBooking}${lan.day}`);
            if (policy.AgreementAirline)
                arr.push(`${lan.TravelPolicyDesc_txt7}`);
            if (policy.TimeLowTicket)
                arr.push(`${lan.TravelPolicyDesc_txt8}${policy.TimeLowTicket}${lan.TravelPolicyDesc_txt9}`);
        }
        else if (type === 2) {
            if (policy.ConfigCityPriceLimits)
                arr.push(lan.appointHotelPriceRestriction + ":" +
                    Enumerable.from(policy.ConfigCityPriceLimits[0].Cities).select("$.Name").toArray().join(' ') + "," + lan.highestPrice + ":" +
                    policy.ConfigCityPriceLimits[0].Price + "元/间/夜");
            if (policy.OtherCityPriceLimit)
                arr.push("其他城市价格限制" + ":" + policy.OtherCityPriceLimit + "元/间/夜");
            if (policy.AgreementAirline)
                arr.push(lan.hotelPriority);
            if (policy.StarLimit)
                arr.push(lan.starRestriction + ":" + PolicyInfo.hotelMapping(policy.StarLimit));
        }
        else if (type === 3) {
            if (policy.ExpreeTrainClassLimit)
                arr.push(lan.expressSeatRestriction + ":" + PolicyInfo.trainMapping(policy.ExpreeTrainClassLimit));
            if (policy.BerthClassLimit)
                arr.push(lan.sleepingBerthRestriction + ":" + PolicyInfo.trainMapping(policy.BerthClassLimit));
            if (policy.OtherClassLimit)
                arr.push(lan.ordinarySeatRestriction + ":" + PolicyInfo.trainMapping(policy.OtherClassLimit));
        }
        if (arr.length == 0) {
            arr.push(lan.noBusinessTripPolicy);
        }
        return arr;
    }

    static hotelMapping = (t) => {
        if (t == 1) return lan.oneStar;
        else if (t == 2) return lan.twoStar;
        else if (t == 3) return lan.threeStar;
        else if (t == 4) return lan.fourStar;
        else if (t == 5) return lan.fiveStar;
        else if (t == 0) return lan.noRestrictonStar;
    }

    static trainMapping = (t) => {
        if (t == 'yz') return lan.hardSeat;
        else if (t == 'yw') return lan.hardSleeper;
        else if (t == 'rz') return lan.softSeats;
        else if (t == 'wz') return lan.noSeat;
        else if (t == 'rwx') return lan.softSleeper;
        else if (t == 'gwx') return lan.highGradeSoftBerth;
        else if (t == 'rz2') return lan.secondClassSeat;
        else if (t == 'rz1') return lan.firstClassSeat;
        else if (t == 'tdz') return lan.specialSeat;
        else if (t == 'swz') return lan.businessSeat;
        else if (t == 'none') return lan.unableSleepingBerth;
    }
}