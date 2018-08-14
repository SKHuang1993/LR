/**
 * Created by yqf on 2017/11/11.
 */



import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';



export default  class Profile{

    @observable text = '';
    @observable loginUserResult = null;//登陆用户的资料
    @observable isReceiveOrder =true;//是否接单

}
