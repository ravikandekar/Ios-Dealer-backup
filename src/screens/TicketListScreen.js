import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import { DetailsHeader } from '../components/DetailsHeader';
import TicketCard from '../components/TicketCard';
import BackgroundWrapper from '../components/BackgroundWrapper';
import AppText from '../components/AppText';
import SupportCard from '../components/SupportCard';
import apiClient from '../utils/apiClient';

const TicketListScreen = ({ navigation }) => {
  const { theme, userID } = useContext(AuthContext);
  const imagepath = require('../../public_assets/media/images/default-avatar.jpg');

  // Sample ticket data
  const [tickets] = useState([]);

  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  console.log('issues: ', issues);

  const LIMIT = 10;

  const fetchIssues = async (pageNum = 1) => {
    if (loading || loadingMore || !hasMore) return;

    pageNum === 1 ? setLoading(true) : setLoadingMore(true);

    try {
      const response = await apiClient.get(
        `/api/dealer/support_TicketRoutes/getbydelaerid/${userID}?page=${pageNum}&limit=${LIMIT}`,
      );
      const apiIssues = response?.data?.data?.tickets || [];

      console.log('list : ', apiIssues);


      if (pageNum === 1) {
        setIssues(apiIssues);
      } else {
        setIssues(prev => [...prev, ...apiIssues]);
      }

      if (apiIssues.length < LIMIT) {
        setHasMore(false);
      } else {
        setPage(pageNum + 1);
      }
    } catch (error) {
      console.error('Issue fetch error:', error);
      showToast('error', '', 'Failed to load issues');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchIssues(1);
  }, []);

  const handleCreateTicket = () => {
    navigation.navigate('NewTicketScreen');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@gadilobharat.com');
  };

  // Navigate to ticket details
  const handleViewTicket = ticket => {
    console.log(ticket)
    navigation.navigate('ViewTicketScreen', { ticketId: ticket });
  };

  return (
    <BackgroundWrapper
      style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DetailsHeader
        title="Support Ticket"
        rightType="none"
        navigation={navigation}
        actionIcon='add-circle-outline'
        actionText='Create Ticket'
      />

      <View style={styles.contentContainer}>
        <View>
          <AppText style={[styles.title, { color: theme.colors.text }]}>
            How can we help you ?
          </AppText>

          <SupportCard
            message="If you need instant support you can contact us directly we will reply you as soon as possible."
            buttonText="Create ticket"
            onPress={handleCreateTicket}
          />
        </View>
        {/* 
        <View style={styles.ticketListHeader}>
          <AppText style={[styles.ticketListTitle, { color: theme.colors.text }]}>
            Your Tickets ({tickets.length})
          </AppText>
     
        </View> */}

        {/* Ticket List */}
        {/* <FlatList
          data={tickets}
          renderItem={({ item }) => (
            <TicketCard 
              ticket={item} 
              onPress={() => handleViewTicket(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        /> */}

        <FlatList
          data={issues}
          renderItem={({ item }) => (
            <TicketCard
              ticket={{
                id: item?._id,
                title: item?.subject,
                status: item?.status,
                date: item?.date,
                description: item?.description,
                userImage: item?.userId?.selfie ? { uri: item?.userId?.selfie } : imagepath,
              }}
              onPress={() => handleViewTicket(item)}
            />
          )}
          keyExtractor={item => item?._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loadingMore ? (
              <AppText style={{ textAlign: 'center', paddingVertical: 10 }}>
                Loading more...
              </AppText>
            ) : null
          }
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!loading && !loadingMore && hasMore) {
              fetchIssues(page);
            }
          }}
          refreshing={loading}
          onRefresh={() => {
            setPage(1);
            setHasMore(true);
            fetchIssues(1);
          }}
        />

        {/* 
        <FlatList
          data={issues}
          renderItem={({ item }) => (
            <TicketCard
              ticket={{
                id: item?._id,
                title: item?.subject,
                status: item?.status,
                date: item?.date,
                description: item?.description,
                userImage: imagepath,
              }}
              onPress={() => handleViewTicket(item)}
            />
          )}
          keyExtractor={(item) => item?._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        */}
      </View>

      {/* Fixed Email Contact at Bottom */}
      <TouchableOpacity
        style={[styles.emailBox, { backgroundColor: theme.colors.card }]}
        onPress={handleEmailPress}>
        <Icon name="mail" size={wp('5.5%')} color={theme.colors.text} />
        <AppText style={[styles.emailText, { color: theme.colors.text }]}>
          support@gadilobharat.gmail.com
        </AppText>
        <Icon
          name="chevron-forward"
          size={wp('5.5%')}
          color={theme.colors.text}
        />
      </TouchableOpacity>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    // paddingHorizontal: wp('5%'),
    paddingBottom: hp('2%'),
  },
  headerSection: {
    marginBottom: hp('2%'),
  },
  title: {
    fontSize: wp('5%'),
    fontWeight: '700',
    marginBottom: hp('2%'),
  },
  supportCard: {
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
  },
  supportMessage: {
    fontSize: wp('4%'),
    marginBottom: hp('2%'),
    lineHeight: hp('2.8%'),
  },
  createTicketButton: {
    borderRadius: wp('2%'),
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: wp('4%'),
  },
  ticketListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  ticketListTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
  filterText: {
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: hp('12%'), // Extra space for fixed email box
  },
  emailBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginHorizontal: wp('5%'),
    marginBottom: hp('2%'),
  },
  emailText: {
    flex: 1,
    fontSize: wp('4%'),
    marginLeft: wp('3%'),
  },
});

export default TicketListScreen;