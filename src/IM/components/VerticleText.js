/**
 * Created by yqf on 2018/1/22.
 */
/**
 * Created by yqf on 17/2/15.
 */
import React from 'react';
import {
    View,
    Text,
    Image,
    ListView,
    StyleSheet,
    TouchableOpacity,
    InteractionManager,
    Dimensions
} from 'react-native';


const window={

    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,

}

export default class VerticleText extends React.Component{
    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        // console.log('edit传过来的样式')
        // console.dir(this);

        var number=14;
        var data=[];
        var tempString=this.props.text;

        var currentCloumn='';
        for(i=tempString.length;i>=0;i--)
        {

            currentCloumn+=tempString.charAt(i)+'\n';
            if((tempString.length-i)%number==0)
            {

                var soreColumn='';
                for(k=0;k<currentCloumn.length;k++)
                {
                    soreColumn+=currentCloumn.charAt(currentCloumn.length-k)
                }
                data.push(soreColumn);
                currentCloumn='';
            }

        }


        this.state = {

            style:props.style,
            dataSource:new ListView.DataSource({
                rowHasChanged:(r1,r2) => r1 !==r2,
                sectionHeaderHasChanged:(s1,s2) => s1 !== s2
            }),
            data:data,
        };
    }



    render(){


        return(
            <View style={styles.main}>

                <ListView
                    contentContainerStyle={{ flexDirection:'row', alignItems:'center', flexWrap:'wrap',}}
                    renderRow={this.renderRow.bind(this)}
                    dataSource={this.state.dataSource.cloneWithRows(this.state.data)}

                />
            </View>
        );
    }


    renderRow(data)
    {



        return (

            <View style={{}}>
            <Text style={this.props.style} onPress={()=>{
                this.props.onPress()
            }}>
                {data}
            </Text>
        </View>
        )

    }

}



var styles =StyleSheet.create({


    main:{
        // flex:1,
        // backgroundColor:'translate',

    },


    list:{
        flexDirection:'row',
        alignItems:'center',
        flexWrap:'wrap',
    },

    listItem:{
        // backgroundColor:'yellow',
        margin:0,
    },



})
