import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
} from 'react-native';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();
export default class IntroduceCLB  extends Component {
    render(){
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                <Navbar navigator={this.props.navigator} title={lan.introduce_clb} />
                <Text style={{color:'#333',fontSize:16,marginTop:10,marginLeft:10,marginRight:10}}>{'        一起飞差旅宝隶属于广州市一起飞商旅信息服务有限公司旗下广州市中航服商务管理有限公司，专门为企业客户打造的差旅管理服务品牌，以“管理提升竞争力”为理念，致力于为广大企业客户提供全面专业的优质差旅管理解决方案。一起飞差旅宝整合全球300多家航空公司往返约192个国家、4088个城市的航班信息，拥有全球约15万家酒店资源，提供全球航班及酒店信息查询预订、信息交互系统、实时对账单系统、动态分析报表、消费分析报表、数据API接口等多种差旅管理服务。强大的在线服务系统，结合广州市中航服经验丰富的专家顾问团队，一起飞差旅宝针对大中小型规模、不同需求的客户制定最合适的个性化商旅方案，为客户带来优质可靠的全新差旅体验。'}</Text>
            </View>
        );
    }
}