import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
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
import BrandAndCarNameCard from '../components/BrandAndCarNameCard';
import { DetailsHeader } from '../components/DetailsHeader';
import { useFormStore } from '../store/formStore';
import AppText from '../components/AppText';
import Loader from '../components/Loader';
import { showToast } from '../utils/toastService';
import apiClient from '../utils/apiClient';
import BrandInputModal from '../components/BrandInputModal';

const SparePartName = ({ navigation, route }) => {
  const { formData, updateForm } = useFormStore();
  const { theme } = useContext(AuthContext);

  const [searchText, setSearchText] = useState('');
  const [nameList, setNameList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [brandInput, setBrandInput] = useState('');
  const [ShowModal, setShowModal] = useState(false);
  const [brandID, setbrandID] = useState('');

  const { brandId, isCar } = route.params || {};
  const PAGE_LIMIT = 30;
  console.log('vvv', isCar);


  const fetchData = async (search = '', pageNumber = 1, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      let response;

      if (isCar) {
        // Car API
        response = await apiClient.get(
          `/api/product/carnameRoute/getdata-by-buyer-dealer?car_brand_id=${brandId}&search=${search}&page=${pageNumber}&limit=${PAGE_LIMIT}`
        );

        if (response?.data?.appCode === 1000) {
          const newData = response?.data?.data?.names || [];
          const total = response?.data?.pagination?.totalPages || 1;

          setNameList((prev) =>
            isRefresh || pageNumber === 1 ? newData : [...prev, ...newData]
          );
          setTotalPages(total);
        } else {
          throw new Error(response?.data?.message || 'Car fetch failed');
        }
      } else {
        // Bike API
        response = await apiClient.get(
          `/api/product/bike_nameRoutes/getdata-by-buyer-dealer/${brandId}?search=${search}&page=${pageNumber}&limit=${PAGE_LIMIT}`
        );

        if (response?.data?.appCode === 1000) {
          const newData = response?.data?.data?.bikenames || [];
          const total = response?.data?.pagination?.totalPages || 1;

          setNameList((prev) =>
            isRefresh || pageNumber === 1 ? newData : [...prev, ...newData]
          );
          setTotalPages(total);
        } else {
          throw new Error(response?.data?.message || 'Bike fetch failed');
        }
      }
    } catch (error) {
      console.error('Fetch names error:', error);
      showToast('error', '', error.message || 'Something went wrong');
      setNameList([]);
    } finally {
      if (!isRefresh) setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
    setPage(1);
    fetchData(text, 1, true);
  };

  const handleSelect = (item) => {
    if (item?.isOthers === true) {
      setShowModal(true);
      setbrandID(item._id)

      return;
    }
    updateForm('SparePartNameId', item._id);
    navigation.navigate('SpareDescriptionScreen');
  };
  const otherbrand = (brandInput) => {
    setShowModal(false);
    if (brandInput.trim()) {
      updateForm('Sparemodel_other_text', brandInput);
      updateForm('SparePartNameId', brandID);
     navigation.navigate('SpareDescriptionScreen');
    }
  };
  const handleLoadMore = () => {
    if (!loading && page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(searchText, nextPage);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchData(searchText, 1, true);
  };

  useEffect(() => {
    if (brandId) {
      fetchData(searchText, 1, true);
    } else {
      showToast('error', '', 'Brand ID is missing');
    }
  }, [brandId]);

  const renderItem = ({ item }) => {
    const selectedId = formData.SparePartNameId;
    const name = isCar ? item.car_name : item.bikename;
    const isSelected = selectedId === item._id;

    return (
      <BrandAndCarNameCard
        item={name}
        isSelected={isSelected}
        onPress={() => handleSelect(item)}
        theme={theme}
      />
    );
  };

  const renderEmptyList = () => {
    if (loading && page === 1) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          No names found.
        </Text>
      </View>
    );
  };

  return (
    <BackgroundWrapper>
      <DetailsHeader
        title={isCar ? 'Car Spare Details' : 'Bike/Scooty Spare Details'}
        stepText="3/5"
        rightType="steps"
        onBackPress={() => navigation.goBack()}
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBg }]}>
        <TextInput
          style={[styles.searchBox, { color: theme.colors.text }]}
          placeholder={`Search ${isCar ? 'Car ' : 'Bike/Scooty'} Spare Name`}
          value={searchText}
          onChangeText={handleSearchChange}
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
        Select your {isCar ? 'Car' : 'Bike'} Name.
      </AppText>

      {loading && page === 1 ? (
        <Loader />
      ) : (
        <FlatList
          data={nameList}
          renderItem={renderItem}
          keyExtractor={(item, index) => item._id || index.toString()}
          numColumns={4}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={{
            justifyContent: 'flex-start',
            marginBottom: hp('1.5%'),
          }}
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator color={theme.colors.primary} />
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
  subHeader: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    marginBottom: hp('2%'),
  },
  gridContainer: {
    paddingBottom: hp('4%'),
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('3%'),
    marginBottom: hp('2%'),
    marginTop: hp('2%'),
  },
  searchIcon: {
    marginLeft: wp('2%'),
  },
  searchBox: {
    flex: 1,
    fontSize: wp('4.8%'),
    paddingVertical: hp('1.2%'),
  },
  emptyContainer: {
    marginTop: hp('5%'),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
  },
});

export default SparePartName;
