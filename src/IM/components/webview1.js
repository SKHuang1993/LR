
import { observer } from 'mobx-react/native';
import {observable, autorun,computed, extendObservable, action, toJS } from 'mobx'


import React, { Component } from 'react';
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
    Dimensions,
    Platform,
    Alert,
    CameraRoll,
    NativeModules

} from  'react-native';

import  {Chat} from  '../../IM/utils/chat';
import DeviceInfo from 'react-native-device-info';
import NavBar from './yqfNavBar';


import Colors from '../Themes/Colors';
import  ActivityIndicator from './activity-indicator';



const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}

import Share from './share';

class  MyWebViewModel extends  Component{

        @observable savePhotoing = false;


}



@observer
class MyWebView extends React.Component{
    // 构造

    @observable loading = true;



    constructor(props) {
        super(props);
        // 初始状态


        this.store = new MyWebViewModel();
        


        this.store = new MyWebViewModel();


        var showAdd=false;
        var rightList=[];
        var viewControllers=this.props.navigator.getCurrentRoutes();
        if(viewControllers.length>2 && viewControllers[viewControllers.length-2].name=='ScanQRView')
        {
            showAdd=true;
            rightList=['在浏览器中打开','调整字体'];
        }

        if(this.props.webUrl.indexOf('Weixin/Article')>0)
        {
            showAdd=true;
            rightList=['作者主页','扫一扫','在浏览器中打开','调整字体'];
        }

        var currentUserAge='';

        //是否已经登陆
        if(Chat.userInfo  && Chat.userInfo.User &&Chat.userInfo.User.UserCode){

            if(Platform.OS ==='android'){

                currentUserAge=DeviceInfo.getUserAgent()+'YQFRN_LR_ANDROID/'+DeviceInfo.getVersion() +' USERID/'+Chat.userInfo.User.UserCode

            }else {

                currentUserAge=DeviceInfo.getUserAgent()+'YQFRN_LR_IOS/'+DeviceInfo.getVersion() +' USERID/'+Chat.userInfo.User.UserCode
            }

        }




        var injectScript= `
                                      (function() {
                                                        var originalPostMessage = window.postMessage;
                                                        var patchedPostMessage = function(message, targetOrigin, transfer) {
                                                            originalPostMessage(message, targetOrigin, transfer);
                                                        };
                                            
                                                        patchedPostMessage.toString = function() {
                                                            return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
                                                        };
                                            
                                                        window.postMessage = patchedPostMessage;

                                                        $(document).ready(function(){
                                                          
                                                            window.postMessage(JSON.stringify({name:'showInfo',}));
                                                            
                                                             var goBackDictionary={
                                                             
                                                            
                                                                                'https://trip.yiqifei.com/':1,
                                                                                'https://abs.yiqifei.com/ProductCatalog':1,
                                                                                'http://mlr.yiqifei.com/Poster':1,
                                                                                'http://mlr.yiqifei.com/Trips':1,
                                                                                'http://mlr.yiqifei.com/Trips/SearchTrips':1,
                                                                                'http://mlr.yiqifei.com/Todo':1,
                                                                                'http://mlr.yiqifei.com/Order/WaitPay':1,
                                                                                'http://mlr.yiqifei.com/Order/NoTicket':1,
                                                                                'http://mlr.yiqifei.com/Order/CurrentDay':1,
                                                                                'http://mlr.yiqifei.com/Customer':1,
                                                                                'http://mlr.yiqifei.com/EmployIntention':1,
                                                                                'http://mlr.yiqifei.com/Member/CustomerAssess':1,
                                                                                'https://abs.yiqifei.com/Profile/VideoCollect/MCollection':1,
                                                                                'http://mlr.yiqifei.com/Flight':1,
                                                                                'http://3g.yiqifei.com/Hotel':1,
                                                                                'http://mlr.yiqifei.com/Order':1,
                                                                                'http://mlr.yiqifei.com/PayCenter':'1',
                                                                                'https://abs.yiqifei.com/Profile/Video/MIndex':1,
                                                                                'https://abs.yiqifei.com/Profile/VideoCollect/MCollection':1,
                                                                                'http://3g.yiqifei.com/TravelProduct':1,
                                                                                'http://mlr.yiqifei.com/Flight/ShowIntFlight':1,
                                                                                
                                                                          
                                                                                
                                                                            };
                                                                            
                                                                           
                                                                           
                                                                             
                                                                         
                                                                       
                                                                       
                                                            if(goBackDictionary[window.location.href])
                                                            {
                                              
                                         
                                         
                                                                                   

                                         
                                                                 $('a.icon-left').click(function(){
                                                                    window.postMessage(JSON.stringify({name:'back',}));
                                                                 });
                                                                 
                                                                     $('a.icon-back').click(function(){
                                                                    window.postMessage(JSON.stringify({name:'back',}));
                                                                 });
                                                                 
                                                                 
                                                                 
                                                            }
                                                            
                                                             
                                                            else if(window.location.href.indexOf('http://mlr.yiqifei.com/Customer?key=')!=-1)
                                                            {
                                                               $('a.icon-left').click(function(){
                                                                    window.postMessage(JSON.stringify({name:'back',}));
                                                                 });
                                                            }
                                                            else if(window.location.href.indexOf('http://mlr.yiqifei.com/Order/SODetail?nr=')!=-1)
                                                            {
                                                               $('a.icon-left').click(function(){
                                                                    window.postMessage(JSON.stringify({name:'back',}));
                                                                 });
                                                            }
   
                                                        });

                                                      
                                                       
                                                         
                                                    })();

                                    `;

        this.state = {


            longPressDatas:['保存到相册','取消'],
            injectScript:injectScript,
            currentUserAge:currentUserAge,
            // isLoading:true,
            showShare:false,
            webHeight:15,
            bottomHeight:0,
            dataSourceRight:new ListView.DataSource({
                rowHasChanged:(r1,r2) => r1!==r2,
                sectionHeaderHasChanged:(s1,s2) => s1!==s2
            }),
            isShowRight:false,
            rightList:rightList,
            showAdd:showAdd,
            isSelf:false,
            showPicture:false,

            dataSourceImage:new ListView.DataSource({
                rowHasChanged:(r1,r2) => r1!==r2,
                sectionHeaderHasChanged:(s1,s2) => s1!==s2
            }),
            preViewImages:[],
            showPreViewImages:[],
            isAdvistor:false,
            articleUser:{},
            selectIndex:0,

            savePhotoing:false,//是否正在保存图片

        };
    }



    receivedMessage(e) {


       console.log('测试和H5交互的数据')
       console.log('received message from web view'+e.nativeEvent.data);


        var action=JSON.parse(e.nativeEvent.data);


        if(action.name=='back')
        {
            console.log('source:'+this.webView.source);
            if(e.nativeEvent.data.canGoBack)
            {
                this.webView.goBack();
            }
            else
            {
                this.props.navigator.pop();
            }

        }
        else if(action.name=='share')
        {

            if(action.title==undefined)
            {
                action.title=e.nativeEvent.title;
            }

            //有传图片过来
            if(action.imageUrl && action.imageUrl.length>0 ){

                //旅行方案海报
                if(action.imageUrl.indexOf("/Travelplan")==0){
                    console.log("这是旅行方案海报的")
                    action.imageUrl = "https://trip.yiqifei.com"+action.imageUrl;
                }else{
                    console.log("这是其他海报的。传过来什么，则显示什么")
                }
            }

            this.setState({
                showShare:true,
                shareDictionary:action,
            })
        }
        else if(action.name=='longPress')
        {

            if(action.image!=undefined && action.image.length>0)
            {
                this.setState({
                    longPressImage:action.image,
                })
            }
        }
        else if(action.name=='showInfo')
        {


        }
        else if(action.name=='logout')
        {
            console.log('捕捉logout');

        }else{

        }

    }

    postMessage(action) {
        this.WebView.postMessage(JSON.stringify(action))
    }


    render(){

        return(

                <View style={styles.page}>

                        <WebView
                            ref={webView => {
                        this.webView = webView
                    }}

                            startInLoadingState={true}
                            onLoadStart={() => {

                                if(this.loading){
                                      this.loading = true
                                }

                            }}
                            onLoadEnd={() => {
                                this.loading = false }}
                            javaScriptEnabled={true}
                            source={{uri:this.props.webUrl}}
                            style={{flex:1,marginTop:20}}
                            domStorageEnabled={true}
                            scalesPageToFit={false}
                            userAgent={this.state.currentUserAge}
                            injectedJavaScript={this.state.injectScript}
                            onShouldStartLoadWithRequest={(e)=>{
                                     if(e.url.toString().indexOf('mage-preview')>0)
                                                            {

                                                                var matchUrl= e.url.replace(/image-preview:/g, '');

                                                                //var index = this.state.preViewImages.indexOf(matchUrl);//
                                                                this.state.selectIndex= 0;
                                                                this.state.showPreViewImages=[];

                                                                console.log('matchUrl:'+matchUrl);

                                                                for(var i=0;i<this.state.preViewImages.length;i++)
                                                                {
                                                                    if(this.state.preViewImages[i]==matchUrl)
                                                                    {

                                                                        this.state.selectIndex=i;
                                                                        break;
                                                                    }
                                                                }
                                                                this.state.preViewImages.map((preViewImageItem)=>{
                                                                      this.state.showPreViewImages.push({url:preViewImageItem});

                                                                })


                                                                this.setState({
                                                                    showPicture:true,
                                                                    showPreViewImages:this.state.showPreViewImages,
                                                                    selectIndex:this.state.selectIndex,

                                                                })
                                                                return false;

                                                            }
                                                             console.log('currentUrl:'+e.url);

                                                             var indexDictionary={
                                                                 'http://mlr.yiqifei.com/Home/Index':'1',
                                                                 'http://mlr.yiqifei.com/':'1',
                                                                 'http://mlr.yiqifei.com/Account/Login':'1',
                                                                 'http://3g.yiqifei.com/':'1',
                                                             };

                                                             if(indexDictionary[e.url])
                                                             {
                                                                 console.log('拦截:'+e.url);

                                                                 if(e.url=='http://mlr.yiqifei.com/Account/Login')
                                                                 {

                                                                 } else if(e.url=='http://mlr.yiqifei.com/Home/Index'|| e.url=='http://mlr.yiqifei.com/')
                                                                     {
                                                                          DeviceEventEmitter.emit('toIndex',{index:'index'});
                                                                     }

                                                           this.props.navigator.popToTop();
                                                           this.props.navigator.pop();


                                                                 return false;
                                                             }
                                                             return true;

                                                         }}
                            onMessage={this.receivedMessage.bind(this)}

                        />


                    <ActivityIndicator toast text={'正在加载中...'} animating={this.loading} />


                    {this.renderLongPress()}
                    {this.renderShowPicture()}
                    {this.renderShare()}
                    {this.renderPosterLoading()}

                </View>
        )


    }

    renderShowPicture = ()=>{


        return null


    }



    renderPosterLoading = ()=>{

        if(this.store.savePhotoing==true){
            return <ActivityIndicator toast text={'正在保存图片...'} animating={this.store.savePhotoing}/>
        }

        return null;
    }




    _SavePhoto =async ()=>{


        //#TODO webview 保存图片  这里只要是获取图片的url



        var uri = this.state.shareDictionary.imageUrl;

        // console.log("准备保存图片的url")
        // console.dir(uri)

        var _this= this;

        if(Chat.isAndroid()){


            NativeModules.MyNativeModule.saveImageToPhotos(uri).then((text)=>{

                _this.store.savePhotoing = false;

                if(text == true){
                    Alert.alert('保存成功');
                }else{
                    Alert.alert('保存失败');
                }
            });




        }else{


            var promise = CameraRoll.saveToCameraRoll(uri);

            promise.then(function(result) {

                _this.store.savePhotoing = false;


                // this.setState({
                //     savePhotoing:false
                // })

                console.log('保存图片成功后图片')
                // console.dir(result);
    
                Alert.alert('保存成功');
    
                // this.state.showShare = false;
                // alert('保存成功！地址如下：\n' + result);

    
            }).catch(function(error) {

                _this.store.savePhotoing = false;

                Alert.alert('保存失败');
                // this.state.showShare = false;
                // alert('保存失败！\n' + error);
            });
    

        }

       
    }


    renderShare = ()=>{

        if(this.state.showShare){
            return(

                <Share clickItem={(shareItem)=>{

                    if(shareItem.type =='SaveToAlbum'){


                        this.store.savePhotoing = true;

                        this.setState({
                            showShare:false
                        })

                        this._SavePhoto();


                    }else {


                           this.state.showShare=!this.state.showShare
                          this.setState({
                            showShare:this.state.showShare,
                        })


                          Chat.thirdShare(shareItem.type,this.state.shareDictionary.title,this.state.shareDictionary.description,'http://img8.yiqifei.com/20171212/399aecd33ade4d709f7454b4acfa9a3c.png',this.state.shareDictionary.url,(result)=>{

                                                      },(error)=>{

                                                      })

                    }







                    }} cancleClick={()=>{
                        this.setState({
                            showShare:false,
                        })

                    }} />

            )
        }

        return null

    }

    renderLongPress = ()=>{

        if(this.state.showLongPress){

            return(
                <TouchableOpacity style={styles.longPress}
                                  onPress={()=>{
                                                          this.setState({
                                                          showLongPress:false,
                                                      })
                                                      }}
                >
                    <ListView initialListSize={50}
                              style={styles.longPressList}
                              dataSource={this.state.dataSourceLongPress.cloneWithRows(this.state.longPressDatas)}
                              renderRow={this.renderLongPressItem.bind(this)}
                              removeClippedSubviews={false}
                    >

                    </ListView>
                </TouchableOpacity>
            )

        }
        return null


    }


    renderLongPressItem(data)
    {
        return(
            <TouchableOpacity style={styles.longPressItem}
                              onPress={()=>{

                                       if(data=='保存到相册')
                                          {
                                                   Chat.saveImageToPhotos(this.state.longPressImage,()=>{


                                                    },(error)=>{

                                                    });
                                          }

                                        this.setState({
                                              showLongPress:false,
                                          })
                                  }}
            >
                <Text style={styles.longPressInfo}>{data}</Text>
            </TouchableOpacity>
        )

    }


    renderImage(filter,sectionId,rowId)
    {
        return(
            <TouchableOpacity style={styles.previewItem}
                                      onPress={()=>{
                                               this.setState({
                                                                    showPicture:false,
                                                                })

                          }}
            >
                <Image style={styles.previewImg}
                       resizeMode="contain"
                       source={{uri:filter}}

                >

                </Image>
            </TouchableOpacity>
        )
    }




}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },

    page:{
        flex:1,
    },
    statusBar:{
        position:'absolute',
        width:window.width,
        height:22,
        // backgroundColor:'rgba(0,0,0,0)',
        backgroundColor:Colors.colors.Chat_Color_LR,
        top:0,
        left:0,
    },



    navigatorBar:{
        position:'absolute',
        top:0,
        left:0,
        right:0,
        //width:Common.window.width,
        height:64,

        backgroundColor:Colors.colors.Chat_Color_LR,
        //backgroundColor:'rgba(0,0,0,0)',
        paddingLeft:66,
    },
    navigatorBack:{
        position:'absolute',
        top:10,
        left:0,
        paddingTop:12,
        paddingLeft:10,
        width:66,
        height:66,
        backgroundColor:'rgba(0,0,0,0)',


    },
    navigatorTitle:{
        top:22,
        height:40,
        fontSize:16,
        textAlign:'center',
        paddingTop:12,
        width:window.width-66-44,
        color:'white',
    },
    navigatorBackItem:{
        paddingTop:13,
        fontSize:18,
        color:'white',
        fontFamily:'iconfont',
    },

    navigatorRight:{

        position:'absolute',
        top:22,
        right:0,
        width:50,
        height:44,
        backgroundColor:'rgba(0,0,0,0)',
        justifyContent:'center',
    },

    navigatorRightItem:{
        fontSize:18,
        color:'white',
        paddingRight:10,
        fontFamily:'iconfont',
        textAlign:'right',



    },


    main:{
        flex:1,
        position:'absolute',
        // top:20,
        left:0,
        right:0,

    },

    webView:{

        backgroundColor:'white',
        width:window.width,
        marginTop:20

    },

    webViewNavigatorBackItem:{
        position:'absolute',
        top:16,
        left:10,
        fontFamily:'iconfont',
        paddingTop:15,
        fontSize:20,
        color:'white',
        backgroundColor:'rgba(0,0,0,0)',
        width:45,
        height:45,
    },

    background:{
        top:0,
        left:0,
        width:window.width,
        height:window.height,
        backgroundColor:'rgba(0,0,0,0.3)',
    },
    right:{
        position:'absolute',
        right:10,
        top:64,
        // width:100,
        // height:00,
    },
    rightItem:{
        borderBottomColor:'#eee',
        borderBottomWidth:1,
    },
    rightContent:{
        padding:13,
        backgroundColor:'white',
        fontSize:16,
    },

    previewMain:{
        flex:1,
        backgroundColor:'rgb(0,0,0)',

    },


    previewItem:{


    },

    previewImg:{
        width:window.width,
        height:window.height,
        flex:1,
    },




    wrapper: {
        // backgroundColor: '#f00'

    },

    slide: {
        flex: 1,
        backgroundColor: 'transparent'
    },

    image: {
        width:window.width,
        height:window.height,
        flex: 1
    },

    swipItem:{
        flex:1,

    },
    swipItemType:{
        fontSize:11,
        backgroundColor:'rgba(0,0,0,.3)',
        color:'white',
        marginTop:10,
        padding:4,

        width:60,
        borderRadius:10,
        overflow:'hidden',
        textAlign:'center',
        marginLeft:20,


    },
    swipItemTitle:{
        fontSize:18,
        fontWeight: 'bold', //设置粗体
        color:'white',
        backgroundColor:'transparent',

        marginTop:28,
        paddingLeft:20,
        paddingRight:10,
        textShadowOffset:{width:1, height:1},
        textShadowColor:'black',






    },
    swipItemInfo:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-start',
        paddingTop:5,
        paddingLeft:20,

    },
    swipItemInfoIcon:{
        width:18,
        height:18,
        borderRadius:9,
    },
    swipItemInfoName:{
        fontSize:13,
        color:'white',
        paddingLeft:5,

    },



    navigatorShare:{
        position:'absolute',
        top:22,
        right:50,
        width:66,
        height:44,
        backgroundColor:'rgba(0,0,0,0)',
        justifyContent:'center',
    },

    navigatorShareItem:{
        fontSize:18,
        color:'white',
        //paddingRight:10,
        fontFamily:'iconfont',
        textAlign:'right',
    },
    previewBack:{
        fontSize:18,
        color:'white',
        position:'absolute',
        top:20,
        left:0,
        padding:20,
        paddingBottom:10,
        backgroundColor:'rgba(0,0,0,0)',
        fontFamily:'iconfont',
    },

    loadingMore:{
        position:'absolute',
        top:0,
        left:0,
        right:0,
        bottom:0,

        width:140,
        marginTop:window.height/2-60,
        height:120,


        marginLeft:(window.width-140)/2,
        marginRight:(window.width-140)/2,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgba(0,0,0,0.5)',
        borderRadius:10,

    },
    loading:{
        margin:20,

    },
    loadingMoreTitle:{

        marginLeft:10,
        fontSize:18,
        color:'white',
    },

    longPress:{
        position:'absolute',
        top:60,
        left:0,
        width:window.width,
        //right:0,
        height:window.height-64-35,
        backgroundColor:'rgba(0,0,0,0.5)',
        // backgroundColor:'red',
    },


    longPressList:{
        position:'absolute',
        left:0,
        right:0,
        bottom:0,
    },

    longPressItem:{
        borderBottomWidth:1,
        borderBottomColor:'#ccc',
    },

    longPressInfo:{
        padding:15,
        backgroundColor:'white',
        textAlign:'center',


    },
    loadingMore:{
        position:'absolute',
        top:0,
        left:0,
        right:0,
        bottom:0,

        width:140,
        marginTop:window.height/2-60,
        height:120,


        marginLeft:(window.width-140)/2,
        marginRight:(window.width-140)/2,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgba(0,0,0,0.5)',
        borderRadius:10,

    },
    loading:{
        margin:20,

    },
    loadingMoreTitle:{

        marginLeft:10,
        fontSize:18,
        color:'white',
    }





})


export default MyWebView;