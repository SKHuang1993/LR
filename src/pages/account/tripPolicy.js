import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    ScrollView,
    Platform,
    BackAndroid,
} from 'react-native';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';
import NoData from '../../components/noDataTip'

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class TripPolicy  extends Component {
    constructor(props) {
        super(props);
        this.state={
            policyDomestic:'',//国内机票差旅政策
            policyInternational:'',//国际机票差旅政策
            policyDomesticTrain:'',//国内火车差旅政策
            policyHotel:'',//酒店差旅政策
        };
    }

    render(){
        let myinfo = this.props.myInfo;
        if(myinfo.Result.PolicyDetail != null){
            this.state.policyDomestic = myinfo.Result.PolicyDetail.PolicyContent.PolicyDomestic != null ? myinfo.Result.PolicyDetail.PolicyContent.PolicyDomestic :'{}';//国内机票差旅政策
            this.state.policyInternational = myinfo.Result.PolicyDetail.PolicyContent.PolicyInternational != null ? myinfo.Result.PolicyDetail.PolicyContent.PolicyInternational : '{}';//国际机票差旅政策
            this.state.policyDomesticTrain = myinfo.Result.PolicyDetail.PolicyContent.PolicyDomesticTrain != null ? myinfo.Result.PolicyDetail.PolicyContent.PolicyDomesticTrain : '{}';//国内火车差旅政策
            this.state.policyHotel = myinfo.Result.PolicyDetail.PolicyContent.PolicyHotel != null ? myinfo.Result.PolicyDetail.PolicyContent.PolicyHotel : '{}';//酒店差旅政策
            return(
                <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                    <Navbar navigator={this.props.navigator} title={lan.tripPolicy}/>
                    <ScrollView style={{backgroundColor:COLORS.containerBg}}>
                        {this.state.policyDomestic=='{}' ? null : this.policyTicketView(this.state.policyDomestic,1)}
                        {this.state.policyInternational=='{}' ? null : this.policyTicketView(this.state.policyInternational,2)}
                        {this.state.policyDomesticTrain=='{}' ? null : this.policyTrainView(this.state.policyDomesticTrain)}
                        {this.state.policyHotel=='{}' ? null : this.policyHotelView(this.state.policyHotel)}
                    </ScrollView>
                </View>
            )
        }else{
            return(
                <View style={{ flex: 1 }}>
                    <Navbar navigator={this.props.navigator} title={lan.tripPolicy}/>
                    <NoData noDataState={4}/>
                </View>
            );
        }
    }

    //国内国际机票政策界面
    policyTicketView = (policy,i) =>{
        let isVisTitle = true;
        if(!policy.AgreementAirline && policy.LatestBooking == null && policy.TimeLowTicket == null &&
            policy.TicketDiscountUpperLimit == null && policy.HighestCabin == null && policy.DepartureTimeStart == null
             && policy.ArriveTimeStart == null) 
            isVisTitle = false;
        return(
            <View style={{marginTop:10,}}>
                {isVisTitle ?
                <Text style={styles.policyTextStyle}>{i == 1 ? lan.policyDomestic : lan.policyInternational}</Text>
                :null}
                {policy.LatestBooking == null ? null : 
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{lan.latestBookingTime+":"+policy.LatestBooking+lan.day}</Text>
                        </View>
                    </View>
                }
                
                {policy.TimeLowTicket == null ? null : 
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{"航班价格前后"+policy.TimeLowTicket+"分钟内是最低"}</Text>
                        </View>
                    </View>
                }

                {policy.TicketDiscountUpperLimit == null ? null :
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{"机票价格在"+policy.TicketDiscountUpperLimit+"折以内"}</Text>
                        </View>
                    </View>
                }

                {policy.HighestCabin == null ? null : 
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{lan.cabinRestriction+":"+this.getCabinType(policy.HighestCabin)}</Text>
                        </View>
                    </View>
                }

                {policy.AgreementAirline ? 
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{lan.airlinePriority}</Text>
                        </View>
                    </View>
                : null}

                {policy.DepartureTimeStart == null ? null :
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{lan.departureTime+" "+policy.DepartureTimeStart+'-'+policy.DepartureTimeEnd+"内最低航班"}</Text>
                        </View>
                    </View>
                }

                {policy.ArriveTimeStart == null ? null : 
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{lan.arrivalTime+" "+policy.ArriveTimeStart+'-'+policy.ArriveTimeEnd+"内最低航班"}</Text>
                        </View>
                    </View>
                }
            </View>
        );
    }

    //火车政策界面
    policyTrainView = (policy) => {
        return(
            <View style={{marginTop:10,}}>
                <Text style={styles.policyTextStyle}>{lan.policyDomesticTrain}</Text>

                {policy.HighestCabin == null ? null : 
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{lan.expressSeatRestriction+":"+this.trainMapping(policy.ExpreeTrainClassLimit)}</Text>
                        </View>
                    </View>
                }

                {policy.HighestCabin == null ? null : 
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{lan.ordinarySeatRestriction+":"+this.trainMapping(policy.OtherClassLimit)}</Text>
                        </View>
                    </View>
                }

                {policy.HighestCabin == null ? null : 
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{lan.sleepingBerthRestriction+":"+this.trainMapping(policy.BerthClassLimit)}</Text>
                        </View>
                    </View>
                }
            </View>
        )
    }


    //酒店政策界面
    policyHotelView = (policy) => {
        let isVisTitle = true;
        if(!policy.AgreementAirline && policy.OtherCityPriceLimit == null && policy.OtherCityPriceLimit == null &&
            policy.StarLimit == null ) 
            isVisTitle = false;
        return (
            <View style={{marginTop:10,}}>
                {isVisTitle ?
                <Text style={styles.policyTextStyle}>{lan.policyHotel}</Text>
                :null}
                
                {policy.ConfigCityPriceLimits == null ? null : 
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{lan.appointHotelPriceRestriction+":"+
                                this.getHotelName(policy.ConfigCityPriceLimits[0].Cities)+","+lan.highestPrice+":"+
                                policy.ConfigCityPriceLimits[0].Price+"元/间/夜"}</Text>
                        </View>
                    </View>
                }

                {policy.OtherCityPriceLimit == null ? null : 
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{lan.otherHotelPriceRestriction+":"+policy.OtherCityPriceLimit+"元/间/夜"}</Text>
                        </View>
                    </View>
                }

                {policy.StarLimit == null ? null :
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{lan.starRestriction+":"+this.hotelMapping(policy.StarLimit)}</Text>
                        </View>
                    </View>
                }

                {policy.AgreementAirline ? 
                    <View>
                        <View style={styles.itemViewStyle}>
                            <Icon icon={'0xe676'} color={COLORS.btnBg} style={{fontSize: 18,}} />
                            <Text style={styles.itemTextStyle}>{lan.hotelPriority}</Text>
                        </View>
                    </View>
                : null}
            </View>
        );
    }

    getCabinType = (t) =>{
        if(t == 'Y') return lan.economyClass;
        else if(t == 'P') return lan.highEeconomyClass;
        else if(t == 'C') return lan.businessClass;
        else if(t == 'F') return lan.firstClass;
        else return lan.noRestriction; 
    }    

    trainMapping = (t) =>{
        if(t == 'yz') return lan.hardSeat;
        else if (t == 'yw') return lan.hardSleeper;
        else if (t == 'rz') return lan.softSeats;
        else if (t == 'wz') return lan.noSeat;
        else if (t == 'rwx') return lan.softSleeper;
        else if (t == 'gwx') return lan.highGradeSoftBerth;
        else if (t == 'rz2') return lan.secondClassSeat;
        else if (t == 'rz1') return lan.firstClassSeat;
        else if (t == 'tdz') return lan.specialSeat;
        else if (t == 'swz') return lan.businessSeat;
        else if (t == 'none') return lan.unableSleepingBerth;
    }

    hotelMapping = (t) =>{
        if(t == 1) return lan.oneStar;
        else if(t == 2) return lan.twoStar;
        else if(t == 3) return lan.threeStar;
        else if(t == 4) return lan.fourStar;
        else if(t == 5) return lan.fiveStar;
        else if(t == 0) return lan.noRestrictonStar;
    }

    getHotelName = (myArray) =>{
        let cityName = '';
        for (var value of myArray) {
            cityName = cityName+value.Name+" ";
        }
        return cityName;
    }

    componentWillMount(){
         if(Platform.OS === 'android'){
             BackAndroid.addEventListener('hardwareBackPress',this.onBackAndroid);
         };
     }

     componentWillUnmount(){
         if(Platform.OS === 'android'){
             BackAndroid.removeEventListener('hardwareBackPress',this.onBackAndroid);
         }
     }
     onBackAndroid = ()=>{
        const {navigator} = this.props;
         if(navigator){
             navigator.pop();
             return true;
         }
         return false;
     }
}

const styles = StyleSheet.create({
    policyTextStyle:{
        fontSize:14,
        color:'#999',
        paddingLeft:15,
        paddingBottom:2,
    },
    itemViewStyle:{
        paddingLeft:15,
        paddingRight:15,
        flexDirection:'row',
        paddingBottom:10,
        paddingTop:10,
        marginBottom:0.8,
        backgroundColor:'#fff',
        alignItems: 'center',
    },
    itemTextStyle:{
        color:'#333',
        fontSize:16,
        marginLeft:5,
        paddingRight:15
    },
})