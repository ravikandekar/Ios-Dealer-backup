import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import AppText from './AppText';
import Car from '../IconCompo/Car';
import Bike from '../IconCompo/Bike';
import Spare from '../IconCompo/Spare';
import { color } from 'react-native-elements/dist/helpers';

const categoryIcons = {
  Cars: 'directions-car',
  Bikes: 'motorcycle',
  'Spares-Accessories': 'settings',
};

// Date range options
const DATE_RANGE_OPTIONS = [
  {
    id: 'today',
    label: 'Today',
    getValue: () => {
      const today = new Date();
      return { fromDate: today, toDate: today };
    }
  },
  {
    id: 'yesterday',
    label: 'Yesterday',
    getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return { fromDate: yesterday, toDate: yesterday };
    }
  },
  {
    id: 'last7days',
    label: 'Last 7 Days',
    getValue: () => {
      const today = new Date();
      const last7Days = new Date();
      last7Days.setDate(today.getDate() - 6);
      return { fromDate: last7Days, toDate: today };
    }
  },
  {
    id: 'last30days',
    label: 'Last 30 Days',
    getValue: () => {
      const today = new Date();
      const last30Days = new Date();
      last30Days.setDate(today.getDate() - 29);
      return { fromDate: last30Days, toDate: today };
    }
  },
  {
    id: 'thisMonth',
    label: 'This Month',
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return { fromDate: firstDay, toDate: today };
    }
  },
  {
    id: 'lastMonth',
    label: 'Last Month',
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      return { fromDate: firstDay, toDate: lastDay };
    }
  },
  {
    id: 'custom',
    label: 'Custom Range',
    getValue: null
  }
];

const ListingOverviewCard = ({ selectedCategory, apiClient, showToast, solddeletedmodal }) => {
  const { theme } = useContext(AuthContext);
  const navigation = useNavigation();

  // Date range states
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 7 days ago
  const [toDate, setToDate] = useState(new Date());
  const [selectedOption, setSelectedOption] = useState('last7days');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [tempFromDate, setTempFromDate] = useState(new Date());
  const [tempToDate, setTempToDate] = useState(new Date());
  
  // Analytics states
  const [overviewStats, setOverviewStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };

  // Map category to SVG component
  const categorySvgMap = {
    Car: Car,
    Bike: Bike,
    'Spare Part Accessories': Spare,
  };

  const SelectedIcon = categorySvgMap[selectedCategory] || Car;

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get display text for selected date range
const getDateRangeDisplayText = () => {
  const selectedOpt = DATE_RANGE_OPTIONS.find(opt => opt.id === selectedOption);
  
  if (selectedOption === 'custom') {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    const sameYear = from.getFullYear() === to.getFullYear();

    if (sameYear) {
      return `${from.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${to.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
    
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  }
  
  return selectedOpt?.label || 'Select Range';
};


  // Get analytics data with date range
  const getDealerOverviewStats = async (fromDateParam = fromDate, toDateParam = toDate) => {
    setLoading(true);
    try {
      const fromDateStr = formatDateForAPI(fromDateParam);
      const toDateStr = formatDateForAPI(toDateParam);
      
      const response = await apiClient.get(
        `/api/dealer/getDealerAnalyticsRoute/analytics?fromDate=${fromDateStr}&toDate=${toDateStr}`
      );
      
      const { success, data } = response.data;

      if (success && data?.analytics) {
        setOverviewStats(data.analytics);
        console.log('overviewStats with date range:', data.analytics);
      } else {
        showToast('error', '', 'No analytics data found');
        setOverviewStats(null);
      }
    } catch (error) {
      // console.error('Analytics fetch error:', error);
      // showToast('error', '', error?.response?.data?.message || 'Failed to load analytics data');
      setOverviewStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    getDealerOverviewStats();
  }, []);

  // Handle date range option selection
  const handleDateRangeSelect = (option) => {
    setSelectedOption(option.id);
    setShowDropdown(false);

    if (option.id === 'custom') {
      setTempFromDate(fromDate);
      setTempToDate(toDate);
      setShowCustomDatePicker(true);
    } else {
      const { fromDate: newFromDate, toDate: newToDate } = option.getValue();
      setFromDate(newFromDate);
      setToDate(newToDate);
      getDealerOverviewStats(newFromDate, newToDate);
    }
  };

  // Handle custom date picker
  const handleFromDateChange = (event, selectedDate) => {
    setShowFromPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTempFromDate(selectedDate);
    }
  };

  const handleToDateChange = (event, selectedDate) => {
    setShowToPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTempToDate(selectedDate);
    }
  };

  // Apply custom date range
  const applyCustomDateRange = () => {
    if (tempFromDate > tempToDate) {
      showToast('error', '', 'From date cannot be after to date');
      return;
    }
    
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setShowCustomDatePicker(false);
    getDealerOverviewStats(tempFromDate, tempToDate);
  };

  // Cancel custom date selection
  const cancelCustomDateSelection = () => {
    setShowCustomDatePicker(false);
    setTempFromDate(fromDate);
    setTempToDate(toDate);
  };

  // Render dropdown options
  const renderDropdown = () => (
    <Modal
      visible={showDropdown}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowDropdown(false)}
    >
      <TouchableOpacity 
        style={styles.dropdownOverlay}
        onPress={() => setShowDropdown(false)}
      >
        <View style={[styles.dropdownContent,{backgroundColor:theme.colors.card}]}>
          <View style={styles.dropdownHeader}>
            <AppText style={[styles.dropdownTitle,{color:theme.colors.text}]}>Select Date Range</AppText>
            <TouchableOpacity onPress={() => setShowDropdown(false)}>
              <MaterialIcons name="close" size={wp('6%')} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.optionsContainer}>
            {DATE_RANGE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionItem,
                  selectedOption === option.id && styles.selectedOption
                ]}
                onPress={() => handleDateRangeSelect(option)}
              >
                <AppText style={[
                  styles.optionText,
                  selectedOption === option.id && styles.selectedOptionText
                ,{color:theme.colors.placeholder}]}>
                  {option.label}
                </AppText>
                {selectedOption === option.id && (
                  <MaterialIcons name="check" size={wp('5%')} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Render custom date picker modal
  const renderCustomDatePicker = () => (
    <Modal
      visible={showCustomDatePicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.customDateModalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={cancelCustomDateSelection}>
              <Text style={styles.modalButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Custom Date Range</Text>
            <TouchableOpacity onPress={applyCustomDateRange}>
              <Text style={[styles.modalButton, styles.confirmButton]}>Apply</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.customDateContainer}>
            {Platform.OS === 'ios' ? (
              // iOS Date Pickers
              <View style={styles.iosDatePickersContainer}>
                <View style={styles.datePickerSection}>
                  <Text style={styles.dateLabel}>From Date</Text>
                  <DateTimePicker
                    value={tempFromDate}
                    mode="date"
                    display="compact"
                    onChange={handleFromDateChange}
                    maximumDate={tempToDate}
                    style={styles.datePicker}
                  />
                </View>
                
                <View style={styles.datePickerSection}>
                  <Text style={styles.dateLabel}>To Date</Text>
                  <DateTimePicker
                    value={tempToDate}
                    mode="date"
                    display="compact"
                    onChange={handleToDateChange}
                    minimumDate={tempFromDate}
                    maximumDate={new Date()}
                    style={styles.datePicker}
                  />
                </View>
              </View>
            ) : (
              // Android Date Buttons
              <View style={styles.androidDateContainer}>
                <TouchableOpacity 
                  style={styles.androidDateButton}
                  onPress={() => setShowFromPicker(true)}
                >
                  <Text style={styles.androidDateLabel}>From Date</Text>
                  <Text style={styles.androidDateValue}>{formatDate(tempFromDate)}</Text>
                  <MaterialIcons name="calendar-today" size={wp('5%')} color="#666" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.androidDateButton}
                  onPress={() => setShowToPicker(true)}
                >
                  <Text style={styles.androidDateLabel}>To Date</Text>
                  <Text style={styles.androidDateValue}>{formatDate(tempToDate)}</Text>
                  <MaterialIcons name="calendar-today" size={wp('5%')} color="#666" />
                </TouchableOpacity>

                {showFromPicker && (
                  <DateTimePicker
                    value={tempFromDate}
                    mode="date"
                    display="default"
                    onChange={handleFromDateChange}
                    maximumDate={tempToDate}
                  />
                )}

                {showToPicker && (
                  <DateTimePicker
                    value={tempToDate}
                    mode="date"
                    display="default"
                    onChange={handleToDateChange}
                    minimumDate={tempFromDate}
                    maximumDate={new Date()}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View>
      <AppText style={[styles.title, { color: theme.colors.text }]}>
        {selectedCategory} Listing Overview
      </AppText>

      <View style={styles.cardContainer}>
        {/* Header */}
        <View style={styles.header}>
          <AppText style={styles.cardHeading}>Overview</AppText>
          <View style={styles.headerRight}>
            {loading && <ActivityIndicator size="small" color="#000" style={styles.loader} />}
            
            {/* Calendar Dropdown Trigger */}
            <TouchableOpacity 
              style={styles.calendarButton}
              onPress={() => setShowDropdown(true)}
            >
              <MaterialIcons name="calendar-month" size={wp('5%')} color={theme.colors.placeholder} />
              <AppText style={[styles.dateRangeText,{color:theme.colors.placeholder}]}>
                {getDateRangeDisplayText()}
              </AppText>
              <MaterialIcons name="keyboard-arrow-down" size={wp('6%')} color={theme.colors.placeholder} />
            </TouchableOpacity>
          </View>
        </View>
        
        <AppText style={styles.subtitle}>
          Track performance metrics and key insights for GADILO Bharat.
        </AppText>

        {/* Grid Body */}
        <View style={styles.grid}>
          {/* Views */}
          <TouchableOpacity style={styles.itemCard}>
            <View style={styles.topRow}>
              <View style={styles.iconCircle}>
                <Icon name="eye" size={wp('5%')} color="#000" />
              </View>
              <AppText style={styles.value}>{overviewStats?.views || 0}</AppText>
            </View>
            <View style={styles.bottomRow}>
              <AppText style={styles.label}>Total Views</AppText>
              <MaterialIcons name="chevron-right" size={wp('6%')} color="#888" />
            </View>
          </TouchableOpacity>

          {/* Leads */}
          <TouchableOpacity style={styles.itemCard} onPress={() => navigateTo('LeadsScreen')}>
            <View style={styles.topRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="account-group-outline" size={wp('5%')} color="#000" />
              </View>
              <AppText style={styles.value}>{overviewStats?.leads || 0}</AppText>
            </View>
            <View style={styles.bottomRow}>
              <AppText style={styles.label}>Total Leads</AppText>
              <MaterialIcons name="chevron-right" size={wp('6%')} color="#888" />
            </View>
          </TouchableOpacity>

          {/* Sold/Deleted */}
          <TouchableOpacity style={styles.itemCard} onPress={() => solddeletedmodal(overviewStats)}>
            <View style={styles.topRow}>
              <View style={styles.iconCircle}>
                <Icon name="tag" size={wp('5%')} color="#000" />
              </View>
              <AppText style={styles.value}>{overviewStats?.assets?.soldOrDeleted || 0}</AppText>
            </View>
            <View style={styles.bottomRow}>
              <AppText style={styles.label}>Sold/Deleted</AppText>
              <MaterialIcons name="chevron-right" size={wp('6%')} color="#888" />
            </View>
          </TouchableOpacity>

          {/* My Assets */}
          <TouchableOpacity style={styles.itemCard} onPress={() => navigateTo('MyAssetsScreen')}>
            <View style={styles.topRow}>
              <View style={styles.iconCircle}>
                <Icon name="box" size={wp('5%')} color="#000" />
              </View>
              <AppText style={styles.value}>{overviewStats?.totalassets || 0}</AppText>
            </View>
            <View style={styles.bottomRow}>
              <AppText style={styles.label}>My Assets</AppText>
              <MaterialIcons name="chevron-right" size={wp('6%')} color="#888" />
            </View>
          </TouchableOpacity>

          {/* Active Listings */}
          <TouchableOpacity style={[styles.itemCard, styles.fullWidthCard]} onPress={() => navigateTo('MyAssetsScreen')}>
            <View style={styles.topRow}>
              <View style={styles.iconCircle}>
                <SelectedIcon width={wp('6%')} height={wp('6%')} fill="#000" />
              </View>
              <AppText style={styles.value}>{overviewStats?.active || 0}</AppText>
            </View>
            <View style={styles.bottomRow}>
              <AppText style={styles.label}>Active Listings</AppText>
              <MaterialIcons name="chevron-right" size={wp('6%')} color="#888" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Modal */}
      {renderDropdown()}

      {/* Custom Date Picker Modal */}
      {renderCustomDatePicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#e6f0ff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
  },
  title: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#101010',
    marginBottom: hp('1%'),
    textTransform: 'capitalize',
  },
  cardHeading: {
    fontSize: wp('4.5%'),
    fontWeight: '800',
    color: '#101010',
    marginBottom: hp('0.5%'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loader: {
    marginRight: wp('2%'),
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#ddd',
    marginLeft: wp('2%'),
    minWidth: wp('42%'),
  },
  dateRangeText: {
    fontSize: wp('3.4%'),
    color: '#333',
    marginHorizontal: wp('1.5%'),
    flex: 1,
  },
  subtitle: {
    marginTop: hp('0.5%'),
    fontSize: wp('3.5%'),
    color: '#444',
  },
  grid: {
    marginTop: hp('2%'),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 2,
    borderColor: '#767676',
    borderWidth: wp('0.2%'),
  },
  fullWidthCard: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  iconCircle: {
    width: wp('8.5%'),
    height: wp('8.5%'),
    borderRadius: wp('4.25%'),
    backgroundColor: '#D9ECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  value: {
    fontSize: wp('5.2%'),
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#767676',
    fontSize: wp('4%'),
  },

  // Dropdown Styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
  },
  dropdownContent: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    width: '100%',
    maxHeight: hp('60%'),
    elevation: 5,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#333',
  },
  optionsContainer: {
    maxHeight: hp('50%'),
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  selectedOption: {
    backgroundColor: '#f0f8ff',
  },
  optionText: {
    fontSize: wp('4%'),
    color: '#333',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '500',
  },

  // Custom Date Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  customDateModalContent: {
    backgroundColor: '#fff',
    // borderTopLeftRadius: wp('5%'),
    // borderTopRightRadius: wp('5%'),
    borderRadius: wp('5%'),
    paddingBottom: hp('3%'),
    maxHeight: hp('70%'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#333',
  },
  modalButton: {
    fontSize: wp('4%'),
    color: '#007AFF',
    fontWeight: '500',
  },
  confirmButton: {
    fontWeight: '600',
  },
  customDateContainer: {
    padding: wp('4%'),
  },
  iosDatePickersContainer: {
    gap: hp('3%'),
  },
  datePickerSection: {
    marginBottom: hp('2%'),
  },
  dateLabel: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#333',
    marginBottom: hp('1%'),
  },
  datePicker: {
    alignSelf: 'flex-start',
  },
  androidDateContainer: {
    gap: hp('2%'),
  },
  androidDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: wp('4%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  androidDateLabel: {
    fontSize: wp('3.8%'),
    color: '#666',
    minWidth: wp('20%'),
  },
  androidDateValue: {
    fontSize: wp('4%'),
    color: '#333',
    fontWeight: '500',
    flex: 1,
    marginLeft: wp('3%'),
  },
});

export default ListingOverviewCard;