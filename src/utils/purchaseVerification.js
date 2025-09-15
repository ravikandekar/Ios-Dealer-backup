// purchaseVerification.js
import { Platform, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import apiClient from './apiClient';
import { removePurchaseTokenAndProductID } from './storage';
import { showToast } from './toastService';

/**
 * Verify purchase with backend
 * - Always attempts API call
 * - Logs errors to pipedream
 * - Prevents app from crashing on failure
 */
export const verifyPurchaseOnBackend = async ({ productId, purchaseToken, userID }) => {
  const payload = {
    dealer_id: userID, 
    packageName: 'com.gadilobharat.dealers',
    productId,
    purchaseToken,
    purchase_platform: Platform.OS === 'android' ? 'google' : 'ios',
  };

  console.log('🔄 Sending verification request:', payload);

  try {

    // 🔑 Backend API call
    const response = await apiClient.post(
      '/api/dealer/dealerSubscriptionRoute/add',
      payload
    );
    safeLogToPipedream({ stage: 'bbbbbb', response });
    console.log('✅ Backend Response:', response.data);

    // Save response locally (for debugging)
    const filePath = `${RNFS.DocumentDirectoryPath}/purchase_verification.txt`;
    try {
      await RNFS.writeFile(filePath, JSON.stringify(response.data, null, 2), 'utf8');
      console.log(`📄 Response saved to: ${filePath}`);
    } catch (fsError) {
      console.log('⚠️ Failed to write response locally:', fsError);
      safeLogToPipedream({ stage: 'fs-error', error: fsError });
    }

    // Handle backend response
    if (response.data.code === 'PURCHASE_ALREADY_USED') {
      Alert.alert('Info', 'You have already purchased this subscription.');
      removePurchaseTokenAndProductID();
    } else if (response.data.success || response.data.code === 'SUCCESS') {
      Alert.alert('Success', 'Subscription verified successfully.');
      removePurchaseTokenAndProductID();
    } else {
      console.log('⚠️ Unexpected response:', response.data);
      safeLogToPipedream({ stage: 'unexpected-response', response: response.data });
    }

    return filePath;
  } catch (error) {
    console.log('❌ Backend API Error:', error);

    Alert.alert('Error', error.message || 'Failed to verify purchase');
    safeLogToPipedream({ stage: 'api-error', error });

    // Always clear token so user doesn’t get stuck
    if (error.response?.data?.code !== 'PURCHASE_ALREADY_USED') {
      removePurchaseTokenAndProductID();
    }

    // Instead of throwing, return safe fallback
    return null;
  }
};

/**
 * Helper: Safe logging to pipedream (never throws)
 */
async function safeLogToPipedream(data) {
  try {
    apiClient.post('https://eos7kasohm6c8gi.m.pipedream.net', payload)
  } catch (err) {
    console.log('⚠️ Failed to log to pipedream:', err);
  }
}
