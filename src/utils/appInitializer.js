// utils/initApp.js
import apiClient from './apiClient';

export const initApp = async ({
    setUserID,
    setUserName,
    setcityselected,
    setProfileCompleted,
    setisAadharVerified,
    setBussinessdetails,
    setregister,
    setSelectedCategory,
    updateForm,
    setIsAppInitialized
}) => {
    console.log('🔄 Initializing app...');

    try {
        const res = await apiClient.get('/api/dealer/auth/dealer-app-config');
        const data = res.data?.data.config;
        console.log('✅ App config data:', data);
        console.log('✅ App config data:', res.data);

        setUserID(data?.dealerId || '');
        setUserName(data?.name || '');
        setcityselected(data?.isCitySelected || false);
        setProfileCompleted(data?.isProfileCompleted || false);
        setisAadharVerified(data?.isAadharVerified || false);
        setBussinessdetails(data?.isBusinessDetailCompleted || false);
        setregister(data?.isRegistrationCompleted || false);
        setSelectedCategory(data?.dealership?.activeCategory || '');

        updateForm('city_id', data?.cityId?._id || '');
        updateForm('category_id', data?.dealership?.activeCategoryId?._id || '');
        updateForm('isSubscriberRequired', data?.dealership?.isSubscriberRequired || false);
        updateForm('subscription_plan', data?.dealership?.activeCategorySubscriptionPlanId || '');
        updateForm('subscriptionActive', data?.isSubscriptionExpired|| false);
        updateForm('forceUpdateObject', data?.dealership?.systemConfig || {});
    } catch (error) {
        console.error('❌ App init error:', error?.response?.data || error.message);
    } finally {

        setIsAppInitialized(true);
    }
};
