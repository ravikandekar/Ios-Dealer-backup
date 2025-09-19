import React, { useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { DetailsHeader } from '../components/DetailsHeader';
import DynamicTabView from '../components/DynamicTabView';
import { AuthContext } from '../context/AuthContext';
import VehicleCard from '../components/VehicleCard';
import BackgroundWrapper from '../components/BackgroundWrapper';
import AppText from '../components/AppText';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import Loader from '../components/Loader';
import ProductDeleteModal from '../components/ProductDeleteModal';
import PriceChnageModal from '../components/PriceChnageModal';

const InventoryScreen = ({ navigation }) => {
  const { theme, userID } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('cars');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dataMap, setDataMap] = useState({ cars: [], bikes: [], spares: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [inputPrize, setInputPrize] = useState(null);
  const [editModalData, setEditModalData] = useState(null);
console.log('data');

  const PAGE_SIZE = 10;
  const [pageMap, setPageMap] = useState({ cars: 1, bikes: 1, spares: 1 });
  const [hasMoreMap, setHasMoreMap] = useState({ cars: true, bikes: true, spares: true });
  const [loadingMoreMap, setLoadingMoreMap] = useState({ cars: false, bikes: false, spares: false });

  const tabs = [
    { key: 'cars', label: 'Cars' },
    { key: 'bikes', label: 'Bikes' },
    { key: 'spares', label: 'Spareparts & Accessories' },
  ];
    // ✅ Handle typing
    const formatNumberWithCommas = (text) => {
        const numericValue = text.replace(/[^0-9]/g, ""); // keep digits only
        return numericValue; // store raw number (without commas)
    };
  const handleDelete = async reason => {
    if (!selectedItem) return;
    try {
      const _id = selectedItem?._id;
      const urlMap = {
        cars: `/api/product/carRoutes/cars/${_id}/isdeletebydealer`,
        bikes: `/api/product/bikeRoute/bikes/${_id}/isdeletebydealer`,
        spares: `/api/product/spareRoute/spares/${_id}/isdeletebydealer`,
      };

      const response = await apiClient.put(urlMap[activeTab], { reason });
      if (response?.data?.success) {
        showToast('success', '', 'Product deleted successfully');
        fetchPaginatedInventory(activeTab, 1, true);
      } else {
        throw new Error(response?.data?.message || 'Failed to delete');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('error', '', 'Failed to delete product');
    } finally {
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
  };

  const handleMarkSold = async () => {
    if (!selectedItem) return;
    try {
      const _id = selectedItem?._id;
      const urlMap = {
        cars: `/api/product/carRoutes/cars/${_id}/mark-sold`,
        bikes: `/api/product/bikeRoute/bikes/${_id}/mark-sold`,
        spares: `/api/product/spareRoute/spares/${_id}/mark-sold`,
      };

      const response = await apiClient.patch(urlMap[activeTab]);
      if (response?.data?.success) {
        showToast('success', '', 'Product marked as sold');
        fetchPaginatedInventory(activeTab, 1, true);
      } else {
        throw new Error(response?.data?.message || 'Failed to mark as sold');
      }
    } catch (err) {
      console.error('Mark sold error:', err);
      showToast('error', '', err.message || 'Failed to mark as sold');
    } finally {
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
  };

  const fetchPaginatedInventory = async (type, page = 1, reset = false) => {
    try {
      if (page === 1 && !reset) setLoading(true);

      const payload = { user_id: userID };
      const urlMap = {
        cars: `/api/product/carRoutes/cars_by_dealerid`,
        bikes: `/api/product/bikeRoute/bikes_by_dealerid`,
        spares: `/api/product/spareRoute/spare_by_dealerid`,
      };

      setLoadingMoreMap(prev => ({ ...prev, [type]: page > 1 }));

      const response = await apiClient.post(
        `${urlMap[type]}?page=${page}&limit=${PAGE_SIZE}`,
        payload
      );

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Unknown API error');
      }

      const items = response?.data?.data?.[type] || [];
      if (!Array.isArray(items)) {
        throw new Error(`Invalid data format for ${type}`);
      }

      setDataMap(prev => ({
        ...prev,
        [type]: page === 1 ? items : [...prev[type], ...items],
      }));
      setHasMoreMap(prev => ({ ...prev, [type]: items.length === PAGE_SIZE }));
    } catch (err) {
      console.error(`❌ Error fetching ${type}:`, err);
      showToast('error', '', `Failed to load ${type}`);
    } finally {
      setLoading(false);
      setLoadingMoreMap(prev => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    Promise.all([
      fetchPaginatedInventory('cars', 1, true),
      fetchPaginatedInventory('bikes', 1, true),
      fetchPaginatedInventory('spares', 1, true),
    ]);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPageMap(prev => ({ ...prev, [activeTab]: 1 }));
    try {
      await fetchPaginatedInventory(activeTab, 1, true);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!hasMoreMap[activeTab] || loadingMoreMap[activeTab]) return;
    const nextPage = pageMap[activeTab] + 1;
    setPageMap(prev => ({ ...prev, [activeTab]: nextPage }));
    fetchPaginatedInventory(activeTab, nextPage);
  };

  const handlePriceNext = async () => {
    // if (!inputPrize || isNaN(Number(inputPrize))) {
    //   // return Alert.alert('Error', 'Please enter a valid price');
    //   showToast('error', '', 'Invalid price entered');
    //   return;
    // }

    try {
      setLoading(true);
      let endpoint = '';
      let payload = {};

      if (activeTab === 'cars') {
        endpoint = 'api/product/carRoutes/updatecar_price';
        payload = { car_id: editModalData, price: formatNumberWithCommas(inputPrize) };
      } else if (activeTab === 'bikes') {
        endpoint = 'api/product/bikeRoute/updatebike_price';
        payload = { bike_id: editModalData, price: formatNumberWithCommas(inputPrize) };
      } else if (activeTab === 'spares') {
        endpoint = 'api/product/spareRoute/updatespare_price';
        payload = { spare_id: editModalData, price: formatNumberWithCommas(inputPrize) };
      } else {
        showToast('error', '', 'Invalid category selected.');
        return;
      }

      const response = await apiClient.put(endpoint, payload);
      if (response?.data?.success) {
        showToast('success', '', 'Price updated successfully.');
        setPriceModalVisible(false);
        setInputPrize(null);
        fetchPaginatedInventory(activeTab, 1, true);
      } else {
        showToast('error', '', response?.data?.message || 'Failed to update price.');
      }
    } catch (error) {
      console.error('editPrice error:', error);
      showToast('error', '', error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <VehicleCard
      key={item?._id}
      data={{
        title: `${item?.year || item?.year_of_manufacture || ''} ${item?.brand_name || ''} ${item?.car_name || item?.bike_name || item?.spare_name || ''}`.trim(),
        variant: item?.model_name || '',
        kms: item?.kilometers_driven ? `${item?.kilometers_driven.toLocaleString()} km` : '',
        fuel: item?.fuel_type || item?.condition_name || '',
        transmission: item?.transmission || item?.product_type_name || '',
        price: item?.price ? `${item?.price.toLocaleString()}` : 'N/A',
        leads: item?.leadCount || 0,
        views: item?.viewCount || 0,
        images: item?.images?.map(img => img.url) || [],
        isSold: item?.isSold,
        isDeleted: item?.isDeleted,
        isdisable: item?.isdisable,
      }}
      theme={theme}
      onPressDelete={() => {
        setSelectedItem(item);
        setShowDeleteModal(true);
      }}
      onPressShare={() => console.log('Share', item?._id)}
      onPress={() => {
        navigation.navigate('AssetsPreviewScreen', {
          id: item?._id,
          selectedCategory: activeTab,
        });
      }}
      onPressEdit={(data) => {
        console.log('Editing item:', data);
        setPriceModalVisible(true);
        setEditModalData(item?._id);
        setInputPrize(data?.price);
      }}
      isDraft={false}
    />
  );

  return (
    <BackgroundWrapper style={{ padding: wp('1%') }}>
      <DetailsHeader
        title="My Inventory"
        onBackPress={() => navigation.goBack()}
      />
      <View style={{ marginTop: -hp('0.3%') }}>
        <DynamicTabView
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
        />
      </View>

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={dataMap[activeTab]}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.scrollContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loadingMoreMap[activeTab] ? (
              <AppText style={{ color: theme.colors.primary, textAlign: 'center', marginVertical: 10 }}>
                Loading...
              </AppText>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.noData}>
              <AppText style={{ color: theme.colors.placeholder }}>
                No data available
              </AppText>
            </View>
          }
        />
      )}

      <ProductDeleteModal
        visible={showDeleteModal}
        productTitle={
          selectedItem
            ? `${selectedItem?.year || ''} ${selectedItem?.brand_name || ''} ${selectedItem?.car_name || selectedItem?.bike_name || selectedItem?.spare_name || ''}`
            : 'Product'
        }
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        onDelete={handleDelete}
        onSold={handleMarkSold}
        // isDraft={activeTab === 'draft'}
      />

      <PriceChnageModal
        visible={priceModalVisible}
        onClose={() => setPriceModalVisible(false)}
        inputValue={inputPrize}
        setInputValue={setInputPrize}
        onNextPress={handlePriceNext}
        modalTitle="Enter Price"
        placeholder="₹50,000"
        theme={theme}
      />
    </BackgroundWrapper>
  );
};

export default InventoryScreen;

const styles = StyleSheet.create({
  scrollContent: {
    padding: wp('2%'),
    paddingBottom: hp('10%'),
  },
  noData: {
    alignItems: 'center',
    marginTop: hp('5%'),
  },
});
