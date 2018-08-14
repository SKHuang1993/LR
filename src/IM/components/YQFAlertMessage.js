/**
 * Created by yqf on 2017/10/31.
 */

/**
 * Created by yqf on 17/3/31.
 */

import React from 'react';
import {

    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    Dimensions,

} from 'react-native';

const {width,height} = Dimensions.get('window');
const [aWidth] = [width-20];
const [left, top] = [0, 0];



export default class YQFAlertMessage extends React.Component{



    constructor(props) {
        super(props);

        this.state = {

            errorOpacity:new Animated.Value(0),
            showAlert:{
                isHidden:true,
                title:'确定吗',
                content:'',

            },
        };
    }



    render(){


        if(this.state.showAlert.isHidden){

            return null;

        }

        else {

            return(


                <View style={styles.container}>
                    <View style={styles.errorTip}>
                        <Animated.View style={{opacity:this.state.errorOpacity}}>


                            <View style={[ styles.alertMessageContentStyle]}>

                                <Text style={{
                                fontSize:16,
                                margin:30,
                                 color:'rgb(51,51,51)',}}>

                                    {this.state.showAlert.title}

                                </Text>


                                <View  style={{width:width-60,alignItems:'center', flexDirection:'row',justifyContent:'space-around'}}>



                                    <View style={[styles.cancelViewStyle]}>

                                        <Text style={[styles.cancelTextStyle]} onPress={()=>{
                                         this.myhiden();
                                        this.props.cancel();
                                    }}
                                        >取消</Text>

                                    </View>



                                    <View style={[styles.confirmViewStyle]}>
                                        <Text onPress={()=>{

                                        this.myhiden();

                                        this.props.confirm()

                                    }} style={styles.confirmTextStyle}>确定</Text>

                                    </View>


                                </View>


                            </View>


                        </Animated.View>
                    </View>
                </View>
            );

        }

    }


    myhiden()
    {

        console.log('heden')


        this.setState({
            showAlert:{
                isHidden:true,
                title:'',
                content:'',
            }
        })
    }



    showError(showErrorParamter)
    {

        this.setState({
            showAlert:showErrorParamter
        })


        setTimeout(
            () => {

                Animated.sequence([Animated.timing(
                    this.state.errorOpacity,
                    {
                        toValue:1.0,
                        duration:10,
                        easing:Easing.linear,
                    }
                ),

                    /*
                     Animated.delay(2000),


                     Animated.timing(
                     this.state.errorOpacity,
                     {
                     toValue:0,
                     duration:500,
                     easing:Easing.linear,
                     }
                     )

                     */

                ]).start(() =>{
                    //this.props.hide();



                });
            },
            500
        );





    }
}



const styles=StyleSheet.create({


    container: {
        position: "absolute",
        width: width,
        height: height,
        left: left,
        top: top,
        backgroundColor:'rgba(0,0,0,0.3)',
    },

    alertMessageContentStyle: {


        backgroundColor: 'rgb(255,255,255)',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        borderRadius: 5,
        height:150,
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


    errorTip:{
        flex:1,
        backgroundColor:'rgba(0,0,0,0)',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        width:window.width,
        height:window.height,

    },

    errorTipContent:{

        backgroundColor:'rgb(255,255,255)',

        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        padding:20,
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
})