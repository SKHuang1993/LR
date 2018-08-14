import { RestAPI, ServingClient } from '../yqfws';
import md5 from 'md5';
import deepcopy from 'deepcopy';

export class IM {
    //获取用户 token 
    static getToken = async (param) => {
        let key = md5(JSON.stringify(param));
        try {
            let result = await global.storage.load({ key: key });
            return deepcopy(result);
        } catch (err) {
            let result = await ServingClient.execute("IM.GetToken", param);
            if (result && result.IsSuccess) {
                let rawData = deepcopy(result);
                global.storage.save({
                    key: key,
                    rawData: rawData,
                    expires: 1000 * 3600 * 24
                })
                return rawData;
            }
        }
    }

    //获取最近的会话列表，仅成功登录IM服务器后使用一次
    static getConversations = async (param) => {
        try {
            let result = await ServingClient.execute("IM.GetConversations", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取历史消息
    static getHistoryMessages = async (param) => {
        try {
            let result = await ServingClient.execute("IM.GetHistoryMessages", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取未读消息列表
    static getUnreadMessages = async (param) => {
        try {
            let result = await ServingClient.execute("IM.GetUnreadMessages", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取联系人列表，仅成功登录IM服务器后使用一次
    static getContacts = async (param) => {
        try {
            let result = await ServingClient.execute("IM.GetContacts", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取用户或群组信息
    static getUserOrGroups = async (param) => {
        let key = md5(JSON.stringify(param));
        try {
            let result = await global.storage.load({ key: key });
            return deepcopy(result);
        } catch (err) {
            let result = await ServingClient.execute("IM.GetUserOrGroups", param);
            if (result) {
                let rawData = deepcopy(result);
                global.storage.save({
                    key: key,
                    rawData: rawData,
                    expires: 1000 * 3600 * 24
                })
                return rawData;
            }
        }
    }

    //为用户推荐群
    static recommandGroups = async (param) => {
        try {
            let result = await ServingClient.execute("IM.RecommandGroups", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取最近的联系人
    static getRecentlyContacts = async (param) => {
        try {
            let result = await ServingClient.execute("IM.GetRecentlyContacts", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

}