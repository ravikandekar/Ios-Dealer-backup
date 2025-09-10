import { Platform, Alert, Linking, PermissionsAndroid } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import apiClient from '../utils/apiClient';

class PDFInvoiceDownloader {
    constructor() {
        this.apiEndpoint = '/api/dealer/dealerSubscriptionRoute/generate-invoice';
    }

    async checkStoragePermission() {
        if (Platform.OS !== 'android') return true;

        const androidVersion = Platform.Version;
        if (androidVersion >= 30) return true;

        try {
            const granted = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );

            if (granted) return true;

            const result = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission Required',
                    message: 'This app needs access to your storage to download invoice PDF files.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );

            return result === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn('Permission error:', err);
            return false;
        }
    }

    getDownloadPath(filename) {
        const { fs } = RNFetchBlob;
        if (Platform.OS === 'ios') {
            return `${fs.dirs.DocumentDir}/${filename}`;
        }
        return `${fs.dirs.DownloadDir}/${filename}`;
    }

    generateFilename(orderId) {
        const now = new Date();
        const pad = (num) => num.toString().padStart(2, '0');
        const padMs = (num) => num.toString().padStart(3, '0');

        const day = pad(now.getDate());
        const month = pad(now.getMonth() + 1);
        const year = now.getFullYear();
        const hours = pad(now.getHours());
        const minutes = pad(now.getMinutes());
        const seconds = pad(now.getSeconds());
        const milliseconds = padMs(now.getMilliseconds());

        const timestamp = `${day}${month}${year}${hours}${minutes}${seconds}${milliseconds}`;
        return `INV_${orderId}_${timestamp}.pdf`;
    }

    async downloadInvoice(orderId, showSuccessAlert = true) {
        try {
            const hasPermission = await this.checkStoragePermission();
            if (!hasPermission) {
                Alert.alert(
                    'Permission Required',
                    'Storage permission is required to download the invoice.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() }
                    ]
                );
                return { success: false, error: 'Permission denied' };
            }

            // Step 1: Call the API to get invoice URL
            const apiResponse = await apiClient.post(`${this.apiEndpoint}/${orderId}`);
            const invoiceUrl = apiResponse?.data?.data?.invoiceUrl;

            if (!invoiceUrl) {
                throw new Error('Invoice URL not found in response');
            }

            const filename = this.generateFilename(orderId);
            const downloadPath = this.getDownloadPath(filename);

            // Step 2: Download PDF - Safest configuration
            const res = await RNFetchBlob.config({
                fileCache: true,
                path: downloadPath,
                // Don't use addAndroidDownloads to avoid all receiver/visibility issues
            }).fetch('GET', invoiceUrl);

            // Manual notification after successful download
            if (Platform.OS === 'android') {
                try {
                    // Only add to download manager after file is completely downloaded
                    RNFetchBlob.android.addCompleteDownload({
                        title: `Invoice ${orderId}`,
                        description: 'Invoice PDF downloaded successfully',
                        mime: 'application/pdf',
                        path: res.path(),
                        showNotification: true,
                    });
                } catch (notificationError) {
                    console.warn('Notification error (non-critical):', notificationError);
                    // File is still downloaded successfully, just no notification
                }
            }

            if (showSuccessAlert) {
                Alert.alert(
                    'Download Complete',
                    `Invoice has been downloaded successfully!\n\nSaved to: ${filename}`,
                    [
                        { text: 'OK', style: 'default' },
                        {
                            text: 'Open',
                            onPress: () => this.openPDF(res.path())
                        }
                    ]
                );
            }

            return {
                success: true,
                path: res.path(),
                filename: filename
            };

        } catch (error) {
            console.error('Download error:', error);

            let errorMessage = 'Failed to download invoice. Please try again.';
            if (error.response?.status === 401 || error.response?.status === 403) {
                errorMessage = 'Authentication failed. Please login again.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Invoice not found for this order.';
            } else if (error.message.includes('Network')) {
                errorMessage = 'Network error. Please check your internet connection.';
            }

            Alert.alert('Download Failed', errorMessage);

            return {
                success: false,
                error: error.message,
                userMessage: errorMessage
            };
        }
    }

    // Alternative download method without using download manager
    async downloadInvoiceSimple(orderId, showSuccessAlert = true) {
        try {
            const hasPermission = await this.checkStoragePermission();
            if (!hasPermission) {
                Alert.alert(
                    'Permission Required',
                    'Storage permission is required to download the invoice.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() }
                    ]
                );
                return { success: false, error: 'Permission denied' };
            }

            // Call API to get invoice URL
            const apiResponse = await apiClient.post(`${this.apiEndpoint}/${orderId}`);
            const invoiceUrl = apiResponse?.data?.data?.invoiceUrl;

            if (!invoiceUrl) {
                throw new Error('Invoice URL not found in response');
            }

            const filename = this.generateFilename(orderId);
            const downloadPath = this.getDownloadPath(filename);

            // Simple download without download manager
            const res = await RNFetchBlob.config({
                fileCache: true,
                path: downloadPath,
            }).fetch('GET', invoiceUrl);

            if (showSuccessAlert) {
                Alert.alert(
                    'Download Complete',
                    `Invoice has been downloaded successfully!\n\nSaved to: ${filename}`,
                    [
                        { text: 'OK', style: 'default' },
                        {
                            text: 'Open',
                            onPress: () => this.openPDF(res.path())
                        }
                    ]
                );
            }

            return {
                success: true,
                path: res.path(),
                filename: filename
            };

        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Download Failed', 'Failed to download invoice. Please try again.');
            return {
                success: false,
                error: error.message
            };
        }
    }

    async downloadInvoiceWithToken(orderId, authToken, showSuccessAlert = true) {
        try {
            const hasPermission = await this.checkStoragePermission();
            if (!hasPermission) {
                Alert.alert(
                    'Permission Required',
                    'Storage permission is required to download the invoice.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() }
                    ]
                );
                return { success: false, error: 'Permission denied' };
            }

            const filename = this.generateFilename(orderId);
            const downloadPath = this.getDownloadPath(filename);

            // Create temporary apiClient instance with specific token
            const tempApiClient = { ...apiClient };
            tempApiClient.defaults = { ...apiClient.defaults };
            tempApiClient.defaults.headers = { ...apiClient.defaults.headers };
            tempApiClient.defaults.headers.common = {
                ...apiClient.defaults.headers.common,
                'Authorization': `Bearer ${authToken}`
            };

            const response = await tempApiClient.post(this.apiEndpoint, { orderId }, {
                responseType: 'arraybuffer',
            });

            // Convert ArrayBuffer to Uint8Array and then to regular array
            const uint8Array = new Uint8Array(response.data);
            const dataArray = Array.from(uint8Array);

            // Write the raw binary data to file
            await RNFetchBlob.fs.writeFile(downloadPath, dataArray, 'ascii');

            // Safe notification handling
            if (Platform.OS === 'android') {
                try {
                    RNFetchBlob.android.addCompleteDownload({
                        title: `Invoice ${orderId}`,
                        description: 'Invoice PDF downloaded successfully',
                        mime: 'application/pdf',
                        path: downloadPath,
                        showNotification: true,
                    });
                } catch (notificationError) {
                    console.warn('Notification error (non-critical):', notificationError);
                }
            }

            if (showSuccessAlert) {
                Alert.alert(
                    'Download Complete',
                    `Invoice has been downloaded successfully!\n\nSaved to: ${filename}`,
                    [
                        { text: 'OK', style: 'default' },
                        {
                            text: 'Open',
                            onPress: () => this.openPDF(downloadPath)
                        }
                    ]
                );
            }

            return {
                success: true,
                path: downloadPath,
                filename: filename
            };

        } catch (error) {
            console.error('Download error:', error);

            let errorMessage = 'Failed to download invoice. Please try again.';
            if (error.response?.status === 401 || error.response?.status === 403) {
                errorMessage = 'Authentication failed. Please login again.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Invoice not found for this order.';
            } else if (error.message.includes('Network')) {
                errorMessage = 'Network error. Please check your internet connection.';
            }

            Alert.alert('Download Failed', errorMessage);

            return {
                success: false,
                error: error.message,
                userMessage: errorMessage
            };
        }
    }

    async openPDF(filePath) {
        try {
            if (Platform.OS === 'android') {
                await RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf');
            } else {
                await RNFetchBlob.ios.openDocument(filePath);
            }
        } catch (error) {
            console.error('Error opening PDF:', error);
            Alert.alert('Info', 'PDF downloaded successfully. You can find it in your Downloads folder.');
        }
    }
}

const pdfDownloader = new PDFInvoiceDownloader();

export const downloadInvoicePDF = (orderId) => {
    return pdfDownloader.downloadInvoice(orderId);
};

// Simple download without download manager (recommended if having receiver issues)
export const downloadInvoicePDFSimple = (orderId) => {
    return pdfDownloader.downloadInvoiceSimple(orderId);
};

export const downloadInvoicePDFWithToken = (orderId, authToken) => {
    return pdfDownloader.downloadInvoiceWithToken(orderId, authToken);
};

export default pdfDownloader;






// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
//   ActivityIndicator,
//   Platform,
//   Alert,
//   Linking,
//   PermissionsAndroid,
//   Animated,
//   Dimensions
// } from 'react-native';
// import RNFetchBlob from 'rn-fetch-blob';
// import apiClient from '../utils/apiClient';

// const { width, height } = Dimensions.get('window');

// class PDFInvoiceDownloader {
//   constructor() {
//     this.apiEndpoint = '/api/dealer/dealerSubscriptionRoute/generate-invoice';
//   }

//   async checkStoragePermission() {
//     if (Platform.OS !== 'android') return true;

//     const androidVersion = Platform.Version;
//     if (androidVersion >= 30) return true;

//     try {
//       const granted = await PermissionsAndroid.check(
//         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
//       );
//       if (granted) return true;

//       const result = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//         {
//           title: 'Storage Permission Required',
//           message: 'This app needs access to your storage to download invoice PDF files.',
//           buttonNeutral: 'Ask Me Later',
//           buttonNegative: 'Cancel',
//           buttonPositive: 'OK',
//         }
//       );
//       return result === PermissionsAndroid.RESULTS.GRANTED;
//     } catch (err) {
//       console.warn('Permission error:', err);
//       return false;
//     }
//   }

//   getDownloadPath(filename) {
//     const { fs } = RNFetchBlob;
//     return Platform.OS === 'ios'
//       ? `${fs.dirs.DocumentDir}/${filename}`
//       : `${fs.dirs.DownloadDir}/${filename}`;
//   }

//   generateFilename(orderId) {
//     const now = new Date();
//     const pad = (n) => n.toString().padStart(2, '0');
//     const padMs = (n) => n.toString().padStart(3, '0');
//     return `INV_${orderId}_${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${padMs(now.getMilliseconds())}.pdf`;
//   }

//   async downloadInvoice(orderId, onProgress, onComplete) {
//     try {
//       const hasPermission = await this.checkStoragePermission();
//       if (!hasPermission) {
//         return { success: false, error: 'Permission denied' };
//       }

//       onProgress('Getting invoice URL...');

//       const apiResponse = await apiClient.post(`${this.apiEndpoint}/${orderId}`);
//       const invoiceUrl = apiResponse?.data?.data?.invoiceUrl;
//       if (!invoiceUrl) throw new Error('Invoice URL not found in response');

//       const filename = this.generateFilename(orderId);
//       const downloadPath = this.getDownloadPath(filename);

//       onProgress('Downloading PDF...');

//       const res = await RNFetchBlob.config({
//         fileCache: true,
//         appendExt: 'pdf',
//         path: downloadPath
//       }).fetch('GET', invoiceUrl);

//       const contentType = res.info().headers['Content-Type'] || '';
//       if (!contentType.includes('pdf')) {
//         throw new Error('Downloaded file is not a valid PDF');
//       }

//       if (Platform.OS === 'android') {
//         try {
//           RNFetchBlob.android.addCompleteDownload({
//             title: `Invoice ${orderId}`,
//             description: 'Invoice PDF downloaded successfully',
//             mime: 'application/pdf',
//             path: res.path(),
//             showNotification: true,
//           });
//         } catch (err) {
//           console.warn('Notification error (non-critical):', err);
//         }
//       }

//       onProgress('Opening PDF...');

//       // Auto-open PDF after download
//       await this.openPDF(res.path());

//       onComplete({ success: true, path: res.path(), filename });
//       return { success: true, path: res.path(), filename };

//     } catch (error) {
//       console.error('Download error:', error);
//       let errorMessage = 'Failed to download invoice. Please try again.';
//       if (error.response?.status === 401 || error.response?.status === 403) {
//         errorMessage = 'Authentication failed. Please login again.';
//       } else if (error.response?.status === 404) {
//         errorMessage = 'Invoice not found for this order.';
//       } else if (error.message.includes('Network')) {
//         errorMessage = 'Network error. Please check your internet connection.';
//       }
//       onComplete({ success: false, error: error.message, userMessage: errorMessage });
//       return { success: false, error: error.message, userMessage: errorMessage };
//     }
//   }

//   async downloadInvoiceWithToken(orderId, authToken, onProgress, onComplete) {
//     try {
//       const hasPermission = await this.checkStoragePermission();
//       if (!hasPermission) {
//         return { success: false, error: 'Permission denied' };
//       }

//       onProgress('Preparing download...');

//       const filename = this.generateFilename(orderId);
//       const downloadPath = this.getDownloadPath(filename);

//       const tempApiClient = { ...apiClient };
//       tempApiClient.defaults = { ...apiClient.defaults };
//       tempApiClient.defaults.headers = { ...apiClient.defaults.headers };
//       tempApiClient.defaults.headers.common = {
//         ...apiClient.defaults.headers.common,
//         Authorization: `Bearer ${authToken}`,
//       };

//       onProgress('Downloading PDF...');

//       const response = await tempApiClient.post(this.apiEndpoint, { orderId }, { responseType: 'arraybuffer' });

//       const uint8Array = new Uint8Array(response.data);
//       const base64Data = RNFetchBlob.base64.encode(uint8Array);

//       await RNFetchBlob.fs.writeFile(downloadPath, base64Data, 'base64');

//       if (Platform.OS === 'android') {
//         try {
//           RNFetchBlob.android.addCompleteDownload({
//             title: `Invoice ${orderId}`,
//             description: 'Invoice PDF downloaded successfully',
//             mime: 'application/pdf',
//             path: downloadPath,
//             showNotification: true,
//           });
//         } catch (err) {
//           console.warn('Notification error:', err);
//         }
//       }

//       onProgress('Opening PDF...');

//       // Auto-open PDF after download
//       await this.openPDF(downloadPath);

//       onComplete({ success: true, path: downloadPath, filename });
//       return { success: true, path: downloadPath, filename };

//     } catch (error) {
//       console.error('Download error:', error);
//       let errorMessage = 'Failed to download invoice. Please try again.';
//       if (error.response?.status === 401 || error.response?.status === 403) {
//         errorMessage = 'Authentication failed. Please login again.';
//       } else if (error.response?.status === 404) {
//         errorMessage = 'Invoice not found for this order.';
//       } else if (error.message.includes('Network')) {
//         errorMessage = 'Network error. Please check your internet connection.';
//       }
//       onComplete({ success: false, error: error.message, userMessage: errorMessage });
//       return { success: false, error: error.message, userMessage: errorMessage };
//     }
//   }

//   async openPDF(filePath) {
//     try {
//       if (Platform.OS === 'android') {
//         await RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf');
//       } else {
//         await RNFetchBlob.ios.openDocument(filePath);
//       }
//     } catch (error) {
//       console.error('Error opening PDF:', error);
//       // Silently handle error since PDF is already downloaded
//     }
//   }
// }

// // UI Component for PDF Download
// const PDFDownloadModal = ({ visible, onClose, orderId, authToken = null }) => {
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [progress, setProgress] = useState('');
//   const [downloadResult, setDownloadResult] = useState(null);
//   const [scaleAnim] = useState(new Animated.Value(0));

//   const pdfDownloader = new PDFInvoiceDownloader();

//   React.useEffect(() => {
//     if (visible) {
//       setDownloadResult(null);
//       setProgress('');
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         useNativeDriver: true,
//         tension: 100,
//         friction: 8,
//       }).start();
//     }
//   }, [visible]);

//   const handleDownload = async () => {
//     setIsDownloading(true);
//     setDownloadResult(null);

//     const onProgress = (message) => {
//       setProgress(message);
//     };

//     const onComplete = (result) => {
//       setIsDownloading(false);
//       setDownloadResult(result);
      
//       // Auto close modal after 2 seconds on success
//       if (result.success) {
//         setTimeout(() => {
//           handleClose();
//         }, 2000);
//       }
//     };

//     if (authToken) {
//       await pdfDownloader.downloadInvoiceWithToken(orderId, authToken, onProgress, onComplete);
//     } else {
//       await pdfDownloader.downloadInvoice(orderId, onProgress, onComplete);
//     }
//   };

//   const handleClose = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 0,
//       useNativeDriver: true,
//       tension: 100,
//       friction: 8,
//     }).start(() => {
//       onClose();
//       setIsDownloading(false);
//       setProgress('');
//       setDownloadResult(null);
//     });
//   };

//   const handleRetry = () => {
//     setDownloadResult(null);
//     handleDownload();
//   };

//   return (
//     <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
//       <View style={styles.modalOverlay}>
//         <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Download Invoice</Text>
//             <Text style={styles.orderIdText}>Order ID: {orderId}</Text>
//           </View>

//           <View style={styles.modalBody}>
//             {isDownloading && (
//               <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
//                 <Text style={styles.progressText}>{progress}</Text>
//               </View>
//             )}

//             {downloadResult && (
//               <View style={styles.resultContainer}>
//                 {downloadResult.success ? (
//                   <View style={styles.successContainer}>
//                     <View style={styles.successIcon}>
//                       <Text style={styles.checkmark}>✓</Text>
//                     </View>
//                     <Text style={styles.successTitle}>Download Complete!</Text>
//                     <Text style={styles.successMessage}>
//                       Invoice has been downloaded and opened successfully.
//                     </Text>
//                     {downloadResult.filename && (
//                       <Text style={styles.filenameText}>
//                         Saved as: {downloadResult.filename}
//                       </Text>
//                     )}
//                   </View>
//                 ) : (
//                   <View style={styles.errorContainer}>
//                     <View style={styles.errorIcon}>
//                       <Text style={styles.errorMark}>✕</Text>
//                     </View>
//                     <Text style={styles.errorTitle}>Download Failed</Text>
//                     <Text style={styles.errorMessage}>
//                       {downloadResult.userMessage || downloadResult.error}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             )}

//             {!isDownloading && !downloadResult && (
//               <View style={styles.initialContainer}>
//                 <View style={styles.pdfIcon}>
//                   <Text style={styles.pdfIconText}>📄</Text>
//                 </View>
//                 <Text style={styles.initialMessage}>
//                   Ready to download and open your invoice PDF
//                 </Text>
//               </View>
//             )}
//           </View>

//           <View style={styles.modalFooter}>
//             {!isDownloading && !downloadResult && (
//               <>
//                 <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
//                   <Text style={styles.downloadButtonText}>Download & Open</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {downloadResult && !downloadResult.success && (
//               <>
//                 <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
//                   <Text style={styles.cancelButtonText}>Close</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.downloadButton} onPress={handleRetry}>
//                   <Text style={styles.downloadButtonText}>Retry</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {downloadResult && downloadResult.success && (
//               <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
//                 <Text style={styles.doneButtonText}>Done</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </Animated.View>
//       </View>
//     </Modal>
//   );
// };

// // Usage Component
// const InvoiceDownloadButton = ({ orderId, authToken, buttonStyle, textStyle }) => {
//   const [modalVisible, setModalVisible] = useState(false);

//   return (
//     <>
//       <TouchableOpacity
//         style={[styles.invoiceButton, buttonStyle]}
//         onPress={() => setModalVisible(true)}
//       >
//         <Text style={[styles.invoiceButtonText, textStyle]}>
//           📥 Download Invoice
//         </Text>
//       </TouchableOpacity>

//       <PDFDownloadModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//         orderId={orderId}
//         authToken={authToken}
//       />
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modalContainer: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     width: width * 0.9,
//     maxWidth: 400,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.25,
//     shadowRadius: 16,
//     elevation: 16,
//   },
//   modalHeader: {
//     padding: 24,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 4,
//   },
//   orderIdText: {
//     fontSize: 14,
//     color: '#666',
//   },
//   modalBody: {
//     padding: 24,
//     minHeight: 120,
//     justifyContent: 'center',
//   },
//   modalFooter: {
//     padding: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },

//   // Loading States
//   loadingContainer: {
//     alignItems: 'center',
//   },
//   loader: {
//     marginBottom: 16,
//   },
//   progressText: {
//     fontSize: 16,
//     color: '#333',
//     textAlign: 'center',
//   },

//   // Initial State
//   initialContainer: {
//     alignItems: 'center',
//   },
//   pdfIcon: {
//     marginBottom: 16,
//   },
//   pdfIconText: {
//     fontSize: 48,
//   },
//   initialMessage: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 24,
//   },

//   // Success State
//   resultContainer: {
//     alignItems: 'center',
//   },
//   successContainer: {
//     alignItems: 'center',
//   },
//   successIcon: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: '#4CAF50',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   checkmark: {
//     fontSize: 32,
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   successTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#4CAF50',
//     marginBottom: 8,
//   },
//   successMessage: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 20,
//     marginBottom: 8,
//   },
//   filenameText: {
//     fontSize: 12,
//     color: '#999',
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },

//   // Error State
//   errorContainer: {
//     alignItems: 'center',
//   },
//   errorIcon: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: '#F44336',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   errorMark: {
//     fontSize: 32,
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   errorTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#F44336',
//     marginBottom: 8,
//   },
//   errorMessage: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 20,
//   },

//   // Buttons
//   cancelButton: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     backgroundColor: '#f5f5f5',
//     marginRight: 10,
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     fontWeight: '600',
//   },
//   downloadButton: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     backgroundColor: '#007AFF',
//     marginLeft: 10,
//   },
//   downloadButtonText: {
//     fontSize: 16,
//     color: 'white',
//     textAlign: 'center',
//     fontWeight: '600',
//   },
//   doneButton: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     backgroundColor: '#4CAF50',
//   },
//   doneButtonText: {
//     fontSize: 16,
//     color: 'white',
//     textAlign: 'center',
//     fontWeight: '600',
//   },

//   // Invoice Button
//   invoiceButton: {
//     backgroundColor: '#007AFF',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   invoiceButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// // Export both the original downloader class and the new UI components
// const pdfDownloader = new PDFInvoiceDownloader();

// export const downloadInvoicePDF = (orderId) => pdfDownloader.downloadInvoice(orderId, () => {}, () => {});
// export const downloadInvoicePDFWithToken = (orderId, authToken) => pdfDownloader.downloadInvoiceWithToken(orderId, authToken, () => {}, () => {});
// export { PDFDownloadModal, InvoiceDownloadButton };
// export default pdfDownloader;