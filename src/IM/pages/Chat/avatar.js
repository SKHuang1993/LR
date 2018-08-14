/**
 * Created by yqf on 2017/11/3.
 */






import {Component} from 'react';
import React, { PropTypes } from 'react';
import {
    Image,
    StyleSheet,
    View,
    Text
} from 'react-native';

export default class Avatar extends Component {

    render(){


        return(

            <View style={[styles[this.props.position].container]}>

                <Image
                    style={[styles[this.props.position].image]}
                    source={{uri:this.props.avatarPath}}

                ></Image>


            </View>

        )

    }



}



const styles={


    left: StyleSheet.create({

        container:{
            marginRight: 8,
        },

        image: {
            height: 36,
            width: 36,
            borderRadius: 3,
        },
    }),

    right:StyleSheet.create({

        container:{
            marginLeft: 8,
        },

        image: {
            height: 36,
            width: 36,
            borderRadius: 3,
        },
    }),


}
