import React, {Component} from 'react';
import {
	StyleSheet,
	View,
    Text,
    Dimensions,
    ScrollView,
    ListView,
    Alert,
    NativeModules,
    TextInput,
    TouchableOpacity,
    Image,
    Platform,
} from 'react-native';
import  ImagePicker from 'react-native-image-picker'; //第三方相机
import {Toast,TextareaItem,} from 'antd-mobile';
import RadiusImage from '../../components/radiusImage/index';
import EntryBar from '../../components/entryBar/index';
import Icon from '../../components/icons/icon';
import Navbar from '../../components/navBar/index';
import {COLORS,FLEXBOX} from '../../styles/commonStyle';
import{ RestAPI } from '../../utils/yqfws';


var {width,height} = Dimensions.get('window')
import { BaseComponent, en_US, zh_CN } from '../../components/locale';
var lan = BaseComponent.getLocale();

const imgData=[];
var photoOptions = {
    //底部弹出框选项
    title:'请选择',
    cancelButtonTitle:'取消',
    takePhotoButtonTitle:'拍照',
    chooseFromLibraryButtonTitle:'选择相册',
    quality:0.75,
    allowsEditing:true,
    noData:false,
    storageOptions: {
        skipBackup: true,
        path:'images'
    }
}

export default class Advice  extends Component {
    constructor(props) {
        super(props);
        this.state={
            ip:'',//本地IP
            account:this.props.Account,//当前账号
            isSystemBug:true,//问题类型为系统bug
            isMajorization:false,//问题类型为优化建议
            isEmbarrassed:false,//问题类型为吐槽
            isUploadImg:false,//判断能否继续添加图片上传
            questionContent:'',//描述问题的内容
            dataSource:new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            phoneNum:'',
        };
    }
    render(){
        this.getIp();
        if(imgData.length>0){
            let ds = new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            })
            this.state.dataSource = ds.cloneWithRows(imgData);
        }
        
        return(
            <View style={{flex:1,backgroundColor:COLORS.containerBg}}>
                <Navbar navigator={this.props.navigator} title={lan.advise} />
                <ScrollView>
                    <View style={{margin:10,flexDirection:'row',alignItems:'center',justifyContent:'center',paddingLeft:10,paddingRight:10}}>
                        <Text style={this.state.isSystemBug ? styles.selectStyle : styles.noSelectStyle} 
                            onPress={()=>this.selectType(1)}>{lan.systemBug}</Text>
                        <Text style={this.state.isMajorization ? styles.selectStyle : styles.noSelectStyle} 
                            onPress={()=>this.selectType(2)}>{lan.majorization}</Text>
                        <Text style={this.state.isEmbarrassed ? styles.selectStyle : styles.noSelectStyle} 
                            onPress={()=>this.selectType(3)}>{lan.embarrassed}</Text>
                    </View>
                    <Text style={{color:'#999',fontSize:15,marginLeft:15,marginTop:10,marginBottom:3}}>{lan.inputAdvice}</Text>
                    <View style={{backgroundColor:'#fff',width:width}}>
                        <TextareaItem  height={180} paddingLeft={0} autoHeight fontSize={14}
                            placeholder={lan.problem} placeholderTextColor={'#ccc'}
                            onChangeText={(txt)=>{this.state.questionContent = txt}}/>
                    </View>
                    <Text style={{color:'#999',fontSize:15,marginLeft:15,marginTop:10,marginBottom:3}}>{lan.uploadImage}</Text>
                    
                    <ScrollView style={{backgroundColor:'#fff',paddingLeft:10,paddingBottom:15,paddingRight:15,paddingTop:15}} horizontal={true}>
                        {imgData.length>0 ? 
                        <ListView 
                            horizontal={true}
                            dataSource={this.state.dataSource}
                            renderRow={this.uploadImageView.bind(this)}/>
                        : null}
                        {imgData.length<5 ? 
                        <View style={{backgroundColor:'#999',height:70,width:70,alignItems:'center',justifyContent:'center',
                                        marginLeft:5,marginRight:15}}>
                            <TouchableOpacity style={{backgroundColor:'#fff',height:68,width:68,alignItems:'center',justifyContent:'center'}}
                                        onPress={()=>this.addImage()} >
                            <Icon icon={'0xe680'} color={'#999'} style={{fontSize: 20}}/>
                            </TouchableOpacity>
                        </View>
                         : <View style={{width:15}}/>}
                        
                    </ScrollView>
                    <View style={{backgroundColor:'#fff',flexDirection:'row',alignItems:'center',marginTop:20,height:45,marginBottom:15}}>
                        <Text style={{color:'#333',fontSize:15,marginLeft:15}}>{lan.mpNumber+":"}</Text>
                        <TextInput style={{flex:1,fontSize:15,marginRight:15,marginLeft:5}} 
                                    onChangeText={(txt)=>{this.state.phoneNum = txt;}}
                                    keyboardType={"numeric"}
                                    placeholder={lan.inputContactWay} placeholderTextColor='#ccc' 
                                    underlineColorAndroid='#fff' 
                                    selectionColor='#333'/>
                    </View>
                </ScrollView>
                <TouchableOpacity style={{alignItems:'center',justifyContent:'center',
                                    height:45,width:width,backgroundColor:COLORS.btnBg}}
                                    onPress={()=>this.uploadImageEvent()}>
                    <Text style={{color:'#fff',fontSize:16}}>{lan.submit}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    //选择发布问题的类型
    selectType = (t) => {
        if(t == 1){
            this.state.isSystemBug = true;
            this.state.isMajorization = false;
            this.state.isEmbarrassed = false;
        }else if(t == 2){
            this.state.isSystemBug = false;
            this.state.isMajorization = true;
            this.state.isEmbarrassed = false;
        }else{
            this.state.isSystemBug = false;
            this.state.isMajorization = false;
            this.state.isEmbarrassed = true;
        }
        this.setState({});
    }

    //添加上传的图片的item布局
    uploadImageView = (vaule,i) => {
        return(
            <Image style={{width:70,height:70,marginLeft:5,marginRight:5}}
                    source={{uri: vaule.imgPath, isStatic: true}}>
                <TouchableOpacity style={{position: 'absolute',right:3,top:3,backgroundColor:'transparent'}} onPress={()=>this.deleteImage(i)}>
                    <Icon icon={'0xe698'} color={'#333'} style={{fontSize: 15}}/>
                </TouchableOpacity>
            </Image>
        );
    }

    //删除欲上传的图片
    deleteImage = (index) =>{
        imgData.splice(index,1);
        this.setState({});
    }

    //添加欲上传的图片
    addImage = () => {
        ImagePicker.showImagePicker(photoOptions,(response) =>{
            if(response.data != null){
                if (Platform.OS === 'android') {
                    imgData.splice(imgData.length,0,{'base64Path':response.data,'imgPath':response.uri});
                } else {
                    imgData.splice(imgData.length,0,{'base64Path':response.data,'imgPath':response.uri.replace('file://', '')});
                }
                this.setState({});
            }
         })
    }

    //上传图片
    uploadImageEvent = () =>{
        if(!this.isMPNumber(this.state.phoneNum)){
            Toast.info(lan.inputCorrectMPNum, 3, null, false);
        }else if(this.state.questionContent != ''){
            let i = 0
            Toast.loading(lan.loading,60,()=>{
                Toast.info(lan.loadingFail, 3, null, false);
            });
            if(imgData.length>0)
            for(let v=0;v<imgData.length;v++){
                let param={
                    "Account":this.state.account,
                    "UserIP":this.state.ip,
                    "FaceImageBytes":imgData[v].base64Path
                }
                RestAPI.invoke("Base.UserFaceUpload",JSON.stringify(param),(value)=>{
                    let imgInfo = value;
                    if(imgInfo.Code == 0){
                        imgData[v].base64Path = 'http://img2.yiqifei.com'+imgInfo.Result.Path;
                        i++;
                        if(i == imgData.length){this.submitQuestion()}
                    }else{
                        Toast.hide();
                        Toast.info(value.Msg, 3, null, false);
                        return;
                    }
                },(err)=>{
                    Toast.hide();
                    Toast.info(err,3,null,false);
                    return;
                })
            }
            else this.submitQuestion()
        }else{
            Toast.info(lan.inputDescribe,3,null,false);
        }
    }

    //提交问题
    submitQuestion = () => {
        let label=[];
        for(var v of imgData){
            label.splice(label.length,0,{'LabelName':v.base64Path});
        }
        let param={
            "QuestionReqs": [
                {
                    "QuestionTitle": this.setQuestionType(),
                    "QuestionContent": this.state.questionContent,
                    "QuestionReason": this.state.questionContent,
                    "IsPublic": false,
                    "QuestionLabels": label
                }
            ],
            "OperateClient": {
                "OptCltInfoCode": "7b4004ee-f41b-4123-8b87-a1633c70666d ",
                "UserCode": this.state.account,
                "DeviceTypeNo": 1,
                "ClientsIp": this.state.ip,
            }
        }
        Toast.loading(lan.loading,60,()=>{
            Toast.info(lan.loadingFail, 3, null, false);
        });
        RestAPI.invoke("Knowledge.QuestionAdd",JSON.stringify(param),(value)=>{
            let queInfo = value;
            if(queInfo.Code == 0){
                Toast.hide()
                Toast.info(lan.submitProblemSuccess,2,null,false);
                const {navigator} = this.props;
                if(navigator){
                    navigator.pop();
                }
            }else{
                Toast.hide();
                Toast.info(value.Msg, 3, null, false);
            }
        },(err)=>{
            Toast.hide();
            Toast.info(err,3,null,false);
        });
    }

    //获取本地IP
    getIp = () => {
         fetch("http://pv.sohu.com/cityjson?ie=utf-8").then((res) => {
            res.text().then((text) => {
                let reg = new RegExp('(\\d+)\.(\\d+)\.(\\d+)\.(\\d+)');
                let arr = reg.exec(text);
                this.state.ip = arr[0];
            })
        });
    }

    //选择问题的类型
    setQuestionType = () => {
        if(this.state.isSystemBug) return lan.systemBug;
        else if(this.state.isMajorization) return lan.majorization;
        else return lan.embarrassed;
    }

    //判断手机号码输入是否正确
    isMPNumber = (Tel) => {
        var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        if (myreg.test(Tel)) {
            return true;
        } else {
            return false;
        }
    }
}

const styles = StyleSheet.create({
    selectStyle:{
        color:COLORS.btnBg,
        fontSize:15,
        paddingTop:10,
        paddingBottom:10,
        borderWidth:0.8,
        borderColor:COLORS.btnBg,
        textAlign:'center',
        marginLeft:5,
        marginRight:5,
        backgroundColor:'#fff',
        width:100,
    },
    noSelectStyle:{
        color:'#999',
        fontSize:15,
        textAlign:'center',
        backgroundColor:'#fff',
        paddingTop:10,
        paddingBottom:10,
        marginLeft:5,
        marginRight:5,
        width:100,
    },
})