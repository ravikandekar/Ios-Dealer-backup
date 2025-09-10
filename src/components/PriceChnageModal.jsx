import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ActionButton from './ActionButton';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const PriceChnageModal = ({
    visible,
    onClose,
    inputValue,
    setInputValue,
    onNextPress,
    theme,
    onBackPress,
    modalTitle, // Pass dynamic header title here
    placeholder, // Optional placeholder
}) => {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                            {modalTitle || 'Enter value'} {/* fallback if not passed */}
                        </Text>
                        <Pressable onPress={onClose}>
                            <Icon name="close" size={24} color={theme.colors.text} />
                        </Pressable>
                    </View>
                    <TextInput
                        style={[
                            styles.modalInput,
                            {
                                borderColor: theme.colors.border,
                                color: theme.colors.text,
                            },
                        ]}
                        placeholder={placeholder || 'Enter value'}
                        placeholderTextColor={theme.colors.text}
                        value={inputValue}
                        onChangeText={setInputValue}
                        keyboardType="number-pad"
                    />
                    <ActionButton
                        label="Next"
                        onPress={onNextPress}
                        onBackPress={onBackPress}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp('5%'),
    },
    modalContainer: {
        width: '100%',
        borderRadius: wp('4%'),
        padding: wp('5%'),
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('2%'),
    },
    modalTitle: {
        fontSize: wp('5%'),
        fontWeight: 'bold',
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: wp('2%'),
        padding: hp('1.2%'),
        fontSize: wp('4.5%'),
        marginBottom: hp('2%'),
    },
});

export default PriceChnageModal;
