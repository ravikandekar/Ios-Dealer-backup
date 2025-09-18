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

const CarNameScreen = ({ navigation, route }) => {
  const { formData, updateForm } = useFormStore();
  const { theme, selectedCategory } = useContext(AuthContext);

  const [searchText, setSearchText] = useState('');
  const [nameList, setNameList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [carInput, setBrandInput] = useState('');
  const [carID, setCarID] = useState('');
  const [ShowModal, setShowModal] = useState(false);
  const carAndBikeBrandId = route.params.brandId;


  const category = selectedCategory || 'Car';
  const isBike = category.toLowerCase() === 'bike';
  console.log('isBike', isBike);
  const fetchData = async (search = '', pageNumber = 1, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      if (isBike) {
        const response = await apiClient.get(
          `/api/product/bike_nameRoutes/getdata-by-buyer-dealer/${carAndBikeBrandId}?search=${search}&page=${pageNumber}&limit=30`
        );

        if (response?.data?.appCode === 1000) {
          const newData = response?.data?.data?.bikenames || [];
          const total = response?.data?.pagination?.totalPages || 1;

          setNameList((prev) =>
            isRefresh || pageNumber === 1 ? newData : [...prev, ...newData]
          );
          setTotalPages(total);
        } else {
          showToast('error', '', response?.data?.message || 'Invalid Bike Request');
          setNameList([]);
        }
      } else {
        const response = await apiClient.get(
          `/api/product/carnameRoute/getdata-by-buyer-dealer?car_brand_id=${carAndBikeBrandId}&search=${search}&page=${pageNumber}&limit=30`
        );

        if (response?.data?.appCode === 1000) {
          const newData = response?.data?.data?.names || [];
          const total = response?.data?.pagination?.totalPages || 1;

          setNameList((prev) =>
            isRefresh || pageNumber === 1 ? newData : [...prev, ...newData]
          );
          setTotalPages(total);
        } else {
          showToast('error', '', response?.data?.message || 'Invalid Car Request');
          setNameList([]);
        }
      }
    } catch (error) {
      console.error('Fetch names error:', error);
      showToast('error', '', error?.response?.data?.message || 'Something went wrong');
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
      setCarID(item?._id);
      setShowModal(true);
      return;
    }
    updateForm('carandBikeId', item?._id);
    navigation.navigate('CarsFuelAndTrans');
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
  const otherbrand = (carInput) => {
    setShowModal(false);
    if (carInput.trim()) {
      updateForm('carandBikeId', carID);
      updateForm('carAndbike_other_text', carInput);
      navigation.navigate('CarsFuelAndTrans');
    }
  };
  useEffect(() => {
    if (carAndBikeBrandId) {
      fetchData(searchText, 1, true);
    } else {
      showToast('error', '', 'Brand ID is missing');
    }
  }, [carAndBikeBrandId]);

  const renderItem = ({ item }) => {
    const selectedId = formData.carandBikeId;
    const name = isBike ? item.bikename : item.car_name;
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
        title={isBike ? 'Bike Details' : 'Car Details'}
        stepText={selectedCategory === 'Bike' ? ' 3/7' : ' 2/6'}
        rightType="steps"
        onBackPress={() => navigation.goBack()}
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBg }]}>
        <TextInput
          style={[styles.searchBox, { color: theme.colors.text }]}
          placeholder={`Search ${isBike ? 'Bike' : 'Car'} Name`}
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
        Select your {isBike ? 'Bike' : 'Car'} Name.
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
      <BrandInputModal
        visible={ShowModal}
        onClose={() => setShowModal(false)}
        brandInput={carInput}
        setBrandInput={setBrandInput}
        onNextPress={() => otherbrand(carInput)}
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

export default CarNameScreen;
