import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import RNPickerSelect from 'react-native-picker-select';
import AppText from '../components/AppText';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import { DetailsHeader } from '../components/DetailsHeader';
import ActionButton from '../components/ActionButton';
import BackgroundWrapper from '../components/BackgroundWrapper';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import Loader from '../components/Loader';

const NewTicketScreen = ({ navigation }) => {
  const { theme, userID } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const pickerRef = useRef(null);
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await apiClient.get(
          '/api/dealer/supportticket_issues/get-issues',
        );
        const apiIssues = response?.data?.data?.issues || [];

        // Transform into RNPickerSelect format
        const formattedIssues = apiIssues.map(issue => ({
          label: issue?.issue_name || 'N/A',
          value: issue?._id || 'N/A',
          raw: issue, // optional, keep raw if needed later
        }));

        setIssueOptions(formattedIssues);
      } catch (error) {
        console.error('Issue fetch error:', error);
        showToast('error', '', 'Failed to load issues');
      }
    };

    fetchIssues();
  }, []);

  const [issueOptions, setIssueOptions] = useState([]);

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const pickFile = async () => {
    try {
      const imageResult = await launchImageLibrary({
        mediaType: 'photo', // images and videos
        selectionLimit: 10,
      });

      if (imageResult.didCancel) return;

      if (imageResult.assets) {
        const files = imageResult.assets.map(file => ({
          uri: file.uri,
          name: file.fileName,
          type: file.type,
        }));
        // setSelectedFiles(prev => [...prev, ...files]);
        setSelectedFiles(prev => {
          const uniqueNewFiles = files.filter(
            newFile =>
              !prev.some(
                existingFile =>
                  existingFile.name === newFile.name &&
                  existingFile.size === newFile.size &&
                  existingFile.type === newFile.type, // optional, for stricter match
              ),
          );
          return [...prev, ...uniqueNewFiles];
        });
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error picking file');
    }
  };

  const removeFile = index => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedIssue) {
      showToast('error', 'Validation Error', 'Please select an issue');
      return;
    }

    if (!description.trim()) {
      showToast('error', 'Validation Error', 'Please enter a description');
      return;
    }
    if (description.trim().length < 11) {
      showToast('error', 'Validation Error', 'Description must be at least 11 characters long');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('userId', userID); // or the hardcoded one if needed
      formData.append('subjectId', selectedIssue?.value);
      formData.append('description', description);

      selectedFiles.forEach((file, index) => {
        formData.append('attachments', {
          uri: file.uri,
          name: file.name || `file_${index}`,
          type: file.type || 'application/octet-stream',
        });
      });

      const response = await apiClient.post(
        '/api/dealer/support_TicketRoutes/add',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Response:', response.data);
      showToast('success', 'Success', 'Ticket submitted successfully');
      navigation.replace('TicketListScreen');
    } catch (error) {
      if (error.response) {
        console.error('API Error:', error.response.data);
      } else {
        console.error('Submit Error:', error.message);
      }
      showToast('error', 'Submission Failed', 'Could not submit the ticket.');
    }
  };

  return (
    <BackgroundWrapper
      style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DetailsHeader title="New Ticket" rightType="none" />

      {/* ✅ Keyboard avoiding & dismiss wrapper */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? hp('5%') : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.contentContainer}>
            <ScrollView
              contentContainerStyle={{ paddingBottom: hp('10%') }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>

              {/* Dropdown */}
              <AppText style={[styles.label, { color: theme.colors.text }]}>
                Select a issue :
              </AppText>

              {/* Wrapper to make picker open anywhere pressed */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={{ marginBottom: hp('2%') }}
                onPress={() => {
                  if (pickerRef.current) {
                    pickerRef.current.togglePicker();
                  }
                }}
              >
                <RNPickerSelect
                  ref={pickerRef}
                  onValueChange={(value) => {
                    const selected = issueOptions.find((item) => item.value === value);
                    setSelectedIssue(selected);
                  }}
                  items={issueOptions}
                  placeholder={{
                    label: 'Select an issue...',
                    value: null,
                    color: theme.colors.placeholder,
                  }}
                  useNativeAndroidPickerStyle={false}
                  pickerProps={{
                    mode: 'dialog',
                  }}
                  disabled={false} // ✅ Ensure picker is not disabled
                  style={{
                    inputIOS: [
                      styles.pickerInput,
                      {
                        backgroundColor: theme.colors.inputBg,
                        color: theme.colors.text,
                        // ✅ Ensure pointer events are enabled
                        pointerEvents: 'none', // This prevents double handling
                      },
                    ],
                    inputAndroid: [
                      styles.pickerInput,
                      {
                        backgroundColor: theme.colors.inputBg,
                        color: theme.colors.text,
                      },
                    ],
                    placeholder: {
                      color: theme.colors.placeholder,
                    },
                    iconContainer: {
                      top: hp('2%'),
                      right: wp('3%'),
                    },
                  }}
                  Icon={() => (
                    <Icon name="chevron-down" size={20} color={theme.colors.text} />
                  )}
                />
              </TouchableOpacity>

              {/* Description */}
              <View style={styles.descriptionHeader}>
                <AppText style={[styles.label, { color: theme.colors.text }]}>
                  Description :
                </AppText>
                <AppText
                  style={{
                    color: theme.colors.placeholder,
                    fontSize: wp('3.5%'),
                  }}>
                  (1500 characters)
                </AppText>
              </View>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.inputBg,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Description here"
                placeholderTextColor={theme.colors.placeholder}
                multiline
                maxLength={1500}
                numberOfLines={6}
                textAlignVertical="top"
                value={description}
                keyboardType="default"
                onChangeText={setDescription}
              />

              {/* File Upload */}
              <AppText
                style={[
                  styles.label,
                  { color: theme.colors.text, marginTop: hp('2%') },
                ]}>
                Upload file :
              </AppText>

              <TouchableOpacity
                style={[
                  styles.uploadBox,
                  { backgroundColor: theme.colors.inputBg },
                ]}
                onPress={pickFile}>
                <View style={styles.uploadIconContainer}>
                  <Icon name="attach" size={20} color="#242424" />
                </View>
                <AppText
                  style={[
                    styles.uploadText,
                    { color: theme.colors.placeholder },
                  ]}>
                  Attach screenshot or file
                </AppText>
              </TouchableOpacity>

              {selectedFiles.length > 0 && (
                <View style={styles.previewContainer}>
                  {selectedFiles.map((file, index) => (
                    <View key={index} style={styles.fileItem}>
                      {file.type?.startsWith('image') ? (
                        <Image
                          source={{ uri: file.uri }}
                          style={styles.imagePreview}
                        />
                      ) : (
                        <Icon
                          name="document-text-outline"
                          size={wp('8%')}
                          color="#333"
                        />
                      )}
                      <AppText style={styles.fileName}>{file.name}</AppText>
                      <TouchableOpacity onPress={() => removeFile(index)}>
                        <Icon
                          name="close-circle"
                          size={wp('5%')}
                          color="red"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <ActionButton label="Submit Ticket" onPress={handleSubmit} style={{ marginTop: wp('2%') }} />
            </ScrollView>


            {loading && <Loader visible={true} />}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    // paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
  },
  label: {
    fontSize: wp('4%'),
    fontWeight: '600',
    marginBottom: hp('1%'),
  },
  pickerInput: {
    fontSize: wp('4%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('2%'),
    paddingRight: wp('8%'),
    marginBottom: hp('2%'),
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  limitText: {
    fontSize: wp('3.5%'),
  },
  textArea: {
    backgroundColor: '#f2f2f2',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    fontSize: wp('4%'),
    minHeight: hp('20%'),
    color: '#000',
  },
  uploadBox: {
    backgroundColor: '#f2f2f2',
    borderRadius: wp('2%'),
    padding: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1%'),
  },
  uploadIconContainer: {
    backgroundColor: '#ccc',
    borderRadius: wp('10%'),
    padding: wp('2%'),
    marginBottom: hp('1%'),
  },
  uploadText: {
    fontSize: wp('4%'),
    color: '#444',
  },
  uploadButton: {
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('3%'),
    borderRadius: wp('2%'),
    justifyContent: 'center',
    marginBottom: hp('2%'),
  },
  previewContainer: {
    marginTop: hp('2%'),
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  imagePreview: {
    width: wp('15%'),
    height: wp('15%'),
    marginRight: wp('3%'),
    borderRadius: wp('2%'),
  },
  fileName: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#333',
  },
});

export default NewTicketScreen;