import React, { useEffect, useState, useContext, use } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AppText from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import ActionButton from '../components/ActionButton';
import WaveBackground from '../components/WaveBackground';
import Loader from '../components/Loader';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';

// Images
import carImage from '../../public_assets/media/images/Car_Banner_Image.png';
import bikeImage from '../../public_assets/media/images/Bike_Banner_Image.png';
import sparesImage from '../../public_assets/media/images/SpareParts_Banner_Image.png';

const imageMap = {
  'Car': carImage,
  'Bike': bikeImage,
  'Spare Part Accessories': sparesImage, 
};

const RegisterDealer = ({ name = 'User' }) => {
  const { theme, setregister, userID, userName, register } = useContext(AuthContext);
  console.log('User ID in RegisterDealer:', register);

  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  console.log('Selected IDs:', selectedIds);

  // ✅ Fetch Categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/api/admin/categoryRoute/getdata');
        const all = res?.data?.data?.categories || [];
        setCategories(all);
      } catch (err) {
        showToast('error', '', err?.response?.data?.message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ✅ Toggle Selection
  const toggleSelection = id => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // ✅ Submit Selected Categories
  const handleSubmit = async () => {
    if (!selectedIds.length) {
      showToast('error', '', 'Please select at least one category.');
      return;
    }

    if (!userID) {
      showToast('error', '', 'User ID not found.');
      return;
    }

    const payload = {
      userId: userID,
      categoryIds: selectedIds,
    };

    setLoading(true);
    try {
      const response = await apiClient.post('/api/dealer/dealercategory/add-categories', payload);
      console.log('Category Submission Response:', response.data);
      

      if (response?.data?.success) {
        showToast('success', '', response?.data?.data?.message || 'Categories added successfully.');
        setregister(true);
      } else {
        showToast('error', '', response?.data?.message || 'Something went wrong.');
        console.log('Error in category submission:', response.data);
        
      }
    } catch (err) {
      showToast('error', '', err?.response?.data?.message || 'Error submitting categories');
      console.error('Category Submission Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <Loader visible={loading} />

      <View style={styles.header}>
        <AppText style={[styles.greeting, { color: theme.colors.text }]}>Hii, {userName}</AppText>
        <AppText style={[styles.pagenavigate, { color: theme.colors.placeholder }]}>4/4</AppText>
      </View>

      <AppText style={styles.subtitle}>Select the categories you deal in:</AppText>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {categories.map(cat => {
          const isSelected = selectedIds.includes(cat._id);
          return (
            <TouchableOpacity
              key={cat._id}
              style={[
                styles.card,
                {
                  borderColor: isSelected ? '#055597' : '#ccc',
                  backgroundColor: '#E6F2FE',
                },
              ]}
              onPress={() => toggleSelection(cat._id)}
              activeOpacity={0.8}
            >
              <View style={StyleSheet.absoluteFill}>
                <WaveBackground />
              </View>

              <View style={styles.checkmarkContainer}>
                {isSelected && (
                  <MaterialIcons name="check-circle" size={24} color="#055597" />
                )}
              </View>

              <View style={styles.cardContent}>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.cardTitle}>
                    {`Register as\n${cat.category_name} Dealer`}
                  </AppText>
                </View>
                <Image
                  source={imageMap[cat.category_name] || carImage}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          );
        })}

        <AppText style={[styles.footerNote, { color: theme.colors.placeholder }]}>
          You can select one or multiple options. These can be updated later from your profile—and you can always add more categories in the future.
        </AppText>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: wp('8') }}>
        <ActionButton
          label="Confirm"
          style={styles.confirmButton}
          onPress={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
};

export default RegisterDealer;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('8%'),
  },
  header: {
    marginTop: hp('2%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: hp('2.5%'),
    fontWeight: '600',
    textTransform:'capitalize'
  },
  subtitle: {
    marginTop: hp('1%'),
    fontSize: hp('1.8%'),
    color: '#666',
    marginBottom: hp('2%'),
  },
  scrollContainer: {
    gap: hp('1.5%'),
    paddingBottom: hp('2%'),
  },
  card: {
    borderWidth: 1.5,
    borderRadius: wp('3%'),
    padding: wp('4%'),
    position: 'relative',
    overflow: 'hidden',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: wp('3%'),
    right: wp('3%'),
    zIndex: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
  },
  cardTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#101010',
  },
  image: {
    width: wp('40%'),
    height: hp('12%'),
    transform: [{ scaleX: -1 }],
  },
  footerNote: {
    fontSize: hp('1.7%'),
    textAlign: 'center',
    marginTop: hp('2%'),
    lineHeight: hp('2.2%'),
  },
  confirmButton: {
    alignSelf: 'center',
    width: wp('90%'),
    height: hp('6%'),
    position: 'absolute',
    bottom: hp('1.5%'),
    left: wp('5%'),
    right: wp('5%'),
  },
    pagenavigate: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
