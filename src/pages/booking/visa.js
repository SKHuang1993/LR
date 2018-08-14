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
  Animated
} from 'react-native';

import { WhiteSpace, InputItem, Picker, Popup, Switch } from 'antd-mobile';
import ActivityIndicator from '../../components/activity-indicator';
import Flex from '../../components/flex';
import List from '../../components/list';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Button from '../../components/button';
import NoDataTip from '../../components/noDataTip.1';
import Radio from '../../components/radio';
import { observer } from 'mobx-react/native';
import Visa from '../../stores/booking/visa'
import PassgerEdit from './passagerEdit';
import Enumerable from 'linq';
import moment from 'moment';
import { CertificateInfo, AccountInfo } from '../../utils/data-access/';
const Item = List.Item;
const Brief = Item.Brief;
const RadioItem = Radio.RadioItem;

@observer
export default class Index extends Component {

  constructor(props) {
    super(props);
    this.store = new Visa(props.selectedFlights, props.param);
    this.store.userInfo = AccountInfo.getUserInfo();
    this.store.getProducts(props.productVisa);
  }


  getVisaResult = () => {
    let obj;
    let count = Enumerable.from(this.store.passengers).sum(o => Enumerable.from(o).count(o => o.checked));
    let selectedFlights = this.props.selectedFlights;
    let effectiveStart = selectedFlights[0].DepartureDate;
    let effectiveEnd = selectedFlights[selectedFlights.length - 1].ArrivalDate;
    let multVisa = Enumerable.from(this.store.multVisa).firstOrDefault(o => o.checked, null);
    if (multVisa) {
      obj = {
        "ProductCode": multVisa.GoodCode,
        "VisaType": multVisa.VisaTypeCode,
        "VisaName": multVisa.VisaName,
        "CountryCode": multVisa.Country,
        "CostPrice": multVisa.Cost,
        "UninPrice": multVisa.MinPrice,
        "CurrencyID": 4,
        "EstimatedWorkday": multVisa.Needday,
        "ValidDay": multVisa.Validday,
        "StopMaxDay": multVisa.Stay,
        "PassengersQty": this.props.passengers.length
      }
    }
    return obj;
  }

  render() {
    return (
      <View style={styles.container}>
        {this.store.isEmptyData ? <NoDataTip /> : null}
        <NavBar title={lan.booking_visa_products} navigator={this.props.navigator} />
        <ScrollView>
          <List style={FLEXBOX.bottomSpace} >
            {this.store.multVisa.map((o, i) => <List.Item key={i} check={o.checked} onClick={() => {
              for (let item of this.store.multVisa)
                if (item != o) item.checked = false;
              o.checked = !o.checked;
            }}>
              <Flex>
                <Text >{o.VisaName}</Text>
              </Flex>
              <Brief style={{ fontSize: 12, }}>
                <Text style={styles.price}>￥{o.MinPrice}/{lan.booking_people}/{lan.booking_share}</Text>
              </Brief></List.Item>)}
          </List>
        </ScrollView>
        {/*{lan.booking_bottom_bar}*/}
        <Button type='barButton' onClick={() => {
          this.props.refresh(this.store.passengers, this.getVisaResult());
          this.props.navigator.pop();
        }}>{lan.booking_determine}</Button>
        <ActivityIndicator toast text={lan.booking_loading} animating={this.store.isLoading} />
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.containerBg,
  },

  price: {
    color: COLORS.price,
    marginLeft: 10
  }


});

