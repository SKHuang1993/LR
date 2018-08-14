/**
 * Created by yqf on 2018/2/2.
 */



//新年海报视频
//这里会有两个模版，一个横屏，一个竖屏



import { observer, trackComponents } from 'mobx-react/native';
import {observable, autorun,computed, extendObservable, action, toJS } from 'mobx'
import {Component} from 'react';
import React, { PropTypes } from 'react';
import Video from 'react-native-video';//视频播放
import Myplayer from '../../components/Myplayer'
import { captureRef } from "react-native-view-shot";


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
import {RestAPI,ServingClient} from '../../utils/yqfws';
import {Chat} from '../../utils/chat';

import Colors from '../../Themes/Colors';
import PosterPreview from './PosterPreview';
import PosterSuccess from './PosterSuccess';

import PictureTemplate from './PictureTemplate';
import ActivityIndicator from '../../components/activity-indicator'
import VerticleText from '../../components/VerticleText'
import Article from '../Article/article';

photoOptions = {


    mediaType:'video',
    allowsEditing: false,
    noData: false,
    videoQuality:'high'

}


posterVideoOptions={

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



const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,
}

const ReactNative = require('react-native');

class PosterNewYearVideoModel extends  Component{


    @observable showActionSheet = false;

    @observable VerticleTextArray=[];

    //从手机相册里面选中的视频
    @observable selectVideoResponse = null;

    //控制是否要显示视频
    @observable isShowVideo  = true;

    //视频区域
    @observable videoRange = null;


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

    @observable tp1CityText = '副标题(可编辑)';//模版1城市名


    @observable selectTitleColor =  '#EC2914';//主标题颜色
    @observable selectSubtitleColor = '#BFF232';//副标题颜色

    @observable Template1BigTitleText = '标题(可编辑)';//模版1城市名
    @observable Template4TopTitleText = '小标题(可编辑)';//模版1城市名

    @observable templateType = 'picture';//图片
    @observable loading = false;
    @observable isEmpty = false;

    @observable selectIndex = 0;


    @observable showPreview = false;//显示预览

    @observable FileTypeID =null ;//1代表图片 2代表视频

    @observable QRCode =null;//默认的用户个人品牌二维码
    @observable selectQRCode = null;//选中的二维码，最终传给原生。如果用户选择，则用用户的；否则，则用自己默认的


    @observable shotImage =null;//截图本地路径
    @observable base64 =null;//截图的base64
    @observable posterLoading =false;//截图的base64


}



@observer
export  default  class PosterNewYearVideo extends  Component{

    constructor(props){
        super(props);
        this.store = new PosterNewYearVideoModel();


        this.store.selectIndex = props.selectIndex ? props.selectIndex : 0;

        this.store.selectTitleColor =this.store.selectIndex==3? '#ff5959' :   this.store.selectIndex==0 ? '#EC2914' : this.store.selectIndex==1? '#000' : '#E32632';
        this.store.selectSubtitleColor =this.store.selectIndex==3? '#333333' :  this.store.selectIndex==0 ? '#BFF232' :this.store.selectIndex==1? '#fff':'#000';
        this.store.tp1CityText =   '副标题(可编辑)';

        this.state = {

            style:props.style,
            dataSource:new ListView.DataSource({
                rowHasChanged:(r1,r2) => r1 !==r2,
                sectionHeaderHasChanged:(s1,s2) => s1 !== s2
            }),
            data:['请\n输\n入\n描\n述'],
        };



    }




    componentDidMount = ()=>{

        this._fetchData()



    }

    _fetchData = async()=>{

        var param ={
            Url:'http://3g.yiqifei.com/i/'+Chat.loginUserResult.AccountNo,
            CreateQRCode:true
        };

        RestAPI.invoke('Base.CreateRoute',param,(response)=>{

            // console.log('生成 Base.CreateRoute  结果')
            // console.dir(response);
            this.store.QRCode= response.Result.QRCode;

        },(error)=>{

        });

        this.store.isLoading = false;

    }

    //从我去过文章选择二维码


    _chooseQRCodeFromArtice = (type)=>{



        this.props.navigator.push({
            component:Article,
            passProps:{

                type:type,
                GetQRCode:(response)=>{

                    this.store.selectQRCode = response.Result.QRCode;

                }

            }
        })


    }

    //从相册选择二维码
    _chooseQRCodePhoto = ()=>{

        ImagePicker.launchImageLibrary(posterVideoOptions, (response) => {

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


    //直接选择本地视频
    _chooseVideo = ()=>{
        if(Platform.OS === "android"){
            NativeModules.MyNativeModule.chooseVideo().then((response) => {
                this.store.selectVideoResponse = response
            });
        }else{
            ImagePicker.launchImageLibrary(photoOptions, (response) => {

                StatusBar.setBarStyle("light-content");
                console.log('选择视频的结果');

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

                    //获取到视频后在这里做逻辑
                    this.store.selectVideoResponse = response

                }
            });
        }

        /*
         this.props.navigator.push({

         component:PictureTemplate,
         passProps:{

         getPicture:(selectItem)=>{


         //本地相册
         if(selectItem && selectItem.uri){

         this.store.FileTypeID =1;//这是显示图片的
         this.store.selectPicture = selectItem.uri;


         }else {

         //素材图片
         if(selectItem.FileTypeID==1){
         //图片
         this.store.FileTypeID =1;//这是显示图片的
         this.store.selectPicture = Chat.getPosterImagePath(selectItem.FilePath);

         }else {


         this.store.FileTypeID =2;//这是显示视频的
         this.store.selectItem = selectItem;//这是选中的item
         this.store.selectPicture = selectItem.Video.ImageUrl;
         }

         }

         }
         }
         })
         */

    }


    //上传截图，同时并产生生成记录
    uploadPhoto = async()=>{



        //1。首先上传图片()
        if(this.store.shotImage){

            //这里是给海报视频用的
            if(this.store.selectVideoResponse){


                var FilePath = Platform.OS=='android'?this.store.selectVideoResponse:this.store.selectVideoResponse.origURL;

                var shotImagePath = this.store.shotImage;

                // console.log('视频路径和截图路径');
                // console.dir(shotImagePath);
                // console.dir(FilePath);
                // console.log('videoRange');
                // console.dir(this.store.videoRange)


                if(Chat.isAndroid()){
                    let testPar = {
                        imageWidth:this.store.videoRange.imageWidth,
                        imageHeight:this.store.videoRange.imageHeight,
                        left:this.store.videoRange.left,
                        top:this.store.videoRange.top,
                        width:this.store.videoRange.width,
                        height:this.store.videoRange.height,
                        isVertical:this.store.videoRange.isVertical
                    };

                    NativeModules.MyNativeModule.transverseScreen(testPar,FilePath,shotImagePath).then((text) => {

                        console.log('回调成功...')

                        Alert.alert("合成视频成功，请到相册查看")

                        //如果视频保存完成，拿到远江给的回调，则在这里将loading改为false

                        //保存完图片跳转到保存成功页面
                        this.props.navigator.push({
                            component: PosterSuccess,
                            passProps: {
                                type:'video'
                            }
                        })


                    });
                }else {
                    //ios

                    NativeModules.MyNativeModule.progressWithVideoPath(FilePath,shotImagePath,this.store.videoRange).then((text) => {

                        //  success(datas);
                        // console.log('回调成功...')
                        // console.dir(text);

                        Alert.alert("合成视频成功，请到相册查看");

                        //接着调转到保存保存成功的页面

                        //保存完图片跳转到保存成功页面
                        this.props.navigator.push({
                            component: PosterSuccess,
                            passProps: {
                                type:'video'
                            }
                        })




                    });



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


    //这个方法直接传沙盒的路径过去
    screenPhoto = (sth)=>{


        var _this = this;

        _this.store.posterLoading = true;//弹出提示框


        if(Chat.isAndroid()){


            captureRef(_this.mainBg, {format: 'png', quality: 1}).then(
                (uri) =>{


                    //点击保存的时候，第一时间将视频播放停止
                    this.store.paused = true;

                    _this.store.shotImage = uri;
                    _this.uploadPhoto()


                    /*
                     var promise = CameraRoll.saveToCameraRoll(uri);

                     promise.then(function(result) {

                     // console.log('截图后保存到手机相册成功了...')


                     _this.store.shotImage = result;
                     _this.uploadPhoto()


                     }).catch(function(error) {

                     Alert.alert('保存失败');
                     _this.store.posterLoading = false;

                     });
                     */




                }

            ).catch(
                (error) => {

                    Alert.alert('保存失败');
                    _this.store.posterLoading = false;
                }
            );
        }


        else {


            UIManager.takeSnapshot(_this.mainBg, {format: 'png', quality: 1}).then(
                (uri) =>{



                    //点击保存的时候，第一时间将视频播放停止
                    this.store.paused = true;

                    _this.store.shotImage = uri;
                    _this.uploadPhoto()

                    /*
                     var promise = CameraRoll.saveToCameraRoll(uri);

                     promise.then(function(result) {


                     console.log('保存到手机相册的路径')
                     // console.dir(result);

                     _this.store.shotImage = result;

                     _this.uploadPhoto()


                     }).catch(function(error) {

                     // console.log('保存图片失败了.....')
                     // console.dir(error);

                     Alert.alert('保存失败');
                     _this.store.posterLoading = false;
                     });
                     */

                }

            ).catch(
                (error) => {


                    // console.log('截图失败了...')
                    // console.dir(error)
                    Alert.alert('保存失败');
                    _this.store.posterLoading = false;

                }
            );

        }




    };


    //这个方法是将存到相册的照片路径传过去，修改成传沙盒的路径过去
    screenPhotoBF = (sth)=>{


        var _this = this;

        _this.store.posterLoading = true;//弹出提示框


        if(Chat.isAndroid()){


            captureRef(_this.mainBg, {format: 'png', quality: 1}).then(
                (uri) =>{

                    // console.log('截图的结果')
                    // console.dir(uri);


                    var promise = CameraRoll.saveToCameraRoll(uri);

                    promise.then(function(result) {

                        // console.log('截图后保存到手机相册成功了...')


                        _this.store.shotImage = result;
                        _this.uploadPhoto()


                    }).catch(function(error) {

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
        }


        else {


            UIManager.takeSnapshot(_this.mainBg, {format: 'png', quality: 1}).then(
                (uri) =>{

                    // console.log('截图的结果')
                    // console.dir(uri);

                    var promise = CameraRoll.saveToCameraRoll(uri);

                    promise.then(function(result) {


                        console.log('保存到手机相册的路径')
                        // console.dir(result);

                        _this.store.shotImage = result;

                        _this.uploadPhoto()


                    }).catch(function(error) {

                        // console.log('保存图片失败了.....')
                        // console.dir(error);

                        Alert.alert('保存失败');
                        _this.store.posterLoading = false;


                    });
                }

            ).catch(
                (error) => {


                    // console.log('截图失败了...')
                    // console.dir(error)
                    Alert.alert('保存失败');
                    _this.store.posterLoading = false;

                }
            );

        }




    };

    //预览海报
    PreviewPoster = ()=>{
        this.store.showPreview = true

    }




    //保存海报
    SavePoster = ()=>{

        if(!this.store.selectVideoResponse){

            Alert.alert('你还没有选取视频');
            return;
        }

        this.store.isShowVideo = false;

        this.store.posterLoading = true;//出现loading界面，不让用户感觉到在加载

        //抖音视频，直接上传
        if(this.store.selectIndex==0){

            this.SaveVideo()

        }else {

            if(!this.store.selectQRCode){
                //检查二维码的问题。如果二维码为空，则默认将个人品牌当二维码使用
                this.store.selectQRCode = this.store.QRCode;
            }

            setTimeout(() => {

                console.warn("现在最大的问题就是：选择视频的时候，截图没有截中视频背景图，反而是截了默认的背景图，发朋友圈的时候很难看")

                //保存视频
                this.screenPhoto('ToSuccess');
                // this.SaveVideo()
                //新修改后的方法，不需要经过截图这个环节，直接跳到传参数给原生

            }, 1000);
        }




    }

    //保存视频，同时并产生生成记录
    SaveVideo = async()=>{

        //这里是给海报视频用的
        if(this.store.selectVideoResponse){


            console.log('这里需要将视频保存到本地，生成酷炫的效果')
            var FilePath = Platform.OS=='android'?this.store.selectVideoResponse:this.store.selectVideoResponse.origURL;
            var shotImagePath = this.store.shotImage;//这是老版本的截图，不用理了
            var title = this.store.Template1BigTitleText;//标题
            var subTitle = this.store.tp1CityText;//副标题
            var qrCode =this.store.selectQRCode ? this.store.selectQRCode :  this.store.QRCode;//右下角二维码

            var qrCodeIsLocal = this.store.selectQRCode ? false : true;//二维码是否为本地

            var Json = {
                videoPath:FilePath,
                title:title,
                subTitle:subTitle,
                qrCode:qrCode,
                userInfo:{

                    User:{
                        FaceUrlPath:Chat.loginUserResult.DetailInfo.UserLogo,
                        Name:Chat.getLRUserName(),
                        CustomerService:{
                            WorkPhone:Chat.getLRStaffWorkPhone()
                        }
                    },

                },
                titleColor:this.store.selectTitleColor == 'Normal' ?"#EC2914" : this.store.selectTitleColor ,
                subtitleColor:this.store.selectSubtitleColor == 'Normal' ? "#BFF232" :this.store.selectSubtitleColor ,
                qrCodeIsLocal:qrCodeIsLocal
            }


            //
            // console.log('抖音模版传给原生的数据');
            // console.dir(Json);

            if(Chat.isAndroid()){
                NativeModules.MyNativeModule.progressWithVideoPath(Json).then((text) => {

                    console.log('回调成功...')

                    Alert.alert("合成视频成功，请到相册查看")

                    //保存完图片跳转到保存成功页面
                    this.props.navigator.push({
                        component: PosterSuccess,
                        passProps: {
                            type:'video'
                        }
                    })


                });
            }else {
                //ios

                NativeModules.MyNativeModule.SaveVideoWithJson(Json).then((text) => {

                    //  success(datas);
                    console.log('视频回调成功了......')
                    // console.dir(text);

                    Alert.alert("合成视频成功，请到相册查看");

                    //接着调转到保存保存成功的页面

                    //保存完图片跳转到保存成功页面
                    this.props.navigator.push({
                        component: PosterSuccess,
                        passProps: {
                            type:'video'
                        }
                    })


                },(error)=>{

                    Alert.alert("合成视频失败失败---");

                });




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



    loadStart = () => {

        this.store.isLoading = true;

        console.log('视频开始加载');
    }

    onLoad = (e) => {

        // console.log('onLoad');
        // console.dir(e);

        this.store.duration = e.duration;

    }

    onProgress = (data) => {


        if (this.store.isLoading) {
            this.store.isLoading = false;
        }

        let val = parseInt(data.currentTime);
        this.store.currentTime = data.currentTime;
        this.store.sliderValue = val;

        // console.log('val')
        // console.dir(val);


    }

    //设置全屏
    fullScreen = () => {

        this.props.navigator.push({
            component: Myplayer,
            passProps: {
                playUrl: this.store.videoUrl
            }
        })

    }

    getCurrentTimePercentage() {
        if (this.store.currentTime > 0) {
            return parseFloat(this.store.currentTime) / parseFloat(this.store.duration);
        } else {
            return 0;
        }
    }

    formatTime(time) {

        // 71s -> 01:11
        let min = Math.floor(time / 60)
        let second = time - min * 60
        min = min >= 10 ? min : '0' + min
        second = second >= 10 ? second : '0' + second
        return min + ':' + second
    }

    onEnd = () => {

        this.store.showPause = true;

        console.log('视频播放完成');

    }
    videoError = () => {

        console.log('视频播放出错');

    }


    /*------------------------------render相关-------------------------------------------------*/

    DeleteChangeLine = (temp)=>{


        // temp=temp.replace(/\r\n/g,"")
        // temp=temp.replace(/\n/g,"");

        var myStr = temp;

        // console.log("这是DeleteChangeLine转换后的文本啊....")
        // console.dir(myStr);

        return myStr


    }




    //0403 慧宁新版本(也就是模版4)
    renderTemplateFour = ()=>{


        //背景图片
        //根据传过来的模版来判断
        var margin = 20;//不管什么屏幕，都保留这个Margin
        var ImageW = window.width-margin*2;
        var ImageH = ImageW * (960 / 540);


        //视频输入栏...
        var corverLeft =ImageW * (20 / 540);//横屏视频距离左边
        var corverTop =ImageH *(340 / 960);//横屏视频距离top
        var corverWidth = ImageW * (500 / 540);//横屏视频width
        var corverHeight = ImageH *(280 / 960);//横屏视频height

        var corverVideoStyle={

            position:'absolute',
            left:corverLeft,
            top:corverTop,
            width:corverWidth,
            height:corverHeight
        }

        var videoRange = {
            imageWidth:ImageW,
            imageHeight:ImageH,
            left:corverLeft,
            top:corverTop,
            width:corverWidth,
            height:corverHeight,
            isVertical:false
        }
        this.store.videoRange = videoRange;


        //右上角自定义输入
        var topTitleRight =corverLeft;//
        var topTitlTop =ImageH *(25 / 960);//
        var topTitlWidth = ImageW * (170 / 540);//
        var topTitlHeight = ImageH *(50 / 960);//





        //输入框1 (3999 结伴玩尽大堡礁黄金海岸双岛）
        var titleLeft =corverLeft;//
        var titleTop =ImageH *(178 / 960);//
        var titleWidth = ImageW * (500 / 540);//
        var titleHeight = ImageH *(110 / 960);//

        //输入框2 （超划算，含双岛往返机票...,居中）

        var subTitleLeft =corverLeft;//
        var subTitleTop =ImageH *(650 / 960);//
        var subTitleWidth = ImageW * (360 / 540);//
        var subTitleHeight = ImageH *(150 / 960);//

        var fullTopTitleViewStyle={

            justifyContent:'center',
            position:'absolute',
            top:topTitlTop,
            right:topTitleRight,
            width:topTitlWidth,
            height:topTitlHeight,
            backgroundColor:'transparent',
            // backgroundColor:'black',

        }


        var fullTopTitleTextStyle ={
            textAlign:'left',
            backgroundColor:'transparent',
            fontWeight:'bold',
            fontSize:20,
            color:'rgb(244,72,72)',
            padding:3

        }



        var fullTitleViewStyle ={

            justifyContent:'center',
            // alignItems:'center',
            position:'absolute',
            top:titleTop,
            left:titleLeft,
            width:titleWidth,
            height:titleHeight,
            backgroundColor:'transparent',

        }


        var fullTitleTextStyle ={
            textAlign:'left',
            backgroundColor:'transparent',
            fontWeight:'bold',
            fontSize:24,
            color:this.store.selectTitleColor,
            padding:5
        }

        var fullSubTitleViewStyle ={

            justifyContent:'center',
            // alignItems:'center',
            position:'absolute',
            top:subTitleTop,
            right:subTitleLeft,
            width:subTitleWidth,
            height:subTitleHeight,
            backgroundColor:'transparent',


        }

        var fullSubTitleTextStyle ={

            backgroundColor:'transparent',
            fontSize:16,
            textAlign:'right',
            color:this.store.selectSubtitleColor,
            fontWeight:'bold',
            lineSpacing:5,
            padding:5
        }

        return(

            <View ref={(mainBg)=>{this.mainBg = mainBg}} style={{margin:margin,marginTop:0,marginBottom:0, backgroundColor:'rgb(205,205,205)'}}>

                <Image

                    ref={(global)=>{this.global = global}}
                    source={ require('./Images/posterVideoTemplateFourEmpty.jpg')}
                    style={{ width:ImageW,height:ImageH}}>

                    {this.store.selectVideoResponse && this.store.isShowVideo==true ?

                        <View style={[corverVideoStyle]} >

                            <TouchableOpacity onPress={()=>{
                                this._chooseVideo()}}
                                              style={{position:'absolute',left:0,top:0,width:corverWidth, height:corverHeight}}
                            >
                                <Video
                                    ref={(player)=>{this.player = player}}
                                    source={{uri:Platform.OS=='android'?this.store.selectVideoResponse:this.store.selectVideoResponse.origURL}} // 视频的URL地址，或者本地地址，都可以.
                                    rate={1}                   // 控制暂停/播放，0 代表暂停paused, 1代表播放normal.
                                    volume={1.0}                 // 声音的放声音的放大倍数大倍数，0 代表没有声音，就是静音muted, 1 代表正常音量 normal，更大的数字表示放大的倍数
                                    muted={this.store.muted}                // .....暂时将音量设置为静音，很吵 true代表静音，默认为false..
                                    paused={this.store.paused}               // true代表暂停，默认为false
                                    resizeMode="contain"           // 视频的自适应伸缩铺放行为，contain、stretch、cover
                                    repeat={false}                // 是否重复播放
                                    playInBackground={true}     // 当app转到后台运行的时候，播放是否暂停
                                    playWhenInactive={false}     // [iOS] Video continues to play when control or notification center are shown. 仅适用于IOS
                                    onLoadStart={this.loadStart} // 当视频开始加载时的回调函数
                                    onLoad={(e)=>{this.onLoad(e)}}    // 当视频加载完毕时的回调函数
                                    onProgress={(e)=>{this.onProgress(e)}}    //  进度控制，每250ms调用一次，以获取视频播放的进度
                                    onEnd={this.onEnd}           // 当视频播放完毕后的回调函数
                                    onError={this.videoError}    // 当视频不能加载，或出错后的回调函数
                                    // style={{position:'absolute',left:corverLeft,top:corverTop,width:corverWidth,height:corverHeight}}
                                    style={{position:'absolute',left:0,top:0,width:corverWidth, height:corverHeight}}
                                >

                                </Video>
                            </TouchableOpacity>

                        </View>

                        :

                        <TouchableOpacity
                            style={[corverVideoStyle]}
                            onPress={()=>{
                                this._chooseVideo()
                            }
                            }>

                            <Image

                                style={{position:'absolute',left:0,top:0,width:corverWidth, height:corverHeight}}
                                source={ require('./Images/posterVideoTemplateSecondAddVideo.png')}>
                            </Image>

                        </TouchableOpacity>
                    }




                    <View style={[fullTopTitleViewStyle]}>
                        <Text

                            onPress={()=>{
                                this.props.navigator.push({

                                    component:EditData,
                                    passProps:{

                                        title:"编辑",
                                        defaultValue:this.store.Template4TopTitleText,
                                        posterPlaceholder: '输入小标题',
                                        placeholder:this.store.Template4TopTitleText,

                                        getDetail:(text)=>{

                                            var temp;
                                            var maxLength = text.length>100 ? 100 :text.length;
                                            temp= text.substring(0,maxLength);
                                            this.store.Template4TopTitleText = this.DeleteChangeLine(temp);

                                        }

                                    }
                                })
                            }}
                            style={fullTopTitleTextStyle}
                            numberOfLines={2}

                        >
                            {this.store.Template4TopTitleText}
                        </Text>


                    </View>



                    {this.store.Template1BigTitleText?
                        <View style={[fullTitleViewStyle]}>
                            <Text

                                onPress={()=>{
                                    this.props.navigator.push({

                                        component:EditData,
                                        passProps:{

                                            title:"编辑",
                                            isShowColorBoard:true,
                                            defaultValue:this.store.Template1BigTitleText,
                                            posterPlaceholder: '这里录入标题',
                                            placeholder:this.store.Template1BigTitleText,
                                            getDetail:(text,color)=>{
                                                //那边有换行，到这边没有了换行。需要兼容
                                                var temp;
                                                var maxLength = text.length>100 ? 100 :text.length;
                                                temp= text.substring(0,maxLength);
                                                this.store.Template1BigTitleText = this.DeleteChangeLine(temp);

                                                if(color!=='Normal'){

                                                    this.store.selectTitleColor = color;

                                                }




                                            }

                                        }
                                    })
                                }}
                                style={fullTitleTextStyle}
                                numberOfLines={3}

                            >
                                {this.store.Template1BigTitleText}
                            </Text>


                        </View>
                        :null
                    }





                    {this.store.tp1CityText ?
                        <View style={[fullSubTitleViewStyle]}>

                            <Text

                                onPress={()=>{
                                    this.props.navigator.push({

                                        component:EditData,
                                        passProps:{

                                            title:"编辑",
                                            defaultValue:this.store.tp1CityText,
                                            posterPlaceholder:  '请输入副标题' ,
                                            placeholder:this.store.tp1CityText,
                                            isShowColorBoard:true,



                                            getDetail:(text,color)=>{

                                                var temp;
                                                var maxLength = text.length>200 ? 200 :text.length;
                                                temp= text.substring(0,maxLength);
                                                this.store.tp1CityText = this.DeleteChangeLine(temp);
                                                if(color!=='Normal'){

                                                    this.store.selectSubtitleColor = color;

                                                }

                                            }

                                        }
                                    })
                                }}
                                numberOfLines={3}
                                style={fullSubTitleTextStyle}>
                                {this.store.tp1CityText}
                            </Text>

                        </View>
                        :
                        null
                    }




                    {this.renderPersonInfo()}

                </Image>


            </View>
        )
























    }



    //渲染横版的视频
    renderTemplateHorizontal = ()=>{

        if (this.store.selectIndex == 3){
            return this.renderTemplateFour()
        }


        //背景图片
        //根据传过来的模版来判断
        var margin = 20;//不管什么屏幕，都保留这个Margin
        var ImageW = window.width-margin*2;
        var ImageH = ImageW * (960 / 540);


        //个人信息view()
        var topViewTop = 0;
        var topViewLeft = 0;
        var topViewWidth = ImageW;
        var topViewHeight =ImageH *( 158 / 960);


        //用户头像
        var iconW = topViewWidth * (100 / 540);//个人头像宽度
        var iconH = iconW;//个人头像高度
        var iconLeft = topViewWidth * (20/540);
        var iconTop = ImageH * (34/960);
        var topIconStyle={
            position:'absolute',
            left:iconLeft,
            top:iconTop,
            width:iconW,
            height:iconH,
            borderRadius:iconW/2
        }

        //中间
        var centerContentLeft =ImageW * (140 / 540);
        var centerContentTop = ImageH * (45/960);
        var centerIconW = ImageW * (25 / 540);
        var centerIconH = centerIconW;

        var centerMargin =  7;

        var phone = Chat.loginUserResult.DetailInfo &&  Chat.loginUserResult.DetailInfo.StaffWorkPhone ? Chat.loginUserResult.DetailInfo.StaffWorkPhone : '';


        //topview 样式
        var topViewStyle={

            position:'absolute',
            flexDirection:'row',
            alignItems:'center',
            left:topViewLeft,
            top:topViewTop,
            width:topViewWidth,
            height:topViewHeight,

        }


        //视频输入栏...
        var corverLeft =ImageW * (20 / 540);//横屏视频距离左边
        var corverTop =ImageH *(158 / 960);//横屏视频距离top
        var corverWidth = ImageW * (500 / 540);//横屏视频width
        var corverHeight = ImageH *(315 / 960);//横屏视频height

        var corverVideoStyle={

            position:'absolute',
            left:corverLeft,
            top:corverTop,
            width:corverWidth,
            height:corverHeight

        }

        var videoRange = {
            imageWidth:ImageW,
            imageHeight:ImageH,
            left:corverLeft,
            top:corverTop,
            width:corverWidth,
            height:corverHeight,
            isVertical:false
        }
        this.store.videoRange = videoRange;

        //输入框1 (3999 结伴玩尽大堡礁黄金海岸双岛）
        var titleLeft =corverLeft;//横屏视频距离左边
        var titleTop =ImageH *(472 / 960);//横屏视频距离top
        var titleWidth = ImageW * (500 / 540);//横屏视频width
        var titleHeight = ImageH *(220 / 960);//横屏视频height


        //输入框2 （超划算，含双岛往返机票...,居中）

        var subTitleLeft =corverLeft;//横屏视频距离左边
        var subTitleTop =ImageH *(735 / 960);//横屏视频距离top
        var subTitleWidth = ImageW * (360 / 540);//横屏视频width
        var subTitleHeight = ImageH *(150 / 960);//横屏视频height

        //0226新版下的标题各种样式
        var fullTitleViewStyle ={

            justifyContent:'center',
            alignItems:'center',
            position:'absolute',
            top:titleTop,
            left:titleLeft,
            width:titleWidth,
            height:titleHeight,
            // opacity:0.7,
            // backgroundColor:this.store.selectIndex==1 ?'#ffde00':'#6BFDDF',
            backgroundColor:this.store.selectIndex==1 ?'#ffde00':'transparent',

        }


        var fullTitleTextStyle ={
            textAlign:'center',
            backgroundColor:'transparent',
            fontWeight:'bold',
            fontSize:24,
            color:this.store.selectTitleColor,
            padding:5
        }

        var fullSubTitleViewStyle ={

            justifyContent:'center',
            alignItems:'center',
            position:'absolute',
            top:subTitleTop,
            left:subTitleLeft,
            width:subTitleWidth,
            height:subTitleHeight,
            // backgroundColor:this.store.selectIndex==1 ?'transparent':'#61F7DF',
            backgroundColor:'transparent',

            // borderRadius:10,
            // opacity:0.7,
            // backgroundColor:'rgb(0,0,0)',
            // backgroundColor:'blue'


        }

        var fullSubTitleTextStyle ={

            textAlign:'center',
            backgroundColor:'transparent',
            fontSize:16,
            color:this.store.selectSubtitleColor,
            fontWeight:'bold',
            padding:5
        }

        var fullBottomViewStyle={

            justifyContent:'center',
            alignItems:'center',
            position:'absolute',
            bottom:10,
            left:0,
            right:0,

        }

        var fullBottomTextStyle={

            textAlign:'center',
            backgroundColor:'transparent',
            fontSize:10,
            color:this.store.selectIndex==1 ? '#fff':'#000',
            fontWeight:'bold',

        }

        //二维码
        var fullQCodeW =  ImageW * (112 / 540);
        var fullQCodeH = fullQCodeW;
        var fullQCodeRight =ImageW * (20 / 540);
        var fullQCodeTop = ImageH *(740/960);

        //扫码看原文
        //本文内容供您参考，。。。
        var bottomText = '本文内容供您参考,详情请咨询一起飞@旅行顾问';


        var name = Chat.getLRUserName()
        var phone =Chat.getLRStaffWorkPhone()
        var FaceUrlPath = Chat.getLRUserFaceUrl()



        return(

            <View ref={(mainBg)=>{this.mainBg = mainBg}} style={{margin:margin,marginTop:0,marginBottom:0, backgroundColor:'rgb(205,205,205)'}}>

                <Image

                    ref={(global)=>{this.global = global}}
                    source={ this.store.selectIndex==1? require('./Images/posterVideoTemplateSecondEmpty.png') : require('./Images/posterVideoTemplateThirdEmpty.png')}
                    style={{ width:ImageW,height:ImageH}}>


                    <View style={[topViewStyle]}>

                        <Image source={{uri:FaceUrlPath}}
                               style={topIconStyle}>
                        </Image>


                        <View style={{ position:'absolute',left:centerContentLeft,top:centerContentTop}}>

                            <View style={{flexDirection:'row',alignItems:'center'}}>

                                <Image source={this.store.selectIndex==1?require('./Images/varticalName.png') :require('./Images/NameBlack.png') }
                                       style={{width:centerIconW,height:centerIconW}}>

                                </Image>
                                <Text style={{backgroundColor:'transparent',fontSize:18,marginLeft:centerMargin,fontWeight:'bold',color:this.store.selectIndex==1?'#fff':'#000'}}>{name}</Text>
                            </View>

                            <View style={{flexDirection:'row',alignItems:'center',marginTop:centerMargin/2}}>

                                <Image
                                    source={this.store.selectIndex==1? require('./Images/verticalPhone.png') : require('./Images/phoneBlack.png')}
                                    style={{width:centerIconW,height:centerIconW}}></Image>
                                <Text style={{backgroundColor:'transparent',fontSize:18,marginLeft:centerMargin,fontWeight:'bold',color:this.store.selectIndex==1?'#fff':'#000'}}>{phone}</Text>
                            </View>




                        </View>


                    </View>
                    {this.store.selectVideoResponse && this.store.isShowVideo==true ?

                        <View style={[corverVideoStyle]} >

                            <TouchableOpacity onPress={()=>{
                                {/*this.store.showVideoToolBar = !this.store.showVideoToolBar*/}
                                this._chooseVideo()}}
                                              style={{position:'absolute',left:0,top:0,width:corverWidth, height:corverHeight}}
                            >
                                <Video
                                    ref={(player)=>{this.player = player}}
                                    source={{uri:Platform.OS=='android'?this.store.selectVideoResponse:this.store.selectVideoResponse.origURL}} // 视频的URL地址，或者本地地址，都可以.
                                    rate={1}                   // 控制暂停/播放，0 代表暂停paused, 1代表播放normal.
                                    volume={1.0}                 // 声音的放声音的放大倍数大倍数，0 代表没有声音，就是静音muted, 1 代表正常音量 normal，更大的数字表示放大的倍数
                                    muted={this.store.muted}                // .....暂时将音量设置为静音，很吵 true代表静音，默认为false..
                                    paused={this.store.paused}               // true代表暂停，默认为false
                                    resizeMode="contain"           // 视频的自适应伸缩铺放行为，contain、stretch、cover
                                    repeat={false}                // 是否重复播放
                                    playInBackground={true}     // 当app转到后台运行的时候，播放是否暂停
                                    playWhenInactive={false}     // [iOS] Video continues to play when control or notification center are shown. 仅适用于IOS
                                    onLoadStart={this.loadStart} // 当视频开始加载时的回调函数
                                    onLoad={(e)=>{this.onLoad(e)}}    // 当视频加载完毕时的回调函数
                                    onProgress={(e)=>{this.onProgress(e)}}    //  进度控制，每250ms调用一次，以获取视频播放的进度
                                    onEnd={this.onEnd}           // 当视频播放完毕后的回调函数
                                    onError={this.videoError}    // 当视频不能加载，或出错后的回调函数
                                    // style={{position:'absolute',left:corverLeft,top:corverTop,width:corverWidth,height:corverHeight}}
                                    style={{position:'absolute',left:0,top:0,width:corverWidth, height:corverHeight}}
                                >

                                </Video>
                            </TouchableOpacity>

                        </View>

                        :

                        <TouchableOpacity
                            style={[corverVideoStyle]}
                            onPress={()=>{
                                this._chooseVideo()
                            }
                            }>

                            <Image

                                style={{position:'absolute',left:0,top:0,width:corverWidth, height:corverHeight}}
                                source={ require('./Images/posterVideoTemplateSecondAddVideo.png')}>
                            </Image>

                        </TouchableOpacity>
                    }



                    {this.store.Template1BigTitleText?
                        <View style={[fullTitleViewStyle]}>
                            <Text

                                onPress={()=>{
                                    this.props.navigator.push({

                                        component:EditData,
                                        passProps:{

                                            defaultValue:this.store.Template1BigTitleText,
                                            isShowColorBoard:true,
                                            posterPlaceholder: '这里录入标题',
                                            placeholder:this.store.Template1BigTitleText,
                                            getDetail:(text,color)=>{
                                                var temp;
                                                var maxLength = text.length>100 ? 100 :text.length;
                                                temp= text.substring(0,maxLength);
                                                this.store.Template1BigTitleText = this.DeleteChangeLine(temp);
                                                if(color!=='Normal'){
                                                    this.store.selectTitleColor = color;
                                                }
                                            }

                                        }
                                    })
                                }}
                                style={fullTitleTextStyle}
                                numberOfLines={3}

                            >
                                {this.store.Template1BigTitleText}
                            </Text>


                        </View>
                        :null
                    }

                    {

                        this.store.tp1CityText?
                            <View style={[fullSubTitleViewStyle]}>

                                <Text

                                    onPress={()=>{
                                        this.props.navigator.push({

                                            component:EditData,
                                            passProps:{

                                                defaultValue:this.store.tp1CityText,
                                                isShowColorBoard:true,
                                                posterPlaceholder:  '请输入副标题' ,
                                                placeholder:this.store.tp1CityText,
                                                getDetail:(text,color)=>{



                                                    var temp;
                                                    var maxLength = text.length>200 ? 200 :text.length;
                                                    temp= text.substring(0,maxLength);
                                                    this.store.tp1CityText = this.DeleteChangeLine(temp);
                                                    if(color!=='Normal'){

                                                        this.store.selectSubtitleColor = color;

                                                    }
                                                }

                                            }
                                        })
                                    }}
                                    numberOfLines={4}
                                    style={fullSubTitleTextStyle}>
                                    {this.store.tp1CityText}
                                </Text>

                            </View>
                            :null

                    }



                    <View style={{position:'absolute',top:fullQCodeTop,right:fullQCodeRight}}>
                        {
                            this.store.selectQRCode ?

                                <View

                                    style={{}}>

                                    <TouchableOpacity onPress={()=>{

                                        this.store.showActionSheet = true;

                                    }}>

                                        <Image source={{uri:this.store.selectQRCode}}
                                               style={{borderWidth:2,borderColor:'#FC405F',justifyContent:'center',alignItems:'center', width:fullQCodeW,height:fullQCodeW}}>

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
                                               style={{borderWidth:2,borderColor:'#FC405F',justifyContent:'center',alignItems:'center', width:fullQCodeW,height:fullQCodeW}}>

                                        </Image>
                                    </TouchableOpacity>




                                    <View style={{alignItems:'center',justifyContent:'center',padding:2}}>

                                        <Text style={{backgroundColor:'transparent', color:'#fff',fontSize:10}}>{'扫码看原文'}</Text>

                                    </View>

                                </View>
                        }


                    </View>



                    <View style={fullBottomViewStyle}>
                        <Text style={fullBottomTextStyle}>{bottomText}</Text>
                    </View>

                </Image>


            </View>
        )


    }



    //0226 新版本（仿抖音播放界面）
    renderMainBgForDouYin = ()=>{

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

            <View ref={(mainBg)=>{this.mainBg = mainBg}} style={{margin:margin,marginTop:0,marginBottom:0, backgroundColor:'rgb(205,205,205)'}}>

                <Image

                    ref={(global)=>{this.global = global}}
                    source={ require('./Images/posterVideoEmptyBg.png')}
                    style={{ width:ImageW,height:ImageH}}>
                    <TouchableOpacity onPress={()=>{
                        this._chooseVideo();
                    }}>

                        {this.store.selectVideoResponse && this.store.isShowVideo==true ?

                            <View>
                                <TouchableOpacity onPress={()=>{
                                    {/*this.store.showVideoToolBar = !this.store.showVideoToolBar*/}
                                    this._chooseVideo()
                                }}>
                                    <Video
                                        ref={(player)=>{this.player = player}}
                                        source={{uri:Platform.OS=='android'?this.store.selectVideoResponse:this.store.selectVideoResponse.origURL}} // 视频的URL地址，或者本地地址，都可以.
                                        rate={1}                   // 控制暂停/播放，0 代表暂停paused, 1代表播放normal.
                                        volume={1.0}                 // 声音的放声音的放大倍数大倍数，0 代表没有声音，就是静音muted, 1 代表正常音量 normal，更大的数字表示放大的倍数
                                        muted={this.store.muted}                // .....暂时将音量设置为静音，很吵 true代表静音，默认为false..
                                        paused={this.store.paused}               // true代表暂停，默认为false
                                        resizeMode="contain"           // 视频的自适应伸缩铺放行为，contain、stretch、cover
                                        repeat={false}                // 是否重复播放
                                        playInBackground={true}     // 当app转到后台运行的时候，播放是否暂停
                                        playWhenInactive={false}     // [iOS] Video continues to play when control or notification center are shown. 仅适用于IOS
                                        onLoadStart={this.loadStart} // 当视频开始加载时的回调函数
                                        onLoad={(e)=>{this.onLoad(e)}}    // 当视频加载完毕时的回调函数
                                        onProgress={(e)=>{this.onProgress(e)}}    //  进度控制，每250ms调用一次，以获取视频播放的进度
                                        onEnd={this.onEnd}           // 当视频播放完毕后的回调函数
                                        onError={this.videoError}    // 当视频不能加载，或出错后的回调函数
                                        // style={{position:'absolute',left:corverLeft,top:corverTop,width:corverWidth,height:corverHeight}}
                                        style={[corverVideoStyle]}

                                    >

                                    </Video>
                                </TouchableOpacity>

                            </View>

                            :

                            <Image

                                style={[corverVideoStyle]}
                                source={ require('./Images/posterVideoEmptyBg.png')}>
                            </Image>

                        }


                    </TouchableOpacity>





{this.store.tp1CityText ?
    <View style={[fullSubTitleViewStyle]}>

        <Text

            onPress={()=>{
                this.props.navigator.push({

                    component:EditData,
                    passProps:{

                        defaultValue: this.store.tp1CityText,
                        isShowColorBoard:true,
                        posterPlaceholder:  '请录入副标题' ,
                        placeholder:this.store.tp1CityText,
                        getDetail:(text,color)=>{


                            var temp;
                            {/*var maxLength = text.length>15 ? 15 :text.length;*/}
                            {/*temp= text.substring(0,maxLength);*/}
                            this.store.tp1CityText = this.DeleteChangeLine(text);

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
            {this.store.tp1CityText}
        </Text>

    </View>
:
    null

}




{this.store.Template1BigTitleText ?
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
    :null
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


                    {this.renderPersonInfo()}

                </Image>


            </View>
        )


    }





    //新版本，为了视频适配，960 * 540 （0226修改）
    renderPersonInfo = () =>{


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
        var centerContentTop =iconMargin+5;
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

        }else if(this.store.selectIndex == 3){

            titleColor = '#000000';
            qcodeColor = '#000000';
            infoColor =  '#000000';

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

                        <Image source={ this.store.selectIndex==3? require('./Images/NameBlack.png') : this.store.selectIndex==0? require('./Images/varticalName.png') :  require('./Images/varticalName.png')}
                               style={{width:centerImageW,height:centerImageH}}>

                        </Image>
                        <Text style={{color:titleColor,fontSize:10,marginLeft:centerMargin,fontWeight:'bold'}}>{name}</Text>
                    </View>

                    <View style={{flexDirection:'row',alignItems:'center',marginTop:centerMargin}}>

                        <Image
                            source={this.store.selectIndex==3? require('./Images/phoneBlack.png') : this.store.selectIndex==0?require('./Images/verticalPhone.png'):require('./Images/verticalPhone.png') }
                            style={{width:centerImageW,height:centerImageH}}></Image>
                        <Text style={{color:titleColor,fontSize:10,marginLeft:centerMargin,fontWeight:'bold'}}>{phone}</Text>
                    </View>


                    <View style={{marginTop:centerMargin}}>
                        <Text style={{color:infoColor,fontSize:8}}>{this.store.personalLabel1}</Text>
                        <Text style={{color:infoColor,fontSize:8}}>{this.store.personalLabel2}</Text>

                    </View>

                </View>


            </View>


        )

    }


    renderContent = ()=>{


        //图片宽度

        return(


            <ScrollView ref={(scrollview)=>{this.scrollview = scrollview}}>

                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>


                    <Text onPress={()=>{
                        this.PreviewPoster();
                    }} style={{padding:10,marginRight:20,color:'#fff',fontSize:22}}>预览</Text>
                    <Text onPress={()=>{
                        this.SavePoster();
                    }} style={{padding:10,marginLeft:20,color:'#fff',fontSize:22}}>保存</Text>
                </View>

                {
                    this.store.selectIndex == 0 ?

                        this.renderMainBgForDouYin()
                        :
                        this.renderTemplateHorizontal()
                }



            </ScrollView>

        )

    }

    //导航条
    renderNavBar=()=>{
        return(
            <YQFNavBar  leftIcon={'0xe183'}
                        onLeftClick={()=>{this.props.navigator.pop()}}
                        title={'海报视频'}/>
        )
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



    renderPosterLoading = ()=>{

        if(this.store.posterLoading){
            return <ActivityIndicator toast text={'正在生成视频...'} animating={this.store.posterLoading}/>
        }

        return null;
    }

    render = ()=> {


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
                            this.SavePoster();

                            //this.screenPhoto('ToSuccess')
                        }} style={{fontSize: 20, color: 'white'}}>{'保存'}</Text>

                    </View>


                    <View accessible={false}
                          pointerEvents='none'

                    >

                        {
                            this.store.selectIndex ==0 ?

                                this.renderMainBgForDouYin()
                                : this.renderTemplateHorizontal()

                        }

                    </View>


                </View>
            )

        }

        else {


            return (

                <View style={{flex: 1, backgroundColor: 'rgb(72,74,74)'}}>
                    {this.renderNavBar()}
                    {this.renderContent()}
                    {this.renderPosterLoading()}
                    {this.renderActionSheet()}
                </View>
            )

        }

    }


}

