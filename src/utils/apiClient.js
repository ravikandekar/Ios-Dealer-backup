// apiClient.js
import axios from 'axios';
import { showToast } from './toastService';
import {
  getToken,
  getRefreshToken,
  storeToken,
  storeRefreshToken,
} from './storage';
import { triggerLogout } from './LogoutFunction';
import { API_URL } from './LocalCofig';

console.log(API_URL, 'API Base URL');

// Refresh API endpoint
const REFRESH_URL = '/api/dealer/refresh-token/refresh-token';

// Flags & Queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== Request Interceptor =====
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    console.log('📤 API Request:');
    console.log('➡️ URL:', config.baseURL + config.url);
    console.log('➡️ Method:', config.method?.toUpperCase());
    console.log('➡️ Headers:', config.headers);
    console.log('➡️ Body:', config.data);

    return config;
  },
  (error) => {
    console.log('❌ Request Interceptor Error:', error);
    showToast('error', 'Request Error', 'Failed to send request.');
    return Promise.reject(error);
  }
);

// ===== Response Interceptor =====
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:');
    console.log('⬅️ URL:', response.config?.baseURL + response.config?.url);
    console.log('⬅️ Status:', response.status);
    console.log('⬅️ Data:', response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.log('🚨 API Error:');
    if (error.config) {
      console.log('⛔ URL:', error.config.baseURL + error.config.url);
      console.log('⛔ Method:', error.config.method?.toUpperCase());
      console.log('⛔ Body:', error.config.data);
    }

    // If there is a response from server
    if (error.response) {
      const { status, data } = error.response;
      console.log('⛔ Status:', status);
      console.log('⛔ Error Data:', data);

      // Handle token expiration based on appCode
      if (
        status === 401 &&
        !originalRequest._retry &&
        data?.appCode !== 1013 // 1013 = REFRESH_TOKEN_INVALID
      ) {
        if (originalRequest.url.includes(REFRESH_URL)) {
          // Refresh token request failed
          triggerLogout();
          return Promise.reject({ message: 'Session expired', code: 401 });
        }

        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await getRefreshToken();
          if (!refreshToken) {
            triggerLogout();
            return Promise.reject({ message: 'No refresh token', code: 401 });
          }

          console.log('🔄 Refreshing token...');
          const refreshResponse = await axios.post(
            `${API_URL}${REFRESH_URL}`,
            { refreshToken }
          );

          // Handle API's own success/failure format
          if (refreshResponse.data?.appCode === 1013) {
            // Invalid or expired refresh token
            triggerLogout();
            return Promise.reject({ message: 'Invalid refresh token', code: 401 });
          }

          if (refreshResponse.data?.success) {
            const newAccessToken = refreshResponse.data.data?.accessToken;
            const newRefreshToken = refreshResponse.data.data?.refreshToken;

            if (newAccessToken) {
              await storeToken(newAccessToken);
              if (newRefreshToken) {
                await storeRefreshToken(newRefreshToken);
              }

              processQueue(null, newAccessToken);
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return apiClient(originalRequest);
            }
          }

          throw new Error('Invalid refresh response');
        } catch (err) {
          processQueue(err, null);
          triggerLogout();
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      // If refresh token is invalid → logout
      if (data?.appCode === 1013) {
        triggerLogout();
        return Promise.reject({ message: 'Invalid refresh token', code: 401 });
      }

      // Handle other status codes
      switch (status) {
        case 403:
          showToast('error', 'Forbidden', 'Access denied.');
          break;
        case 404:
          showToast('error', 'Not Found', data?.message || 'Resource not found.');
          break;
        case 422:
          showToast('error', 'Validation Error', data?.message || 'Invalid input.');
          break;
        case 500:
          showToast('error', 'Server Error', 'Internal server error occurred.');
          break;
        default:
          showToast('error', 'Error', data?.message || 'An unexpected error occurred.');
      }
    }
    // No response from server
    else if (error.request) {
      console.log('⛔ No response received:', error.request);
      showToast('error', 'Network Error', 'No response from server. Please check your internet.');
    }
    // Unexpected error
    else {
      console.log('⛔ Unexpected Error:', error.message);
      showToast('error', 'Unexpected Error', error.message || 'An unknown error occurred.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
