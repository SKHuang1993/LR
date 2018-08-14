import md5 from 'md5';
import moment from 'moment';
import aesjs from 'aes-js';
import base64 from 'base64-js';
import pako from 'pako';
import { BaseComponent, en_US, zh_CN } from '../components/locale';



//这是旧版本API
export class RestAPI {
    /**
     * 调用一起飞API
     *
     * @param    {string}  svMethod     方法名
     * @param    {string}   svParam         参数,JSON或XML字符串
     * @param    {function}   success        成功回调
     * @param    {function}   fail         失败回调
     * @param    {string}  svFormat  格式，JSON或XML
     * @param    {string}  url  地址
     * @returns  void
     */
    static invoke = (svMethod, svParam, success, fail, svFormat = 'JSON', url = 'https://www2.yqfws.com/rest') => {
        let formData = new FormData();
        let appKey = "100056";
        let appSecret = "b3982029bf014cfca0bb5d80c0fa8c4e";
        let timestamp = moment().format('YYYY-MM-DD HH:mm:ss')

        if (svFormat.toUpperCase() == "JSON") {
            if (typeof svParam === 'object')
                svParam = JSON.stringify(svParam);
        }
        let data = {
            app_key: appKey,
            method: svMethod,
            format: svFormat,
            timestamp: timestamp,
            parameter: svParam,
        }
        //进行签名
        data.sign = RestAPI.signText(data, appSecret);
        for (var k in data) {
            formData.append(k, data[k]);
        }
        fetch(url, {
            method: "POST",
            headers: {},
            body: formData
        }).then((res) => {
            if (res.ok) {
                if (svFormat.toUpperCase() == 'JSON') {
                    res.json().then((json) => {
                        if (BaseComponent.getLocale().lang == "EN")
                            BaseComponent.replaceData(json);
                        success(json);
                        //console.log(json);
                    })
                } else {
                    res.text().then((text) => {
                        success(text);
                    })
                }
            }
        }).catch((err) => {
            console.log(err);
            fail(err);
        })
    }

    /**
     * 调用一起飞API
     *
     * @param    {string}  svMethod     方法名
     * @param    {string}   svParam         参数,JSON或XML字符串
     * @param    {string}  svFormat  格式，JSON或XML
     * @param    {string}  url  地址
     * @returns  void
     */
    static execute = async (svMethod, svParam, fail, svFormat = 'JSON', url = 'https://www2.yqfws.com/rest') => {
        try {
            let formData = new FormData();
            let appKey = "100056";
            let appSecret = "b3982029bf014cfca0bb5d80c0fa8c4e";
            let timestamp = moment().format('YYYY-MM-DD HH:mm:ss')

            if (svFormat.toUpperCase() == "JSON") {
                if (typeof svParam === 'object')
                    svParam = JSON.stringify(svParam);
            }
            let data = {
                app_key: appKey,
                method: svMethod,
                format: svFormat,
                timestamp: timestamp,
                parameter: svParam,
            }

            //进行签名
            data.sign = RestAPI.signText(data, appSecret);
            for (var k in data) {
                formData.append(k, data[k]);
            }
            let res = await fetch(url, {
                method: "POST",
                headers: {},
                body: formData
            });
            if (svFormat.toUpperCase() == 'JSON') {
                let json = await res.json();
                if (BaseComponent.getLocale().lang == "EN")
                    BaseComponent.replaceData(json);
                //console.log(json);
                return json;
            } else {
                return await res.text();
            }
        } catch (err) {
            //alert(err);
            if (fail) {
                fail(err);
            }
            console.log(err);
            return null;
        }
    }

    //签名

    static signText = (data, appSecret) => {
        let str = appSecret;
        for (var key in data) {
            str += key + data[key];
        }
        str += appSecret;
        return md5(str).toUpperCase();
    }

    //拼接参数
    static getBody = (data) => {
        let str = "";
        for (var key in data) {
            str += `${key}=${data[key]}&`;
        }
        return str.substring(0, str.length - 1);
    }
}


//新版开放平台
export class ServingClient {
    /**
     * 调用一起飞API
     *
     * @param    {string}  svMethod     方法名
     * @param    {string}   svParam         参数,JSON或XML字符串
     * @param    {function}   success        成功回调
     * @param    {function}   fail         失败回调
     * @param    {string}  svFormat  格式，JSON或XML
     * @param    {string}  url  地址
     * @returns  void
     */
    static invoke = (svMethod, svParam, success, fail, svFormat = 'JSON', url = 'https://api2.yqfws.com/') => {
        url = url + `?app_key=100009&method=${svMethod}`;

        if (svFormat.toUpperCase() == "JSON") {
            if (typeof svParam === 'object')
                svParam = JSON.stringify(svParam);
        }

        let body = ServingClient.encodingPostData(svParam, "0bf74f164468828c");
        fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                // 'Accept-Encoding': 'gzip'
            },
            body: body
        }).then((response) => {
            response.json().then((json) => {
                var result = json;
                // if (response.status == 500) {
                //     throw new Error(result.Msg);
                // }
                success(result);
            })

        }).catch((err) => {
            console.log(err);
            fail(err);
        })
    }

    /**
     * 调用一起飞API
     *
     * @param    {string}  svMethod     方法名
     * @param    {string}   svParam         参数,JSON或XML字符串
     * @param    {string}  svFormat  格式，JSON或XML
     * @param    {string}  url  地址
     * @returns  void
     */
    static execute = async (svMethod, svParam, svFormat = 'JSON', url = 'https://api2.yqfws.com/') => {
        try {
            url = url + `?app_key=100009&method=${svMethod}`;

            if (svFormat.toUpperCase() == "JSON") {
                if (typeof svParam === 'object')
                    svParam = JSON.stringify(svParam);
            }

            let body = ServingClient.encodingPostData(svParam, "0bf74f164468828c");
            let response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            });
            var result = await response.json();
            // if (response.status == 500) {
            //     throw new Error(result.Msg);
            // }
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    //报文加密
    static encodingPostData = (postData, appSecret) => {
        var iv = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var key = aesjs.utils.utf8.toBytes(appSecret);

        var textBytes = aesjs.utils.utf8.toBytes(postData);
        textBytes = aesjs.padding.pkcs7.pad(textBytes);

        var aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);

        var encryptedBytes = aesCbc.encrypt(textBytes);

        // To print or store the binary data, you may convert it to hex 
        var encryptedHex = base64.fromByteArray(encryptedBytes);
        return encryptedHex;
    };
}

//xServer
export class xServer {
    static invoke = (svMethod, svParam, success, fail, url = 'https://flight.yqfws.com/') => {
        if (typeof svParam === 'object')
            svParam = JSON.stringify(svParam);
        let args = `<Root><UId></UId><Pwd></Pwd><Method>invokeandreply</Method><ServingName>${svMethod}</ServingName><Args>${svParam}</Args><Timeout>5000</Timeout><ClientIP></ClientIP></Root>`;
        fetch(url, {
            method: "POST",
            body: args
        }).then((res) => {
            if (res.ok) {
                res.text().then(function (text) {
                    success(text);
                })
            }
        }).catch((err) => {
            console.log(err);
            fail(err);
        })
    }

}
