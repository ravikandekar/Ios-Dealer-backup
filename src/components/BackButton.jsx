
import React, { useContext } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext'; // adjust path if needed
import AppText from './AppText';


const BackButton = ({
  onPress,
  label = 'Back',
  iconSize = wp('8%'),
  textSize = wp('5.5%'),
}) => {
  const { theme } = useContext(AuthContext);

  return (
    <View style={[styles.container1, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onPress || (() => console.log('Go back'))}>
          <Icon name="chevron-left" size={iconSize} color={theme.colors.text} />
        </TouchableOpacity>
        <AppText style={[styles.label, { color: theme.colors.text, fontSize: textSize }]}>{label}</AppText>
      </View>
      <View style={[styles.hr, { backgroundColor: theme.colors.text }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: wp('2%'),
    marginBottom: wp('1%'),
  },
  container1: {
    width: '100%',
  },
  label: {
    marginLeft: wp('1%'),
    fontWeight: '600',
  },
  hr: {
    height: 1,
    width: '100%',
    marginBottom: wp('1%'),
  },
});

export default BackButton;
