import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    ListView,
    Alert,
    TouchableOpacity,
    Platform,
    BackAndroid,
} from 'react-native';
import {Tabs,Toast} from 'antd-mobile';
import Flex from '../../components/flex';
import Icon from '../../components/icons/icon';
import RadiusImage from '../../components/radiusImage/index';
import {COLORS} from '../../styles/commonStyle';

var {width,height} = Dimensions.get('window')

export default class ApprovalItem extends Component {
    
    constructor(props) {
        super(props);       
        this.state={
            
        };
    }


    render(){
        
        return (
            <View style={{ marginTop: 15 }}>
                <View style={styles.titleViewStyle}>
                    <Text style={{ fontSize: 15, color: "#666", flex: 1 }}>苏沐风的订单审批申请</Text>
                    <Text style={{ fontSize: 15, color: COLORS.secondary, }}>待审批</Text>
                </View>
                {/*<ListView></ListView>*/}
                {this.planeTicketView()}
                {this.trainTicketView()}
                <View style={styles.contactViewStyle}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontSize: 15, color: '#666',width:76,textAlign:'right' }}>出差原因：</Text>
                        <Text style={{ fontSize: 15, color: '#333',flex:1 }}>因公出差</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontSize: 15, color: '#666',width:76,textAlign:'right' }}>同行人：</Text>
                        <Text style={{ fontSize: 15, color: '#333',flex:1 }}>周小瑶、周小瑶</Text>
                    </View>
                </View>

                {/*已审批的话，只有查看明细部分*/}
                <View style={styles.titleViewStyle}>
                    <Text style={{ flex: 1 }}></Text>
                    <TouchableOpacity style={styles.payBorderStyle}>
                        <Text style={{ color: COLORS.btnBg }}>审批拒绝</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.checkOrderBorderStyle}>
                        <Text style={{ color: '#333' }}>审批通过</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.checkOrderBorderStyle}>
                        <Text style={{ color: '#333' }}>查看明细</Text>
                    </TouchableOpacity>
                </View>
                {/*审批拒绝*/}
                {/*<Icon icon={'0xe690'} color={'#8f8f8f'} style={{ fontSize: 88, position: 'absolute', right: 50, top: -10 }}></Icon>*/}
                {/*审批通过*/}
                <Icon icon={'0xe68f'} color={'#fca7a5'} style={{ fontSize: 88, position: 'absolute', right: 50, top: -10 }}></Icon>

            </View>
        );
    }

    planeTicketView = (info) => {
        return(
            <View>
                <View style={styles.itemViewStyle}>
                    <Icon icon={'0xe660'} color={'#999'} style={{fontSize: 18,}} />
                    <View style={{flex:1,marginLeft:10}}>
                        <Text style={{color:'#333',fontSize:16}}>长沙-株洲、株洲-长沙</Text>
                        <Text style={{color:'#666'}}>2017.01.12-2017-01-15（3天）</Text>
                    </View>                                      
                </View>
                <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
            </View>
        );
    }

    hotelView = (info) => {
        return(
            <View>
                <View style={styles.itemViewStyle}>
                    <Icon icon={'0xe661'} color={'#999'} style={{fontSize: 18,}} />
                    <View style={{flex:1,marginLeft:10}}>
                        <Text style={{color:'#333',fontSize:16}}>新加坡瑞吉874酒店</Text>
                        <Text style={{color:'#666'}}>2017.01.12-2017-01-15（3天）</Text>
                    </View>                
                </View>
                <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
            </View>
        );
    }

    trainTicketView = (info) => {
        return(
            <View>
                <View style={styles.itemViewStyle}>
                <Icon icon={'0xe662'} color={'#999'} style={{fontSize: 18,}} />
                <View style={{flex:1,marginLeft:10}}>
                    <Text style={{color:'#333',fontSize:16}}>长沙-株洲、株洲-长沙</Text>
                    <Text style={{color:'#666'}}>2017.01.12-2017-01-15（3天）</Text>
                </View>               
            </View>
            <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
            </View>
        );
    }

    insuranceView = (info) =>{
        return(
            <View>
                <View style={styles.itemViewStyle}>
                <Icon icon={'0xe697'} color={'#999'} style={{fontSize: 18,}} />
                <View style={{flex:1,marginLeft:10}}>
                    <Text style={{color:'#333',fontSize:16}}>国泰保险</Text>
                    <Text style={{color:'#666'}}>2017.01.12-2017-01-15（3天）</Text>
                </View>               
            </View>
            <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
            </View>
        );
    }

    visaView = (info) => {
        return(
            <View>
                <View style={styles.itemViewStyle}>
                <Icon icon={'0xe696'} color={'#999'} style={{fontSize: 18,}} />
                <View style={{flex:1,marginLeft:10}}>
                    <Text style={{color:'#333',fontSize:16}}>泰国签证</Text>
                    <Text style={{color:'#666'}}>2017.01.12-2017-01-15（3天）</Text>
                </View>
            </View>
            <View style={{backgroundColor:'#ebebeb',height:0.8}}></View>
            </View>
            
        );
    }

}

const styles = StyleSheet.create({
    titleViewStyle:{
        flexDirection:'row',
        backgroundColor:"#fff",
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
        paddingBottom:10,
    },
    itemViewStyle:{
        backgroundColor:'#f7f7f7',
        flexDirection:'row',
        paddingLeft:15,
        paddingRight:15,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop:10,
        paddingBottom:10,
    },
    contactViewStyle:{
        backgroundColor:"#f7f7f7",
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
        paddingBottom:10,
    },
    priceViewStyle:{
        flexDirection:'row',
        backgroundColor:"#fff",
        alignItems:'flex-end',
        justifyContent: 'center',
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
        paddingBottom:10,
    },
    checkOrderBorderStyle:{
        marginLeft:15,
        borderColor:'#333',
        borderRadius:5,
        borderWidth:0.5,
        padding:5,
    },
    payBorderStyle:{
        marginLeft:15,
        borderColor:COLORS.btnBg,
        borderRadius:5,
        borderWidth:0.5,
        padding:5,
    },
    viewStyle:{
        position: 'absolute',
    },
})