import React, { useContext } from 'react';
import { View,  StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import AppText from './AppText';
const SubscriptionCard = ({ title, price, lastDate, expiryDate, listings, onDownload }) => {
    const { theme } = useContext( AuthContext );
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card}]}>
      {/* Top Row: Title + Price */}
      <View style={styles.headerRow}>
        <AppText style={[styles.title, { color: theme.colors.text}]}>{title}</AppText>
        <View style={styles.priceContainer}>
          <AppText style={[styles.price, { color: theme.colors.text}]}>₹{price}</AppText>
          <AppText style={[styles.perMonth, { color: theme.colors.text}]}>/week</AppText>
        </View>
      </View>

      {/* Divider */}

      {/* Subscription Info Rows */}
      <View style={styles.infoRow}>
        <AppText style={[styles.label,{ color: theme.colors.placeholder}]}>Last Subscription :</AppText>
        <AppText style={[styles.value, { color: theme.colors.text}]}>{lastDate}</AppText>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <AppText style={[styles.label,{ color: theme.colors.placeholder}]}>Expiry :</AppText>
        <AppText style={[styles.value, { color: theme.colors.text}]}>{expiryDate}</AppText>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <AppText style={[styles.label,{ color: theme.colors.placeholder}]}>Total Listings:</AppText>
        <AppText style={[styles.value, { color: theme.colors.text}]}>{listings}</AppText>
      </View>

      <View style={styles.divider} />

      {/* Download Invoice */}
      <View style={styles.downloadContainer}>
        <TouchableOpacity onPress={onDownload} style={styles.downloadButton}>
          <Icon name="download" size={16} color="#055597" />
          <AppText style={styles.downloadText}>Download Invoice</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SubscriptionCard;

const styles = StyleSheet.create({
  card: {
  backgroundColor: '#fff',
  borderRadius: wp('2.5%'),
  padding: wp('4%'),
  marginVertical: hp('1%'),
  marginHorizontal: wp('3%'),

  // Android elevation
  elevation: 5,

  // iOS shadow
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,


},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp('1.5%'),
  },
  title: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#000',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: wp('5%'),
    fontWeight: '700',
    color: '#000',
  },
  perMonth: {
    fontSize: wp('3.8%'),
    fontWeight: '400',
    color: '#555',
    marginTop: -2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp('1%'),
  },
  label: {
    fontSize: wp('4%'),
    color: '#555',
    fontWeight: '600',
  },
  value: {
    fontSize: wp('3.5%'),
    fontWeight: '700',
   
    color: '#000',
  },
  divider: {
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 1,
  },
  downloadContainer: {
    alignItems: 'flex-end',
    marginTop: hp('1.5%'),
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadText: {
    marginLeft: 5,
    color: '#055597',
    fontSize: wp('3.5%'),
    fontWeight: '800',
   
  },
});
