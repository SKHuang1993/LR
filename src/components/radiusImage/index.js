import React, {Component} from 'react';

import {
	StyleSheet,
	View,
	TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';

var {width,height} = Dimensions.get('window')
export default class RadiusImage  extends Component {
    static propTypes = {
        pathType:React.PropTypes.number,//图片链接的类型，1为网络图链接，2为本地图片链接
        imagePath:React.PropTypes.string,//图片链接
        radiusNum:React.PropTypes.number,//圆角的角度
        imgWidth:React.PropTypes.number,//设置图片的宽
        imgHeight:React.PropTypes.number,//设置图片的高
        imgBorderColor:React.PropTypes.number,//设置图片的边框颜色
        imgBorderWidth :React.PropTypes.number,//设置图片的边框宽度
	}
    

    constructor(props) {
        super(props);
        this.state = {
            radiusNum:props.imgWidth/2,//  头像圆角是宽度的一半才能圆
        }
    }

    render() {
        if(this.props.radiusNum != null && this.props.radiusNum != '') this.state.radiusNum = this.props.radiusNum;
        if(this.props.pathType == 1){
            return(
                <Image 
                    source={{uri: this.props.imagePath}}
                    style={{width:this.props.imgWidth,height:this.props.imgHeight,borderRadius:this.state.radiusNum,
                            borderColor:this.props.imgBorderColor,borderWidth:this.props.imgBorderWidth}} />
            );
        }else{
            return(
                <Image 
                    source={require("../../images/icon_biz.png")}
                    style={{width:this.props.imgWidth,height:this.props.imgHeight,borderRadius:this.state.radiusNum,
                            borderColor:this.props.imgBorderColor,borderWidth:this.props.imgBorderWidth}}/>
            );
        }
    }


}