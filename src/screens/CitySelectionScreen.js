import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AppText from '../components/AppText';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { DetailsHeader } from '../components/DetailsHeader';
import { AuthContext } from '../context/AuthContext';
import BackgroundWrapper from '../components/BackgroundWrapper';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/Ionicons';

const CitySelectionScreen = ({ navigation }) => {
  const { theme, setcityselected, userID } = useContext(AuthContext);
  const [topCities, setTopCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectingCity, setSelectingCity] = useState(false);

  useEffect(() => {
    fetchTopCities();
  }, []);

  const fetchTopCities = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/cityRoute/gettopcities');
      const cities = response?.data?.data?.city || [];
      setTopCities(cities);
    } catch (error) {
      console.error('Top Cities Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = async (cityId, cityName) => {
    setSelectingCity(true);

    try {
      const response = await apiClient.post(
        `/api/dealer/auth/select-city-dealers/${userID}`,
        { cityId }
      );

      const { appCode, message } = response.data;

      if (appCode === 1000) {
        showToast('success', '', message || `City "${cityName}" selected.`);
        setcityselected(true);
      } else if (appCode === 1129) {
        showToast('success', '', 'Your profile has already been completed.');
        setcityselected(true);
      } else {
        showToast('error', '', message || 'Failed to select city.');
      }
    } catch (error) {
      console.error('Select City Error:', error);
      const msg = error?.response?.data?.message || 'Something went wrong.';
      showToast('error', '', msg);
    } finally {
      setSelectingCity(false);
    }
  };

  return (
    <BackgroundWrapper style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View>
        <DetailsHeader title="Select your city" onBackPress={() => navigation.goBack()} stepText="3/3" rightType="steps" leftComponentIcon={false} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Search box */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.searchBox}
          onPress={() => navigation.navigate('CitySearchScreen')}
        >
          <AppText style={{ fontSize: wp('4.4%'), color: theme.colors.primary, paddingVertical: wp('1%') }}>
            Select for City
          </AppText>
          <Icon name="search" size={wp('6%')} color={theme.colors.primary} />
        </TouchableOpacity>


        {/* Grid of featured cities */}
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: hp('3%') }} />
        ) : (
          <FlatList
            data={topCities}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.gridContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cityCard}
                onPress={() => handleCitySelect(item._id, item.city_name)}
                disabled={selectingCity}
              >
                <View style={styles.imageShadowWrapper}>
                  <Image source={{ uri: item.image }} style={styles.cityImage} />
                </View>
                <AppText style={styles.cityName}>{item.city_name}</AppText>
              </TouchableOpacity>

            )}
          />
        )}

        {/* More Cities
        <AppText style={[styles.moreLabel, { color: theme.colors.text }]}>More Cities</AppText>
        <AppText style={[styles.nearYouText, { color: theme.colors.placeholder }]}>Near to your Location</AppText>
        {Array(5)
          .fill('Ahmednagar')
          .map((city, index) => (
            <AppText key={index} style={styles.cityTextFaded}>
              {city}
            </AppText>
          ))} */}
      </ScrollView>
    </BackgroundWrapper>
  );
};

export default CitySelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: wp('1%'),
  },
  searchBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EAF3FF',
    borderRadius: wp('3%'),
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('4%'),
    marginBottom: hp('2%'),
  },
  searchIcon: {
    fontSize: wp('5%'),
  },
  gridContainer: {
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  cityCard: {
    width: wp('28%'),
    alignItems: 'center',
    margin: wp('1.8%'),
  },

  imageShadowWrapper: {
    width: wp('28%'),
    height: wp('20%'),
    borderRadius: wp('3%'),
    backgroundColor: '#fff',

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // Android shadow
    elevation: 4,

    overflow: Platform.OS === 'ios' ? 'visible' : 'hidden',
  },

  cityImage: {
    width: '100%',
    height: '100%',
    borderRadius: wp('3%'),
    resizeMode: 'cover',
  },
  cityName: {
    marginTop: hp('0.5%'),
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#F68B1E',
    textTransform: 'capitalize',
  },
  moreLabel: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    marginTop: hp('2%'),
  },
  nearYouText: {
    fontSize: wp('3.6%'),
    marginTop: hp('0.5%'),
    color: '#999',
  },
  cityTextFaded: {
    fontSize: wp('3.5%'),
    color: '#ccc',
    marginTop: hp('0.8%'),
  },
});
