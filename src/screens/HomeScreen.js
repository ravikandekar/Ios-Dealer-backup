import {
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  Platform,
  Alert,
  InteractionManager,
} from 'react-native';

import React, { useContext, useEffect, useState } from 'react';
import HeaderComponent from '../components/HeaderComponent';
import { AuthContext } from '../context/AuthContext';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import CarScrollComponent from '../components/CarScrollComponent';
import {
  CarScrollComponentImage1,
  CarScrollComponentImage2,
  CarScrollComponentImage3,
} from '../../public_assets/media';
import GadiloWelcomeCard from '../components/WelcomeCard';
import CategoryDropdownMenu from '../components/CategoryDropDownMenu';

import {
  welcomeCardData,
  Subscription,
  categoryIcons,
} from '../constants/strings';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import InfoBanner from '../components/InfoBanner';
import ListingOverviewCard from '../components/ListingOverViewCard';
import QuickListingCard from '../components/QuickListingCard';
import OverviewBottomSheet from '../components/OverviewBottomSheet';
import AppText from '../components/AppText';
import { GradientText } from '../components/GradientText';
import BackgroundWrapper from '../components/BackgroundWrapper';
import ImageSlider from '../components/ImageSlider';
import DeviceInfo from 'react-native-device-info';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import Loader from '../components/Loader';
import { useFormStore } from '../store/formStore';
import PriceChnageModal from '../components/PriceChnageModal';
import ForceUpdateModal from '../components/ForceUpdateModal';
import { verifyPurchaseOnBackend } from '../utils/purchaseVerification';
import { getPurchaseTokenAndProductID, storePurchaseTokenAndProductID } from '../utils/storage';
import { initApp } from '../utils/appInitializer';
import { useIsFocused } from "@react-navigation/native";
import SubscriptionModal from '../components/SubscriptionModal';
import { verifyPurchaseOnBackendIOS } from '../utils/purchaseVerificationIOS';
import ViewsBottomSheet from '../components/ViewsBottomSheet';
import { registerDeviceToken } from '../utils/NotificationService';
// import { firebase } from '@react-native-firebase/crashlytics';
const HomeScreen = ({ navigation }) => {
  const { theme, isDark, setSelectedCategory, selectedCategory, userID, checkToken, setUserID, setUserName, setregister, setcityselected, setProfileCompleted, setisAadharVerified, setBussinessdetails,
    setIsAppInitialized, } = useContext(AuthContext);
  const cardData = welcomeCardData;
  const { formData, updateForm, clearFields } = useFormStore();
  // console.log('zustand', formData.activeCategorySubscriptionId);
  // console.log('byauth context', activeCategorySubscriptionId);
  const isFocused = useIsFocused();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [overviewStats, setOverviewStats] = useState(null);
  const [overviewViewStats, setOverviewViewStats] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [isViewsModalVisible, setIsViewsModalVisible] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [bannerImages, setBannerImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // ✅ New state for pull-to-refresh


  const isSubscribed = formData?.subscriptionActive !== undefined ? formData?.subscriptionActive : true;
  const isSubscriberRequired = formData?.isSubscriberRequired;

  const oneAutoText = 'One Auto World \nOne Smart Platform';
  const indiasTrustText = 'India’s Trusted Platform to Buy & Sell Used Cars, Bikes, Spare Parts & Accessories';




  useEffect(() => {
    const setupFCM = async () => {
      try {
        const token = await messaging().getToken();
        // ✅ Save token
        if (token) {
          await registerDeviceToken(token, Platform.OS);
          await messaging().subscribeToTopic('GlobalTopic');
          console.log('✅ [FCM] Subscribed to GlobalTopic');
        }
      } catch (error) {
        console.error('❌ [FCM] Error setting up FCM:', error);
      }
    };

    setupFCM();
  }, []);


  useEffect(() => {
    const initialize = async () => {
      try {
        const isTokenValid = await checkToken();
        if (isTokenValid) {
          await initApp({
            setUserID, setUserName, setcityselected, setProfileCompleted,
            setisAadharVerified, setBussinessdetails, setregister,
            setSelectedCategory, setIsAppInitialized, updateForm
          });
        }
      } catch (error) {
        console.error('❌ App initialization failed:', error.message);
      } finally {
        setIsAppInitialized(true);
        setIsAppReady(true);
      }
    };
    initialize();
  }, [selectedCategory, isFocused]);

  // 🔁 Refresh Handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchBanners(),]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await apiClient.get('/api/admin/dealer_bannerRoute/getdata-by-buyer-dealer');
      const { success, data } = response.data;

      if (success && data?.banners?.length > 0) {
        const images = data.banners.map(banner => banner.image).filter(Boolean);
        setBannerImages(images);
      } else {
        showToast('error', '', 'No banners found');
      }
    } catch (error) {
      console.error('Fetch banner error:', error);
      showToast('error', '', error?.response?.data?.message || 'Failed to load banners');
    }
  };


  useEffect(() => {
    fetchBanners();
  }, []);
  // useEffect(() => {
  //   getDealerOverviewStats();
  // }, [selectedCategory]);
  //force update 
  useEffect(() => {
    const checkVersionAndVerify = async () => {
      if (formData?.forceUpdateObject) {
        const { isforceupdate, appversion } = formData.forceUpdateObject;

        // Convert versions to numbers for comparison
        const currentVersion = parseFloat(DeviceInfo.getVersion()); // e.g. "3.2.0" → 3.2
        const requiredVersion = parseFloat(appversion);
        console.log(' Required Version:', requiredVersion);
        console.log('Current Version:', currentVersion);

        // Show update modal only if both conditions match
        if (isforceupdate && requiredVersion > currentVersion) {
          setShowUpdate(true);
        } else {
          setShowUpdate(false);
        }
      }
      // Get stored purchase data
      const { productId, purchaseToken } = await getPurchaseTokenAndProductID();
      // Only call verification if both values are available
      if (productId && purchaseToken) {
        if (Platform.OS === 'android') {
          await verifyPurchaseOnBackend({
            productId,
            purchaseToken,
            userID,
          });
        } else if (Platform.OS === 'ios') {
          await verifyPurchaseOnBackendIOS({
            productId,
            receiptData: purchaseToken, // here purchaseToken is actually transactionReceipt
            userID,
          });
        }
      } else {
        console.log('⚠️ Missing purchaseToken or productId. Skipping verification.');
      }
    };

    checkVersionAndVerify();
  }, [formData]);

  const bottomsheet = (data) => {
    console.log('data', data);

    setBottomSheetVisible(true)
    setOverviewStats(data);
  }
  const Viewbottomsheet = (data) => {
    console.log('data', data);

    setIsViewsModalVisible(true)
    setOverviewViewStats(data);
  }


  const toggleDropdown = () => {
    setShowCategoryDropdown(prev => !prev);
  };

  const handleCategoryChange = category => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
  };
  const handleSubscribe = () => {
    clearFields([
      'carAndBikeBrandId', 'carandBikeId', 'yearId', 'fuelTypeId', 'carColorId',
      'model_name', 'price', 'kmsDriven', 'transmissionId',
      'ownerHistoryId', 'isPublished', 'otherbrand', 'bike_type_id', 'model_name'
    ]);

    InteractionManager.runAfterInteractions(() => {
      setShowSubscriptionModal(false);
    });

    navigation.navigate('SubscriptionScreen');
  };
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? (
        <Loader visible={loading} />
      ) : (
        <>
          {showCategoryDropdown && (
            <View style={styles.categoryDropDown}>
              <CategoryDropdownMenu
                selectedCategory={selectedCategory}
                subscriptions={Subscription}
                onSelect={handleCategoryChange}
              />
            </View>
          )}

          <BackgroundWrapper style={{ paddingHorizontal: wp('0.5%') }}>
            <View style={styles.tempContainer}>
              <HeaderComponent
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onPressM={toggleDropdown}
                Image2={categoryIcons[selectedCategory]}
                onPressIcons={() => navigation.navigate('NotificationScreen')}
              />

              <ScrollView
                contentContainerStyle={styles.scrollContentContainer}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={['#f7941d']}
                    tintColor={theme.colors.primary}

                  />
                }
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.middleContainer}>
                  <ImageSlider
                    images={
                      bannerImages.length > 0
                        ? bannerImages.map(uri => ({ uri }))
                        : [CarScrollComponentImage1, CarScrollComponentImage2, CarScrollComponentImage3]
                    }
                    theme={theme}
                    style={{ height: hp('22%'), marginTop: wp('1') }}
                    imageStyle={{ width: '100%', height: hp('22%') }}
                    paginationshow={false}
                    watermark={false}
                  />

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

                  <View style={styles.welcomeCard}>
                    <GadiloWelcomeCard headText={cardData.headText} />
                  </View> 

                  <View style={styles.carListCard}>
                    <ListingOverviewCard
                      selectedCategory={selectedCategory}
                      apiClient={apiClient}
                      showToast={showToast}
                      solddeletedmodal={(data) => bottomsheet(data)}
                      Viewsmodal={(data) => Viewbottomsheet(data)}
                      refreshing={refreshing}

                    />
                  </View>

                  <View style={styles.quickListCard}>
                    <QuickListingCard
                      title="Add Your Listings – Quick & Easy"
                      cardTitle="Car Listings"
                      cardSubtitle="Looking to sell a car? Add vehicle details in just a few steps and get it in front of interested buyers."
                      selectedCategory={selectedCategory}
                      buttonText="Add Details"
                      onPress={() => {
                        clearFields([
                          'carAndBikeBrandId', 'carandBikeId', 'yearId', 'fuelTypeId', 'carColorId',
                          'model_name', 'price', 'kmsDriven', 'transmissionId', 'bikeTypeId',
                          'ownerHistoryId', 'isPublished', 'otherbrand', 'bike_type_id',
                          'SpareBrandId', 'Sparedescription', 'Spareyear_of_manufacture',
                          'spareProductTypeId', 'Spareprice', 'spareConditionId', 'images',
                          'SparePartNameId', 'Sparename', 'subproducttypeId', 'SpareyearId', 'isEditSpare'
                        ]);

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
                      }}
                    />

                  </View>

                  <View style={styles.oneAutoTextContainer}>
                    <GradientText text={oneAutoText} />
                  </View>

                  <View style={styles.indiasTrustTextStyle}>
                    <AppText
                      style={{
                        fontSize: 14,
                        color: '#999999',
                        fontWeight: '500',
                        letterSpacing: 1,
                      }}
                    >
                      {indiasTrustText}
                    </AppText>
                  </View>


                  <OverviewBottomSheet
                    visible={bottomSheetVisible}
                    onClose={() => setBottomSheetVisible(false)}
                    data={overviewStats?.assets || {}}
                  />
                  <ViewsBottomSheet
                    visible={isViewsModalVisible}
                    onClose={() => setIsViewsModalVisible(false)}
                    views={overviewViewStats?.views || 0}
                  />


                </View>
              </ScrollView>

            </View>

            {/* force update modal */}
            <ForceUpdateModal
              visible={showUpdate}
              version={formData?.forceUpdateObject?.appversion || ''}
              notes="We’ve made performance improvements, fixed bugs, and added new features!"
              storeUrl={
                Platform.OS === 'ios'
                  ? 'https://apps.apple.com/app/id1234567890'
                  : 'https://play.google.com/store/apps/details?id=com.example.app'
              }
              onClose={() => setShowUpdate(false)}
              force={showUpdate} // change to true for no close option
              theme={theme}
            />
            <SubscriptionModal
              visible={showSubscriptionModal}
              onClose={() => setShowSubscriptionModal(false)}
              onSubscribe={() => { handleSubscribe() }}
            />
          </BackgroundWrapper>
        </>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: hp('5%'),
  },
  tempContainer: {},
  middleContainer: {
    flex: 1,
    marginTop: hp('2%'),
  },
  welcomeCard: {
    marginTop: wp('2%'),
  },
  carListCard: {
    marginTop: wp('2%'),
  },
  quickListCard: {
    marginTop: wp('2%'),
  },
  categoryDropDown: {
    position: 'absolute',
    width: wp('100%'),
    zIndex: 999,
    elevation: 10,
  },
  scrollContentContainer: {
    paddingBottom: 20,
    paddingHorizontal: wp('2%'),
  },
  indiasTrustTextStyle: {
    width: wp('66%'),
    height: hp('7%'),
  },
  oneAutoTextContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
});
