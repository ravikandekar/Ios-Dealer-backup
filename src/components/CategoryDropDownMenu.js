import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal, // Added
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import AppText from './AppText';
import { categoryIcons } from '../constants/strings';
import { fetchCategories } from '../constants/categoryApi';
import { showToast } from '../utils/toastService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../utils/apiClient';
import { useFormStore } from '../store/formStore';
import { color } from 'react-native-elements/dist/helpers';

const CategoryDropdownMenu = ({
  selectedCategory,
  onSelect,
  headerText = 'Switch Category',
}) => {
  const { theme, userID } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false); // Added state
  const [mainLoading, setMainLoading] = useState(false); // Added state
  const { formData, updateForm } = useFormStore();
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
  const [pendingCategory, setPendingCategory] = useState(null);
  console.log('categories iddddd', categories);

  useEffect(() => {
    loadCategories();
  }, [selectedCategory]);

  const loadCategories = async () => {
    setMainLoading(true);
    try {
      const result = await fetchCategories();
      setCategories(result);
    } catch (error) {
      showToast('error', 'Error loading categories', error?.message || 'Something went wrong.');
    } finally {
      setMainLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId, category_name, isRegistered) => {
    console.log('🔄 Switching category to:', categoryId, category_name);

    if (!categoryId) {
      showToast('error', '', 'No categories found');
      return;
    }

    // ✅ If not registered → open modal
    console.log('categoriesdddd', isRegistered);

    if (isRegistered === false) {
      setPendingCategory({ categoryId, category_name });
      setRegistrationModalVisible(true);
      return;
    }

    // ✅ Else proceed with API
    await switchCategory(categoryId, category_name);
  };

  const switchCategory = async (categoryId, category_name) => {
    setLoading(true);
    try {
      const payload = {
        userId: userID,
        activeCategoryId: categoryId,
      };

      const response = await apiClient.post(
        '/api/dealer/dealercategory/add-active-category',
        payload
      );

      if (response?.data?.appCode === 1000) {
        const data = response.data;
        console.log(
          'response for active category from api',
          data.data.data.activeCategorySubscriptionPlanId
        );

        showToast(
          'success',
          'Category Switched',
          response?.data?.data?.message || 'Updated successfully'
        );
        onSelect(category_name);
        updateForm('subscription_plan', data?.data?.data?.activeCategorySubscriptionPlanId);
        updateForm('category_id', categoryId);
      } else if (response?.data?.appCode === 1003) {
        const validationMsg =
          response?.data?.meta?.errors?.[0]?.message || 'Validation error';
        showToast('error', 'Validation Error', validationMsg);
      } else {
        showToast(
          'error',
          'Failed to switch category',
          response?.data?.message || 'Unexpected response'
        );
      }
    } catch (error) {
      showToast(
        'error',
        'API Error',
        error?.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.backdrop}>

      <View
        style={[
          styles.categoryContainerBox,
          {
            backgroundColor: theme.colors.background,
            shadowColor: theme.colors.text,
          },
        ]}
      >
        <AppText style={[styles.headText, { color: theme.colors.text }]}>
          {headerText}
        </AppText>
        {mainLoading && (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            animating={mainLoading}
          />
        )}
        {categories.map(({ _id, category_name, isActive, isSubscribed ,isRegistered}) => {
          if (!category_name) return null;
          const isSelected = selectedCategory === category_name;
          const IconComponent = categoryIcons[category_name];

          return (
            <View key={_id} style={styles.cardContainer}>

              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  isSelected ? styles.subscribed : styles.notSubscribed,
                ]}
                onPress={() => handleCategorySelect(_id, category_name, isRegistered)}
                disabled={loading} // Disable while loading
              >
                <View style={styles.leftSection}>
                  {IconComponent ? (
                    <IconComponent
                      width={wp('7%')}
                      height={wp('7%')}
                      fill={isSelected ? '#f7941d' : '#ccc'}
                    />
                  ) : (
                    <MaterialIcons
                      name="category"
                      size={wp('7%')}
                      color={isSelected ? '#f7941d' : '#ccc'}
                      style={{ marginRight: 10 }}
                    />
                  )}
                  <View style={{ width: wp('45%') }}>
                    <AppText
                      style={[
                        styles.categoryText,
                        { color: isSelected ? '#f7941d' : '#888' },
                      ]}
                      numberOfLines={1}
                    >
                      {category_name}
                    </AppText>
                    {!isSubscribed && (
                      <AppText style={styles.buyText}>Buy Subscription</AppText>
                    )}
                  </View>
                </View>

                <View style={styles.rightSection}>
                  {isSubscribed && (
                    <AppText style={[styles.statusText, styles.subscribe]}>
                      Subscribed
                    </AppText>
                  )}
                  {loading && isSelected ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                      style={{ marginLeft: 5 }}
                    />
                  ) : (
                    <MaterialIcons
                      name="check-circle"
                      size={wp('5%')}
                      color={isSelected ? '#f7941d' : '#ccc'}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backdropContainer}>
          <AppText style={styles.easilyToggleText}>
            Easily toggle between Cars, Bikes or Spareparts & accessories and see
            only what matters to you.
          </AppText>

          <AppText style={styles.whatChangeText}>
            <AppText style={styles.backdropHeadText}>
              What Changes When You Switch Category?{'\n\n'}
            </AppText>
            <AppText style={styles.backdropHeadText}>
              1. Dashboard Updates{'\n'}
            </AppText>
            See insights, quick stats, and tools relevant to the selected category.{'\n\n'}
            <AppText style={styles.backdropHeadText}>
              2. Listing Details Adjusted{'\n'}
            </AppText>
            Manage and view listings specific to your selected type.{'\n\n'}
            <AppText style={styles.backdropHeadText}>
              3. My Assets Refreshed{'\n'}
            </AppText>
            Inventory view shows only Cars, Bikes, or Spares - Accessories - based
            on your selection.
          </AppText>
        </View>
      </ScrollView>
     <Modal
  visible={registrationModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setRegistrationModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
      {/* Close Icon */}
      <TouchableOpacity
        style={styles.closeIcon}
        onPress={() => setRegistrationModalVisible(false)}
      >
        <Icon name="close" size={18} color={theme.colors.primary} />
      </TouchableOpacity>

      {/* Message */}
      <AppText style={[styles.modalMessage, { color: theme.colors.text }]}>
        Do you want to register as a <AppText style={{ fontWeight: 'bold' }}>{pendingCategory?.category_name}</AppText> dealer?
      </AppText>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setRegistrationModalVisible(false)}
        >
          <AppText style={[styles.cancelText, { color: theme.colors.text }]}>
            Cancel
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.proceedButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => {
            setRegistrationModalVisible(false);
            if (pendingCategory) {
              switchCategory(
                pendingCategory.categoryId,
                pendingCategory.category_name
              );
            }
          }}
        >
          <AppText style={styles.proceedText}>Proceed</AppText>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>


    </View>
  );
};

export default CategoryDropdownMenu;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#055597D9',
    height: hp('100%'),
    zIndex: 999,
    paddingBottom: hp('12%'),
  },
  backdropContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatChangeText: {
    width: wp('85%'),
    marginTop: hp('4%'),
    alignSelf: 'center',
    textAlign: 'left',
    fontSize: wp('4%'),
    color: '#E4E4E4',
    lineHeight: 20,
  },
  backdropHeadText: {
    width: wp('85%'),
    marginTop: hp('2.5%'),
    alignSelf: 'center',
    textAlign: 'left',
    fontSize: 18,
    color: '#E4E4E4',
    lineHeight: 23,
    paddingHorizontal: 4,
    fontWeight: '700',
  },
  easilyToggleText: {
    width: wp('85%'),
    marginTop: hp('2.5%'),
    alignSelf: 'center',
    textAlign: 'left',
    fontSize: 18,
    color: '#E4E4E4',
    lineHeight: 23,
    paddingHorizontal: 4,
    fontWeight: '700',
  },
  categoryContainerBox: {
    flexDirection: 'column',
    height: wp('90%'),
    borderBottomLeftRadius: wp('8%'),
    borderBottomRightRadius: wp('8%'),
    paddingTop: wp('5%'),
    paddingHorizontal: 20,
    zIndex: 999,
  },
  headText: {
    fontWeight: 'bold',
    fontSize: wp('7%'),
    marginBottom: 10,
  },
  cardContainer: {
    marginTop: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
    height: 62,
  },
  subscribe: {
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.4'),
    backgroundColor: '#FFC73A',
    color: '#000',
    borderRadius: wp('1.4%'),
  },
  subscribed: {
    borderColor: '#f7941d',
  },
  notSubscribed: {
    borderColor: '#ccc',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    marginRight: 10,
    width: 22,
    height: 22,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  buyText: {
    fontSize: 12,
    color: '#aaa',
  },
  statusText: {
    fontSize: 12,
    color: '#888',
    marginRight: 5,
  },
  checkIcon: {
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
    marginTop: hp('2%'),
  },
  scrollContent: {
    paddingBottom: hp('6%'),
  },
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.6)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  width: '85%',
  borderRadius: 20,
  padding: 24,
  elevation: 10,
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 6,
  alignItems: 'center',
},
closeIcon: {
  position: 'absolute',
  right: 14,
  top: 14,
  padding: 6,
  borderRadius: 20,
  backgroundColor: 'rgba(0,0,0,0.05)',
},
modalMessage: {
  fontSize: wp('4.8%'),
  fontWeight: '500',
  textAlign: 'center',
  marginVertical: hp('1%'),
  marginTop: hp('3%'),
},
actions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: hp('1%'),
},
button: {
  flex: 1,
  marginHorizontal: 6,
  paddingVertical: hp('1.8%'),
  borderRadius: 12,
  alignItems: 'center',
},
cancelButton: {
  backgroundColor: '#f1f1f1',
},
proceedButton: {
  backgroundColor: '#f7941d', // fallback, overridden by theme.colors.primary
},
cancelText: {
  fontSize: wp('3.8%'),
  fontWeight: '500',
},
proceedText: {
  color: '#fff',
  fontSize: wp('4%'),
  fontWeight: '700',
},

});
