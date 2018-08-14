import { RestAPI, ServingClient } from '../yqfws';
import moment from 'moment';
import {
    Platform,
    Dimensions
} from 'react-native'

export class Log {
    //新增日志
    static YiqifeiComLogs = async (content, method, remark, level) => {
        try {
            if (typeof content === 'object' && content.message)
                content = content.message;
            let param = {
                "LogTime": moment().format(),
                "LogMessage": method,
                "LogContent": typeof content === 'object' ? JSON.stringify(content) : content,
                "Domain": Platform.OS,
                "Sys": Platform.Version,
                "Remark": typeof remark === 'object' ? JSON.stringify(remark) : remark,
                "UserAgent": "差旅宝App",
                "LogLevel": level
            }
            let result = await RestAPI.execute("Base.YiqifeiComLogs", param);
            console.log(param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}