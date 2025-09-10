// purchaseVerificationIOS.js
import RNFS from 'react-native-fs';
import apiClient from './apiClient';
import { removePurchaseTokenAndProductID } from './storage';
import { showToast } from './toastService';
import { Alert } from 'react-native';

/**
 * Verify iOS purchase with backend
 * - Calls iosadd endpoint
 * - Logs errors to pipedream
 * - Saves response for debugging
 * - Returns status only (no alerts here)
 */
export const verifyPurchaseOnBackendIOS = async ({ productId, receiptData, userID }) => {

  const payload = {
    dealer_id: userID,
    receiptData,
    productId,
    purchase_platform: 'ios',
  };

  console.log('🔄 Sending iOS verification request:', payload);

  try {
    // 🔑 Backend API call for iOS
    const response = await apiClient.post(
      '/api/dealer/dealerSubscriptionRoute/iosadd',
      payload
    );
    safeLogToPipedream({ stage: 'ios-response', response });
    console.log('✅ iOS Backend Response:', response.data);

    // Save response locally for debugging
    const filePath = `${RNFS.DocumentDirectoryPath}/purchase_verification_ios.txt`;
    try {
      await RNFS.writeFile(filePath, JSON.stringify(response.data, null, 2), 'utf8');
      console.log(`📄 iOS Response saved to: ${filePath}`);
    } catch (fsError) {
      console.log('⚠️ Failed to write iOS response locally:', fsError);
      safeLogToPipedream({ stage: 'fs-error-ios', error: fsError });
    }

    // Handle backend response
    if (response.data.code === 'PURCHASE_ALREADY_USED') {
      removePurchaseTokenAndProductID();
      return { status: 'already_used', filePath };
    } else if (response.data.success || response.data.code === 'SUCCESS') {
      removePurchaseTokenAndProductID();
      return { status: 'success', filePath };
    } else {
      console.log('⚠️ Unexpected iOS response:', response.data);
      safeLogToPipedream({ stage: 'unexpected-response-ios', response: response.data });
      return { status: 'failed', filePath };
    }
  } catch (error) {
    console.log('❌ iOS Backend API Error:', error);
    safeLogToPipedream({ stage: 'api-error-ios', error });

    if (error.response?.data?.code !== 'PURCHASE_ALREADY_USED') {
      removePurchaseTokenAndProductID();
    }

    return { status: 'failed', error };
  }
};

/**
 * Helper: Safe logging to pipedream (never throws)
 */
async function safeLogToPipedream(data) {
  try {
    await apiClient.post('https://eos7kasohm6c8gi.m.pipedream.net', data);
  } catch (err) {
    console.log('⚠️ Failed to log to pipedream (iOS):', err);
  }
}
