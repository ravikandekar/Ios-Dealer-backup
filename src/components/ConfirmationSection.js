// components/ConfirmationSection.js
import React from 'react';
import { View,  TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from '../constants/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AppText from './AppText';
const ConfirmationSection = ({ OrderType = "Table 2", onPressPay }) => {
    return (
        <View style={{ justifyContent: 'center' }}>
            <View style={styles.modalHeader}>
                <Entypo name="shop" size={wp('12')} color={'#000'} />
                <View style={styles.modalRow}>
                    <AppText style={styles.modalLabel}>Delivering to</AppText>
                    <AppText style={styles.modalTable}>{OrderType}</AppText>
                </View>
            </View>

            <View style={styles.dottedLine} />

            <View style={[styles.modalHeader, { alignItems: 'center' }]}>
                <FontAwesome5 name="check-circle" size={45} color="#4CAF50" />
                <View style={styles.modalContent}>
                    <AppText style={styles.modalApproved}>Your order is approved!</AppText>
                    <AppText style={styles.modalSub}>Please proceed with the payment.</AppText>
                </View>
            </View>

            <TouchableOpacity style={styles.payButton} onPress={onPressPay}>
                <AppText style={styles.payText}>Click to Pay</AppText>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    modalHeader: {
        flexDirection: 'row',
        // alignItems: 'flex-start',
        marginLeft: hp('2.5%'),
    },
    modalRow: {
        alignItems: 'center',
        marginBottom: hp('1%'),
    },
    modalLabel: {
        fontSize: wp('3.5%'),
        marginLeft: wp('2.5%'),
        color: Colors.black,
    },
    modalTable: {
        margin: wp('2%'),
        backgroundColor: Colors.appYellow,
        paddingHorizontal: wp('2%'),
        paddingVertical: hp('0.5%'),
        borderRadius: wp('1.2%'),
        fontWeight: 'bold',
        color: Colors.black,
        textTransform: 'uppercase',
    },
    modalContent: {
        alignItems: 'flex-start',
        marginBottom: hp('2%'),
        marginLeft: hp('0.5%'),
        justifyContent: 'center',
    },
    modalApproved: {
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
        marginTop: hp('2%'),
        color: Colors.black,
    },
    modalSub: {
        fontSize: wp('3.5%'),
        color: Colors.black,
        textAlign: 'center',
    },
    payButton: {
        backgroundColor: '#00695C',
        borderRadius: wp('2%'),
        paddingVertical: hp('1.5%'),
        alignItems: 'center',
    },
    payText: {
        color: Colors.white,
        fontSize: wp('4%'),
        fontWeight: 'bold',
    },
    dottedLine: {
        borderStyle: 'dotted',
        borderWidth: 1,
        borderColor: '#ccc',
        marginVertical: hp('1%'),
        marginHorizontal: wp('5%'),
    },
});

export default ConfirmationSection;
