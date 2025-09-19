import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { AuthContext } from '../context/AuthContext';
import { DetailsHeader } from '../components/DetailsHeader';
import { useFormStore } from '../store/formStore';
import AppText from '../components/AppText';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import BrandInputModal from '../components/BrandInputModal';

const CarHistoryAndColor = ({ navigation }) => {
  const { theme, selectedCategory } = useContext(AuthContext);
  const { formData, updateForm } = useFormStore();
  const [ShowModal, setShowModal] = useState(false);
  const isBike = selectedCategory?.toLowerCase() === 'bike';

  const [selectedColorId, setSelectedColorId] = useState(formData.carColorId || null);
  const [selectedOwnerId, setSelectedOwnerId] = useState(formData.ownerHistoryId || null);
  const [selectedYearId, setSelectedYearId] = useState(formData.yearId || null);

  const [price, setPrice] = useState(formData.sparePrice || '');
  const [availableSpare, setSpareAvailable] = useState(false);
  const [description, setDescription] = useState(formData.description || '');

  const [colors, setColors] = useState([]);
  const [ownerships, setOwnerships] = useState([]);
  const [otherOwnership, setOtherOwnership] = useState('');
  const [otherOwnershipinput, setOtherOwnershipinput] = useState('');
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
    setSpareAvailable(selectedCategory?.toLowerCase() === 'spare part accessories');
  }, [selectedCategory]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const ownershipURL = isBike
        ? '/api/product/bike_ownershipRoutes/getdata-by-buyer-dealer?page=1&limit=25'
        : '/api/product/car_ownershipRoutes/getdata-by-buyer-dealer?page=1&limit=25';

      const yearURL = isBike
        ? '/api/product/bikeyearRoute/getdata-by-buyer-dealer?page=1&limit=25'
        : '/api/product/caryearRoute/getdata-by-buyer-dealer?page=1&limit=25';

      const colorURL = isBike
        ? '/api/product/bikecolorRoute/getdata-by-buyer-dealer?page=1&limit=25'
        : '/api/product/colorRoute/getdata-by-buyer-dealer?page=1&limit=25';

      const [ownershipRes, yearRes, colorRes] = await Promise.all([
        apiClient.get(ownershipURL),
        apiClient.get(yearURL),
        apiClient.get(colorURL),
      ]);

      if (ownershipRes.data.success) setOwnerships(ownershipRes.data.data.ownerships);
      if (yearRes.data.success) setYears(yearRes.data.data.years);
      if (colorRes.data.success) setColors(colorRes.data.data.colors);
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleColorSelect = (color) => {
    const colorName = isBike ? color.bike_color_name : color.color_name;
    const colorId = color._id;

    setSelectedColorId(colorId);
    updateForm('carColorId', colorId);
  };

  const handleOwnerSelect = (owner) => {
    if (owner?.isOthers === true) {
      setOtherOwnership(owner?._id)
      setShowModal(true);
      return;
    }
    setSelectedOwnerId(owner?._id);
    updateForm('ownerHistoryId', owner?._id);

  };
  const otherownership = (otherOwnershipinput) => {
    setShowModal(false);
    if (otherOwnershipinput.trim()) {
      updateForm('ownerHistoryId', otherOwnership);
      updateForm('carAndbike_ownership_other_text', otherOwnershipinput);

    }
  };

  const handleYearSelect = (year) => {
    if (!selectedColorId) {
      showToast('error', '', `Please select a ${isBike ? 'bike' : 'car'} color.`);
      return;
    }

    if (!selectedOwnerId) {
      showToast('error', '', 'Please select owner history.');
      return;
    }

    if (!year || !year._id) {
      showToast('error', '', 'Please select year.');
      return;
    }

    setSelectedYearId(year?._id);
    updateForm('yearId', year?._id);
    navigation.navigate('RangeSelectorScreen');
  };

  if (loading) {
    return (
      <BackgroundWrapper>
        <DetailsHeader title={`${isBike ? 'Bike' : 'Car'} Details`} stepText={isBike ? ' 5/7' : ' 4/6'} rightType='steps' />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <DetailsHeader title={`${isBike ? 'Bike' : 'Car'} Details`} stepText={isBike ? ' 5/7' : ' 4/6'} rightType='steps' />
      <ScrollView
        contentContainerStyle={{ paddingBottom: hp('6%') }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            titleColor={theme.colors.primary}
          />
        }
      >

        {/* Color Selection */}
        <AppText style={[styles.subHeader, { color: theme.colors.text }]}>
          Select {isBike ? 'bike' : 'car'} colour.
        </AppText>
        <View style={styles.colorGrid}>
          {colors.map((color) => {
            const colorName = isBike ? color.bike_color_name : color.color_name;
            const colorCode = isBike ? color.bike_color_code : color.color_code;

            return (
              <View key={color._id} style={styles.colorItem}>
                <TouchableOpacity
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: colorCode,
                      borderWidth: selectedColorId === color._id ? 1.5 : 1,
                      borderColor: selectedColorId === color._id ? theme.colors.primary : '#D3D3D3',
                    },
                  ]}
                  onPress={() => handleColorSelect(color)}
                />
                <AppText style={[
                  styles.colorLabel,
                  { color: selectedColorId === color._id ? theme.colors.primary : theme.colors.text },
                ]}>
                  {colorName}
                </AppText>
              </View>
            );
          })}
        </View>

        {/* Spare Part Fields
        {availableSpare && (
          <View style={styles.priceSection}>
            <AppText style={[styles.priceLabel, { color: theme.colors.text }]}>Description:</AppText>
            <TextInput
              style={[
                styles.inputBox,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.inputBackground,
                  minHeight: hp('15%'),
                },
              ]}
              placeholder="Description"
              placeholderTextColor={theme.colors.placeholder}
              multiline
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                updateForm('description', text);
              }}
            />

            <AppText style={[styles.sectionHeader, { color: theme.colors.text, marginTop: hp('2%') }]}>
              Set Price for spares-accessories.
            </AppText>
            <AppText style={[styles.priceLabel, { color: theme.colors.text }]}>Enter price:</AppText>
            <TextInput
              style={[
                styles.inputBox,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.inputBackground,
                },
              ]}
              placeholder="₹ Enter price"
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="numeric"
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                updateForm('sparePrice', text);
              }}
            />
          </View>
        )} */}

        {/* Ownership Selection */}
        <AppText style={[styles.subHeader, { color: theme.colors.text }]}>
          Select {isBike ? 'bike' : 'car'} ownership history.
        </AppText>
        <View style={styles.rowWrap}>
          {ownerships.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={[
                styles.ownerBox,
                selectedOwnerId === item._id
                  ? { backgroundColor: theme.colors.background, borderColor: theme.colors.primary, borderWidth: 1.5 }
                  : { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow, borderWidth: 1, borderColor: theme.colors.cardborder },
              ]}
              onPress={() => handleOwnerSelect(item)}
            >
              <AppText style={[
                styles.ownerText,
                { color: selectedOwnerId === item._id ? theme.colors.primary : theme.colors.text },
              ]}>
                {item.ownership}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Year Selection */}
        <AppText style={[styles.subHeader, { color: theme.colors.text }]}>
          Select {isBike ? 'bike' : 'car'} manufacturing year.
        </AppText>
        <View style={styles.yearGrid}>
          {years.map((item) => (
            <View key={item._id}>
              <TouchableOpacity
                style={[
                  styles.yearBox,
                  selectedYearId === item._id
                    ? { backgroundColor: theme.colors.background, borderColor: theme.colors.primary, borderWidth: 1.5 }
                    : { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow , borderWidth: 1, borderColor: theme.colors.cardborder },
                ]}
                onPress={() => handleYearSelect(item)}
              >
                <AppText style={[
                  styles.ownerText,
                  { color: selectedYearId === item._id ? theme.colors.primary : theme.colors.text },
                ]}>
                  {item.year} {item.islast && ('Below')}
                </AppText>
              </TouchableOpacity>
            </View>
          ))}

        </View>
      </ScrollView>
      <BrandInputModal
        visible={ShowModal}
        onClose={() => setShowModal(false)}
        brandInput={otherOwnershipinput}
        setBrandInput={setOtherOwnershipinput}
        onNextPress={() => otherownership(otherOwnershipinput)}
        onBackPress={() => navigation.goBack()}
        theme={theme}
      />
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  subHeader: { fontSize: wp('4.8%'), fontWeight: '600', marginVertical: hp('1.5%'), textTransform: 'capitalize' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  colorItem: { width: wp('15.5%'), alignItems: 'center', marginBottom: hp('2%'), justifyContent: "center" },
  colorCircle: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    marginBottom: hp('0.5%'),
    borderWidth: 1.5,
    borderColor: '#D3D3D3',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.20,
    shadowRadius: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
  colorLabel: { fontSize: wp('2.8%'), textAlign: 'center' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: hp('2.5%') },
  ownerBox: {
    width: wp('44%'),
    paddingVertical: hp('1.8%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  yearBox: {
    width: wp('44%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerText: { fontSize: wp('4.2%'), fontWeight: '500' },
  priceSection: { marginBottom: hp('1%') },
  sectionHeader: { fontSize: wp('5%'), fontWeight: '600', marginBottom: hp('1%') },
  priceLabel: { fontSize: wp('4%'), marginVertical: hp('1%'), fontWeight: '500' },
  inputBox: {
    borderWidth: 1,
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.8%'),
    fontSize: wp('4.5%'),
  },
});

export default CarHistoryAndColor;
