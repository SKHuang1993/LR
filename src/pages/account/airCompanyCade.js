import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    ListView,
    ScrollView,
    Platform,
    BackAndroid,
    TouchableOpacity,
} from 'react-native';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import {COLORS} from '../../styles/commonStyle';
import AddAirCade from './addAirCade';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class AirCompanyCade  extends Component {
    constructor(props) {
        super(props);
        let myinfo = this.props.myInfo;
        
        this.state={
            dataSource:new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            milescard:myinfo.Result.Milescards,
        };
    }

    // componentDidMount(){
    //      let ds = new ListView.DataSource({
    //         rowHasChanged: (row1, row2) => row1 !== row2,
    //     });
    //     this.setState({
    //         dataSource:ds.cloneWithRows(milescard),
    //     });
    //  }

    render(){
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                <Navbar navigator={this.props.navigator} title={lan.airlinesCard} rightIcon={'0xe680'}
                        onRightClick={()=>this.addAirCadeEvent("","",true,-1)}/>
                {JSON.stringify(this.state.milescard)== null ? this.noMilescardView() : this.milescadeInfo()}
            </View>
        )
    }

    noMilescardView = ()=>{
        return(
            <Text style={{textAlign:'center',width:width,color:'#999',fontSize:15,marginTop:50}}>{lan.noMilescard}</Text>
        );
    }

    milescadeInfo = () =>{
        let ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.state.dataSource = ds.cloneWithRows(this.state.milescard);
        return(
            <ListView
                 dataSource={this.state.dataSource}
                 renderRow={(rowData,sectionId,rowId)=>this.getMilescardView(rowData,rowId)}
             />
        );
    }

    getMilescardView = (value,index) => {
        return(
            <View >
                <View style={styles.milescardViewStyle}>
                    <View style={{flex:1}}>
                        <Text style={{fontSize:16,color:'#333'}}>{value.Issuer}</Text>
                        <Text style={{fontSize:13,color:'#999',marginTop:1}}>{lan.cadeNum+":"+value.Value}</Text>
                    </View>
                    <TouchableOpacity onPress={()=>this.addAirCadeEvent(value.Issuer,value.Value,false,index)}>
                        <Icon icon={'0xe685'} color={'#999'} style={{fontSize: 18,marginLeft:3}}/>
                    </TouchableOpacity>
                </View>
                <View style={{backgroundColor:'#ebebeb',height:0.8}}/>
            </View>
        );
    }

    addAirCadeEvent = (issuer,value,isAdd,ind) =>{
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'AddAirCade',
                component: AddAirCade,
                passProps:{
                    CadeNum:value,
                    CadeName:issuer,
                    IsAdd:isAdd,
                    Index:ind,
                    MyInfo:this.props.myInfo.Result,
                    RefreshEvent:()=>{}
                }
            })
        }
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
    milescardViewStyle:{
        flexDirection:'row',
        backgroundColor:"#fff",
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
        paddingBottom:10,
    },
})