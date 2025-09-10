// import React, {useContext, useState} from 'react';
// import {
//   View,

//   StyleSheet,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   SafeAreaView,
// } from 'react-native';
// import AppText from '../components/AppText';
// import {useNavigation} from '@react-navigation/native';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import {DetailsHeader} from '../components/DetailsHeader';
// import {AuthContext} from '../context/AuthContext';
// import BackgroundWrapper from '../components/BackgroundWrapper';

// const allCities = [
//   'Nashik',
//   'Navi Mumbai',
//   'Nagpur',
//   'Nandgaon',
//   'Nanded',
//   'Ahmednagar',
//   'Pune',
//   'Surat',
// ];

// const CitySearchScreen = ({navigation}) => {
//   const {theme} = useContext(AuthContext);
//   const [query, setQuery] = useState('');

//   const filteredCities = allCities.filter(city =>
//     city.toLowerCase().startsWith(query.toLowerCase()),
//   );

//   return (
//     <BackgroundWrapper style={{flex: 1, backgroundColor: theme.colors.background}}>
//       <DetailsHeader title="Search your city" onBackPress={() => navigation.goBack()} />
//       <View style={styles.container}>
//         {/* Header */}
//         {/* <View style={styles.header}>
//         <AppText style={styles.pageTitle}>Search your city</AppText>
//         <AppText style={styles.stepText}>3 / 3</AppText>
//       </View> */}

//         {/* Input Box */}
//         <View
//           style={[styles.searchInputBox, {backgroundColor: theme.colors.card}]}>
//           <TextInput
//             placeholder="Search your city"
//             value={query}
//             onChangeText={setQuery}
//             style={styles.textInput}
//             placeholderTextColor="#666"
//           />
//           <AppText style={styles.searchIcon}>🔍</AppText>
//         </View>

//         {/* Dropdown list */}
//         <FlatList
//           data={filteredCities}
//           keyExtractor={item => item}
//           renderItem={({item}) => (
//             <TouchableOpacity
//               style={[
//                 styles.cityDropdownItem,
//                 {backgroundColor: theme.colors.card},
//               ]}>
//               <AppText
//                 style={{color: theme.colors.placeholder, fontSize: wp('4%')}}>
//                 {item}
//               </AppText>
//             </TouchableOpacity>
//           )}
//         />
//       </View>
//     </BackgroundWrapper>
//   );
// };

// export default CitySearchScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: wp('1%'),
//   },
//   searchInputBox: {
//     flexDirection: 'row',
//     backgroundColor: '#EAF3FF',
//     borderRadius: wp('3%'),
//     paddingVertical: hp('1.2%'),
//     paddingHorizontal: wp('4%'),
//     alignItems: 'center',
//     marginBottom: hp('2%'),
//   },
//   textInput: {
//     flex: 1,
//     fontSize: wp('4%'),
//     color: '#000',
//   },
//   searchIcon: {
//     fontSize: wp('5%'),
//     marginLeft: wp('2%'),
//   },
//   cityDropdownItem: {
//     paddingVertical: hp('1.5%'),
//     paddingHorizontal: wp('4%'),
//     marginVertical: hp('0.5%'),
//     borderRadius: wp('2%'),
//   },
//   cityText: {
//     fontSize: wp('4%'),
//     color: '#333',
//   },
// });
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AppText from '../components/AppText';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { DetailsHeader } from '../components/DetailsHeader';
import { AuthContext } from '../context/AuthContext';
import BackgroundWrapper from '../components/BackgroundWrapper';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/Ionicons';

const CitySearchScreen = ({ navigation }) => {
  const { theme, userID, setcityselected } = useContext(AuthContext);

  const [query, setQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [selectingCity, setSelectingCity] = useState(false);

  const LIMIT = 20;

  const fetchCities = async (searchText = '', pageNum = 1, isLoadMore = false) => {
    if (loading || isFetchingMore) return;

    if (isLoadMore) setIsFetchingMore(true);
    else setLoading(true);

    try {
      const response = await apiClient.get(
        `/api/admin/cityRoute/getdataforall?search=${searchText}&page=${pageNum}&limit=${LIMIT}`
      );

      const cityData = response.data?.data || [];
      const pagination = response.data?.pagination;

      if (pageNum === 1) {
        setCities(cityData);
      } else {
        setCities(prev => [...prev, ...cityData]);
      }

      setPage(pagination?.currentPage || 1);
      setTotalPages(pagination?.totalPages || 1);
    } catch (error) {
      console.error('City Fetch Error:', error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchCities(query, 1);
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchCities(query, 1);
    }, 400);

    return () => clearTimeout(delaySearch);
  }, [query]);

  const loadMore = () => {
    if (page < totalPages && !isFetchingMore) {
      fetchCities(query, page + 1, true);
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
        showToast('success', '', message || 'City selected successfully.');
        setcityselected(true);
      } else if (appCode === 1129) {
        showToast('success', '', 'Your profile has already been completed.');
        setcityselected(true);
      } else {
        showToast('error', '', message || 'Failed to select city.');
      }
    } catch (error) {
      console.error('Select City Error:', error);
      showToast('error', '', 'Something went wrong.');
    } finally {
      setSelectingCity(false);
    }
  };

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: hp('1.5%') }} />;
  };

  return (
    <BackgroundWrapper style={{ flex: 1, backgroundColor: theme.colors.background }}>
           <DetailsHeader title="Select your city" onBackPress={() => navigation.goBack()} stepText="3/3" rightType="steps" />
      <View style={styles.container}>
        <View style={styles.searchInputBox}>
          <TextInput
            placeholder="Search your city"
            value={query}
            onChangeText={setQuery}
            style={styles.textInput}
            placeholderTextColor={theme.colors.primary}
            paddingVertical={wp('0.5%')}
          />
          <Icon name="search" size={wp('6%')} color={theme.colors.primary} />
        </View>

        {(loading || selectingCity) ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: hp('2%') }} />
        ) : (
          <View style={styles.dropdownWrapper}>
            <FlatList
              data={cities}
              keyExtractor={(item, index) => item._id || `${item.city_name}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityDropdownItem}
                  onPress={() => handleCitySelect(item._id, item.city_name)}
                >
                  <AppText style={styles.cityText}>{item.city_name}</AppText>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <AppText style={styles.noResultText}>No cities found.</AppText>
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.2}
              ListFooterComponent={renderFooter}
            />
          </View>
        )}
      </View>
    </BackgroundWrapper>
  );
};

export default CitySearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('1%'),
  },
  searchInputBox: {
    flexDirection: 'row',
    backgroundColor: '#EAF3FF',
    borderRadius: wp('3%'),
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('4%'),
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  textInput: {
    flex: 1,
    fontSize: wp('5%'),
    color: '#000',
  },
  dropdownWrapper: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    paddingVertical: hp('1%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginTop: hp('0.5%'),
  },
  cityDropdownItem: {
    paddingVertical: hp('1.3%'),
    paddingHorizontal: wp('4%'),
  },
  cityText: {
    color: '#000',
    fontSize: wp('4.5%'),
  },
  noResultText: {
    textAlign: 'center',
    marginVertical: hp('2%'),
    color: '#999',
    fontSize: wp('3.8%'),
  },
});
