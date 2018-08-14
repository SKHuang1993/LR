import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    ListView,
    TouchableOpacity,
} from 'react-native';
import Navbar from '../../components/navBar/index';
import Icon from '../../components/icons/icon';
import {COLORS} from '../../styles/commonStyle';
import DetailProblem from './detailProblem';
import Advice from './advice';
import HistoryQuestion from './historyQuestion';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

const Problem=[
    {'question':'为什么超级管理员账号无法登陆差旅宝APP？','reply':'差旅宝“级管理员账号”拥有的功能权限是差旅管理部分的功能权限，由于目前差旅宝APP暂时还不支持这部分功能，所以超级管理员账号暂时无法登陆差旅宝APP。'},
    {'question':'因公流程产品预订过程中为什么要优先选择出差员工旅客？','reply':'因公流程产品预订过程中，主要是订单是否需要预订受“差旅政策”是否违背控制，而“差旅政策”是否违背受“员工对应的差旅政策”控制，所以需要优先选择员工，从而可以获取员工的对应的差旅政策判断显示对应的产品是否违背差旅'},
    {'question':'因公流程产品预订过程中为什么相同差旅政策的旅客才可以一起预订？','reply':'由于因公流程产品预订过程中，员工的对应的差旅政策判断显示对应的产品是否违背差旅，不同的差旅政策的员工预订所搜索出来的产品是否违背不一致，所以不能同时预订，相同差旅政策的员工旅客才可以一起预订'},
    {'question':'因公流程帮员工预订时，在选择员工列表找不到要订票的员工怎么办？','reply':'员工列表显示的员工名单，则是管理员通过员工信息导入后才可以开通。如果在员工列表看不到有两种可能：一是该员工暂时还没有新增到差旅宝员工名单中，这是如果你的账号有新增员工的权限，可以通过右上角新增员工按钮直接进行员工信息添加，如果没有新增员工权限，则需要联系管理在PC端帮忙加上该员工的信息；二是，你的账号没有为该员工预订的权限，所有无法查看该员工的信息，这种情况下如果想帮忙该员工预订需要联系管理员对你可帮谁预订的权限进行修改才可以帮他预订；系统默认所有人都是可以为自己预订'},
    {'question':'我有个私人出行行程我可以在差旅宝上预订吗？订单会不会被企业的人知道呢？','reply':'差旅宝支持因公因私流程，像以上这种情况可以直接使用因私流程进行产品预订，因私产品预订和在其他网站产品预订一样，订单不会出现在企业报表上'},
    {'question':'我想知道订单什么情况下需要审批，订单审批人是谁？','reply':'差旅宝订单是否审批受旅客的审批名单控制，受订票人的审批规则控制，规则如下：如果订单的旅客出现在审批名单中则无论什么预订都需要审批，并根据名单设置的审批人进行审批；如果旅客不出现在审批名单中，则根据订到的审批规则进行判断是否需要审批，如果需要不需要审批，则不需要审批，如果需要审批，则发送给规则对设置对应的审批人审批'},
    {'question':'差旅宝机票产品预订，“订座失败”是怎么回事？','reply':'机票产品预订，订单提交成功后，就会去订座，订座成功后就会返回订座成功（占位成功），但是有时候会出现订座失败，就是占位不成功，这有可能是机票无位置或者其他原因导致的，这个时候我们的差旅顾问会和你联系确定订单，或者你可以取消订单重新下单'},
    {'question':'因公流程预订产品为什么要选择或者填写成本中心？','reply':'成本中心主要定义为本次产品的费用成本对应是哪个成本中心负担，在因公流程产品预订过程中，成本中心为必填项，主要是为了方便后期订单成本统计'},
    {'question':'我怎么知道订单什么时候审批通过或者拒绝？','reply':'订单通过或者拒绝后，将会以短信、邮件的方式将审批结果发送告知订票人。'},
    {'question':'因公流程，我想要帮客户（非员工）订票怎么订？','reply':'由于，因公流程产品预订必须先选择旅客，所有如果要帮非员工旅客订票有两种解决方式：一是，直接在将非员工（旅客）添加到员工列表上，设置相对应的差旅政策规则进行产品预订；二是，和员工旅客一起预订，选择一个员工旅客后，然后在填写资料页再将该非员工旅客添加到上面进行预订'},
    {'question':'预订产品过程中，企业信用额度不足怎么办？','reply':'企业信用额度不足时，可以与企业管理员联系，或者与差旅顾问联系帮忙调整临时额度。'},
]

export default class Feedback  extends Component {
    constructor(props) {
        super(props);
        this.state={
            account:this.props.Account,
        };
    }
    render(){
        let dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        dataSource = dataSource.cloneWithRows(Problem);
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                <Navbar navigator={this.props.navigator} title={lan.feedback} />
                <Text style={{color:'#666',fontSize:14,marginLeft:15,marginTop:10,marginBottom:2}}>{lan.commonProblem}</Text>
                <ListView
                    style={{marginTop:3,backgroundColor:'#fff'}}
                    dataSource={dataSource}
                    renderRow={this.getProblemView.bind(this)}
                />
                <View style={{width:width,backgroundColor:'#ebebeb',height:0.8}} />
                <View style={{flexDirection:'row',backgroundColor:'#fff'}}>
                    <TouchableOpacity style={{height:50,flex:1,alignItems:'center',justifyContent:'center'}}
                                        onPress={()=>this.toHistoryQuestion()}>
                        <Text style={{fontSize:16,color:'#333'}}>{lan.historyQuestions}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{height:50,flex:1,alignItems:'center',justifyContent:'center',
                                        backgroundColor:COLORS.btnBg}} onPress={()=>this.toAdvice()}>
                        <Text style={{fontSize:16,color:'#fff',}}>{lan.advise}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    getProblemView = (vaule) => {
        return(
            <View>
                <TouchableOpacity style={{marginLeft:15,marginRight:15,flexDirection:'row',
                                    alignItems: 'center',marginBottom:10,marginTop:10}}
                                    onPress={()=>this.toDetailProblem(vaule.question,vaule.reply)}>
                    <Text style={{color:'#333',fontSize:15,flex:1}}>{vaule.question}</Text>
                    <Icon icon={'0xe677'} color={'#999'} style={{fontSize: 18,marginLeft:2}}/>
                </TouchableOpacity>
                <View style={{width:width,backgroundColor:'#ebebeb',height:0.8}} />
            </View>
        );
    }

    //查看问题
    toDetailProblem = (title,content) => {
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'DetailProblem',
                component: DetailProblem,
                passProps:{
                    Title: title,
                    Content:content,
                }
            });
        }
    }

    toAdvice = () => {
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'Advice',
                component: Advice,
                passProps:{
                    Account:this.state.account,
                }
            });
        }
    }

    toHistoryQuestion = () => {
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'HistoryQuestion',
                component: HistoryQuestion,
                passProps:{
                    Account:this.state.account,
                }
            });
        }
    }
}