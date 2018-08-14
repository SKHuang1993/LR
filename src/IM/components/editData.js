/**
 * Created by yqf on 2017/11/5.
 */



import React, { Component } from 'react';
import { observer } from 'mobx-react/native';
import {observable, autorun,computed, extendObservable, action, toJS } from 'mobx'


import {


    StyleSheet,
    View,
    Image,
    Text,
    ListView,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Alert
    // Navigator,

} from 'react-native';
import YQFNavBar from './yqfNavBar';

let window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,
}





class  EditDataModel extends  Component{



    @observable defaultValue = null;
    @observable selectIndex = 0;
    @observable selectColor = '#000000';
    @observable isTapColor=false;

    @observable selectTemplateDict ={};//模版
    // @observable selectPicture ={};//图片

    //模版
    @observable colorArray =[];



    // @observable TemplateArray =this.titleArray[this.selectIndex].items.slice();

    @computed get getDataSource(){

        ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
        return ds.cloneWithRows(this.colorArray.slice());
    }

}



@observer

export  default  class EditData extends Component
{

    constructor(props)
    {
        super(props);

        this.store = new EditDataModel();


        if(props.defaultValue){

            //可能会出现竖行的情况，需要适配好
            // console.log('上一个页面传过来的值')
            // console.dir(props.defaultValue);
            // str = this.props.posterPlaceholder.replace(/\s+/g,"");
            // this.store.defaultValue = props.defaultValue;


            //数据可能经过换行 空格等。这里进行处理(其实这么处理是不对的。传递过来的数据本来就不需要修改。依然就上一个页面的数据照样传递就可以了)

            // this.store.defaultValue = this.props.defaultValue.replace(/\s+/g,"");
            this.store.defaultValue = this.props.defaultValue;

        }

        if(props.isShowColorBoard){
            this.store.selectColor = '#000000';
        }else {
            this.store.selectColor = '#000000';
        }

        //需要将换行切除
        if(props.isNeedDeleteLine){
           this.store.defaultValue = this.props.defaultValue.replace(/\s+/g,"");

        }


        this.store.colorArray = [
            '#EC2914',
            '#BFF232',
            '#000000',
            '#FFFFFF',
            '#FF2020',
            '#33CDFF',
            '#04F431',
            '#BEF404',
            '#FFF43C',
            '#FF7633',
        ]

        this.state={

            text:this.props.value,
        };
    }


    _confirm()
    {

        let text = this.store.defaultValue;//这是输入的文字



        if(text.length == 0)
        {


            text=""
            // Alert.alert('文本不能为空');
            // return;
        }




            //显示颜色
            if(this.props.isShowColorBoard){

                if(this.props.getDetail){

                    //证明有点击了颜色
                    if(this.store.isTapColor==true){
                        this.props.getDetail(text,this.store.selectColor);

                    }else{
                        //不要改变颜色，还是用最初的颜色
                        this.props.getDetail(text,'Normal');

                    }


                }

            }else {

                //不显示颜色

                //提出提示框，将输入的文字传回去
                if(this.props.getDetail){
                    this.props.getDetail(text);
                }

            }



            this.props.navigator.pop();




    }



    _renderNav(){

        return(
            <YQFNavBar
                navigator={this.props.navigator}
                title={this.props.title}
                leftIcon={'0xe183'}
                rightText={'提交'}

                              onLeftClick={()=>{


            this.props.navigator.pop();

                                  }}
                              onRightClick={()=>{this._confirm()}}
            />

        )


    }

    _renderTextInput(){

        var str;


        //首先判断是否有海报的posterPlaceholder
        if(this.props.posterPlaceholder){
            str = this.props.posterPlaceholder.replace(/\s+/g,"");
        }else if(this.props.placeholder){
             str = this.props.placeholder.replace(/\s+/g,"");
        }else {
            str=null;
        }

        return(
            <View style={{backgroundColor:'white',}}>

                <TextInput

                    underlineColorAndroid={'transparent'}
                    multiline={true}
                    value={this.store.defaultValue}
                    placeholder={str}
                    returnKeyType={'send'}
                    onChangeText={(text)=>{

                        this.store.defaultValue = text;


                        }}

                    style={{height:window.height/2-80,backgroundColor:'white',fontSize:15,margin:5,color:this.store.selectColor}}>


                </TextInput>



            </View>
        )

    }

    renderColorItem = (data,sectionId,rowId)=>{
        return(

            <TouchableOpacity onPress={()=>{

                this.store.isTapColor = true;
                this.store.selectIndex = rowId;
                this.store.selectColor = this.store.colorArray[rowId];


            }}>

            <View style={{backgroundColor:data,width:20,height:20,margin:5}}>

            </View>
            </TouchableOpacity>
        )

    }


    _renderColorBoard = ()=>{

        if(this.props.isShowColorBoard){

            return (

                <View style={{flexDirection:'row',marginTop:5}}>
                    <ListView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={ {flexDirection:'row'}}
                        removeClippedSubviews={false}
                        initialListSize={10}
                        style={{}}
                        renderRow={this.renderColorItem}
                        dataSource={this.store.getDataSource}>
                    </ListView>

                </View>
            )


        }
        return null;



    }


    render()
    {
        return(


            <View style={{backgroundColor:'rgb(235,235,235)',flex:1}}>

                {this._renderNav()}

                {this._renderTextInput()}

                {this._renderColorBoard()}


            </View>




        )
    }




}





