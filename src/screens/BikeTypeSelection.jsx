import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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

const BikeTypeSelection = ({ navigation, route }) => {
  const headerName = route.params.selectedCategory || 'Bike';
  const { theme } = useContext(AuthContext);
  const { formData, updateForm } = useFormStore();
console.log('jjjjj',formData.bikeTypeId);

  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState(formData.bikeTypeId || '');
  const [bikeTypes, setBikeTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBikeTypes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/product/bike_typeRoutes/getdata-by-buyer-dealer');

      if (response?.data?.success) {
        const types = response.data.data.bikeTypes || [];
        setBikeTypes(types);

        // Set selectedType based on formData after bike types are fetched
        if (formData.bikeTypeId) {
          setSelectedType(formData.bikeTypeId);
        }
      } else {
        showToast('error', '', response?.data?.message || 'Failed to fetch bike types');
      }
    } catch (error) {
      console.error('❌ Error fetching bike types:', error);
      showToast('error', '', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikeTypes();
  }, []);

  const filteredTypes = bikeTypes.filter((type) =>
    type?.bike_type?.toLowerCase()?.includes(searchText.toLowerCase())
  );

  const handleTypePress = (type) => {
    setSelectedType(type._id);
    updateForm('bikeTypeId', type._id);
    navigation.navigate('CarDetailsScreen', { typeId: type._id });
  };

  const renderCard = ({ item }) => {
    const isSelected = selectedType === item._id;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            borderColor: isSelected ? theme.colors.primary : theme.colors.cardborder,
            backgroundColor: theme.colors.card,
            borderWidth: isSelected ? 1.5 : 0.5,
          },
        ]}
        onPress={() => handleTypePress(item)}
      >
        <Text
          style={[
            styles.cardText,
            { color: isSelected ? theme.colors.primary : theme.colors.text },
          ]}
        >
          {item.bike_type}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundWrapper>
      <DetailsHeader
        title={`${headerName} Type`}
        onBackPress={() => navigation.goBack()}
        stepText="1/7"
        rightType="steps"
      />

      <AppText style={[styles.subHeader, { color: theme.colors.text }]}>
        Select your bike type.
      </AppText>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: hp('5%') }}
        />
      ) : (
        <FlatList
          data={filteredTypes}
          renderItem={renderCard}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.gridContainer}
        />
      )}
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  subHeader: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    marginBottom: hp('2%'),
    marginTop: hp('2%'),
    marginHorizontal: wp('4%'),
  },
  gridContainer: {
    paddingBottom: hp('4%'),
  },
  column: {
    justifyContent: 'space-between',
    marginBottom: hp('1.5%'),
    paddingHorizontal: wp('3%'),
  },
  card: {
    width: wp('42%'),
    height: hp('8%'),
    borderRadius: wp('3%'),
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    backgroundColor: '#fff',
  },
  cardText: {
    fontSize: wp('4%'),
    fontWeight: '600',
  },
});

export default BikeTypeSelection;
