/**
 * Created by yqf on 2017/10/31.
 */

//聊天详情

import { extendObservable, action, computed, toJS, observable } from 'mobx';
import { Alert, NativeModules, ListView } from 'react-native';

export default  class ChatFile{

    @observable name = '';//
    @observable detail = '';//

    @observable conversation = {};//

    @observable Peer=null;//聊天详情对应的房间号
    @observable LoginIMNr=null;//当前登陆用户


    @observable title=null;//判断要显示为聊天详情或者聊天信息


    @observable isOwner=false;//是否为群主
    @observable isMemberOfGroup=false;//是否为群成员

    @observable isSticky = false;//是否置顶聊天
    @observable isDisturb = false;//是否消息免打搅
    @observable isShowChatAlert = false;//
    @observable isShowGroupAlert = false;//群提醒



    @observable isShowClearChat = false;//是否要显示清空聊天记录
    @observable isShowDeleteAndExitGroup = false;//是否要显示退出群聊



    @observable Members=[];//群聊天成员

    @observable ConversationType=null;//类型

    @observable Group =null;//群资料
    @observable User =null;//用户资料



    @computed get getDataSource(){


        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.Members.slice());

    }


}
