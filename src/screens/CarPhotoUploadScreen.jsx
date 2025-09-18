import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    Modal,
    Pressable,
    Alert,
    InteractionManager,
    AppState,
    PermissionsAndroid,
} from 'react-native';
import AppText from '../components/AppText';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import BackgroundWrapper from '../components/BackgroundWrapper';
import BackButton from '../components/BackButton';
import ActionButton from '../components/ActionButton';
import { DetailsHeader } from '../components/DetailsHeader';
import { useFormStore } from '../store/formStore';  // ✅ Global store import
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import { Image as CompressorImage } from 'react-native-compressor';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import SubscriptionModal from '../components/SubscriptionModal';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import PermissionSettingsModal from '../components/PermissionSettingsModal';
import Loader from '../components/Loader';
const CarPhotoUploadScreen = ({ navigation }) => {
    const { theme, userID, selectedCategory } = useContext(AuthContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const { formData, updateForm, clearFields } = useFormStore();
    const [images, setImages] = useState(formData.images || []);
    const [loading, setLoading] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);
    const isEditing = formData?.isEdit;
    console.log('ffffff', isEditing);

    // Determine if it's a car or bike based on category_id or other identifier
    const isBike = selectedCategory?.toLowerCase() === 'bike';
    console.log('isBike', isBike);

    useEffect(() => {
        updateForm('images', images);
    }, [images]);
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
                // iOS
                const result = await request(PERMISSIONS.IOS.CAMERA);

                if (result === RESULTS.GRANTED) {
                    return true;
                } else if (result === RESULTS.BLOCKED) {
                    setSettingsModalVisible(true); // 👉 show modal instead of Alert
                    return false;
                }
                return false;
            }
        } catch (err) {
            console.warn("Permission error:", err);
            return false;
        }
    };
    const pickImage = async (source) => {
        if (Platform.OS === "android") {
            const hasPermission = await requestCameraAndStoragePermissions();
            if (!hasPermission) return;
        }
        const options = { mediaType: 'photo', selectionLimit: isBike ? 5 : 10 };
        const callback = (response) => {
            if (!response.didCancel && !response.errorCode && response.assets?.length) {
                const newImages = [...images, ...response.assets];
                if (newImages.length <= (isBike ? 5 : 10)) {
                    setImages(newImages);
                } else {
                    showToast('error', 'Limit reached', `You can only select up to ${isBike ? 5 : 10} images`);
                }
            }
            InteractionManager.runAfterInteractions(() => {
                setModalVisible(false);
            });
        };
        if (source === 'camera') launchCamera(options, callback);
        else launchImageLibrary(options, callback);
    };

    const removeImage = (indexToRemove) => {
        setImages(images.filter((_, i) => i !== indexToRemove));
    };

    const renderImageItem = ({ item, index }) => (
        <View style={styles.imageContainer}>
            <Image source={{ uri: item.uri }} style={styles.uploadedImage} resizeMode="cover" />
            <TouchableOpacity style={styles.removeIcon} onPress={() => removeImage(index)}>
                <Icon name="close-circle" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );

    const compressImageIfNeeded = async (image) => {
        try {
            if (!image || !image.uri) {
                console.log("🚫 Invalid image object:", image);
                return null;
            }

            const { uri, name, type } = image;

            if (!type?.startsWith('image/')) {
                console.log("ℹ️ Skipping non-image file:", name || uri);
                return image;
            }

            console.log(`📦 Original image URI: ${uri}`);

            const compressedUri = await CompressorImage.compress(uri, {
                compressionMethod: 'auto',
                maxSize: 0.5, // MB
            });

            const stats = await RNFS.stat(compressedUri);
            const sizeInKB = Number(stats.size) / 1024;

            console.log(`✅ Compressed image path: ${compressedUri}`);
            console.log(`📏 Compressed image size: ${sizeInKB.toFixed(2)} KB`);

            return {
                uri: Platform.OS === 'android' ? compressedUri : compressedUri.replace('file://', ''),
                name: name || `compressed_${Date.now()}.jpg`,
                type: 'image/jpeg',
            };
        } catch (error) {
            console.log('❌ Compression failed:', error.message || error);
            return image;
        }
    };

    const handlePublish = async (actionType = 'save') => {
        const requiredFields = [
            'carAndBikeBrandId', 'carandBikeId', 'fuelTypeId',
            'carColorId', 'ownerHistoryId', 'yearId', 'price',
            'kmsDriven', 'category_id', 'city_id'
        ];

        try {
            // 1. Validate required fields
            for (let key of requiredFields) {
                if (!formData[key]) {
                    showToast('error', 'Missing field', `${key} is required`);
                    console.log(`❌ Missing field: ${key}`);
                    return;
                }
            }

            if (!images.length) {
                showToast('error', 'Missing images', 'Please upload at least one image.');
                return;
            }

            setLoading(true); // Start loading

            // 2. Prepare FormData based on vehicle type
            const formPayload = new FormData();
            formPayload.append('brand_id', formData?.carAndBikeBrandId);

            // Use appropriate field name based on vehicle type
            if (isBike) {
                formPayload.append('bike_id', formData?.carandBikeId);
                formPayload.append('bike_type_id', formData?.bikeTypeId);
                formPayload.append('bike_other_text', formData?.carAndbike_other_text);
            } else {
                formPayload.append('car_id', formData?.carandBikeId);
                formPayload.append('transmission_id', formData?.transmissionId);
                formPayload.append('car_other_text', formData?.carAndbike_other_text);
            }
            formPayload.append('year_id', formData?.yearId);
            formPayload.append('fuel_type_id', formData?.fuelTypeId);
            formPayload.append('color_id', formData?.carColorId);
            formPayload.append('city_id', formData?.city_id);
            formPayload.append('model_name', formData?.model_name || formData?.carName);
            formPayload.append('price', parseInt(formData?.price));
            formPayload.append('kilometers_driven', parseInt(formData?.kmsDriven));
            formPayload.append('category_id', formData?.category_id);
            formPayload.append('ownership_id', formData?.ownerHistoryId);
            formPayload.append('brand_other_text', formData?.otherbrand);
            formPayload.append('subscription_plan', formData?.subscription_plan);
            formPayload.append('ownership_other_text', formData?.carAndbike_ownership_other_text);
            formPayload.append('isPublished', actionType === 'save' ? 'false' : 'false');
            formPayload.append('isDraft', actionType === 'save' ? 'true' : 'false');

            // 3. Safely compress images
            const validImages = images.filter(img => img?.uri);
            let compressedImages = [];

            try {
                compressedImages = await Promise.all(validImages.map(compressImageIfNeeded));
            } catch (err) {
                console.error("❌ Error compressing images", err);
                showToast('error', 'Image Compression Failed', 'Please try again.');
                setLoading(false);
                return;
            }

            compressedImages.forEach(image => {
                if (image?.uri) {
                    formPayload.append('images', {
                        uri: image.uri,
                        name: image.name,
                        type: image.type,
                    });
                }
            });

            console.log('📤 FormData:', formPayload);
            let apiEndpoint = '';
            if (isEditing === true) {
                apiEndpoint = isBike
                    ? `/api/product/bikeRoute/update_bike_before_publish/${formData?.carandbikeproductid}`
                    : `/api/product/carRoutes/update_car_before_publish/${formData?.carandbikeproductid}`;
            } else {
                apiEndpoint = isBike
                    ? '/api/product/bikeRoute/bikes'
                    : '/api/product/carRoutes/cars';
            }

            const vehicleType = isBike ? 'Bike' : 'Car';

            console.log(`📡 Sending to ${apiEndpoint} for ${vehicleType}`);

            let response; // ✅ declare outside so it's accessible in both cases

            if (isEditing === true) {
                response = await apiClient.put(apiEndpoint, formPayload, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                response = await apiClient.post(apiEndpoint, formPayload, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            // ✅ Now accessible here
            console.log("📥 Server Response:", JSON.stringify(response.data, null, 2));



            // 5. Handle Success
            // if (response.data?.success) {
            //     const createdVehicle = isBike ? response.data?.data?.createdBike : response.data?.data?.createdCar;
            //     showToast('success', 'Success', `${vehicleType} ${actionType === 'save' ? 'saved' : 'published'} successfully!`);

            //     // Reset form and images
            //     clearFields([
            //         'carAndBikeBrandId', 'carandBikeId', 'yearId', 'fuelTypeId', 'carColorId',
            //         'model_name', 'price', 'kmsDriven', 'transmissionId',
            //         'ownerHistoryId', 'isPublished', 'otherbrand', 'bike_type_id'
            //     ]);
            //     updateForm('images', []); // explicitly clear images
            //     setModalVisible(false)
            //     setShowConfirmModal(false);

            //     // 6. Clean navigation
            //     navigation.reset({
            //         index: 0,
            //         routes: [
            //             {
            //                 name: actionType === 'publish' ? 'PreviewScreen' : 'BottomTabNavigator',
            //                 params: actionType === 'publish' ? {
            //                     carandBikeId: createdVehicle?._id,
            //                     vehicleType: isBike ? 'bike' : 'car'
            //                 } : undefined,
            //             },
            //         ],
            //     });
            // } else {
            //     // Handle API error response
            //     const error = response.data;
            //     if (error.code === 'VALIDATION_ERROR' && error.meta?.errors?.length) {
            //         const fieldErr = error.meta.errors[0];
            //         showToast('error', fieldErr.field, fieldErr.message);
            //     }

            //     else {
            //         showToast('error', 'Failed', error.message || 'Submission failed');
            //     }
            // }
            const responseData = response.data;

            // ✅ Check success based on appCode
            if (responseData?.appCode === 1000) {
                const createdVehicle = isBike
                    ? responseData.data?.createdBike || responseData.data?.updatedBike
                    : responseData.data?.createdCar || responseData.data?.updatedCar;

                showToast(
                    'success',
                    'Success',
                    `${vehicleType} ${actionType === 'save' ? 'saved' : 'published'} successfully!`
                );

                // Reset form and images
                clearFields([
                    'carAndBikeBrandId', 'carandBikeId', 'yearId', 'fuelTypeId', 'carColorId',
                    'model_name', 'price', 'kmsDriven', 'transmissionId',
                    'ownerHistoryId', 'isPublished', 'otherbrand', 'bike_type_id', 'model_name'
                ]);
                updateForm('images', []);
                updateForm('isEdit', false);
                InteractionManager.runAfterInteractions(() => {
                    setModalVisible(false);
                });
                setShowConfirmModal(false);

                // Navigate accordingly
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: actionType === 'publish' ? 'PreviewScreen' : 'PreviewScreen',
                            params: actionType === 'publish'
                                ? {
                                    carandBikeId: createdVehicle?._id,
                                    vehicleType: isBike ? 'bike' : 'car'
                                }
                                : {
                                    carandBikeId: createdVehicle?._id,
                                    vehicleType: isBike ? 'bike' : 'car'
                                }
                        },
                    ],
                });

            } else {
                // ✅ Handle plan not purchased (appCode === 1126)
                if (responseData?.appCode === 1126 || responseData?.appCode === 1003 || responseData?.appCode === 1134 || responseData?.appCode === 1068) {
                    setShowSubscriptionModal(true);
                    return;
                }

                // ✅ Handle validation error
                if (responseData.code === 'VALIDATION_ERROR' && responseData.meta?.errors?.length) {
                    const fieldErr = responseData.meta.errors[0];
                    showToast('error', fieldErr.field, fieldErr.message);

                } else {
                    // ✅ Generic failure message
                    showToast('error', 'Failed', responseData.message || 'Submission failed');
                }
            }

        } catch (err) {
            console.error("❌ API Error:", err.response || err);

            // Handle different types of errors
            let errorMessage = 'Something went wrong';
            let errorTitle = 'Network Error';

            if (err?.response?.data) {
                const errorData = err.response.data;

                // Handle validation errors
                if (errorData.code === 'VALIDATION_ERROR' && errorData.meta?.errors?.length) {
                    const fieldErr = errorData.meta.errors[0];
                    errorTitle = fieldErr.field || 'Validation Error';
                    errorMessage = fieldErr.message || 'Invalid data provided';
                }
                // Handle other API errors
                else if (errorData.message) {
                    errorMessage = errorData.message;
                    errorTitle = errorData.code || 'API Error';
                }

            }
            // Handle network errors
            else if (err.message) {
                if (err.message.includes('Network Error')) {
                    errorTitle = 'Network Error';
                    errorMessage = 'Please check your internet connection';
                } else if (err.message.includes('timeout')) {
                    errorTitle = 'Timeout Error';
                    errorMessage = 'Request timed out. Please try again';
                } else {
                    errorMessage = err.message;
                }
            }

            showToast('error', errorTitle, errorMessage);
        } finally {
            setLoading(false); // Always stop loading
            // Reset form and images
            // clearFields([
            //     'carAndBikeBrandId', 'carandBikeId', 'yearId', 'fuelTypeId', 'carColorId',
            //     'model_name', 'price', 'kmsDriven', 'transmissionId',
            //     'ownerHistoryId', 'isPublished', 'otherbrand', 'bike_type_id'
            // ]);
        }
    };
    const handleSubscribe = () => {
        // clearFields([
        //     'carAndBikeBrandId', 'carandBikeId', 'yearId', 'fuelTypeId', 'carColorId',
        //     'model_name', 'price', 'kmsDriven', 'transmissionId',
        //     'ownerHistoryId', 'isPublished', 'otherbrand', 'bike_type_id', 'model_name'
        // ]);

        InteractionManager.runAfterInteractions(() => {
            setShowSubscriptionModal(false);
        });

        navigation.replace('SubscriptionScreen');
    };
    return (
        <BackgroundWrapper>
            <DetailsHeader title={isBike ? 'Bike Details' : 'Car Details'} stepText={selectedCategory === 'Bike' ? ' 7/7' : ' 6/6'} rightType="steps" />
            <AppText style={[styles.title, { color: theme.colors.text }]}>
                Upload {isBike ? 'bike' : 'car'} photos.
            </AppText>
            <AppText style={[styles.subtitle, { color: theme.colors.placeholder }]}> (max {isBike ? 5 : 10})</AppText>

            <TouchableOpacity
                style={[styles.uploadBox, { backgroundColor: theme.colors.card }]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <View style={styles.iconWrapper}>
                    <Icon name="camera-plus" size={40} color="#98C6E9" />
                    <AppText style={[styles.uploadText, { color: theme.colors.text }]}>
                        Take a Photo or Upload Photo
                    </AppText>
                </View>
            </TouchableOpacity>

            <FlatList
                data={images}
                renderItem={renderImageItem}
                keyExtractor={(_, i) => i.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: wp('4%') }}
                contentContainerStyle={{ paddingVertical: hp('2%') }}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.buttonRow}>
                <View style={{ flex: 1, marginRight: wp('2%') }}>
                    <ActionButton
                        label="Save for later"
                        onPress={() => setShowConfirmModal(true)}
                        style={{ paddingHorizontal: wp('1%') }}
                        loading={loading}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <ActionButton
                        label="Preview & Publish"
                        onPress={() => handlePublish('publish')}
                        style={{ paddingHorizontal: wp('0%') }}
                        loading={loading}
                    />
                </View>
            </View>

            {/* Upload Modal */}
            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => InteractionManager.runAfterInteractions(() => {
                setModalVisible(false);
            })}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
                        <AppText style={[styles.modalTitle, { color: theme.colors.text }]}>Upload Photo</AppText>
                        <AppText style={[styles.modalSubTitle, { color: theme.colors.placeholder }]}>Choose an option</AppText>
                        <TouchableOpacity
                            style={[styles.modalOption, { backgroundColor: theme.colors.primary }]}
                            onPress={() => pickImage('camera')}
                        >
                            <AppText style={styles.modalButtonText}>Take Photo</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalOption, { backgroundColor: theme.colors.primary }]}
                            onPress={() => pickImage('gallery')}
                        >
                            <AppText style={styles.modalButtonText}>Choose from Gallery</AppText>
                        </TouchableOpacity>
                        <Pressable onPress={() => InteractionManager.runAfterInteractions(() => {
                            setModalVisible(false);
                        })} style={styles.modalCancel}>
                            <AppText style={{ color: theme.colors.placeholder }}>Cancel</AppText>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Save Confirmation Modal */}
            <Modal visible={showConfirmModal} transparent animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
                <View style={styles.bottomModalOverlay}>
                    <View style={[styles.bottomModal, { backgroundColor: theme.colors.card }]}>
                        <TouchableOpacity style={styles.closeIconWrapper} onPress={() => setShowConfirmModal(false)}>
                            <Icon name="close" size={hp('2.5%')} color={theme.colors.text} />
                        </TouchableOpacity>
                        <AppText style={[styles.modalTitleText, { color: theme.colors.text }]}>
                            Are you sure you want to save this{'\n'}for later publishing?
                        </AppText>
                        <AppText style={[styles.modalSubtitleText, { color: theme.colors.placeholder }]}>
                            Your draft will be saved and you can publish later.
                        </AppText>
                        <TouchableOpacity
                            style={styles.bottomModalButton}
                            onPress={() => {
                                handlePublish('save');
                                InteractionManager.runAfterInteractions(() => {
                                    setShowConfirmModal(false);

                                });
                            }}
                            disabled={loading}
                        >
                            <AppText style={styles.bottomModalButtonText}>
                                {loading ? 'Saving...' : 'Save for later'}
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <SubscriptionModal
                visible={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                onSubscribe={() => { handleSubscribe() }}
            />
            <PermissionSettingsModal
                visible={settingsModalVisible}
                title="Permission Required"
                message="Camera and storage permissions are required. Please enable them in settings."
            />
            <Loader visible={loading} />

        </BackgroundWrapper>
    );
};

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp('2%'),
        marginTop: hp('1%'),
        position: 'relative',
    },
    stepContainer: {
        position: 'absolute',
        right: wp('0%'),
        borderRadius: wp('2%'),
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('0.8%'),
    },
    stepText: {
        fontSize: wp('3.5%'),
        fontWeight: '600',
    },
    title: {
        fontSize: wp('5%'),
        fontWeight: '600',
        paddingHorizontal: wp('4%'),
    },
    subtitle: {
        fontSize: wp('3.5%'),
        paddingHorizontal: wp('4%'),
        marginBottom: hp('2%'),
    },
    uploadBox: {
        height: hp('20%'),
        marginHorizontal: wp('4%'),
        borderRadius: wp('2%'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapper: {
        alignItems: 'center',
    },
    uploadText: {
        marginTop: hp('1%'),
        fontSize: wp('3.5%'),
        fontWeight: '500',
    },
    imageContainer: {
        position: 'relative',
        width: wp('42%'),
        height: wp('42%'),
        borderRadius: wp('2%'),
        overflow: 'hidden',
        marginBottom: hp('2%'),
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        borderRadius: wp('2%'),
    },
    removeIcon: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#fff',
        borderRadius: 12,
        zIndex: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: hp('7%'),
        paddingHorizontal: wp('4%'),
    },
    bottomModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    bottomModal: {
        borderTopLeftRadius: wp('4%'),
        borderTopRightRadius: wp('4%'),
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('3%'),
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    closeIconWrapper: {
        position: 'absolute',
        top: wp('4%'),
        right: wp('4%'),
        padding: wp('1%'),
        zIndex: 10,
    },
    modalTitleText: {
        fontSize: wp('4.8%'),
        fontWeight: 'bold',
        marginTop: hp('1%'),
        marginBottom: hp('1%'),
        lineHeight: wp('6.5%'),
    },
    modalSubtitleText: {
        fontSize: wp('3.5%'),
        marginBottom: hp('4%'),
    },
    bottomModalButton: {
        backgroundColor: '#104E8B',
        paddingVertical: hp('1.6%'),
        borderRadius: wp('2%'),
        alignItems: 'center',
    },
    bottomModalButtonText: {
        color: '#fff',
        fontSize: wp('4%'),
        fontWeight: '600',
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
    bottomModalWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'flex-end',
        flex: 1,
    },
});

export default CarPhotoUploadScreen;