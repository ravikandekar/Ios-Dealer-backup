import React, { useContext, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import { DetailsHeader } from '../components/DetailsHeader';
import CustomEditField from '../components/CustomEditField';
import ActionButton from '../components/ActionButton';
import LocationPicker from '../components/LocationPicker';
import MapView, { Marker } from 'react-native-maps';
import AppText from '../components/AppText';
import apiClient from '../utils/apiClient';
import Loader from '../components/Loader';
import { showToast } from '../utils/toastService';
import LocationSearchInput from '../components/LocationSearchInput';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Scroll } from 'lucide-react-native';
const RegistrationBDScreen = ({ navigation }) => {
  const { theme, userID, setBussinessdetails } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    shopName: '',
    contactNumber: '',
    whatsappNumber: '',
    address: '',
    landmark: '',
  });

  const [shopCoordinates, setShopCoordinates] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [sameAsContact, setSameAsContact] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'contactNumber' && sameAsContact
        ? { whatsappNumber: value }
        : {}),
    }));
  };

  const handleSaveBusinessDetails = async () => {
    if (!userID) return showToast('error', '', 'User ID missing');

    if (!formData.shopName || !formData.contactNumber || !formData.address) {
      return showToast('error', '', 'Please fill in all required fields');
    }

    try {
      setLoading(true);
      const payload = {
        business_name: formData.shopName,
        address: formData.address,
        business_contact_no: formData.contactNumber,
        business_whatsapp_no: formData.whatsappNumber,
        landmark: formData.landmark,
        coordinates: shopCoordinates,
      };

      const response = await apiClient.post(
        `/api/dealer/auth/complete-business/${userID}`,
        payload
      );

      const { appCode, message } = response.data;
      if (appCode === 1000) {
        showToast('success', '', message || 'Business details saved');
        navigation.navigate('RegisterDealer');
      } else if (appCode === 1006) {
        showToast('error', '', 'Your profile is already completed.');
        setBussinessdetails(true);
      } else {
        showToast('error', '', message || 'Submission failed');
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        'Something went wrong';
      showToast('error', '', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <View style={styles.container}>
      <AppText style={[styles.subtitle, { color: theme.colors.placeholder }]}>
        Help us understand your business better.
      </AppText>

      <CustomEditField
        header={<AppText style={[styles.labelText, { color: theme.colors.text }]}>Shop Name</AppText>}
        placeholder="Your business or shop's registered name"
        value={formData.shopName}
        onChangeText={text => handleChange('shopName', text)}
        iconName="store"
        maxLength={50}
      />

      <CustomEditField
        header={<AppText style={[styles.labelText, { color: theme.colors.text }]}>Business Contact Number</AppText>}
        placeholder="Business Contact Number"
        value={formData.contactNumber}
        onChangeText={text => handleChange('contactNumber', text)}
        iconName="phone"
        keyboardType="phone-pad"
        maxLength={10}
      />

      <View style={styles.checkboxContainer}>
        <CheckBox
          value={sameAsContact}
          onValueChange={value => {
            setSameAsContact(value);
            if (value) {
              handleChange('whatsappNumber', formData.contactNumber);
            }
          }}
          boxType="square"
          tintColors={{ true: theme.colors.primary, false: '#aaa' }}
          style={styles.checkbox}
        />
        <AppText style={[styles.checkboxText, { color: theme.colors.text }]}>
          WhatsApp number is the same as Contact number.
        </AppText>
      </View>

      {!sameAsContact && (
        <CustomEditField
          header={<AppText style={[styles.labelText, { color: theme.colors.text }]}>WhatsApp Number</AppText>}
          placeholder="Enter your WhatsApp number"
          value={formData.whatsappNumber}
          onChangeText={text => handleChange('whatsappNumber', text)}
          iconName="whatsapp"
          keyboardType="phone-pad"
          maxLength={10}
        />
      )}

      <AppText style={[styles.labelText, { color: theme.colors.text, marginBottom: hp('1%') }]}>
        Shop Address
      </AppText>

      <LocationSearchInput
        onLocationSelected={({ coordinate, address }) => {
          setShopCoordinates(coordinate);
          setSelectedAddress(address);
          setFormData(prev => ({
            ...prev,
            address,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          }));
        }}
      />

      <View style={{ marginBottom: hp('2%') }}>
        <AppText style={[styles.labelText, { color: theme.colors.text, marginBottom: hp('1%') }]}>
          Shop Location <AppText style={{ color: '#999' }}>(Tap map to select)</AppText>
        </AppText>

        <TouchableOpacity
          style={{ height: hp('20%'), borderRadius: 12, overflow: 'hidden', marginBottom: hp('1%') }}
          onPress={() => setLocationModalVisible(true)}>
          <MapView
            style={{ flex: 1 }}
            region={{
              latitude: shopCoordinates?.latitude || 20.5937,
              longitude: shopCoordinates?.longitude || 78.9629,
              latitudeDelta: 0.002,
              longitudeDelta: 0.002,
            }}
            pointerEvents="box-only"
          >
            {shopCoordinates && <Marker coordinate={shopCoordinates} pinColor="red" />}
          </MapView>
        </TouchableOpacity>

        {shopCoordinates && selectedAddress && (
          <AppText style={{ fontSize: hp('1.6%'), color: theme.colors.text }}>📍 {selectedAddress}</AppText>
        )}
      </View>

      <CustomEditField
        header={
          <View style={styles.optionalLabel}>
            <AppText style={[styles.labelText, { color: theme.colors.text }]}>Landmark</AppText>
            <AppText style={styles.optionalText}>(Optional)</AppText>
          </View>
        }
        placeholder="Any nearby or notable landmark"
        value={formData.landmark}
        onChangeText={text => handleChange('landmark', text)}
        iconName="map-marker"

      />
      {/* Landmark Field - Regular TextInput */}
      {/* <View style={styles.fieldContainer}>
        <AppText style={[styles.labelText, { color: theme.colors.text, marginBottom: hp('1%') }]}>
          Landmark <AppText style={{ color: '#999', fontSize: hp('1.6%'), fontWeight: '400' }}>(Optional)</AppText>
        </AppText>

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
          <Icon
            name="map-marker"
            size={wp('6%')}
            color={theme.colors.placeholder}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.textInput, { color: theme.colors.text }]}
            placeholder="Any nearby or notable landmark"
            placeholderTextColor={theme.colors.placeholder}
            value={formData.landmark}
            onChangeText={text => handleChange('landmark', text)}
            maxLength={100}
          />
        </View>
      </View> */}

      <View style={styles.checkboxContainer}>
        <CheckBox
          value={agreeTerms}
          onValueChange={setAgreeTerms}
          boxType="square"
          tintColors={{ true: theme.colors.primary, false: '#aaa' }}
          style={styles.checkbox}
        />
        <AppText style={[styles.checkboxText, { color: theme.colors.text }]}>
          To ensure platform security and user trust, all uploaded information must be accurate  and truthful, in accordance with our Privacy Policy & Terms & Conditions.
        </AppText>
      </View>

      <ActionButton
        label="Save"
        style={{ height: hp('6%'), width: wp('90%') }}
        disabled={!agreeTerms || loading}
        onPress={handleSaveBusinessDetails}
      />

      <LocationPicker
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        initialCoords={shopCoordinates}
        onLocationPicked={({ coordinate, address }) => {
          setShopCoordinates(coordinate);
          setFormData(prev => ({
            ...prev,
            address,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          }));
        }}
      />

      <Loader visible={loading} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <DetailsHeader
        title="Business Details"
        rightType="steps"
        stepText="3/4"
        stepTextColor="#999"
        stepTextBg={theme.colors.background}
        divider={false}
        leftComponentIcon={false}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: hp('5%') }}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={[1]} // dummy single item to trigger render
          keyExtractor={() => 'form'}
          renderItem={renderForm}
          // keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: hp('5%') }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegistrationBDScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('5%'),
  },
  subtitle: {
    fontSize: hp('1.8%'),
    marginBottom: hp('2%'),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp('2.5%'),
  },
  checkbox: {
    width: wp('5%'),
    height: wp('5%'),
    marginTop: hp('0.5%'),
  },
  checkboxText: {
    fontSize: hp('1.7%'),
    marginLeft: wp('2%'),
    flex: 1,
    flexWrap: 'wrap',
    textAlign: 'justify',
  },
  labelText: {
    fontSize: hp('2%'),
    fontWeight: '600',
  },
  optionalLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionalText: {
    fontSize: hp('1.6%'),
    color: '#888',
  },
  fieldContainer: {
    marginBottom: hp('2%'),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    minHeight: hp('5.5%'),
  },
  inputIcon: {
    marginRight: wp('3%'),
  },
  textInput: {
    flex: 1,
    fontSize: wp('4.5%'),
    minHeight: hp('3%'),
    padding: 0,
  },
});

