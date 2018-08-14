import React from 'react';
import { View } from 'react-native';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import CardFooter from './CardFooter';
import CardStyle from './style/index';
export default class Card extends React.Component {
    render() {
        const styles = this.props.styles;
        const cardStyle = this.props.full ? styles.full : {};
        return (<View style={[styles.card, cardStyle, this.props.style]}>
        {React.Children.map(this.props.children, (child) => React.cloneElement(child, { styles }))}
      </View>);
    }
}
Card.defaultProps = {
    style: {},
    full: false,
    styles: CardStyle,
};
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
