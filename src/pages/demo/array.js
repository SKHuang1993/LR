
import React,{Component} from 'react'
import {StyleSheet,Text,View,Image,TouchableHighlight,Animated} from 'react-native';

export default class Array extends Component{
    constructor(props){
        super(props);

      
      
        this.state = {
        //isArray: new Array(3)
        };
    }


    render(){
        //let icon = this.icons['down'];

        // if(this.state.expanded){
        //     icon = this.icons['up'];
        // }

        let data=new Array(3);
        console.log(111,data)
        
        
        return (
            <View>
            <Text>111</Text>
            
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container   : {
        backgroundColor: '#fff',
        margin:10,
        overflow:'hidden'
    },
    titleContainer : {
        flexDirection: 'row'
    },
    title       : {
        flex    : 1,
        padding : 10,
        color   :'#2a2f43',
        fontWeight:'bold'
    },
    button      : {

    },
    buttonImage : {
        width   : 30,
        height  : 25
    },
    body        : {
        padding     : 10,
        paddingTop  : 0
    }
});

