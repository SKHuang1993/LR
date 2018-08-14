/**
 * Created by yqf on 2017/10/31.
 */

import React from 'react';
import {
    ActivityIndicator,
    View,
    Text,
    StyleSheet,
    Dimensions,

} from 'react-native';



const {width,height} = Dimensions.get('window');


export default class YQFProgressHUD extends React.Component {

    constructor(props) {

        super(props);
        this.state = {

            showAlert: {
                isHidden: true,
                title: this.props.title,
            },

        }
    }



    render() {

        if (this.state.showAlert.isHidden) {
            return null;
        }

        if(this.props.type == 'Success'){

            return(

                <View style={[styles.loadingMore]}>

                    <Text numberOfLines={1} style={{marginTop:-10, fontWeight:'bold', fontSize:40,color:'white',fontFamily:'iconfontim'}}>{String.fromCharCode('0xe199')}</Text>

                    <Text numberOfLines={1} style={styles.loadingMoreTitle}>{this.state.showAlert.title}</Text>


                </View>

            )

        }


        else {

            return(

                <View style={styles.loadingMore}>
                    <ActivityIndicator size="large" style={styles.loading} color="white"/>
                    <Text numberOfLines={1} style={styles.loadingMoreTitle}>{this.state.showAlert.title}</Text>
                </View>
            );
        }

    }


    showHUD(showErrorParamter) {

        this.setState({
            showAlert: showErrorParamter
        });

        //传入一个属性进来。1.5s后自动隐藏


        if(this.props.type == 'Success'){

            setTimeout(()=>{

                var param={

                    isHidden:true
                }

                this.setState({
                    showAlert:param
                })


            },1500);

        }


    }

}


const styles=StyleSheet.create({



    loadingMore:{


        position:'absolute',
        top:0,
        left:0,
        right:0,
        bottom:0,

        marginTop:window.height/2-60,
        marginLeft:(window.width-140)/2,
        marginRight:(window.width-140)/2,
        height:120,

        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgba(0,0,0,0.7)',
        borderRadius:10,

    },

    loadingMoreTitle:{

        marginLeft:10,
        fontSize:16,
        color:'white',

    },

    container: {
        position: "absolute",
        width: width,
        height: height,
        left: 0,
        top: 0,
        backgroundColor:'rgba(0,0,0,0.3)',
    },

    alertMessageContentStyle: {


        backgroundColor: 'rgb(255,255,255)',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        borderRadius: 5,
        height:100,

    },

    confirmViewStyle:{

        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(244,72,72)',
        borderRadius: 5,

    },


    cancelViewStyle:{

        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white',
        borderRadius:5,
        borderColor:'rgb(220,220,220)',
        borderWidth:1,

    },

    confirmTextStyle:{

        fontSize:13,
        color:'white',
        margin:10,
        padding:1,
        marginTop:5,
        marginBottom:5,
        paddingLeft:20,
        paddingRight:20,




    },



    cancelTextStyle:{

        fontSize:13,
        color:'rgb(51,51,51)',
        backgroundColor:'white',
        margin:10,
        marginTop:5,
        marginBottom:5,
        padding:1,

        paddingLeft:20,
        paddingRight:20,

    },





    errorTipContentTitle:{

        fontSize:18,
        paddingBottom:30,
        color:'white',

    },
    errorTipContentInfo:{
        fontSize:15,
        color:'white',
    },



    loading:{
        margin:20,

    },


})