import { StyleSheet } from 'react-native';
export default StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'transparent',
        zIndex: 99,
    },
    innerContainer: {
        flex: 1,
        marginBottom: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    wrapper: {
        paddingTop:4,
        alignItems: 'center',
        justifyContent: 'center',
        width: 98,
        height: 98,
        borderRadius: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    tip: {
        color: '#999',
        fontSize: 14,
        marginLeft: 8,
    },
    toast: {
        color: '#fff',
        fontSize: 14,
        marginTop: 10,
    },
});
