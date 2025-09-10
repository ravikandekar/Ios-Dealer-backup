import React from 'react';
import { View,  StyleSheet } from 'react-native';
import AppText from './AppText';
const ProfileAvatar = ({ initial }) => {
  return (
    <View style={styles.avatarContainer}>
      <AppText style={styles.avatarText}>{initial}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#006666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ProfileAvatar;