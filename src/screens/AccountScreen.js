import { StyleSheet, View, ScrollView, Text, Linking, InteractionManager } from 'react-native';
import React, { useContext, useState } from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { DetailsHeader } from '../components/DetailsHeader';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import InfoBanner from '../components/InfoBanner';
import DeleteAccountModal from '../components/DeleteAccountModal';
import {
  appearance,
  deleteIcon,
  faqs,
  feedbackRatings,
  inventory,
  logout,
  privacyPolicy,
  profileIcon,
  subscriptions,
  supportTickets,
  termsCondition,
} from '../../public_assets/media';
import LogoutModal from '../components/LogoutModal';
import BackgroundWrapper from '../components/BackgroundWrapper';
import FeedbackModal from '../components/FeedbackModal';
import ThemeToggleModal from '../components/ThemeToggleModal';
import { config } from '../constants/config';
import { removeToken } from '../utils/storage';
import { triggerLogout } from '../utils/LogoutFunction';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';

const iconStyle = {
  width: wp('7%'),
  height: wp('7%'),
};

// const bannerItems = [
//   {title: 'Profile Details', imageName: profileIcon, iconName:'user', imageIconStyle: iconStyle},
//   {title: 'Subscriptions', imageName: subscriptions, imageIconStyle: iconStyle},
//   {title: 'My Inventory', imageName: inventory, imageIconStyle: iconStyle},
//   {title: 'Appearance', imageName: appearance, imageIconStyle: iconStyle},
//   {title: 'Feedback & Ratings', imageName: feedbackRatings, imageIconStyle: iconStyle},
//   {title: 'FAQs', imageName: faqs, imageIconStyle: iconStyle},
//   {title: 'Terms & Conditions', imageName: termsCondition, imageIconStyle: iconStyle},
//   {title: 'Privacy Policy', imageName: privacyPolicy, imageIconStyle: iconStyle},
//   {title: 'Support Tickets', imageName: supportTickets, imageIconStyle: iconStyle},
// ];

const bannerItems = [
  {
    title: 'Profile Details',
    imageName: profileIcon,
    iconName: 'user-circle',
    iconType: 'fontA5',
    imageIconStyle: iconStyle,
  },
  {
    title: 'Subscriptions',
    imageName: subscriptions,
    iconName: 'subscriptions',
    iconType: 'material',
    imageIconStyle: iconStyle,
  },
  {
    title: 'My Inventory',
    imageName: inventory,
    iconName: 'clipboard-check-outline',
    iconType: 'materialCI',
    imageIconStyle: iconStyle,
  },
  {
    title: 'Appearance',
    imageName: appearance,
    iconName: 'white-balance-sunny',
    iconType: 'materialCI',
    imageIconStyle: iconStyle,
  },
  {
    title: 'Feedback & Ratings',
    imageName: feedbackRatings,
    iconName: 'star-outline',
    iconType: 'materialCI',
    imageIconStyle: iconStyle,
  },
  {
    title: 'FAQs',
    imageName: faqs,
    iconName: 'help-circle-outline',
    iconType: 'materialCI',
    imageIconStyle: iconStyle,
  },
  {
    title: 'Terms & Conditions',
    imageName: termsCondition,
    iconName: 'file-document-edit-outline',
    iconType: 'materialCI',
    imageIconStyle: iconStyle,
  },
  {
    title: 'Privacy Policy',
    imageName: privacyPolicy,
    iconName: 'shield-key-outline',
    iconType: 'materialCI',
    imageIconStyle: iconStyle,
  },
  {
    title: 'Support Tickets',
    imageName: supportTickets,
    iconName: 'headset',
    iconType: 'materialCI',
    imageIconStyle: iconStyle,
  },
  {
    title: 'Tutorial',
    imageName: supportTickets,
    iconName: 'cast',
    iconType: 'materialCI',
    imageIconStyle: iconStyle,
  },
  {
    title: 'Logout',
    imageName: logout,
    iconName: 'log-out',
    iconType: 'feather',
    imageIconStyle: iconStyle,
  },
  {
    title: 'Delete Account',
    imageName: deleteIcon,
    iconName: 'trash-can-outline',
    iconType: 'materialCI',
    imageIconStyle: iconStyle,
    isDestructive: true,
  },
  {
    title: 'Mark Attendance',
    imageName: deleteIcon,
    iconName: 'checkbox-marked-outline',
    iconType: 'materialCI',
    imageIconStyle: iconStyle,
  },
];
const AccountScreen = () => {
  const { theme, isDark, toggleTheme,userID ,userName} = useContext(AuthContext);
  const navigation = useNavigation();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [showThemeModal, setsShowThemeModal] = useState(false);

  const fetchCMSContentAndNavigate = async type => {
    try {
      const endpoint =
        type === 'terms'
          ? '/api/cms/dealertcRoutes/get_termsandconditions_by_dealer'
          : '/api/cms/dealerPrivacyPolicyRoutes/get_privacypolicies_by_dealer';

      const response = await apiClient.get(endpoint);
      const data = response?.data?.data;

      if (data) {
        navigation.navigate('CMSWebViewScreen', {
          title: data.title,
          htmlContent: data.description,
        });
      } else {
        console.warn(`${type} content not found`);
        showToast('error', '', `No ${type === 'terms' ? 'Terms' : 'Privacy'} content found.`);
      }
    } catch (error) {
      console.error(`${type} fetch failed`, error);
      showToast('error', '', `Failed to load ${type === 'terms' ? 'Terms' : 'Privacy Policy'}.`);
    }
  };

  const handleDelete = async (reason) => {
    try {
      console.log('Delete Pressed', reason);

      // Reason validation
      if (!reason || reason.trim() === '') {
        showToast('error', '', 'Please provide a reason for account deletion.');
        return;
      }

      const response = await apiClient.put('/api/dealer/auth/isdelete_account_by_delaer', {
        reason: reason,
      });

      const { success, message, appCode } = response?.data || {};

      if (appCode === 1000) {
        // Success case
        showToast('success', '', message || 'Account deleted successfully.');
        triggerLogout(); // <- Logout the user
      } else if (appCode === 1023) {
        // User not found
        showToast('error', '', 'User not found. Please try logging in again.');
        triggerLogout(); // Optional: force logout if user doesn't exist
      } else {
        // Generic failure
        showToast('error', '', message || 'Failed to delete account.');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      showToast('error', '', 'Something went wrong while deleting the account.');
    }
  };
  const alllogout = () => {
    InteractionManager.runAfterInteractions(() => {
      setLogoutModalVisible(false);
    });
    triggerLogout();
    console.log('User logged out');
  }

  return (
    <BackgroundWrapper style={{ padding: wp('1%') }}>
      <DetailsHeader title="Accounts" onBackPress={() => navigation.goBack()} />
      <DeleteAccountModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onDelete={handleDelete}
        productTitle="User Account"
      />
      <LogoutModal
        visible={logoutModalVisible}
        onClose={() => InteractionManager.runAfterInteractions(() => {
          setLogoutModalVisible(false);
        })}

        onConfirm={() => {
          InteractionManager.runAfterInteractions(() => {
            setLogoutModalVisible(false);
          });
          alllogout()
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.listWrapper}>
          {bannerItems.map((item, index) => {
            const handlePress = () => {
              if (item.title === 'Profile Details') {
                navigation.navigate('ProfileDetailsScreen');
              } else if (item.title === 'My Inventory') {
                navigation.navigate('InventoryScreen');
              } else if (item.title === 'Subscriptions') {
                navigation.navigate('SubscriptionScreen');
              } else if (item.title === 'Delete Account') {
                setDeleteModalVisible(true);
              } else if (item.title === 'Logout') {
                InteractionManager.runAfterInteractions(() => {
                  setLogoutModalVisible(true);
                });
              } else if (item.title === 'Feedback & Ratings') {
                setFeedbackVisible(true);
              }  else if (item.title === 'Terms & Conditions') {
                fetchCMSContentAndNavigate('terms');
              } else if (item.title === 'Privacy Policy') {
                fetchCMSContentAndNavigate('privacy');
              } else if (item.title === 'FAQs') {
                navigation.navigate('FAQScreen');
              } else if (item.title === 'Support Tickets') {
                navigation.navigate('TicketListScreen');
              } 
              // else if (item.title === 'LoginEx') {
              //   navigation.navigate('LoginExtra');
              // } 
              else if (item.title === 'Tutorial') {
                navigation.navigate('TutorialScreen');
              }
              else if (item.title === 'Mark Attendance') {
                setsShowThemeModal(true);
              }
               else {
                console.log(`${item.title} pressed`);
              }
            };
            return (
              <InfoBanner
                key={index}
                iconName={item.iconName}
                iconType={item.iconType}
                // imageName={item.imageName}
                iconColor={theme.colors.text}
                title={item.title}
                bgColor={theme.colors.card}
                useThemeColor={true}
                rightsideiconcolor={theme.colors.text}
                isDestructive={item.isDestructive || false}
                imageIconStyle={iconStyle}
                customStyle={{
                  width: wp('90%'),
                  height: hp('6%'),
                  marginTop: hp('1.2%'),
                  borderRadius: wp('3%'),
                  backgroundColor: theme.colors.card,
                  paddingRight: wp('3%'),
                }}
                onPress={handlePress}
                rightsideswitch={item.title === 'Appearance' ? true : false}
                switchValue={isDark}
                onSwitchChange={ toggleTheme}
              />
            );
          })}
        </View>
      </ScrollView>
      <FeedbackModal
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
      />
      <ThemeToggleModal
        visible={showThemeModal}
        onClose={() => setsShowThemeModal(false)}
        isDark={isDark}
        toggleTheme={toggleTheme}
        name={userName}
        userid={userID}
      />
    </BackgroundWrapper>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {},
  listWrapper: {
    margin: hp('2%'),
    paddingBottom: hp('5%'),
    alignItems: 'center',
  },
  logDelContainer: {
    marginTop: hp('4%'),
  },
});