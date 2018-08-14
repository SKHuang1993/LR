import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
 
import Emoji from './emoji';
 
export default class MessageText extends React.Component {
  constructor(props) {
    super(props);
  }
 
  render() {
    //文本匹配正则分割到数组 split(/(\[.+?\])/)
    const text = this.props.ChatMessage.TextContent.Content;
    let textArray = text.split(/(\[[^[\]]+\])/);
    let domArray = textArray.map((v,k)=>{
      //是否匹配表情
      if(Emoji.map.has(v)){
        return <Image key={k} style={{ width: 20, height: 20, }} source={Emoji.map.get(v)} />
      }
      return <Text style={[styles[this.props.position].text]}  key={k}>
        {v}
      </Text>
    })
    return (
      <View style={[styles[this.props.position].container,]}>
        {/* <Text
          style={[styles[this.props.position].text]} >
          {this.props.ChatMessage.TextContent.Content}
          
        </Text> */}
 
        {domArray}
      </View>
    );
  }
}
 
const textStyle = {
  fontSize: 14,
  lineHeight: 18,
  marginTop: 0,
  //marginBottom: 5,
 // marginLeft: 10,
 // marginRight: 10,
};
 
const styles = {
  left: StyleSheet.create({
    container: {
      padding:9,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    text: {
      color: 'black',
      ...textStyle,
    },
    link: {
      color: 'black',
      textDecorationLine: 'underline',
    },
  }),
  right: StyleSheet.create({
    container: {
      padding:9,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
     // paddingTop:7,
     // paddingBottom:7,
    },
    text: {
      color: 'white',
      ...textStyle,
    },
    link: {
      color: 'white',
      textDecorationLine: 'underline',
    },
  }),
};