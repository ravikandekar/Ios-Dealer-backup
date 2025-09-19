import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Platform
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import ImageSlider from './ImageSlider';
import AppText from './AppText';

const VehicleCard = ({ data, theme, onPressDelete, onPressShare, onPress, onPressEdit, isDraft, }) => {
  const isSold = data?.isSold;
  const isDeleted = data?.isDeleted;
  const isActive = data?.isdisable || false;
  const shareVehicleDetails = async () => {
    try {
      const shareData = {
        title: data.title,
        image: data.images[0],
        description: data.description,
      };
      await Share.share({
        message: JSON.stringify(shareData),
      });
    } catch (error) {
      console.error('Error sharing vehicle details:', error);
    }
  }
  return (
    <TouchableOpacity style={[styles.cardContainer, { backgroundColor: theme.colors.card }]} onPress={onPress}>
      {isSold && (
        <View style={styles.overlayContainer}>
          <Image
            source={require('../../public_assets/media/images/soldTransparent.png')}
            style={styles.soldStamp}
            resizeMode="contain"
          />
        </View>
      )}
      {isDeleted && (
        <View style={[styles.overlayContainer, { backgroundColor: '#970505aa' }]}>
          <Image
            source={require('../../public_assets/media/images/logo.png')}
            style={styles.soldStamp}
            resizeMode="contain"
          />
        </View>
      )}
      {isActive && (
        <View style={[styles.overlayContainer, { backgroundColor: '#00000080' }]}>
          <AppText style={styles.inactiveText}>Inactive</AppText>
        </View>
      )}
      <View style={{ paddingTop: wp('3%') }}>
        <ImageSlider
          images={data.images || []}
          theme={theme}
          height={hp('20%')}
          width={wp('94%')}
        />
      </View>

      {/* Details Section */}
      <View style={styles.textSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: "center" }}>
          <AppText style={[styles.title, { color: theme.colors.text }]} ellipsizeMode='tail' numberOfLines={2}>
            {data.title}
          </AppText>
          {isDraft === false && (
            <TouchableOpacity onPress={onPressShare} style={styles.iconButton} onPressIn={() => shareVehicleDetails()}>
              <Feather name="share-2" size={25} color={theme.colors.placeholder} />
            </TouchableOpacity>
          )}
        </View>

        <AppText style={[styles.subtitle, { color: theme.colors.placeholder }]}>
          {data.variant}
        </AppText>

        {/* Tags */}
        <View style={styles.tagRow}>
          <View style={{ flexDirection: 'row', gap: wp('2%'), flexWrap: 'wrap', width: wp('70%') }}>
            {data.kms ? (
              <LinearGradient colors={['#A9D4FF', '#F1F1F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: wp('1%'), width: wp('30%'), justifyContent: 'center' }}>
                <AppText style={styles.tag}>{data.kms}</AppText>
              </LinearGradient>
            ) : null}
            {data.fuel ? (
              <LinearGradient colors={['#A9D4FF', '#F1F1F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: wp('1%'), width: wp('30%'), justifyContent: 'center' }}>
                <AppText style={styles.tag}>{data.fuel}</AppText>
              </LinearGradient>
            ) : null}
            {data.transmission ? (
              <LinearGradient colors={['#A9D4FF', '#F1F1F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: wp('1%'), width: wp('30%'), justifyContent: 'center' }}>
                <AppText style={styles.tag}>{data.transmission}</AppText>
              </LinearGradient>
            ) : null}
          </View>
          <View style={{ alignItems: "flex-end", flexDirection: 'row', gap: 5 }}>
            <TouchableOpacity onPress={onPressDelete} style={styles.iconButton}>
              <FontAwesome5 name="trash-alt" size={24} color={'#F08080'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onPressEdit(data)} style={styles.iconButton}>
              <FontAwesome5 name="edit" size={24} color={theme.colors.placeholder} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{
          flexDirection: 'row',
          gap: wp('2%'),
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <AppText style={[styles.price, { color: theme.colors.text }]}>₹{data.price?.toLocaleString('en-IN')}</AppText>
          {isDraft === false && (
            <View style={styles.metaRow}>
              <FontAwesome5 name="users" size={14} color={theme.colors.primary} />
              <AppText style={[styles.metaText, { color: theme.colors.primary }]}>
                {` ${data.leads} Leads`}
              </AppText>
              <View style={[styles.metaDivider, { backgroundColor: theme.colors.primary }]} />
              <FontAwesome5 name="eye" size={14} color={theme.colors.primary} />
              <AppText style={[styles.metaText, { color: theme.colors.primary }]}>
                {` ${data.views} Views`}
              </AppText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  textSection: {
    padding: wp('3%'),
  },
  title: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    width: '80%',
  },
  subtitle: {
    fontSize: wp('4%'),
    marginBottom: hp('1%'),
    fontWeight: '500',
  },
  tagRow: {
    flexDirection: 'row',
    gap: wp('2%'),
    marginBottom: hp('0.6%'),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tag: {
    padding: wp('0.7%'),
    fontSize: wp('4%'),
    fontWeight: '600',
    alignSelf: "center",
    paddingHorizontal: hp('1%'),
    color: '#055597',
  },
  price: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    marginBottom: hp('1.5%'),
  },
  metaText: {
    fontSize: wp('4%'),
    fontWeight: '600',
  },
  iconButton: {
    marginLeft: wp('1%'),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('0%'),
  },
  metaDivider: {
    width: 2,
    height: hp('2%'),
    marginHorizontal: wp('2%'),
    backgroundColor: '#007AFF',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#055597AA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    borderRadius: wp('3%'),
  },
  soldStamp: {
    width: wp('35%'),
    height: hp('20%'),
  },
  inactiveText: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },

});

export default VehicleCard;
