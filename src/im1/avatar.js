import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text
} from 'react-native';



export default class Avatar extends React.Component {
  render() {
    return (
        <View style={[styles[this.props.position].container, ]}>
            <View>
              <Image style={[styles[this.props.position].image, ]} source={{uri:this.props.avatarPath}} />
            </View>
        </View>
    );
  }
}

const styles = {
  left: StyleSheet.create({
    container: {
      marginRight: 8,
    },
    image: {
      height: 36,
      width: 36,
      borderRadius: 3,
    },
  }),
  right: StyleSheet.create({
    container: {
      marginLeft: 8,
    },
    image: {
      height: 36,
      width: 36,
      borderRadius: 3,
    },
  }),
};

