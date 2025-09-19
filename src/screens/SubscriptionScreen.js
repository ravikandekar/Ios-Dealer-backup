import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Platform, Alert, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DetailsHeader } from '../components/DetailsHeader';
import DynamicTabView from '../components/DynamicTabView';
import { AuthContext } from '../context/AuthContext';
import SubscriptionCard from '../components/SubscriptionCard';
import SubscriptionPlanCard from '../components/SubscritptionPlanCard';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BackgroundWrapper from '../components/BackgroundWrapper';
import ActionButton from '../components/ActionButton';
import AppText from '../components/AppText';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import Loader from '../components/Loader';
import * as RNIap from 'react-native-iap';
import { downloadInvoicePDFWithToken, downloadInvoicePDF, downloadInvoicePDFWithApiClient } from '../components/PDFInvoiceDownloader';
import RNFS from 'react-native-fs';
import { removePurchaseTokenAndProductID, storePurchaseTokenAndProductID } from '../utils/storage';
import { verifyPurchaseOnBackend } from '../utils/purchaseVerification';
import { verifyPurchaseOnBackendIOS } from '../utils/purchaseVerificationIOS';

const SubscriptionScreen = ({ navigation }) => {
  const { theme, userID } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('active');
  const [subPlanCardList, setSubPlanCardList] = useState([]);
  const [activePlanCardList, setActivePlanCardList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [iapProducts, setIapProducts] = useState([]);
  const [processingStatus, setProcessingStatus] = useState(false);
  // Use ref to track component mount status
  const isMountedRef = useRef(true);
  const purchaseUpdateSubscriptionRef = useRef(null);
  const purchaseErrorSubscriptionRef = useRef(null);
  const isProcessingPurchaseRef = useRef(false);

  // console.log('iapProductshhhhhhhhh:', activePlanCardList);

  // Safe state setter that checks if component is mounted
  const safeSetState = (setter) => {
    return (...args) => {
      if (isMountedRef.current) {
        setter(...args);
      }
    };
  };
  const fetchCMSContentAndNavigate = async (type) => {
    try {
      const endpoint =
        type === 'terms'
          ? '/api/cms/dealertcRoutes/get_termsandconditions_by_dealer'
          : '/api/cms/dealerPrivacyPolicyRoutes/get_privacypolicies_by_dealer';

      const response = await apiClient.get(endpoint);
      const data = response?.data?.data;

      if (data) {
        navigation.navigate('CMSWebViewScreen', {
          title: data.title,
          htmlContent: data.description,
        });
      } else {
        showToast('error', '', `No ${type === 'terms' ? 'Terms' : 'Privacy'} content found.`);
      }
    } catch (error) {
      showToast('error', '', `Failed to load ${type === 'terms' ? 'Terms' : 'Privacy Policy'}.`);
    }
  };
  const termofuse = () => {
    const url = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'; // replace with your actual Terms of Use link
    Linking.openURL(url).catch(err =>
      console.error("Failed to open page in browser:", err)
    );
  };

  const safeSetLoading = safeSetState(setLoading);
  const safeSetRefreshing = safeSetState(setRefreshing);
  const safeSetIapProducts = safeSetState(setIapProducts);
  const safeSetSubPlanCardList = safeSetState(setSubPlanCardList);
  const safeSetActivePlanCardList = safeSetState(setActivePlanCardList);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    safeSetRefreshing(true);
    try {
      await fetchSubscriptionPlans();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      safeSetRefreshing(false);
    }
  }, []);
  useEffect(() => {
    initializeIAP();

    return () => {
      cleanupIAP();
      isMountedRef.current = false; // ensure we don't update after unmount
    };
  }, []);

  // ✅ Make sure listeners are set up only once
  const initializeIAP = async () => {
    try {
      console.log('Initializing IAP connection...');
      await RNIap.initConnection();
      console.log('✅ IAP connection initialized');

      // Flush pending transactions (prevents duplicate triggers on reopen)
      if (Platform.OS === 'android') {
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
      } else {
        await RNIap.clearTransactionIOS();
      }

      // Only add listeners if they are not already attached
      if (!purchaseUpdateSubscriptionRef.current) {
        purchaseUpdateSubscriptionRef.current = RNIap.purchaseUpdatedListener(async (purchase) => {
          console.log('✅ Purchase updated:', purchase);

          if (!purchase) {
            console.log("⚠️ Skipping: purchase is null/undefined");
            return;
          }

          const productId = purchase.productId;
          const purchaseToken =
            Platform.OS === 'android'
              ? purchase.purchaseToken
              : purchase.transactionReceipt;

          if (!productId || !purchaseToken) {
            console.log("⚠️ Skipping verification: missing productId or receipt", purchase);
            return;
          }

          try {
            storePurchaseTokenAndProductID(productId, purchaseToken);

            let result;
            if (Platform.OS === 'android') {
              result = await verifyPurchaseOnBackend({ productId, purchaseToken, userID });
            } else {
              result = await verifyPurchaseOnBackendIOS({ productId, receiptData: purchaseToken, userID });
            }

            if (result?.status === 'success') {
              Alert.alert('Success', 'Subscription verified successfully.');
              await fetchSubscriptionPlans();
              // 🔑 Optimistic UI update
              // ✅ Optimistically mark plan as subscribed
              safeSetSubPlanCardList(prevPlans =>
                prevPlans.map(plan => {

                  return plan.sku === productId
                    ? { ...plan, isSubscribed: true }
                    : plan;
                })
              );

              if (purchase.transactionId || purchase.transactionReceipt) {
                await RNIap.finishTransaction(purchase, true);
              } else {
                console.log("⚠️ Skipping finishTransaction, no transactionId/receipt:", purchase);
              }

              await refreshActiveSubscriptions();
              // safeSetState(setActiveTab)('active');
            }
            else if (result?.status === 'already_used') {
              console.log('ℹ️ Purchase already used.');
              if (purchase.transactionId || purchase.transactionReceipt) {
                await RNIap.finishTransaction(purchase, true);
              }
            } else {
              console.log('⚠️ Verification failed.');
            }
          } catch (err) {
            console.error("❌ Verification failed:", err);
          } finally {
            setLoading(false);
            setProcessingStatus(false);
            isProcessingPurchaseRef.current = false;
          }
        });

      }

      if (!purchaseErrorSubscriptionRef.current) {
        purchaseErrorSubscriptionRef.current = RNIap.purchaseErrorListener((error) => {
          console.log('❌ Purchase error:', error);
          setLoading(false);
          isProcessingPurchaseRef.current = false;
          if (error.code !== 'E_USER_CANCELLED') {
            showToast('error', '', error.message || 'Purchase failed.');
          }
        });
      }

      // ✅ Load plans and products
      await fetchSubscriptionPlans();
    } catch (error) {
      console.log('Error initializing IAP:', error);
      // Alert.alert('Error', 'Please try again.');
      showToast('error', '', 'Please try again.');
    }
  };


  const refreshActiveSubscriptions = async () => {
    try {
      const activeResponse = await apiClient.get(
        `/api/dealer/dealerSubscriptionRoute/dealer/${userID}`,

      );

      const activeSubs = activeResponse?.data?.data?.subscriptions || [];
      safeSetActivePlanCardList(activeSubs);

      if (activeSubs.length === 0 && activeTab === 'active') {
        showToast('info', '', 'No Active Plans available.');
      }

      console.log('🔄 Refreshed active subscriptions:', activeSubs);
    } catch (error) {
      console.error('Active subscription fetch error:', error);
    }
  };

  const cleanupIAP = () => {
    if (purchaseUpdateSubscriptionRef.current) {
      purchaseUpdateSubscriptionRef.current.remove();
      purchaseUpdateSubscriptionRef.current = null;
    }
    if (purchaseErrorSubscriptionRef.current) {
      purchaseErrorSubscriptionRef.current.remove();
      purchaseErrorSubscriptionRef.current = null;
    }
    RNIap.endConnection();
  };

  const handleDownloadInvoice = async (orderId) => {


    try {
      safeSetLoading(true);
      await downloadInvoicePDF(orderId);
      showToast('success', '', 'Invoice downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      if (isMountedRef.current) {
        showToast('error', '', 'Download failed. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        safeSetLoading(false);
      }
    }
  };
  const fetchProducts = async (skus) => {
    if (!skus || skus.length === 0 || !isMountedRef.current) return;

    try {
      console.log('🔍 Fetching products for SKUs:', skus);

      // Try subscriptions first, then fallback to products
      let products;
      try {
        products = await RNIap.getSubscriptions({ skus });
        console.log('✅ Got subscriptions:', products);
      } catch (err) {
        console.log('⚠️ getSubscriptions failed, trying getProducts:', err);
        products = await RNIap.getProducts({ skus });
        console.log('✅ Got products:', products);
      }

      if (isMountedRef.current) {
        safeSetIapProducts(products || []);
      }
    } catch (err) {
      console.log('❌ fetchProducts error:', err);
    }
  };

  const purchasePlan = async (plan) => {

    if (loading || !isMountedRef.current || isProcessingPurchaseRef.current) {
      console.log('⚠️ Purchase already in progress or component unmounted');
      return;
    }

    const sku = plan.sku;
    console.log('🛒 Attempting to purchase:', sku);

    if (!sku) {
      // Alert.alert('Error', 'Invalid product ID');
      showToast('error', '', 'Purchase failed. Please try again.');
      return;
    }

    const product = iapProducts.find(p => p.productId === sku);


    if (!product) {
      showToast('error', '', 'Purchase failed. Please try again.');
      return;
    }

    try {
      isProcessingPurchaseRef.current = true;
      setProcessingStatus(true);
      safeSetLoading(true);

      let purchaseRequest;

      if (Platform.OS === 'android' && product.subscriptionOfferDetails?.[0]) {
        const offer = product.subscriptionOfferDetails[0];
        purchaseRequest = {
          sku,
          subscriptionOffers: [{
            sku,
            offerToken: offer.offerToken
          }],
        };
      } else {
        purchaseRequest = { sku };
      }

      console.log('🚀 Making purchase request:', purchaseRequest);

      await RNIap.requestSubscription(purchaseRequest);

      // Note: Don't set loading to false here as the purchase listener will handle it

    } catch (err) {
      console.log('❌ Purchase error:', err);
      if (isMountedRef.current) {
        safeSetLoading(false);
        isProcessingPurchaseRef.current = false;
        setProcessingStatus(false);

        // Handle specific error cases
        if (err.code === 'E_USER_CANCELLED') {
          console.log('👤 User cancelled purchase');
          // User cancelled - no need to show error
          return;
        } else if (err.code === 'E_DEVELOPER_ERROR') {
          // Alert.alert(
          //   'Configuration Error',
          //   'App setup issue. Please ensure the app version is properly published on Google Play Console.'
          // );
          console.log('App setup issue. Please ensure the app version is properly published on Google Play Console.')
        } else if (err.code === 'E_ALREADY_OWNED') {
          console.log('ℹ️ Already owned — backend will handle alert.');
          refreshActiveSubscriptions(); // silently update

        } else if (err.code === 'E_ITEM_UNAVAILABLE') {
          // Alert.alert('Error', 'This subscription is currently unavailable.');
          // showToast('error', '', 'This subscription is currently unavailable.');
        } else {
          // Alert.alert('Error', err.message || 'Purchase failed. Please try again.');
          // showToast('error', '', err.message || 'Purchase failed. Please try again.');
        }
      }
    }
  };

  const fetchSubscriptionPlans = async () => {
    if (!isMountedRef.current) return;

    try {
      safeSetLoading(true);

      // Fetch subscription plans
      const response = await apiClient.get(
        'api/dealer/subscriptionplanRoute/getdata-by-buyer-dealer',

      );

      // 🔑 Normalize plans for current platform
      const platformPlans =
        Platform.OS === 'ios'
          ? response?.data?.data?.plans?.ios || []
          : response?.data?.data?.plans?.android || [];

      // Always ensure product_id is used as the key SKU
      const normalizedPlans = platformPlans.map((plan) => ({
        ...plan,
        sku: plan.product_id, // ✅ common product_id for both iOS/Android
      }));

      if (isMountedRef.current) {
        safeSetSubPlanCardList(normalizedPlans);

        if (normalizedPlans.length === 0) {
          showToast('info', '', 'No Plans available.');
        }

        // Fetch IAP products using product_id as SKU
        const productIds = normalizedPlans.map((plan) => plan.sku);
        if (productIds.length > 0) {
          await fetchProducts(productIds);
        }
      }

      // Fetch active subscriptions as before
      const activeResponse = await apiClient.get(
        `/api/dealer/dealerSubscriptionRoute/dealer/${userID}`,

      );

      const activeSubs = activeResponse?.data?.data?.subscriptions || [];
      if (isMountedRef.current) {
        safeSetActivePlanCardList(activeSubs);
        if (activeSubs.length === 0 && activeTab === 'active') {
          showToast('info', '', 'No Active Plans available.');
        }
      }
    } catch (error) {
      console.error('SubscriptionPlan fetch error:', error);
      if (isMountedRef.current) {
        showToast('error', '', 'Failed to load subscription data.');
      }
    } finally {
      if (isMountedRef.current) {
        safeSetLoading(false);
      }
    }
  };


  useEffect(() => {
    fetchSubscriptionPlans();
  }, [userID]);

  // Focus listener to refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isMountedRef.current) {
        fetchSubscriptionPlans();
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleBuyNew = () => {
    setActiveTab('plans');
  };

  const tabs = [
    { key: 'active', label: 'Active Subscriptions' },
    { key: 'plans', label: 'Subscription Plans' },
  ];

  return (
    <BackgroundWrapper style={{ padding: wp('1%') }}>
      <DetailsHeader
        title="Subscriptions"
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme?.colors?.primary || '#007BFF']}
            tintColor={theme?.colors?.primary || '#007BFF'}
          />
        }
        showsVerticalScrollIndicator={false}   // 👈 hide vertical indicator
        showsHorizontalScrollIndicator={false}
      >
        {activeTab === 'active' && (
          <>
            {activePlanCardList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <AppText style={[styles.emptyText, { color: theme?.colors.text }]}>
                  No active subscriptions found.
                </AppText>
                <AppText style={[styles.emptySubText, { color: theme?.colors.text }]}>
                  Pull down to refresh or browse available plans.
                </AppText>
              </View>
            ) : (
              activePlanCardList.map((sub) => (
                <SubscriptionCard
                  key={sub?._id}
                  title={
                    sub?.subscription_plan_id?.subscriptiontitle
                  }
                  price={sub?.subscription_plan_id?.price}
                  lastDate={new Date(sub?.start_date).toLocaleDateString()}
                  expiryDate={new Date(sub?.end_date).toLocaleDateString()}
                  listings={`${sub?.listings_used || 0} Used`}
                  onDownload={() => handleDownloadInvoice(sub._id)}
                />
              ))
            )}

            <ActionButton
              label="Buy New"
              onPress={handleBuyNew}
              disabled={loading}
              style={styles.buyNowBtn}
            />
          </>
        )}

        {activeTab === 'plans' && (
          <View>
            {subPlanCardList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <AppText style={[styles.emptyText, { color: theme?.colors.text }]}>
                  No subscription plans available.
                </AppText>
                <AppText style={[styles.emptySubText, { color: theme?.colors.text }]}>
                  Pull down to refresh and check for new plans.
                </AppText>
              </View>
            ) : (
              <View>
                <AppText style={[styles.sectionTitle, { color: theme?.colors.text, fontSize: wp('7.5%'), fontWeight: '600', marginLeft: wp('3%'), marginBottom: wp('0.1%') }]}>
                  Subscription plans
                </AppText>

                {processingStatus ? (
                  <AppText style={[styles.sectionTitle, { color: theme?.colors.Highlighterwords, fontSize: wp('5.5%'), fontWeight: '600', marginLeft: wp('3%'), marginBottom: wp('0.1%'), textAlign: 'center' }]}>
                    Purchase Processing...
                  </AppText>
                ) : <AppText style={[styles.sectionTitle, { color: theme?.colors.placeholder, fontSize: wp('4%'), marginLeft: wp('3%'), marginBottom: wp('1%'), width: '90%', opacity: 0.7 }]}>
                  Choose a plan based on the type of inventory you sell
                </AppText>}



                {subPlanCardList.map((plan) => (
                  <SubscriptionPlanCard
                    key={`${plan._id}-${plan.isSubscribed}`}
                    title={plan?.subscriptiontitle}
                    duration={`${Math.round(plan.validity_in_days / 30)} week`}
                    listing={`${plan.listings_allowed} ${plan.category_id?.category_name || ''}`}
                    oldPrice={plan.oldprice ? `${plan.oldprice}` : undefined}
                    newPrice={`${plan.price}`}
                    onPress={() => purchasePlan(plan)}
                    disabled={loading} // Disable during loading 
                    isSubscribed={plan.isSubscribed} // Disable during loading 

                  />
                ))}
                <AppText style={[styles.sectionTitle, { color: theme?.colors.placeholder, fontSize: wp('4%'), marginLeft: wp('3%'), marginTop: wp('1%'), width: '90%', opacity: 0.7 }]}>
                  You can purchase multiple plans based on your business needs. Plans can be renewed or upgraded at any time.
                </AppText>
              </View>
            )}
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: wp('3%'), }}>
              <View style={{ alignItems: 'center', justifyContent: 'space-evenly', flexDirection: 'row', gap: wp('5%') }}>

                <TouchableOpacity onPress={() => fetchCMSContentAndNavigate('privacy')}>
                  <AppText style={[styles.linkText, { color: theme.colors.Highlighterwords }]}>
                    Privacy & Policy
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => fetchCMSContentAndNavigate('terms')}>
                  <AppText style={[styles.linkText, { color: theme.colors.Highlighterwords }]}>
                    Terms & Conditions
                  </AppText>
                </TouchableOpacity>

              </View>
              {Platform.OS === 'ios' ? <TouchableOpacity onPress={() => termofuse()} style={{ marginTop: wp('2%') }}>
                <AppText style={[styles.linkText, { color: theme.colors.Highlighterwords }]}>
                  Terms of Use (EULA)
                </AppText>
              </TouchableOpacity> : null}

            </View>
          </View>
        )}

        <Loader visible={loading} />
      </ScrollView>
    </BackgroundWrapper>
  );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },

  buyNowText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp('10%'),
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.7,
  },
  buyNowBtn: {
    marginBottom: hp('5%'),
    paddingVertical: wp('3%'),
    marginHorizontal: wp('2.5%'),
    marginTop: 20,
    alignItems: 'center',
  },
  termsText: {
    fontSize: wp('3.8%'),
    lineHeight: wp('5.5%'),
    textAlign: 'center',
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
