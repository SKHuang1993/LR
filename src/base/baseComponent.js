/**
 * Created by lipeiwei on 16/9/30.
 */


import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';
//import NavigationBar from '../component/navigationBar';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  }
});
function Container(props,) {
  return <div>Hello {props.name}</div>
}
class BaseComponent extends Component {

  constructor(props) {
    super(props);
   
  }

  



  renderBody() {

  }

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        {this.renderNavigationBar()}
        {this.renderBody()}
      </View>
    );
  }

  componentWillUnmount() {

  }

 
}

export default BaseComponent;