/**
 * Created by yqf on 17/6/2.
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    TouchableWithoutFeedback,
    ListView,
    Image,
    Dimensions
} from 'react-native';

const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}

var shareDatas=[

    {title:'0xe62a',info:'保存到本地',showColr:'rgb(38,203,114)',type:'SaveToAlbum',uri:require('../image/login/downLoad.png')},
    // {title:'0xe62a',info:'微信好友',showColr:'rgb(38,203,114)',type:'WechatSession',uri:require('../image/login/Wechat.png')},
    // {title:'0xe655',info:'微信朋友圈',showColr:'rgb(38,203,114)',type:'WechatTimeline',uri:require('../image/login/friend.png')},
    // {title:'0xe628',info:'QQ',showColr:'rgb(233,80,63)',type:'QQ',uri:require('../image/login/QQ.png')},
    // {title:'0xe625',info:'新浪微博',showColr:'rgb(90,172,226)',type:'SinaWeibo',uri:require('../image/login/SinaWeibo.png')},
]


export default class Share extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            dataSource:new ListView.DataSource({
                rowHasChanged:(r1,r2) => r1!==r2,
                sectionHeaderHasChanged:(s1,s2) => s1!==s2
            }),
        };

    }


    componentDidMount() {

    }
    render(){
        return(

            <View style={[styles.mediaMain]}>
                <TouchableOpacity style={styles.mediaBG}
                                  onPress={()=>{
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
                    <TouchableWithoutFeedback style={styles.shareCancle} onPress={()=>{
                                this.props.cancleClick();
                            }}>
                        <Text style={styles.shareCancleInfo}>取消</Text>
                    </TouchableWithoutFeedback>
                </View>


            </View>

        );
    }


    renderShare(shareItem,sectionId,rowId)
    {
        return(
            <TouchableOpacity style={styles.shareItem} onPress={()=>{
                this.props.clickItem(shareItem);
            }}>
                {/*<Text style={[styles.shareIcon,{color:shareItem.showColr}]}>{String.fromCharCode(shareItem.title)}</Text>*/}
                <Image source={shareItem.uri} style={styles.loginWayItem} ></Image>
                {/*<Text style={styles.shareIcon}>{shareItem.title}</Text>*/}
                <Text style={styles.shareInfo}>{shareItem.info}</Text>
            </TouchableOpacity>
        )
    }



    myShow()
    {

    }

    myHide()
    {

    }
}

var styles =StyleSheet.create({
    mediaMain:{
        flex:1,

        position:'absolute',
        width:window.width,
        height:window.height,

        top:56,
        left:0,
    },

    mediaBG:{
        top:0,
        left:0,
        width:window.width,
        height:window.height,
        backgroundColor:'rgba(0,0,0,0.6)',

    },
    mediaShow:{
        position:'absolute',
        width:window.width,
        top:window.height,
        // top:220,
        left:0,
    },


    mediaItem:{
        borderBottomColor:'rgb(240,240,240)',
        borderBottomWidth:1,
        backgroundColor:'white',


    },
    mediaInfo:{
        textAlign:'center',
        fontSize:18,
        padding:15,
    },

    mainShare:{
        position:'absolute',
        left:0,
        right:0,
        bottom:45,
        justifyContent:'center',
    },

    shareItem:{
        flexDirection:'column',
        //justifyContent:'center',
        alignItems:'center',
        //backgroundColor:'blue',
        //margin:8,



    },
    listStyle:{
        paddingLeft:25,
        backgroundColor:'white',
        borderBottomWidth:1,
        borderBottomColor:'rgb(240,240,240)',


    },
    list:{
        flexDirection:'row',
        alignItems:'center',
        flexWrap:'wrap',

    },

    shareIcon:{
        fontFamily:'iconfont',
        fontSize:40,
        color:'red',
        paddingLeft:20,
        paddingRight:20,
        //paddingTop:5,
    },
    shareInfo:{

        fontSize:12,
        paddingBottom:5,
        // color:'white',


    },
    shareCancle:{

        borderTopWidth:1,
        borderTopColor:'rgb(240,240,240)',
    },
    shareCancleInfo:{
        //flex:1,
        //width:Common.window.width,
        //height:45,

        padding:20,
        textAlign:'center',
        backgroundColor:'white',
        fontSize:18,
        color:'#999',
    },

    loginWayItem:{
        margin:10,
        width:45,
        height:45,
        //marginBottom:30,
    },

})