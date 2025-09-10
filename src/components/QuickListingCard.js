import React, { useContext } from 'react';
import {
  View,
 
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { CarBannerImage } from '../../public_assets/media';
import { quickListCardData } from '../constants/strings';
import WaveBackground from './WaveBackground';
import { AuthContext } from '../context/AuthContext';
import AppText from './AppText';
const QuickListingCard = ({
  title = 'Add Your Listings – Quick & Easy',
  cardTitle = 'Car Listings',
  cardSubtitle = 'Looking to sell a car? Add vehicle details in just a few steps and get it in front of interested buyers.',
  cardImage = CarBannerImage,
  selectedCategory ='',
  buttonText = 'Add Details',
  onPress,
}) => {
     const { theme, isDark } = useContext(AuthContext);
  const categoryData = quickListCardData[selectedCategory] || {};

  const effectiveCardTitle = categoryData.cardTitle || cardTitle;
  const effectiveCardSubtitle =
    categoryData.cardDescription || cardSubtitle;
  const effectiveCardImage = categoryData.image || cardImage;

  return (
    <View style={styles.container}>
      <AppText style={[styles.title, {color: theme.colors.text}]}>{title}</AppText>

      <View style={styles.cardWrapper}>
        <View style={StyleSheet.absoluteFill}>
          <WaveBackground />
        </View>

        <View style={styles.contentRow}>
          <View style={styles.leftColumn}>
            <AppText style={styles.cardHeading}>{effectiveCardTitle}</AppText>
            <AppText style={styles.cardDescription}>
              {effectiveCardSubtitle}
            </AppText>

            <TouchableOpacity onPress={onPress} style={styles.button}>
              <AppText style={styles.buttonText}>{buttonText}</AppText>
            </TouchableOpacity>
          </View>

          <Image
            source={effectiveCardImage}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

export default QuickListingCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: hp('1%'),
  },
  title: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#101010',
  },
  cardWrapper: {
    alignSelf: 'stretch',
    backgroundColor: '#E6F2FE',
    borderRadius: wp('3%'),
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    padding: wp('4%'),
    minHeight: hp('20%'),
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1,
    paddingRight: wp('2%'),
    justifyContent: 'center',
  },
  cardHeading: {
   
    fontSize: wp('4.5%'),
    fontWeight: '800',
    color: '#101010',
    marginBottom: hp('0.5%'),
  },
  cardDescription: {
   
    fontSize: wp('2.8%'),
    fontWeight: '500',
    color: '#434343',
    marginBottom: hp('2%'),
  },
  button: {
    width: wp('36%'),
    height: hp('4.5%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#055597',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffffee',
  },
  buttonText: {
   
    fontSize: wp('3.2%'),
    color: '#055597',
    fontWeight: '600',
  },
  image: {
    width: wp('42%'),
    height: hp('15%'),
    alignSelf: 'center',
    marginTop: hp('2%'),
    transform: [{ scaleX: -1 }],
  },
});