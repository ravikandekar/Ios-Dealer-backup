import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import AppText from '../components/AppText';
import Loader from '../components/Loader';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { DetailsHeader } from '../components/DetailsHeader';
import { AuthContext } from '../context/AuthContext';

import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQScreen = ({ navigation }) => {
  const { theme } = useContext(AuthContext);
  const [faqList, setFaqList] = useState([]);
  const [expandedFAQs, setExpandedFAQs] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFaqList = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/dealer/faqRoutes');
        const apiFaqList = response?.data?.data?.faqs || [];

        if (apiFaqList.length === 0) {
          showToast('info', '', 'No FAQs available.');
        }

        setFaqList(apiFaqList);

        if (apiFaqList.length > 0) {
          // ✅ Expand first FAQ by default
          setExpandedFAQs({ [apiFaqList[0]._id]: true });
        }
      } catch (error) {
        console.error('FAQ fetch error:', error);
        showToast('error', '', 'Failed to load FAQs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFaqList();
  }, []);

  const toggleFAQ = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFAQs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderFAQItem = ({ item }) => {
    const isExpanded = expandedFAQs[item._id];
    return (
      <View
        style={[
          styles.faqItem,
          {
            backgroundColor: theme.colors.card,
            shadowColor: theme.dark ? '#ffffff22' : '#00000022',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.faqQuestionContainer}
          onPress={() => toggleFAQ(item._id)}
          activeOpacity={0.7}
        >
          <AppText style={[styles.faqQuestion, { color: theme.colors.text }]}>
            {item.question}
          </AppText>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        {isExpanded && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.colors.placeholder || '#ccc' }]} />
            <View style={styles.faqAnswerContainer}>
              <AppText style={[styles.faqAnswer, { color: theme.colors.text }]}>
                {item.answer}
              </AppText>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <BackgroundWrapper>
      <DetailsHeader title="FAQ" />

      <AppText style={[styles.subHeader, { color: theme.colors.text }]}>
        Frequently Asked Questions
      </AppText>

      <FlatList
        data={faqList}
        keyExtractor={(item) => item._id}
        renderItem={renderFAQItem}
        contentContainerStyle={styles.faqContainer}
        showsVerticalScrollIndicator={false}
      />

      <Loader visible={loading} />
    </BackgroundWrapper>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  subHeader: {
    fontSize: wp('5%'),
    fontWeight: '600',
    marginVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
  },
  faqContainer: {
    paddingBottom: hp('4%'),
  },
  faqItem: {
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    backgroundColor: '#fff',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
  },
  faqQuestion: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    flex: 1,
    paddingRight: wp('2%'),
  },
  faqAnswerContainer: {
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('2%'),
  },
  faqAnswer: {
    fontSize: wp('4%'),
    lineHeight: hp('2.5%'),
  },
  divider: {
    height: 1,
    marginBottom: hp('1.5%'),
    backgroundColor: '#ccc',
  },
});
