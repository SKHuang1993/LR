import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { RestAPI } from '../../utils/yqfws';
import { DestInfo, CertificateInfo, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo, ReasonInfo } from '../../utils/data-access/';
import moment from 'moment';

export default class AreaCodeList {
    @observable areaList = [];
    @observable isLoading = false;

    getDistrictAreaCode = async () => {
        let param = {

        }
        this.isLoading = true;
        let result = await DestInfo.getList(param);
        this.areaList = Enumerable.from(result.DistrictCountrys).distinct(o => o.AreaCode).toArray();
        this.isLoading = false;
    }

    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.areaList.slice());
    }
}