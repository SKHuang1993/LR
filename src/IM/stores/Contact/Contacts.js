

//存通讯录的数据
import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';
import {Chat} from '../../utils/chat';



export default class Contacts {

    @observable isLoading = false;
    @observable loadingText="正在删除..."
    @observable addressList={

    WorkMake:{

        datas:[],
        Name:'同事',
    },
    Customer:{

        datas:[],
        Name:'客户',

    },
    Advisor:{

        datas:[],
        Name:'顾问',

    },
    Friend:{

        datas:[],
        Name:'好友',

    },

};


    @computed get getDataSource(){


        ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2
        });


        //#TODO 这里需要用到Chat.obj.Contacts;如果还没有连接成功的话，是没办法拿到通讯录的数据的。最好的方法是先拿缓存
        var temp2 = this.pySegSort(Chat.obj.Contacts.Users);

        return ds.cloneWithRowsAndSections(toJS(temp2));


    }



     pySegSort = (arr) => {


         if(arr==undefined || arr.length<=0){
             return {};
         }

        var ccc = (arr.sort((obj1, obj2) => {

            var val1 = obj1.User.Pinyin.toUpperCase();
            var val2 = obj2.User.Pinyin.toUpperCase();

            if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }
        }));



        var dic = {};

        ccc.map((contact) => {


            var first = contact.User.Pinyin.toUpperCase().substring(0, 1);


            if (first == undefined) {
                alert('Pinyin')
            }

            if (dic[first] != undefined) {
                dic[first].push(contact);
            }
            else {
                var data = [];
                data.push(contact);
                dic[first] = data;
            }
        })


        if (dic) {
            return dic;

        }

        else {
            return {};

        }


    };






}