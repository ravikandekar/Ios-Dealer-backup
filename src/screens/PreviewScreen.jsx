import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import AppText from '../components/AppText';
import { AuthContext } from '../context/AuthContext';
import BackgroundWrapper from '../components/BackgroundWrapper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import ActionButton from '../components/ActionButton';
import { DetailsHeader } from '../components/DetailsHeader';
import VehiclePreviewCard from '../components/VehiclePreviewCard';
import { useFormStore } from '../store/formStore';
import { showToast } from '../utils/toastService';
import apiClient from '../utils/apiClient';
import CustomAlertModal from '../components/CustomAlertModal';
import SubscriptionModal from '../components/SubscriptionModal';
import LottieCompo from '../components/LottieCompo';

const PreviewScreen = ({ navigation, route }) => {
  const { carandBikeId, vehicleType } = route.params || {};
  const { theme, selectedCategory } = useContext(AuthContext);
  const { formData, updateForm } = useFormStore();
  const [loading, setLoading] = useState(true);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [editvehicleDetails, setEditVehicleDetails] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showPublishAsSoldLottie, setShowPublishAsSoldLottie] = useState(false);
  console.log('selectedCategory', selectedCategory);

  useEffect(() => {
    if (!carandBikeId || !vehicleType) {
      showToast('error', 'Missing Info', 'Vehicle ID or Type not found');
      setLoading(false);
      return;
    }

    const fetchVehicleDetails = async () => {
      setLoading(true);
      try {
        const url =
          vehicleType === 'bike'
            ? `/api/product/bikeRoute/bikes_details_by_bikeid/${carandBikeId}`
            : `/api/product/carRoutes/cars_details_by_carid/${carandBikeId}`;

        const res = await apiClient.get(url);
        const data = vehicleType === 'bike' ? res.data.data.bike : res.data.data.car;
        console.log('car and bike edit data ', data);
        setEditVehicleDetails(data);
        if (!data) throw new Error('No data found');

        const formattedData = {
          images: data.images?.map((img) => ({ uri: img.url })) || [],
          title: `${data.year} ${data.brand_name} ${data.bike_name || data.car_name}`,
          subtitle: data.model_name || '',
          price: `${data.price}`,
          specs: [
            [
              { icon: 'car', label: `${data.kilometers_driven} kms` },
              { icon: 'gas-pump', label: data.fuel_type },
            ],
            [
              { icon: 'cogs', label: data.transmission },
              { icon: 'user', label: `${data.ownership}` },
            ],
            [
              { icon: 'calendar-alt', label: `${data.year}` },
              { icon: 'palette', label: data.color_name },
            ],
          ],
          interested: false,
          description: null,
        };

        setVehicleDetails(formattedData);

      } catch (error) {
        console.error('PreviewScreen Error:', error);
        showToast(
          'error',
          'Failed to load',
          error?.response?.data?.message || error.message || 'Try again later'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [carandBikeId, vehicleType]);

  const navigateToHomeAndReset = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'BottomTabNavigator' }],
    });
  };

  const onEditPress = () => {

    const formData = {
      otherbrand: editvehicleDetails.otherbrand || '',
      carandbikeproductid: editvehicleDetails._id || '',
      carAndBikeBrandId: editvehicleDetails.brand_id || '',
      carandBikeId: editvehicleDetails.car_id || editvehicleDetails.bike_id || '',
      transmissionId: editvehicleDetails.transmission_id || '',
      fuelTypeId: editvehicleDetails.fuel_type_id || '',
      carColorId: editvehicleDetails.color_id || '',
      ownerHistoryId: editvehicleDetails.ownership_id || '',
      yearId: editvehicleDetails.year_id || '',
      model_name: editvehicleDetails.model_name || '',
      price: vehicleDetails.price?.toString() || '',
      kmsDriven: editvehicleDetails.kilometers_driven || '',
      category_id: editvehicleDetails.category_id || '',
      subscription_plan: editvehicleDetails.subscription_plan || '',
      city_id: editvehicleDetails.city_id || '',
      images: editvehicleDetails.images?.map((img) => {
        const urlParts = img.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const extension = fileName.split('.').pop().toLowerCase();
        return {
          uri: img.url,
          name: fileName,
          type: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
        };
      }) || [],

      isPublished: editvehicleDetails.isPublished ?? false,
      // Bike-specific
      bikeTypeId: editvehicleDetails.bike_type_id || '',
    };

    // Set the whole form data at once
    useFormStore.getState().setFormData(formData);
    updateForm('isEdit', true);
    if (selectedCategory === 'Car') {
      navigation.navigate('CarDetailsScreen', { selectedCategory });
    } else if (selectedCategory === 'Bike') {
      navigation.navigate('BikeTypeSelection', { selectedCategory });
    }
  };

  const onPublish = async () => {
    if (!carandBikeId || !vehicleType) return;

    setIsPublishing(true);
    try {
      const url =
        vehicleType === 'bike'
          ? `/api/product/bikeRoute/bikes/${carandBikeId}/publish`
          : `/api/product/carRoutes/cars/${carandBikeId}/publish`;

      const response = await apiClient.patch(url);
      const { appCode, message } = response?.data;

      if (appCode === 1000) {
        // showToast('success', 'Success', 'Published Successfully');
        setShowPublishAsSoldLottie(true);
      } else if (appCode === 1085) {
        showToast('error', 'Already Published', 'Vehicle is already published and cannot be edited.');
      } else if (appCode === 1134 || appCode === 1126) {
        setShowSubscriptionModal(true);
      } else if (appCode === 1098) {
        // showToast('error', 'Raviii', 'Your profile is under verification. You cannot publish at the moment.');

        setShowQuotaModal(true);
      } else {
        showToast('error', 'Error', message || 'Failed to publish');
      }
    } catch (error) {
      console.error('Publish error:', error);
      showToast(
        'error',
        'Error',
        error?.response?.data?.message || error.message || 'Publish failed'
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSubscribe = () => {

    navigation.navigate('SubscriptionScreen');
    InteractionManager.runAfterInteractions(() => {
      setShowSubscriptionModal(false);
    });
  };

  return (
    <BackgroundWrapper style={{ padding: wp('2%') }}>
      <DetailsHeader
        title="Preview"
        rightType="action"
        actionIcon="pencil-sharp"
        actionText="Edit"
        onActionPress={onEditPress}
        onBackPress={navigateToHomeAndReset}
      />

      <ScrollView
        contentContainerStyle={{ marginTop: hp('2%') }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : vehicleDetails ? (
          <>
            <VehiclePreviewCard {...vehicleDetails} />

            <View style={styles.infoSection}>
              <AppText style={[styles.infoText, { color: theme.colors.placeholder }]}>
                Review all details before publishing. Make sure your vehicle
                information, photos, and price are accurate.
              </AppText>
              <AppText style={[styles.infoText, { color: theme.colors.placeholder }]}>
                You can edit if needed, publish now, or save it for later.
              </AppText>
            </View>

            <View style={styles.buttonContainer}>
              {isPublishing ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <ActionButton label="Publish" onPress={onPublish} />
              )}
            </View>
          </>
        ) : (
          <AppText style={{ color: theme.colors.text, textAlign: 'center' }}>
            No vehicle data found.
          </AppText>
        )}
      </ScrollView>

      {/* Subscription Modal */}
      {/* <Modal
        visible={showSubscriptionModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSubscriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <AppText style={[styles.modalTitle, { color: theme.colors.text }]}>
              Subscription Required
            </AppText>
            <AppText style={[styles.modalMessage, { color: theme.colors.placeholder }]}>
              You need to purchase a subscription to publish this product.
            </AppText>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: theme.colors.primary }]}
                onPress={() => setShowSubscriptionModal(false)}
              >
                <AppText style={{ color: theme.colors.primary }}>Cancel</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtnFilled, { backgroundColor: theme.colors.primary }]}
                onPress={() => { handleSubscribe() }}
              >
                <AppText style={{ color: theme.colors.background }}>Subscribe</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={() => { handleSubscribe() }}
      />
      <CustomAlertModal
        visible={showQuotaModal}
        onClose={() => InteractionManager.runAfterInteractions(() => setShowQuotaModal(false))}
        title="Quota Exceeded"
        message="You have reached your allowed limit. Delete Old products or Mark as Sold to free up space."
        primaryButtonText="Ok"
        onPrimaryPress={() => InteractionManager.runAfterInteractions(() => setShowQuotaModal(false))}
        theme={theme}
      />
      <LottieCompo
        visible={showPublishAsSoldLottie}
        lottieSource={require('../../public_assets/media/lottie/Published.json')}
        title="Asset Published"
        description="Your asset has been published successfully."
        buttonText="OK"
        onClose={() => {
          InteractionManager.runAfterInteractions(() => setShowPublishAsSoldLottie(false));
          navigateToHomeAndReset();
        }}
      />
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  infoSection: {
    marginTop: hp('2%'),
    paddingHorizontal: wp('4%'),
  },
  infoText: {
    fontSize: wp('3.5%'),
    marginBottom: hp('0.8%'),
    lineHeight: wp('5%'),
  },
  buttonContainer: {
    marginTop: hp('3%'),
    paddingHorizontal: wp('4%'),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp('80%'),
    borderRadius: 12,
    padding: wp('5%'),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginBottom: hp('1%'),
  },
  modalMessage: {
    fontSize: wp('3.8%'),
    textAlign: 'center',
    marginBottom: hp('3%'),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: wp('4%'),
  },
  modalBtn: {
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('5%'),
    borderWidth: 1,
    borderRadius: 8,
  },
  modalBtnFilled: {
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('5%'),
    borderRadius: 8,
  },
});

export default PreviewScreen;
