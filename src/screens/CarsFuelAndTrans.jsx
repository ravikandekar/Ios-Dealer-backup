import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AppText from '../components/AppText';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DetailsHeader } from '../components/DetailsHeader';
import { useFormStore } from '../store/formStore';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import BrandInputModal from '../components/BrandInputModal';

const CarsFuelAndTrans = ({ navigation }) => {
  const { formData, updateForm } = useFormStore();
  const [searchText, setSearchText] = useState(formData.model_name || '');
  const [selectedTrans, setSelectedTrans] = useState(formData.transmissionId || '');
  const [selectedFuel, setSelectedFuel] = useState(formData.fuelTypeId || '');
  const [transList, setTransList] = useState([]);
  const [fuelList, setFuelList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, selectedCategory } = useContext(AuthContext);
  const [fuelType, setFuelType] = useState('');
  const category = selectedCategory || 'Car';
  const isBike = category.toLowerCase() === 'bike';
  const [otherfuel, setOtherFuel] = useState('');
  const [ShowModal, setShowModal] = useState(false);
  const fetchData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const transPromise = apiClient.get('/api/product/cartransmission/getdata-by-buyer-dealer');
      const fuelAPI = isBike
        ? '/api/product/bike_fueltypeRoutes/getdata-by-buyer-dealer'
        : '/api/product/car_fueltypeRoutes/getdata-by-buyer-dealer?page=1&limit=10';

      const [transRes, fuelRes] = await Promise.all([
        transPromise,
        apiClient.get(fuelAPI),
      ]);

      if (transRes?.data?.appCode === 1000) {
        setTransList(transRes.data.data.cartransmissions || []);
      } else {
        showToast('error', '', transRes?.data?.message || 'Failed to load transmission');
      }

      if (fuelRes?.data?.appCode === 1000) {
        setFuelList(fuelRes.data.data.fueltypes || []);
      } else {
        showToast('error', '', fuelRes?.data?.message || 'Failed to load fuel types');
      }
    } catch (err) {
      console.log(err);
      showToast('error', '', 'Something went wrong');
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formData.category]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const handleTransPress = (item) => {
    setSelectedTrans(item._id);
    updateForm('transmission', item.car_transmission);
    updateForm('transmissionId', item._id);
  };

  const handleFuelPress = (item) => {

    if (!isBike && !selectedTrans) {
      showToast('error', 'Select Transmission', 'Please select a car transmission first.');
      return;
    }

    if (searchText.length === 0) {
      showToast('error', 'Enter Model', 'Please enter model name.');
      return;
    }
    if (item?.isOthers === true) {
      setFuelType(item?._id);
      setShowModal(true);
      return;
    }
    setSelectedFuel(item._id);
    updateForm('fuelTypeId', item._id);
    navigation.navigate('CarHistoryAndColor');
  };

  const otherbrand = (fuelInput) => {
    setShowModal(false);
    if (fuelInput.trim()) {
      updateForm('fuelTypeId', fuelType);
      updateForm('carAndbike_fuel_other_text', fuelInput);
      navigation.navigate('CarHistoryAndColor');
    }
  };
  const renderCard = (item, selectedId, onPress, labelKey = 'car_transmission') => {
    const name = item[labelKey];
    const isSelected = selectedId === item._id;

    return (
      <TouchableOpacity
        key={item._id}
        onPress={() => onPress(item)}
        style={[
          styles.card,
          isSelected
            ? {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.primary ,
              borderWidth: 1.5,
            }
            : {
              backgroundColor: theme.colors.card,
              shadowColor: theme.colors.shadow,
              borderColor: theme.colors.cardborder,
              borderWidth:  0.5,
            },
        ]}
      >
        <AppText
          numberOfLines={2}
          style={[
            styles.cardText,
            { color: isSelected ? theme.colors.primary : theme.colors.text },
          ]}
        >
          {name}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundWrapper>
      <DetailsHeader title={`${isBike ? 'Bike' : 'Car'} Details`} stepText={selectedCategory === 'Bike' ? ' 4/7' : ' 3/6'} rightType="steps" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: hp('6%') }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >

        <View>
          <AppText style={[styles.subHeader, { color: theme.colors.text }]}>
            Enter your model name.
          </AppText>
          <AppText style={[styles.subHeader, { color: theme.colors.text, fontSize: wp('4.9%'), fontWeight: '500', marginBottom: 8 }]}>
            Enter Model :
          </AppText>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.placeholder }]}>
            <TextInput
              style={[styles.searchBox, { color: theme.colors.text }]}
              placeholder="Enter Model"
              value={formData.model_name || ''}
              onChangeText={(text) => {
                setSearchText(text);
                updateForm('model_name', text);

              }}
              keyboardType='default'
              placeholderTextColor={theme.colors.placeholder}
            />

          </View>
        </View>


        {!isBike && (
          <>
            <AppText style={[styles.subHeader, { color: theme.colors.text }]}>
              Select car transmission.
            </AppText>
            <View style={styles.gridContainer}>
              <View style={styles.row}>
                {transList.map((trans) =>
                  renderCard(trans, selectedTrans, handleTransPress, 'car_transmission')
                )}
              </View>
            </View>
          </>
        )}

        <AppText style={[styles.subHeader, { color: theme.colors.text }]}>
          Select {isBike ? 'bike' : 'car'} fuel type
        </AppText>
        <View style={styles.gridContainer}>
          <View style={styles.row}>
            {fuelList.map((fuel) =>
              renderCard(fuel, selectedFuel, handleFuelPress, 'fueltype')
            )}
          </View>
        </View>

        {loading && (
          <View style={{ alignItems: 'center', marginVertical: hp('2%') }}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </View>
        )}
      </ScrollView>
      <BrandInputModal
        visible={ShowModal}
        onClose={() => setShowModal(false)}
        brandInput={fuelType}
        setBrandInput={setOtherFuel}
        onNextPress={() => otherbrand(fuelType)}
        onBackPress={() => navigation.goBack()}
        theme={theme}
      />
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  subHeader: {
    fontSize: wp('5.5%'),
    fontWeight: '500',
    marginVertical: hp('1.5%'),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('3%'),
    marginBottom: hp('2%'),

    borderWidth: 0.5
  },
  searchIcon: {
    marginLeft: wp('2%'),
  },
  searchBox: {
    flex: 1,
    fontSize: wp('4.5%'),
    paddingVertical: hp('1.5%'),

  },
  gridContainer: {
    marginBottom: hp('2.5%'),
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: wp('2%'),
  },
  card: {
    width: wp('43%'),
    height: hp('8%'),
    borderRadius: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
    elevation: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardText: {
    fontSize: wp('4.2%'),
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CarsFuelAndTrans;
