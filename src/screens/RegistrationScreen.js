

// import React, { useContext, useEffect, useState } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   Modal,
//   Pressable,
//   PermissionsAndroid,
//   Platform,
//   Linking,
// } from 'react-native';
// import { launchCamera } from 'react-native-image-picker';
// import ImageResizer from 'react-native-image-resizer';
// import RNFS from 'react-native-fs';
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { AuthContext } from '../context/AuthContext';
// import { DetailsHeader } from '../components/DetailsHeader';
// import CustomEditField from '../components/CustomEditField';
// import ActionButton from '../components/ActionButton';
// import { showToast } from '../utils/toastService';
// import apiClient from '../utils/apiClient';
// import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
// import PermissionSettingsModal from '../components/PermissionSettingsModal';
// import { AppState } from 'react-native';
// const RegistrationScreen = ({ navigation }) => {
//   const { theme, setProfileCompleted, userID,setUserName } = useContext(AuthContext);
//   const [imageUri, setImageUri] = useState(null);
//   const [compressedImageUri, setCompressedImageUri] = useState(null);
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [modalVisible, setModalVisible] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [settingsModalVisible, setSettingsModalVisible] = useState(false);


//     const fetchCMSContentAndNavigate = async (type) => {
//     try {
//       const endpoint =
//         type === 'terms'
//           ? '/api/cms/dealertcRoutes/get_termsandconditions_by_dealer'
//           : '/api/cms/dealerPrivacyPolicyRoutes/get_privacypolicies_by_dealer';

//       const response = await apiClient.get(endpoint);
//       const data = response?.data?.data;

//       if (data) {
//         navigation.navigate('CMSWebViewScreen', {
//           title: data.title,
//           htmlContent: data.description,
//         });
//       } else {
//         showToast('error', '', `No ${type === 'terms' ? 'Terms' : 'Privacy'} content found.`);
//       }
//     } catch (error) {
//       showToast('error', '', `Failed to load ${type === 'terms' ? 'Terms' : 'Privacy Policy'}.`);
//     }
//   };
//   const compressImage = async uri => {
//     try {
//       let compressQuality = 80;
//       let result;

//       while (compressQuality >= 20) {
//         result = await ImageResizer.createResizedImage(uri, 800, 800, 'JPEG', compressQuality);
//         const exists = await RNFS.exists(result.uri);
//         if (!exists) break;
//         const fileInfo = await RNFS.stat(result.uri);
//         if (fileInfo.size <= 500000) {
//           return result.uri;
//         }
//         compressQuality -= 10;
//       }

//       return result?.uri || uri;
//     } catch (error) {
//       console.error('Compression error:', error);
//       showToast('error', '', 'Failed to compress image');
//       return uri;
//     }
//   };


// useEffect(() => {
//   const subscription = AppState.addEventListener("change", async state => {
//     if (state === "active") {
//       // 🔄 Re-check camera + storage permissions 
//       const granted = await requestCameraAndStoragePermissions();
//       if (granted) {
//         setSettingsModalVisible(false); // ✅ auto-close modal when fixed in settings
//       }
//     }
//   });

//   return () => subscription.remove();
// }, []);
//  const requestCameraAndStoragePermissions = async () => {
//     try {
//       if (Platform.OS === "android") {
//         const permissionsToRequest = [
//           PermissionsAndroid.PERMISSIONS.CAMERA,
//           Platform.Version >= 33
//             ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
//             : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
//         ];

//         const result = await PermissionsAndroid.requestMultiple(permissionsToRequest);

//         const allGranted = permissionsToRequest.every(
//           (p) => result[p] === PermissionsAndroid.RESULTS.GRANTED
//         );

//         const anyNeverAskAgain = permissionsToRequest.some(
//           (p) => result[p] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
//         );

//         if (anyNeverAskAgain) {
//           setSettingsModalVisible(true); // 👉 show modal instead of Alert
//           return false;
//         }

//         return allGranted;
//       } else {
//         // iOS
//         const result = await request(PERMISSIONS.IOS.CAMERA);

//         if (result === RESULTS.GRANTED) {
//           return true;
//         } else if (result === RESULTS.BLOCKED) {
//           setSettingsModalVisible(true); // 👉 show modal instead of Alert
//           return false;
//         }
//         return false;
//       }
//     } catch (err) {
//       console.warn("Permission error:", err);
//       return false;
//     }
//   };

//   const pickImage = async () => {
//     const hasPermission = await requestCameraAndStoragePermissions();
//     if (!hasPermission) return;

//     const options = {
//       mediaType: "photo",
//       quality: 1,
//       cameraType: "front",
//       saveToPhotos: false,
//       includeBase64: false,
//     };

//     launchCamera(options, async (response) => {
//       if (response?.didCancel) {
//         showToast("info", "", "Camera cancelled");
//       } else if (response?.errorCode) {
//         showToast("error", "", `Camera error: ${response.errorMessage || response.errorCode}`);
//       } else if (response?.assets && response.assets.length > 0) {
//         const originalUri = response.assets[0].uri;
//         setImageUri(originalUri);
//         const compressedUri = await compressImage(originalUri);
//         setCompressedImageUri(compressedUri);
//       } else {
//         showToast("error", "", "Failed to capture image");
//       }
//       setModalVisible(false);
//     });
//   };

//   const handleSubmit = async () => {
//     if (!compressedImageUri) {
//       showToast('error', '', 'Please upload a selfie');
//       return;
//     }

//     if (!name || !email) {
//       showToast('error', '', 'Name and email are required');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('name', name);
//     formData.append('email', email);
//     formData.append('selfie', {
//       uri: compressedImageUri,
//       type: 'image/jpeg',
//       name: 'selfie.jpg',
//     });

//     try {
//       setUploading(true);
//       const response = await apiClient.post(
//         `/api/dealer/auth/complete-profile/${userID}`,
//         formData,
//         { headers: { 'Content-Type': 'multipart/form-data' } }
//       );

//       const { appCode, message } = response.data;

//       if (appCode === 1000) {
//         showToast('success', '', message || 'Profile completed');
//         setProfileCompleted(true);
//         setUserName(name)
//       } else if (appCode === 1006) {
//         showToast('info', '', message || 'Profile already completed.');
//         setProfileCompleted(true);
//       } else {
//         showToast('error', '', message || 'Something went wrong');
//       }
//     } catch (error) {
//       console.error('Profile submit error:', error);
//       const errMsg =
//         error?.response?.data?.message ||
//         error?.response?.data?.meta?.errors?.[0]?.message ||
//         'Something went wrong';
//       showToast('error', '', errMsg);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
//       <DetailsHeader
//         rightType="steps"
//         stepText="1/4"
//         stepTextBg={theme.colors.background}
//         stepTextColor={theme.colors.text}
//         divider={false}
//       />

//       <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
//         <View style={styles.container}>
//           <TouchableOpacity onPress={() => setModalVisible(true)}>
//             <View style={styles.cameraPlaceholder}>
//               {imageUri ? (
//                 <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
//               ) : (
//                 <>
//                   <Image
//                     source={require('../../public_assets/media/images/camera_icon.png')}
//                     style={styles.cameraIcon}
//                     resizeMode="contain"
//                   />
//                   <Text style={[styles.cameraText, { color: theme.colors.text }]}>Take a Selfie</Text>
//                 </>
//               )}
//             </View>
//           </TouchableOpacity>

//           <CustomEditField 
//             header="Name"
//             placeholder="Enter your name"
//             value={name}
//             onChangeText={setName}
//             iconName="account"
//             containerStyle={{ width: wp('94%') }}
//           />

//           <CustomEditField
//             header="Email"
//             placeholder="Enter your email"
//             value={email}
//             onChangeText={setEmail}
//             iconName="email"
//             keyboardType="email-address"
//             containerStyle={{ width: wp('94%') }}
//           />

//           <Text style={[styles.privacyText, { color: theme.placeholder || '#666' }]}>
//             Your information is secure with GADILO Bharat.{' '}
//             <TouchableOpacity onPress={() => fetchCMSContentAndNavigate('privacy')}>
//               <Text style={styles.privacyLink}>Privacy Policy</Text>
//             </TouchableOpacity>
//           </Text>

//           <ActionButton
//             label={uploading ? 'Saving...' : 'Save'}
//             style={{ height: hp('6%'), width: wp('90%') }}
//             onPress={handleSubmit}
//             disabled={uploading}
//           />
//         </View>
//       </ScrollView>

//       {/* Modal for Camera Option */}
//       <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
//             <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Upload Photo</Text>
//             <Text style={[styles.modalSubTitle, { color: theme.colors.placeholder }]}>Choose an option</Text>

//             <TouchableOpacity
//               style={[styles.modalOption, { backgroundColor: theme.colors.primary }]}
//               onPress={pickImage}>
//               <Text style={styles.modalButtonText}>Take Photo</Text>
//             </TouchableOpacity>

//             <Pressable onPress={() => setModalVisible(false)} style={styles.modalCancel}>
//               <Text style={{ color: theme.colors.placeholder }}>Cancel</Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal>

//       {/* Modal for Navigate to Settings */}
//       {/* <Modal visible={settingsModalVisible} transparent animationType="fade" onRequestClose={() => setSettingsModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
//             <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Permission Required</Text>
//             <Text style={[styles.modalSubTitle, { color: theme.colors.placeholder }]}>
//               Camera and storage permissions are required. Please enable them in settings.
//             </Text>

//             <TouchableOpacity
//               style={[styles.modalOption, { backgroundColor: theme.colors.primary }]}
//               onPress={() => {
//                 Linking.openSettings();
//                 setSettingsModalVisible(false);
//               }}>
//               <Text style={styles.modalButtonText}>Open Settings</Text>
//             </TouchableOpacity>

//             <Pressable onPress={() => setSettingsModalVisible(false)} style={styles.modalCancel}>
//               <Text style={{ color: theme.colors.placeholder }}>Cancel</Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal> */}
//       <PermissionSettingsModal
//         visible={settingsModalVisible}
//         title="Permission Required"
//         message="Camera and storage permissions are required. Please enable them in settings."
//       />
//     </SafeAreaView>
//   );
// };

// export default RegistrationScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     paddingBottom: hp('2%'),
//   },
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     paddingHorizontal: wp('5%'),
//   },
//   cameraPlaceholder: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: hp('4%'),
//     marginBottom: hp('2%'),
//   },
//   cameraIcon: {
//     width: wp('30%'),
//     height: hp('15%'),
//     marginBottom: hp('1%'),
//   },
//   imagePreview: {
//     width: wp('30%'),
//     height: wp('30%'),
//     borderRadius: wp('15%'),
//     borderWidth: 1,
//     borderColor: '#ccc',
//     resizeMode: 'cover',
//   },
//   cameraText: {
//     fontSize: hp('2%'),
//     color: '#666',
//     textAlign: 'center',
//     fontWeight: '500',
//     opacity: 0.7,
//   },
//   privacyText: {
//     marginBottom: hp('4%'),
//     fontSize: hp('1.8%'),
//     textAlign: 'center',
//     width: wp('94%'),
//     lineHeight: hp('2.5%'),
//   },
//   privacyLink: {
//     color: '#1E90FF',
//     fontWeight: '500',
//     textDecorationLine: 'underline',
//   },
//   modalOverlay: { 
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: wp('80%'),
//     borderRadius: wp('3%'),
//     padding: wp('5%'),
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: wp('5%'),
//     fontWeight: 'bold',
//     marginBottom: hp('1%'),
//   },
//   modalSubTitle: {
//     fontSize: wp('3.8%'),
//     marginBottom: hp('3%'),
//   },
//   modalOption: {
//     width: '100%',
//     paddingVertical: hp('1.6%'),
//     borderRadius: wp('2%'),
//     alignItems: 'center',
//     marginBottom: hp('1.5%'),
//   },
//   modalButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: wp('4%'),
//   },
//   modalCancel: {
//     marginTop: hp('1%'),
//   },
// });


import React, { useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { DetailsHeader } from '../components/DetailsHeader';
import CustomEditField from '../components/CustomEditField';
import ActionButton from '../components/ActionButton';
import { showToast } from '../utils/toastService';
import apiClient from '../utils/apiClient';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import PermissionSettingsModal from '../components/PermissionSettingsModal';
import { AppState } from 'react-native';

const RegistrationScreen = ({ navigation }) => {
  const { theme, setProfileCompleted, userID, setUserName } = useContext(AuthContext);
  const [imageUri, setImageUri] = useState(null);
  const [compressedImageUri, setCompressedImageUri] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const fetchCMSContentAndNavigate = async (type) => {
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
        showToast('error', '', `No ${type === 'terms' ? 'Terms' : 'Privacy'} content found.`);
      }
    } catch (error) {
      showToast('error', '', `Failed to load ${type === 'terms' ? 'Terms' : 'Privacy Policy'}.`);
    }
  };

  const compressImage = async uri => {
    try {
      let compressQuality = 80;
      let result;

      while (compressQuality >= 20) {
        result = await ImageResizer.createResizedImage(uri, 800, 800, 'JPEG', compressQuality);
        const exists = await RNFS.exists(result.uri);
        if (!exists) break;
        const fileInfo = await RNFS.stat(result.uri);
        if (fileInfo.size <= 500000) {
          return result.uri;
        }
        compressQuality -= 10;
      }

      return result?.uri || uri;
    } catch (error) {
      console.error('Compression error:', error);
      showToast('error', '', 'Failed to compress image');
      return uri;
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async state => {
      if (state === "active") {
        // 🔄 Re-check camera + storage permissions 
        const granted = await requestCameraAndStoragePermissions();
        if (granted) {
          setSettingsModalVisible(false); // ✅ auto-close modal when fixed in settings
        }
      }
    });

    return () => subscription.remove();
  }, []);

  const requestCameraAndStoragePermissions = async () => {
    try {
      if (Platform.OS === "android") {
        const permissionsToRequest = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ];

        const result = await PermissionsAndroid.requestMultiple(permissionsToRequest);

        const allGranted = permissionsToRequest.every(
          (p) => result[p] === PermissionsAndroid.RESULTS.GRANTED
        );

        const anyNeverAskAgain = permissionsToRequest.some(
          (p) => result[p] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        );

        if (anyNeverAskAgain) {
          setSettingsModalVisible(true); // 👉 show modal instead of Alert
          return false;
        }

        return allGranted;
      } else {
        // iOS - Fixed permission handling
        const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
        
        if (cameraStatus === RESULTS.GRANTED) {
          return true;
        } else if (cameraStatus === RESULTS.DENIED) {
          const cameraResult = await request(PERMISSIONS.IOS.CAMERA);
          if (cameraResult === RESULTS.GRANTED) {
            return true;
          } else if (cameraResult === RESULTS.BLOCKED) {
            setSettingsModalVisible(true);
            return false;
          }
          return false;
        } else if (cameraStatus === RESULTS.BLOCKED) {
          setSettingsModalVisible(true);
          return false;
        }
        return false;
      }
    } catch (err) {
      console.warn("Permission error:", err);
      return false;
    }
  };

  const pickImage = async () => {
  if (Platform.OS === "android") {
    const hasPermission = await requestCameraAndStoragePermissions();
    if (!hasPermission) return;
  }
    const options = {
      mediaType: "photo",
      quality: 1,
      cameraType: "front",
      saveToPhotos: false,
      includeBase64: false,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchCamera(options, async (response) => {
      if (response?.didCancel) {
        showToast("info", "", "Camera cancelled");
      } else if (response?.errorCode) {
        showToast("error", "", `Camera error: ${response.errorMessage || response.errorCode}`);
      } else if (response?.assets && response.assets.length > 0) {
        const originalUri = response.assets[0].uri;
        setImageUri(originalUri);
        const compressedUri = await compressImage(originalUri);
        setCompressedImageUri(compressedUri);
      } else {
        showToast("error", "", "Failed to capture image");
      }
      setModalVisible(false);
    });
  };

  const handleSubmit = async () => {
    if (!compressedImageUri) {
      showToast('error', '', 'Please upload a selfie');
      return;
    }

    if (!name || !email) {
      showToast('error', '', 'Name and email are required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('selfie', {
      uri: compressedImageUri,
      type: 'image/jpeg',
      name: 'selfie.jpg',
    });

    try {
      setUploading(true);
      const response = await apiClient.post(
        `/api/dealer/auth/complete-profile/${userID}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const { appCode, message } = response.data;

      if (appCode === 1000) {
        showToast('success', '', message || 'Profile completed');
        setProfileCompleted(true);
        setUserName(name)
      } else if (appCode === 1006) {
        showToast('info', '', message || 'Profile already completed.');
        setProfileCompleted(true);
      } else {
        showToast('error', '', message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Profile submit error:', error);
      const errMsg =
        error?.response?.data?.message ||
        error?.response?.data?.meta?.errors?.[0]?.message ||
        'Something went wrong';
      showToast('error', '', errMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <DetailsHeader
        rightType="steps"
        stepText="1/4"
        stepTextBg={theme.colors.background}
        stepTextColor={theme.colors.text}
        divider={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View style={styles.cameraPlaceholder}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
              ) : (
                <>
                  <Image
                    source={require('../../public_assets/media/images/camera_icon.png')}
                    style={styles.cameraIcon}
                    resizeMode="contain"
                  />
                  <Text style={[styles.cameraText, { color: theme.colors.text }]}>Take a Selfie</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <CustomEditField 
            header="Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            iconName="account"
            containerStyle={{ width: wp('94%') }}
          />

          <CustomEditField
            header="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            iconName="email"
            keyboardType="email-address"
            containerStyle={{ width: wp('94%') }}
          />

          <Text style={[styles.privacyText, { color: theme.placeholder || '#666' }]}>
            Your information is secure with GADILO Bharat.{' '}
            <TouchableOpacity onPress={() => fetchCMSContentAndNavigate('privacy')}>
              <Text style={styles.privacyLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </Text>

          <ActionButton
            label={uploading ? 'Saving...' : 'Save'}
            style={{ height: hp('6%'), width: wp('90%') }}
            onPress={handleSubmit}
            disabled={uploading}
          />
        </View>
      </ScrollView>

      {/* Modal for Camera Option */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Upload Photo</Text>
            <Text style={[styles.modalSubTitle, { color: theme.colors.placeholder }]}>Choose an option</Text>

            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: theme.colors.primary }]}
              onPress={pickImage}>
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <Pressable onPress={() => setModalVisible(false)} style={styles.modalCancel}>
              <Text style={{ color: theme.colors.placeholder }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <PermissionSettingsModal
        visible={settingsModalVisible}
        title="Permission Required"
        message="Camera permission is required. Please enable it in settings."
        onClose={() => setSettingsModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default RegistrationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: hp('2%'),
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
  },
  cameraPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('4%'),
    marginBottom: hp('2%'),
  },
  cameraIcon: {
    width: wp('30%'),
    height: hp('15%'),
    marginBottom: hp('1%'),
  },
  imagePreview: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
    borderWidth: 1,
    borderColor: '#ccc',
    resizeMode: 'cover',
  },
  cameraText: {
    fontSize: hp('2%'),
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.7,
  },
  privacyText: {
    marginBottom: hp('4%'),
    fontSize: hp('1.8%'),
    textAlign: 'center',
    width: wp('94%'),
    lineHeight: hp('2.5%'),
  },
  privacyLink: {
    color: '#1E90FF',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  modalOverlay: { 
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp('80%'),
    borderRadius: wp('3%'),
    padding: wp('5%'),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginBottom: hp('1%'),
  },
  modalSubTitle: {
    fontSize: wp('3.8%'),
    marginBottom: hp('3%'),
  },
  modalOption: {
    width: '100%',
    paddingVertical: hp('1.6%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: wp('4%'),
  },
  modalCancel: {
    marginTop: hp('1%'),
  },
});