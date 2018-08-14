/**
 * Created by yqf on 2017/12/5.
 */

//视频详情
/**
 * Created by yqf on 2017/12/5.
 */

import {observer} from 'mobx-react/native';
import {observable, autorun, computed, extendObservable, action, toJS} from 'mobx'

import {Component} from 'react';
import React, {PropTypes} from 'react';
import Video from 'react-native-video';
import Myplayer from '../../components/Myplayer'

import {
    Slider,//进度条
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
    RefreshControl,
    Alert,

} from  'react-native';

import YQFNavBar from '../../components/yqfNavBar';
import Button from '../../components/Button';
import Icon from '../../components/icon';
import {Chat} from '../../utils/chat';
import {RestAPI, ServingClient} from '../../utils/yqfws';
import Colors from '../../Themes/Colors';
import Search from '../Contact/FriendSearch';
import EditData from '../../components/editData';
import    ActivityIndicator from '../../components/activity-indicator';
import Enumerable from 'linq';
import VideoCommentList  from './VideoCommentList';
import VideoPlayList  from './VideoPlayList';
import VideoSearch  from './VideoSearch';

const window = {

    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,

}


class VideoDetailModel extends Component {
    @observable rate = 1; //代表播放

    @observable  videoUrl = null;
    @observable  paused = false;
    @observable  showPause = true;
    @observable  duration = 0.0;//总时长
    @observable  currentTime = 0.0;//当前时长

    @observable sliderValue = 0;//滑块的值，代表一个进度
    @observable file_duration = 0;////歌曲长度
    @observable muted = false;////false表示正常，true代表静音

    @observable showVideoToolBar = true; //是否显示工具条

    @observable isLoading = true;//是否显示loading

    @observable videoDetail = {};//视频详情

    @observable Flag = false;//是否点过赞


    @observable canLoadVideoMore = false;//是否能加载更多
    @observable isVideoRefreshing = false;
    @observable RowCount = 0;

    @observable VideoLists = [];

    @observable VideoComments = [];//视频评论列表
    @observable VideoPlays = [];
    视频播放列表


    @observable totalVideoComments = [];//总视频评论列表
    @observable totalVideoPlays = [];
    总视频播放列表


    @computed get getVideoCommentsDataSource() {

        ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return ds.cloneWithRows(this.VideoComments.slice());
    }

    @computed get getVideoPlaysDataSource() {

        ds1 = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return ds1.cloneWithRows(this.VideoPlays.slice());
    }


    @computed get getDataSource() {


        ds3 = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return ds3.cloneWithRows(this.VideoLists.slice());
    }


}


@observer
export  default  class VideoDetail extends Component {

    constructor(props) {
        super(props);
        this.store = new VideoDetailModel();
        this.store.videoDetail.ID = props.videoDetail.ID;

    }

    componentDidMount = () => {
        this._fetchData();
    }


    _ToEditData = () => {
        this.props.navigator.push({

            component: EditData,
            passProps: {

                placeholder: '请发表你的评论',
                title: '新增视频评论',
                getDetail: (content) => {

                    this.VideoCommentAdd(content)

                }
            }

        })
    }
    //发表评论
    VideoCommentAdd = async(Content) => {


        var VideoCommentAddParam = {
            VideoID: this.store.videoDetail.ID,
            UserCode: Chat.loginUserResult.AccountNo,
            PersonCode: Chat.loginUserResult.PersonCode,
            Content: Content
        };


        var CommentAddResult = await  ServingClient.execute('Channel.VideoCommentAdd', VideoCommentAddParam);

        if (CommentAddResult.ID) {

            this.VideoCommentByVideoID();

            Alert.alert('发表评论成功')
        }


    }
    CheckVideoVote = async() => {

        console.warn('CheckVideoVote 写死IP,写死我的账号')

        var CheckVideoVoteParam = {
            VideoID: this.store.videoDetail.ID,
            VoteTypeID: 1,
            IP: '192.168.31.28',
            VoterUserCode: Chat.loginUserResult.PersonCode

        };

        var CheckVideoVoteResult = await  ServingClient.execute('Channel.CheckVideoVote', CheckVideoVoteParam);

        if (CheckVideoVoteResult) {
            // alert(CheckVideoVoteResult.Flag)
            this.store.Flag = CheckVideoVoteResult.Flag;
        }

    }
    VideoPlayByVideoID = async() => {

        //获取视频播放记录
        var VideoPlayByVideoIDParam = {
            VideoID: this.store.videoDetail.ID,
            PageSize: 100
        };
        var VideoPlaysResult = await  ServingClient.execute('Channel.VideoPlayByVideoID', VideoPlayByVideoIDParam);

        if (VideoPlaysResult && VideoPlaysResult.VideoPlays && VideoPlaysResult.VideoPlays.length > 0) {

            this.store.totalVideoPlays = VideoPlaysResult.VideoPlays;
            this.store.VideoPlays = Enumerable.from(VideoPlaysResult.VideoPlays).takeFromLast(6).toArray();

        }
    }
    VideoCommentByVideoID = async() => {

        //获取视频评论列表
        var VideoCommentByVideoIDParam = {
            VideoID: this.store.videoDetail.ID,
            PageSize: 100
        };

        var VideoCommentsResult = await  ServingClient.execute('Channel.VideoCommentByVideoID', VideoCommentByVideoIDParam);

        if (VideoCommentsResult && VideoCommentsResult.VideoComments && VideoCommentsResult.VideoComments.length > 0) {

            this.store.totalVideoComments = VideoCommentsResult.VideoComments;
            this.store.VideoComments = Enumerable.from(VideoCommentsResult.VideoComments).takeFromLast(2).toArray();
        }
    }
    VideoByIDGet = async() => {

        //获取视频评论列表
        var VideoByIDGetParam = {
            ID: this.store.videoDetail.ID,
        };

        var VideoByIDGetResult = await  ServingClient.execute('Channel.VideoByIDGet', VideoByIDGetParam);


        // console.log('VideoByIDGetResult --视频详情')
        // console.dir(VideoByIDGetResult);


        if (VideoByIDGetResult && VideoByIDGetResult.VideoDetail) {
            this.store.videoDetail = VideoByIDGetResult.VideoDetail;

            var VideoUrls = this.store.videoDetail.OutVideoDetail.ImageVideo.VideoUrls;


            if (VideoUrls) {

                for (var i = 0; i < VideoUrls.length; i++) {
                    if (VideoUrls[i].Definition == 30) {
                        this.store.videoUrl = VideoUrls[i].Url;
                        break;
                    }
                }

            }


        }


    }
    _fetchData = async() => {



        //获取视频详情
        this.VideoByIDGet();

        //验证点赞
        this.CheckVideoVote();

        //获取视频播放记录
        this.VideoPlayByVideoID();

        this.VideoCommentByVideoID();


    }

    _renderLine() {

        return (
            <View style={{backgroundColor:'rgb(235,235,235)',height:1,}}></View>
        )
    }


    //换歌时恢复进度条 和起始时间
    recover = () => {


        this.store.sliderValue = 0.0;//设置滑块最小值
        this.store.currentTime = 0.0;//设置当前时间为0


    }

    renderPlayLogItem = (PlayLog) => {

        var url = 'http://m.yiqifei.com/userimg/' + PlayLog.UserCode + '/3'

        return (
            <TouchableOpacity activeOpacity={.7} onPress={()=>{}} style={styles.actionItem}>

                <Image style={{width:50,height:50,borderRadius:25}} source={{uri:url}}>
                </Image>
                <Text style={styles.actionText}>{PlayLog.PersonName}</Text>

            </TouchableOpacity>
        )


    }
    //b播放记录
    renderPlayLog = () => {

        var contentViewStyle = {
            flexDirection: 'row',
        }

        if (this.store.VideoPlays.length > 0) {

            return (

                <View style={{marginTop:10,backgroundColor:'white'}}>

                    <TouchableOpacity onPress={()=>{

                       this._ToPlayList();
                   }} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>


                        <Text
                            style={{padding:10,fontSize:16,color:'rgb(51,51,51)'}}>{'播放记录' + '(' + this.store.totalVideoPlays.length + ')' + ':'}
                        </Text>

                        <Icon style={{marginRight:10}} icon={'0xe177'} size={20} />

                    </TouchableOpacity>

                    <ListView
                        style={{backgroundColor:'white'}}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        renderRow={this.renderPlayLogItem}
                        dataSource={this.store.getVideoPlaysDataSource}
                        contentContainerStyle={contentViewStyle}>

                    </ListView>
                </View>
            )
        }
        return null;

    }

    renderCommentItem = (Comment) => {


        var imageW = 50;
        var imageH = imageW;
        var margin = 10;
        var url = 'http://m.yiqifei.com/userimg/' + Comment.UserCode + '/3'


        return (
            <View
                style={[{margin:0,backgroundColor:'white'}]}>

                <View style={{flexDirection:'row'}}>


                    <Image
                        style={{width:imageW,height:imageH,resizeMode:'cover',borderRadius:imageW/2,margin:margin}}
                        source={{uri:url}}>
                    </Image>


                    <View style={{}}>

                        <View style={{flexDirection:'row',alignItems:'center',marginTop:margin}}>
                            <Text
                                style={{color:Colors.colors.Chat_Color51,fontSize:13,marginTop:0}}>{Comment.PersonName}</Text>
                            <Text
                                style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:0,marginLeft:10}}>{Chat.showDate(Comment.CreateDate)}</Text>
                        </View>

                        <Text
                            style={{color:Colors.colors.Chat_Color153,fontSize:13,marginTop:margin}}>{Comment.Content}</Text>

                    </View>


                </View>

                {this._renderLine()}

            </View>
        )
    }


    _ToPlayList = () => {
        this.props.navigator.push({
            component: VideoPlayList,
            passProps: {
                VideoPlayLists: this.store.totalVideoPlays
            }
        })
    }

    _ToVideoComments = () => {
        this.props.navigator.push({
            component: VideoCommentList,
            passProps: {
                VideoComments: this.store.totalVideoComments
            }
        })
    }

    //评论列表
    renderCommentList = () => {

        if (this.store.VideoComments.length > 0) {

            return (
                <ListView
                    renderHeader={()=>{return(


                       <TouchableOpacity onPress={()=>{

                       this._ToVideoComments();


                   }} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>


               <Text style={{padding:10,fontSize:16,color:'rgb(51,51,51)'}}>{'评论列表'+'('+this.store.totalVideoComments.length+')'+':'}
               </Text>

                   <Icon style={{marginRight:10}} icon={'0xe177'} size={20} />

               </TouchableOpacity>
               )



                    }}

                    style={{marginTop:10,backgroundColor:'white'}}
                    renderRow={this.renderCommentItem}
                    dataSource={this.store.getVideoCommentsDataSource}
                >
                </ListView>
            )
        }
        return null;


    }


    renderDetail = () => {


        var Title = this.store.videoDetail.Title;
        var LabelDisplay = '标签:' + this.store.videoDetail.LabelDisplay;
        var Intro = this.store.videoDetail.Intro ? '视频介绍: ' + this.store.videoDetail.Intro : null;
        var PersonName = '上传者:' + this.store.videoDetail.PersonName;
        var PlayCount = '已播放' + this.store.videoDetail.PlayCount + '次';

        var margin = 10;
        var titleMaxWidth = window.width - margin * 3;

        return (
            <View
                style={[{margin:0,backgroundColor:'white'}]}>

                <View style={{margin:10}}>

                    {
                        PersonName ?
                            <Text numberOfLines={1}
                                  style={{ color:Colors.colors.Chat_Color51,fontSize:16,marginTop:margin,maxWidth:titleMaxWidth}}>{Title}</Text>
                            :
                            null
                    }

                    <Text
                        style={{color:Colors.colors.Chat_Color153,fontSize:14,marginTop:5}}>{PersonName + '   ' + PlayCount}</Text>
                    {
                        Intro ?
                            <Text
                                style={{color:Colors.colors.Chat_Color153,fontSize:14,marginTop:5,marginRight:margin}}>{Intro}</Text>
                            :
                            null
                    }


                </View>

            </View>

        )

    }


    //导航条
    renderNavBar = () => {
        return (
            <YQFNavBar leftIcon={'0xe183'}
                       rightText={this.store.Flag}
                       onLeftClick={()=>{this.props.navigator.pop()}}
                       title={'视频详情'}/>
        )
    }

    renderLoading = () => {


        if (this.store.isLoading) {

            return (
                <ActivityIndicator toast text={'正在加载中...'} animating={true}/>
            )
        }

        return null;

    }

    renderPlusComment = () => {

        return (

            <View style={{position:'absolute',left:0,right:0,bottom:0,height:49}}>

                <Button titleColor={'white'} backgroundColor={Colors.colors.LR_Color} title={'发表评论'} onPress={()=>{

                this._ToEditData();
            }}/>
            </View>
        )

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


    //设置静音


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

    renderVideoPlayer = () => {

        if (this.store.videoUrl) {

            return (

                <View>
                    <TouchableOpacity onPress={()=>{
                    this.store.showVideoToolBar = !this.store.showVideoToolBar
                }}>


                        <Video
                            ref={(player)=>{this.player = player}}
                            source={{uri:this.store.videoUrl}} // 视频的URL地址，或者本地地址，都可以.
                            rate={1}                   // 控制暂停/播放，0 代表暂停paused, 1代表播放normal.
                            volume={1.0}                 // 声音的放声音的放大倍数大倍数，0 代表没有声音，就是静音muted, 1 代表正常音量 normal，更大的数字表示放大的倍数
                            muted={this.store.muted}                // .....暂时将音量设置为静音，很吵 true代表静音，默认为false..
                            paused={this.store.paused}               // true代表暂停，默认为false
                            resizeMode="contain"           // 视频的自适应伸缩铺放行为，contain、stretch、cover
                            repeat={false}                // 是否重复播放
                            playInBackground={false}     // 当app转到后台运行的时候，播放是否暂停
                            playWhenInactive={false}     // [iOS] Video continues to play when control or notification center are shown. 仅适用于IOS
                            onLoadStart={this.loadStart} // 当视频开始加载时的回调函数
                            onLoad={(e)=>{this.onLoad(e)}}    // 当视频加载完毕时的回调函数
                            onProgress={(e)=>{this.onProgress(e)}}    //  进度控制，每250ms调用一次，以获取视频播放的进度
                            onEnd={this.onEnd}           // 当视频播放完毕后的回调函数
                            onError={this.videoError}    // 当视频不能加载，或出错后的回调函数
                            style={{width:window.width,height:250}}
                        >


                        </Video>
                    </TouchableOpacity>
                    {this.renderPleyerUI()}

                </View>
            )
        }

        return null

    }

    renderPleyerUI = () => {

        if (this.store.showVideoToolBar)




            return (

                <View
                    style={{justifyContent:'space-between', alignItems:'center',flexDirection:'row', position:'absolute',height:50,width:window.width, backgroundColor:'rgba(0,0,0,0.7)',bottom:0, left:0,right:0}}>

                    <Icon
                        icon={this.store.paused ? '0xe6cd' : '0xe6cf'}
                        color={'white'}
                        style={{marginLeft:10,marginRight:10}}
                        size={20}
                        onPress={()=>{
                   this.store.paused = !this.store.paused;

                }}/>


                    <Slider
                        ref='slider'
                        style={{ marginRight: 10,width:150}}
                        value={this.store.sliderValue}
                        maximumValue={this.store.duration}
                        step={1}
                        minimumTrackTintColor='#FFDB42'
                        onValueChange={(value) => {

                        {/*console.log('onValueChange onValueChange onValueChange')*/}
                        {/*console.dir(value);*/}


                        this.store.currentTime = value;

                                        }
                                    }
                        onSlidingComplete={(value) => {

                                         this.player.seek(value)
                                    }}
                    />


                    <Text style={{color:'white'}}>{this.formatTime(Math.floor(this.store.currentTime))}
                        / {this.formatTime(Math.floor(this.store.duration))}</Text>

                    <Icon
                        icon={this.store.muted ? '0xe6d6' : '0xe6d0'}
                        color={'white'}
                        style={{marginLeft:10,marginRight:10}}
                        size={20}
                        onPress={()=>{
                        this.store.muted = !this.store.muted

                }}/>


                    <Icon
                        icon={'0xe6d2'}
                        color={'white'}
                        size={20}
                        style={{marginLeft:10,marginRight:10}}
                        onPress={()=>{

                        this.store.paused = true

                   this.fullScreen()
                }}/>


                </View>

            )

        return null

    }


    render = () => {

        return (

            <View style={{flex:1,backgroundColor:'rgb(235,235,235)'}}>

                {this.renderNavBar()}


                <ScrollView style={{marginBottom:20}}>

                    {this.renderVideoPlayer()}

                    {this.renderDetail()}

                    {this.renderPlayLog()}
                    {this.renderCommentList()}

                </ScrollView>

                {this.renderPlusComment()}


                {this.renderLoading()}

            </View>
        )


    }

}


const styles = StyleSheet.create({

    actionItem: {
        alignItems: 'center',
        justifyContent: "center",
        // width:window.width/4,
        margin: 10,
        backgroundColor: 'white'
    },


    actionIcon: {

        fontSize: 20,
        color: '#fff'

    },
    actionText: {
        fontSize: 15,
        color: 'rgb(51,51,51)',
        marginTop: 10
    },


})
