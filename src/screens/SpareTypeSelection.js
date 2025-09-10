import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
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
import Loader from '../components/Loader';

const SpareTypeSelection = ({ navigation, route }) => {
  const headerName = route.params.selectedCategory || 'Spare';
  const { theme } = useContext(AuthContext);
  const { updateForm ,formData} = useFormStore();

  const [selectedType, setSelectedType] = useState(formData.subproducttypeId || '');
  const [selectedCondition, setSelectedCondition] = useState(formData.spareConditionId || '');
  const [types, setTypes] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSpareTypes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        '/api/product/subspareproducttypeRoute/getdata-by-buyer-dealer'
      );
      if (response?.data?.success) {
        setTypes(response.data.data.products || []);
      } else {
        showToast('error', '', response?.data?.message || 'Failed to fetch types');
      }
    } catch (error) {
      showToast('error', '', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fetchConditions = async () => {
    try {
      const response = await apiClient.get(
        '/api/product/spareconditionRoute/getdata-by-buyer-dealer'
      );
      if (response?.data?.success) {
        setConditions(response.data.data.conditions || []);
      } else {
        showToast('error', '', response?.data?.message || 'Failed to fetch conditions');
      }
    } catch (error) {
      showToast('error', '', error?.response?.data?.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    fetchSpareTypes();
    fetchConditions();
  }, []);
  const handleTypePress = (item) => {
    setSelectedType(item?._id);  // now storing _id
    updateForm('spareProductTypeId', item?.product_type_id);
    updateForm('listing_id', item?.listing_id);
    updateForm('subproducttypeId', item?._id);
  };

  const handleConditionPress = (item) => {
    if (!selectedType) {
      showToast('error', '', 'Please select a type first');
      return;
    }
    setSelectedCondition(item._id); // now storing _id
    updateForm('spareConditionId', item._id);
    navigation.navigate('SpareBrandScreen', {
      typeId: selectedType,
      conditionId: item._id,
    });
  };


  const renderCard = ({ item }, selectedId, labelKey, onPressHandler) => {
    const isSelected = selectedId === item._id; // compare using _id
    return (
      <TouchableOpacity
        key={item._id}
        style={[
          styles.card,
          {
            borderColor: isSelected ? theme.colors.primary : '#ccc',
            borderWidth: isSelected ?1.5:0,
            backgroundColor: isSelected ? theme.colors.background:theme.colors.card,
          },
        ]}
        onPress={() => onPressHandler(item)}
      >
        <Text
          style={[
            styles.cardText,
            { color: isSelected ? theme.colors.primary : theme.colors.text },
          ]}
        >
          {item[labelKey]}
        </Text>
      </TouchableOpacity>
    );
  };


  return (
    <BackgroundWrapper>
      <DetailsHeader
        title={`${headerName}`}
        onBackPress={() => navigation.goBack()}
        stepText="1/7"
        rightType="steps"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <AppText style={[styles.subHeader, { color: theme.colors.text }]}>
          Select Type of sparepart or accessries
        </AppText>

        {loading ? (
          <Loader />
        ) : (
          <View style={styles.gridContainer}>
            {types.map((item) =>
              renderCard({ item }, selectedType, 'subproduct_type', handleTypePress)
            )}
          </View>
        )}

        <AppText style={[styles.subHeader, { color: theme.colors.text, marginTop: hp('3%') }]}>
          Select Type
        </AppText>

        <View style={styles.gridContainer}>
          {conditions.map((item) =>
            renderCard({ item }, selectedCondition, 'condition', handleConditionPress)
          )}
        </View>
      </ScrollView>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: hp('4%'),
  },
  subHeader: {
    fontSize: wp('5%'),
    fontWeight: '500',
    marginBottom: hp('2%'),
    marginTop: hp('2%'),
    marginHorizontal: wp('4%'),
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp('2%'),
  },
  card: {
    width: wp('42%'),
    height: hp('8%'),
    borderRadius: wp('3%'),
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
    elevation: 2,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  cardText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
});

export default SpareTypeSelection;
