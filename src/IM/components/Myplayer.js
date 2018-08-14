/**
 * Created by yqf on 17/3/28.
 */
/**
 * Created by yqf on 17/3/28.
 */

import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ListView,
    ScrollView,
    TouchableOpacity,
    InteractionManager,
    Switch,
    TextInput,
    Dimensions
} from  'react-native';


// import Utils from '../common/utils';


import Video from 'react-native-video';


const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}

class MyPlayer extends React.Component{
    // 构造




    constructor(props) {
        super(props);
        this.onLoad = this.onLoad.bind(this);
        this.onProgress = this.onProgress.bind(this);
        this.onBuffer = this.onBuffer.bind(this);
        // 初始状态
        this.state = {
            rate: 1,
            volume: 1,
            muted: false,
            resizeMode: 'contain',
            duration: 0.0,
            currentTime: 0.0,
            controls: false,
            paused: true,
            showPause:true,

            skin: 'custom',
            isBuffering: false,

            playUrl:this.props.playUrl,

            isFull:false,

        };
    }
    componentDidMount() {
        this.renderPlayer();
    }


    renderPlayer()
    {
        if(this.state.playUrl==null)
        {
            // console.log(this.props.videoFileID);

            // Utils.getVodPlayUrls(this.props.videoFileID,(response)=>{
            //
            //     this.setState({
            //         playUrl:response.realPath,
            //     })
            // },(error)=>{
            //     console.log('error'+error);
            // })
        }

    }


    onLoad(data) {

        // console.log('On load fired!');
        this.setState({duration: data.duration});
    }


    onProgress(data) {

        this.setState({currentTime: data.currentTime});
    }

    onBuffer({ isBuffering }: { isBuffering: boolean }) {
        this.setState({ isBuffering });
    }

    getCurrentTimePercentage() {
        if (this.state.currentTime > 0) {
            return parseFloat(this.state.currentTime) / parseFloat(this.state.duration);
        } else {
            return 0;
        }
    }

    renderSkinControl(skin) {
        const isSelected = this.state.skin == skin;
        const selectControls = skin == 'native' || skin == 'embed';
        return (
            <TouchableOpacity onPress={() => { this.setState({
          controls: selectControls,
          skin: skin
        }) }}>
                <Text style={[styles.controlOption, {fontWeight: isSelected ? "bold" : "normal"}]}>
                    {skin}
                </Text>
            </TouchableOpacity>
        );
    }

    renderRateControl(rate) {
        const isSelected = (this.state.rate == rate);

        return (
            <TouchableOpacity onPress={() => { this.setState({rate: rate}) }}>
                <Text style={[styles.controlOption, {fontWeight: isSelected ? "bold" : "normal"}]}>
                    {rate}x
                </Text>
            </TouchableOpacity>
        )
    }

    renderResizeModeControl(resizeMode) {
        const isSelected = (this.state.resizeMode == resizeMode);

        return (
            <TouchableOpacity onPress={() => { this.setState({resizeMode: resizeMode}) }}>
                <Text style={[styles.controlOption, {fontWeight: isSelected ? "bold" : "normal"}]}>
                    {resizeMode}
                </Text>
            </TouchableOpacity>
        )
    }


    renderVolumeControl(volume) {
        const isSelected = (this.state.volume == volume);

        return (
            <TouchableOpacity onPress={() => { this.setState({volume: volume}) }}>
                <Text style={[styles.controlOption, {fontWeight: isSelected ? "bold" : "normal"}]}>
                    {volume * 100}%
                </Text>
            </TouchableOpacity>
        )
    }

    renderCustomSkin() {

        const flexCompleted = this.getCurrentTimePercentage() * 100;
        const flexRemaining = (1 - this.getCurrentTimePercentage()) * 100;
        // source={{uri:'http://200037007.vod.myqcloud.com/200037007_75044f14136d11e7803ddb993c731d7f.f20.mp4'}}
        return (

            <View style={styles.container}>

                <TouchableOpacity style={styles.fullScreen} onPress={() => {
                                                                                            this.setState({
                                                                                                paused: !this.state.paused,
                                                                                                showPause:true,
                                                                                            })}
                                                                                        }>
                    <Video
                        source={{uri:this.state.playUrl}}
                        style={styles.fullScreen}
                        rate={this.state.rate}
                        paused={this.state.paused}
                        volume={this.state.volume}
                        muted={this.state.muted}
                        resizeMode={this.state.resizeMode}
                        onLoad={this.onLoad}
                        onBuffer={this.onBuffer}
                        onProgress={this.onProgress}
                        onEnd={() => {
                                                    this.setState({
                                                        showPause:true,
                                                    })
                                     }}
                        repeat={false}
                    />
                </TouchableOpacity>

                {/*  <View style={styles.controls}>
                 <View style={styles.generalControls}>
                 <View style={styles.skinControl}>
                 {this.renderSkinControl('custom')}
                 {this.renderSkinControl('native')}
                 {this.renderSkinControl('embed')}
                 </View>
                 </View>
                 <View style={styles.generalControls}>
                 <View style={styles.rateControl}>
                 {this.renderRateControl(0.5)}
                 {this.renderRateControl(1.0)}
                 {this.renderRateControl(2.0)}
                 </View>

                 <View style={styles.volumeControl}>
                 {this.renderVolumeControl(0.5)}
                 {this.renderVolumeControl(1)}
                 {this.renderVolumeControl(1.5)}
                 </View>

                 <View style={styles.resizeModeControl}>
                 {this.renderResizeModeControl('cover')}
                 {this.renderResizeModeControl('contain')}
                 {this.renderResizeModeControl('stretch')}
                 </View>
                 </View>

                 <View style={styles.trackingControls}>
                 <View style={styles.progress}>
                 <View style={[styles.innerProgressCompleted, {flex: flexCompleted}]} />
                 <View style={[styles.innerProgressRemaining, {flex: flexRemaining}]} />
                 </View>
                 </View>
                 </View>*/}









                <View style={styles.navigatorBar}>
                    <Text style={styles.navigatorTitle}
                          numberOfLines={1}
                          ellipsizeMode='tail'
                    >
                        {this.props.navigationTitle}
                    </Text>
                    <TouchableOpacity style={styles.navigatorBack}
                                      onPress={() =>{
                                          this.props.navigator.pop()
                                      }}
                                      key="navigatorBack"
                    >
                        <Text style={styles.navigatorBackItem}>{String.fromCharCode('0xe183')}</Text>
                    </TouchableOpacity>


                    <TouchableOpacity style={styles.navigatorRight}
                                      onPress={() =>{

/*
                                          if(this.state.isFull)
                                          {
                                              this.state.isFull=false;
                                              this.setState({
                                                  resizeMode: 'contain'
                                              });


                                          }
                                          else
                                          {
                                              this.state.isFull=true;
                                               this.setState({
                                                  resizeMode: 'cover'
                                              });

                                          }
                                          */



                                      }}
                                      key="navigatorRight"
                    >

                    </TouchableOpacity>
                </View>


                {
                    this.state.showPause ?
                        <View style={styles.playPreview}>
                            <Text style={styles.playIcon}
                                  onPress={()=>{
                                        this.setState({
                                            paused:false,
                                            showPause:false,
                                        })
                                    }}
                            >
                                {String.fromCharCode('0xe6cd')}
                            </Text>
                        </View>:
                        null
                }


            </View>
        );
    }


    renderNativeSkin() {


        const videoStyle = this.state.skin == 'embed' ? styles.nativeVideoControls : styles.fullScreen;
        return (
            <View style={styles.container}>
                <View style={styles.fullScreen}>
                    <Video
                        source={{uri:'http://'}}
                        style={videoStyle}
                        rate={this.state.rate}
                        paused={this.state.paused}
                        volume={this.state.volume}
                        muted={this.state.muted}
                        resizeMode={this.state.resizeMode}
                        onLoad={this.onLoad}
                        onBuffer={this.onBuffer}
                        onProgress={this.onProgress}
                        onEnd={() => { AlertIOS.alert('Done!') }}
                        repeat={true}
                        controls={this.state.controls}
                    />
                </View>
                <View style={styles.controls}>
                    <View style={styles.generalControls}>
                        <View style={styles.skinControl}>
                            {this.renderSkinControl('custom')}
                            {this.renderSkinControl('native')}
                            {this.renderSkinControl('embed')}
                        </View>
                    </View>
                    <View style={styles.generalControls}>
                        <View style={styles.rateControl}>
                            {this.renderRateControl(0.5)}
                            {this.renderRateControl(1.0)}
                            {this.renderRateControl(2.0)}
                        </View>

                        <View style={styles.volumeControl}>
                            {this.renderVolumeControl(0.5)}
                            {this.renderVolumeControl(1)}
                            {this.renderVolumeControl(1.5)}
                        </View>

                        <View style={styles.resizeModeControl}>
                            {this.renderResizeModeControl('cover')}
                            {this.renderResizeModeControl('contain')}
                            {this.renderResizeModeControl('stretch')}
                        </View>
                    </View>
                </View>

            </View>
        );
    }



    render() {

        return this.state.playUrl==null ? this.myLoading() : this.renderCustomSkin();
    }


    myLoading()
    {
        return(
            <View style={styles.container}>
                <View style={styles.navigatorBar}>
                    <Text style={styles.navigatorTitle}
                          numberOfLines={1}
                          ellipsizeMode='tail'
                    >
                        {this.props.navigationTitle}
                    </Text>
                    <TouchableOpacity style={styles.navigatorBack}
                                      onPress={() =>{
                                          this.props.navigator.pop()
                                      }}
                                      key="navigatorBack"
                    >
                        <Text style={styles.navigatorBackItem}>&#xe604;</Text>
                    </TouchableOpacity>
                </View>
                <Text>loading</Text>
            </View>
        )
    }



}

var styles = StyleSheet.create({


    page:{
        flex:1,
    },
    navigatorBar:{
        position:'absolute',
        top:0,
        left:0,
        width:window.width,
        height:70,
        backgroundColor:'rgba(0,0,0,0)',

        // borderBottomWidth:1,
        // borderBottomColor:'#ccc',



    },
    navigatorBack:{
        position:'absolute',
        top:25,
        left:10,
        width:66,
        height:44,
        backgroundColor:'rgba(0,0,0,0)',

    },

    navigatorRight:{
        position:'absolute',
        top:25,
        right:0,
        width:66,
        height:44,
        backgroundColor:'rgba(0,0,0,0)',


    },

    navigatorTitle:{
        top:25,
        height:44,
        fontSize:18,
        textAlign:'center',
        width:window.width,

    },
    navigatorBackItem:{
        fontSize:24,
        color:'white',
        fontFamily:'iconfontim',
    },

    navigatorRightItem:{
        fontSize:15,
        color:'white',
        backgroundColor:'rgba(0,0,0,0)',
        borderRadius:5,
        width:50,
        textAlign:'center',
        overflow:'hidden',
        paddingTop:5,
        paddingBottom:5,
        fontFamily:'iconfontim',





    },

    main:{
        flex:1,
        // top:50,
        backgroundColor:'rgb(240,240,240)',

    },




    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },






    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    fullScreen: {
        position: 'absolute',
        top: 0,
        left: 1,
        bottom: 0,
        right: 1,
        padding:5,
    },
    controls: {
        backgroundColor: "transparent",
        borderRadius: 5,
        position: 'absolute',
        bottom: 44,
        left: 4,
        right: 4,
    },
    progress: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 3,
        overflow: 'hidden',
    },
    innerProgressCompleted: {
        height: 20,
        backgroundColor: '#cccccc',
    },
    innerProgressRemaining: {
        height: 20,
        backgroundColor: '#2C2C2C',
    },
    generalControls: {
        flex: 1,
        flexDirection: 'row',
        overflow: 'hidden',
        paddingBottom: 10,
    },
    skinControl: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    rateControl: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    volumeControl: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    resizeModeControl: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    controlOption: {
        alignSelf: 'center',
        fontSize: 11,
        color: "white",
        paddingLeft: 2,
        paddingRight: 2,
        lineHeight: 12,
    },
    nativeVideoControls: {
        top: 184,
        height: 300
    },

    playPreview:{
        flex:1,
        position:'absolute',
        width:window.width,
        top:64,
        left:0,
        height:window.height-64-64,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgba(0,0,0,0.2)',

    },
    playIcon:{
        fontFamily:'iconfontim',
        fontSize:45,
        padding:10,
        color:'white',
    },
    playFull:{
        fontFamily:'iconfontim',
        fontSize:20,
    }



})


export default MyPlayer;


