/**
 * Created by yqf on 2017/12/13.
 */

import React, {Component} from 'react';

import {

    StyleSheet,
    View,
    Image,
    Text,
    ListView,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Dimensions

} from 'react-native';


import AvatarGroup from './AvatarGroup';

const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}


export  default  class CommonUserItem extends Component
{
    constructor(props)
    {
        super(props);

        this.state={

            data:this.props.data,
            type:this.props.type ? this.props.type : 'normal',

        }
    }

     getFaceUrlPath = (url) => {
        if (!url)
            return "https://img2.yiqifei.com/face.png!60";
        else
            return "https://img2.yiqifei.com" + url + "!60";
    }


    //获取群名字
    _getGroupName(group){


        var Name;
        //有群名
        if(group.Name !=null && group.Name !=undefined)
        {
            Name= group.Name;
        }

        //没有群名字
        else
        {

            var name='';

            for (var i = 0; i < group.Members.length; i++) {

                var Member = group.Members[i];

                var memberName; //群成员的名字

                if(Member.Name ==null || Member.Name ==undefined)
                {
                    memberName = Member.IMNr;
                }
                else
                {
                    memberName = Member.Name;
                }

                name = name+memberName+',';
            }

            Name=name;

        }

        return Name;

    }



    render()
    {

        var margin=12;
        var iconW = 40;
        var iconH = iconW;

        var FaceUrlPath;//头像
        var Name;//文本
        var Description;//描述

        var ContentW = window.width - iconW -margin-100;

        if(this.props.type =='SearchUser')
        {

            var statuTitle = this.state.data.IsContact == false ? '添加': '已添加';
            var statuBorderColor = this.state.data.IsContact == false ? 'rgb(244,72,72)' : 'rgb(220,220,220)';
            var statuColor = this.state.data.IsContact == false ? 'rgb(244,72,72)' : 'rgb(153,153,153)';

            var FaceUrlPath =this.getFaceUrlPath(this.state.data.User.FaceUrlPath);

            Name = this.state.data.User.Name;

            // Description = this.state.data.Gender;


        }


        if(this.props.type == 'normal')
        {


            var statuTitle = this.state.data.statu == '1' ? '添加' : this.state.data.statu == '2' ? '等待验证' : '已添加';
            var statuBorderColor = this.state.data.statu == '1' ? 'rgb(244,72,72)' : 'rgb(220,220,220)';
            var statuColor = this.state.data.statu == '1' ? 'rgb(244,72,72)' : 'rgb(153,153,153)';

            FaceUrlPath = this.getFaceUrlPath(this.state.data.FaceUrlPath);
            Name = this.state.data.Name;
            Description = this.state.data.Gender;

        }


        //新的群通知
        else if(this.props.type=='NewGroupNotification'){

            var statuTitle = this.props.data.status == 'unknown' ? '同意'  : '已同意';
            var statuBorderColor = this.props.data.status == 'unknown' ? 'rgb(244,72,72)' : 'rgb(220,220,220)';
            var statuColor = this.props.data.status == 'unknown' ? 'rgb(244,72,72)' : 'rgb(153,153,153)';



            var GroupName = this.props.data.Group.Name ?  this.props.data.Group.Name : this._getGroupName(this.props.data.Group);

            FaceUrlPath =this.getFaceUrlPath(this.props.data.User.FaceUrlPath);
            Name = this.props.data.User.Name ? this.props.data.User.Name: this.props.data.User.IMNr;
            Description =Name+' 申请加入: '+ GroupName;
            var  Wording = this.props.data.Wording ? '申请理由:'+this.props.data.Wording : '申请理由:'+'我是'+Name+',群主通过我';



        }

        //新朋友item
        else if(this.props.type == 'NewFriend')
        {



            var statuTitle = this.props.data.Status == 'unknown' ? '接受'  : '已添加';
            var statuBorderColor = this.props.data.Status == 'unknown' ? 'rgb(244,72,72)' : 'rgb(220,220,220)';
            var statuColor = this.props.data.Status == 'unknown' ? 'rgb(244,72,72)' : 'rgb(153,153,153)';

            FaceUrlPath = this.getFaceUrlPath(this.props.data.User.FaceUrlPath);
            Name = this.props.data.User.Name;
            Description = this.props.data.Wording  && this.props.data.Wording.length>0? this.props.data.Wording : '我是'+Name;



        }


        //发现群item
        else if(this.props.type == 'GroupItem')
        {


            iconW =60;
            ContentW = window.width - iconW -margin*4 - 70;

            var statuTitle =this.props.data.isMembersOfTheGroup == true? '已入群' : '加入群';

            var statuBorderColor = 'rgb(244,72,72)' ;
            var statuColor = 'rgb(244,72,72)';

            FaceUrlPath =this.getFaceUrlPath(null);

        }



        //群Item
        if(this.props.type == 'GroupItem'){


            const {data} = this.props;

            iconW =60;
            ContentW = window.width - iconW -margin*4 - 70;
            var statuTitle =data.isMembersOfTheGroup == true? '已入群' : '加入群';
            var statuBorderColor = 'rgb(244,72,72)' ;
            var statuColor = 'rgb(244,72,72)';

            var rightButtonColor;

            if(data.isMembersOfTheGroup == true){

                rightButtonColor = 'rgb(153,153,153)';
                statuBorderColor = 'white' ;
                statuColor = 'white';

            }
            else {
                rightButtonColor='white';
            }




            return(

                <TouchableOpacity onPress={this.props.onPress} style={{flex:1}}>

                    <View style={{justifyContent:'space-between',flexDirection:'row',alignItems:'center',backgroundColor:'white'}}>


                        {
                            this.props.data.isShowAvatar?


                                <View style={{margin:10}}>

                                    <AvatarGroup  faceUrlPathsArray={data.FaceUrlPaths}>

                                    </AvatarGroup>
                                </View>

                                :


                                <Image style={{ margin:margin,resizeMode:'cover',width:iconW,height:iconW,borderRadius:iconW/2}}
                                       source={{uri:data.FaceUrlPath }}>
                                </Image>

                        }



                        <View style={{backgroundColor:'white',width:ContentW,justifyContent:'space-around',}}>

                            <Text numberOfLines={1} style={{color:'rgb(51,51,51)',fontSize:15}}>{data.Name}</Text>


                            <Text style={{color:'rgb(153,153,153)',fontSize:12,marginTop:5}} numberOfLines={1}>{data.Intro ? data.Intro : data.Members.length+'人'}</Text>


                        </View>


                        <TouchableOpacity onPress={this.props.onPressRight }>

                            <View style={{flexDirection:'row', backgroundColor:rightButtonColor, borderRadius:15,width:70,height:30,marginLeft:10, marginRight:10,borderColor:statuBorderColor, borderWidth:0.75,justifyContent:'center',alignItems:'center'}}>

                                {
                                    this.props.type == 'GroupItem' &&  !this.props.data.isMembersOfTheGroup ? <Text style={{color:statuColor,fontSize:12,fontFamily:'iconfontim'}}>{String.fromCharCode('0xe180')}</Text>

                                        : null
                                }
                                <Text style={{fontSize:12,color:statuColor}}>{statuTitle}</Text>

                            </View>
                        </TouchableOpacity>


                    </View>

                    <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>


                </TouchableOpacity>



            );

        }


        //新朋友页面
        else if(this.props.type =='NewFriend'){

            return (

                <TouchableOpacity onPress={this.props.toInfo} style={{flex:1}}>

                    <View
                        style={{justifyContent:'space-between',flexDirection:'row',alignItems:'center',backgroundColor:'white'}}>

                        <Image style={{ margin:margin,resizeMode:'cover',width:iconW,height:iconW,borderRadius:iconW/2}}
                               source={{uri:FaceUrlPath }}>

                        </Image>


                        <View style={{backgroundColor:'white',width:ContentW,justifyContent:'space-around',}}>

                            <Text numberOfLines={1}
                                  style={{color:'rgb(51,51,51)',fontSize:15}}>{Name}</Text>

                            <Text style={{color:'rgb(153,153,153)',fontSize:12,marginTop:5}}
                                  numberOfLines={1}>{Description}</Text>

                        </View>


                        <TouchableOpacity onPress={this.props.onPress}>


                            <View
                                style={{flexDirection:'row', backgroundColor:'white', borderRadius:15,width:70,height:30,marginLeft:10, marginRight:10,borderColor:statuBorderColor, borderWidth:0.75,justifyContent:'center',alignItems:'center'}}>

                                <Text style={{fontSize:14,color:statuColor}}>{statuTitle}</Text>

                            </View>
                        </TouchableOpacity>




                    </View>

                    <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>


                </TouchableOpacity>



            );



        }

        //新的群通知请求页面
        else if(this.props.type =='NewGroupNotification'){

            return (

                <TouchableOpacity onPress={this.props.toInfo} style={{flex:1}}>

                    <View
                        style={{justifyContent:'space-between',flexDirection:'row',alignItems:'center',backgroundColor:'white'}}>

                        <Image style={{ margin:margin*1.1,resizeMode:'cover',width:iconW,height:iconW,borderRadius:iconW/2}}
                               source={{uri:FaceUrlPath }}>

                        </Image>


                        <View style={{backgroundColor:'white',width:ContentW,justifyContent:'space-around',}}>

                            <Text numberOfLines={1}
                                  style={{color:'rgb(51,51,51)',fontSize:15}}>{Name}</Text>

                            <Text style={{color:'rgb(102,102,102)',fontSize:12,marginTop:5}}
                                  numberOfLines={1}>{Description}</Text>

                            <Text style={{color:'rgb(153,153,153)',fontSize:12,marginTop:5}}
                                  numberOfLines={1}>{Wording}</Text>


                        </View>


                        <TouchableOpacity onPress={this.props.onPress}>

                            <View
                                style={{flexDirection:'row', backgroundColor:'white', borderRadius:15,width:70,height:30,marginLeft:10, marginRight:10,borderColor:statuBorderColor, borderWidth:0.75,justifyContent:'center',alignItems:'center'}}>

                                <Text style={{fontSize:14,color:statuColor}}>{statuTitle}</Text>

                            </View>
                        </TouchableOpacity>


                    </View>

                    <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>


                </TouchableOpacity>



            );



        }



        else {

            return (

                <View style={{flex:1}}>

                    <View
                        style={{justifyContent:'space-between',flexDirection:'row',alignItems:'center',backgroundColor:'white'}}>


                        <Image style={{ margin:margin,resizeMode:'cover',width:iconW,height:iconW,borderRadius:iconW/2}}
                               source={{uri:FaceUrlPath }}>

                        </Image>


                        <View style={{backgroundColor:'white',width:ContentW,justifyContent:'space-around',}}>

                            <Text numberOfLines={1}
                                  style={{color:'rgb(51,51,51)',fontSize:15}}>{Name}</Text>


                            <Text style={{color:'rgb(153,153,153)',fontSize:12,marginTop:5}}
                                  numberOfLines={1}>{Description}</Text>


                        </View>


                        <TouchableOpacity onPress={this.props.onPress}>

                            <View
                                style={{flexDirection:'row', backgroundColor:'white', borderRadius:15,width:70,height:30,marginLeft:10, marginRight:10,borderColor:statuBorderColor, borderWidth:0.75,justifyContent:'center',alignItems:'center'}}>

                                {
                                    this.props.type == 'GroupItem' ? <Text
                                            style={{color:statuColor,fontSize:12,fontFamily:'iconfontim'}}>{String.fromCharCode('0xe180')}</Text>

                                        : null
                                }
                                <Text style={{fontSize:12,color:statuColor}}>{statuTitle}</Text>

                            </View>
                        </TouchableOpacity>


                    </View>

                    <View style={{backgroundColor:'rgb(235,235,235)',height:0.5,}}></View>


                </View>



            );
        }
    }
}

