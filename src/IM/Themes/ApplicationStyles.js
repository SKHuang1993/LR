/**
 * Created by yqf on 2017/9/16.
 */

import Fonts from './Fonts'
import Colors from './Colors'
import Metrics from './Metrics'

const ApplicationStyles={

    screen:{


        //主要容器
        mainContainer:{
            flex:1,
            marginTop:Metrics.navBarHeight,
            backgroundColor:Colors.transparent,
        },

        //背景图片
        backgroundImage:{

            position:'absolute',
            left:0,
            top:0,
            right:0,
            bottom:0,

        },

        //一般容器
        container:{

            flex:1,
            paddingTop:Metrics.baseMargin,


        },


        section:{

            margin: Metrics.section,
            padding: Metrics.baseMargin,
            borderTopColor: Colors.frost,
            borderTopWidth: 0.5,
            borderBottomColor: Colors.frost,
            borderBottomWidth: 1

        },


        sectionText:{

            color: Colors.snow,
            marginVertical: Metrics.smallMargin,
            textAlign: 'center',
            fontWeight: 'bold'

        },

        subtitle:{

            color:Colors.snow,
            padding:Metrics.smallMargin,
            marginBottom:Metrics.smallMargin,
            marginHorizontal:Metrics.smallMargin
        },





    },


    drakLabelContainer:{

        backgroundColor:Colors.cloud,
        padding:Metrics.smallMargin,
    },


    drakLabel:{

        fontFamily:Fonts.type.bold,
        color:Colors.snow,
        fontSize:200
    },

    groupContainer:{
        margin:Metrics.smallMargin,
        flexDirection:'row',
        justifyContent:'space-around',
        alignItems:'center',
    },

    sectionTitle:{

        ...Fonts.style.h4,
        color:Colors.coal,
        backgroundColor: Colors.ricePaper,
        padding: Metrics.smallMargin,
        marginTop: Metrics.smallMargin,
        marginHorizontal: Metrics.baseMargin,
        borderWidth: 1,
        borderColor: Colors.ember,
        alignItems: 'center',
        textAlign: 'center'


    },






}


export  default ApplicationStyles;