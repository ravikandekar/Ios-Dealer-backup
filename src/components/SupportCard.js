import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import ActionButton from './ActionButton';
// import { supportTicket } from '../../public_assets/media'; // Update to correct path
import AppText from './AppText';
const SupportCard = ({message, buttonText, onPress}) => {
  return (
    <View style={styles.card}>
      {/* AppText + Button Section */}
      <View style={styles.textSection}>
        <AppText style={styles.cardText}>{message}</AppText>
        <ActionButton
          label={buttonText}
          onPress={onPress}
          style={styles.actionButton}
        />
      </View>

      {/* Full Cover Image Section */}
      <View style={styles.imageSection}>
        {/* Background Box */}
        <View style={styles.backgroundBox}></View>

        {/* Image Wrapper in Front */}
        <View style={styles.imageClipWrapper}>
          <Image
            source={require('../../public_assets/media/images/support_agent.png')}
            style={styles.cardImage}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#E6F2FE',
    borderRadius: wp('3%'),
    overflow: 'hidden',
    height: wp('36%'), // Match height of the card visually to your reference
    marginBottom: hp('2%'),
  },
  textSection: {
    flex: 2,
    justifyContent: 'center',
    paddingLeft: wp('4%'),
    // paddingVertical: hp('2%'),
  },
  cardText: {
    fontSize: wp('3.7%'),
    color: '#333',
    marginBottom: hp('1.3%'),
  },
  actionButton: {
    width: wp('50%'),
  },
  imageSection: {
    flex: 1,
    // position: 'relative',
  },

  imageClipWrapper: {
    flex: 1,
    // overflow: 'hidden',
    top: -hp('1.2%'),
    left: 0,
    right: 0,
    // alignItems: 'center',
    zIndex: 1, // Ensure it’s in front
    // backgroundColor: 'red'
  },

  cardImage: {
    width: wp('36%'),
    height: hp('22%'),
    resizeMode: 'cover',
    transform: [{scaleX: -1}],
  },

  backgroundBox: {
    position: 'absolute',
    backgroundColor: '#6B8CF7',
    height: hp('23%'),
    width: wp('13%'),
    alignSelf: 'flex-end',
    zIndex: 0,
  },
});

export default SupportCard;
