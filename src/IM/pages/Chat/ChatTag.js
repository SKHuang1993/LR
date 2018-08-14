/**
 * Created by yqf on 2017/11/8.
 */

//设置标签

/**
 * Created by yqf on 17/3/16.
 */
/**
 * Created by yqf on 17/3/12.
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
    TextInput,
    Dimensions
} from  'react-native';


import {ServingClient,RestAPI} from '../../utils/yqfws'

import YQFNavBar  from '../../components/yqfNavBar';

import {IM} from '../../utils/data-access/im';
import {Chat} from '../../utils/chat';


var datas=[

];



let window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

};

var itemWidth=window.width/5;


var serviceData={};



export default class ChatTag extends Component{
    // 构造
    constructor(props) {
        super(props);

        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2
        });

        var addDatas=[];


        if(this.props.tag &&  this.props.tag.length>0)
        {
            addDataInfos=this.props.tag.split(" ");
            addDataInfos.map((addDataInfo)=>{
                addDatas.push({type:'Content',info:addDataInfo,select:true});
            })
            addDatas.push({type:'addContent',info:'添加标签',select:false});
        }
        else
        {
            addDatas=[
                {type:'addContent',info:'添加标签',select:false},
            ]
        }



        // 初始状态
        this.state = {

            dataSource: ds.cloneWithRowsAndSections({
                '我去过热搜索榜': ['我去过热搜索榜'],
                '全部标签': [['test']],
            }),

            dataSourceSelect:new ListView.DataSource({
                rowHasChanged:(r1,r2) => r1!==r2,
                sectionHeaderHasChanged:(s1,s2) => s1!==s2
            }),
            dataSourceAll:new ListView.DataSource({
                rowHasChanged:(r1,r2) => r1!==r2,
                sectionHeaderHasChanged:(s1,s2) => s1!==s2
            }),
            datas:datas,
            addDatas:addDatas,
            moodSwitch: false,
            addContent:'',
        };

        this._renderRow = this._renderRow.bind(this);
        this._renderSectionHeader = this._renderSectionHeader.bind(this)
    }

    fetchData = async()=>{

        //请求标签
        var resultTag =await IM.getIMSystemUserTagByIMNr({
            IMNr:Chat.userInfo.User.IMNr
        });


        if( resultTag.IMUserTags && resultTag.IMUserTags.length>0){

            var showLabels=[];
            resultTag.IMUserTags.map((labelItem)=>{
                serviceData[labelItem.Name]=labelItem.ID;
                showLabels.push({type:'Content',info:labelItem.Name,select:false})

            })


            const ds = new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2,
                sectionHeaderHasChanged: (s1, s2) => s1 !== s2
            });
            this.setState({
                dataSource: ds.cloneWithRowsAndSections({
                    '我去过热搜索榜': ['我去过热搜索榜'],
                    '全部标签': [['test']],

                }),
                datas:showLabels,
            });

        }




    }

    componentDidMount() {


        this.fetchData();




    }


    componentDidMount1() {

/*
        var autohrMethod='DEST.LabelsGet';
        var authorParamter={
            "LabelTypeID":null,

        }
        RestAPI.invoke(autohrMethod,authorParamter,(respone) => {


            if(respone.Code==0 && respone.Msg=='调用成功' &&respone.Result.Labels.length>0)
            {


                var showLabels=[];
                respone.Result.Labels.map((labelItem)=>{
                    serviceData[labelItem.Name]=labelItem.ID;
                    showLabels.push({type:'Content',info:labelItem.Name,select:false})
                })




                const ds = new ListView.DataSource({
                    rowHasChanged: (r1, r2) => r1 !== r2,
                    sectionHeaderHasChanged: (s1, s2) => s1 !== s2
                });
                this.setState({
                    dataSource: ds.cloneWithRowsAndSections({
                        '我去过热搜索榜': ['我去过热搜索榜'],
                        '全部标签': [['test']],

                    }),
                    datas:showLabels,
                });



            }


        },(error) => {

        });
*/

    }



    _renderRow(data, sectionID, rowID) {
        if(sectionID=='我去过热搜索榜')
        {
            return(
                <View style={styles.historyList}>
                    <ListView initialListSize={50}
                              contentContainerStyle={styles.list}
                              dataSource={this.state.dataSourceSelect.cloneWithRows(this.state.addDatas)}
                              renderRow={this.renderImage.bind(this)}
                              style={styles.listStyle}
                              scrollEnabled={false}
                              removeClippedSubviews={false}
                    >

                    </ListView>

                </View>
            )
        }
        else if (sectionID=='全部标签')
        {
            return(
                <View style={styles.labelAll}>
                    <ListView
                        initialListSize={50}
                        contentContainerStyle={styles.list}
                        dataSource={this.state.dataSourceAll.cloneWithRows(this.state.datas)}
                        renderRow={this.renderImage.bind(this)}
                        style={[styles.listStyle,{backgroundColor:'rgb(245,245,245)'}]}
                        removeClippedSubviews={false}
                    >

                    </ListView>

                </View>
            )
        }


    }

    _renderSectionHeader(data, sectionID) {




        if(sectionID=='我去过热搜索榜')
        {
            return null;
        }
        else if(sectionID=='全部标签')

            return(
                <View style={styles.sectionAllLabel}>
                    <View style={styles.sectionAllLeft}></View>
                    <Text style={styles.sectionAllInfo}>{sectionID}</Text>
                </View>
            )

    }


    render(){

        return(
            <View style={styles.page}>
                <YQFNavBar onLeftClick={()=>{
 this.props.navigator.pop()
                }}
                           onRightClick={()=>{

                         var tagString='';
                                          if(this.state.addDatas.length>1)
                                          {
                                               var dataArr=[];
                                              for(var i=0;i<this.state.addDatas.length-1;i++)
                                              {
                                                  dataArr.push(this.state.addDatas[i].info);
                                              }
                                              tagString= dataArr.join(" ");
                                          }

                                          this.props.getTag(tagString);

                                          {/*this.props.serviceLabels(serviceData);*/}

                                          this.props.navigator.pop();

                   }}

                           leftIcon = {'0xe183'}
                           title={'设置标签'}
                           rightText={'保存'}/>

                <View style={styles.main}>


                    <ListView dataSource={this.state.dataSource}
                              renderRow={this._renderRow}
                              renderSectionHeader={this._renderSectionHeader}


                    >

                    </ListView>

                </View>

            </View>

        )

    }


    render11(){
        return(
            <View style={styles.page}>



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


                    <TouchableOpacity style={styles.navigatorRight}
                                      onPress={() =>{
                                          var tagString='';
                                          if(this.state.addDatas.length>1)
                                          {
                                               var dataArr=[];
                                              for(var i=0;i<this.state.addDatas.length-1;i++)
                                              {
                                                  dataArr.push(this.state.addDatas[i].info);
                                              }
                                              tagString= dataArr.join(" ");
                                          }

                                          this.props.getTag(tagString);

                                          this.props.serviceLabels(serviceData);

                                          this.props.navigator.pop();
                                      }}
                                      key="navigatorRight"
                    >
                        <Text style={styles.navigatorRightItem}>保存</Text>
                    </TouchableOpacity>
                </View>


                <View style={styles.main}>


                    <ListView dataSource={this.state.dataSource}
                              renderRow={this._renderRow}
                              renderSectionHeader={this._renderSectionHeader}


                    >

                    </ListView>

                </View>





            </View>
        )
    }

    renderImage(asset,sectionId,rowId)
    {
        if (asset.type == 'addContent')
        {
            return(
                <View>
                    {/*<Text style={styles.searchBarInput}>添加标签</Text>*/}
                    <TextInput style={styles.searchBarInput}
                               placeholder={'添加标签'}
                               keyboardType="default"
                               returnKeyType="next"
                               onChangeText={(text)=>{
                                       this.state.addContent=text;


                                   }}

                               onSubmitEditing={() =>{
                                      if(this.state.addContent.length>0)
                                          {




                                              this.state.addDatas.splice(this.state.addDatas.length-1,0,{type:'Content',info:this.state.addContent,select:true});
                                              this.state.addContent='';

                                               const ds = new ListView.DataSource({
                                                            rowHasChanged: (r1, r2) => r1 !== r2,
                                                            sectionHeaderHasChanged: (s1, s2) => s1 !== s2
                                                        });
                                                this.setState({
                                                       dataSource: ds.cloneWithRowsAndSections({
                                                                    '我去过热搜索榜': ['我去过热搜索榜'],
                                                                    '全部标签': ['test2'],

                                                                   }),
                                                })

                                          }
                                   }}


                    >

                    </TextInput>
                </View>
            )
        }
        else if(asset.type =='Content')
        {


            var showStyle=[styles.labelItemInfo];
            if (asset.select)
            {
                showStyle.push({borderColor:'rgb(253,173,42)'});
                showStyle.push({color:'rgb(253,173,42)'});

            }
            else
            {

                showStyle.push({borderColor:'rgb(204,204,204)'});
                showStyle.push({color:'rgb(166,166,166)'});

            }


            if(asset.info=='添加标签')
            {

                showStyle.push({width:85});
            }


            return(
                <View style={styles.labelItem}>
                    <Text style={showStyle}
                          onPress={() =>{
                                    console.log('城市控件');
                                    asset.select=!(asset.select);



                                    if(asset.select)
                                    {
                                        this.state.addDatas.splice(0,0,asset);
                                    }
                                    else
                                    {
                                        this.state.addDatas.map((addItem,i)=>{
                                            if(addItem.info==asset.info)
                                            {
                                                this.state.addDatas.splice(i,1);
                                            }
                                        })
                                    }



                                   const ds = new ListView.DataSource({
                                                rowHasChanged: (r1, r2) => r1 !== r2,
                                                sectionHeaderHasChanged: (s1, s2) => s1 !== s2
                                            });
                                    this.setState({
                                           dataSource: ds.cloneWithRowsAndSections({
                                                        '我去过热搜索榜': ['我去过热搜索榜'],
                                                        '全部标签': ['test2'],

                                                       }),
                                    })


                                }}
                    >
                        {asset.info}
                    </Text>
                </View>


            )
        }


        else
        {
            return null
        }

    }


    moodeSelect(asset)
    {

        this.state.datas.map((item,i)=>{
            if(item !=asset)
            {
                item.select=false;
            }

        })
        asset.select=!asset.select;
        this.setState({
            datas:this.state.datas,
        })
    }


}

var styles = StyleSheet.create({


    page:{
        flex:1,
    },
    navigatorBar:{
        width:window.width,
        height:70,
        backgroundColor:'white',
        borderBottomWidth:1,
        borderBottomColor:'#ccc',

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
        color:'black',
        fontFamily:'iconfont',
    },

    navigatorRightItem:{
        fontSize:15,
        color:'white',
        backgroundColor:'red',
        borderRadius:5,
        width:50,
        textAlign:'center',
        overflow:'hidden',
        paddingTop:5,
        paddingBottom:5,



    },

    main:{
        flex:1,
        backgroundColor:'rgb(245,245,245)',

    },

    LabelTitle:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        backgroundColor:'#eee',
        padding:10,

    },
    LabelTitleInfo:{
        width:10,
        height:10,
        backgroundColor:'#f44848',

    },

    LabelTitleIcon:{
        fontSize:12,
        padding:5,


    },





    listStyle:{

        paddingLeft:10,
        paddingBottom:10,
        backgroundColor:'white',
        width:window.width,

    },


    list:{

        // justifyContent:'space-around',
        flexDirection:'row',
        alignItems:'center',
        flexWrap:'wrap',

    },
    labelItem:{
        padding:5,
        marginTop:10,

        marginBottom:5,
        justifyContent:'center',//垂直

        // borderWidth:1,
        // borderRadius:5,
        // borderColor:'#ccc',
        // width:itemWidth,
        // width:60,
        height:30,

    },

    labelItemInfo:{
        fontSize:14,
        color:'rgb(166,166,166)',
        borderRadius:15,
        padding:6,
        paddingLeft:13,
        paddingRight:13,

        backgroundColor:'white',
        borderWidth:1,
        overflow:'hidden',
        textAlign:'center',

    },

    searchBar:{

    },




    searchBarInput:{
        marginTop:10,
        marginLeft:5,
        height:30,
        fontSize:15,
        width:80,

        color:'rgb(166,166,166)',
        borderRadius:10,
        padding:5,

        backgroundColor:'white',
        borderWidth:1,
        overflow:'hidden',
        textAlign:'center',

        borderColor:'rgb(166,166,166)',
    },



    sectionAllLabel:{
        flexDirection:'row',
        alignItems:'center',
        marginTop:10,
    },
    sectionAllLeft:{
        // backgroundColor:'#f44848',
        backgroundColor:'rgba(0,0,0,0)',
        width:15,
        height:15,
        margin:10,
        marginLeft:0,
        borderRadius:5,

    },
    sectionAllInfo:{
        // paddingLeft:20,
        fontSize:15,

    },
    labelAll:{
        width:window.width,
    }

})


