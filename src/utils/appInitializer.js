// utils/initApp.js
import apiClient from "./apiClient";

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
}) => {
  try {
    const res = await apiClient.get("/api/dealer/auth/dealer-app-config");
    const data = res.data?.data.config;

    // ✅ update states
    setUserID(data?.dealerId || "");
    setUserName(data?.name || "");
    setcityselected(data?.isCitySelected || false);
    setProfileCompleted(data?.isProfileCompleted || false);
    setisAadharVerified(data?.isAadharVerified || false);
    setBussinessdetails(data?.isBusinessDetailCompleted || false);
    setregister(data?.isRegistrationCompleted || false);
    setSelectedCategory(data?.dealership?.activeCategory || "");

    updateForm("city_id", data?.cityId?._id || "");
    updateForm("category_id", data?.dealership?.activeCategoryId?._id || "");
    updateForm("isSubscriberRequired", data?.dealership?.isSubscriberRequired || false);
    updateForm("subscription_plan", data?.dealership?.activeCategorySubscriptionPlanId || "");
    updateForm("subscriptionActive", data?.isSubscriptionExpired || false);
    updateForm("forceUpdateObject", data?.dealership?.systemConfig || {});

    return { success: true, data: res.data };
  } catch (error) {
    console.error("❌ App init error:", error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || error.message };
  }
};
