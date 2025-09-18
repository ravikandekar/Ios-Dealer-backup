import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  PermissionsAndroid,
  RefreshControl,
} from 'react-native';
import AppText from '../components/AppText';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomEditField from '../components/CustomEditField';
import { useNavigation } from '@react-navigation/native';
import { DetailsHeader } from '../components/DetailsHeader';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackgroundWrapper from '../components/BackgroundWrapper';
import LocationPicker from '../components/LocationPicker';
import MapView, { Marker } from 'react-native-maps';
import ActionButton from '../components/ActionButton';
import DynamicTabView from '../components/DynamicTabView';
import { launchCamera } from 'react-native-image-picker';
import { showToast } from '../utils/toastService';
import Loader from '../components/Loader';
import apiClient from '../utils/apiClient';

const ProfileDetailsScreen = () => {
  const { theme, userID } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('personal');
  const [headerTitle, setHeaderTitle] = useState('Personal Details');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(
    'https://randomuser.me/api/portraits/men/75.jpg',
  );
  // Business types state
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [businessTypes, setBusinessTypes] = useState(['Cars', 'Bikes']);
  const availableBusinessTypes = ['Cars', 'Bikes', 'Spare Parts'];

  //Maps
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);

  const [originalFormData, setOriginalFormData] = useState({});

  // const [currentLocation, setCurrentLocation] = useState(null);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchProfileAndBusinessDetails();
    setIsRefreshing(false);
  }, []);

  // Update title when activeTab changes
  useEffect(() => {
    setHeaderTitle(
      activeTab === 'personal' ? 'Personal Details' : 'Business Details',
    );
  }, [activeTab]);

  //profile change
  useEffect(() => {
    fetchProfileAndBusinessDetails();
  }, []);

  const fetchProfileAndBusinessDetails = async () => {
    try {
      setLoading(true);

      const [profileRes, businessRes] = await Promise.all([
        apiClient.get(
          `/api/dealer/auth/get_complete_profile_details/${userID}`,
        ),
        apiClient.get(
          `/api/dealer/auth/get_complete_business_profile_details/${userID}`,
        ),
      ]);

      const profile = profileRes?.data?.data?.user || {};
      const business = businessRes?.data?.data?.user || {};

      // Profile image
      if (profile?.selfie) {
        setProfileImage(profile.selfie);
      }

      // Business categories
      if (Array.isArray(business?.dealershipCategories)) {
        setBusinessTypes(business?.dealershipCategories);
      }

      // Form data mapping
      const mappedData = {
        name: profile?.name || '',
        email: profile?.email || '',
        mobileNumber: profile?.phone || '',
        city: profile?.cityId?.city_name || '',
        state: profile?.cityId?.state_name || '',
        businessName: business?.business_name || '',
        business_contact_no: business?.business_contact_no || '',
        business_whatsapp_no: business?.business_whatsapp_no || '',
        businessAddress: business?.address || '',
        landmark: business?.landmark || '',
        businessCity: business?.cityId?.city_name || '',
        businessState: business?.cityId?.state_name || '',
      };

      console.log(mappedData);

      setFormData(mappedData);
      setOriginalFormData(mappedData);

      // Coordinates/address
      if (business.address) {
        setSelectedAddress(business.address);
      }

      showToast('success', '', 'Profile loaded successfully');
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      showToast('error', '', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUpdatedFields = (original, updated) => {
    const changes = {};
    for (let key in updated) {
      if (updated[key] !== original[key]) {
        changes[key] = updated[key];
      }
    }
    return changes;
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const updatedFields = getUpdatedFields(originalFormData, formData);

      if (Object.keys(updatedFields).length === 0) {
        Alert.alert('No changes', "You haven't made any changes.");
        setLoading(false);
        return;
      }

      const [profileResponse, businessResponse] = await Promise.all([
        apiClient.put(
          `api/dealer/auth/update-profile-bydealer/${userID}`,
          updatedFields,
        ),
        apiClient.put(
          `api/dealer/auth/update-business-bydealer/${userID}`,
          updatedFields,
        ),
      ]);

      console.log('✅ Success:', profileResponse.data);
      console.log('✅ Success:', businessResponse.data);
      // Alert.alert('Success', 'Profile updated successfully');
      showToast('success', '', 'Profile updated successfully');
      // Update original form data after successful save
      setOriginalFormData(formData);

      console.log('fhjdhfdhfdhs: ', updatedFields);
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      // Alert.alert('Error', 'Failed to update profile');
      showToast('error', '', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoto = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Camera permission denied');
          return;
        }
      }

      launchCamera(
        {
          mediaType: 'photo',
          cameraType: 'front',
          saveToPhotos: true,
          includeExtra: true, // Needed for additional data on Android
          presentationStyle: 'fullScreen',
          mirrorImage: false, // Prevent mirroring (may not work on all devices via this flag alone)
          cropping: true, // This enables cropping after capture
        },
        response => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorMessage);
          } else if (response.assets && response.assets.length > 0) {
            const sourceUri = response.assets[0].uri;
            setProfileImage(sourceUri);
          }
        },
      );
    } catch (err) {
      console.warn(err);
    }
  };

  const [selectedAddress, setSelectedAddress] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    aadharNumber: '',
    city: '',
    state: '',
    businessName: ' ',
    business_contact_no: '',
    business_whatsapp_no: '',
    businessAddress:
      '',
    landmark: '',
    businessCity: '',
    businessState: '',
    coordinates: { latitude: 19.986978, longitude: 73.784141 },
  });
  const [shopCoordinates, setShopCoordinates] = useState(formData.coordinates);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onRightIconPress = () => {
    Alert.alert(
      'Information',
      'This field requires valid information as per government records',
    );
  };

  // Business type handlers
  const handleBusinessTypeSelect = type => {
    if (!businessTypes.includes(type)) {
      setBusinessTypes([...businessTypes, type]);
    }
    setShowBusinessModal(false);
  };

  const removeBusinessType = type => {
    setBusinessTypes(businessTypes.filter(t => t !== type));
  };

  const tabs = [
    { key: 'personal', label: 'Personal Details' },
    { key: 'business', label: 'Business Details' },
  ];

  const personalFields = [
    {
      key: 'name',
      label: 'Full Name',
      placeholder: 'Enter your name',
      iconName: 'account',
      rightIcon: 'pencil-outline',
      onRightIconPress: onRightIconPress,
      editable: true,
    },
    {
      key: 'email',
      label: 'Email :',
      placeholder: 'Enter your email',
      iconName: 'email',
      keyboardType: 'email-address',
      rightIcon: 'pencil-outline',
      onRightIconPress: onRightIconPress,
      editable: true,
    },
    {
      key: 'mobileNumber',
      label: 'Mobile Number :',
      placeholder: 'Enter mobile number',
      iconName: 'phone',
      keyboardType: 'phone-pad',
      rightIcon: 'information-outline',
      onRightIconPress: onRightIconPress,
      maxLength: 10,
    },
    // {
    //   key: 'aadharNumber',
    //   label: 'Aadhar Number :',
    //   placeholder: 'Enter Aadhar number',
    //   iconName: 'card-account-details',
    //   keyboardType: 'numeric',
    //   rightIcon: 'information-outline',
    //   onRightIconPress: onRightIconPress,
    //   maxLength: 12,
    // },
    {
      key: 'city',
      label: 'City :',
      placeholder: 'Enter your city',
      iconName: 'city',
      rightIcon: 'information-outline',
      onRightIconPress: onRightIconPress,
    },
    {
      key: 'state',
      label: 'State :',
      placeholder: 'Enter your state',
      iconName: 'map-marker',
      rightIcon: 'information-outline',
      onRightIconPress: onRightIconPress,
    },
  ];

  const businessFields = [
    {
      key: 'businessName',
      label: 'Business Name :',
      placeholder: 'Enter business name',
      iconName: 'office-building',
    },
    {
      key: 'business_contact_no',
      label: 'Contact Number :',
      placeholder: 'Enter primary contact number',
      iconName: 'phone',
      keyboardType: 'phone-pad',
      rightIcon: 'pencil-outline',
      onRightIconPress: onRightIconPress,
      maxLength: 10,
      editable: true,
    },
    {
      key: 'business_whatsapp_no',
      placeholder: 'Enter secondary contact number',
      iconName: 'whatsapp',
      keyboardType: 'phone-pad',
      rightIcon: 'pencil-outline',
      onRightIconPress: onRightIconPress,
      maxLength: 10,
      editable: true,
    },
    {
      key: 'businessAddress',
      label: 'Shop Address :',
      placeholder: 'Enter shop address',
      iconName: 'map-marker-radius',
      multiline: true,
      rightIcon: 'information-outline',
      onRightIconPress: onRightIconPress,
    },
    {
      key: 'landmark',
      label: 'Landmark :',
      placeholder: 'Enter nearby landmark',
      iconName: 'book-marker-outline',
      rightIcon: 'information-outline',
      onRightIconPress: onRightIconPress,
    },
    {
      key: 'businessCity',
      label: 'City :',
      placeholder: 'Enter city',
      iconName: 'city',
      rightIcon: 'information-outline',
      onRightIconPress: onRightIconPress,
    },
    {
      key: 'businessState',
      label: 'State :',
      placeholder: 'Enter state',
      iconName: 'map-marker',
      rightIcon: 'information-outline',
      onRightIconPress: onRightIconPress,
    },
  ];

  return (
    <BackgroundWrapper style={{ padding: wp('1') }}>
      {/* <DetailsHeader
        title={
          activeTab === 'personal' ? 'Personal Details' : 'Business Details'
        }
        onBackPress={() => navigation.goBack()}
      /> */}

      <DetailsHeader
        title={headerTitle}
        onBackPress={() => navigation.goBack()}
      />

      <View style={{ marginTop: -hp('0.3%') }}>
        <DynamicTabView
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
        />
      </View>

      {loading ? (
        <Loader />
      ) : (
        <ScrollView
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }>
          {activeTab === 'personal' ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                resizeMode="cover"
              />
              {/* <TouchableOpacity onPress={() => handleChangePhoto()}>
                <AppText
                  style={[
                    styles.changePhotoText,
                    { color: theme.colors.primary },
                  ]}>
                  Change Profile Photo
                </AppText>
              </TouchableOpacity> */}
            </View>
          ) : null}

          {activeTab === 'personal' &&
            personalFields.map(field => (
              <CustomEditField
                key={field.key}
                header={field.label}
                placeholder={field.placeholder}
                value={formData[field.key]}
                onChangeText={text => handleChange(field.key, text)}
                iconName={field.iconName}
                rightIcon={field.rightIcon}
                onRightIconPress={field.onRightIconPress}
                editable={field.editable ?? false}
                keyboardType={field.keyboardType}
                multiline={field.multiline}
                {...(field.minLength !== undefined && {
                  minLength: field.minLength,
                })}
                {...(field.maxLength !== undefined && {
                  maxLength: field.maxLength,
                })}
                containerStyle={{ marginBottom: hp('1.7%'), }}
              />
            ))}

          {activeTab === 'business' && (
            <>
              {businessFields.map(field => (
                <CustomEditField
                  key={field.key}
                  header={field.label}
                  placeholder={field.placeholder}
                  value={formData[field.key]}
                  onChangeText={text => handleChange(field.key, text)}
                  iconName={field.iconName}
                  rightIcon={field.rightIcon}
                  onRightIconPress={field.onRightIconPress}
                  editable={field.editable ?? false}
                  keyboardType={field.keyboardType}
                  multiline={field.multiline}
                  {...(field.minLength !== undefined && {
                    minLength: field.minLength,
                  })}
                  {...(field.maxLength !== undefined && {
                    maxLength: field.maxLength,
                  })}
                  containerStyle={{ marginBottom: hp('1.7%') }}
                />
              ))}
              <View style={{ marginBottom: hp('2%') }}>
                <AppText
                  style={[
                    styles.labelText,
                    { color: theme.colors.text, marginBottom: hp('1%') },
                  ]}>
                  Shop Location{' '}
                  <AppText style={{ color: '#999' }}>(Tap map to select)</AppText>
                </AppText>

                <TouchableOpacity
                  style={{
                    height: hp('20%'),
                    borderRadius: 12,
                    overflow: 'hidden',
                    marginBottom: hp('1%'),
                  }}
                  onPress={() => setLocationModalVisible(true)}>
                  <MapView
                    style={{ flex: 1 }}
                    region={{
                      latitude: shopCoordinates?.latitude || 20.5937, // Default Maharashtra
                      longitude: shopCoordinates?.longitude || 78.9629, // Default Maharashtra
                      latitudeDelta: 1, // Adjusted for wider view of the state
                      longitudeDelta: 1,
                    }}
                    pointerEvents="box-only">
                    {shopCoordinates && (
                      <Marker coordinate={shopCoordinates} pinColor="red" />
                    )}
                  </MapView>
                </TouchableOpacity>

                {shopCoordinates && (
                  <AppText
                    style={{ fontSize: hp('1.6%'), color: theme.colors.text }}>
                    {selectedAddress && `📍 ${selectedAddress}`}
                  </AppText>
                )}
              </View>
              {/* Business Types Section - Matches your image */}
              <View style={styles.businessTypesContainer}>
                <AppText
                  style={[styles.businessLabel, { color: theme.colors.text }]}>
                  Your businesses :
                </AppText>
                <View style={styles.businessTagsContainer}>
                  {businessTypes.map(type => (
                    <View key={type} style={[styles.businessTag,{ backgroundColor: theme.colors.inputBackground }]}>
                      <AppText style={[styles.tagText,{ color: theme.colors.text }]}>{type}</AppText>
                      <TouchableOpacity
                        onPress={() => removeBusinessType(type)}
                        style={styles.removeButton}>
                        <Icon
                          name="close"
                          size={hp('2%')}
                          color={theme.colors.text}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {businessTypes.length < 3 && (
                    <TouchableOpacity
                      style={styles.businessTag}
                      onPress={() => setShowBusinessModal(true)}>
                      <AppText
                        style={[
                          styles.addMoreText,
                          { color: theme.colors.primary },
                        ]}>
                        Add more
                      </AppText>
                      <Ionicons
                        name="add-circle-outline"
                        size={hp('2.5%')}
                        color={theme.colors.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </>
          )}

          <ActionButton label="Save" onPress={handleSave} style={{ marginBottom: wp('10%') }} />
        </ScrollView>
      )}

      {/* Business Type Selection Modal - Matches your design */}
      <Modal
        visible={showBusinessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBusinessModal(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.colors.card },
            ]}>
            <AppText style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select Business Type
            </AppText>

            {availableBusinessTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.modalOption,
                  {
                    borderBottomColor: theme.colors.border,
                    opacity: businessTypes.includes(type) ? 0.6 : 1,
                  },
                ]}
                onPress={() => handleBusinessTypeSelect(type)}
                disabled={businessTypes.includes(type)}>
                <AppText style={{ color: theme.colors.text, fontSize: hp('2%') }}>
                  {type}
                </AppText>
                {businessTypes.includes(type) && (
                  <Icon
                    name="check"
                    size={hp('2.5%')}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowBusinessModal(false)}>
              <AppText
                style={[styles.modalCloseText, { color: theme.colors.primary }]}>
                Close
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <LocationPicker
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        initialCoords={shopCoordinates}
        // onLocationPicked={({coordinate, address}) => {
        //   setShopCoordinates(coordinate);
        //   setSelectedAddress(address);
        // }}

        onLocationPicked={({ coordinate, address }) => {
          setShopCoordinates(coordinate);
          setSelectedAddress(address);
          setFormData(prev => ({
            ...prev,
            address: address,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          }));
        }}
      />
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: wp('5%'),
    paddingBottom: hp('5%'),
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: hp('0%'),
  },
  profileImage: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: hp('7%'),
    borderWidth: 2,
    borderColor: '#ccc',
    elevation: 5,
  },
  changePhotoText: {
    marginTop: hp('1%'),
    fontSize: hp('1.6%'),
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: wp('2%'),
    marginTop: hp('4%'),
    alignItems: 'center',
    paddingVertical: hp('1.7%'),
  },
  saveButtonText: {
    color: '#fff',
    fontSize: hp('2%'),
    fontWeight: 'bold',
  },
  businessTypesContainer: {
    marginBottom: hp('2%'),
  },
  businessLabel: {
    fontSize: hp('1.8%'),
    fontWeight: '500',
    marginBottom: hp('1%'),
  },
  businessTagsContainer: {
    flexDirection: 'column',
    // flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginTop: hp('0.5%'),
  },
  businessTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp('2%'),
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('3%'),
    marginRight: wp('2%'),
    marginBottom: hp('1.5%'),
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    width: '100%',
    justifyContent: 'space-between',
  },

  tagText: {
    marginRight: wp('1%'),
    fontSize: hp('1.8%'),
  },
  removeButton: {
    marginLeft: wp('1%'),
  },
  addMoreText: {
    fontSize: hp('1.7%'),
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: wp('85%'),
    borderRadius: wp('2%'),
    padding: wp('5%'),
  },
  modalTitle: {
    fontSize: hp('2.2%'),
    fontWeight: 'bold',
    marginBottom: hp('2%'),
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp('2%'),
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  modalCloseButton: {
    marginTop: hp('2%'),
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: hp('1.8%'),
    fontWeight: 'bold',
  },
});

export default ProfileDetailsScreen;