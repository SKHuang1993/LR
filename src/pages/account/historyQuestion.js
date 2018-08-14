import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    ListView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import {Toast} from 'antd-mobile';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';
import{ RestAPI } from '../../utils/yqfws';
import QuestionDetail from './questionDetail';

import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class HistoryQuestion  extends Component {
    constructor(props) {
        super(props);
        this.state={
            account:this.props.Account,
            dataSource:new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            })
        };
    }

    componentDidMount(){
        this.getQuestionList();
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                <Navbar navigator={this.props.navigator} title={lan.historyQuestions} />
                <ListView 
                    dataSource={this.state.dataSource}
                    renderRow={this.geyQuestionItemView.bind(this)}/>
            </View>
        );
    }

    //获取问题列表信息
    getQuestionList = () => {
        let param={
            "OrderValue": 2,
            "PageIndex": 1,
            "PageSize": 100,
            "Effectiveness": true,
            "OperateUser": this.state.account//"7H100D7F"//
        }
        Toast.loading(lan.loading,60,()=>{
             Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("Knowledge.QuestionByQueryOnISDGet",JSON.stringify(param),(value)=>{
            let questionInfo = value;
            if(questionInfo.Code == 0){
                Toast.hide();
                if(questionInfo.Result.RecordCount != 0){
                    let ds = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    this.setState({
                        dataSource: ds.cloneWithRows(questionInfo.Result.Questions),
                    });
                }else
                    alert(lan.noProblem);
                
            }else{
                Toast.info(value, 3, null, false);
            }
        },(err)=>{
            Toast.info(err,3,null,false);
        })
    }

    //问题列表子项的布局
    geyQuestionItemView = (vaule) => {
        let date = vaule.AskedByDateTime.substring(0,10);
        let time = vaule.AskedByDateTime.substring(11,16);
        return(
            <View>
                <TouchableOpacity style={styles.itemViewStyle} onPress={()=>this.toQuestionDetail(vaule,date+'  '+time)}>
                    <View style={{flex:1}}>
                        <Text style={{color:'#333',fontSize:16,}} numberOfLines={1}>{vaule.QuestionContent}</Text>
                        <Text style={{color:'#999',fontSize:14}}>{date+"  "+time}</Text>
                    </View>
                    <Icon icon={'0xe677'} color={'#999'} style={{fontSize: 18,}}/>
                </TouchableOpacity>
                <View style={{backgroundColor:'#ebebeb',height:0.8}}/>
            </View>
        );
    }

    //查看问题详情
    toQuestionDetail = (value,t) =>{
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'QuestionDetail',
                component: QuestionDetail,
                passProps:{
                    ID:value.QuestionCode,
                    Title:value.QuestionTitle,
                    Content:value.QuestionContent,
                    Time:t
                }
            });
        }
    }
}

const styles = StyleSheet.create({
    itemViewStyle:{
        flexDirection:'row',
        backgroundColor:'#fff',
        paddingTop:8,
        paddingBottom:8,
        paddingLeft:15,
        paddingRight:15,
        alignItems: 'center',
        justifyContent: 'center',
    },
})