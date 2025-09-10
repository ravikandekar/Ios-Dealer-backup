import React, { useState, useContext } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Platform,
    ActivityIndicator,
} from 'react-native';
import AppText from './AppText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import { showToast } from '../utils/toastService';

const formatDate = date =>
    `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getFullYear()}`;

const parseDate = dateString => {
    const [d, m, y] = dateString.split('-');
    return new Date(y, m - 1, d);
};

const DatePickerComponent = ({
    visible,
    onClose,
    fromDateString,
    toDateString,
    onApplyFilter,
    applyingDateFilter = false,
}) => {
    const { theme } = useContext(AuthContext);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerType, setDatePickerType] = useState('from');
    const [localFromDate, setLocalFromDate] = useState(fromDateString);
    const [localToDate, setLocalToDate] = useState(toDateString);
    const [tempDate, setTempDate] = useState(new Date());

    const today = new Date();
    const minDate = new Date(2020, 0, 1);

    const getFromDate = () => parseDate(localFromDate);
    const getToDate = () => parseDate(localToDate);

    const validateDateRange = (fromDate, toDate) => {
        const from = parseDate(fromDate);
        const to = parseDate(toDate);
        
        // Check if to date is greater than from date
        if (to < from) {
            showToast('error', '', 'To date must be greater than or equal to from date');
            return false;
        }
        
        // Check if dates are not in future
        if (from > today || to > today) {
            showToast('error', '', 'Future dates are not allowed');
            return false;
        }
        
        return true;
    };

    const onChangeDate = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            
            if (event.type === 'dismissed') {
                return;
            }
        }

        if (selectedDate) {
            // Validate that selected date is not in future
            if (selectedDate > today) {
                showToast('error', '', 'Future dates are not allowed');
                return;
            }

            if (Platform.OS === 'android') {
                const formattedDate = formatDate(selectedDate);
                
                if (datePickerType === 'from') {
                    // If setting from date, validate it's not greater than to date
                    const currentToDate = parseDate(localToDate);
                    if (selectedDate > currentToDate) {
                        showToast('error', '', 'From date cannot be greater than to date');
                        return;
                    }
                    setLocalFromDate(formattedDate);
                } else {
                    // If setting to date, validate it's not less than from date
                    const currentFromDate = parseDate(localFromDate);
                    if (selectedDate < currentFromDate) {
                        showToast('error', '', 'To date cannot be less than from date');
                        return;
                    }
                    setLocalToDate(formattedDate);
                }
            } else {
                // iOS - just update temp date
                setTempDate(selectedDate);
            }
        }
    };

    const openCalendar = (type) => {
        setDatePickerType(type);
        const currentDate = type === 'from' ? getFromDate() : getToDate();
        setTempDate(currentDate);
        setShowDatePicker(true);
    };

    const cancelDateSelection = () => {
        const currentDate = datePickerType === 'from' ? getFromDate() : getToDate();
        setTempDate(currentDate);
        setShowDatePicker(false);
    };

    const confirmDateSelection = () => {
        // Validate that selected date is not in future
        if (tempDate > today) {
            showToast('error', '', 'Future dates are not allowed');
            return;
        }

        const formattedDate = formatDate(tempDate);
        
        if (datePickerType === 'from') {
            // If setting from date, validate it's not greater than to date
            const currentToDate = parseDate(localToDate);
            if (tempDate > currentToDate) {
                showToast('error', '', 'From date cannot be greater than to date');
                return;
            }
            setLocalFromDate(formattedDate);
        } else {
            // If setting to date, validate it's not less than from date
            const currentFromDate = parseDate(localFromDate);
            if (tempDate < currentFromDate) {
                showToast('error', '', 'To date cannot be less than from date');
                return;
            }
            setLocalToDate(formattedDate);
        }
        
        setShowDatePicker(false);
    };

    const handleApplyFilter = () => {
        if (validateDateRange(localFromDate, localToDate)) {
            onApplyFilter(localFromDate, localToDate);
        }
    };

    const handleClose = () => {
        // Reset to original values when closing
        setLocalFromDate(fromDateString);
        setLocalToDate(toDateString);
        setShowDatePicker(false);
        onClose();
    };

    return (
        <>
            {/* Main Date Selection Modal */}
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={handleClose}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={handleClose}
                >
                    <TouchableOpacity
                        style={[styles.dateSelectionModal, { backgroundColor: theme.colors.card }]}
                        activeOpacity={1}
                        onPress={() => {}}
                    >
                        <View style={styles.modalHeader}>
                            <AppText style={[styles.modalTitle, { color: theme.colors.text }]}>
                                Select Date Range
                            </AppText>
                            <TouchableOpacity onPress={handleClose}>
                                <Icon name="close" size={wp('6%')} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateOptionsContainer}>
                            <TouchableOpacity
                                style={[styles.dateOptionButton, { borderColor: theme.colors.primary }]}
                                onPress={() => openCalendar('from')}
                            >
                                <Icon name="calendar-start" size={wp('6%')} color={theme.colors.primary} />
                                <View style={styles.dateOptionContent}>
                                    <AppText style={[styles.dateOptionLabel, { color: theme.colors.text }]}>
                                        From Date
                                    </AppText>
                                    <AppText style={[styles.dateOptionValue, { color: theme.colors.primary }]}>
                                        {localFromDate}
                                    </AppText>
                                </View>
                                <Icon name="chevron-right" size={wp('5%')} color={theme.colors.placeholder} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.dateOptionButton, { borderColor: theme.colors.primary }]}
                                onPress={() => openCalendar('to')}
                            >
                                <Icon name="calendar-end" size={wp('6%')} color={theme.colors.primary} />
                                <View style={styles.dateOptionContent}>
                                    <AppText style={[styles.dateOptionLabel, { color: theme.colors.text }]}>
                                        To Date
                                    </AppText>
                                    <AppText style={[styles.dateOptionValue, { color: theme.colors.primary }]}>
                                        {localToDate}
                                    </AppText>
                                </View>
                                <Icon name="chevron-right" size={wp('5%')} color={theme.colors.placeholder} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.applyButtonContainer}>
                            <TouchableOpacity
                                style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handleApplyFilter}
                                disabled={applyingDateFilter}
                            >
                                {applyingDateFilter ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Icon name="check" size={wp('5%')} color="#FFFFFF" />
                                        <AppText style={styles.applyButtonText}>Apply Filter</AppText>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Android Date Picker */}
            {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                    value={datePickerType === 'from' ? getFromDate() : getToDate()}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                    maximumDate={today}
                    minimumDate={minDate}
                />
            )}

            {/* iOS Date Picker Modal */}
            {Platform.OS === 'ios' && (
                <Modal
                    visible={showDatePicker}
                    transparent
                    animationType="slide"
                    onRequestClose={cancelDateSelection}
                >
                    <TouchableOpacity
                        style={styles.iosModalOverlay}
                        activeOpacity={1}
                        onPress={cancelDateSelection}
                    >
                        <TouchableOpacity
                            style={[styles.modalContent, { backgroundColor: theme.colors.card }]}
                            activeOpacity={1}
                            onPress={() => {}}
                        >
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={cancelDateSelection}>
                                    <AppText style={[styles.modalButton, { color: theme.colors.primary }]}>
                                        Cancel
                                    </AppText>
                                </TouchableOpacity>
                                <AppText style={[styles.modalTitle, { color: theme.colors.text }]}>
                                    Select {datePickerType === 'from' ? 'From' : 'To'} Date
                                </AppText>
                                <TouchableOpacity onPress={confirmDateSelection}>
                                    <AppText style={[styles.modalButton, { color: theme.colors.primary }]}>
                                        Done
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.datePickerContainer}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="compact"
                                    onChange={onChangeDate}
                                    maximumDate={today}
                                    minimumDate={minDate}
                                    style={styles.iosDatePicker}
                                />
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iosModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    dateSelectionModal: {
        width: wp('85%'),
        borderRadius: wp('4%'),
        paddingBottom: hp('3%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2.5%'),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    modalTitle: {
        fontSize: wp('4.5%'),
        fontWeight: '600',
    },
    dateOptionsContainer: {
        paddingHorizontal: wp('5%'),
        paddingTop: hp('2%'),
    },
    dateOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp('2%'),
        paddingHorizontal: wp('4%'),
        borderWidth: 1,
        borderRadius: wp('3%'),
        marginBottom: hp('1.5%'),
    },
    dateOptionContent: {
        flex: 1,
        marginLeft: wp('3%'),
    },
    dateOptionLabel: {
        fontSize: wp('3.5%'),
        fontWeight: '500',
        marginBottom: hp('0.5%'),
    },
    dateOptionValue: {
        fontSize: wp('4%'),
        fontWeight: '600',
    },
    applyButtonContainer: {
        paddingHorizontal: wp('5%'),
        paddingTop: hp('2%'),
    },
    applyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('1.8%'),
        borderRadius: wp('3%'),
        gap: wp('2%'),
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: wp('4.2%'),
        fontWeight: '600',
    },
    modalContent: {
        borderTopLeftRadius: wp('5%'),
        borderTopRightRadius: wp('5%'),
        paddingBottom: hp('3%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 10,
    },
    modalButton: {
        fontSize: wp('4%'),
        fontWeight: '600',
        minWidth: wp('15%'),
        textAlign: 'center',
    },
    datePickerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('1%'),
    },
    iosDatePicker: {
        width: wp('80%'),
        height: hp('25%'),
    },
});

export default DatePickerComponent;