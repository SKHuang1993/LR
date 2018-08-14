import { BaseComponent } from '../../components/locale';
let lan = BaseComponent.getLocale();


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
  Animated,
  RefreshControl, Alert
} from 'react-native';

import { WhiteSpace, InputItem, Picker, ActivityIndicator, Popup } from 'antd-mobile';
import Flex from '../../components/flex';
import List from '../../components/list';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../../components/button';
import Radio from '../../components/radio';
import PassgerEdit from './passagerEdit';
import Passengers from '../../stores/booking/passenger-list';
import { observer } from 'mobx-react/native';
import { CertificateInfo, AccountInfo } from '../../utils/data-access/';
import { toJS, observable } from 'mobx';
import NoDataTip from '../../components/noDataTip.1';
import Enumerable from 'linq';
const Item = List.Item;
const Brief = Item.Brief;
const RadioItem = Radio.RadioItem;

@observer
export default class PassagerList extends Component {

  static defaultProps = {
    navLeftClick: () => { },
  }
  constructor(props) {
    super(props);
    this.store = new Passengers(this.props.passengers);
    this.store.userInfo = AccountInfo.getUserInfo();
    this.store.searchRequst = this.props.param;
    this.store.getPassengerList(this.props.booker.UserCode);
  }

  refresh = (passenger, certificate) => {
    if (passenger.PersonCode) {
      let target = Enumerable.from(this.store.passengers).firstOrDefault(o => o.PersonCode == passenger.PersonCode, -1);
      if (target != -1) {
        target.defaultCertificate = certificate;
      }
    }
    this.store.getPassengerList(this.props.booker.UserCode);
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
    return <PassagerItem booker={this.props.booker} rowData={rowData} props={this.props} store={this.store} navigator={this.props.navigator} refresh={(passenger, certificate) => this.refresh(passenger, certificate)} />
  }

  render() {
    let flightList = this.props.selectedFlights;
    return (
      <View style={styles.container}>
        <NavBar title={lan.booking_take_advantage_of_the_opportunity} navigator={this.props.navigator} rightText={lan.booking_newly_added} onRightClick={() => {
          this.props.navigator.push({
            component: PassgerEdit,
            type: 'Bottom',
            passProps: {
              booker: this.props.booker,
              passenger: null,
              selectedCertificate: this.props.param.ticketType == 0 ? {
                CertificateName: lan.booking_id,
                ProofType: 'ID',
                Number: null,
                EndDate: null
              } : {
                  CertificateName: lan.booking_passport,
                  ProofType: 'PP',
                  Number: null,
                  EndDate: null
                },
              refresh: (passenger, certificate) => this.refresh(passenger, certificate)
            }
          })
        }} />
        <View style={{ flex: 1 }}>
          <ListView
            enableEmptySections={true}
            dataSource={this.store.getDataSource}
            renderRow={this._renderRow.bind(this)}
            refreshControl={
              <RefreshControl
                onRefresh={() => this.store.getPassengerList(this.props.booker.UserCode)}
                refreshing={this.store.isLoading}
              />
            }
          />
          {this.store.passengers.length == 0 && this.store.isLoading == false && <NoDataTip />}
        </View>
        {/*{lan.booking_bottom_bar}*/}
        <Button type='barButton' onClick={() => {
          let result = Enumerable.from(this.store.passengers).where(o => o.checked).toArray();
          this.props.addPassengers(result);
          this.props.navigator.pop();
        }
        }>{lan.booking_determine}</Button>
        {/*<ActivityIndicator toast text={lan.booking_loading} animating={this.store.isLoading} />*/}
      </View>
    )
  }
}

@observer
class PassagerItem extends Component {
  render() {
    const { productType, employeeList } = this.props.props;
    let rowData = this.props.rowData;
    let fullNameEn = [];
    let proof;
    if (rowData.LastNameEn && rowData.LastNameEn.length > 0) {
      fullNameEn.push(rowData.LastNameEn);
    }
    if (rowData.FirstNameEn && rowData.FirstNameEn.length > 0) {
      fullNameEn.push(rowData.FirstNameEn);
    }
    if (rowData.defaultCertificate) {
      proof = `${rowData.defaultCertificate.CertificateName}：${rowData.defaultCertificate.Number}`;
    }
    return (
      <Item check={rowData.checked} onClick={() => {
        if (productType == 3 && this.props.store.passengers.filter(o => o.checked).length + employeeList.length == 5
          && !rowData.checked) {
          Alert.alert("", "火车票下单最多为5名乘客");
          return;
        }
        rowData.checked = !rowData.checked;
      }} extra={
        // 编辑按钮
        <TouchableOpacity onPress={() => {
          if (this.props.navigator) {
            this.props.navigator.push({
              component: PassgerEdit,
              type: 'Bottom',
              passProps: {
                booker: this.props.booker,
                selectedCertificate: rowData.defaultCertificate,
                passenger: toJS(rowData),
                searchRequst: this.props.searchRequst,
                refresh: (passenger, certificate) => this.props.refresh(passenger, certificate)
              }
            })
          }
        }

        } style={{ padding: 8, }}>
          <Icon icon='0xe685' style={styles.iconEdit} />
        </TouchableOpacity>
      } multipleLine>
        <Text style={styles.name}>{rowData.FullName}  {fullNameEn.join('/')} </Text>
        {proof ? <Brief><Text style={{ fontSize: 12 }}>{proof}</Text></Brief> :
          <Brief><Icon icon={'0xe67a'} style={styles.iconWarning} /><Text style={styles.TextWarning}>{lan.booking_incomplete_information_please_click_add}</Text></Brief>}
      </Item>)
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
  },
  name: {
    color: '#333'
  }


});

