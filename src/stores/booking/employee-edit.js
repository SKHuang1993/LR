import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { RestAPI } from '../../utils/yqfws';
import { PassengerInfo, CertificateInfo, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo, ReasonInfo } from '../../utils/data-access/';
import moment from 'moment';

export default class PassengerEdit {
    @observable passenger;
    @observable selectedCertificate;
    @observable isLoading = false;
    constructor(passenger, credential) {
        if (!passenger && credential) {
            this.passenger.Credentials = [credential];
            this.selectedCertificate = credential;
            return;
        }
        passenger.Name = passenger.PersonName;
        passenger.LastNameEn = passenger.PersonLastNameEN;
        passenger.FirstNameEn = passenger.PersonFirstNameEN;
        let contact = Enumerable.from(passenger.Annts).firstOrDefault(o => o.Name.toLowerCase() == 'phone', -1);
        if (contact == -1) {
            if (passenger.Annts == null) passenger.Annts = [];
            let obj = {
                Name: "PHONE",
                Value: null
            };
            passenger.Annts.push(obj);
        }
        let milescards = passenger.Milescards || [];
        if (milescards.length == 0) {
            milescards.push({
                Name: null,
                Value: null,
                Issuer: null
            })
        }
        passenger.Milescards = milescards;
        if (credential) {
            let target = Enumerable.from(passenger.Proofs).firstOrDefault(o => o.Name == credential.Name, -1);
            for (let item of passenger.Proofs)
                if (!item.EndDate || item.EndDate.length == 0) {
                    item.EndDate = null;
                }
            if (target != -1)
                this.selectedCertificate = target;
        }
        this.passenger = passenger;
    }

    @computed get isOptional() {
        if (this.selectedCertificate.Name != '10' && this.selectedCertificate.Name != 'ID') {
            return false;
        }
        return true;
    }

    updateClientManInfo = async () => {
        this.isLoading = true;
        let obj = {
            "RoleID": null,
            "ApproveID": null,
            "Account": this.userInfo.Account,
            "Person": null
        }
        let passenger = toJS(this.passenger);
        let selectedCertificate = toJS(this.selectedCertificate);
        let index = passenger.Proofs.findIndex(o => o.Name == selectedCertificate.Name);
        if (index == -1)
            passenger.Proofs.push(selectedCertificate);
        else
            passenger.Proofs.splice(index, 1, selectedCertificate);
        passenger.Sex = passenger.Sex == 0 ? 'Female' : 'Male';
        passenger.OperateID = this.userInfo.Account;
        obj.ClientMan = passenger;
        obj.ApproveID = passenger.ApproveID;
        obj.RoleID = passenger.RoleID;
        obj.Person = passenger.PersonCode;
        let result = await EmployeeInfo.updateClientManInfo(obj);
         if (result.Code != 0) {
            Alert.alert(result.Msg);
            return;
        }
        console.log(result);
        this.isLoading = false;
        return passenger;
    }
}