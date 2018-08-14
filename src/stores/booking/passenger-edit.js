import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import Enumerable from 'linq';
import { RestAPI } from '../../utils/yqfws';
import { PassengerInfo, CertificateInfo, CostInfo, ApproveInfo, RoleInfo, PolicyInfo, DepartmentInfo, EmployeeInfo, ReasonInfo } from '../../utils/data-access/';
import moment from 'moment';

export default class PassengerEdit {
    @observable areaCode = "+86";
    @observable passenger = {
        "AccountCode": null,
        "Name": null,
        "LastNameEn": null,
        "FirstNameEn": null,
        "Nationality": null,
        "Sex": 0,
        "PassengerAgeSection": "ADT",
        "IsSelf": false,
        "Birthday": "1990-12-01T00:00:00",
        "Contacts": [
            {
                "AnntID": null,
                "PersonCode": null,
                "AnntType": "PHONE",
                "Annt": null
            }
        ],
        "Credentials": [
            {
                "ProofID": null,
                "ProofType": 'ID',
                "CertificateName": lan.booking_id,
                "Number": null,
                "Issuer": null,
                "IssuerDate": null,
                "StartDate": null,
                "EndDate": null
            }
        ],
        "Milescards": [
            {
                "MilesCardID": null,
                "CardType": null,
                "MilesCardNo": null,
                "Issuer": null,
                "IssuerDate": null,
                "StartDate": null,
                "EndDate": null
            }
        ]
    };
    @observable selectedCertificate = this.passenger.Credentials[0];
    @observable isLoading = false;
    constructor(passenger, credential) {
        if (!passenger && credential) {
            this.passenger.Credentials = [credential];
            this.selectedCertificate = credential;
            return;
        }
        passenger.Name = passenger.FullName;
        passenger.PassengerCode = passenger.PersonCode;
        let contact = Enumerable.from(passenger.Contacts).firstOrDefault(o => o.AnntType.toLowerCase() == 'phone', -1);
        if (contact == -1) {
            if (passenger.Contacts == null) passenger.Contacts = [];
            let obj = {
                AnntID: null,
                AnntType: "PHONE",
                Annt: null
            };
            passenger.Contacts.push(obj);
        }
        let milescards = passenger.Milescards || [];
        if (milescards.length == 0) {
            milescards.push({
                CardType: null,
                MilesCardNo: null,
                Issuer: null
            })
        }
        passenger.Milescards = milescards;
        if (credential) {
            let target = Enumerable.from(passenger.Credentials).firstOrDefault(o => o.ProofType == credential.ProofType, -1);
            for (let item of passenger.Credentials)
                if (!item.EndDate || item.EndDate.length == 0) {
                    item.EndDate = null;
                }
            if (target != -1)
                this.selectedCertificate = target;
        }
        this.passenger = passenger;
    }

    @computed get isOptional() {
        if (this.selectedCertificate.ProofType != '10' && this.selectedCertificate.ProofType != 'ID') {
            return false;
        }
        // if (Enumerable.from(this.passenger.Credentials).count(o => o.ProofType != '10' && o.ProofType != 'ID') > 0)
        //     return false;
        return true;
    }

    updatePassenger = async (UserCode) => {
        this.isLoading = true;
        let passenger = toJS(this.passenger);
        passenger.AccountCode = UserCode;
        let selectedCertificate = toJS(this.selectedCertificate);
        let index = passenger.Credentials.findIndex(o => o.ProofType == selectedCertificate.ProofType);
        if (index == -1)
            passenger.Credentials.push(selectedCertificate);
        else
            passenger.Credentials.splice(index, 1, selectedCertificate);
        let result = await PassengerInfo.updatePassenger(passenger);
        if (result.Code != 0) {
            Alert.alert(result.Msg);
            return;
        }
        this.isLoading = false;
        return passenger;
    }

    addPassenger = async (UserCode) => {
        this.isLoading = true;
        let passenger = toJS(this.passenger);
        passenger.AccountCode = UserCode;
        let selectedCertificate = toJS(this.selectedCertificate);
        let index = passenger.Credentials.findIndex(o => o.ProofType == selectedCertificate.ProofType);
        if (index == -1)
            passenger.Credentials.push(selectedCertificate);
        else
            passenger.Credentials.splice(index, 1, selectedCertificate);
        let result = await PassengerInfo.addPassenger(passenger);
        if (result.Code != 0) {
            Alert.alert(result.Msg);
            return;
        }
        if (result.Result.PassengerCode)
            this.passenger.PassengerCode = result.Result.PassengerCode;
        this.isLoading = false;
        return passenger;
    }
}