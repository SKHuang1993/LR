/**
 * Created by yqf on 2017/10/31.
 */

import React, {Component} from 'react';
import Storage from 'react-native-storage';
import signalr from 'react-native-signalr';
import base64 from 'base64-js'
import aesjs from 'aes-js'

import {DeviceEventEmitter} from 'react-native';

import {

    Dimensions,
    StyleSheet,
    Platform,
    NativeModules,
    AsyncStorage,


} from 'react-native';


import md5 from "react-native-md5";
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';


let ContactComponent={

    margin:5,
    iconW:38,
    fontSize:14,

};


export default {


    ContactComponent:ContactComponent,


    //IM的连接
    _Init(){



    },

    pySegSort(arr,success,failure) {

        // console.log('----xgxg排序的方法-----');
        // console.dir(arr);

        var temp=arr;

        var ccc = (arr.sort((obj1, obj2)=>{


            var val1 = obj1.User.Pinyin.toUpperCase();
            var val2 = obj2.User.Pinyin.toUpperCase();


            if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }
        } ));



        var dic={};

        ccc.map((contact)=>{
            var first = contact.User.Pinyin.toUpperCase().substring(0,1);
            if(first == undefined){
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



        if(dic)
        {
            success(dic);
        }

        else
        {
            failure();
        }



    },


    //返回当前时间
    _getCurrentTime(){

        var date = new Date().toISOString();
        return moment(date).format('YYYY-MM-DDTHH:mm:ss');
    },


    _getFaceUrlPath(url){

        if (!url)
            return "https://img2.yiqifei.com/face.png!80";
        else
            return "https://img2.yiqifei.com" + url + "!80";
    },


    //获取群名字
    _getGroupName(group){


        var Name;
        //有群名
        if(group.Name !=null && group.Name !=undefined)
        {
            Name= group.Name;
        }

        //没有群名字
        else
        {

            var name='';

            for (var i = 0; i < group.Members.length; i++) {

                var Member = group.Members[i];

                var memberName; //群成员的名字

                if(Member.Name ==null || Member.Name ==undefined)
                {
                    memberName = Member.IMNr;
                }
                else
                {
                    memberName = Member.Name;
                }

                name = name+memberName+',';
            }

            Name=name;

        }

        return Name;

    },

    //获取群介绍
    _getGroupInfo(group){

        if(group.Intro){
            return group.Intro;
        }

        else
            return '没有介绍'

    }




}