import { StyleSheet } from 'react-native';
import variables from '../style/themes/default';
const styles = StyleSheet.create({
    modal: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    header: {
        flexGrow: 1,
        height: 44,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e7e7e7',
        backgroundColor:variables.brand_primary
    },
    headerItem: {
        height: 44,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
    
    title: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
});
export default styles;
