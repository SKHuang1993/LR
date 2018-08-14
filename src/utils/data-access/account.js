import { RestAPI } from '../yqfws'

export class AccountInfo {
    //读取用户信息 
    static getUserInfo = () => {
        if (global.userInfo)
            return global.userInfo;
    }


    //设置用户信息
    static setUserInfo = (info) => {
        global.userInfo = info;
    }

}