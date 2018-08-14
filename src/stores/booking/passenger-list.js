import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { RestAPI } from '../../utils/yqfws';
import { PassengerInfo, CertificateInfo, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo, ReasonInfo } from '../../utils/data-access/';
import moment from 'moment';

export default class PassengerList {
    searchRequst = null;
    @observable passengers = [];
    @observable isLoading = false;
    constructor(passengers) {
        this.passengers = passengers;
    }
    //读取我的旅客信息
    getPassengerList = async (account) => {
        let param = {
            "AccountCode": account,
        }
        this.isLoading = true;
        let result = await PassengerInfo.getList(param);
        let certificates = await CertificateInfo.getList();
        let proofTypes = certificates.Result.ProofTypes;
        for (let item of result.Result.Passengers) {
            item.defaultCertificate = this.getDefaultCertificate(item.Credentials, this.searchRequst.ticketType);
            item.checked = false;
            Enumerable.from(item.Credentials).join(proofTypes, "$.ProofType", "$.TypeCode", (a, b) => { a.CertificateName = b.Name }).toArray();
        }
        Enumerable.from(result.Result.Passengers).join(this.passengers, "$.PersonCode", "$.PersonCode", (a, b) => { a.checked = b.checked, a.defaultCertificate = b.defaultCertificate }).toArray();
        this.passengers = result.Result.Passengers;
        this.isLoading = false;
    }

    getDefaultCertificate = (certificates, ticketType) => {
        if (!certificates || certificates.length == 0)
            return null;
        //国内航班
        if (ticketType == 0) {
            let certificate = Enumerable.from(certificates).firstOrDefault((o) => o.ProofType == 'ID', -1);
            if (certificate != -1)
                return certificate;
            else
                return certificates[0];
        }
        //国际航班
        else {
            let certificate = Enumerable.from(certificates).firstOrDefault((o) => o.ProofType == 'PP', -1);
            if (certificate != -1)
                return certificate;
            else
                return certificates[0];
        }
    }

    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.passengers.slice());
    }
}