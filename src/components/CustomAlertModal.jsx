import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AppText from './AppText'; // your custom text component

const CustomAlertModal = ({
    visible,
    onClose,
    title = "Alert",
    message = "Something happened",
    primaryButtonText = "OK",
    onPrimaryPress = () => { },
    secondaryButtonText = null,
    theme,
}) => {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    <AppText style={[styles.modalTitle, { color: theme.colors.text }]}>
                        {title}
                    </AppText>
                    <AppText style={[styles.modalMessage, { color: theme.colors.placeholder }]}>
                        {message}
                    </AppText>

                    <View style={styles.modalButtons}>

                        <TouchableOpacity
                            style={[styles.modalBtnFilled, { backgroundColor: theme.colors.primary }]}
                            onPress={onPrimaryPress}
                        >
                            <AppText style={{ color: theme.colors.background }}>
                                {primaryButtonText}
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CustomAlertModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: wp('80%'),
        borderRadius: 12,
        padding: wp('5%'),
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: wp('5%'),
        fontWeight: 'bold',
        marginBottom: hp('1%'),
    },
    modalMessage: {
        fontSize: wp('3.8%'),
        textAlign: 'center',
        marginBottom: hp('3%'),
    },
    modalButtons: {
        flexDirection: 'row',
        gap: wp('4%'),
    },
    modalBtn: {
        paddingVertical: hp('1.2%'),
        paddingHorizontal: wp('5%'),
        borderWidth: 1,
        borderRadius: 8,
    },
    modalBtnFilled: {
        paddingVertical: hp('1.2%'),
        paddingHorizontal: wp('5%'),
        borderRadius: 8,
    },
});
