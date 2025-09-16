import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import AppText from './AppText';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function ViewsBottomSheet({
  visible,
  onClose,
  views = 0,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose} 
      />

      <View style={styles.sheetContainer}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <AppText style={styles.title}>Overview</AppText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={wp(5.5)} color="white" />
            </TouchableOpacity>
          </View>

          {/* Views Section */}
          <View style={styles.viewsRow}>
            <View style={styles.ovalContainer}>
              <Svg width={wp(45)} height={hp(9.5)} style={styles.svgBackground}>
                <Ellipse
                  cx={wp(45) / 2}
                  cy={hp(9.5) / 2}
                  rx={wp(35) / 2}
                  ry={hp(9.5) / 2}
                  fill="#FFD59A"
                />
              </Svg>

             
                <AppText style={styles.ovalText}>
                  {String(views).padStart(2, '0')}
                </AppText>
             
            </View>
            <AppText style={styles.label}>Total Views</AppText>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: wp(100) > 450 ? 450 : '100%',
    backgroundColor: '#055597',
    borderTopLeftRadius: wp(6.5),
    borderTopRightRadius: wp(6.5),
    padding: wp(6),
    paddingBottom: hp(3.5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(3.5),
  },
  title: {
    color: 'white',
    fontSize: wp(5),
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'Outfit',
  },
  viewsRow: {
    alignItems: 'center',
    marginTop: hp(2),
  },
  ovalContainer: {
    width: wp(35),
    height: hp(8.5),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(0.5) },
    shadowOpacity: 0.25,
    shadowRadius: wp(1.5),
    elevation: 8,
  },
  svgBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  ovalText: {
    fontSize: wp(7),
    fontWeight: 'bold',
    color: '#000',
    zIndex: 1,
    textAlign: 'center',
  },
  noViewsText: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#777',
    zIndex: 1,
    textAlign: 'center',
  },
  label: {
    marginTop: hp(1.7),
    color: 'white',
    fontSize: wp(4.5),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
