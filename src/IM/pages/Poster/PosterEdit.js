/**
 * Created by yqf on 2017/12/12.
 */

//海报编辑


import {observer} from 'mobx-react/native';
import {observable, autorun, computed, extendObservable, action, toJS} from 'mobx'
import {Component} from 'react';
import React, {PropTypes} from 'react';
import Video from 'react-native-video';//视频播放
import Myplayer from '../../components/Myplayer'
import {captureRef} from "react-native-view-shot";

import {
    View,
    Text,
    Image,
    CameraRoll,
    StyleSheet,
    ListView,
    ScrollView,
    TouchableWithoutFeedback,
    InteractionManager,
    StatusBar,
    WebView,
    AsyncStorage,
    TouchableOpacity,
    Modal,
    DeviceEventEmitter,
    // ActivityIndicator,
    Switch,
    Platform,
    Dimensions,
    TextInput,
    Alert,
    Slider,
    UIManager,
    NativeModules


} from  'react-native';
import ImagePicker from 'react-native-image-picker';
import {FLEXBOX} from '../../styles/commonStyle'

import YQFNavBar from '../../components/yqfNavBar';
import YQFEmptyView from '../../components/EmptyView';
import EditData from '../../components/editData';

import Icon from '../../components/icon';
import {RestAPI, ServingClient} from '../../utils/yqfws';
import {Chat} from '../../utils/chat';

import Colors from '../../Themes/Colors';
import PosterSuccess from './PosterSuccess';

import PictureTemplate from './PictureTemplate';
import ActivityIndicator from '../../components/activity-indicator'
import Article from '../Article/article';

photoOptions = {
    quality: 0.70,
    allowsEditing: false,
    noData: false,
    maxWidth: FLEXBOX.width * FLEXBOX.pixel,
    maxHeight: FLEXBOX.height * FLEXBOX.pixel,
    storageOptions: {
        skipBackup: true,
        path: 'images'

    }
}


const window = {

    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
}

const ReactNative = require('react-native');

class PosterEditModel extends Component {


    //0429 需要新增颜色
    @observable selectTitleColor =  '#fff';//主标题颜色
    @observable selectSubtitleColor =  '#fff';//副标题颜色

    @observable Template1BigTitleText = '标题(可编辑)';//模版1城市名
    @observable Tamplate4SubtitleText = "副标题(可编辑)"




    @observable showActionSheet = false;

    @observable VerticleTextArray = [];

    //视频相关的
    @observable  videoUrl = null;
    @observable  paused = false;
    @observable  showPause = true;
    @observable  duration = 0.0;//总时长
    @observable  currentTime = 0.0;//当前时长

    @observable sliderValue = 0;//滑块的值，代表一个进度
    @observable file_duration = 0;////歌曲长度
    @observable muted = false;////false表示正常，true代表静音
    @observable showVideoToolBar = true; //是否显示工具条


    @observable personalLabel1 = '本文内容供您参考，详情请咨询一起飞®旅行顾问'
    @observable personalLabel2 = '本旅行方案由一起飞®国际机票网整理出品'


    @observable title = '城市(可编辑)';//标题
    @observable subTitle = '一起飞(可编辑)';//副标题

    @observable tp1CityText = '标题(可编辑)';//模版1城市名

    @observable tp2CityText = '标\n题\n可\n编\n辑\n';//模版2城市名
    @observable tp2PriceText = '价格(可编辑)';//模版2价格名
    @observable tp2DescriptionText = '描述(可编辑)';//模版2描述名

    @observable tp3CityText = '标题(可编辑)';//模版3城市名
    @observable tp3PriceText = '价格(可编辑)';//模版3价格名
    @observable tp3DescriptionText = '描述(可编辑)';//模版3描述名

    @observable descriptionText = null;//描述性标题

    @observable templateType = 'picture';//图片
    @observable loading = false;
    @observable isEmpty = false;

    @observable selectIndex = 0;

    @observable selectTemplateDict = {};//模版
    @observable selectObject =null;//传过来的图片。这里需要确认下。可能是本地，也可能是远程
    @observable selectPicture = null;//图片
    @observable selectQRCode = null;//二维码图片

    @observable screenUri = null;//截图的uri，这个地址用于传到下一个页面，传值过去
    @observable showPreview = false;//显示预览

    @observable FileTypeID = null;//1代表图片 2代表视频
    @observable selectItem = null;//素材库选中的item

    @observable QRCode = null;//默认的用户个人品牌二维码
    @observable selectQRCode = null;//选中的二维码，最终传给原生。如果用户选择，则用用户的；否则，则用自己默认的


    @observable shotImage = null;//截图本地路径
    @observable base64 = null;//截图的base64

    @observable posterLoading = false;//截图的base64


    @computed get getVerticleTextArrayDataSource() {
        ds6 = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return ds6.cloneWithRows(this.VerticleTextArray.slice());
    }

}


@observer
export  default  class PosterEdit extends Component {

    constructor(props) {
        super(props);
        this.store = new PosterEditModel();
        this.store.selectIndex = props.selectIndex;



        this.store.selectTitleColor =  this.store.selectIndex==0 ? '#fff' :this.store.selectIndex==3 ? '#EC2914' :  this.store.selectIndex==1? '#fff' : '#CE43FA';
        this.store.selectSubtitleColor =  this.store.selectIndex==0 ? '#BFF232' : this.store.selectIndex==3 ? '#BFF232' :  this.store.selectIndex==1? '#fff': '#fff';



        this.state = {

            style: props.style,
            dataSource: new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2,
                sectionHeaderHasChanged: (s1, s2) => s1 !== s2
            }),
            data: ['请\n输\n入\n描\n述'],
        };


    }


    launchImageLibrary = (callback) => {
        StatusBar.setBarStyle("default");
        ImagePicker.launchImageLibrary(photoOptions, (response) => {

            StatusBar.setBarStyle("light-content");

            console.log('选择二维码图片的结果');
            console.log(response);

            if (response.data) {

                this.store.selectQRCode = response.uri;

            }
        });
    }


    componentDidMount = () => {

        this._fetchData()
    }

    _fetchData = async() => {

        var param = {
            Url: 'http://3g.yiqifei.com/i/' + Chat.loginUserResult.AccountNo,
            CreateQRCode: true
        };

        RestAPI.invoke('Base.CreateRoute', param, (response) => {

            // console.log('生成 Base.CreateRoute  结果')
            // console.dir(response);
            this.store.QRCode = response.Result.QRCode;


        }, (error) => {

        });

        this.store.isLoading = false;

    }


    _choosePhoto = () => {

        this.props.navigator.push({
            component: PictureTemplate,
            passProps: {

                getPicture: (selectItem) => {

                    // console.log('选择图片，这是回调的数据.本地相册，和网络图片相册比例可能不太一样')
                    // console.dir(selectItem);


                 this.store.selectObject = selectItem;



                    //本地相册
                    if (selectItem && selectItem.uri) {

                        // console.log('这里是要显示本地的图片')
                        // console.dir(selectItem);

                        this.store.FileTypeID = 1;//这是显示图片的
                        this.store.selectPicture = selectItem.uri;


                    } else {

                        //素材图片
                        if (selectItem.FileTypeID == 1) {
                            //图片
                            this.store.FileTypeID = 1;//这是显示图片的
                            this.store.selectPicture = Chat.getPosterImagePath(selectItem.FilePath);

                        } else {

                            //素材视频
                            //视频（目前是写死的）（这里需要显示为视频组件---）
                            this.store.FileTypeID = 2;//这是显示视频的
                            this.store.selectItem = selectItem;//这是选中的item
                            this.store.selectPicture = selectItem.Video.ImageUrl;
                        }

                    }

                }
            }
        })

    }


    //上传截图，同时并产生生成记录
    uploadPhoto = async() => {


        //1。首先上传图片()

        if (this.store.shotImage) {

            //   //生成海报视频
            if (this.store.FileTypeID == 2) {

                console.log('这里需要将视频保存到本地，生成酷炫的效果')


                var FilePath = this.store.selectItem.FilePath;
                var shotImagePath = this.store.shotImage;

                // console.dir(FilePath)
                // console.dir(shotImagePath)


                if (Chat.isAndroid()) {


                } else {
                    //ios

                    Alert.alert('海报视频正在开发中...')
                    this.store.posterLoading = false;
                    //  NativeModules.MyNativeModule.progressWithVideoPath(FilePath,shotImagePath);

                }


            }

            else {


                //生成海报图片

                NativeModules.RNImageToBase64.getBase64String(this.store.shotImage, async(err, base64) => {

                    console.log('转换后的base64')
                    // console.dir(base64);
                    this.store.base64 = base64;

                    var ImageUploadParam = {
                        BucketName: 'yqf-share',
                        ImageBytes: this.store.base64
                    }
                    var ImageUploadResult = await ServingClient.execute('Base.ImageUpload', ImageUploadParam);
                    // console.log('ImageUploadResult 图片上传 的结果');
                    //  console.dir(ImageUploadResult);

                    //2.维护海报信息 生成海报ID
                    var PosterCUParam = {
                        PosterCategoryID: 5,
                        ImagePath: ImageUploadResult.Path,
                        UserCode: Chat.loginUserResult.AccountNo,
                        StaffCode: Chat.loginUserResult.PersonCode,
                        Title: Chat._getCurrentTime(),
                        PlatFormID: 3,//生成平台ID  3 抢单APP-海报
                    }
                    var PosterCUResult = await ServingClient.execute('Channel.PosterCU', PosterCUParam);
                    // console.log('PosterCUResult 维护海报信息 的结果');
                    // console.dir(PosterCUResult);

                    //3.生成用户海报  Channel.UserPosterAdd
                    var UserPosterAddParam = {
                        PosterID: PosterCUResult.ID,
                        UserCode: Chat.loginUserResult.AccountNo,
                        StaffCode: Chat.loginUserResult.PersonCode,
                    }
                    var UserPosterAddResult = await ServingClient.execute('Channel.UserPosterAdd', UserPosterAddParam);
                    // console.log('UserPosterAddResult 生成用户海报的结果');

                    this.store.posterLoading = false;

                    //保存完图片跳转到保存成功页面
                    this.props.navigator.push({
                        component: PosterSuccess,
                        passProps: {}
                    })


                });
            }


        }


    }


    //进行截图
    screenPhoto = (sth) => {


        var _this = this;

        _this.store.posterLoading = true;//弹出提示框


        if (Chat.isAndroid()) {
            captureRef(this.mainBg, {format: 'png', quality: 1}).then(
                (uri) => {

                    var promise = CameraRoll.saveToCameraRoll(uri);

                    promise.then(function (result) {

                        _this.store.shotImage = result;
                        Alert.alert(
                            null,
                            '海报已保存到本地相册，是否将海报上传到生成记录',
                            [
                                {text: '取消', onPress: () => _this.store.posterLoading = false, style: 'cancel'},
                                {text: '确定', onPress: () => _this.uploadPhoto()},
                            ],
                            {cancelable: false}
                        )
                    }).catch(function (error) {

                        Alert.alert('保存失败');
                        _this.store.posterLoading = false;

                    });

                }
            ).catch(
                (error) => {

                    Alert.alert('保存失败');
                    _this.store.posterLoading = false;
                }
            );
        } else {

            UIManager.takeSnapshot(this.mainBg, {format: 'png', quality: 1}).then(
                (uri) => {








                    var promise = CameraRoll.saveToCameraRoll(uri);

                    promise.then(function (result) {

                        _this.store.shotImage = result;
                        Alert.alert(
                            null,
                            '海报已保存到本地相册，是否将海报上传到生成记录',
                            [
                                {text: '取消', onPress: () => _this.store.posterLoading = false, style: 'cancel'},
                                {text: '确定', onPress: () => _this.uploadPhoto()},
                            ],
                            {cancelable: false}
                        )
                    }).catch(function (error) {

                        Alert.alert('保存失败');
                        _this.store.posterLoading = false;

                    });


                }
            ).catch(
                (error) => {
                    console.log('截图失败了...')
                    Alert.alert('保存失败');
                    _this.store.posterLoading = false;

                }
            );

        }


    };


    //预览海报
    PreviewPoster = () => {


        if(!this.store.selectPicture){
            Alert.alert("请选择图片")
            return;
        }

        if(!this.store.selectQRCode){
            this.store.selectQRCode = this.store.QRCode;
        }


        //视频，则跳到视频全屏界面
        if (this.store.FileTypeID == 2) {

            this.props.navigator.push({
                component: Myplayer,
                passProps: {
                    playUrl: this.store.selectItem.FilePath,
                }
            })
        }
        else {
            this.store.showPreview = true
        }

    }

    //保存海报
    SavePoster = () => {

        if(!this.store.selectPicture){
            Alert.alert("请选择图片")
            return;
        }

        //检查二维码的问题。如果二维码为空，则默认将个人品牌当二维码使用
        if(!this.store.selectQRCode){
            this.store.selectQRCode = this.store.QRCode;
        }

        setTimeout(()=>{

            //0.5s开始截图
            this.screenPhoto('ToSuccess');

        },500)





    }




    /*------------------------------render相关-------------------------------------------------*/

    //海报头部
    renderPosterHead = () => {

        var margin = 20;//不管什么屏幕，都保留这个Margin
        var headImageW = window.width - margin * 2;
        var headImageH = headImageW * (66 / 301);


        //模版3没必要渲染头部
        if(this.store.selectIndex==3){
            return null;
        }

        return (

            <Image
                source={require('./Images/templateHead.png')}
                style={{position: 'absolute', top: 0, width: headImageW, height: headImageH}}>

                <Text
                    onPress={() => {
                        this.props.navigator.push({

                            component: EditData,
                            passProps: {

                                defaultValue:this.store.title,
                                posterPlaceholder: '最多录入5个汉字',
                                placeholder: this.store.title,
                                getDetail: (text) => {

                                    {/*var temp;*/}
                                    {/*var maxLength = text.length > 5 ? 5 : text.length;*/}
                                    {/*temp = text.substring(0, maxLength);*/}
                                    this.store.title = this.DeleteChangeLine(text);


                                }
                            }
                        })
                    }}
                    numberOfLines={1}
                    style={{
                        position: 'absolute',
                        width: 150,
                        bottom: 30,
                        right: 20,
                        textAlign: 'center',
                        backgroundColor: 'transparent',
                        fontSize: 25,
                        color: 'white',
                        fontWeight: 'bold'
                    }}>
                    {this.store.title}
                </Text>


                <Text
                    onPress={() => {
                        this.props.navigator.push({


                            component: EditData,
                            passProps: {

                                defaultValue:this.store.subTitle,
                                posterPlaceholder: '最多录入12个汉字',
                                placeholder: this.store.subTitle,
                                getDetail: (text) => {

                                    {/*var temp;*/}
                                    {/*var maxLength = text.length > 12 ? 12 : text.length;*/}
                                    {/*temp = text.substring(0, maxLength);*/}
                                    this.store.subTitle = this.DeleteChangeLine(text);

                                }
                            }
                        })
                    }}
                    numberOfLines={1}
                    style={{
                        position: 'absolute',
                        width: 150,
                        bottom: 7,
                        right: 20,
                        fontSize: 10,
                        textAlign: 'center',
                        backgroundColor: 'transparent',
                        color: 'rgb(51,51,51)'
                    }}>
                    {this.store.subTitle}
                </Text>


            </Image>
        )

    }

    //素材1
    renderTemplate0 = () => {

        var margin = 10;



        if(this.store.tp1CityText){
            return (




                <View>


                    <Text

                        onPress={() => {
                            this.props.navigator.push({

                                component: EditData,
                                passProps: {

                                    isShowColorBoard:true,
                                    defaultValue:this.store.tp1CityText,
                                    posterPlaceholder: '最多录入6个汉字',
                                    placeholder: this.store.tp1CityText,
                                    getDetail: (text,color) => {

                                        this.store.tp1CityText = this.DeleteChangeLine(text);
                                        if(color!=='Normal'){
                                            this.store.selectTitleColor = color;
                                        }
                                    }

                                }
                            })
                        }}
                        numberOfLines={1}
                        style={{
                            backgroundColor: 'transparent',
                            textShadowColor: 'rgb(0,0,0)',
                            textShadowOffset: {width: 3, height: 3},
                            margin: 20,
                            padding: 5,
                            fontSize: 36,
                            color: this.store.selectTitleColor,
                            fontWeight: 'bold'
                        }}>
                        {this.store.tp1CityText}
                    </Text>


                </View>
            )
        }

        return null


    }

    renderVerticleItem = (data) => {

        return (

            <View style={{}}>
                <Text style={{
                    color: this.store.selectSubtitleColor,
                    fontSize: 14,
                    padding: 0
                }} onPress={() => {



                    //data为数组，需要将数组转为字符串
                    var dataString = this.state.data.join("")

                    //跳到到编辑页面去
                    this.props.navigator.push({

                        component: EditData,
                        passProps: {

                            isShowColorBoard:true,
                            isNeedDeleteLine:true,
                            defaultValue:dataString,
                            posterPlaceholder: '最多录入10个汉字',
                            placeholder: this.store.tp2DescriptionText,
                            getDetail: (text,color) => {

                                var maxLength = text.length;

                                var number = 14;
                                var data = [];
                                var currentCloumn = '';
                                var tempString = text;

                                for (var i = maxLength; i > -1; i--) {
                                    currentCloumn += tempString.charAt(i) + '\n';
                                    if ((i) % number == 0) {
                                        var soreColumn = '';
                                        for (var k = 0; k < currentCloumn.length; k++) {
                                            soreColumn += currentCloumn.charAt(currentCloumn.length - k - 2);
                                        }
                                        data.push(soreColumn);
                                        currentCloumn = '';
                                    }

                                }
                                if (currentCloumn.length > 0) {
                                    var soreColumn = '';
                                    for (var k = 0; k < currentCloumn.length; k++) {
                                        soreColumn += currentCloumn.charAt(currentCloumn.length - k - 2);
                                    }
                                    data.push(soreColumn);
                                    console.log(currentCloumn);
                                    currentCloumn = '';
                                }

                                this.setState({
                                    data: data
                                })

                                if (color !="Normal"){
                                    this.store.selectSubtitleColor=color;
                                }

                            }

                        }
                    })


                }}>
                    {data}
                </Text>
            </View>
        )

    }

    renderMyVerticleText = () => {

        return (

            <View style={{padding: 10}}>

                <ListView
                    contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap',}}
                    renderRow={this.renderVerticleItem}
                    dataSource={this.state.dataSource.cloneWithRows(this.state.data)}

                />

            </View>


        )

    }

    //素材2
    renderTemplate1 = () => {

        var margin = 20;
        var ContentW = window.width - margin * 2;
        var ContentH = ContentW * (407 / 301);

        var right = ContentW * (13 / 301);
        var top = ContentH * (79 / 404);
        var width = ContentW * (128 / 301);
        var height = width * (261 / 128);

        var textMargin = width * (11 / 128);


        var PriceMarginLeft = ContentW * (150 / 301);
        var PriceMarginTop = ContentH * (320 / 404);


        return (

            <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>

                <View style={{
                    position: 'absolute',
                    top: top,
                    right: right,
                    width: width,
                    height: height,
                    flexDirection: 'row-reverse',
                    backgroundColor: 'rgba(0,0,0,0.6)'
                }}>


                    {this.store.tp2CityText ?

                        <Text
                            numberOfLines={0}
                            onPress={() => {
                                this.props.navigator.push({

                                    component: EditData,
                                    passProps: {

                                        isShowColorBoard:true,
                                        isNeedDeleteLine:true,

                                        defaultValue:this.store.tp2CityText,
                                        posterPlaceholder: '最多录入10个汉字',
                                        placeholder: this.store.tp2CityText,
                                        getDetail: (text,color) => {

                                            var test = '';
                                            //先将所有的\n过滤掉
                                            text = text.replace(/\r\n/g, "")
                                            text = text.replace(/\n/g, "");

                                            for (var i = 0; i < text.length; i++) {
                                                test += text.charAt(i) + '\n'
                                            }

                                            this.store.tp2CityText = test;
                                            if(color!=='Normal'){
                                                this.store.selectTitleColor = color;
                                            }
                                        }

                                    }
                                })
                            }} style={{
                            color:  this.store.selectTitleColor,
                            fontSize: 20,
                            padding: textMargin,
                            fontWeight: 'bold'
                        }}>{this.store.tp2CityText}</Text>
                    :
                        null

                    }



                    {this.state.data ?

                        this.renderMyVerticleText()
 :
                        null


                    }





                </View>








                {this.store.tp2PriceText ?

                    <View style={{
                        alignItems: 'flex-end',
                        flexDirection: 'row',
                        position: 'absolute',
                        left: PriceMarginLeft,
                        top: PriceMarginTop
                    }}>

                        <Text
                            onPress={() => {
                                this.props.navigator.push({

                                    component: EditData,
                                    passProps: {

                                        defaultValue:this.store.tp2PriceText,
                                        posterPlaceholder: '只能录入数字，请输入5位数字以内',
                                        placeholder: this.store.tp2PriceText,
                                        getDetail: (text) => {

                                            if (!isNaN(text)) {
                                                var maxLength = text.length;

                                                var test = '';
                                                for (var i = 0; i < maxLength; i++) {
                                                    test += text.charAt(i)
                                                }
                                                this.store.tp2PriceText = test
                                            }
                                            else {
                                                //


                                                Alert.alert('必须填入数字')

                                            }

                                            //这里需要判断是否为数字
                                        }

                                    }
                                })
                            }}
                            style={{
                                fontStyle: 'italic',
                                textShadowColor: '#FC405F',
                                textShadowOffset: {width: 2, height: 2},
                                backgroundColor: 'transparent',
                                padding: 10,
                                paddingLeft: 0,
                                paddingBottom: 5,
                                fontSize: 24,
                                color: 'white',
                                fontWeight: 'bold',
                            }}>{this.store.tp2PriceText}</Text>

                        <View style={{backgroundColor: 'transparent'}}>
                            <Text style={{
                                fontSize: 9,
                                color: 'white',
                                textShadowColor: '#FC405F',
                                textShadowOffset: {width: 1, height: 1},
                            }}>一人价</Text>
                            <Text style={{
                                fontSize: 9,
                                color: 'white',
                                textShadowColor: '#FC405F',
                                textShadowOffset: {width: 1, height: 1},
                            }}>RMB</Text>
                        </View>

                    </View>

                    :
                    null
                }




            </View>



        )


    }

//素材3
    renderTemplate2 = () => {


        var margin = 20;
        var ContentW = window.width - margin * 2;
        var scaleMargin = ContentW * (13 / 301);

        return (


            <View style={{width: ContentW, flexDirection: 'column-reverse', justifyContent: 'flex-end'}}>

                {this.store.tp3DescriptionText ?

                    <Text
                        onPress={() => {
                            this.props.navigator.push({

                                component: EditData,
                                passProps: {

                                    isShowColorBoard:true,
                                    defaultValue:this.store.tp3DescriptionText,
                                    posterPlaceholder: '最多录入60个汉字',
                                    placeholder: this.store.tp3DescriptionText,
                                    getDetail: (text,color) => {

                                        var maxLength = text.length;
                                        var test = '';
                                        for (var i = 0; i < maxLength; i++) {
                                            test += text.charAt(i)
                                        }

                                        this.store.tp3DescriptionText = test

                                        if(color!=='Normal'){
                                            this.store.selectSubtitleColor = color;
                                        }

                                    }

                                }
                            })
                        }}
                        numberOfLines={0}
                        style={{
                            backgroundColor: 'transparent',
                            textShadowColor: 'rgb(0,0,0)',
                            textShadowOffset: {width: 3, height: 3},
                            margin: scaleMargin,
                            fontSize: 14,
                            color: this.store.selectSubtitleColor,
                            fontWeight: 'bold',
                        }}>{this.store.tp3DescriptionText}</Text>
                :
                    null

                }



                {this.store.tp3PriceText ?

                    <View style={{flexDirection: 'row', margin: scaleMargin, marginTop: 0, alignItems: 'flex-end'}}>

                        <View style={{
                            shadowColor: 'red',
                            shadowOffset: {width: 3, height: 3},
                            backgroundColor: 'rgb(206,67,250)',
                            flexDirection: 'row',
                            alignItems: 'flex-end'
                        }}>

                            <Text style={{color: 'white', fontSize: 14, padding: 5, fontWeight: 'bold'}}>¥</Text>


                            <Text
                                onPress={() => {
                                    this.props.navigator.push({

                                        component: EditData,
                                        passProps: {

                                            defaultValue:this.store.tp3PriceText,
                                            posterPlaceholder: '只能录入数字，请输入5位数字以内',
                                            placeholder: this.store.tp3PriceText,
                                            getDetail: (text) => {

                                                if (!isNaN(text)) {
                                                    {/*var maxLength = text.length > 5 ? 5 : text.length;*/}
                                                    var maxLength = text.length;

                                                    var test = '';
                                                    for (var i = 0; i < maxLength; i++) {
                                                        test += text.charAt(i)
                                                    }
                                                    this.store.tp3PriceText = test
                                                }
                                                else {
                                                    //
                                                    Alert.alert('必须填入数字')

                                                }

                                                //这里需要判断是否为数字
                                            }

                                        }
                                    })
                                }}

                                style={{
                                    backgroundColor: 'transparent',
                                    padding: 10,
                                    paddingLeft: 0,
                                    paddingBottom: 5,
                                    fontSize: 20,
                                    color: 'white',
                                    fontWeight: 'bold',
                                }}>{this.store.tp3PriceText}</Text>


                        </View>


                        <Text style={{
                            textShadowColor: 'rgb(0,0,0)',
                            textShadowOffset: {width: 3, height: 3},
                            backgroundColor: 'transparent',
                            marginLeft: 5,
                            color: 'rgb(255,255,255)',
                            fontWeight: 'bold',
                            fontSize: 16
                        }}>{'一人价'}</Text>

                    </View>
                    :
                    null

                }





                {this.store.tp3CityText ?
                    <Text
                        onPress={() => {
                            this.props.navigator.push({

                                component: EditData,
                                passProps: {


                                    isShowColorBoard:true,
                                    defaultValue:this.store.tp3CityText,
                                    posterPlaceholder: '最多录入5个汉字',
                                    placeholder: this.store.tp3CityText,
                                    getDetail: (text,color) => {

                                        //用户可能会输入空格
                                        var temp;
                                        var maxLength = text.length;
                                        temp = text.substring(0, maxLength);
                                        this.store.tp3CityText = this.DeleteChangeLine(temp);
                                        if(color!=='Normal'){
                                            this.store.selectTitleColor = color;
                                        }
                                    }

                                }
                            })
                        }}

                        numberOfLines={1}
                        style={{
                            backgroundColor: 'transparent',
                            textShadowOffset: {width: 2, height: 2},
                            textShadowColor: 'white',
                            margin: scaleMargin,
                            padding: 5,
                            fontSize: 50,
                            color: this.store.selectTitleColor,
                            fontWeight: 'bold',
                        }}>{this.store.tp3CityText}</Text>
                    :
                    null

                }




            </View>

        )


    }

    //素材4
    renderTemplate3 = ()=>{

        //根据传过来的模版来判断
        var margin = 20;//不管什么屏幕，都保留这个Margin
        var ImageW = window.width-margin*2;
        var ImageH = ImageW * (960 / 540);

        //主标题  祝你新年快乐
        var titleLeft =ImageW *(12/540) ;
        var titleTop = ImageH *(632/960);
        var titleWidth =ImageW *(400/540);
        var titleHeight =ImageH *(88/960);

        //副标题  机票酒店签证保险租车快找我
        var subTitleLeft =ImageW *(12/540) ;
        var subTitleTop = ImageH *(737/960);
        var subTitleWidth =ImageW;
        var subTitleHeight =ImageH *(60/960);


        //logo的位置尺寸
        var logoLeft =ImageW *(12/540) ;
        var logoTop = ImageH *(16/960);
        var logoWidth =ImageW *(145/540);
        var logoHeight =ImageH *(43/960);




        var corverLeft =0;//横屏视频距离左边
        var corverTop =0;//横屏视频距离top
        var corverWidth = ImageW;//横屏视频width
        var corverHeight = ImageH;//横屏视频height


        //阴影头部
        var shadowTLeft=0;
        var shadowTTop=0;
        var shadowTWidth=ImageW;
        var shadowTHeight=ImageW *(121/540);


        //阴影底部
        var shadowBLeft=0;
        var shadowBBottom=0;
        var shadowBWidth=ImageW;
        var shadowBHeight=ImageW *(153/540);


        var titleStyle=null;
        var videoRange=null;
        var corverVideoStyle = null;
        var topTitleStyle = null;
        var Templelate1BigTitleStyle=null;





        //0226新版下的标题各种样式
        var fullTitleViewStyle ={

            justifyContent:'center',
            alignItems:'center',
            position:'absolute',
            top:titleTop,
            left:titleLeft,
            // width:titleWidth,
            // height:titleHeight,
            borderRadius:10,
            opacity:0.7,
            backgroundColor:'rgb(0,0,0)',
            // backgroundColor:'transparent'

        }


        var fullTitleTextStyle ={
            textAlign:'center',
            backgroundColor:'transparent',
            fontWeight:'bold',
            fontSize:35,
            color:this.store.selectTitleColor,
            padding:5
        }

        var fullSubTitleViewStyle ={

            justifyContent:'center',
            alignItems:'center',
            position:'absolute',
            top:subTitleTop,
            left:subTitleLeft,
            height:subTitleHeight,
            borderRadius:10,
            opacity:0.7,
            backgroundColor:'rgb(0,0,0)',
            // backgroundColor:'transparent'


        }

        var fullSubTitleTextStyle ={

            textAlign:'center',
            backgroundColor:'transparent',
            fontSize:18,
            color:this.store.selectSubtitleColor,
            fontWeight:'bold',
            padding:5
        }



        corverVideoStyle={

            marginLeft:corverLeft,
            marginTop:corverTop,
            width:corverWidth,
            height:corverHeight

        }

        videoRange = {
            imageWidth:ImageW,
            imageHeight:ImageH,
            left:corverLeft,
            top:corverTop,
            width:corverWidth,
            height:corverHeight,
            isVertical:false
        }

        this.store.videoRange = videoRange;

        return(

            <TouchableOpacity  onPress={()=>{


                this._choosePhoto();
            }} ref={(mainBg)=>{this.mainBg = mainBg}} style={{margin:margin,marginTop:0,marginBottom:0, backgroundColor:'rgb(205,205,205)'}}>




                <Image

                    ref={(global)=>{this.global = global}}
                    source={ this.store.selectPicture ? {uri:this.store.selectPicture}  : require('./Images/posterImageEmptyBg.png')}
                    style={{ width:ImageW,height:ImageH}}>



                    {this.store.Tamplate4SubtitleText ?
                        <View style={[fullSubTitleViewStyle]}>

                            <Text

                                onPress={()=>{
                                    this.props.navigator.push({

                                        component:EditData,
                                        passProps:{

                                            defaultValue: this.store.Tamplate4SubtitleText,
                                            isShowColorBoard:true,
                                            posterPlaceholder:  '请录入副标题' ,
                                            placeholder:this.store.Tamplate4SubtitleText,
                                            getDetail:(text,color)=>{

                                                this.store.Tamplate4SubtitleText = this.DeleteChangeLine(text);

                                                if(color =='Normal'){
                                                    this.store.selectSubtitleColor = '#BFF232';
                                                }else{
                                                    this.store.selectSubtitleColor = color;
                                                }



                                            }

                                        }
                                    })
                                }}
                                numberOfLines={1}
                                style={fullSubTitleTextStyle}>
                                {this.store.Tamplate4SubtitleText}
                            </Text>

                        </View>
                    :
                        null
                    }



{
    this.store.Template1BigTitleText ?
        <View style={[fullTitleViewStyle]}>
            <Text

                onPress={()=>{
                    this.props.navigator.push({

                        component:EditData,
                        passProps:{

                            defaultValue: this.store.Template1BigTitleText,

                            isShowColorBoard:true,
                            posterPlaceholder: '请录入标题',
                            placeholder:this.store.Template1BigTitleText,
                            getDetail:(text,color)=>{


                                var temp;
                                {/*var maxLength = text.length>6 ? 6 :text.length;*/}
                                this.store.Template1BigTitleText = this.DeleteChangeLine(text);

                                if(color =='Normal'){
                                    this.store.selectTitleColor = '#EC2914';
                                }else{
                                    this.store.selectTitleColor = color;
                                }


                            }

                        }
                    })
                }}
                style={fullTitleTextStyle}
                numberOfLines={1}

            >
                {this.store.Template1BigTitleText}
            </Text>

        </View>
        :
        null

}




                    <Image
                        source={require('./Images/yiqifeiLogo.png')}
                        style={{position:'absolute',left:logoLeft,top:logoTop, width:logoWidth,height:logoHeight}}>

                    </Image>


                    <Image
                        source={require('./Images/posterVideoShadowTop.png')}
                        style={{position:'absolute',left:shadowTLeft,top:shadowTTop, width:shadowTWidth,height:shadowTHeight}}>

                    </Image>


                    <Image
                        source={require('./Images/posterVideoShadowBottom.png')}
                        style={{position:'absolute',left:shadowBLeft,bottom:shadowBBottom, width:shadowBWidth,height:shadowBHeight}}>
                    </Image>


                    {this.renderTemplate3PersonInfo()}

                </Image>


            </TouchableOpacity>
        )


    }

    //素材5
    renderTemplate4 = ()=>{

        //根据传过来的模版来判断
        var margin = 20;//不管什么屏幕，都保留这个Margin
        var ImageW = window.width-margin*2;


        //默认图片高度
        var ImageH = ImageW * (960 / 540);



        //logo的位置尺寸...logo这里提前先固定好位置大小，以免在后面会出现问题

        var logoLeft =ImageW *(28/540);
        var logoTop = ImageH *(28/960);
        var logoWidth =ImageW *(210/1.5/540);
        var logoHeight =ImageH *(95/1.5/960);


        //如果selectObject 有值，而且里面还有宽度和高度.则需要修改图片的高度
        if(this.store.selectObject && this.store.selectObject.height && this.store.selectObject.width){
            ImageH = this.store.selectObject.height * ImageW / this.store.selectObject.width;
        }



        var corverLeft =0;//横屏视频距离左边
        var corverTop =0;//横屏视频距离top
        var corverWidth = ImageW;//横屏视频width
        var corverHeight = ImageH;//横屏视频height


        //阴影头部
        var shadowTLeft=0;
        var shadowTTop=0;
        var shadowTWidth=ImageW;
        var shadowTHeight=ImageW *(121/540);


        videoRange = {
            imageWidth:ImageW,
            imageHeight:ImageH,
            left:corverLeft,
            top:corverTop,
            width:corverWidth,
            height:corverHeight,
            isVertical:false
        }


        this.store.videoRange = videoRange;

        return(

            <TouchableOpacity  onPress={()=>{

                this._choosePhoto();
            }} ref={(mainBg)=>{this.mainBg = mainBg}} style={{margin:margin,marginTop:0,marginBottom:0, backgroundColor:'rgb(205,205,205)'}}>


                <Image

                    ref={(global)=>{this.global = global}}
                    source={ this.store.selectPicture ? {uri:this.store.selectPicture}  : require('./Images/posterImageEmptyBg.png')}
                    style={{ width:ImageW,height:ImageH }}>

                    <Image
                        source={ this.store.selectIndex==4? require('./Images/poster5sHead.png') :  require('./Images/poster6sHead.png')}
                        style={{position:'absolute',left:logoLeft,top:logoTop, width:logoWidth,height:logoHeight}}>

                    </Image>


                    <Image
                        source={require('./Images/posterVideoShadowTop.png')}
                        style={{position:'absolute',left:shadowTLeft,top:shadowTTop, width:shadowTWidth,height:shadowTHeight}}>

                    </Image>


                </Image>

                {this.renderPersonInfo()}



            </TouchableOpacity>
        )


    }



    //新版本，为了视频适配，960 * 540 （0226修改）
    renderTemplate3PersonInfo = () =>{


        var margin = 20;//不管什么屏幕，都保留这个Margin
        //总宽高

        var ImageW = window.width-margin*2;
        var ImageH = ImageW * (960 / 540);
        var contentWidth = window.width-margin*2;//底部资料宽度

        var contentHeight = contentWidth *(84 / 301);
        var contentLeft = 0;
        var contentTop = ImageH * (810 / 960);

        //左边
        var iconW = contentWidth * (51 / 301);//个人头像宽度
        var iconH = iconW;//个人头像高度
        var iconMargin = contentWidth * (15/301);

        //右边
        var iconQRCodeW = contentWidth *(55 / 301) ;
        var iconQRCodeH = iconQRCodeW;
        var rightMargin = contentWidth * (12 / 301) ;

        var qcodeSize = contentWidth *(19 / 301);

        //中间
        var centerContentLeft =contentWidth * (65 / 301);
        var centerContentTop =iconMargin+15;
        var centerImageW = contentWidth *(10 / 301);
        var centerImageH = centerImageW;
        var centerMargin =  contentWidth *(5 / 301);


        var titleColor=null;//标题颜色
        var qcodeColor = null;//二维码颜色
        var infoColor=null;//本文内容供您介绍


        var name = Chat.getLRUserName()
        var phone =Chat.getLRStaffWorkPhone()
        var FaceUrlPath = Chat.getLRUserFaceUrl()

        //横屏
        if(this.store.selectIndex == 0){

            titleColor = '#ffffff';
            qcodeColor = '#ffffff';
            infoColor =  '#ffffff';

        } else{
            //竖屏
            titleColor = '#ffffff';
            qcodeColor = '#ffffff';
            infoColor =  '#ffffff';
        }



        var qcodeLabel1 = '扫码看特价行程';
        var qcodeLabel2 = '从这里开始';

        return(

            <View style={{position:'absolute',left:contentLeft,top:contentTop,width:contentWidth,height:contentHeight, flexDirection:'row',backgroundColor:'transparent'}}>

                <Image source={{uri:FaceUrlPath}}
                       style={{position:'absolute',left:iconMargin/2,top:iconMargin,justifyContent:'center',alignItems:'center', width:iconW,height:iconH,borderRadius:iconW/2}}>
                </Image>



                <View style={{position:'absolute',top:rightMargin,right:rightMargin/2}}>
                    {
                        this.store.selectQRCode ?

                            <View

                                style={{}}>

                                <TouchableOpacity onPress={()=>{

                                    this.store.showActionSheet = true;

                                }}>

                                    <Image source={{uri:this.store.selectQRCode}}
                                           style={{borderWidth:2,borderColor:'#FC405F',justifyContent:'center',alignItems:'center', width:iconQRCodeW,height:iconQRCodeH}}>

                                    </Image>
                                </TouchableOpacity>


                                <View style={{alignItems:'center',justifyContent:'center',padding:2}}>

                                    <Text style={{color:qcodeColor,fontSize:7,maxWidth:iconQRCodeW+10}}>{qcodeLabel1}</Text>

                                </View>

                            </View>
                            :

                            <View

                                style={{}}>

                                <TouchableOpacity onPress={()=>{


                                    this.store.showActionSheet = true;



                                }}>

                                    <Image source={require('./Images/posterVideoAddPhotoBg.png')}
                                           style={{borderWidth:2,borderColor:'#FC405F',justifyContent:'center',alignItems:'center', width:iconQRCodeW,height:iconQRCodeH}}>

                                    </Image>
                                </TouchableOpacity>


                                <View style={{alignItems:'center',justifyContent:'center',padding:2}}>

                                    <Text style={{color:qcodeColor,fontSize:7,maxWidth:iconQRCodeW+10}}>{qcodeLabel1}</Text>
                                    {/*<Text style={{color:qcodeColor,fontSize:7,maxWidth:iconQRCodeW+10}}>{qcodeLabel2}</Text>*/}

                                </View>

                            </View>
                    }


                </View>



                <View style={{ position:'absolute',left:centerContentLeft,top:centerContentTop}}>

                    <View style={{flexDirection:'row',alignItems:'center'}}>

                        <Image source={ this.store.selectIndex==0? require('./Images/varticalName.png') :  require('./Images/varticalName.png')}
                               style={{width:centerImageW,height:centerImageH}}>

                        </Image>
                        <Text style={{color:titleColor,fontSize:10,marginLeft:centerMargin,fontWeight:'bold'}}>{name}</Text>
                    </View>

                    <View style={{flexDirection:'row',alignItems:'center',marginTop:centerMargin}}>

                        <Image
                            source={this.store.selectIndex==0?require('./Images/verticalPhone.png'):require('./Images/verticalPhone.png') }
                            style={{width:centerImageW,height:centerImageH}}></Image>
                        <Text style={{color:titleColor,fontSize:10,marginLeft:centerMargin,fontWeight:'bold'}}>{phone}</Text>
                    </View>


                </View>


            </View>


        )

    }


    DeleteChangeLine = (temp) => {

        // temp = temp.replace(/\r\n/g, "")
        // temp = temp.replace(/\n/g, "");

        var myStr = temp;
        return myStr


    }


    renderTemplate = () => {
        if (this.store.selectIndex == 0) {
            return this.renderTemplate0();
        }
        else if (this.store.selectIndex == 1) {
            return this.renderTemplate1();
        }
        else if (this.store.selectIndex == 2) {
            return this.renderTemplate2();
        } else if (this.store.selectIndex == 3) {
            return this.renderTemplate3();
        }else if (this.store.selectIndex == 4) {
            return this.renderTemplate4();
        }

        return null

    }




    renderMainBg = () => {


        var margin = 20;//不管什么屏幕，都保留这个Margin

        //#TODO 0808新需求：图片有多长就显示多长。以屏幕宽度为参照物。利用图片的真实宽的比例来计算图片宽高

        var ImageW = window.width - margin * 2;
        var ImageH = ImageW * (407 / 301);

        var addVideoStyle = null;
        if (this.store.selectIndex == 1) {

            addVideoStyle = {
                position: 'absolute',
                left: 10,
                top: ImageH / 3,
                alignItems: 'center',
            }

        }

        //如果是模版4，直接去加载template3
        else  if (this.store.selectIndex==3){

            return this.renderTemplate3()
        }
        //如果是模版5和模版6公用给一个模版，只不过头部图片不一样

        else  if(this.store.selectIndex==4 || this.store.selectIndex==5){
            return this.renderTemplate4()

        }

        else {
            addVideoStyle = {
                alignItems: 'center',
                justifyContent: 'center'
            }
        }

        return (

            <View ref={(mainBg) => {
                this.mainBg = mainBg
            }} style={{margin: margin, marginTop: 0, marginBottom: 0, backgroundColor: 'rgb(205,205,205)'}}>

                <TouchableOpacity onPress={() => {
                    this._choosePhoto();
                }}>

                    {

                        this.store.FileTypeID && this.store.selectPicture ?
                            <Image

                                source={{uri: this.store.selectPicture}}
                                style={{width: ImageW, height: ImageH}}>

                                <View style={{flexDirection: 'column-reverse', flex: 1}}>

                                    {this.renderTemplate()}

                                    {this.store.FileTypeID == 2 ?
                                        <Icon onPress={() => {
                                            this.PreviewPoster()
                                        }} size={30} style={{
                                            position: 'absolute',
                                            left: ImageW / 2 - 10,
                                            top: ImageH / 2 - 10,
                                            backgroundColor: 'transparent'
                                        }} icon={'0xe6cc'} color={'white'}></Icon>
                                        :
                                        null
                                    }


                                </View>

                            </Image>

                            :

                            <View
                                style={{width: ImageW, height: ImageH, alignItems: 'center', justifyContent: 'center'}}>

                                <View style={[{alignItems: 'center', justifyContent: 'center'}]}>
                                    <Icon icon={'0xe119'} size={40} color={'#B3B3B3'}/>
                                    <Text style={{color: '#999999', fontSize: 15, marginTop: 10}}>{'点击添加图片'}</Text>
                                </View>

                            </View>

                    }

                </TouchableOpacity>

                {this.renderPosterHead()}
                {this.renderPersonInfo()}
            </View>
        )


    }

    //从我去过文章选择二维码


    _chooseQRCodeFromArtice = (type)=>{



        this.props.navigator.push({
            component:Article,
            passProps:{

                type:type,
                GetQRCode:(response)=>{

                    console.log('选了我去过文章后的response  CityName 城市名')
                    // console.dir(response);

                    // if(response && response.DisplayName){
                    //     this.store.title = response.DisplayName;
                    // }

                    if(response && response.Name){

                        this.store.title = response.Name;

                    }


                    this.store.selectQRCode = response.Result.QRCode;



                }

            }
        })


    }


    //从相册选择二维码
    _chooseQRCodePhoto = ()=>{

       var posterVideoOptions1={

            mediaType:'image',
            quality: 0.70,
            allowsEditing: false,
            noData: false,
            maxWidth: FLEXBOX.width * FLEXBOX.pixel,
            maxHeight: FLEXBOX.height * FLEXBOX.pixel,
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        }
        ImagePicker.launchImageLibrary(posterVideoOptions1, (response) => {

            StatusBar.setBarStyle("light-content");
            console.log('选择二维码图片的结果');
            console.log(response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {

                //获取到二维码图片后显示到相册
                this.store.selectQRCode = response.uri;
            }
        });


    }



    renderActionSheet = ()=>{

        var arrays=['到相册中选择二维码', '到我去过文章生成二维码','个人品牌生成二维码'];

        if(this.store.showActionSheet){

            const testStyle={

                fontSize:16,
                color:'#333333',
                padding:15,


            }

            const viewStyle={

                borderRadius:20,
                alignItems:'center',
                justifyContent:'center',
                backgroundColor:'#fff',
                margin:5,
                width:window.width-40,

            }


            return(

                <TouchableOpacity style={{position:'absolute',left:0,top:0,width:window.width,height:window.height}}
                                  onPress={()=>{this.store.showActionSheet = false}}>



                    <View style={{backgroundColor:'#000',opacity:0.7,position:'absolute',left:0,top:0,width:window.width,height:window.height}}></View>


                    <View style={{alignItems:'center',flexDirection:'column',  position:'absolute',left:0,top:window.height/2,width:window.width,height:window.height/2}}>
                        <Text style={{color:'#fff',fontSize:16,margin:20}}>{'选择生成二维码的方式'}</Text>

                        <TouchableOpacity onPress={()=>{

                            this.store.showActionSheet =false;
                            this._chooseQRCodePhoto();

                        }} style={viewStyle}>
                            <Text  style={testStyle}>{'从手机相册选择'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>{

                            this.store.showActionSheet =false;
                            this._chooseQRCodeFromArtice('Article');

                        }} style={viewStyle}>
                            <Text  style={testStyle}>{'从我去过文章选择'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>{

                            this.store.showActionSheet =false;
                            this._chooseQRCodeFromArtice('Trip');

                        }} style={viewStyle}>
                            <Text  style={testStyle}>{'从旅行方案选择'}</Text>

                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>{
                            this.store.showActionSheet =false;
                            this.store.selectQRCode =this.store.QRCode;


                        }} style={viewStyle}>

                            <Text  style={testStyle}>{'默认个人品牌二维码'}</Text>
                        </TouchableOpacity>
                    </View>





                </TouchableOpacity>
            )
        }

        return null;


    }

    //这里的个人品牌二维码直接获取旧海报的个人二维码
    renderPersonInfo = () => {


        //#TODO 这块的内容其实基本都已经搞定了。但是位置不对。需要对模版5的个人信息模块修改top。也就是距离顶部的高度

        var margin = 20;//不管什么屏幕，都保留这个Margin
        //总宽高
        var contentWidth = window.width - margin * 2;//底部资料宽度
        var contentHeight = contentWidth * (84 / 301);


        //左边
        var iconW = contentWidth * (51 / 301);//个人头像宽度
        var iconH = iconW;//个人头像高度
        var iconMargin = contentWidth * (15 / 301);


        //右边
        var iconQRCodeW = contentWidth * (49 / 301);
        var iconQRCodeH = iconQRCodeW;
        var rightMargin = contentWidth * (12 / 301);

        var qcodeSize = contentWidth * (19 / 301);


        //中间
        var centerContentLeft = contentWidth * (65 / 301);
        var centerContentTop = iconMargin + 5;
        var centerImageW = contentWidth * (10 / 301);
        var centerImageH = centerImageW;
        var centerMargin = contentWidth * (5 / 301);


        var name = Chat.getLRUserName()
        var phone =Chat.getLRStaffWorkPhone()
        var FaceUrlPath = Chat.getLRUserFaceUrl()

        var qcodeLabel1 = '你的旅行故事';
        var qcodeLabel2 = '从这里开始';


        if(this.store.selectIndex==3){
            return null;
        }



        return (

            <View style={{width: contentWidth, height: contentHeight, flexDirection: 'row', backgroundColor: 'white'}}>

                <Image source={{uri: FaceUrlPath}}
                       style={{
                           position: 'absolute',
                           left: iconMargin / 2,
                           top: iconMargin,
                           justifyContent: 'center',
                           alignItems: 'center',
                           width: iconW,
                           height: iconH,
                           borderRadius: iconW / 2
                       }}>

                </Image>


                <View style={{position: 'absolute', top: rightMargin, right: rightMargin / 2}}>
                    {
                        this.store.selectQRCode ?


                            <View

                                style={{}}>

                                <TouchableOpacity onPress={()=>{

                                    this.store.showActionSheet = true;

                                }}>

                                    <Image source={{uri:this.store.selectQRCode}}
                                           style={{borderWidth:2,borderColor:'#FC405F',justifyContent:'center',alignItems:'center', width:iconQRCodeW,height:iconQRCodeH}}>

                                    </Image>
                                </TouchableOpacity>



                                <View style={{alignItems:'center',justifyContent:'center',padding:2}}>

                                    <Text style={{backgroundColor:'transparent',color:'#fff',fontSize:10}}>{'扫码看原文'}</Text>

                                </View>

                            </View>


                            :
                            <View

                                style={{}}>

                                <TouchableOpacity onPress={()=>{


                                    if(!this.store.showPreview){
                                        this.store.showActionSheet = true;

                                    }





                                }}>

                                    <Image source={require('./Images/posterVideoAddPhotoBg.png')}
                                           style={{borderWidth:2,borderColor:'#FC405F',justifyContent:'center',alignItems:'center', width:iconQRCodeW,height:iconQRCodeH}}>

                                    </Image>
                                </TouchableOpacity>




                                <View style={{alignItems:'center',justifyContent:'center',padding:2}}>

                                    <Text style={{backgroundColor:'transparent', color:'#fff',fontSize:10}}>{'扫码看原文'}</Text>

                                </View>

                            </View>
                    }


                </View>


                <View style={{position: 'absolute', left: centerContentLeft, top: centerContentTop}}>

                    <View style={{flexDirection: 'row', alignItems: 'center'}}>

                        <Image source={require('./Images/templateName.png')}
                               style={{width: centerImageW, height: centerImageH}}></Image>
                        <Text style={{
                            color: 'rgb(51,51,51)',
                            fontSize: 10,
                            marginLeft: centerMargin,
                            fontWeight: 'bold'
                        }}>{name}</Text>
                    </View>

                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: centerMargin}}>

                        <Image source={require('./Images/templatePhone.png')}
                               style={{width: centerImageW, height: centerImageH}}></Image>
                        <Text style={{
                            color: 'rgb(51,51,51)',
                            fontSize: 10,
                            marginLeft: centerMargin,
                            fontWeight: 'bold'
                        }}>{phone}</Text>
                    </View>


                    <View style={{marginTop: centerMargin}}>
                        <Text style={{color: 'rgb(102,102,102)', fontSize: 7}}>{this.store.personalLabel1}</Text>
                        <Text style={{color: 'rgb(102,102,102)', fontSize: 7}}>{this.store.personalLabel2}</Text>

                    </View>

                </View>


            </View>


        )


    }


    renderContent = () => {

        return (


            <ScrollView ref={(scrollview) => {
                this.scrollview = scrollview
            }}>


                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <Text onPress={() => {
                        this.PreviewPoster();
                    }} style={{padding: 10, marginRight: 20, color: '#fff', fontSize: 22}}>预览</Text>
                    <Text onPress={() => {
                        this.SavePoster();
                    }} style={{padding: 10, marginLeft: 20, color: '#fff', fontSize: 22}}>保存</Text>
                </View>

                {this.renderMainBg()}


            </ScrollView>

        )


    }


    render = () => {


        //显示预览界面
        if (this.store.showPreview) {

            return (

                <View style={{flex: 1, backgroundColor: 'rgb(0,0,0)'}}>

                    {this.renderPosterLoading()}

                    <View style={{
                        height: 40,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        margin: 20
                    }}>

                        <Icon onPress={() => {
                            this.store.showPreview = false
                        }} icon={'0xe183'} size={20} color={'white'}/>
                        <Text onPress={() => {

                            this.store.showPreview = false;
                            this.screenPhoto('ToSuccess')
                        }} style={{fontSize: 20, color: 'white'}}>{'保存'}</Text>

                    </View>


                    <View accessible={false}
                          pointerEvents='none'

                    >

                        {this.renderMainBg()}
                    </View>


                </View>
            )

        }


        else  return (

            <View style={{flex: 1, backgroundColor: 'rgb(72,74,74)'}}>

                {this.renderNavBar()}
                {this.renderContent()}
                {this.renderPosterLoading()}
                {this.renderActionSheet()}


            </View>
        )

    }

    renderPosterLoading = () => {
        if (this.store.posterLoading) {
            return <ActivityIndicator toast text={'正在生成海报...'} animating={this.store.posterLoading}/>
        }

        return null;


    }


    //导航条
    renderNavBar = () => {
        return (
            <YQFNavBar leftIcon={'0xe183'}
                       onLeftClick={() => {
                           this.props.navigator.pop()
                       }}
                       title={'编辑海报'}/>
        )
    }


}


const styles = StyleSheet.create({

    itemStyle: {
        // 对齐方式
        alignItems: 'center',
        justifyContent: 'center',

    },

    itemImageStyle: {
        // 尺寸
        width: 60,
        height: 100,
        margin: 10,
    },
    loading: {

        position: 'absolute',
        backgroundColor: 'red',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0


    },
    loadingMoreTitle: {

        marginLeft: 10,
        fontSize: 18,
        color: 'white',
    },


})