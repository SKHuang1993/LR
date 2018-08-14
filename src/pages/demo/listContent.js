import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView
} from 'react-native';
import ListCards from './listCards';
class ListContent extends Component{
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state={
      dataSource: ds.cloneWithRows(this._genrows()),
    };
  }
  // componentWillMount(){
  //   this.setState({dataSource:this.state.dataSource.cloneWithRows(this._genrows())});
  // }

  _genrows(){
    var rows=[];
    for(let i=0;i<5;i++){
      var rowtmp={};
      rowtmp.name='测试'+i;
      rowtmp.title='标题'+i;
      rowtmp.fromwhere='来源'+i;
      rows.push(rowtmp);
    }
    console.log(JSON.stringify(rows));
    return rows;
  }

 _renderRows(rowData){
   return(
     <ListCards name={rowData.name} title={rowData.title} fromwhere={rowData.fromwhere} />
   )
 }

  render(){
    return(
      <ListView
        dataSource={this.state.dataSource}
        renderRow={(rowData) =>this._renderRows(rowData)}
      />
    )
  }
}

module.exports=ListContent;
