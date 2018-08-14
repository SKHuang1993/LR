/**
 * Created by yqf on 2017/11/1.
 */




import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';

export default  class FriendApplication{

    @observable text = null;

    @observable User=null;

}
