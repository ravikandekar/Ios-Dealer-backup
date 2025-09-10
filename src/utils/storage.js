import { Alert } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';


export const storeToken = async (token) => {
  try {
    await EncryptedStorage.setItem('user_token', token);
    console.log(' storing tokenmmmm:', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};



export const getToken = async () => {
  try {
    return await EncryptedStorage.getItem('user_token');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};


export const removeToken = async () => {
  try {
    const token = await EncryptedStorage.getItem('user_token');
    if (token) {
      await EncryptedStorage.removeItem('user_token');
      await EncryptedStorage.removeItem('refresh_token');
      console.log('Token successfully removed..');
    } else {
      console.log('Token not found. Nothing to remove.');
    }
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

export const storeRefreshToken = async (token) => {
  try {
    await EncryptedStorage.setItem('refresh_token', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};
export const getRefreshToken = async () => {
  try {
    return await EncryptedStorage.getItem('refresh_token');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};


export const storePurchaseTokenAndProductID = async (productId, purchaseToken) => {
  try {
    if (productId) {
      await EncryptedStorage.setItem('productId', productId.toString());
      // Alert.alert('Success', `Product ID stored: ${productId}`);
    } else {
      // Alert.alert('Warning', 'Product ID is missing, not stored.');
    }

    if (purchaseToken) {
      await EncryptedStorage.setItem('purchaseToken', purchaseToken.toString());
      // Alert.alert('Success', `Purchase Token stored: ${purchaseToken}`);
    } else {
      // Alert.alert('Warning', 'Purchase Token is missing, not stored.');
    }
  } catch (error) {
    // Alert.alert('Error', `Error storing data: ${error.message}`);
  }
};


export const getPurchaseTokenAndProductID = async () => {
  try {
    const productId = await EncryptedStorage.getItem('productId');
    const purchaseToken = await EncryptedStorage.getItem('purchaseToken');
    return { productId, purchaseToken };
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    return null;
  }
};
// export const removePurchaseTokenAndProductID = async () => {
//   try {
//     await EncryptedStorage.removeItem('productId');
//     await EncryptedStorage.removeItem('purchaseToken');
//     console.log('Successfully removed purchase tokens.');
//   } catch (error) {
//     console.error('Error removing purchase tokens:', error);
//   }
// };


export const removePurchaseTokenAndProductID = async () => {
  try {
    const keys = ['productId', 'purchaseToken'];

    for (const key of keys) {
      try {
        await EncryptedStorage.removeItem(key);
        console.log(`✅ Removed (or didn’t exist): ${key}`);
      } catch (err) {
        console.warn(`⚠️ Failed to remove ${key}:`, err.message || err);
      }
    }

    console.log('🎉 Finished removing purchase tokens.');
  } catch (error) {
    console.error('❌ Error in removePurchaseTokenAndProductID:', error);
  }
};
