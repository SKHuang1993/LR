import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    ListView,
} from 'react-native';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

const guideInfo = [
    {'question':'第一次使用差旅宝APP 如何进行订票？','answer':'首先，需要客户经理帮忙开通企业账号时，协商沟通确定企业的月结的信用额度并设置；开通账号后，需要超级管理员账号在PC端进行相关的差旅设置（差旅政策、审批规则、审批名单、出差原因、违背原因等），然后进行员工信息导入开通员工账号，这样员工就可以使用对应的账号登录使用差旅宝APP，从而进行订票'},
    {'question':'什么情况下可以使用手机动态密码快捷登录？','answer':'差旅宝在开通账号时，使用手机号码进行差旅宝账号开通的账号，则可以在APP使用手机动态密码快捷登录'},
    {'question':'我账号相关的权限角色是怎么设置的？','answer':'管理员在PC端优先进行角色权限的设置，设置好后，在新增员工信息开通账号时关联已经设置好的角色，就完成了角色权限的设置，该员工则拥有该角色对应的权限'},
    {'question':'在“选择员工”列表找不到要帮忙订票的员工怎么办？','answer':'员工列表显示的员工名单，是管理员通过员工信息导入后才可以显示在我的员工列表上。如果在员工列表看不到有两种可能：一是该员工暂时还没有新增到差旅宝员工名单中，这是如果你的账号有新增员工的权限，可以通过右上角新增员工按钮直接进行员工信息添加，如果没有新增员工权限，则需要联系管理在PC端帮忙加上该员工的信息；二是，你的账号没有为该员工预订的权限，所有无法查看该员工的信息，这种情况下如果想帮忙该员工预订需要联系管理员对你可帮谁预订的权限进行修改才可以帮他预订；系统默认所有人都是可以为自己预订'},
    {'question':'“差旅政策”是什么？','answer':'差旅政策是差旅宝特有的，用于产品预订成本控制的一整套政策，每种产品都有对应的差旅政策，每个员工都会对应设置一个差旅政策；员工差旅政策设置好后会在产品预订的过程中，体现出是否违背差旅政策；对于违背差旅政策的订单可以通过设置需要审批才可以出票成功，从而达到产品成本控制的效果。'},
    {'question':'可以预订“违背差旅政策”的航班吗？','answer':'可以预订。'},
    {'question':'订单什么情况下需要审批？','answer':'差旅宝订单是否审批受订票人的审批规则控制及旅客的审批名单控制。控制规则如下：如果订单的旅客出现在审批名单中则无论什么预订都需要审批，并根据名单设置的审批人进行审批；如果旅客不出现在审批名单中，则根据订到的审批规则进行判断是否需要审批，如果需要不需要审批，则不需要审批，如果需要审批，则发送给规则对设置对应的审批人审批'},
    {'question':'订单出票成功后有疑问怎么办？','answer':'差旅宝有差旅顾问全程一对一服务，订单提交后，即会分配对应的差旅顾问进行订单跟进，出票成功后有什么疑问都可以随时随地在订单详情页找到差旅顾问的联系方式进行联系求答。'},
    {'question':'在使用APP过程中遇到问题怎么办？','answer':'在使用APP 过程中遇到任何问题都可以在的“个人中心->问题反馈”入口对问题描述清楚进行提交，提交后将会有产品进行解读回复。'},
]

export default class UseGuide  extends Component {
    render(){
        //全部订单listview关联的数据
        let dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        dataSource = dataSource.cloneWithRows(guideInfo);
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                <Navbar navigator={this.props.navigator} title={lan.useGuide} />
                <ListView
                    style={{marginTop:10,marginLeft:10,marginRight:10}}
                    dataSource={dataSource}
                    renderRow={this.getGuideInfo.bind(this)}
                />
            </View>
        );
    }

    getGuideInfo =(vaule) => {
        return(
            <View style={{paddingBottom:40}}>
                <Text style={{color:'#333',fontSize:17}}>{vaule.question}</Text>
                <Text style={{color:'#666',fontSize:14,marginTop:3}}>{vaule.answer}</Text>
            </View>
        );
    }
}