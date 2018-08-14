/**
 * Created by yqf on 2017/11/1.
 */


import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

export const COLORS={

    primary: '#162840',//主色调
    secondary: '#fa5e5b',//副色调
    navBarBg: '#162840',
    navBarColor: '#fff',
    listBg: '#FFF',//列表背景
    listBorder: '#e3e3e3',
    listColor: '#333',
    btnBg: '#fa5e5b',
    btnColor: '#fff',
    btnRadius: 3,//按钮圆角
    titleBar: '#00A2ED',
    statusBar: '#162840',//状态栏
    sliderBar: '#FFF',
    sliderBarColor: '#000',
    background: '#F3F3F3',
    line: '#DDD',//线颜色
    containerBg: '#e6eaf2',// 页面背景
    textBg:'#e6eaf2',
    link: '#42a6da', // 链接(水蓝色)
    textBase:'#333',//文字基本颜色
    textLight:'#666',//
    textLighter:'#999',
    price:'#fa5e5b',
    correctColor:'#45da84',//打钩颜色，通过颜色
    errorColor:'#fa5e5b',//打叉颜色，拒绝颜色

}

export const FLEXBOX={

    /************************全局共用位置控制***********************************/
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    pixel: PixelRatio.get(),

    // 水平容器
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
    },

    // 垂直容器
    columnContainer: {
        flex: 1,
        flexDirection: 'column',
    },

    // 垂直居中容器
    columnCenterContainer: {
        justifyContent: 'center',
    },

// 居中容器
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    // 水平居中容器
    rowCenterContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    flexBetween: {
        flex:1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    flexStart: {
        flex:1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    flexEnd: {
        flex:1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    bottomSpace:{
        marginBottom:10,
    }

}