// npm install react-native-iap
// For iOS: cd ios && pod install
// For Android: Follow react-native-iap Android setup guide

import React, { useState, useEffect } from 'react';
import {
  View,

  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  initConnection,
  endConnection,
  getProducts,
  getSubscriptions,
  requestSubscription,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  acknowledgePurchaseAndroid,
  getAvailablePurchases,
} from 'react-native-iap';
import AppText from '../components/AppText';
// Platform-specific product IDs
const PRODUCT_IDS = Platform.select({
  ios: ['spares_dealer_plan', 'monthly_plan_ios', 'test2', 'spares_dealer_plan'], // Make sure this matches exactly in App Store Connect
  android: ['car_test', 'bike_test', 'spare_test', 'spares_dealer_plan'],
});

const PRODUCT_ID = PRODUCT_IDS[0];

const SubscriptionScreen = () => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('Not Subscribed');
  const [purchaseUpdateListener, setPurchaseUpdateListener] = useState(null);
  const [purchaseErrorListenerRef, setPurchaseErrorListener] = useState(null);

  useEffect(() => {
    initializeIAP();
    return () => {
      cleanupIAP();
    };
  }, []);

  const initializeIAP = async () => {
    try {
      console.log('Initializing IAP connection...');
      await initConnection();
      console.log('IAP connection initialized successfully');
      
      // Set up purchase listeners
      const purchaseUpdateSubscription = purchaseUpdatedListener((purchase) => {
        console.log('Purchase updated:', purchase);
        handlePurchaseUpdate(purchase);
      });

      const purchaseErrorSubscription = purchaseErrorListener((error) => {
        console.log('Purchase error:', error);
        handlePurchaseError(error);
      });

      setPurchaseUpdateListener(purchaseUpdateSubscription);
      setPurchaseErrorListener(purchaseErrorSubscription);

      // Load product and check existing purchases
      await loadProduct();
      await checkExistingPurchases();
    } catch (error) {
      console.log('Error initializing IAP:', error);
      Alert.alert('Error', 'Failed to initialize in-app purchases. Please try again.');
    }
  };

  const cleanupIAP = () => {
    if (purchaseUpdateListener) {
      purchaseUpdateListener.remove();
    }
    if (purchaseErrorListenerRef) {
      purchaseErrorListenerRef.remove();
    }
    endConnection();
  };

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      console.log('Loading product:', PRODUCT_ID);
      
      // Try loading as subscription first
      try {
        const subscriptions = await getSubscriptions({ skus: PRODUCT_IDS });
        console.log('Subscriptions loaded:', subscriptions);
        if (subscriptions && subscriptions.length > 0) {
          setProduct(subscriptions[0]);
          console.log('Product loaded as subscription:', subscriptions[0]);
          return;
        }
      } catch (subError) {
        console.log('Failed to load as subscription, trying as product:', subError);
      }
      
      // Fallback to regular products
      const products = await getProducts({ skus: PRODUCT_IDS });
      console.log('Products loaded:', products);
      if (products && products.length > 0) {
        setProduct(products[0]);
        console.log('Product loaded as regular product:', products[0]);
      } else {
        console.log('No products found with ID:', PRODUCT_ID);
        Alert.alert('Error', 'Product not found. Please check your product configuration.');
      }
      
    } catch (error) {
      console.log('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product information');
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingPurchases = async () => {
    try {
      console.log('Checking existing purchases...');
      const purchases = await getAvailablePurchases();
      console.log('Available purchases:', purchases);
      
      const hasActivePurchase = purchases.some(purchase => 
        purchase.productId === PRODUCT_ID
      );
      
      if (hasActivePurchase) {
        setIsSubscribed(true);
        setSubscriptionStatus('Active Subscription');
        console.log('Found active subscription');
      } else {
        setIsSubscribed(false);
        setSubscriptionStatus('Not Subscribed');
        console.log('No active subscription found');
      }
    } catch (error) {
      console.log('Error checking existing purchases:', error);
    }
  };

  const handlePurchaseUpdate = async (purchase) => {
    try {
      console.log('Handling purchase update:', purchase);
      
      // Check if purchase belongs to our product
      if (purchase.productId !== PRODUCT_ID) {
        console.log('Purchase is for different product:', purchase.productId);
        return;
      }
      
      // Check purchase state based on platform
      const isPurchaseSuccessful = Platform.select({
        ios: purchase.transactionReceipt && purchase.transactionState === 'purchased',
        android: purchase.purchaseStateAndroid === 1 && purchase.purchaseToken,
      });
      
      if (isPurchaseSuccessful) {
        // For Android, acknowledge the purchase first
        if (Platform.OS === 'android' && purchase.purchaseToken) {
          try {
            await acknowledgePurchaseAndroid(purchase.purchaseToken);
            console.log('Purchase acknowledged on Android');
          } catch (ackError) {
            console.log('Error acknowledging purchase:', ackError);
          }
        }
        
        // Finish the transaction
        await finishTransaction(purchase, false);
        console.log('Transaction finished successfully');
        
        // Update subscription status
        setIsSubscribed(true);
        setSubscriptionStatus('Active Subscription');
        setIsLoading(false);
        
        Alert.alert(
          'Success! 🎉',
          'Thank you for subscribing to our premium plan!',
          [{ text: 'OK' }]
        );
      } else if (
        (Platform.OS === 'android' && purchase.purchaseStateAndroid === 0) ||
        (Platform.OS === 'ios' && purchase.transactionState === 'purchasing')
      ) {
        // Purchase is still in progress
        console.log('Purchase in progress...');
      } else {
        // Purchase failed or was cancelled
        console.log('Purchase failed or cancelled:', purchase);
        setIsLoading(false);
        
        // Handle specific error cases
        if (Platform.OS === 'android' && purchase.purchaseStateAndroid === 2) {
          console.log('Purchase was cancelled by user');
        } else {
          Alert.alert(
            'Purchase Failed',
            'The purchase could not be completed. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.log('Error handling purchase update:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to complete purchase. Please contact support.');
    }
  };

  const handlePurchaseError = (error) => {
    console.log('Purchase error occurred:', error);
    setIsLoading(false);
    
    // Handle user cancellation
    if (error.code === 'E_USER_CANCELLED' || 
        (Platform.OS === 'android' && error.responseCode === 1)) {
      console.log('User cancelled purchase');
      return;
    }
    
    // Handle other errors
    Alert.alert(
      'Purchase Failed',
      error.message || 'Failed to process purchase. Please try again.',
      [{ text: 'OK' }]
    );
  };

  const purchaseProduct = async () => {
    if (!product) {
      Alert.alert('Error', 'Product not available. Please try again later.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Starting purchase for product:', product.productId);
      
      // Platform-specific purchase request
      if (Platform.OS === 'android') {
        // Android-specific subscription purchase
        const subscriptionOffers = product.subscriptionOfferDetails?.map(offer => ({
          sku: product.productId,
          offerToken: offer.offerToken,
        })) || [];
        
        if (subscriptionOffers.length > 0) {
          await requestSubscription({
            sku: product.productId,
            subscriptionOffers: subscriptionOffers,
          });
        } else {
          // Fallback for non-subscription products on Android
          await requestPurchase({
            skus: [product.productId],
          });
        }
      } else {
        // iOS purchase
        try {
          await requestSubscription({
            sku: product.productId,
          });
        } catch (subError) {
          console.log('Subscription purchase failed, trying regular purchase:', subError);
          await requestPurchase({
            skus: [product.productId],
          });
        }
      }
      
      console.log('Purchase request sent successfully');
      
    } catch (error) {
      console.log('Error initiating purchase:', error);
      setIsLoading(false);
      
      // Handle specific error cases
      if (error.code === 'E_USER_CANCELLED' || 
          (Platform.OS === 'android' && error.responseCode === 1)) {
        console.log('User cancelled purchase');
        return;
      }
      
      Alert.alert(
        'Purchase Failed',
        error.message || 'Failed to process purchase. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const restorePurchases = async () => {
    try {
      setIsLoading(true);
      console.log('Restoring purchases...');
      
      await checkExistingPurchases();
      
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Restore Complete',
          isSubscribed ? 'Your subscription has been restored successfully!' : 'No previous purchases found.',
          [{ text: 'OK' }]
        );
      }, 1000);
      
    } catch (error) {
      console.log('Error restoring purchases:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    }
  };

  const formatPrice = () => {
    if (!product) return 'Loading...';
    
    // Android-specific price formatting
    if (Platform.OS === 'android') {
      if (product.subscriptionOfferDetails && product.subscriptionOfferDetails.length > 0) {
        const offer = product.subscriptionOfferDetails[0];
        const pricingPhase = offer.pricingPhases?.pricingPhaseList?.[0];
        if (pricingPhase) {
          return `${pricingPhase.formattedPrice}/${pricingPhase.billingCycleTime}`;
        }
      }
      
      if (product.oneTimePurchaseOfferDetails) {
        return `${product.oneTimePurchaseOfferDetails.formattedPrice}`;
      }
    }
    
    // iOS-specific price formatting
    if (product.localizedPrice) {
      return `${product.localizedPrice}/month`;
    }
    
    // Fallback formatting
    if (product.price) {
      return `${product.currency}${product.price}/month`;
    }
    
    return 'Price not available';
  };

  const FeatureItem = ({ icon, text }) => (
    <View style={styles.featureItem}>
      <AppText style={styles.featureIcon}>{icon}</AppText>
      <AppText style={styles.featureText}>{text}</AppText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText style={styles.title}>Premium Monthly Plan</AppText>
          <AppText style={styles.subtitle}>
            Unlock all premium features with our monthly subscription
          </AppText>
        </View>

        {/* Price Display */}
        <View style={styles.priceContainer}>
          <AppText style={styles.priceText}>
            {formatPrice()}
          </AppText>
          <AppText style={styles.pricePeriod}>Billed monthly • Cancel anytime</AppText>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <AppText style={styles.featuresTitle}>What's Included</AppText>
          <FeatureItem icon="✨" text="Unlimited access to all premium content" />
          <FeatureItem icon="🚀" text="Advanced features and tools" />
          <FeatureItem icon="📱" text="Sync across all your devices" />
          <FeatureItem icon="🔒" text="Priority customer support" />
          <FeatureItem icon="💎" text="Exclusive premium updates" />
          <FeatureItem icon="🎯" text="Ad-free experience" />
        </View>

        {/* Subscription Status */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isSubscribed ? '#E8F5E8' : '#F5F5F5' }
          ]}>
            <AppText style={[
              styles.statusText,
              { color: isSubscribed ? '#2E7D32' : '#666' }
            ]}>
              {isSubscribed ? '✓ Active Subscription' : '○ Not Subscribed'}
            </AppText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.subscribeButton,
              isSubscribed && styles.subscribedButton,
              isLoading && styles.disabledButton
            ]}
            onPress={purchaseProduct}
            disabled={isLoading || isSubscribed}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <AppText style={styles.loadingButtonText}>Processing...</AppText>
              </View>
            ) : (
              <AppText style={styles.subscribeButtonText}>
                {isSubscribed ? '✓ Subscription Active' : 'Subscribe Now'}
              </AppText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.restoreButton, isLoading && styles.disabledButton]}
            onPress={restorePurchases}
            disabled={isLoading}
            activeOpacity={0.6}
          >
            <AppText style={styles.restoreButtonText}>
              {isLoading ? 'Checking...' : 'Restore Purchases'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Terms and Privacy */}
        <View style={styles.legalContainer}>
          <AppText style={styles.legalText}>
            Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period. 
            Account will be charged for renewal within 24 hours prior to the end of the current period.
          </AppText>
          <AppText style={styles.legalLinks}>
            Terms of Service • Privacy Policy
          </AppText>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#007AFF" />
            <AppText style={styles.loadingOverlayText}>Processing your request...</AppText>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 24,
    backgroundColor: '#F8FAFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  priceText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 8,
  },
  pricePeriod: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 22,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    fontWeight: '500',
    lineHeight: 22,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 56,
  },
  subscribedButton: {
    backgroundColor: '#34C759',
  },
  disabledButton: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  restoreButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  restoreButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  legalContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  legalText: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  legalLinks: {
    fontSize: 13,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingOverlayText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
});

export default SubscriptionScreen;