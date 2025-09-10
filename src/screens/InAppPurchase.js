
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as RNIap from 'react-native-iap';
import Clipboard from '@react-native-clipboard/clipboard';
import axios from 'axios';
const PRODUCT_IDS = Platform.select({
  ios: ['monthly_plan_ios','test2'], // Make sure this matches exactly in App Store Connect
  android: ['car_test','bike_test','spare_test'],
});

const InAppPurchase = () => {
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [products, setProducts] = useState([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [purchesdone, setpurchesdone] = useState([]);
  const [error, setError] = useState(null);
  console.log('purchesdone', purchesdone);
const storeInAppPurchase = async (purchase) => {
  try {
    const response = await axios.post('https://webhook.site/8dde4150-9489-43c6-bb90-01e2658e1e56', {
      packageName: purchase.packageNameAndroid,
      productId: purchase.productId,
      purchaseToken: purchase.purchaseToken,
      userId: "hhhhhhh"
    }, {
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer YOUR_ACCESS_TOKEN` // if required
      }
    });

    console.log("Success:", response.data);
    Alert.alert('token passed ')
  } catch (error) {
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error("Network Error:", error.message);
    }
  }
};
  const copyToClipboard = (value) => {
    Clipboard.setString(value);
  };
  useEffect(() => {
    initializeIAP();

    const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase) => {
        console.log('Purchase received:', purchase);
        setpurchesdone(purchase)
        console.log('✅ Purchase Token:', purchase?.purchaseToken); // ✅ GET PURCHASE TOKEN HERE
        storeInAppPurchase(purchase)
        await finalizePurchase(purchase);
      }
    );

    const purchaseErrorSubscription = RNIap.purchaseErrorListener(
      (error) => {
        console.log('Purchase error:', error);
        setPurchasing(false);
        if (error.code !== 'E_USER_CANCELLED') {
          Alert.alert('Purchase Error', error.message || 'Purchase failed');
        }
      }
    );

    return () => {
      purchaseUpdateSubscription?.remove();
      purchaseErrorSubscription?.remove();
      RNIap.endConnection().catch(console.warn);
    };
  }, []);

  const initializeIAP = async () => {
    try {
      setError(null);
      console.log('Initializing IAP...');

      const result = await RNIap.initConnection();
      console.log('IAP Connection result:', result);

      if (Platform.OS === 'android') {
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
      }

      await fetchProducts();
      await checkExistingPurchases();

    } catch (error) {
      console.error('IAP initialization failed:', error);
      setError('Failed to initialize purchase system. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products with IDs:', PRODUCT_IDS);

      let availableProducts = [];

      if (Platform.OS === 'ios') {
        // For iOS, try both subscriptions and products
        try {
          console.log('Trying getSubscriptions for iOS...');
          availableProducts = await RNIap.getSubscriptions({ skus: PRODUCT_IDS });
          console.log('iOS Subscriptions found:', availableProducts.length);

          if (availableProducts.length === 0) {
            console.log('No subscriptions found, trying getProducts for iOS...');
            availableProducts = await RNIap.getProducts({ skus: PRODUCT_IDS });
            console.log('iOS Products found:', availableProducts.length);
          }
        } catch (iosError) {
          console.error('iOS product fetch failed:', iosError);
          throw new Error(`iOS Setup Issue: ${iosError.message}. Check App Store Connect configuration.`);
        }
      } else {
        // Android logic remains the same
        try {
          availableProducts = await RNIap.getSubscriptions({ skus: PRODUCT_IDS });
          console.log('Android Subscriptions found:', availableProducts.length);
        } catch (subError) {
          console.log('getSubscriptions failed, trying getProducts:', subError.message);
          availableProducts = await RNIap.getProducts({ skus: PRODUCT_IDS });
          console.log('Android Products found:', availableProducts.length);
        }
      }

      if (availableProducts.length === 0) {
        const platformError = Platform.OS === 'ios'
          ? 'No products found. Verify:\n1. Product ID matches App Store Connect\n2. Agreements & Tax filled\n3. Product status is "Ready for Sale"\n4. Sandbox account signed in'
          : 'No products available. Verify product IDs and store configuration.';
        throw new Error(platformError);
      }

      console.log('Available products:', availableProducts);
      setProducts(availableProducts);

    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError(error.message);
    }
  };

  const checkExistingPurchases = async () => {
    try {
      console.log('Checking existing purchases...');

      // For iOS, we need to be more careful with purchase checking
      let purchases = [];

      try {
        purchases = await RNIap.getAvailablePurchases();
        console.log('Found purchases:', purchases);
      } catch (purchaseError) {
        console.warn('Failed to get available purchases:', purchaseError);
        // Don't throw error here, just assume no active subscriptions
        setHasActiveSubscription(false);
        return;
      }

      if (purchases.length === 0) {
        setHasActiveSubscription(false);
        return;
      }

      const hasActive = purchases.some(purchase => {
        console.log('Checking purchase:', {
          productId: purchase.productId,
          platform: Platform.OS,
          autoRenewing: Platform.OS === 'android' ? purchase.autoRenewingAndroid : 'N/A',
          expirationDate: purchase.expirationDate,
          purchaseToken: purchase.purchaseToken ? 'Present' : 'Missing'
        });

        if (Platform.OS === 'android') {
          if (purchase.autoRenewingAndroid !== undefined) {
            return purchase.autoRenewingAndroid === true;
          }

          if (purchase.expirationDate) {
            const expiration = new Date(purchase.expirationDate);
            const now = new Date();
            return expiration > now;
          }

          return false;
        } else {
          // iOS logic - more forgiving for testing
          if (purchase.expirationDate) {
            const expiration = new Date(purchase.expirationDate);
            const now = new Date();
            const isActive = expiration > now;
            console.log('iOS expiration check:', { expiration, now, isActive });
            return isActive;
          }

          // For iOS, if we have a purchase receipt and no expiration, consider it active
          // This helps during development/testing
          return true;
        }
      });

      console.log('Has active subscription:', hasActive);
      setHasActiveSubscription(hasActive);

    } catch (error) {
      console.error('Failed to check purchases:', error);
      // Don't fail completely, just assume no active subscription
      setHasActiveSubscription(false);
    }
  };

  const finalizePurchase = async (purchase) => {
    try {
      console.log('Finalizing purchase:', purchase.productId);

      if (Platform.OS === 'android' && purchase.purchaseToken) {
        if (!purchase.isAcknowledgedAndroid) {
          console.log('Acknowledging Android purchase...');
          await RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken);
        }
      }

      // Finish transaction for both platforms
      await RNIap.finishTransaction(purchase);
      console.log('Transaction finished successfully');

      // Update subscription status
      await checkExistingPurchases();
      setPurchasing(false);

      Alert.alert('Success!', 'Your subscription has been activated successfully!');

    } catch (error) {
      console.error('Purchase finalization failed:', error);
      setPurchasing(false);
      Alert.alert('Error', 'Purchase completed but failed to activate. Please contact support.');
    }
  };

  const purchaseSubscription = async (productId) => {
    if (purchasing || hasActiveSubscription) {
      return;
    }

    console.log('Starting purchase for:', productId);
    setPurchasing(true);

    try {
      const product = products.find(p => p.productId === productId);

      if (Platform.OS === 'ios') {
        // iOS subscription purchase
        console.log('Requesting iOS subscription...');
        await RNIap.requestSubscription({
          sku: productId,
        });
      } else if (Platform.OS === 'android' && product?.subscriptionOfferDetails?.length > 0) {
        // Android with subscription offers
        console.log('Requesting Android subscription with offers...');
        const offer = product.subscriptionOfferDetails[0];
        await RNIap.requestSubscription({
          sku: productId,
          subscriptionOffers: [
            {
              sku: productId,
              offerToken: offer.offerToken,
            },
          ],
        });
      } else {
        // Android without offers or fallback
        console.log('Requesting subscription without offers...');
        await RNIap.requestSubscription({
          sku: productId,
        });
      }

    } catch (error) {
      console.error('Purchase request failed:', error);
      setPurchasing(false);

      if (error.code !== 'E_USER_CANCELLED') {
        Alert.alert(
          'Purchase Error',
          error.message || 'Unable to complete purchase. Please try again.'
        );
      }
    }
  };

  const restorePurchases = async () => {
    try {
      setLoading(true);
      console.log('Restoring purchases...');

      if (Platform.OS === 'ios') {
        // iOS restore purchases
        try {
          await RNIap.getAvailablePurchases();
          await checkExistingPurchases();
          Alert.alert('Restore Complete', 'Your purchases have been restored successfully.');
        } catch (restoreError) {
          console.error('iOS restore failed:', restoreError);
          Alert.alert('Restore Error', 'Unable to restore purchases. Make sure you\'re signed into the correct Apple ID.');
        }
      } else {
        // Android restore
        await RNIap.getAvailablePurchases();
        await checkExistingPurchases();
        Alert.alert('Restore Complete', 'Your purchases have been restored successfully.');
      }

    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert('Restore Error', 'Unable to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFormattedPrice = (product) => {
    try {
      if (Platform.OS === 'android' && product.subscriptionOfferDetails?.[0]) {
        const offer = product.subscriptionOfferDetails[0];
        const pricingPhase = offer.pricingPhases?.pricingPhaseList?.[0];
        if (pricingPhase?.formattedPrice) {
          return pricingPhase.formattedPrice;
        }
      }

      // For iOS and Android fallback
      return product.localizedPrice || product.price || 'Price unavailable';
    } catch (error) {
      console.warn('Error formatting price:', error);
      return 'Price unavailable';
    }
  };

  const retryInitialization = () => {
    setLoading(true);
    setError(null);
    initializeIAP();
  };

  const showDebugInfo = () => {
    Alert.alert(
      'Debug Info',
      `Platform: ${Platform.OS}\nProduct IDs: ${JSON.stringify(PRODUCT_IDS)}\nProducts Found: ${products.length}\nActive Sub: ${hasActiveSubscription}`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading subscription options...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryInitialization}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.debugButton} onPress={showDebugInfo}>
          <Text style={styles.debugButtonText}>Debug Info</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium Subscription</Text>

      {hasActiveSubscription ? (
        <View style={styles.activeCard}>
          <Text style={styles.activeTitle}>✓ Active Subscription</Text>
          <Text style={styles.activeText}>
            You have access to all premium features
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={checkExistingPurchases}
          >
            <Text style={styles.refreshButtonText}>Refresh Status</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {products.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.noProductsText}>No subscription plans available</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={fetchProducts}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.debugButton} onPress={showDebugInfo}>
                <Text style={styles.debugButtonText}>Debug Info</Text>
              </TouchableOpacity>
            </View>
          ) : (
            products.map((product) => (
              <View key={product.productId} style={styles.productCard}>
                <Text style={styles.productTitle}>
                  {product.title || 'Premium Plan'}
                </Text>
                <Text style={styles.productDescription}>
                  {product.description || 'Access all premium features'}
                </Text>
                <Text style={styles.productPrice}>
                  {getFormattedPrice(product)}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    purchasing && styles.buttonDisabled
                  ]}
                  onPress={() => purchaseSubscription(product.productId)}
                  disabled={purchasing}
                >
                  <Text style={styles.subscribeButtonText}>
                    {purchasing ? 'Processing...' : 'Subscribe Now'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={restorePurchases}
            disabled={loading}
          >
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
        </>
      )}
      <View style={styles.keyContainer}>
        <Text style={styles.keyText}>productId  =  <Text style={[styles.keyText,{color:'red'}]}>{purchesdone.productId}</Text></Text>
        <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(purchesdone.productId)}>
          <Text style={styles.copyText}>Copy</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.keyContainer}>
        <Text style={styles.keyText}>packageNameAndroid  = <Text style={[styles.keyText,{color:'red'}]}>{purchesdone.packageNameAndroid}</Text></Text>
        <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(purchesdone.packageNameAndroid)}>
          <Text style={styles.copyText}>Copy</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.keyContainer}>
        <Text style={styles.keyText}>purchaseToken   = <Text style={[styles.keyText,{color:'red'}]}>{purchesdone.purchaseToken}</Text></Text>
        <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(purchesdone.purchaseToken)}>
          <Text style={styles.copyText}>Copy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  noProductsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  debugButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  debugButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  activeCard: {
    backgroundColor: '#d4edda',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#28a745',
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#155724',
    marginBottom: 8,
  },
  activeText: {
    fontSize: 14,
    color: '#155724',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  productCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 16,
  },
  subscribeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  restoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  restoreButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
  keyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    elevation: 3,
  },
  keyText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  copyButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#007bff',
    borderRadius: 6,
  },
  copyText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default InAppPurchase;