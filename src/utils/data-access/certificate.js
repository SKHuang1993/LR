import { RestAPI } from '../yqfws'

export class CertificateInfo {
    //获取证件列表
    static getList = async () => {
        try {
            let result = await global.storage.load({ key: 'ProofType' });
            return result;
        } catch (err) {
            result = await RestAPI.execute("CRM.ProofTypeGet", null);
            global.storage.save({
                key: 'ProofType',
                rawData: result,
                expires: 1000 * 3600 * 24
            })
            return result;
        }
    }

    //根据代码获取证件信息
    static getCertificateInfo = async (code) => {
        try {
            let result = await CertificateInfo.getList();
            let proofTypes = result.Result.ProofTypes;
            return proofTypes.find(o => o.TypeCode == code);
        } catch (err) {
            console.log(err);
        }
    }
}