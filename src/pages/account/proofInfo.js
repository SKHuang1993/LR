import React, {Component} from 'react';
import {
	StyleSheet,
	View,
	TouchableOpacity,
    Text,
    Dimensions,
    ScrollView,
    Platform,
    BackAndroid,
} from 'react-native';
import Icon from '../../components/icons/icon';
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import Navbar from '../../components/navBar/index';
import UpdataProofInfo from './updataProofInfo';

var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

export default class ProofInfo  extends Component {
    constructor(props) {
        super(props);
        this.state={
            myID:'',//身份证号-ID
            passport:'',//护照-PP
            MTP:'',//台胞证-12
            reentryPermit:'',//回乡证-11
            militaryCard:'',//军人证-10
            EEP:'',//港澳通行证-13
            other:'',//其他证件-NI
        }
    }

    componentDidMount(){
    }

    render(){
        let i = 0;
        let myinfo = this.props.myInfo;
        for (i in myinfo.Result.Proofs) {
            if(myinfo.Result.Proofs[i].Name == 'ID'){
                this.state.myID = myinfo.Result.Proofs[i].Value;
            }else if(myinfo.Result.Proofs[i].Name == 'PP'){
                this.state.passport = myinfo.Result.Proofs[i].Value;
            }else if(myinfo.Result.Proofs[i].Name == '12'){
                this.state.MTP = myinfo.Result.Proofs[i].Value;
            }else if(myinfo.Result.Proofs[i].Name == '11'){
                this.state.reentryPermit = myinfo.Result.Proofs[i].Value;
            }else if(myinfo.Result.Proofs[i].Name == '10'){
                this.state.militaryCard = myinfo.Result.Proofs[i].Value;
            }else if(myinfo.Result.Proofs[i].Name == '13'){
                this.state.EEP = myinfo.Result.Proofs[i].Value;
            }else {
                this.state.other = myinfo.Result.Proofs[i].Value;
            }
        }   
        return(
            <View style={{backgroundColor:COLORS.containerBg,flex:1}}>
                <Navbar navigator={this.props.navigator} title={lan.proofIngo}/>
                <View style={styles.itemViewStyle}>
                    <Text style={styles.leftTextStyle}>{lan.ID}</Text>
                    <TouchableOpacity style={{flexDirection:'row',flex:2.5,}} onPress={()=>this.updataProof("ID",lan.ID,this.state.myID)}>
                        <Text style={[styles.rightTextStyle,{color: this.state.myID == '' ? '#999' : '#333'}]}>
                            {this.state.myID == '' ? lan.supplement : this.state.myID}</Text>
                        <Icon icon={'0xe685'} color={'#ccc'} style={{fontSize: 18,marginLeft:3}}/>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemViewStyle}>
                    <Text style={styles.leftTextStyle}>{lan.passport}</Text>
                    <TouchableOpacity style={{flexDirection:'row',flex:2.5,}} onPress={()=>this.updataProof("PP",lan.passport,this.state.passport)}>
                        <Text style={[styles.rightTextStyle,{color: this.state.passport == '' ? '#999' : '#333'}]}>
                            {this.state.passport == '' ? lan.supplement : this.state.passport}</Text>
                        <Icon icon={'0xe685'} color={'#ccc'} style={{fontSize: 18,marginLeft:3}}/>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemViewStyle}>
                    <Text style={styles.leftTextStyle}>{lan.mtp}</Text>
                    <TouchableOpacity style={{flexDirection:'row',flex:2.5,}} onPress={()=>this.updataProof("12",lan.mtp,this.state.MTP)}>
                        <Text style={[styles.rightTextStyle,{color: this.state.MTP == '' ? '#999' : '#333'}]}>
                            {this.state.MTP == '' ? lan.supplement : this.state.MTP}</Text>
                        <Icon icon={'0xe685'} color={'#ccc'} style={{fontSize: 18,marginLeft:3}}/>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemViewStyle}>
                    <Text style={styles.leftTextStyle}>{lan.reentryPermit}</Text>
                    <TouchableOpacity style={{flexDirection:'row',flex:2.5,}} onPress={()=>this.updataProof("11",lan.reentryPermit,this.state.reentryPermit)}>
                        <Text style={[styles.rightTextStyle,{color: this.state.reentryPermit == '' ? '#999' : '#333'}]}>
                            {this.state.reentryPermit == '' ? lan.supplement : this.state.reentryPermit}</Text>
                        <Icon icon={'0xe685'} color={'#ccc'} style={{fontSize: 18,marginLeft:3}}/>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemViewStyle}>
                    <Text style={styles.leftTextStyle}>{lan.militaryCard}</Text>
                    <TouchableOpacity style={{flexDirection:'row',flex:2.5,}} onPress={()=>this.updataProof("10",lan.militaryCard,this.state.militaryCard)}>
                        <Text style={[styles.rightTextStyle,{color: this.state.militaryCard == '' ? '#999' : '#333'}]}>
                            {this.state.militaryCard == '' ? lan.supplement : this.state.militaryCard}</Text>
                        <Icon icon={'0xe685'} color={'#ccc'} style={{fontSize: 18,marginLeft:3}}/>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemViewStyle}>
                    <Text style={styles.leftTextStyle}>{lan.EEP}</Text>
                    <TouchableOpacity style={{flexDirection:'row',flex:2.5,}} onPress={()=>this.updataProof("13",lan.EEP,this.state.EEP)}>
                        <Text style={[styles.rightTextStyle,{color: this.state.EEP == '' ? '#999' : '#333'}]}>
                            {this.state.EEP == '' ? lan.supplement : this.state.EEP}</Text>
                        <Icon icon={'0xe685'} color={'#ccc'} style={{fontSize: 18,marginLeft:3}}/>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemViewStyle}>
                    <Text style={styles.leftTextStyle}>{lan.other}</Text>
                    <TouchableOpacity style={{flexDirection:'row',flex:2.5,}} onPress={()=>this.updataProof("NI",lan.other,this.state.other)}>
                        <Text style={[styles.rightTextStyle,{color: this.state.other == '' ? '#999' : '#333'}]}>
                            {this.state.other == '' ? lan.supplement : this.state.other}</Text>
                        <Icon icon={'0xe685'} color={'#ccc'} style={{fontSize: 18,marginLeft:3}}/>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    updataProof = (type,name,num) => {
        const {navigator} = this.props;
        if(navigator) {
            navigator.push({
                name: 'UpdataProofInfo',
                component: UpdataProofInfo,
                passProps:{
                    ProofType:type,
                    ProofName:name,
                    ProofNum:num,
                    MyInfo:this.props.myInfo.Result,
                    RefreshView:()=>{},
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
    itemViewStyle:{
        width:width,
        height:45,
        flexDirection:'row',
        paddingLeft:15,
        paddingRight:15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:"#fff",
        borderBottomWidth:1/FLEXBOX.pixel,
        borderBottomColor:'#ebebeb',
    },
    leftTextStyle:{
        flex:1,
        color:"#666",
        fontSize:16,
    },
    rightTextStyle:{
        flex:2.5,
        fontSize:16,
    },
})