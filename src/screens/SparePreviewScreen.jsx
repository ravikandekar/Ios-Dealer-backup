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
import SubscriptionModal from '../components/SubscriptionModal';

const SparePreviewScreen = ({ navigation, route }) => {
  const { spareId } = route.params || {};
  const { theme, selectedCategory } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [editSpareDetails, seteditSpareDetails] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
const { formData, updateForm, clearFields } = useFormStore();
  useEffect(() => {
    if (!spareId) {
      showToast('error', 'Missing Info', 'Spare ID not found');
      setLoading(false);
      return;
    }

    const fetchSpareDetails = async () => {
      setLoading(true);
      try {
        const url = `/api/product/spareRoute/spare_details_by_spare/${spareId}`;
        const res = await apiClient.get(url);
        const data = res?.data?.data?.spare;
        seteditSpareDetails(data)
        console.log('getting spare data ', data);

        if (!data) throw new Error('No data found');

        const formattedData = {
          images: data.images?.map((img) => ({ uri: img.url })) || [],
          title: `${data.year_of_manufacture} ${data.brand_name} ${data.model_name}`,
          subtitle: data.sapre_name || '',
          price: `${data.price}`,
          specs: [
            [
              { icon: 'cogs', label: data.condition_name },
              { icon: 'calendar-alt', label: data.year_of_manufacture },
            ],
            [
              { icon: 'tools', label: data.product_type_name },
              { icon: 'box', label: data.subproduct_type_name },
            ],
          ],
          interested: false,
          description: data.description || null,
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

    fetchSpareDetails();
  }, [spareId]);

  const navigateToHomeAndReset = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'BottomTabNavigator' }],
    });
  };

  const onEditPress = () => {
    const formData = {
      SpareBrandId: editSpareDetails.brand_id || '',
      spareproductid: editSpareDetails._id || '',
      Sparename: editSpareDetails.sapre_name || '',
      spareConditionId: editSpareDetails.condition_id || '',
      spareProductTypeId: editSpareDetails.product_type_id || '',
      subproducttypeId: editSpareDetails.subproduct_type_id || '',
      SparePartNameId: editSpareDetails.model_id || '',
      SpareyearId: editSpareDetails.year_of_manufacture_id || '',
      Spareyear_of_manufacture: editSpareDetails.year_of_manufacture || '',
      Sparedescription: editSpareDetails.description || '',
      Spareprice: vehicleDetails.price?.toString() || '',
      kmsDriven: editSpareDetails.kilometers_driven || '',
      category_id: editSpareDetails.category_id || '',
      subscription_plan: editSpareDetails.subscription_plan || '',
      images: editSpareDetails.images?.map((img) => {
        const urlParts = img.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const extension = fileName.split('.').pop().toLowerCase();
        return {
          uri: img.url,
          name: fileName,
          type: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
        };
      }) || [],
      isPublished: editSpareDetails.isPublished ?? false,
      isSold: editSpareDetails.isSold || null
    };
    // Set the whole form data at once
    // formData.isEdit = true;
    useFormStore.getState().setFormData(formData);
    updateForm('isEditSpare', true);

    navigation.navigate('SpareTypeSelection', { selectedCategory });
  };

  const onPublish = async () => {
    if (!spareId) return;

    setIsPublishing(true);
    try {
      const url = `/api/product/spareRoute/spares/${spareId}/publish`;
      const response = await apiClient.put(url);
      const { appCode, message } = response?.data;

      if (appCode === 1000) {
        showToast('success', 'Success', 'Published Successfully');
        navigateToHomeAndReset();
      } else if (appCode === 1085) {
        showToast('error', 'Already Published', 'Spare is already published and cannot be edited.');
      } else if (appCode === 1134 || appCode === 1126) {
        setShowSubscriptionModal(true);
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

    InteractionManager.runAfterInteractions(() => {
      setShowSubscriptionModal(false);
    });

    navigation.navigate('SubscriptionScreen');
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
            No spare data found.
          </AppText>
        )}
      </ScrollView>

      {/* Subscription Modal */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={() => { handleSubscribe() }}
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

export default SparePreviewScreen;
