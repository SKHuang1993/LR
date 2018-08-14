/**
 * Created by yqf on 2017/10/25.
 */


import {ServingClient,RestAPI} from '../yqfws';



export class  IM {

    //获取用户 token
    static getToken = async (param) =>{
        try{

            let result = await ServingClient.execute("IM.GetToken",param);

            return result;

        }catch(error) {

            console.log('getToken'+error);
        }
    }

    //获取最近的会话列表，仅成功登录IM服务器后使用一次
    static getConversations = async (param) =>{

        try{

            let result = await ServingClient.execute("IM.GetConversations",param);
            return result;

        }catch(error) {

            console.log('getConversations'+error);
        }
    }


    //获取历史消息
    static getHistoryMessages = async (param) => {
        try {
            let result = await ServingClient.execute("IM.GetHistoryMessages", param);
            return result;
        } catch (err) {
            console.log('getHistoryMessages'+err);
        }
    }


    //获取未读消息列表
    static getUnreadMessages = async (param) => {
        try {
            let result = await ServingClient.execute("IM.GetUnreadMessages", param);
            return result;
        } catch (err) {
            console.log('getUnreadMessages'+err);
        }
    }


    //获取联系人列表，仅成功登录IM服务器后使用一次
    static getContacts = async (param) => {
        try {
            let result = await ServingClient.execute("IM.GetContacts", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取用户或群组信息
    static getUserOrGroups = async (param) => {
        try {
            let result = await ServingClient.execute("IM.GetUserOrGroups", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取群组详情
    static GetGroupDetails = async (param) => {
        try {
            let result = await ServingClient.execute("IM.GetGroupDetails", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }





    // 拉取群未决列表
    static getGroupPendencyList = async (param) => {
        try {
            let result = await ServingClient.execute("IM.GetGroupPendencyList", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //获取活跃的群组列表
    static getLivelyGroups = async (param) => {
        try {
            let result = await ServingClient.execute("IM.GetLivelyGroups", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //为用户推荐群
    static getRecommandGroups = async (param) => {
        try {

            let result = await ServingClient.execute("IM.RecommandGroups", param);

            console.log('IM ---RecommandGroups ')
            // console.dir(result);

            return result;

        } catch (err) {
            console.log(err);
        }
    }

    //搜索群
    static getSearchGroups = async (param) => {
        try {
            let result = await ServingClient.execute("IM.SearchGroups", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }


    //好友未决请求（例如请求验证）未决请求即为等待处理的请求
    static getFutureFriends = async (param) => {
        try {
            let result = await ServingClient.execute("IM.GetFutureFriends", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }


//为用户推荐好友
    static getRecommandUsers = async (param) => {
        try {
            let result = await ServingClient.execute("IM.RecommandUsers", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    //搜索用户
    static getSearchUsers = async (param) => {
        try {
            let result = await ServingClient.execute("IM.SearchUsers", param);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

   // IM读取组织架构
    static  getUserIMNrBySubTypeCode = async()=>{

        try {
            let result = await ServingClient.execute("IMSystem.UserIMNrBySubTypeCode", {
                OUSubTypeCode:'INCU'
            });

            return result;
        } catch (err) {
            console.log(err);
        }


    }


    // 	读取用户的标签朋友
    static  getIMSystemUserTagByIMNr = async(Param)=>{

        try {

            let result = await ServingClient.execute("IMSystem.UserTagByIMNr",Param);

            return result;
        } catch (err) {
            console.log(err);
        }


    }





    //读取用户标签好友
    static getIMSystemUserTagByIMNr = async(Param)=>{

        try {

            let result = await ServingClient.execute("IMSystem.UserTagByIMNr",Param);

            // console.dir(result);

            return result;


        } catch (err) {
            console.log(err);
        }


    }



   // 维护用户标签好友
    static getIMSystemUserTagMemberCD = async(Param)=>{

        try {

            let result = await ServingClient.execute("IMSystem.UserTagMemberCD",Param);

            // console.dir(result);

            return result;


        } catch (err) {
            console.log(err);
        }


    }


    //读取为我服务过的常用订票人(客户)
    static getClientManByUserCode = async(Param)=>{

        try {

            let result = await RestAPI.invoke("CRM.ClientManByUserCode",Param);

            // console.dir(result);

            return result;


        } catch (err) {
            console.log(err);
        }



    }










}