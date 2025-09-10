import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import BackgroundWrapper from '../components/BackgroundWrapper';
import { AuthContext } from '../context/AuthContext';
import BrandAndCarNameCard from '../components/BrandAndCarNameCard';
import { DetailsHeader } from '../components/DetailsHeader';
import { useFormStore } from '../store/formStore';
import AppText from '../components/AppText';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import BrandInputModal from '../components/BrandInputModal';

const PAGE_LIMIT = 30;

const SpareBrandScreen = ({ navigation, route }) => {
  const { formData, updateForm } = useFormStore();
  const { theme, selectedCategory } = useContext(AuthContext);
  const headerName = selectedCategory;

  const [searchText, setSearchText] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [ShowModal, setShowModal] = useState(false);
  const [brandID, setbrandID] = useState('');
  const [isCar, setiscar] = useState();
  const [brandList, setBrandList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  console.log('brandList', brandList);

  const fetchBrands = async (search = '', pageNumber = 1, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const listing_id = formData?.listing_id;

      // Construct correct API endpoint
      const endpoint = listing_id
        ? `/api/product/bike_brandRoutes/getdata-by-buyer-dealer/${listing_id}?page=${pageNumber}&limit=${PAGE_LIMIT}&search=${search}`
        : `/api/product/carbrandRoute/getdata-by-buyer-dealer?search=${search}&page=${pageNumber}&limit=${PAGE_LIMIT}`;

      const response = await apiClient.get(endpoint);

      const success = response?.data?.success;
      const brands = response?.data?.data?.brands || [];
      const total = response?.data?.pagination?.totalPages || 1;

      if (success) {
        setTotalPages(total);
        setBrandList((prev) =>
          isRefresh || pageNumber === 1 ? brands : [...prev, ...brands]
        );
      } else {
        showToast('error', '', response?.data?.message || 'Failed to fetch brands');
        setBrandList([]);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      showToast('error', '', error?.response?.data?.message || 'Network error');
    } finally {
      if (!isRefresh) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBrands(searchText, 1);
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    setPage(1);
    fetchBrands(text, 1);
  };

  const handleBrandPress = (brand) => {
    if (brand?.isOthers === true) {
      setShowModal(true);
      setbrandID(brand._id)
      setiscar(brand.iscar)
      return;
    }
    updateForm('SpareBrandId', brand._id);
    navigation.navigate('SparePartName', { brandId: brand._id, isCar: brand?.iscar });
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBrands(searchText, nextPage);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchBrands(searchText, 1, true);
  };
  const otherbrand = (brandInput) => {
    setShowModal(false);
    if (brandInput.trim()) {
      updateForm('Sparebrand_other_text', brandInput);
      updateForm('SpareBrandId', brandID);
      navigation.navigate('SparePartName', { brandId: brandID, isCar: isCar });
    }
  };
  return (
    <BackgroundWrapper>
      <DetailsHeader
        title={`${headerName} Details`}
        onBackPress={() => navigation.goBack()}
        stepText="1/7"
        rightType="steps"
      />

      {/* Search Box */}
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBg }]}>
        <TextInput
          style={[styles.searchBox, { color: theme.colors.text }]}
          placeholder="Search"
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor={theme.colors.themeIcon}
        />
        <Icon
          name="magnify"
          size={27}
          color={theme.colors.themeIcon}
          style={styles.searchIcon}
        />
      </View>

      <AppText style={[styles.subHeader, { color: theme.colors.text }]}>
        Select your {headerName} brand.
      </AppText>

      {/* Brand List */}
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <FlatList
          data={brandList}
          renderItem={({ item }) => (
            <BrandAndCarNameCard
              item={item.brand || item.car_brand_name}
              isSelected={formData.SpareBrandId === item._id}
              onPress={() => handleBrandPress(item)}
              theme={theme}
            />
          )}
          keyExtractor={(item) => item._id}
          numColumns={4}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          columnWrapperStyle={{
            justifyContent: 'flex-start',
            marginBottom: hp('1.5%'),
          }}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={
            <AppText
              style={{
                color: theme.colors.text,
                textAlign: 'center',
                marginTop: hp('4%'),
              }}>
              No Brands Found.
            </AppText>
          }
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={{ marginBottom: 20 }}
              />
            ) : null
          }
        />
      )}

      {/* Modal */}
      <BrandInputModal
        visible={ShowModal}
        onClose={() => setShowModal(false)}
        brandInput={brandInput}
        setBrandInput={setBrandInput}
        onNextPress={() => otherbrand(brandInput)}
        onBackPress={() => navigation.goBack()}
        theme={theme}
      />
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('3%'),
    marginVertical: hp('2%'),
  },
  searchBox: {
    flex: 1,
    fontSize: wp('4.8%'),
    paddingVertical: hp('1.2%'),
  },
  subHeader: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    marginBottom: hp('2%'),
  },
  gridContainer: {
    paddingBottom: hp('4%'),
  },
  searchIcon: {},
});

export default SpareBrandScreen;
