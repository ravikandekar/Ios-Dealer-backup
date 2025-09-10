import { Alert } from 'react-native';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';

export const fetchCategories = async () => {
  // Alert.alert('categoru get api call')
  try {
    const response = await apiClient.get('/api/admin/categoryRoute/dealer/categories');
    const { success, data } = response.data;

    if (success && data?.categories?.length > 0) {
      return data.categories;
    } else {
      showToast('error', '', 'No categories found');
      return [];
    }
  } catch (error) {
    console.error('Fetch category error:', error);
    showToast(
      'error',
      '',
      error?.response?.data?.message || 'Failed to load categories'
    );
    return [];
  }
};
