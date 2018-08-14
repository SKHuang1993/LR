import { RestAPI } from '../yqfws'

export class Knowledge {
    //统计未读消息
    static getMsgCount = async (param) => {
        try {
            let result = await RestAPI.execute("Knowledge.MsgCountGet", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取用户的消息列表
    static getMsgList = async (param) => {
        try {
            let result = await RestAPI.execute("Knowledge.MsgListGet", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //批量设置消息为已读
    static setMsgListRead = async (param) => {
        try {
            let result = await RestAPI.execute("Knowledge.MsgListSetRead", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}