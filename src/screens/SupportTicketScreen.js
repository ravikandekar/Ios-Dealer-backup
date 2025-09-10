import React, { useContext } from 'react';
import {
  View,
 
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import AppText from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import { DetailsHeader } from '../components/DetailsHeader';
import BackgroundWrapper from '../components/BackgroundWrapper';
import SupportCard from '../components/SupportCard';

const SupportTicketScreen = ({ navigation }) => {
  const { theme } = useContext(AuthContext);

  const handleCreateTicket = () => {
    console.log('Create ticket tapped');
    // Navigate or trigger your support ticket logic here
    navigation.navigate('NewTicketScreen')
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@gadilobharat.gmail.com');
  };

  return (
    <BackgroundWrapper style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DetailsHeader
        title="Support Ticket"
        rightType="none"
      />

      <View style={styles.contentContainer}>
        <View>
          <AppText style={[styles.title, { color: theme.colors.text }]}>How can we help you ?</AppText>

          <SupportCard
            message="If you need instant support you can contact us directly we will reply you as soon as possible."
            buttonText="Create ticket"
            onPress={handleCreateTicket}
          />
        </View>

        <TouchableOpacity style={[styles.emailBox, {backgroundColor: theme.colors.card}]} onPress={handleEmailPress}>
          <Icon name="mail" size={wp('5.5%')} color={theme.colors.text} />
          <AppText style={[styles.emailText, { color: theme.colors.text }]}>
            support@gadilobharat.gmail.com
          </AppText>
          <Icon name="chevron-forward" size={wp('5.5%')} color={theme.colors.text} />
        </TouchableOpacity>

      </View>

    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: wp('3%'),
  },
  contentContainer: {
    flex: 1,
    // paddingHorizontal: wp('5%'),
    paddingBottom: hp('2%'),
  },
  title: {
    fontSize: wp('5%'),
    fontWeight: '700',
    marginBottom: hp('2%'),
  },
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#F1F1F1',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    justifyContent: 'space-between',
  },
  emailText: {
    flex: 1,
    fontSize: wp('4%'),
    marginLeft: wp('3%'),
  },
});

export default SupportTicketScreen;