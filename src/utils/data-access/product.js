import { RestAPI } from '../yqfws'

export class ProductInfo {
    //获取产品配置信息
    static getProductConfigure = async (param) => {
        try {
            let result = await RestAPI.execute("Biz3.ProductConfigureGet", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
    //综合推荐产品(附加产品)
    static productsMultiSearch = async (param) => {
        try {
            let result = await RestAPI.execute("ABIS.ProductsMultiSearch", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //查询保险产品详情列表
    static productQuery = async (param) => {
        try {
            let result = await RestAPI.execute("INS.ProductQuery", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //根据条件查询保险产品
    static insuranceRateReport = async (param) => {
        try {
            let result = await RestAPI.execute("INS.InsuranceRateReport", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //供应商列表
    static getGoodOwners = async (param) => {
        try {
            let result = await RestAPI.execute("Base.GoodOwnersGet", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}