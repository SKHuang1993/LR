
import React, { Component } from 'react'
import { StyleSheet, Text, View, Image, TouchableHighlight, Animated, StatusBar } from 'react-native';
import Narbar from '../../components/navBar/'
import Stars from '../../components/stars';

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            txt: 'heleo'
        }

    }




    render() {
        return (<View style={styles.container} >


            <View style={styles.flex}>
                <Test text={this.state.txt} />
                <Text onPress={
                    () => {
                        return this.setState({
                            txt: '111111'
                        })
                    }
                }>{this.state.txt}</Text>
                {/*<Text style={{fontFamily:'iconfontIM'}}>&#xe181;</Text>*/}
                <Text style={{ fontFamily: 'iconfontim' }}>&#xe181;</Text>
                <Text style={{ fontFamily: 'iconfont' }}>&#xe69b;</Text>
                <Text style={{ fontFamily: 'iconfont' }}>www</Text>
                <Text style={{ fontFamily: 'iconfont' }}>&#xe699;</Text>
                {/*<Text style={{fontFamily:'Font2'}}>&#xe181;</Text>*/}
            </View>
                <Stars/>
           

        </View>
        )
    }
}

class Test extends Component {

    render() {
        return <View>
            <Text >组件2</Text>
            <Text >{this.props.text}</Text>
        </View>
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,

    },
    flex: {
        flex: 1,
        flexDirection: 'row',


    }

});
