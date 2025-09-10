import React, { useContext, useRef, useEffect } from 'react';
import {
  Modal,
  View,

  StyleSheet,
  TouchableWithoutFeedback,
  Switch,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';
import AppText from './AppText';
const { height } = Dimensions.get('window');

const ThemeToggleModal = ({ visible, onClose, isDark, toggleTheme }) => {
  const { theme } = useContext(AuthContext);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                {
                  backgroundColor: theme.colors.card,
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              {/* Title and Close */}
              <View style={styles.headerRow}>
                <AppText style={[styles.title, { color: theme.colors.text }]}>
                  Appearance
                </AppText>
                <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {/* Switch */}
              <View style={styles.switchRow}>
                <AppText style={[styles.label, { color: theme.colors.text }]}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </AppText>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={isDark ? theme.colors.text : theme.colors.card}
                  ios_backgroundColor={theme.colors.border}
                />
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
