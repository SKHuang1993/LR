import React from 'react';
import { Text, ScrollView } from 'react-native';
import Modal from './Modal';
;
export default class AlertContainer extends React.Component {
    constructor(props) {
        super(props);
        this.onClose = () => {
            this.setState({
                visible: false,
            });
        };
        this.state = {
            visible: true,
        };
    }
    render() {
        const { title, actions, content, onAnimationEnd } = this.props;
        const footer = actions.map((button) => {
            const orginPress = button.onPress || function () {
            };
            button.onPress = () => {
                orginPress();
                this.onClose();
            };
            return button;
        });
        return (<Modal transparent title={title} visible={this.state.visible} onClose={this.onClose} footer={footer} onAnimationEnd={onAnimationEnd}>
        <ScrollView>
          <Text>{content}</Text>
        </ScrollView>
      </Modal>);
    }
}
