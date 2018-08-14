

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Navigator,
  ListView,
  TouchableOpacity,
  TouchableHighlight,
  Animated
} from 'react-native';

import { WhiteSpace, InputItem, Picker, ActivityIndicator, Popup } from 'antd-mobile';
import Flex from '../../components/flex';
import List from '../../components/list';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../../components/button';
import Radio from '../../components/radio';
const Item = List.Item;
const Brief = Item.Brief;
const RadioItem = Radio.RadioItem;

var {width,height} = Dimensions.get('window')
var lan = LanguageType.setType();
/** 需要的接口
 * Biz3.EmployeeByCondition  读取差旅宝员工
 */
// 差旅宝员工信息  数组对象新增 单选属性
const EmployeeInfos = [
  {
    "Checked": false,
    "PersonIDCardName": "苏木凤",
    "PersonPassportName": "",
    "PersonCode": "TG002M84e",
    "PersonName": "苏木凤",
    "PersonFirstNameEN": "",
    "PersonLastNameEN": "",
    "AccountName": "sumufeng@yiqifei.com",
    "DepartmentCode": "EH0070E",
    "DepartmentNr": "EH0070E",
    "DepartmentName": "A11",
    "CompanyCode": "EH007",
    "CompanyNr": "EH007",
    "CompanyName": "广州市中航服商务部国内组",
    "PersonCreateDate": "2014-10-29T16:00:39.933",
    "AccountCode": "TG000QA8",
    "AccountEmail": "sumufeng@yiqifei.com",
    "AccountStatus": 2,
    "Birthday": "1990-08-29T00:00:00",
    "Sex": 0,
    "PolicyID": 22,
    "PolicyName": "差旅政策1",
    "ThirdPartyID": "",
    "CostCenterID": 50,
    "CostCenterName": "it部成本",
    "RoleID": 324,
    "RoleName": "普通员工",
    "IsVirtualAccount": false,
    "ApproveID": 24,
    "ApproveName": "需要审批规则",
    "Annts": [
      {
        "AnntID": 6051707,
        "Name": "PHONE",
        "Value": "13560223245"
      },
      {
        "AnntID": 6051708,
        "Name": "EMAIL",
        "Value": "tqsumufeng@163.com"
      }
    ],
    "Proofs": [
      {
        "ProofID": 3062629,
        "Name": "PP",
        "Value": "G333456475"
      },
      {
        "ProofID": 3062628,
        "Name": "ID",
        "Value": "440881199008307248"
      }
    ],
    "Milescards": [
      {
        "MilesCardID": 10296,
        "Name": "003",
        "Value": "123ASD",
        "TypeName": "普通卡",
        "Issuer": "CA"
      },
      {
        "MilesCardID": 10295,
        "Name": "003",
        "Value": "SDFASD",
        "TypeName": "普通卡",
        "Issuer": "DZ"
      }
    ]
  },
  {
    "Checked": false,
    "PersonIDCardName": "苏木凤22",
    "PersonPassportName": "",
    "PersonCode": "TG002M811",
    "PersonName": "苏木凤222",
    "PersonFirstNameEN": "",
    "PersonLastNameEN": "",
    "AccountName": "sumufeng@yiqifei.com",
    "DepartmentCode": "EH0070E",
    "DepartmentNr": "EH0070E",
    "DepartmentName": "A11",
    "CompanyCode": "EH007",
    "CompanyNr": "EH007",
    "CompanyName": "广州市中航服商务部国内组",
    "PersonCreateDate": "2014-10-29T16:00:39.933",
    "AccountCode": "TG000QA8",
    "AccountEmail": "sumufeng@yiqifei.com",
    "AccountStatus": 2,
    "Birthday": "1990-08-29T00:00:00",
    "Sex": 0,
    "PolicyID": 22,
    "PolicyName": "差旅政策1",
    "ThirdPartyID": "",
    "CostCenterID": 50,
    "CostCenterName": "it部成本",
    "RoleID": 324,
    "RoleName": "普通员工",
    "IsVirtualAccount": false,
    "ApproveID": 24,
    "ApproveName": "需要审批规则",
    "Annts": [
      {
        "AnntID": 6051707,
        "Name": "PHONE",
        "Value": "13560223245"
      },
      {
        "AnntID": 6051708,
        "Name": "EMAIL",
        "Value": "tqsumufeng@163.com"
      }
    ],
    "Proofs": [
      {
        "ProofID": 3062629,
        "Name": "PP",
        "Value": "G333456475"
      },
      {
        "ProofID": 3062628,
        "Name": "ID",
        "Value": "440881199008307248"
      }
    ],
    "Milescards": [
      {
        "MilesCardID": 10296,
        "Name": "003",
        "Value": "123ASD",
        "TypeName": "普通卡",
        "Issuer": "CA"
      },
      {
        "MilesCardID": 10295,
        "Name": "003",
        "Value": "SDFASD",
        "TypeName": "普通卡",
        "Issuer": "DZ"
      }
    ]
  },
  {
    "Checked": false,
    "PersonIDCardName": "苏木凤23",
    "PersonPassportName": "",
    "PersonCode": "TG002M8223",
    "PersonName": "苏木凤222",
    "PersonFirstNameEN": "",
    "PersonLastNameEN": "",
    "AccountName": "sumufeng@yiqifei.com",
    "DepartmentCode": "EH0070E",
    "DepartmentNr": "EH0070E",
    "DepartmentName": "A11",
    "CompanyCode": "EH007",
    "CompanyNr": "EH007",
    "CompanyName": "广州市中航服商务部国内组",
    "PersonCreateDate": "2014-10-29T16:00:39.933",
    "AccountCode": "TG000QA8",
    "AccountEmail": "sumufeng@yiqifei.com",
    "AccountStatus": 2,
    "Birthday": "1990-08-29T00:00:00",
    "Sex": 0,
    "PolicyID": 22,
    "PolicyName": "差旅政策1",
    "ThirdPartyID": "",
    "CostCenterID": 50,
    "CostCenterName": "it部成本",
    "RoleID": 324,
    "RoleName": "普通员工",
    "IsVirtualAccount": false,
    "ApproveID": 24,
    "ApproveName": "需要审批规则",
    "Annts": [
      {
        "AnntID": 6051707,
        "Name": "PHONE",
        "Value": "13560223245"
      },
      {
        "AnntID": 6051708,
        "Name": "EMAIL",
        "Value": "tqsumufeng@163.com"
      }
    ],
    "Proofs": [
      {
        "ProofID": 3062629,
        "Name": "PP",
        "Value": "G333456475"
      },
      {
        "ProofID": 3062628,
        "Name": "ID",
        "Value": "440881199008307248"
      }
    ],
    "Milescards": [
      {
        "MilesCardID": 10296,
        "Name": "003",
        "Value": "123ASD",
        "TypeName": "普通卡",
        "Issuer": "CA"
      },
      {
        "MilesCardID": 10295,
        "Name": "003",
        "Value": "SDFASD",
        "TypeName": "普通卡",
        "Issuer": "DZ"
      }
    ]
  }
]



export default class Index extends Component {
  constructor(props) {
    super(props);
    let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource: ds.cloneWithRows(EmployeeInfos),
    }
  }


  // 处理点击数据
  getSelect = (rowData) => {

    rowData.Checked = !rowData.Checked;
    let position = EmployeeInfos.findIndex(o => o.PersonCode == rowData.PersonCode);
    if (position != -1) {
      EmployeeInfos.splice(position, 1, rowData);
    }
    let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.setState({
      dataSource: ds.cloneWithRows(EmployeeInfos)
    })


  }
  _renderRow(rowData: string, sectionID: number, rowID: number, ) {
    return <Item check={rowData.Checked} onClick={() => this.getSelect(rowData)} extra={
      <TouchableOpacity onPress={() => alert(1)} style={{ padding: 8, }}>
        <Icon icon='0xe685' style={styles.iconEdit} />
      </TouchableOpacity>
    } multipleLine>
      <Text>{rowData.PersonName} {rowData.Proofs == 'PP' ? rowData.PersonPassportName : null} </Text>
      <Brief><Text style={{fontSize:12}}>{lan.passport}：G1623237</Text></Brief>
      {/*证件不全显示*/}
      {/*<Brief><Icon icon={'0xe67a'} style={styles.iconWarning} /><Text style={styles.TextWarning}>信息不全，请点击补充</Text></Brief>*/}
    </Item>
  }

  render() {
    let flightList = this.props.selectedFlights;
    return (
      <View style={styles.container}>
        <NavBar title={lan.passengers_fillInInfo} navigator={this.props.navigator} />
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow.bind(this)}
        />
        {/*底部栏*/}
        <Button type='barButton'  >{lan.confirm}</Button>


      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.containerBg,
  },

  //列表样式
  listTitle: {
    flex: 1,
    fontSize: 16,

  },
  listWarning: {
    color: '#fa5e5b',
    fontSize: 12,
  },
  iconWarning: {
    color: '#fa5e5b',
    fontSize: 14,
    marginRight: 2,

  },
  TextWarning: {
    color: '#fa5e5b',
    fontSize: 12,
  },
  iconEdit: {
    color: '#999'
  }


});

