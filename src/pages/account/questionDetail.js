import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    ListView,
    Image,
    Dimensions,
} from 'react-native';
import {Toast,} from 'antd-mobile';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';
import{ RestAPI } from '../../utils/yqfws';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

const imgData = [];

export default class QuestionDetail  extends Component {
    constructor(props) {
        super(props);
        this.state={
            questionTitle:this.props.Title,
            questionContent:this.props.Content,
            questionTime:this.props.Time,
            questionID:this.props.ID,
            answerName:'',
            answerContent:'',
            answerTime:'',
            isAnswer:false,//判断是否有回答
            dataSource:new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            })
        };
    }
    componentDidMount(){
        this.getQuestionInfo();
    }
    render(){
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                <Navbar navigator={this.props.navigator} title={lan.detail} />
                <View style={{backgroundColor:'#fff'}}>
                    <View style={{margin:15,flexDirection:'row',alignItems:'flex-end'}}>
                        <Text style={{color:'#333',fontSize:16,flex:1}}>{this.state.questionTitle}</Text>
                        <Text style={{color:'#999',fontSize:12,textAlign:'right'}}>{this.state.questionTime}</Text>
                    </View>
                    <Text style={{marginLeft:15,marginRight:15,color:'#333',fontSize:14}}>{this.state.questionContent}</Text>
                    <ListView 
                            style={{margin:10}}
                            horizontal={true}
                            dataSource={this.state.dataSource}
                            renderRow={this.getImageView.bind(this)}
                    />
                </View>
                {this.state.isAnswer ?
                <View>
                    <Text style={{color:'#999',fontSize:14,marginLeft:15,marginTop:10,marginRight:15}}>{this.state.answerName+'  回复:'}</Text>
                    <View>
                        <Text style={{color:'#333',fontSize:15}}>{this.state.answerContent}</Text>
                        <Text style={{color:'#999',fontSize:14,textAlign:'right',width:width}}>{this.state.answerTime}</Text>
                    </View>
                </View>
                : <View>
                    <Text style={{color:'#999',fontSize:14,marginLeft:15,marginTop:10,marginRight:15}}>
                        {lan.noReply}
                    </Text>
                </View>}
            </View>
        );
    }

    //获取问题详情
    getQuestionInfo = () => {
        let param = {
            "QuestionCode": this.state.questionID,
        }
        Toast.loading(lan.loading,60,()=>{
             Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("Knowledge.QuestionDetailOnCltGet",JSON.stringify(param),(value)=>{
            Toast.hide();
            let queInfo = value;
            if(queInfo.Code == 0){
                if(queInfo.Result.Answerse == null){
                    this.state.isAnswer = false;
                }else {
                    this.state.isAnswer = true;
                    let date = queInfo.Result.Answers[0].AnswerDateTime.substring(0,10);
                    let time = queInfo.Result.Answers[0].AnswerDateTime.substring(11,16);
                    this.state.answerName = queInfo.Result.Answers[0].AnswerFullName;
                    this.state.answerContent = queInfo.Result.Answers[0].AnswerContent;
                    this.state.answerTime = date+ "  "+time;
                    for(var v of queInfo.Result.QuestionAddeds[0]){
                        imgData.splice(imgData.length,0,{'path':v.LabelName});
                    }
                    if(imgData.length>0){
                        let ds = new ListView.DataSource({
                            rowHasChanged: (row1, row2) => row1 !== row2,
                        })
                        this.state.dataSource = ds.cloneWithRows(imgData);
                    }
                }
                this.setState({});
            }else{
                Toast.info(value, 3, null, false);
            }
        },(err)=>{
            Toast.info(err,3,null,false);
        })
    }

    //图片布局
    getImageView = (value) => {
        return(
            <Image style={{width:70,height:70,marginLeft:5,marginRight:5}}
                    source={{uri: vaule.path}}>
            </Image>
        );
        
    }
}