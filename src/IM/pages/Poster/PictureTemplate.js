/**
 * Created by yqf on 2017/11/29.
 */

//图片模版
import {observer} from 'mobx-react/native';
import {observable, autorun, computed, extendObservable, action, toJS} from 'mobx'

import {Component} from 'react';
import React, {PropTypes} from 'react';


import {

    View,
    Text,
    Image,
    StyleSheet,
    ListView,
    ScrollView,
    TouchableWithoutFeedback,
    InteractionManager,
    StatusBar,
    WebView,
    AsyncStorage,
    TouchableOpacity,
    Modal,
    DeviceEventEmitter,
    ActivityIndicator,
    Switch,
    Platform,
    Dimensions,
    RefreshControl

} from  'react-native';


import YQFNavBar from '../../components/yqfNavBar';
import YQFEmptyView from '../../components/EmptyView';

import Icon from '../../components/icon';
import PicturePreview from './PosterPreview'
import {Chat} from '../../utils/chat';
import {RestAPI, ServingClient} from '../../utils/yqfws';
import Colors from '../../Themes/Colors';
import Search from '../Contact/FriendSearch';
import LoadMoreFooter from '../../components/LoadMoreFooter';
import ImagePicker from 'react-native-image-picker';

import {FLEXBOX} from '../../styles/commonStyle'

const window = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
}


const leftListViewWidthScale = 0.28;
const rightListViewWidthScale = 1 - leftListViewWidthScale;
let canLoadVideoMore = false;


class PictureTemplateModel extends Component {


    @observable PageSize = 10;//数目
    @observable PageCount = 1;//页码

    @observable isVideoRefreshing = false;//是否刷新
    @observable RowCount = 0;
    @observable thirdArray = [];


    @observable templateType = 'picture';//图片
    @observable loading = false;
    @observable isEmpty = false;
    @observable selectIndex = 0;
    @observable selectSecondIndex = 0;


    //缓存的素材
    @observable myTitleArray = Chat.LabelInfoResult.LabelTypeInfos;

    @observable mySecondArray = this.myTitleArray[this.selectIndex].LabelInfos.slice();

    //第二级数组

    @computed get getTestTitleDataSource() {

        for (var i = 0; i < this.myTitleArray.length; i++) {
            this.myTitleArray[i].select = false;
        }
        this.myTitleArray[this.selectIndex].select = true;

        ds4 = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return ds4.cloneWithRows(this.myTitleArray.slice());

    }



    @computed get getTestSecondDataSource() {


        if (this.mySecondArray && this.mySecondArray.length > 0) {

            for (var j = 0; j < this.mySecondArray.length; j++) {
                this.mySecondArray[j].select = false;
            }

            this.mySecondArray[this.selectSecondIndex].select = true;

        }


        ds5 = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return ds5.cloneWithRows(this.mySecondArray.slice());
    }


    @computed get getSecondDataSource() {

        ds2 = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return ds2.cloneWithRows(this.secondArray.slice());
    }

    @computed get getThirdDataSource() {

        ds3 = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return ds3.cloneWithRows(this.thirdArray.slice());
    }

}


photoOptions2 = {

    mediaType:'image',
    quality: 0.70,
    allowsEditing: false,
    noData: false,
    maxWidth: FLEXBOX.width * FLEXBOX.pixel,
    maxHeight: FLEXBOX.height * FLEXBOX.pixel,
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
}



@observer
export  default  class PictureTemplate extends Component {

    constructor(props) {
        super(props);

        this.store = new PictureTemplateModel();
        if (props.templateType) {
            this.store.templateType = props.templateType;
        }

    }

    componentDidMount = () => {
        this.onRefresh();
    }

    onScroll() {
        if (!canLoadVideoMore) canLoadVideoMore = true;
    }

    onRefresh = async() => {

        this.store.PageCount = 1;//刷新时将页码设置为1
        canLoadVideoMore = false;
        this.store.isVideoRefreshing = true;
        this._fetchData();

    }

    onEndReach = async() => {

        if (this.store.thirdArray.length == 0 || (this.store.RowCount > 0 && this.store.RowCount <= this.store.thirdArray.length)) {
            return;
        }

        if (canLoadVideoMore) {

            var count = this.store.PageCount;
            this.store.PageCount = count + 1;

            this._fetchData();
        }


    }
    renderFooter = () => {


        if (this.store.thirdArray.length == 0 || (this.store.RowCount > 0 && this.store.RowCount <= this.store.thirdArray.length)) {

            return (

                <View style={{justifyContent:'center',alignItems:'center',margin:10}}>

                    <Text>没有更多了...</Text>

                </View>
            )
        }

        if (canLoadVideoMore) {

            return <LoadMoreFooter/>
        }
    }



    //备份王欢的需求
    _fetchDataWH = async() => {

        this.store.loading = true;
        //刷新的时候将数组清空
        this.store.thirdArray = [].slice();

        var LabelID = null;
        var param;

        if(this.store.mySecondArray && this.store.mySecondArray[this.store.selectSecondIndex]){
            var temp = this.store.mySecondArray[this.store.selectSecondIndex];

            if(temp.LabelName){
                param = {
                    StartDate: '2016-11-19T00:00:00',
                    EndDate:'2030-01-10T00:00:00',
                    PageSize: this.store.PageSize,
                    PageCount: this.store.PageCount,
                    FileTypeID: 1,
                    LabelTypeID: this.store.myTitleArray[this.store.selectIndex].LabelTypeID,
                    LabelID: LabelID
                }
            }else {

                param ={
                    StartDate:'2016-11-19T00:00:00',
                    EndDate:'2030-01-10T00:00:00',
                    FileTypeID:1,
                    PageSize:1000,
                    Condition:temp.DistrictName
                };

            }
        }


        

        var result = await  ServingClient.execute('Channel.MaterialLibraryByCondition', param);


        // console.log('素材搜索结果');
        // console.dir(result.RowCount);


        //加载完马上将刷新关掉
        this.store.isVideoRefreshing = false;

        if (result && result.MaterialLibraryList && result.MaterialLibraryList.length > 0) {

            var FileIds = [];//视频请求数组
            //将所有的FileTyleID ==2拿出来
            for (var i = 0; i < result.MaterialLibraryList.length; i++) {

                //视频
                if (result.MaterialLibraryList[i].FileTypeID == 2) {

                    FileIds.push(result.MaterialLibraryList[i].FileID);
                }
            }

            /*
            var videoResult = await  ServingClient.execute('Video.GetVideoInfo', {FileIds: FileIds});
            if (videoResult && videoResult.Videos && videoResult.Videos.length > 0) {
                for (var k = 0; k < result.MaterialLibraryList.length; k++) {

                    for (var j = 0; j < videoResult.Videos.length; j++) {

                        if (videoResult.Videos[j].FileID == result.MaterialLibraryList[k].FileID) {
                            result.MaterialLibraryList[k].Video = videoResult.Videos[j];
                        }
                    }

                }

            }
            */



            this.store.RowCount = result.RowCount;
            this.store.isLoading = false;
            this.store.isEmpty = false;

            //刷新
            if (this.store.PageCount == 1) {


                this.store.thirdArray = result.MaterialLibraryList.slice();

            } else {  //如果是加载更多的话，则将新视频，拼接到原来的旧数组上面去


                //关闭加载更多
                canLoadVideoMore = false;
                this.store.thirdArray = this.store.thirdArray.concat(result.MaterialLibraryList).slice();
            }

        }

        else {


            this.store.isLoading = false;
            this.store.isEmpty = true;
        }


    }



    _fetchData = async() => {


        this.store.loading = true;
        //刷新的时候将数组清空


        var LabelID = null;
        var param;

        if(this.store.mySecondArray && this.store.mySecondArray[this.store.selectSecondIndex]){
            var temp = this.store.mySecondArray[this.store.selectSecondIndex];
            LabelID = this.store.mySecondArray[this.store.selectSecondIndex].LabelID;
            if(temp.LabelName){

                param = {
                    StartDate: '2016-11-19T00:00:00',
                    EndDate:'2030-01-10T00:00:00',
                    PageSize: this.store.PageSize,
                    PageCount: this.store.PageCount,
                    FileTypeID: 1,
                    LabelTypeID: this.store.myTitleArray[this.store.selectIndex].LabelTypeID,
                    LabelID: LabelID
                }
            }else {

                 param ={
                    StartDate:'2016-11-19T00:00:00',
                    EndDate:'2030-01-10T00:00:00',
                    // FileTypeID:1,
                     PageSize:1000,
                    Condition:temp.DistrictName
                };

            }
        }

        var result = await  ServingClient.execute('Channel.MaterialLibraryByCondition', param);

        // console.log('素材搜索结果');
        // console.dir(result);

        //加载完马上将刷新关掉
        this.store.isVideoRefreshing = false;

        if (result && result.MaterialLibraryList && result.MaterialLibraryList.length > 0) {

            var FileIds = [];//视频请求数组
            //将所有的FileTyleID ==2拿出来
            for (var i = 0; i < result.MaterialLibraryList.length; i++) {

                //视频
                if (result.MaterialLibraryList[i].FileTypeID == 2) {

                    FileIds.push(result.MaterialLibraryList[i].FileID);
                }
            }

            var videoResult = await  ServingClient.execute('Video.GetVideoInfo', {FileIds: FileIds});


            if (videoResult && videoResult.Videos && videoResult.Videos.length > 0) {


                for (var k = 0; k < result.MaterialLibraryList.length; k++) {

                    for (var j = 0; j < videoResult.Videos.length; j++) {

                        if (videoResult.Videos[j].FileID == result.MaterialLibraryList[k].FileID) {
                            result.MaterialLibraryList[k].Video = videoResult.Videos[j];
                        }
                    }

                }

            }


            this.store.RowCount = result.RowCount;
            this.store.isLoading = false;
            this.store.isEmpty = false;

            //刷新
            if (this.store.PageCount == 1) {

                this.store.thirdArray = result.MaterialLibraryList.slice();

            } else {  //如果是加载更多的话，则将新视频，拼接到原来的旧数组上面去


                //关闭加载更多
                canLoadVideoMore = false;
                this.store.thirdArray = this.store.thirdArray.concat(result.MaterialLibraryList).slice();
            }

        }

        else {


            this.store.isLoading = false;
            this.store.isEmpty = true;
        }

    }


    launchImageLibrary = (callback) => {

        StatusBar.setBarStyle("default");


        ImagePicker.launchImageLibrary(photoOptions2, (response) => {


            // console.log('ImagePicker  response')
            // console.dir(response);

            StatusBar.setBarStyle("light-content");

            if (response.uri) {

                this.props.navigator.pop();

                if (this.props.getPicture) {

                    // this.props.getPicture(response.uri)
                    //将整个response都返回回去
                    this.props.getPicture(response)
                }

            }
        });
    }

    _ClickTitleItem = (data, rowId) => {


        this.titleListview.scrollTo({x: 50 * rowId, y: 0, animated: true})

        var temp = this.store.myTitleArray;

        for (var i = 0; i < temp.length; i++) {
            temp[i].select = false;
        }
        temp[rowId].select = true;

        this.store.selectIndex = rowId;
        this.store.titleArray = temp.slice();


        console.warn('点击了标题的时候，默认点击了第二数组的第0个');

        this.store.selectSecondIndex = 0;
        this.store.mySecondArray = this.store.myTitleArray[rowId].LabelInfos.slice();

         this.store.thirdArray = [].slice();//点击了标题，则马上将thirdArray清空

        this._fetchData();


    }

    _ClickSecondItem = (data, rowId) => {

        var temp = this.store.mySecondArray;

        for (var i = 0; i < temp.length; i++) {
            temp[i].select = false;
        }

        temp[rowId].select = true;

        this.store.selectSecondIndex = rowId;
        this.store.mySecondArray = temp.slice();

        this.store.thirdArray = [].slice();//点击了第二级，则马上将thirdArray清空

        this._fetchData();

    }


    //跳转到素材搜索页面
    _ToSearchTemplate = () => {

        var _this = this;

        this.props.navigator.push({
            component: Search,
            passProps: {
                type: 'PictureTemplate',

                    getSearchTemplate:(template)=>{

                        if(_this.props.getPicture){
                            _this.props.getPicture(template)
                        }

                        _this.props.navigator.pop();


                    }


            }
        })

    }

    //导航条
    renderNavBar = () => {
        return (
            <YQFNavBar leftIcon={'0xe183'}
                       rightText={'手机相册'}
                       onRightClick={()=>{

                            this.launchImageLibrary();
                        }}
                       onLeftClick={()=>{this.props.navigator.pop()}}
                       title={'选择图片'}/>
        )
    }
    //搜索条
    renderSearchBar = () => {
        return (

            <TouchableOpacity onPress={()=>{

                this._ToSearchTemplate();

                }}


                              style={{backgroundColor:Colors.colors.Chat_Color230,height:45}}>


                <View
                    style={{flex:1,margin:8,borderRadius:3, backgroundColor:'white', justifyContent:'center',alignItems:'center',flexDirection:'row'}}>

                    <Icon size={13} color={Colors.colors.Chat_Color153} icon={0xe171} style={{marginRight:3}}/>

                    <Text style={[{fontSize:13,marginLeft:3,color:Colors.colors.Chat_Color153}]}>
                        {'输入目的地/标签/关键词查找素材'}
                    </Text>


                </View>


            </TouchableOpacity>
        )
    };

    _renderTitleItem = (data, sectionId, rowId) => {


        var titleColorStyle;
        if (data.select == true) {
            titleColorStyle = {
                color: '#F44848',
                fontSize: 15
            }
        } else {
            titleColorStyle = {
                color: '#333333',
                fontSize: 15
            }
        }

        return (


            <TouchableOpacity style={{}} onPress={()=>{
                this._ClickTitleItem(data,rowId)
            }}>
                <Text style={[{margin:10,},titleColorStyle]}>{data.LabelTypeName}</Text>
                {
                    data.select == true ?

                        <View
                            style={{backgroundColor:'#F44848',height:2,position:'absolute',bottom:0,left:0,right:0}}></View>

                        :
                        null

                }

            </TouchableOpacity>

        )

    }

    renderSecondItem = (data, sectionId, rowId) => {

        var titleColorStyle;
        if (data.select == true) {
            titleColorStyle = {
                color: '#F44848',
            }
        } else {
            titleColorStyle = {
                color: '#333333',
            }
        }

        var text;
        if(data.LabelName){
            text = data.LabelName;
        }else if(data.DistrictName){
            text = data.DistrictName;
        }else {
            text = 'bug'
        }

        return (

            <TouchableOpacity onPress={()=>{

                this._ClickSecondItem(data,rowId);
            }} style={{backgroundColor:'white',alignItems:'center',justifyContent:'center'}}>
                <Text style={[{padding:10,fontSize:12},titleColorStyle]}>{text}</Text>

            </TouchableOpacity>



        )
    }

    _ToPicturePreview = (data) => {

        this.props.navigator.push({
            component: PicturePreview,
            passProps: {

                picture: data
            }
        })

    }

    renderThirdItem = (data) => {

        return (

            <ImageItem item={data} click={()=>{

            this.props.navigator.pop();

            if(this.props.getPicture){

                            this.props.getPicture(data)

            }

        }

        }/>
        )


    }


    //标题栏(第一个ListView)
    renderTitleView = () => {

        var contentViewStyle = {
            flexDirection: 'row',
        }

        return (

            <View style={{height:40,backgroundColor:'white'}}>

                <ListView

                    ref={(titleListview)=>{this.titleListview = titleListview}}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    removeClippedSubviews={false}
                    initialListSize={10}
                    renderRow={this._renderTitleItem}
                    dataSource={this.store.getTestTitleDataSource}
                    contentContainerStyle={contentViewStyle}>


                </ListView>

            </View>
        )
    }


    //两个listview

    renderBig = () => {

        if (this.store.isLoading) {

            return (
                <YQFEmptyView title={'正在搜索 '+'   请稍候'} icon={'0xe653'}/>
            )
        }
        else if (this.store.isEmpty) {

            return (
                <YQFEmptyView title={'搜索不到对应的数据，请修改搜索关键词'} icon={'0xe15c'}/>
            )
        }


    }


    renderContent = () => {

        return (

            <View style={{flex:1, flexDirection:'row',marginTop:5}}>

                <ListView
                    style={{width:window.width*leftListViewWidthScale,backgroundColor:'rgb(220,220,220)'}}
                    renderRow={this.renderSecondItem}
                    removeClippedSubviews={false}
                    initialListSize={10}
                    dataSource={this.store.getTestSecondDataSource}

                >

                </ListView>


                <ListView

                    contentContainerStyle={ {flexDirection:'row',flexWrap:'wrap'}}
                    style={{width:window.width*rightListViewWidthScale,backgroundColor:'rgb(240,240,240)'}}
                    renderRow={this.renderThirdItem}
                    renderFooter={this.renderFooter}
                    onScroll={this.onScroll()}
                    onEndReached={this.onEndReach.bind(this)}
                    removeClippedSubviews={false}
                    initialListSize={10}
                    onEndReachedThreshold={20}
                    refreshControl={<RefreshControl refreshing={this.store.isVideoRefreshing}
                                    onRefresh={this.onRefresh.bind(this)}
                                    title="正在加载中..."
                                    color="#ccc"
                    />}


                    dataSource={this.store.getThirdDataSource}>
                </ListView>

            </View>
        )

    }


    render = () => {

        return (

            <View style={{flex:1,backgroundColor:'rgb(235,235,235)'}}>

                {this.renderNavBar()}
                {this.renderSearchBar()}
                {this.renderTitleView()}
                {this.renderContent()}

            </View>
        )

    }


}

@observer
class ImageItem extends Component {

    constructor(props) {
        super(props);

    }

    render = () => {

        const item = this.props.item;

        var uri;
        if (item.FileTypeID == 1) {

            var w = 131;
            var h =169;
            var scale = '!/fwfh/'+w+'x'+h;
            uri = Chat.getPosterImagePath(item.FilePath)+scale;


        } else {
            if (item && item.Video && item.Video.ImageUrl) {
                uri = item.Video.ImageUrl
            } else {
                uri = Chat.getFaceUrlPath(null);
            }
        }


        return (
            <TouchableOpacity
                onPress={()=>{

                        this.props.click();
                    }}
                style={styles.itemStyle}>

                <Image style={styles.itemImageStyle} source={{uri:uri}}>
                    {item.FileTypeID == 2 ?
                        <Icon size={30} style={{backgroundColor:'transparent'}} icon={'0xe6cc'} color={'white'}></Icon>
                        :
                        null

                    }
                </Image>

            </TouchableOpacity>
        )


    }

}






var scale = 131 / 169;

const styles = StyleSheet.create({

    itemStyle: {
        // 对齐方式
        alignItems: 'center',
        justifyContent: 'center',
        // 尺寸
        width: (window.width * rightListViewWidthScale - 20) / 2,
        height: (window.width * rightListViewWidthScale - 20) / 2 / scale,
        // 左边距
        margin: 5,
        marginBottom: 0,

    },

    itemImageStyle: {
        // 尺寸
        width: (window.width * rightListViewWidthScale - 20) / 2,
        height: (window.width * rightListViewWidthScale - 20) / 2 / scale,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'


    }


})