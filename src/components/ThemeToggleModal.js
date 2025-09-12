import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Switch,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AppText from './AppText';

const ThemeToggleModal = ({ visible, onClose, useApi = true, name, userid }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const [marked, setMarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onClose());
    }
  }, [visible]);

  const handleMarkAttendance = async (value) => {
    if (!useApi) {
      setMarked(value); // ✅ Static mode
      return;
    }

    setLoading(true);
    try {
      // ✅ Build FormData
      const formData = new FormData();
      formData.append('userId', `${userid} => Dealer App`);  // ✅ formatted string
      formData.append('mobileNumber', name);
      formData.append('appSignature', 'sdfgjkldsfksdfhksjdfhklsdfhksjfhksdfhksdfkjsdfhjk');

      // ✅ API call with axios
      const response = await axios.post(
        'https://sumagodemo.com/markattendance.php',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = response.data;

      if (data?.status === 'success') {
        setMarked(true);
        Alert.alert('Success', data.message || 'Attendance marked');
      } else {
        throw new Error(data?.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('❌ Attendance API error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
      setMarked(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              {/* Title and Close */}
              <View style={styles.headerRow}>
                <AppText style={styles.title}>Mark Attendance</AppText>
                <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              {/* Switch */}
              <View style={styles.switchRow}>
                <AppText
                  style={[
                    styles.label,
                    { color: marked ? 'green' : '#000' }, // ✅ Green if marked
                  ]}
                >
                  {marked ? 'Attendance Marked' : 'Mark Attendance'}
                </AppText>

                {loading ? (
                  <ActivityIndicator size="small" color="green" />
                ) : (
                  <Switch
                    value={marked}
                    onValueChange={handleMarkAttendance}
                    trackColor={{ false: '#ccc', true: 'green' }}
                    thumbColor={marked ? '#fff' : '#f4f3f4'}
                  />
                )}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ThemeToggleModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#fff',
    elevation: 5,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeIcon: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
});
