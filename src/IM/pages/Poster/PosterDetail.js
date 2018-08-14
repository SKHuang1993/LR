/**
 * Created by yqf on 2017/12/4.
 */

//海报详情
//海报


import {observer} from 'mobx-react/native';
import {observable, autorun, computed, extendObservable, action, toJS} from 'mobx'

import {Component} from 'react';
import React, {PropTypes} from 'react';

import {
    View,
    Text,
    Image,
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
    Switch,
    Platform,
    Dimensions,
    UIManager,
    CameraRoll,
    Alert,
} from  'react-native';

import {captureRef} from "react-native-view-shot";

// import {UIManager} from "React"

import YQFNavBar from '../../components/yqfNavBar';
import YQFEmptyView from '../../components/EmptyView';
import ActivityIndicator from '../../components/activity-indicator'


import Icon from '../../components/icon';
import {RestAPI, ServingClient} from '../../utils/yqfws';
import {Chat} from '../../utils/chat';

const window = {

    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
}


class PosterDetailModel extends Component {

    @observable myScreenImage = null;//当前的截图图片

    @observable isLoadImage = false;//背景图片是否加载完成
    @observable UserPosterList = null;
    @observable isLoading = true;
    @observable CreateRoute = null;
    @observable QRCode = null;
    @observable shareDictionary = null;//分享的dict，需要有一个url，有一个title，description。需要具备这三个值
    @observable showShare = false; //弹出分享框框
    @observable showSavePhoto = false; //弹出保存图片框

}


@observer
export  default  class PosterDetail extends Component {

    constructor(props) {
        super(props);

        this.state = {

            uri: ''
        }

        this.store = new PosterDetailModel();

        if (props.UserPosterList) {
            this.store.UserPosterList = props.UserPosterList;
        }


    }


    componentDidMount = () => {


        this._fetchData();


    }


    _fetchData = async() => {

        //1.获取用户资料
        // console.log('用户详细资料')
        // console.dir(Chat.loginUserResult);
        //2。获取二维码

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


    //新修改的(截取图片)
    _ScreenPhoto = async() => {

        var object = this.props.UserPosterList.PosterCategoryID == 1 ? this.PosterAfternoonContainer : this.PosterOtherContainer
        UIManager.takeSnapshot(object, {format: 'png', quality: 1}).then(
            (uri) => {
                // console.log('截图的结果,并将这里的结果赋给一个变量')
                // console.dir(uri);
                this.store.myScreenImage = uri;
            }
        ).catch(
            (error) => {
                // console.log('截图失败');
                // console.dir(error)
            }
        );


    }

    //新修改的(保存图片)
    _SavePhoto = async() => {

        var uri = null;
        if (this.store.myScreenImage) {
            uri = this.store.myScreenImage;
        } else {

            await this._ScreenPhoto();
        }


        var promise = CameraRoll.saveToCameraRoll(uri);

        promise.then(function (result) {

            // console.log('保存图片成功后图片')
            // console.dir(result);

            Alert.alert('保存成功');

            // alert('保存成功！地址如下：\n' + result);

        }).catch(function (error) {

            Alert.alert('保存失败');
            // alert('保存失败！\n' + error);
        });

    }


    // //截图
    screenPhoto = () => {

        //  var container =  this.props.UserPosterList.PosterCategoryID==1 ? this.PosterAfternoonContainer : this.PosterOtherContainer
        var container = this.PosterOtherContainer;

        var scrollview = this.scrollview;

        var object = container;

        if (Chat.isAndroid()) {
            captureRef(object, {format: 'png', quality: 1}).then(
                (uri) => {

                    // console.log('截图的结果')
                    // console.dir(uri);
                    var promise = CameraRoll.saveToCameraRoll(uri);

                    promise.then(function (result) {

                        // console.log('保存图片成功后图片')
                        // console.dir(result);

                        Alert.alert('保存成功');

                        // alert('保存成功！地址如下：\n' + result);

                    }).catch(function (error) {

                        Alert.alert('保存失败');
                        // alert('保存失败！\n' + error);
                    });


                }
            ).catch(
                (error) => {
                }
            );


        } else {

            UIManager.takeSnapshot(object, {format: 'png', quality: 1}).then(
                (uri) => {

                    // console.log('截图的结果')
                    // console.dir(uri);
                    var promise = CameraRoll.saveToCameraRoll(uri);

                    promise.then(function (result) {

                        // console.log('保存图片成功后图片')
                        // console.dir(result);

                        Alert.alert('保存成功');

                        // alert('保存成功！地址如下：\n' + result);

                    }).catch(function (error) {

                        Alert.alert('保存失败');
                        // alert('保存失败！\n' + error);
                    });


                }
            ).catch(
                (error) => {
                }
            );


        }


    };

    renderShowActionView = () => {

        if (this.store.showSavePhoto) {
            return (

                <ShowActionView clickItem={(shareItem) => {

                    this.store.showSavePhoto = !this.store.showSavePhoto;

                    this.screenPhoto();


                }} cancleClick={() => {

                    this.store.showSavePhoto = false;

                }}/>

            )
        }

        return null

    }


    //点击了分享的按钮
    _ClickShareItem = async(shareItem) => {


        this.store.showShare = !this.store.showShare;
        // this.store.showShare=false;


        if (shareItem.type == 'SaveToAlbum') {

            //0108重新打开，提交版本给领导测试
            this.screenPhoto();


            //0107修改
            //this._SavePhoto();

        } else {

            await this._ScreenPhoto();

            //1s后再去执行分享
            setTimeout(() => {

                Chat.ThirdShare(shareItem.type, this.props.UserPosterList.title, this.props.UserPosterList.title, 'http://img8.yiqifei.com/20171212/399aecd33ade4d709f7454b4acfa9a3c.png', this.store.myScreenImage, (result) => {

                }, (error) => {

                })
            }, 1000)


        }


    }

    renderShare = () => {


        if (this.store.showShare) {
            return (

                <ShareView clickItem={(shareItem) => {

                    this._ClickShareItem(shareItem);

                }} cancleClick={() => {

                    this.store.showShare = false;

                }}/>

            )
        }

        return null

    }

    //导航条
    renderNavBar = () => {


        return (
            <YQFNavBar leftIcon={'0xe183'}
                       rightText={'保存'}
                       onRightClick={() => {

                           this.store.showShare = true;
                       }}
                       onLeftClick={() => {
                           this.props.navigator.pop()
                       }}
                       title={this.store.UserPosterList.Title}/>
        )
    }


    //渲染午报
    _renderScreenWuBao = () => {

        var userInfo = Chat.userInfo;


        var screenW = window.width;
        var ImageW = screenW;
        var ImageH = ImageW * (1240 / 600);
        //内容框
        var contentTop = ImageH * (830 / 1240);
        var contentLeft = 0;
        var contentRight = 0;
        var contentHeight = ImageH * (150 / 1240);


        var centerInfoTop = contentHeight * (23 / 150);
        var centerInfoLeft = ImageW * (185 / 600);
        var centerInfoMargin = contentHeight * (18 / 150);


        //左边图片
        var leftImageTop = contentHeight * (15 / 150);
        var leftImageLeft = ImageW * (28 / 600);
        var leftImageWidth = ImageW * (104 / 600);
        var leftImageHeight = leftImageWidth;


        //右边图片
        var rightImageTop = ImageH * (15 / 1240);
        var rightImageRight = ImageW * (25 / 600);
        var rightImageWidth = ImageW * (96 / 600);
        var rightImageHeight = rightImageWidth;


        var qcodeImageWidth = 12;
        var qcodeImageHeight = qcodeImageWidth;

        var phone = Chat.loginUserResult.DetailInfo && Chat.loginUserResult.DetailInfo.StaffWorkPhone ? Chat.loginUserResult.DetailInfo.StaffWorkPhone : '';

        if (this.store.isLoading) {

            return <ActivityIndicator toast text={'正在加载数据...'} animating={this.store.isLoading}/>

        }


        else {

            return (

                <ScrollView ref={(scrollview) => {
                    this.scrollview = scrollview
                }} style={{width: ImageW, height: ImageH}}>

                    <TouchableOpacity onLongPress={() => {

                        this.store.showSavePhoto = true;

                    }}>


                        <Image
                            ref={(PosterAfternoonContainer) => {
                                this.PosterAfternoonContainer = PosterAfternoonContainer
                            }}

                            onLoad={() => {
                                console.log('背景图片加载完成')
                                this.store.isLoadImage = true;
                            }}
                            source={{uri: Chat.getPosterImagePath(this.store.UserPosterList.ImagePath)}}
                            style={{width: ImageW, height: ImageH, resizeMode: 'cover', backgroundColor: "#fff"}}>


                            <View style={{
                                position: 'absolute',
                                top: contentTop,
                                left: contentLeft,
                                right: contentRight,
                                height: contentHeight
                            }}>


                                <Image style={{
                                    position: 'absolute',
                                    left: leftImageLeft,
                                    top: leftImageTop,
                                    width: leftImageWidth,
                                    height: leftImageHeight,
                                    borderRadius: leftImageWidth / 2
                                }} source={{uri: Chat.getFaceUrlPath(Chat.userInfo.User.FaceUrlPath)}}>

                                </Image>


                                <View style={{position: 'absolute', left: centerInfoLeft, top: centerInfoTop}}>

                                    <Text style={{
                                        backgroundColor: 'transparent',
                                        fontSize: 10,
                                        color: 'rgb(35,113,100)'
                                    }}>{Chat.userInfo.User.Name}</Text>

                                    <Text style={{
                                        backgroundColor: 'transparent',
                                        marginTop: centerInfoMargin,
                                        fontSize: 10,
                                        color: 'rgb(35,113,100)'
                                    }}>{phone}</Text>


                                </View>

                                {

                                    this.store.QRCode ?

                                        <Image style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'absolute',
                                            right: rightImageRight,
                                            top: rightImageTop,
                                            width: rightImageWidth,
                                            height: rightImageHeight
                                        }}
                                               source={{uri: this.store.QRCode}}>


                                            <Image style={{width: qcodeImageWidth, height: qcodeImageHeight}}
                                                   source={{uri: Chat.getFaceUrlPath(Chat.userInfo.User.FaceUrlPath)}}>


                                            </Image>

                                        </Image>

                                        :
                                        null


                                }


                            </View>

                        </Image>
                    </TouchableOpacity>
                </ScrollView>

            )
        }


    }


    //渲染要用来截图的(已经算好了比例)
    _renderScreen = () => {


        var screenW = window.width;


        var ImageW = screenW;
        var imageHeight = 1000;
        var imageWidth = 569;
        var ImageH = ImageW * (imageHeight / imageWidth);


        var contentTop = ImageH * (826 / imageHeight);
        var contentLeft = 0;
        var contentRight = 0;
        var contentHeight = ImageH * (125 / imageHeight);


        var centerInfoTop = contentHeight * (63 / 125);
        var centerInfoLeft = ImageW * (170 / imageWidth);
        var centerInfoMargin = contentHeight * (13 / 125);


        //左边图片
        var leftImageTop = contentHeight * (15 / 125);
        var leftImageLeft = ImageW * (32 / imageWidth);
        var leftImageWidth = ImageW * (96 / imageWidth);
        var leftImageHeight = leftImageWidth;


        //右边图片
        var rightImageTop = 0;
        var rightImageRight = ImageW * (57 / imageWidth);
        var rightImageWidth = ImageW * (128 / imageWidth);
        var rightImageHeight = rightImageWidth;

        var qcodeImageWidth = ImageW * (26 / imageWidth);
        var qcodeImageHeight = qcodeImageWidth;


        var name = Chat.getLRUserName()
        var phone = Chat.getLRStaffWorkPhone()
        var FaceUrlPath = Chat.getLRUserFaceUrl()


        if (this.store.isLoading) {

            return <ActivityIndicator toast text={'正在加载数据...'} animating={this.store.isLoading}/>

        }


        else {

            return (

                <ScrollView ref={(scrollview) => {
                    this.scrollview = scrollview
                }} style={{width: ImageW, height: ImageH}}>

                    <TouchableOpacity onLongPress={() => {

                        this.store.showSavePhoto = true;

                    }}>
                        <Image
                            ref={(PosterOtherContainer) => {
                                this.PosterOtherContainer = PosterOtherContainer
                            }}

                            source={{uri: Chat.getPosterImagePath(this.store.UserPosterList.ImagePath)}}
                            style={{width: ImageW, height: ImageH, resizeMode: 'cover', backgroundColor: "#fff"}}>


                            {this.props.IsShow == true ?

                                <View style={{
                                    position: 'absolute',
                                    top: contentTop,
                                    left: contentLeft,
                                    right: contentRight,
                                    height: contentHeight
                                }}>

                                    <Image style={{
                                        position: 'absolute',
                                        left: leftImageLeft,
                                        top: leftImageTop,
                                        width: leftImageWidth,
                                        height: leftImageHeight
                                    }}
                                           source={{uri: FaceUrlPath}}>

                                    </Image>


                                    <View style={{position: 'absolute', left: centerInfoLeft, top: centerInfoTop}}>

                                        <Text style={{
                                            backgroundColor: 'transparent',
                                            fontSize: 12,
                                            color: 'rgb(35,113,100)'
                                        }}>{name}</Text>
                                        <Text style={{
                                            backgroundColor: 'transparent',
                                            marginTop: centerInfoMargin,
                                            fontSize: 10,
                                            color: 'rgb(35,113,100)'
                                        }}>{phone}</Text>
                                    </View>

                                    {

                                        this.store.QRCode ?

                                            <Image style={{
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'absolute',
                                                right: rightImageRight,
                                                top: rightImageTop,
                                                width: rightImageWidth,
                                                height: rightImageHeight
                                            }}
                                                   source={{uri: this.store.QRCode}}>


                                                <Image style={{width: qcodeImageWidth, height: qcodeImageHeight}}
                                                       source={{uri: FaceUrlPath}}>


                                                </Image>

                                            </Image>

                                            :
                                            null


                                    }


                                </View>
                                :
                                null

                            }


                        </Image>
                    </TouchableOpacity>
                </ScrollView>

            )
        }

    }

    //渲染自定义海报
    _renderCustomScreen = () => {


        var userInfo = Chat.userInfo;

        var screenW = window.width;
        var scale = 588 / 997;


        var ImageW = screenW;
        var ImageH = ImageW * (997 / 588);


        //内容框
        var contentTop = ImageH * (624 / 997);
        var contentLeft = 0;
        var contentRight = 0;
        var contentHeight = ImageH * (140 / 997);


        var centerInfoTop = contentHeight * (70 / 140);
        var centerInfoLeft = ImageW * (180 / 588);
        var centerInfoMargin = contentHeight * (10 / 140);

        //左边图片
        var leftImageTop = contentHeight * (20 / 140);
        var leftImageLeft = ImageW * (35 / 588);
        var leftImageWidth = ImageW * (104 / 588);
        var leftImageHeight = leftImageWidth;


        //右边图片
        var rightImageTop = 0;
        var rightImageRight = ImageW * (57 / 588);
        var rightImageWidth = ImageW * (134 / 588);
        var rightImageHeight = rightImageWidth;

        var qcodeImageWidth = ImageW * (26 / 588);
        var qcodeImageHeight = qcodeImageWidth;

        var phone = Chat.loginUserResult.DetailInfo && Chat.loginUserResult.DetailInfo.StaffWorkPhone ? Chat.loginUserResult.DetailInfo.StaffWorkPhone : '';


        if (this.store.isLoading) {

            return <ActivityIndicator toast text={'正在加载数据...'} animating={this.store.isLoading}/>

        }


        else {

            return (

                <ScrollView ref={(scrollview) => {
                    this.scrollview = scrollview
                }} style={{width: ImageW, height: ImageH}}>

                    <TouchableOpacity onLongPress={() => {
                        this.store.showSavePhoto = true;

                    }}>

                        <Image
                            ref={(PosterOtherContainer) => {
                                this.PosterOtherContainer = PosterOtherContainer
                            }}

                            source={{uri: Chat.getPosterImagePath(this.store.UserPosterList.ImagePath)}}
                            style={{width: ImageW, height: ImageH, resizeMode: 'cover', backgroundColor: "#fff"}}>


                        </Image>
                    </TouchableOpacity>
                </ScrollView>

            )
        }

    }

    renderDetail = () => {


        console.log("传递过了的" + this.props.UserPosterList.PosterCategoryID)


        //午报
        if (this.props.UserPosterList.PosterCategoryID == 1) {
            return this._renderScreen();
        }

        //自定义海报
        else if (this.props.UserPosterList.PosterCategoryID == 5) {
            return this._renderCustomScreen()
        }

        //早 晚  团票宝
        else {
            return this._renderScreen();
        }

    }


    render = () => {

        return (

            <View style={{flex: 1, backgroundColor: 'rgb(82,84,106)'}}>


                {this.renderNavBar()}

                {this.renderDetail()}

                {this.renderShare()}

                {this.renderShowActionView()}


            </View>
        )

    }

}


// var shareDatas=[
//
//     {title:'0xe62a',info:'保存到本地',showColr:'rgb(38,203,114)',type:'SaveToAlbum',uri:require('../../image/login/downLoad.png')},
//     {title:'0xe62a',info:'微信好友',showColr:'rgb(38,203,114)',type:'WechatSession',uri:require('../../image/login/Wechat.png')},
//     {title:'0xe655',info:'微信朋友圈',showColr:'rgb(38,203,114)',type:'WechatTimeline',uri:require('../../image/login/friend.png')},
//     {title:'0xe628',info:'QQ',showColr:'rgb(233,80,63)',type:'QQ',uri:require('../../image/login/QQ.png')},
//     {title:'0xe625',info:'新浪微博',showColr:'rgb(90,172,226)',type:'SinaWeibo',uri:require('../../image/login/SinaWeibo.png')},
// ]


var shareDatas = [

    {
        title: '0xe62a',
        info: '保存到本地',
        showColr: 'rgb(38,203,114)',
        type: 'SaveToAlbum',
        uri: require('../../image/login/downLoad.png')
    },
]


class ShareView extends Component {


    constructor(props) {
        super(props);
        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2,
                sectionHeaderHasChanged: (s1, s2) => s1 !== s2
            }),
        };
    }


    render() {
        return (

            <View style={[styles.mediaMain]}>
                <TouchableOpacity style={styles.mediaBG}
                                  onPress={() => {

                                      this.props.cancleClick();
                                  }}
                >


                </TouchableOpacity>
                <View style={styles.mainShare}>
                    <ListView dataSource={this.state.dataSource.cloneWithRows(shareDatas)}
                              renderRow={this.renderShare.bind(this)}
                              horizontal={true}
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={styles.list}
                              style={styles.listStyle}


                    >

                    </ListView>
                    <TouchableWithoutFeedback style={styles.shareCancle} onPress={() => {
                        this.props.cancleClick();
                    }}>
                        <Text style={styles.shareCancleInfo}>取消</Text>
                    </TouchableWithoutFeedback>
                </View>

            </View>

        );
    }

    renderShare(shareItem, sectionId, rowId) {
        return (
            <TouchableOpacity style={styles.shareItem} onPress={() => {
                this.props.clickItem(shareItem);
            }}>
                <Image source={shareItem.uri} style={styles.loginWayItem}></Image>
                <Text style={styles.shareInfo}>{shareItem.info}</Text>
            </TouchableOpacity>
        )
    }


}


class ShowActionView extends Component {


    constructor(props) {
        super(props);

        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2,
                sectionHeaderHasChanged: (s1, s2) => s1 !== s2
            }),
        };
    }


    render() {
        return (

            <View style={[styles.mediaMain]}>
                <TouchableOpacity style={styles.mediaBG}
                                  onPress={() => {

                                      this.props.cancleClick();
                                  }}
                >


                </TouchableOpacity>
                <View style={styles.mainShare}>
                    <ListView dataSource={this.state.dataSource.cloneWithRows(['保存到相册'])}
                              renderRow={this.renderShare.bind(this)}
                              horizontal={true}
                              showsHorizontalScrollIndicator={false}
                              style={{width: window.width}}
                              renderSeparator={() => this._renderSeparator()}


                    >

                    </ListView>
                    <TouchableWithoutFeedback style={styles.shareCancle} onPress={() => {
                        this.props.cancleClick();
                    }}>
                        <Text style={styles.shareCancleInfo}>取消</Text>
                    </TouchableWithoutFeedback>
                </View>


            </View>

        );
    }


    //渲染分割线
    _renderSeparator() {
        return (<View key={''} style={{backgroundColor: "#666666", height: 0.5}}/>);
    }


    renderShare(item, sectionId, rowId) {
        return (


            <TouchableOpacity style={{
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                width: window.width
            }} onPress={() => {
                this.props.clickItem(item);
            }}>
                <Text style={{fontSize: 20, color: 'rgb(51,51,51)', padding: 10}}>{'保存到相册'}</Text>


            </TouchableOpacity>


        )
    }


}


const styles = StyleSheet.create({


    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(240,240,240)',
    },
    button: {
        marginBottom: 10,
        fontWeight: '500',
    },
    image: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
        backgroundColor: 'black',
    },


    itemStyle: {
        // 对齐方式
        alignItems: 'center',
        justifyContent: 'center',
        // 尺寸
        width: 90,
        height: 150,
        // 左边距
        margin: 5,
        marginBottom: 0,

    },

    itemImageStyle: {
        // 尺寸
        width: 90,
        height: 150,

    },
    mediaMain: {
        flex: 1,

        position: 'absolute',
        width: window.width,
        height: window.height,

        top: 56,
        left: 0,
    },

    mediaBG: {
        top: 0,
        left: 0,
        width: window.width,
        height: window.height,
        backgroundColor: 'rgba(0,0,0,0.6)',

    },
    mediaShow: {
        position: 'absolute',
        width: window.width,
        top: window.height,
        // top:220,
        left: 0,
    },


    mediaItem: {
        borderBottomColor: 'rgb(240,240,240)',
        borderBottomWidth: 1,
        backgroundColor: 'white',


    },
    mediaInfo: {
        textAlign: 'center',
        fontSize: 18,
        padding: 15,
    },

    mainShare: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 45,
        justifyContent: 'center',
    },

    shareItem: {
        flexDirection: 'column',
        //justifyContent:'center',
        alignItems: 'center',
        //backgroundColor:'blue',
        //margin:8,


    },
    listStyle: {
        paddingLeft: 25,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: 'rgb(240,240,240)',


    },
    list: {
        flexDirection: 'row',
        // alignItems:'center',
        // flexWrap:'wrap',
    },


    shareInfo: {

        fontSize: 12,
        paddingBottom: 5,
        // color:'white',


    },
    shareCancle: {

        borderTopWidth: 1,
        borderTopColor: 'rgb(240,240,240)',
    },
    shareCancleInfo: {
        //flex:1,
        //width:Common.window.width,
        //height:45,

        padding: 20,
        textAlign: 'center',
        backgroundColor: 'white',
        fontSize: 18,
        color: '#999',
    },

    loginWayItem: {
        margin: 10,
        width: 45,
        height: 45,
        //marginBottom:30,
    },


})

