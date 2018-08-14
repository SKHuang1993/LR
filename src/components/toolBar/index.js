

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity
} from 'react-native';

import Flex from '../../components/flex';
import Icon from '../../components/icons/icon';
import '../../utils/date';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'




export default class ToolBar extends Component {

  static defaultProps = {
       
        itemColor: '#fff',
        stateColor:'#fff'
    };
  render() {
    return (
      <Flex wrap='wrap' justify={"between"} style={[styles.container,this.props.style]} >

        {this.props.actions.map((action: Object, index: number) => {

          return (
            <TouchableOpacity activeOpacity={.7} style={styles.item} onPress={action.onPress} key={index}>
              <View style={styles.iconBox}>
                <Icon icon={action.icon} style={[styles.icon,{color:this.props.itemColor}]} />
                { action.aloneActiveTab == true ||  this.props.activeTab == index ? <View style={[styles.state,{backgroundColor:this.props.stateColor}]}></View> : null}
              </View>
              <Text style={[styles.text,{color:this.props.itemColor}]}>{action.title}</Text>
            </TouchableOpacity>
          )

        })}


      </Flex>
    )

  }

}






const styles = StyleSheet.create({
  container: {
   
    height: 49,
    backgroundColor: COLORS.primary,
  },
  icon: {
    fontSize: 18,
    color: '#fff',

  },
  text: {
    fontSize: 14,
    color: '#fff'
  },
  state: {
    position: 'absolute',
    top: 0,
    right: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff'
  },
  iconBox: {
    marginBottom: 1,
    //width:60,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  }

});

