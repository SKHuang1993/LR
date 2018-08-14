import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
} from 'react-native';

import Icon from '../icons/icon'

export default class Stars extends Component {

    static defaultProps = {

        starNumber:5,
        starStyle:{},
        type:'',
    }
 
    render() {
           let v = this.props.starNumber ;
        let starRed = [], starGray = [], starHalf = '', star=[];

        let styles = {
            width: 20, height: 20,
        }
        let starStyle = {
            color: '#e8952b', fontSize: 16
        }

        for (let i = 0; i < parseInt(v); i++) {
            starRed.push(<Image key={i} style={styles} source={require('./img/red.png')} />)
        }
        for (let i = 0; i < parseInt(5 - v); i++) {
            starGray.push(<Image key={i} style={styles} source={require('./img/gray.png')} />)
        }
        starHalf = v % 1 > 0 ? <Image style={styles} source={require('./img/half.png')} /> : null;

        for (let i = 0; i < v; i++) {
            star.push(<Icon key={i} icon={'0xe601'} style={[starStyle,this.props.starStyle ]} />)
        }
          let  grade = [ starRed , starHalf, starGray];
        return (
           <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                }}>
                   
                    {this.props.type=='grade' ? grade :star}
                </View>

        )

        
    }
}

