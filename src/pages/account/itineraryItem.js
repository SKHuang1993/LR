import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    ListView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
} from 'react-native';
import {Tabs,Toast,Popup,} from 'antd-mobile';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import{ RestAPI } from '../../utils/yqfws';
import RadiusImage from '../../components/radiusImage/index';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

const productInfo = {
    "leftBordeColor":'#ed7571',
    "productType":8,
    "airIcon":'CZ',
    "prodyctName":'南航 CZ3604',
    "aircraftType":'机型320',
    "cabin":'经济舱X',
    "productIcon":'0xe660',
    "borderViewColor":'#e9524e',
    "startTime":'08:08 新白云机场T3',
    "endTime":'18:18 虹桥机场T1',
    "timeLong":'时长：3h25m',
    "allRoad":'总里程：1888km',
    "passenger":[
        {
            "PassengerName":'黄炼鹏',
            "TicketNrDisplay":'898-123456789'
        },
        {
            "name":'黄炼鹏',
            "num":'898-123456789'
        }
    ],
    "person":'苏沐风、周小妖',
    "address":'广州市白云区天寿路215号',
    "phoneNum":'020-25541235',
    "roomType":'FAMILY ROOMS STANDARD',
    "count":'2间2晚',
};

export default class ItineraryItem  extends Component {
    static propTypes = {
        Info:PropTypes.object,
	}
    constructor(props) {
        super(props);
        if(this.props.Info != null)
            productInfo = this.props.Info;
        this.state={
            dataSource: new ListView.DataSource({
                 rowHasChanged: (row1, row2) => row1 !== row2,
             }),
        }
    }

    componentWillMount(){
        let ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.state.dataSource = ds.cloneWithRows(productInfo.passenger);
    }

    //8-国内机票，9-国际机票，2-酒店，5-签证，4-保险,3-火车票
    render(){
        // if(productInfo.passenger != ''){
            // let ds = new ListView.DataSource({
            //     rowHasChanged: (row1, row2) => row1 !== row2,
            // });
            // this.state.dataSource = ds.cloneWithRows(productInfo.passenger);
        // }
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg,marginBottom:15}}>
                <View style={[styles.viewStyle,{backgroundColor:productInfo.leftBordeColor}]}>
                <View style={{backgroundColor:"#fff",marginLeft:6,flex:1,borderTopRightRadius:8,borderBottomRightRadius:8}}>
                    <View style={{flexDirection:'row',alignItems:'center',padding:10}}>
                        {(productInfo.productType == 8 || productInfo.productType == 9) ? 
                        <RadiusImage pathType={1} 
                                imagePath={"http://airlineico.b0.upaiyun.com/"+productInfo.airIcon+".png"}
                                radiusNum={30} imgWidth={15} imgHeight={15}/> 
                        : null}
                        <Text style={{fontSize:15,color:'#666',marginLeft:5}}>{productInfo.prodyctName}</Text>
                        {(productInfo.productType == 8 || productInfo.productType == 9 || productInfo.productType == 3) ? 
                        <View style={{flexDirection:'row'}}>
                            <View style={{backgroundColor:'#666',width:1,height:13,marginLeft:8,marginRight:8,marginTop:5}}/>
                            <Text style={{fontSize:15,color:'#666'}}>{productInfo.aircraftType}</Text>
                            <View style={{backgroundColor:'#666',width:1,marginLeft:8,height:13,marginRight:8,marginTop:5}}/>
                            <Text style={{fontSize:15,color:'#666'}}>{productInfo.cabin}</Text>
                        </View>
                        : null}
                    </View>

                    <View style={{backgroundColor:'#ebebeb',height:0.8}}/>

                    <View style={{flexDirection:'row',padding:25}}>
                        <View style={{justifyContent:'center',alignItems:'center'}}>
                            <Icon icon={productInfo.productIcon} color={'#ccc'} style={{fontSize:25,}}/>
                        </View>
                        
                        <View style={{justifyContent:'center',alignItems:'center',marginLeft:15}}>
                            <View style={{borderColor:productInfo.borderViewColor,borderRadius:8,width:8,height:8,borderWidth:1.3}}/>
                            <Text style={{color:productInfo.borderViewColor,width:2,fontSize:8,textAlign:'center'}}>llll</Text>
                            <View style={{borderColor:productInfo.borderViewColor,borderRadius:8,width:8,height:8,borderWidth:1.3}}/>
                        </View>

                        <View style={{marginLeft:10,flex:1}}>
                            <Text style={{flex:1,fontSize:15,color:'#333',position: 'absolute',top: -5,}}>{productInfo.startTime}</Text>
                            <Text style={{fontSize:15,color:'#333',position: 'absolute',bottom: -3,}}>{productInfo.endTime}</Text>
                        </View>
                    </View>

                    {productInfo.productType == 8 || productInfo.productType == 9 ? 
                    <View>
                        <View style={{marginBottom:5,marginLeft:10,marginRight:10,flexDirection:'row'}}>
                            <Text style={{flex:1,fontSize:13,color:'#999'}}>{productInfo.timeLong}</Text>
                            <Text style={{flex:1,fontSize:13,color:'#999'}}>{productInfo.allRoad}</Text>
                        </View>
                        <ListView style={{marginBottom:15,marginLeft:10}}
                                dataSource={this.state.dataSource}
                                renderRow={this.getPlaneTicketInfo.bind(this)}/>
                    </View>
                    : null}

                    {productInfo.productType == 4 ? 
                    <Text style={{fontSize:13,color:'#999',marginBottom:15,marginLeft:10}}>{lan.beInsurance+":"+productInfo.person}</Text>
                    : null}

                    {productInfo.productType == 5 ? 
                    <View>
                        <View style={{marginBottom:10,marginLeft:10,marginRight:10,flexDirection:'row'}}>
                            <Text style={{flex:1,fontSize:13,color:'#999'}}>{productInfo.timeLong}</Text>
                            <Text style={{flex:1,fontSize:13,color:'#999'}}>{productInfo.allRoad}</Text>
                        </View>
                        <Text style={{marginBottom:15,marginLeft:10}}>{lan.passenger+productInfo.person}</Text>
                    </View>
                    : null}

                    {productInfo.productType == 3 ? 
                    <ListView style={{marginBottom:15,marginLeft:10}}
                                enableEmptySections = {true}
                                dataSource={this.state.dataSource}
                                renderRow={this.getTrainTicketInfo.bind(this)}/>
                    : null}

                    {productInfo.productType == 2 ? 
                    <View style={{marginLeft:10,marginBottom:10}}>
                        <Text style={{color:'#999',fontSize:13,marginBottom:5}}>{lan.address+":"+productInfo.address}</Text>
                        <Text style={{color:'#999',fontSize:13,marginBottom:5}}>{lan.telephone+":"+productInfo.phoneNum}</Text>
                        <Text style={{color:'#999',fontSize:13,marginBottom:5}}>{lan.roomLayout+":"+productInfo.roomType}</Text>
                        <Text style={{color:'#999',fontSize:13,marginBottom:5}}>{lan.number+":"+productInfo.count}</Text>
                    </View>
                    : null}
                    
                </View>
               
                </View>
            </View>
        )
    }

    getPlaneTicketInfo = (value) => {
        return(
            <Text style={{color:'#999',fontSize:13,paddingBottom:3}}>{lan.passenger+":"+value.PassengerName+"  "+lan.ticketNum+(value.TicketNrDisplay==null?'':value.TicketNrDisplay)}</Text>
        );
    }

    getTrainTicketInfo = (value) => {
        return(
            <Text style={{color:'#999',fontSize:13,paddingBottom:3}}>{value.PassengerName+"  ("+value.TicketNrDisplay+")"}</Text>
        );
    }
}

const styles = StyleSheet.create({
    viewStyle:{
        flexDirection:'row',
        marginLeft:10,
        marginRight:10,
        borderRadius:8,
    },
})