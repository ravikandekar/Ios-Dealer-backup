import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
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
import { useFormStore } from '../store/formStore'; // ✅ Global store import
import { useRoute } from '@react-navigation/native';
import apiClient from '../utils/apiClient';
import PriceChnageModal from '../components/PriceChnageModal';
import { showToast } from '../utils/toastService';
import Loader from '../components/Loader';
import InfoBanner from '../components/InfoBanner';

const AssetsPreviewScreen = ({ navigation }) => {
  const { theme } = useContext(AuthContext);
  const route = useRoute();
  const { id, selectedCategory } = route.params;
  console.log('idffff', id, selectedCategory);

  const endpointMap = {
    cars: `/api/product/carRoutes/cars_details_by_carid/${id}`,
    bikes: `/api/product/bikeRoute/bikes_details_by_bikeid/${id}`,
    spares: `/api/product/spareRoute/spare_details_by_spare/${id}`,
  };

  const [assetDetails, setAssetDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priceModalVisible, setpriceModalVisible] = useState(false);
  const [inputPrize, setInputPrize] = useState(null);
  const [editModalData, seteditModalData] = useState(null);
  const [dataedit, setdataedit] = useState(null);
  console.log('dataedit', dataedit);
  const isActive = dataedit?.isActive;

  useEffect(() => {
    fetchAssetDetails();
  }, [id, selectedCategory]);
  const fetchAssetDetails = async () => {
    try {
      const lowerCaseCategory = selectedCategory?.toLowerCase();
      const endpoint = endpointMap[lowerCaseCategory];
      const response = await apiClient.get(endpoint);
      console.log('response?.data?.', response?.data?.data);

      if (response?.data?.success) {
        let data = response.data.data;
        let asset = data?.car || data?.bike || data?.spare;
        setdataedit(asset)
        const formatted = {
          images: asset.images?.map(img => ({ uri: img.url })) || [],
          title:
            selectedCategory === 'spares'
              ? `${asset.year_of_manufacture} ${asset.brand_name} ${asset.model_name}`
              : `${asset.year_of_manufacture || ''} ${asset.brand_name
              } ${asset[
              selectedCategory === 'cars' ? 'car_name' : 'bike_name'
              ] || ''
              }`,
          subtitle: asset.sapre_name || asset.model_name
            || '',
          price: `${asset.price?.toLocaleString('en-IN') || '—'}`,
          specs:
            selectedCategory === 'cars'
              ? [
                [
                  {
                    icon: 'car',
                    label:
                      `${asset.kilometers_driven?.toLocaleString(
                        'en-IN',
                      )} kms` || '—',
                  },
                  {
                    icon: 'gas-pump',
                    label: asset.fuel_type || '—',
                  },
                ],
                [
                  {
                    icon: 'cogs',
                    label: asset.transmission || '—',
                  },
                  {
                    icon: 'user',
                    label: asset.ownership || '—',
                  },
                ],
                [
                  {
                    icon: 'calendar-alt',
                    label: `${asset.year}` || '—',
                  },
                  {
                    icon: 'palette',
                    label: asset.color_name || '—',
                  },
                ],
              ]
              : selectedCategory === 'bikes'
                ? [
                  [
                    {
                      icon: 'car',
                      label:
                        `${asset.kilometers_driven?.toLocaleString(
                          'en-IN',
                        )} kms` || '—',
                    },
                    {
                      icon: 'gas-pump',
                      label: asset.fuel_type || '—',
                    },
                  ],
                  [
                    {
                      icon: 'calendar-alt',
                      label: `${asset.year}` || '—',
                    },
                    {
                      icon: 'palette',
                      label: asset.color_name || '—',
                    },
                  ],
                ]
                : selectedCategory === 'spares'
                  ? [
                    [
                      {
                        icon: 'calendar-alt',
                        label: `${asset.year_of_manufacture}` || '—',
                      },
                      {
                        icon: 'wrench',
                        label: asset.condition_name || '—',
                      },
                    ],
                  ]
                  : [],
          description: asset.description || null,
          interested: asset.leadCount || null,
          isSold: asset.isSold || null,

        };


        setAssetDetails(formatted);
      } else {
        throw new Error(
          response?.data?.message || 'Failed to fetch asset details',
        );
      }
    } catch (error) {
      console.error('Error fetching asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceNext = async () => {
    console.log('Selected edit option:', editModalData);

    try {
      setLoading(true); // Show loader

      let endpoint = '';
      let payload = {};

      if (selectedCategory === 'cars') {
        endpoint = 'api/product/carRoutes/updatecar_price';
        payload = {
          car_id: editModalData,
          price: Number(inputPrize),
        };
      } else if (selectedCategory === 'bikes') {
        endpoint = 'api/product/bikeRoute/updatebike_price';
        payload = {
          bike_id: editModalData,
          price: Number(inputPrize),
        };
      } else if (selectedCategory === 'spares') {
        endpoint = 'api/product/spareRoute/updatespare_price';
        payload = {
          spare_id: editModalData,
          price: Number(inputPrize),
        };
      } else {
        Alert.alert('Error', 'Invalid category selected.');
        return;
      }

      const response = await apiClient.put(endpoint, payload);

      if (response?.data?.success) {
        showToast('success', '', 'Price updated successfully.');
        setpriceModalVisible(false);
        fetchAssetDetails(); // Refresh inventory
        setInputPrize(null);     // Reset input
      } else {
        Alert.alert('Error', response?.data?.message || 'Failed to update price.');
      }
    } catch (error) {
      console.error('editPrice error:', error);
      showToast('error', '', error?.response?.data?.message || 'Something went wrong!');
      Alert.alert('Error',);
    } finally {
      setLoading(false); // Hide loader
    }
  };


  return (
    <BackgroundWrapper style={{ padding: wp('2%') }}>
      <DetailsHeader title="Assets Preview" onBackPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack(); // ✅ normal back
        } else {
          navigation.navigate("MyAssetsScreen"); // ✅ fallback
        }
      }} />

      <ScrollView
        contentContainerStyle={{ marginTop: hp('2%') }}
        showsVerticalScrollIndicator={false}>

        {dataedit?.isdisable && (
          <InfoBanner
            iconName="info"
            iconType="feather"
            iconColor="red"
            title="Your post has been disabled by our review team, and it's not live for buyers. Please raise a ticket or contact us at support@gadilobharat.com"
            subtitle=""
            buttonText="Contact"
            rightsideiconcolor={theme.colors.themeIcon}
            onPress={() => navigation.navigate('TicketListScreen')}
            customStyle={{
              height: hp('18.5%'),
              marginTop: hp('1%'),
              borderRadius: wp('3%'),
              paddingRight: wp('3%'),
              padding: wp('1%'),
              marginVertical: hp('2%'),
            }}
          />
        )}
        {!loading && assetDetails && dataedit && (
          <VehiclePreviewCard
            {...assetDetails}
            onPressEdit={() => {
              setpriceModalVisible(true);
              seteditModalData(dataedit._id); // or item._id if you are inside a list
              setInputPrize(dataedit.price);  // or item.price
            }}
            isPadding={true}
          />

        )}

        <PriceChnageModal
          visible={priceModalVisible}
          onClose={() => setpriceModalVisible(false)}
          inputValue={inputPrize}
          setInputValue={setInputPrize}
          onNextPress={handlePriceNext}
          modalTitle="Enter Price"
          placeholder="₹50,000"
          theme={theme}
        />

        <Loader visible={loading} />
      </ScrollView>
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
});

export default AssetsPreviewScreen;
