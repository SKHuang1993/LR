import { View } from 'react-native';
import { Picker, List } from 'antd-mobile';
import React from 'react';
//import { district } from 'antd-mobile-demo-data';

let aa = [{
                "value": "Y",
                "label": "经济舱",
            },
            {
                "value": "P",
                "label": "高端经济舱",
            },
            {
                "value": "C",
                "label": "公务舱",
            },
            {
                "value": "F",
                "label": "头等舱",
            },
            ];
export default class PopupExample extends React.Component {
    constructor(props) {
        super(props);
        // this.onClick = () => {
        //     // console.log('start loading data');
        //     setTimeout(() => {
        //         this.setState({
        //             data: aa,
        //         });
        //     }, 500);
        // };
        this.onChange = (value) => {
            // console.log(value);
            alert(value)
            this.setState({ value });
        };
        this.state = {
            data: [],
            value: [],
        };
    }
    render() {
        return (<View style={{ marginTop: 30 }}>
            <List>
                <Picker data={this.state.data} cols={1} triggerType="onClick" value={this.state.value} onChange={this.onChange}>
                    <List.Item arrow="horizontal" last onClick={this.onClick}>省市选择(异步加载)</List.Item>
                </Picker>
            </List>
            
            <Picker
               data={aa} cols={1} 
                title="选择地区"
                extra="请选择(可选)"
                value={this.state.value}
                triggerType="onClick"
                onChange={(v) => this.setState({ value: v })}
            >
                 <List.Item arrow="horizontal" last onClick={this.onClick}>省市选择(异步加载)</List.Item>
            </Picker>
            
        </View>);
    }
}