import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    RefreshControl,
    Alert
} from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import AppText from '../components/AppText';
import { AuthContext } from '../context/AuthContext';
import BackgroundWrapper from '../components/BackgroundWrapper';
import VehicleCard from '../components/VehicleCard';
import DynamicTabView from '../components/DynamicTabView';
import { DetailsHeader } from '../components/DetailsHeader';
import InfoBanner from '../components/InfoBanner';
import ProductDeleteModal from '../components/ProductDeleteModal';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import Loader from '../components/Loader';
import PriceChnageModal from '../components/PriceChnageModal';
import { useFormStore } from '../store/formStore';
import SubscriptionModal from '../components/SubscriptionModal';

const PAGE_SIZE = 20;

const MyAssetsScreen = ({ navigation }) => {
    const { theme, selectedCategory, userID } = useContext(AuthContext);
    const { formData, updateForm } = useFormStore();
    const isSubscribed = formData?.subscriptionActive !== undefined ? formData?.subscriptionActive : true;
    const [activeTab, setActiveTab] = useState('publish');
    const [publishedAssets, setPublishedAssets] = useState([]);
    const [draftAssets, setDraftAssets] = useState([]);
    const [soldAssets, setSoldAssets] = useState([]);
    const [editModalData, seteditModalData] = useState(null);
    const isSubscriberRequired = formData?.isSubscriberRequired;
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [priceModalVisible, setpriceModalVisible] = useState(false);
    const [inputPrize, setInputPrize] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [selectedAssetId, setSelectedAssetId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // ✅ Handle typing
    const formatNumberWithCommas = (text) => {
        const numericValue = text.replace(/[^0-9]/g, ""); // keep digits only
        return numericValue; // store raw number (without commas)
    };
    useEffect(() => {
        fetchInventory(1, true);
    }, [selectedCategory]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchInventory(1, true);
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchInventory(currentPage + 1);
        }
    };

    const formatAsset = item => ({
        id: item._id,
        _id: item._id, // Keep both for compatibility
        title: `${item.year} ${item.brand_name} ${item.car_name || item.bike_name}`,
        variant: item.model_name,
        kms: `${item.kilometers_driven?.toLocaleString()} Kms`,
        fuel: item.fuel_type,
        transmission: item.transmission,
        price: `${item.price?.toLocaleString('en-IN')}`,
        leads: item.leadCount ?? 0,
        views: item.viewCount ?? 0,
        images: item.images?.map(img => img.url) ?? [],
        isPublished: item.isPublished,
        isSold: item.isSold,
        isActive: item.isActive,
        isDeleted: item.isDeleted,
        deletionReason: item.deletionReason,
    });
    const SpareformatAsset = item => ({
        id: item._id,
        _id: item._id, // for compatibility if both keys are used
        title: `${item.year_of_manufacture} ${item.brand_name} ${item.model_name}`,
        variant: item.subproduct_type_name,
        fuel: item?.fuel_type || item?.condition_name || '',
        transmission: item?.transmission || item?.product_type_name || '',
        price: item.price ? `${item.price?.toLocaleString('en-IN')}` : 'Price on request',
        leads: item.leadCount ?? 0,
        views: item.viewCount ?? 0,
        images: item.images?.map(img => img.url) ?? [],
        isPublished: item.isPublished,
        isSold: item.isSold,
        isActive: item.isActive,
        isDeleted: item.isDeleted,
        deletionReason: item.deletionReason,
    });
    const handlePriceNext = async () => {
        console.log('Selected edit option:', editModalData);

        try {
            setLoading(true); // Show loader

            let endpoint = '';
            let payload = {};

            if (selectedCategory === 'Car') {
                endpoint = 'api/product/carRoutes/updatecar_price';
                payload = {
                    car_id: editModalData,
                    price: formatNumberWithCommas(inputPrize),
                };
            } else if (selectedCategory === 'Bike') {
                endpoint = 'api/product/bikeRoute/updatebike_price';
                payload = {
                    bike_id: editModalData,
                    price: formatNumberWithCommas(inputPrize),
                };
            } else if (selectedCategory === 'Spare Part Accessories') {
                endpoint = 'api/product/spareRoute/updatespare_price';
                payload = {
                    spare_id: editModalData,
                    price: formatNumberWithCommas(inputPrize),
                };
            } else {
                Alert.alert('Error', 'Invalid category selected.');
                return;
            }

            const response = await apiClient.put(endpoint, payload);

            if (response?.data?.success) {
                showToast('success', '', 'Price updated successfully.');
                setpriceModalVisible(false);
                fetchInventory(1, true); // Refresh inventory
                setInputPrize(null);     // Reset input
            } else {
                Alert.alert('Error', response?.data?.message || 'Failed to update price.');
            }
        } catch (error) {
            console.error('editPrice error:', error);
            showToast('success', '', error?.response?.data?.message || 'Something went wrong!');
        } finally {
            setLoading(false); // Hide loader
        }
    };
    const handleSubscribe = () => {
        clearFields([
            'carAndBikeBrandId', 'carandBikeId', 'yearId', 'fuelTypeId', 'carColorId',
            'model_name', 'price', 'kmsDriven', 'transmissionId',
            'ownerHistoryId', 'isPublished', 'otherbrand', 'bike_type_id'
        ]);

        InteractionManager.runAfterInteractions(() => {
            setShowSubscriptionModal(false);
        });

        navigation.navigate('SubscriptionScreen');
    };
    const fetchInventory = async (page = 1, refreshing = false) => {
        try {
            if (refreshing) {
                setHasMore(true);
                setCurrentPage(1);
                setPublishedAssets([]);
                setDraftAssets([]);
                setSoldAssets([]);
            } else {
                setLoading(true);
            }

            const response = await apiClient.get(`/api/dealer/myassetRoute/${userID}?page=${page}&limit=${PAGE_SIZE}`);
            const allListings = response?.data?.data?.assets?.listings || [];

            // Filter out deleted items from the API response
            const activeListings = allListings.filter(item => !item.isDeleted);
            const isSpareCategory = selectedCategory === 'Spare Part Accessories';
            const formattedAssets = activeListings.map(item =>
                isSpareCategory ? SpareformatAsset(item) : formatAsset(item)
            );


            const pagination = response?.data?.data?.assets?.pagination || {};
            setCurrentPage(pagination.currentPage || page);
            setHasMore(pagination.currentPage < pagination.totalPages);

            if (refreshing) {
                // Separate items based on their status
                const published = formattedAssets.filter(item => item.isPublished === true && !item.isSold);
                const drafts = formattedAssets.filter(item => item.isPublished === false && !item.isSold);
                const sold = formattedAssets.filter(item => item.isSold === true);

                setPublishedAssets(published);
                setDraftAssets(drafts);
                setSoldAssets(sold);
            } else {
                // For pagination, add new items to existing lists
                const newPublished = formattedAssets.filter(item => item.isPublished === true && !item.isSold);
                const newDrafts = formattedAssets.filter(item => item.isPublished === false && !item.isSold);
                const newSold = formattedAssets.filter(item => item.isSold === true);

                setPublishedAssets(prev => [...prev, ...newPublished]);
                setDraftAssets(prev => [...prev, ...newDrafts]);
                setSoldAssets(prev => [...prev, ...newSold]);
            }
        } catch (error) {
            console.error('❌ Error fetching inventory:', error);
            showToast('error', '', 'Failed to load inventory.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDelete = async reason => {
        if (!selectedAssetId) return;

        try {
            const url = `/api/dealer/myassetRoute/${selectedAssetId}/isdeletebydealer`;
            const payload = { reason };
            const response = await apiClient.put(url, payload);

            if (response?.data?.success) {
                showToast('success', '', 'Product deleted successfully');

                // Remove the deleted item from all lists immediately
                setPublishedAssets(prev => prev.filter(item => item.id !== selectedAssetId));
                setDraftAssets(prev => prev.filter(item => item.id !== selectedAssetId));
                setSoldAssets(prev => prev.filter(item => item.id !== selectedAssetId));

            } else {
                throw new Error(response?.data?.message || 'Failed to delete');
            }
        } catch (err) {
            console.error('Delete error:', err);
            showToast('error', '', err.message || 'Failed to delete product');
        } finally {
            setShowDeleteModal(false);
            setSelectedAssetId(null);
        }
    };

    const handleMarkSold = async () => {
        if (!selectedAssetId) return;

        try {
            const url = `/api/dealer/myassetRoute/${selectedAssetId}/mark-sold`;
            const response = await apiClient.patch(url);

            if (response?.data?.success) {
                showToast('success', '', 'Product marked as sold');

                // Find the item from published or draft lists
                const soldItem = publishedAssets.find(item => item.id === selectedAssetId) ||
                    draftAssets.find(item => item.id === selectedAssetId);

                if (soldItem) {
                    // Remove from published/draft lists
                    setPublishedAssets(prev => prev.filter(item => item.id !== selectedAssetId));
                    setDraftAssets(prev => prev.filter(item => item.id !== selectedAssetId));

                    // Add to sold list with updated status
                    setSoldAssets(prev => [...prev, { ...soldItem, isSold: true, isActive: false }]);
                }

            } else {
                throw new Error(response?.data?.message || 'Failed to mark as sold');
            }
        } catch (err) {
            console.error('Mark sold error:', err);
            showToast('error', '', err.message || 'Failed to mark as sold');
        } finally {
            setShowDeleteModal(false);
            setSelectedAssetId(null);
        }
    };

    const renderItem = ({ item }) => (
        <VehicleCard
            data={item}
            theme={theme}
            onPressShare={() => console.log('Share', item.id)}
            onPressDelete={() => {
                setSelectedAssetId(item.id);
                setShowDeleteModal(true);
            }}
            onPressEdit={() => {
                setpriceModalVisible(true)
                seteditModalData(item?._id)
                setInputPrize(item?.price)
            }}
            onPress={() => {
                const categoryMap = {
                    Car: 'cars',
                    Bike: 'bikes',
                    'Spare Part Accessories': 'spares',
                };

                const categoryRoute = categoryMap[selectedCategory];

                if (activeTab === 'draft') {
                    if (selectedCategory === 'Spare Part Accessories') {
                        navigation.navigate('SparePreviewScreen', {
                            spareId: item?.id,
                            selectedCategory: categoryRoute,
                        });
                    } else {
                        const vehicleType = selectedCategory === 'Bike'
                            ? 'bike'
                            : selectedCategory === 'Car'
                                ? 'car'
                                : '';

                        navigation.navigate('PreviewScreen', {
                            carandBikeId: item.id,
                            vehicleType,
                        });
                    }
                } else {
                    navigation.navigate('AssetsPreviewScreen', {
                        id: item.id,
                        selectedCategory: categoryRoute,
                    });
                }
            }}

            isDraft={activeTab === 'draft'}

        />
    );

    const tabs = [
        { key: 'publish', label: 'Published' },
        { key: 'draft', label: 'Draft' },
        { key: 'sold', label: 'Sold' },
    ];

    // Get current data based on active tab
    const getCurrentData = () => {
        switch (activeTab) {
            case 'publish':
                return publishedAssets;
            case 'draft':
                return draftAssets;
            case 'sold':
                return soldAssets;
            default:
                return [];
        }
    };

    const currentData = getCurrentData();

    return (
        <BackgroundWrapper style={{ padding: wp('1%') }}>
            <DetailsHeader
                title="My Assets"
                rightType="action"
                actionIcon="add-circle-outline"
                actionText="Add New"
                onActionPress={() => {
                    if (isSubscriberRequired === true) {
                        setShowSubscriptionModal(true);
                    } else {
                        if (selectedCategory === "Bike") {
                            navigation.navigate("BikeTypeSelection", { selectedCategory });
                        } else if (selectedCategory === "Spare Part Accessories") {
                            navigation.navigate("SpareTypeSelection", { selectedCategory });
                        } else {
                            navigation.navigate("CarDetailsScreen", { selectedCategory });
                        }
                    }
                }
                }
            />

            {loading && !refreshing && currentPage === 1 && <Loader />}

            <View style={{ marginTop: -hp('0.3%') }}>
                <DynamicTabView
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    theme={theme}
                />
            </View>


            {isSubscribed && (
                <InfoBanner
                    iconName="info"
                    iconType="feather"
                    iconColor="red"
                    title="Your Subscription is Expired."
                    subtitle="You have to renew it, to publish your listings."
                    buttonText="Renew"
                    rightsideiconcolor={theme.colors.themeIcon}
                    onPress={() => navigation.navigate('SubscriptionScreen')}
                    customStyle={{
                        height: hp('7%'),
                        marginTop: hp('1.2%'),
                        borderRadius: wp('3%'),
                        paddingRight: wp('3%'),
                    }}
                />
            )}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: hp('1%'),
                }}>
                <AppText style={[styles.noteText, { flex: 1, color: theme.colors.text }]}>
                    {activeTab === 'publish'
                        ? '"These listings are live and visible to potential buyers."'
                        : activeTab === 'draft'
                            ? '"These listings are saved as drafts and are not visible to buyers."'
                            : '"These listings have been marked as sold."'}
                </AppText>
                <AppText style={[styles.noteText, { marginLeft: wp('2%'), color: theme.colors.text }]}>
                    {activeTab === 'publish'
                        ? `(Published: ${currentData.length})`
                        : activeTab === 'draft'
                            ? `(Drafts: ${currentData.length})`
                            : `(Sold: ${currentData.length})`}
                </AppText>
            </View>

            <FlatList
                data={currentData}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: wp('2%'), paddingBottom: hp('10%') }}
                showsVerticalScrollIndicator={false}
                onEndReachedThreshold={0.5}
                onEndReached={loadMore}
                // ListFooterComponent={loading && !refreshing ? <Loader /> : null}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={{ alignItems: 'center', marginTop: hp('10%') }}>
                            <AppText style={[styles.emptyText, { color: theme.colors.text }]}>
                                {activeTab === 'publish'
                                    ? 'No published assets found'
                                    : activeTab === 'draft'
                                        ? 'No draft assets found'
                                        : 'No sold assets found'}
                            </AppText>
                        </View>
                    )
                }
            />

            <ProductDeleteModal
                visible={showDeleteModal}
                productTitle="Are you sure you want to delete this asset?"
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedAssetId(null);
                }}
                onDelete={handleDelete}
                onSold={handleMarkSold}
                isDraft={activeTab === 'draft'}
            />
            <PriceChnageModal
                visible={priceModalVisible}
                onClose={() => setpriceModalVisible(false)}
                inputValue={inputPrize}
                setInputValue={setInputPrize}
                onNextPress={handlePriceNext}
                modalTitle="Enter Price"
                placeholder="₹50,000"
                theme={theme}
            />
            <SubscriptionModal
                visible={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                onSubscribe={() => { handleSubscribe() }}
            />
        </BackgroundWrapper>
    );
};

const styles = StyleSheet.create({
    noteText: {
        fontSize: wp('3.7%'),
        marginVertical: hp('1%'),
        paddingHorizontal: wp('4%'),
    },
    emptyText: {
        fontSize: wp('4%'),
        textAlign: 'center',
        opacity: 0.6,
    },
});

export default MyAssetsScreen;