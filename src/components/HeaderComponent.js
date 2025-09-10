import React, { useContext, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { logo, NotificationsNone, ArrowDropDown } from '../../public_assets/media';
import { Subscription } from '../constants/strings';
import CategoryDropdownMenu from './CategoryDropDownMenu';

// Import SVGs
import Car from '../IconCompo/Car';
import Bike from '../IconCompo/Bike';
import Spare from '../IconCompo/Spare';

const HeaderComponent = ({
  logoImage = logo,
  Image1 = NotificationsNone,
  dropdownImage = ArrowDropDown,
  onPressIcons,
  selectedCategory,
  onCategoryChange,
  onPressM
}) => {
  const { theme } = useContext(AuthContext);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const handleCategorySelect = (category) => {
    onCategoryChange(category);
    setShowCategoryMenu(false);
  };

  // Map category to SVG component
  const categorySvgMap = {
    Car: Car,
    Bike: Bike,
    'Spare Part Accessories': Spare,
  };

  const SelectedIcon = categorySvgMap[selectedCategory] || Car;

  return (
    <View style={styles.container}>
      {/* Left: Logo */}
      <View style={styles.leftSection}>
        <Image source={logoImage} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Right: Bell + Orange Box */}
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={onPressIcons}>
          <MaterialIcons name="notifications-none" size={wp('8%')} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.dropdownBox} onPress={() => setShowCategoryMenu(!showCategoryMenu)}>
          <SelectedIcon width={wp('6%')} height={wp('6.3%')} fill="#fff" />
          <Icon name="chevron-down" style={styles.arrow} />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {showCategoryMenu && (
        <CategoryDropdownMenu
          selectedCategory={selectedCategory}
          subscriptions={Subscription}
          onSelect={handleCategorySelect}
        />
      )}
    </View>
  );
};

export default HeaderComponent;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: wp('1.2%'),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: wp('3'),
  },
  logo: {
    width: wp('22%'),
    height: hp('6%'),
    resizeMode: 'contain',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('3%'),
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7941d',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    gap: wp('3%'),
  },
  arrow: {
    fontSize: wp('5%'),
    color: '#ffff',
    transform: [{ scaleX: -1 }],
  },
});
