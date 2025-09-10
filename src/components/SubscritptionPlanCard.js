import React, { useContext } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import AppText from './AppText';
import { showToast } from '../utils/toastService';

const SubscriptionPlanCard = ({
  title,
  duration = '',
  oldPrice = '',
  newPrice = '',
  listing = '',
  onPress,
  isSubscribed = true, // 🔹 Added prop
}) => {
  const { theme } = useContext(AuthContext);

  return (
    <TouchableOpacity
      onPress={
        isSubscribed
          ? () => Alert.alert('Already Subscribed')
          : onPress
      }
      activeOpacity={isSubscribed ? 1 : 0.3}
    // disabled={isSubscribed}
    >
      <LinearGradient
        colors={['#055597', '#6FB8FE', '#055597']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.5, 1]}
        style={[styles.card, isSubscribed === true && { opacity: 0.85 }]}
      >
        <View style={{ flex: 1, justifyContent: 'space-between', padding: wp('5%') }}>
          {/* Header */}
          <View style={styles.headerRow}>
            <AppText style={styles.title}>{title}</AppText>
            {!isSubscribed === true && (
              <Feather name="arrow-right" size={hp('2.8%')} color="#FFFFFF" />
            )}
          </View>

          {/* Month + Subscribed Flag Row */}
          <View style={styles.monthRow}>
            <View style={styles.monthTag}>
              <AppText style={styles.monthText}>{duration}</AppText>
            </View>

            {isSubscribed === true && (
              <View style={styles.subscribedFlag}>
                <AppText style={styles.subscribedText}>Subscribed</AppText>
              </View>
            )}
          </View>

          {/* Details */}
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Icon name="check-circle" size={hp('2%')} color="#FFFFFF" />
              <AppText style={styles.detailText}>Duration - {duration}</AppText>
            </View>
            <View style={styles.detailRow}>
              <Icon name="check-circle" size={hp('2%')} color="#FFFFFF" />
              <AppText style={styles.detailText} ellipsizeMode="tail" numberOfLines={1}>
                No. of listing - {listing}
              </AppText>
            </View>
            <View style={styles.detailRow}>
              <Icon name="check-circle" size={hp('2%')} color="#FFFFFF" />
              <AppText style={styles.detailText} ellipsizeMode="tail" numberOfLines={1}>
                Cancel at anytime in settings
              </AppText>
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.priceBox}>
            <AppText style={styles.oldPrice}>{oldPrice}</AppText>
            <AppText style={styles.newPrice}>₹{newPrice}/</AppText>
            <AppText style={{ fontSize: hp('2%'), fontWeight: '500', color: '#FFFFFF', }}>week</AppText>
            <AppText style={styles.gstText}>Including GST</AppText>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {},
  card: {
    borderRadius: wp('3%'),
    justifyContent: 'space-between',
    margin: wp('1%'),
    borderRadius: wp('3%'),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: hp('2.4%'),
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  monthTag: {
    backgroundColor: '#FFC536',
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('0.7%'),
    borderRadius: wp('6%'),
    marginRight: wp('2%'),
  },
  monthText: {
    fontWeight: '600',
    fontSize: hp('1.7%'),
    color: '#141414',
  },
  details: {
    marginTop: hp('1.5%'),
    width: '70%',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.7%'),
  },
  detailText: {
    fontSize: hp('1.7%'),
    color: '#FFFFFF',
    marginLeft: wp('2%'),
  },
  priceBox: {
    position: 'absolute',
    right: wp('4%'),
    bottom: hp('2.5%'),
    alignItems: 'flex-end',
  },
  oldPrice: {
    fontSize: hp('1.6%'),
    color: '#B8B8B8',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  newPrice: {
    fontSize: hp('3.2%'),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gstText: {
    fontSize: hp('1.3%'),
    color: '#E4E4E4',
    marginTop: hp('0.3%'),
  },
  subscribedFlag: {
    backgroundColor: '#28A745',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.6%'),
    borderRadius: wp('6%'),
    // zIndex: 1
  },
  subscribedText: {
    fontWeight: '700',
    fontSize: hp('1.6%'),
    color: '#FFFFFF',
  },
});

export default SubscriptionPlanCard;
