

import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';

export default  class Desk{

    @observable isLogin =false;

    @observable title='工作台';//显示在顶部的标题

    @observable UserResult = null;//用户资料

    @observable text = '';

    @observable currentUser = {};

    @observable switchState =true;

    //任务
    @observable Tasks = [];


    //预定入口
    @observable  ScheduledEntrances=[

    ];

    //常用应用
    @observable  CommonApplications=[

    ];






}
