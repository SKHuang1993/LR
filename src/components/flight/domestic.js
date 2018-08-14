

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ListView,
    TouchableOpacity,
    TouchableHighlight,
    Animated, InteractionManager
} from 'react-native';

import { List, WhiteSpace, Picker } from 'antd-mobile';
import Flex from '../../components/flex';
import NavBar from '../../components/navBar';
import Icon from '../../components/icons/icon';
import '../../utils/date';
import { COLORS, FLEXBOX } from '../../styles/commonStyle'
import Item from './item';
import SubItem from './subItem'
import SelectedFlight from '../../pages/flight/selectedFlight'
import Accordion from 'react-native-collapsible/Accordion';
import Co from '../../pages/demo/collapsible'
import { observer } from 'mobx-react/native'
import { BaseComponent } from '../locale';
let lan = BaseComponent.getLocale();
@observer
export default class FlightList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            expanded: true,
            animation: new Animated.Value()
        }
    }

    //已选航班
    getFlightSelection = () => {
        let selectedFlights = this.props.selectedFlights;
        let sequence = this.props.store.passProps.sequence;
        let isEmpty = this.props.store.isFinish && this.props.store.filterData.length == 0;
        if (isEmpty) return null;
        if (selectedFlights && selectedFlights.length > 0) {
            let flight = [];
            for (let position in selectedFlights.slice(0, sequence)) {
                let obj = Object.assign({}, selectedFlights[position], selectedFlights[position].selectedCabin);
                flight.push(<SelectedFlight data={obj} key={position}
                    leg={this.props.store.getLegTip(parseInt(position))}
                    onBackPress={() => {
                        let currentRouteStack = this.props.store.passProps.navigator.getCurrentRoutes();
                        this.props.store.passProps.navigator.jumpTo(currentRouteStack[currentRouteStack.length - 1 - (this.props.store.passProps.param.departures.length - position - 1)]);
                    }} />)
            }
            return <View style={{ paddingBottom: 6 }}>{flight}
                {sequence > 0 ?
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ textAlign: 'center', color: '#999', fontSize: 13 }}>{lan.flights_selectHint} {this.props.store.getLegTip(sequence)}</Text>
                    </View>
                    : null}
            </View>;
        }
    }


    _renderRow(rowData: string, sectionID: number, rowID: number, highlightRow: (sectionID: number, rowID: number) => void) {
        return <AccordionItem rowData={rowData} orderDetail={this.props.orderDetail} store={this.props.store} toChange={this.props.toChange} routetrip={this.props.routetrip} info={this.props.info} />

    }

    render() {
        return (
            <View style={styles.container} >
                <ListView
                    ref="ListView"
                    initialListSize={8}
                    enableEmptySections={true}
                    dataSource={this.props.store.getDataSource}
                    renderRow={this._renderRow.bind(this)}
                    renderHeader={() =>
                        this.getFlightSelection()
                    }
                />
            </View>
        )

    }


}

@observer
class AccordionItem extends Component {

    _setSection(section) {
        if (this.props.rowData._berthList.length == 0)
            this.props.rowData._berthList = this.props.rowData.BerthList;
        else
            InteractionManager.runAfterInteractions(() =>
                this.props.rowData._berthList = []
            )
    }

    _renderHeader(section, i, isActive) {

        return (
            <View><Item data={this.rowData} /></View>
        );
    }

    _renderContent(section, i, isActive) {
        return (
            <View style={styles.subItem} >
                {this.rowData._berthList.map((o, i) =>
                    <SubItem key={i} data={o} toChange={this.toChange} orderDetail={this.orderDetail} routetrip={this.routetrip} info={this.info} rowData={this.rowData} store={this.store} />
                )}
            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>

                <Accordion
                    sections={[{}]}
                    renderHeader={this._renderHeader}
                    renderContent={this._renderContent}
                    duration={400}
                    rowData={this.props.rowData}
                    onChange={this._setSection.bind(this)}
                    underlayColor={'rgba(255,255,255,.8)'}
                    store={this.props.store}
                    routetrip={this.props.routetrip}
                    info={this.props.info}
                    toChange={this.props.toChange}
                    orderDetail={this.props.orderDetail}
                />

            </View>
        );
    }
}








const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    subItem: {
        padding: 5,
        paddingTop: 0,
        paddingBottom: 10,
    }





});

