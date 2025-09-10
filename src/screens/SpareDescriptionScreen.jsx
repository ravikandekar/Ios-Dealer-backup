// SpareDescriptionScreen.js

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import AppText from '../components/AppText';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { AuthContext } from '../context/AuthContext';
import { DetailsHeader } from '../components/DetailsHeader';
import { useFormStore } from '../store/formStore';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';

const PAGE_LIMIT = 20;
 
const SpareDescriptionScreen = ({ navigation }) => {
  const { formData, updateForm } = useFormStore();
  const [yearList, setYearList] = useState([]);
  const [selectedYear, setSelectedYear] = useState(formData?.Spareyear_of_manufacture || null);
  const [name, setName] = useState(formData?.Sparename || '');
  const [description, setDescription] = useState(formData?.Sparedescription || '');
  const [price, setPrice] = useState(formData?.Spareprice || '');

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const { theme } = useContext(AuthContext);

  const fetchYears = async (pageNum = 1, isRefresh = false) => {
    try {
      if (!isRefresh && pageNum === 1) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);

      const res = await apiClient.get(
        `/api/product/spareyear_of_manufactureRoute/getdata-by-buyer-dealer?page=${pageNum}&limit=${PAGE_LIMIT}`
      );

      if (res?.data?.appCode === 1000) {
        const newYears = res.data.data.years || [];
        const total = res.data.pagination?.totalPages || 1;

        setTotalPages(total);
        setYearList((prev) =>
          pageNum === 1 ? newYears : [...prev, ...newYears]
        );
        setPage(pageNum);
      } else {
        showToast('error', '', res?.data?.message || 'Failed to load years');
      }
    } catch (err) {
      console.error(err);
      showToast('error', '', 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleYearSelect = (item) => {
    if (!name.trim() || !description.trim() || !price.trim()) {
      return showToast('error', 'Required', 'Please fill all fields before selecting a year');
    }

    setSelectedYear(item.year_of_manufacture);
    updateForm('Sparename', name);
    updateForm('Sparedescription', description);
    updateForm('Spareprice', price);
    updateForm('SpareyearId', item._id);
    updateForm('Spareyear_of_manufacture', item.year_of_manufacture);

    navigation.navigate('SpareUploadScreen');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchYears(1, true);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchYears(page + 1);
    }
  };

  const renderYearCard = ({ item }) => {
    const isSelected = selectedYear === item.year_of_manufacture;
    return (
      <TouchableOpacity
        onPress={() => handleYearSelect(item)}
        style={[
          styles.card,
          isSelected
            ? {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.primary,
                borderWidth: 1.5,
              }
            : {
                backgroundColor: theme.colors.card,
                shadowColor: theme.colors.shadow,
              },
        ]}
      >
        <AppText
          style={[
            styles.cardText,
            { color: isSelected ? theme.colors.primary : theme.colors.text },
          ]}
        >
          {item.year_of_manufacture} {item.islast && ('Below')}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundWrapper>
      <DetailsHeader title="Spare Description" stepText="3/7" rightType="steps" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: hp('3%') }}
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
        <AppText style={[styles.label, { color: theme.colors.text }]}>Spare Name</AppText>
        <TextInput
          style={[styles.input, {
            color: theme.colors.text,
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.placeholder
          }]}
          placeholder="Enter spare name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={theme.colors.placeholder}
        />

        <AppText style={[styles.label, { color: theme.colors.text, fontSize: wp('5.5%') }]}>
          Set price for spares-accessories
        </AppText>
        <AppText style={[styles.label, { color: theme.colors.text }]}>Price</AppText>
        <TextInput
          style={[styles.input, {
            color: theme.colors.text,
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.placeholder
          }]}
          placeholder="₹ Enter price"
          value={price}
          onChangeText={(text) => {
                            // allow only numbers
                            const numericValue = text.replace(/[^0-9]/g, '');

                            // limit max 100 crore (1,00,00,00,000)
                            if (numericValue === '' || parseInt(numericValue, 10) <= 1000000000) {
                                setPrice(numericValue);
                            }
                        }}
          keyboardType="numeric"
          placeholderTextColor={theme.colors.placeholder}
        />

        <AppText style={[styles.label, { color: theme.colors.text }]}>Description</AppText>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.placeholder,
              textAlignVertical: 'top',
            },
          ]}
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          placeholderTextColor={theme.colors.placeholder}
          multiline
          numberOfLines={5}
          maxLength={300}
        />

        <AppText style={[styles.label, { color: theme.colors.text, fontSize: wp('5.5%') }]}>
          Select Year of Manufacture
        </AppText>

        <FlatList
          data={yearList}
          numColumns={2}
          keyExtractor={(item) => item._id}
          renderItem={renderYearCard}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
          onEndReached={handleLoadMore}
          scrollEnabled={false}
          onEndReachedThreshold={0.2}
          ListFooterComponent={() =>
            loadingMore ? (
              <View style={{ alignItems: 'center', marginVertical: hp('1.5%') }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null
          }
        />

        {loading && (
          <View style={{ alignItems: 'center', marginVertical: hp('2%') }}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </View>
        )}
      </ScrollView>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: wp('4.8%'),
    fontWeight: '500',
    marginVertical: hp('1%'),
    marginHorizontal: wp('4%'),
  },
  input: {
    fontSize: wp('4.5%'),
    borderWidth: 0.5,
    borderRadius: wp('2.5%'),
    padding: wp('3%'),
    marginHorizontal: wp('2%'),
    marginBottom: hp('2%'),
  },
  textArea: {
    height: hp('15%'),
  },
  gridContainer: {
    paddingBottom: hp('4%'),
    paddingHorizontal: wp('2%'),
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: hp('1.5%'),
  },
  card: {
    width: wp('42%'),
    height: hp('6.7%'),
    borderRadius: wp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    marginVertical: wp('1%'),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  cardText: {
    fontSize: wp('4.2%'),
    fontWeight: '500',
  },
});

export default SpareDescriptionScreen;
