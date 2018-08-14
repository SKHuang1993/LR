/**
 * Created by yqf on 2017/10/31.
 */



//用户详细资料页面的模型

import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';

export default  class ChatUserInfo{



    @observable tag = '';//标签-》进入这页面之后需要调接口去获取

    @observable LoginIMNr=null;//当前登陆用户

    @observable title=null;//判断要显示为详细资料

    @observable Images=[];//我去过图片

    @observable Wording=null;//申请说明

    @observable isContact=null;//是否为好友


    @observable isLoading=true;//是否加载

    @observable User =null;//用户资料

    @observable Tag='Tag--后期需要修改成从通讯录中获取';//标签



}




