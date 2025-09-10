import React, { useContext, useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Rating } from 'react-native-ratings';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AppText from './AppText';
import apiClient from '../utils/apiClient';
import ActionButton from './ActionButton';
import { AuthContext } from '../context/AuthContext';
import { showToast } from '../utils/toastService';

const FeedbackModal = ({ visible, onClose, userId, postUrl, onResult, orderId }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(1); // Default rating 1
  const [feedbackError, setFeedbackError] = useState('');
  const [loading, setLoading] = useState(false);
  const { User_id, theme } = useContext(AuthContext);

  const bottomSheetAnimation = useRef(new Animated.Value(0)).current;

  const show = () => {
    Animated.timing(bottomSheetAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hide = () => {
    Animated.timing(bottomSheetAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setFeedbackText('');
      setRating(1);
      setFeedbackError('');
      onClose();
    });
  };

  const translateY = bottomSheetAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      setFeedbackError('Please enter your feedback');
      return;
    }

    setFeedbackError('');
    setLoading(true);

    try {
      const payload = {
        rating: rating,
        comment: feedbackText,
      };

      const response = await apiClient.post('/api/cms/dealerfeedbackRoutes/add', payload);
      const { success, message } = response.data;

      if (success) {
        showToast('success', '', 'Thank you for your feedback!');
        onResult && onResult(true);
        hide();
      } else {
        showToast('error', '', message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      showToast('error', '', 'Something went wrong while submitting feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      show();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={hide}
    >
      <TouchableWithoutFeedback onPress={hide}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, justifyContent: 'flex-end' }}
            keyboardVerticalOffset={0}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Animated.View
                style={[
                  styles.feedbackContainer,
                  {
                    transform: [{ translateY }],
                    backgroundColor: theme.colors.background,
                  },
                ]}
              >
                {/* Header */}
                <View style={styles.feedbackHeader}>
                  <Icon
                    name="star-outline"
                    size={24}
                    color={theme.colors.primary}
                    style={styles.feedbackIcon}
                  />
                  <AppText style={[styles.feedbackTitle, { color: theme.colors.text }]}>
                    Feedback
                  </AppText>
                  <TouchableOpacity onPress={hide} style={styles.closeIcon}>
                    <Icon name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Feedback Input */}
                <AppText style={[styles.feedbackLabel, { color: theme.colors.text }]}>
                  Share your feedback
                </AppText>
                <TextInput
                  style={[
                    styles.feedbackInput,
                    {
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      backgroundColor:
                        theme.colors.inputBackground || theme.colors.card,
                    },
                  ]}
                  placeholder="e.g. App performance, feature suggestions"
                  placeholderTextColor={theme.colors.placeholder}
                  multiline
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  maxLength={400}
                />

                {/* Rating */}
                <AppText style={[styles.rateUsText, { color: theme.colors.text }]}>
                  Rate Us
                </AppText>
                <View style={styles.starsContainer}>
                  <Rating
                    type="star"
                    ratingCount={5}
                    imageSize={wp('8%')}
                    onFinishRating={(value) => {
                      const roundedValue = Math.round(value * 2) / 2;
                      const finalValue = Math.max(1, roundedValue);
                      setRating(finalValue);
                    }}
                    startingValue={rating}
                    minValue={1}
                  />
                </View>

                {/* Error */}
                {feedbackError ? (
                  <AppText style={[styles.errorText, { color: theme.colors.danger || 'red' }]}>
                    {feedbackError}
                  </AppText>
                ) : null}

                {/* Submit */}
                <ActionButton label="Submit" loading={loading} onPress={handleSubmit} />
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FeedbackModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
  },
  feedbackContainer: {
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  feedbackIcon: {
    marginRight: 8,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeIcon: {
    paddingLeft: 12,
    padding: 4,
  },
  feedbackLabel: {
    marginTop: 10,
    fontSize: 16,
  },
  feedbackInput: {
    height: 80,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    padding: 10,
    textAlignVertical: 'top',
  },
  rateUsText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  starsContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  errorText: {
    marginBottom: 8,
  },
});
