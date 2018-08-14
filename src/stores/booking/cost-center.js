import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { RestAPI } from '../../utils/yqfws';
import { PassengerInfo, CertificateInfo, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo, ReasonInfo } from '../../utils/data-access/';
import moment from 'moment';

export default class CostCenter {
    @observable costList = [];
    @observable filterData = [];
    @observable customValue = "";
    @observable keyWords = "";
    @observable isLoading = false;
    //读取成本中心列表
    costGetList = async (costCenterID) => {
        this.isLoading = true;
        let param = {
            "CompanyCode": this.userInfo.CorpCode
        }
        let result = await CostInfo.getList(param);
        let costDetails = result.Result.CostDetails;
        Enumerable.from(costDetails).doAction((o, i) => {
            if (costCenterID) o.Checked = o.CostID == costCenterID;
            else
                o.Checked = i == 0 ? true : false
        }).toArray();
        this.costList = costDetails;
        this.filterData = this.costList;
        this.isLoading = false;
    }

    addCostItem = async () => {
        try {
            this.isLoading = true;
            //let isExits = Enumerable.from(this.filterData).any(o => o.CostName == this.customValue);
            if (this.customValue && this.customValue.length > 0) {
                let param = {
                    "CompanyCode": this.userInfo.CorpCode,
                    "CostName": this.customValue,
                    "Remark": "",
                    "CreateUser": this.userInfo.Account
                }
                let result = await CostInfo.costInsert(param);
                let costID = result.Result.CostID;
                Enumerable.from(this.filterData).doAction(o => o.Checked = false).toArray();
                let obj = observable({
                    CostID: costID,
                    CostName: this.customValue,
                    Checked: true
                });
                if (this.costList != this.filterData)
                    this.costList.unshift(obj);
                this.filterData.unshift(obj);
            }
            this.isLoading = false;
        } catch (err) {
            this.isLoading = false;
            Alert.alert("", "添加失败，请重试")
        }
    }

    search = () => {
        if (this.keyWords.trim().length > 0) {
            this.costList = Enumerable.from(this.filterData).where(o => o.CostName.toUpperCase().indexOf(this.keyWords.toUpperCase()) != -1).toArray();
        } else {
            this.costList = this.filterData;
        }
    }

    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.costList.slice());
    }
}