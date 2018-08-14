import SQLite from 'react-native-sqlite-storage'
import signalr from 'react-native-signalr';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import Enumerable from 'linq';
import moment from 'moment';
import React, { Component } from 'react';
import { extendObservable, action, computed, toJS, observable, autorun } from 'mobx';
import { observer } from 'mobx-react/native';
import uuid from 'react-native-uuid';
import deepDiffer from 'deepDiffer';
import { NativeModules, Alert, NetInfo } from 'react-native';
import md5 from 'md5';

export class Storage {

    static openDataBase(name) {
        Storage.messages = SQLite.openDatabase(md5(name + "messages"), "1.0", null, 200000, Storage.openCB, Storage.errorCB);
    }

    static insertMessage(IMNr, obj) {
        let db = Storage.messages;
        let timeStamp = moment(obj.CreateTime).format("x");
        let messageId = obj.MessageId;
        let message = JSON.stringify(obj);
        db.transaction((tx) => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS Messages( '
            + 'Message_ID VARCHAR(64) PRIMARY KEY NOT NULL, '
            + 'IMNr VARCHAR(55), '
            + 'TimeStamp INTEGER, '
            + 'Message TEXT);', []);
            tx.executeSql(`INSERT INTO Messages (Message_ID, IMNr, TimeStamp, Message) VALUES ('${messageId}','${IMNr}','${timeStamp}','${message}');`, []);
        });
    }

    static selectMessage(IMNr, skip, num, success) {
        let db = Storage.messages;
        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM Messages WHERE IMNr == ${IMNr} ORDER BY TimeStamp DESC LIMIT ${num} OFFSET ${skip}`, [], (tx, results) => {
                let messages = Enumerable.from(results.rows).select((o, i) => {
                    return JSON.parse(results.rows.item(i).Message);
                }).toArray();
                if (success) success(messages.reverse());
            });
        });
    }

    static removeMessage(IMNr) {
        let db = Storage.messages;
        db.transaction((tx) => {
            tx.executeSql(`DELETE FROM Messages WHERE IMNr == ${IMNr}`, [], (tx, results) => {
               
            });
        });
    }

    static errorCB(err) {
        console.log("SQL Error: " + err);
    }

    static successCB() {
        console.log("SQL executed fine");
    }

    static openCB() {
        console.log("Database OPENED");
    }
}