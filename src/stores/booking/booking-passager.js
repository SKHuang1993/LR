import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { RestAPI } from '../../utils/yqfws';
import { PassengerInfo, IM, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo, ReasonInfo } from '../../utils/data-access/';
import moment from 'moment';

export default class BookingPassager {
    searchRequst = null;
    @observable passengers_sell = [];
    @observable passengers_contacted = [];
    @observable search_result = [];
    @observable isLoading = false;
    @observable isFinish = false;
    @observable condition = '';
    passengers_sell_index = 1;
    search_result_index = 1;
    search_result_finish = false;

    //读取我的旅客信息
    getPassengerList = async () => {
        let param = {
            "UserCode": this.userInfo.Account,
            "PageSize": 15,
            "PageCount": this.passengers_sell_index++
        }
        this.isLoading = true;
        let result = await PassengerInfo.getClientManByUserCode(param);
        Enumerable.from(result.Result.ServiceStaffs).doAction((o, i) => {
            o.checked = false;
        }).toArray();
        this.passengers_sell = this.passengers_sell.concat(result.Result.ServiceStaffs);
        if (this.passengers_sell.length == result.Result.RowCount)
            this.isFinish = true;
        this.isLoading = false;
    }

    //获取最近的联系人
    getRecentlyContacts = async () => {
        this.isLoading = true;
        if (!this.Owner) {
            let result = await IM.getToken({
                "Platform": 'MobileDevice',
                "UserCode": this.userInfo.Account,
                "Source": '抢单'
            });
            this.Owner = result.User.IMNr;
        }
        let result = await IM.getRecentlyContacts({
            Owner: this.Owner
        });
        Enumerable.from(result.Users).doAction((o, i) => {
            o.checked = false;
        }).toArray();
        this.passengers_contacted = result.Users;
        this.isLoading = false;
    }

    //根据条件查询客户信息
    getClientManByFuzzys = async () => {
        let param = {
            "Condition": this.condition,
            "PageSize": 15,
            "PageCount": this.search_result_index++
        }
        this.isLoading = true;
        let result = await PassengerInfo.getClientManByFuzzys(param);
        console.log(result);
        if (result.Result) {
            for (let item of result.Result.Customers) {
                let anntInfos = Enumerable.from(result.Result.AnntInfos).where(o => o.PersonCode == item.PersonCode).toArray();
                if (anntInfos.length > 0) {
                    for (let anntInfo of anntInfos) {
                        item[anntInfo.AnntType] = anntInfo.Annt;
                    }
                }
            }
            let customers = Enumerable.from(result.Result.Customers).select((o, i) => {
                return {
                    UserCode: o.AccountCode,
                    checked: false,
                    Name: o.FullName,
                    Phone: o.Phone,
                    Email: o.Email
                }
            }).toArray();

            this.search_result = this.search_result.concat(customers);
            if (this.search_result.length == result.Result.RowCount)
                this.search_result_finish = true;
        } else
            this.search_result_finish = true;
        this.isLoading = false;
    }

    @computed get getDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.passengers_sell.slice());
    }

    @computed get getDataContactedSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.passengers_contacted.slice());
    }


    @computed get getSearchDataSource() {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return ds.cloneWithRows(this.search_result.slice());
    }
}