import React, { useContext } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import AppText from './AppText';
export const DetailsHeader = ({
  title,
  onBackPress ,
  rightType = 'none', // 'steps' | 'action' | 'none'
  stepText = '',
  stepTextBg = '#FFFBAC',
  actionText = '',
  actionIcon = '',
  divider = true,
  leftComponentIcon = true,
  onActionPress = () => { },
}) => {
  const { theme } = useContext(AuthContext);
  const navigation = useNavigation();
  const handleBackPress = onBackPress || (() => navigation.goBack());
  return (
    <View>
      <View style={[styles.container, { backgroundColor: theme.colors.backgroundColor }]}>
        {/* Back Button */}
        {leftComponentIcon && (
          <TouchableOpacity onPress={handleBackPress} style={styles.left}>
            <Icon name="chevron-back" size={wp('7%')} color={theme.colors.text} />
          </TouchableOpacity>
        )}

        {/* Title */}
        <AppText style={[styles.title, { color: theme.colors.text, marginLeft: leftComponentIcon === false ? wp('2.4%') : 0 }]}>{title}</AppText>

        {/* Right Element */}
        <View style={styles.right}>
          {rightType === 'steps' && (
            <View style={[styles.stepBox, { backgroundColor: stepTextBg }]}>
              <AppText style={[styles.stepText, { color: theme.colors.placeholder }]}>{stepText}</AppText>
            </View>
          )}

          {rightType === 'action' && (
            <TouchableOpacity onPress={onActionPress} style={styles.actionContainer}>
              <Icon name={actionIcon} size={wp('6%')} color={theme.colors.Highlighterwords} solid />
              <AppText style={[styles.actionText, { color: theme.colors.Highlighterwords }]}>{actionText}</AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {divider && (
        <View style={[styles.hr, { backgroundColor: theme.colors.text }]} />

      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('1%'),
    paddingVertical: hp('1%'),
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  left: {
    width: wp('10%'),
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    textAlign: 'left',
    fontSize: wp('5.5%'),
    fontWeight: '600',
    marginLeft: -wp('2%'),
    textTransform:'capitalize'
  },
  right: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('4%'),
  },
  stepBox: {
    // backgroundColor: '#FFFBAC',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
  },
  stepText: {
    // color: '##FFFEBB',
    fontWeight: '600',
    fontSize: wp('4%'),
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: wp('1%'),
  },
  actionText: {
    color: '#F7931E',
    fontWeight: '600',
    fontSize: wp('5%'),
    // marginLeft: wp('1%'),
  },
  hr: {
    height: 1,
    width: '100%',
    marginBottom: wp('1%'),
  },
});
