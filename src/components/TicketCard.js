import React, { useContext } from 'react';
import { View,  StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import AppText from './AppText';
const TicketCard = ({ ticket, onPress }) => {
  const { theme } = useContext(AuthContext);
console.log(ticket.userImage,'uuuu');

  // Status styling based on status
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open':
        return { 
          backgroundColor: '#AFD2FF', 
          textColor: '#044B85' 
        };
      case 'In Progress':
        return { 
          backgroundColor: '#FFE081', 
          textColor: '#836902' 
        };
      case 'Resolved':
        return { 
          backgroundColor: '#97FF9E', 
          textColor: '#167020' 
        };
      default:
        return { 
          backgroundColor: '#E0E0E0', 
          textColor: '#333333' 
        };
    }
  };

  const statusStyle = getStatusStyle(ticket.status);

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.colors.card }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* First row with three columns */}
      <View style={styles.cardRow}>
        {/* Column 1: Circular image */}
        <View style={styles.imageColumn}>
          {ticket.userImage ? (
            <Image source={ticket.userImage} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="person" size={wp('5%')} color={theme.colors.primary} />
            </View>
          )}
        </View>
        
        {/* Column 2: Title and status */}
        <View style={styles.infoColumn}>
          <AppText 
            style={[styles.ticketTitle, { color: theme.colors.text }]} 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {ticket.title}
          </AppText>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <AppText style={[styles.statusText, { color: statusStyle.textColor }]}>
              {ticket.status}
            </AppText>
          </View>
        </View>
        
        {/* Column 3: Date and menu */}
        <View style={styles.metaColumn}>
          <AppText style={[styles.date, { color: theme.colors.placeholder }]}>
            {ticket.date}
          </AppText>
          {/* <TouchableOpacity style={styles.menuButton}>
            <Icon name="ellipsis-vertical" size={wp('4.5%')} color={theme.colors.placeholder} />
          </TouchableOpacity> */}
        </View>
      </View>
      
      {/* Description */}
      {/* <AppText style={[styles.ticketDescription, { color: theme.colors.secondaryText }]}>
        {ticket.description}
      </AppText> */}
      
      {/* View ticket button */}
      <TouchableOpacity style={[styles.viewTicketButton, { borderWidth: 1, borderColor: theme.colors.primary}]} onPress={onPress}>
        <AppText style={[styles.viewTicketText, { color: theme.colors.primary}]}>View ticket</AppText>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1.5%'),
  },
  imageColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  avatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
  },
  avatarPlaceholder: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: wp('2%'),
  },
  ticketTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '400',
    marginBottom: hp('1%'),
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('1%'),
  },
  statusText: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
  },
  metaColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: wp('3.5%'),
  },
  menuButton: {
    padding: wp('1%'),
  },
  ticketDescription: {
    fontSize: wp('4%'),
    marginBottom: hp('2%'),
    lineHeight: hp('2.5%'),
  },
  viewTicketButton: {
    // backgroundColor: '#044B85',
    borderRadius: wp('3%'),
    paddingVertical: hp('1.4%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewTicketText: {
    // color: 'white',
    fontWeight: '600',
    fontSize: wp('4.6%'),
    textTransform:'capitalize'
  },
});

export default TicketCard;