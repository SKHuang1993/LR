/**
 * Created by yqf on 17/4/7.
 */


import {

    Dimensions,
    Platform

} from 'react-native';


const {width,height} = Dimensions.get('window');

const metrics={

    marginHorizontal:10,
    marginVertical:10,
    section:25,
    baseMargin:10,
    doubleBaseMargin:20,
    smallMargin:5,
    horizontalLineHeight: 1,


    screenWidth:width < height ? width : height,
    screenHeight: width<height ? height :width,

    navBarHeight : (Platform.OS == 'ios') ? 64 : 54,
    statusBarHeight:20,
    buttonRadius:4,

    icons:{

        tiny0: 13,
        tiny: 15,
        tiny2: 17,
        small: 20,
        medium: 30,
        large: 45,
        xl: 60

    },

    images:{

        small:20,
        middle:40,
        large:60,
        logo:300,

    }




};


export  default  metrics;
