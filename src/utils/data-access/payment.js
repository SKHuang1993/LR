import { RestAPI } from '../yqfws'

export class PaymentInfo {
    //读取用户现金，信用账号情况
    static getLedgerAccountCash = async (param) => {
        try {
            let result = await RestAPI.execute("Payment.LedgerAccountCashGet", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}