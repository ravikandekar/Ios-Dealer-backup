import React, { useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { launchImageLibrary } from 'react-native-image-picker';
import { AuthContext } from '../context/AuthContext';
import { DetailsHeader } from '../components/DetailsHeader';
import BackgroundWrapper from '../components/BackgroundWrapper';
import AppText from '../components/AppText';
import IssueDetailsModal from '../components/IssueDetailsModal';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import Loader from '../components/Loader';
import ZoomableImageViewer from '../components/ZoomableImageViewer';

const ViewTicketScreen = ({ route }) => {
  const { theme, userID } = useContext(AuthContext);
  const { ticketId } = route.params;

  // State management
  const [ticket, setTicket] = useState(null);
  const [hideAttachments, setHideAttachments] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  console.log('ticket222:', hideAttachments);

  const scrollViewRef = useRef(null);

  // Memoized values
  const ticketTitle = useMemo(() =>
    ticket?.subject || ticket?.title || 'Ticket Details',
    [ticket?.subject, ticket?.title]
  );

  const allMessages = useMemo(() =>
    ticket ? [ticket, ...(ticket.replies || [])] : [],
    [ticket]
  );
  // Utility functions
  const formatDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-GB');
    } catch {
      return 'Invalid Date';
    }
  }, []);

  const formatTime = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Time' : date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Time';
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const stripHtmlTags = (str) => {
  if (!str) return "";

  return str
    .replace(/<[^>]*>?/gm, "")     // remove all HTML tags
    .replace(/&nbsp;/gi, " ")      // replace &nbsp; with space
    .replace(/\s+/g, " ")          // collapse multiple spaces/newlines/tabs
    .trim();                       // trim leading/trailing spaces
};

  // API functions
  const fetchTicket = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiClient.get(
        `api/dealer/support_TicketRoutes/getbyId/${ticketId._id}`,
      );

      if (response?.data?.success && response?.data?.data) {
        setTicket(response.data.data);
        setHideAttachments(response.data.data.status)
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'Failed to load ticket';
      showToast('error', 'Error', errorMessage);
      if (!isRefresh) setTicket(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ticketId._id]); // ✅ Removed `ticket` and `scrollToBottom` from dependencies


  const submitReply = useCallback(async () => {
    if (!replyMessage.trim() && replyAttachments.length === 0) {
      showToast('error', 'Validation Error', 'Please enter a message or attach a file.');
      return;
    }

    try {
      setSubmittingReply(true);

      const formData = new FormData();
      formData.append('message', replyMessage.trim());
      formData.append('sender', 'Dealer');

      replyAttachments.forEach((file) => {
        formData.append('attachments', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        });
      });

      const response = await apiClient.post(
        `/api/dealer/support_TicketRoutes/support-tickets/${ticketId._id}/messages`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        },
      );

      if (response?.data?.success) {
        showToast('success', 'Success', 'Reply sent successfully!');

        setReplyMessage('');
        setReplyAttachments([]);

        await fetchTicket(true);

        setTimeout(() => scrollToBottom(), 500);
      } else {
        throw new Error(response?.data?.message || 'Failed to send reply');
      }
    } catch (err) {
      console.error('Reply submission error:', err);

      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        'Reply submission failed. Please try again.';

      showToast('error', 'Failed', errorMessage);
    } finally {
      setSubmittingReply(false);
    }
  }, [replyMessage, replyAttachments, ticketId._id, fetchTicket, scrollToBottom]);

  const pickReplyFile = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 0,
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (result.didCancel || result.errorMessage) {
        if (result.errorMessage) {
          showToast('error', 'Error', 'Could not access files.');
        }
        return;
      }

      if (result.assets?.[0]) {
        const file = result.assets[0];

        if (file.fileSize > 5 * 1024 * 1024) {
          showToast('error', 'Error', 'File size must be less than 5MB.');
          return;
        }

        if (result.assets?.length) {
          const newFiles = result.assets
            .filter(file => file.fileSize <= 5 * 1024 * 1024)
            .map(file => ({
              uri: file.uri,
              name: file.fileName || `attachment_${Date.now()}.jpg`,
              type: file.type || 'image/jpeg',
              size: file.fileSize,
            }));
          if (newFiles.length !== result.assets.length) {
            showToast('error', 'Error', 'Some files were larger than 5MB and were skipped.');
          }

          setReplyAttachments(prev => [...prev, ...newFiles]);
          showToast('success', 'Success', `${newFiles.length} file(s) attached.`);
        }
        showToast('success', 'Success', 'File attached successfully.');
      }
    } catch (err) {
      console.error('Error picking file:', err);
      showToast('error', 'Error', 'Could not pick file.');
    }
  }, []);

  const removeAttachment = useCallback((indexToRemove) => {
    Alert.alert(
      'Remove Attachment',
      'Are you sure you want to remove this attachment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setReplyAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
          }
        },
      ]
    );
  }, []);
  const onRefresh = useCallback(() => {
    fetchTicket(true);
  }, [fetchTicket]);

  // Effects
  useEffect(() => {
    fetchTicket();
    () => { }
  }, [fetchTicket]);


  // Render functions
  const renderAttachments = useCallback((attachments) => {
    if (!attachments?.length) return null;

    return (
      <View style={styles.attachmentsContainer}>
        {attachments.map((att, idx) => (
          <TouchableOpacity
            key={`attachment-${idx}`}
            onPress={() => setSelectedImage(att)}
          >
            <Image
              source={{ uri: att }}
              style={styles.imagePlaceholder}
              resizeMode="cover"
              // onError={(e) => console.error('Image load error:', e)}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }, []);

  const renderMessage = useCallback((msg, index) => {
    const isDealer = (msg.sender || ticket.userType)?.toLowerCase() === 'dealer';
    const messageDate = msg.createdAt || msg.updatedAt || new Date().toISOString();

    // ✅ first/original message is always the main ticket
    const isFirstMessage = msg._id === ticket._id;

    return (
      <View
        key={`message-${index}-${msg._id || msg.id || messageDate}`}
        style={[
          styles.messageContainer,
          { alignSelf: isDealer ? 'flex-end' : 'flex-start' },
        ]}>
        <View
          style={[
            isDealer ? styles.userCard : styles.adminCard,
            { backgroundColor: theme.colors.card },
          ]}>

          {/* Header */}
          {isDealer ? (
            <View
              style={[
                styles.submittedHeader,
                { backgroundColor: theme.colors.primary, borderTopRightRadius: 0 },
              ]}>
              <AppText style={styles.submittedLabel}>
                {isFirstMessage ? 'Ticket Submitted' : 'You'}
              </AppText>
            </View>
          ) : (
            <View style={styles.adminHeader}>
              <AppText style={styles.adminName}>Gadilo Team</AppText>

              {(() => {
                const status = msg.status || ticket.status || 'Open';
                let backgroundColor = '#E0E0E0';
                let textColor = '#333333';

                switch (status) {
                  case 'Open':
                    backgroundColor = '#AFD2FF';
                    textColor = '#044B85';
                    break;
                  case 'In Progress':
                    backgroundColor = '#FFE081';
                    textColor = '#836902';
                    break;
                  case 'Resolved':
                    backgroundColor = '#97FF9E';
                    textColor = '#167020';
                    break;
                  default:
                    backgroundColor = '#E0E0E0';
                    textColor = '#333333';
                }

                return (
                  <View style={[styles.statusBadge, { backgroundColor }]}>
                    <AppText style={[styles.statusText, { color: textColor }]}>
                      {status}
                    </AppText>
                  </View>
                );
              })()}
            </View>

          )}

          {/* Content */}
          <View style={isDealer ? styles.userContent : styles.adminContent}>
            <View style={styles.titleRow}>
              <AppText
                style={[styles.messageTitle, { color: theme.colors.text }]}>
                {isFirstMessage
                  ? ticketTitle
                  : isDealer
                    ? ''
                    : `Dear ${ticket.userId?.name || ticket.dealerName || 'User'},`}
              </AppText>
              <AppText style={styles.messageDate}>
                {formatDate(messageDate)}
              </AppText>
            </View>

            <AppText
              style={[styles.messageText, { color: theme.colors.placeholder }]}>
              {stripHtmlTags(msg.message || msg.description || 'No message content')}
            </AppText>

            {renderAttachments(msg.attachments)}

            <View style={styles.footerRow}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedMessage(msg);
                  setShowDetailsModal(true);
                }}>
                <AppText style={styles.viewDetails}>View details...</AppText>
              </TouchableOpacity>
              <AppText style={styles.timestamp}>
                {formatTime(messageDate)}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    );
  }, [ticket, theme.colors, ticketTitle, formatDate, formatTime, renderAttachments]);

  const renderReplySection = useMemo(() => (
    <View style={styles.replyContainer}>
      {hideAttachments === 'Resolved' ? null : (
        <>
          <TextInput
            placeholder="Write a reply..."
            placeholderTextColor={theme.colors.placeholder}
            value={replyMessage}
            onChangeText={setReplyMessage}
            style={[
              styles.replyInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.inputBg || '#f8f8f8',
                borderColor: theme.colors.border || '#ccc',
              },
            ]}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!submittingReply}
          />

          {replyAttachments.length > 0 && (
            <View style={styles.attachmentPreview}>
              <View style={styles.attachmentInfo}>
                <AppText
                  style={[styles.attachmentText, { color: theme.colors.text }]}
                >
                  📎 {replyAttachments.length} file{replyAttachments.length > 1 ? 's' : ''} attached
                </AppText>

                {/* Optional: show remove all button */}
                <TouchableOpacity onPress={() => setReplyAttachments([])}>
                  <AppText style={styles.removeAttachment}>✕</AppText>
                </TouchableOpacity>
              </View>
            </View>
          )}


          <View style={styles.replyActions}>
            <TouchableOpacity
              onPress={pickReplyFile}
              style={styles.attachButton}
              disabled={submittingReply}
            >
              <AppText
                style={[
                  styles.attachButtonText,
                  { opacity: submittingReply ? 0.5 : 1 },
                ]}
              >
                Attach File
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={submitReply}
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    submittingReply || ticketId?.status === 'Resolved'
                      ? '#ccc'
                      : '#044B85',
                  opacity:
                    submittingReply || ticketId?.status === 'Resolved' ? 0.7 : 1,
                },
              ]}
              disabled={submittingReply || ticketId?.status === 'Resolved'}
            >
              <AppText style={styles.sendButtonText}>
                {submittingReply
                  ? 'Sending...'
                  : ticketId?.status === 'Resolved'
                    ? 'Closed'
                    : 'Send'}
              </AppText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>

  ), [replyMessage, replyAttachments, submittingReply, theme.colors, removeAttachment, pickReplyFile, submitReply, hideAttachments]);

  // Loading state
  if (loading && !ticket) return <Loader visible={true} />;

  // Error state
  if (!ticket) {
    return (
      <BackgroundWrapper style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <DetailsHeader title="Ticket Details" />
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>Failed to load ticket</AppText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchTicket()}>
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      </BackgroundWrapper>
    );
  }

  // Main render
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <BackgroundWrapper
        style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <DetailsHeader title={ticketTitle} rightType='action' actionIcon='refresh' onActionPress={onRefresh} />


        <FlatList
          data={[...allMessages].reverse()} // or just use inverted
          inverted
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => renderMessage(item)}
          contentContainerStyle={{
            padding: wp('2%'),
            // paddingBottom: hp('10%')
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />



        {renderReplySection}

        <IssueDetailsModal
          visible={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          ticket={selectedMessage}
          imagePreview={setSelectedImage}
        />
        {/* Show zoomable viewer if image selected */}
        {selectedImage && (
          <ZoomableImageViewer
            uri={selectedImage}
            onClose={() => setSelectedImage(null)} // close viewer
          />
        )}
      </BackgroundWrapper>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContainer: {
    flex: 1,
    padding: wp('2%'),
    // paddingBottom: hp('1%'),
  },
  messageContainer: {
    marginBottom: hp('2%'),
    width: wp('70%')
  },
  userCard: {
    borderRadius: wp('3%'),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderTopRightRadius: 0
  },
  adminCard: {
    borderRadius: wp('3%'),
    borderTopRightRadius: wp('5%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  submittedHeader: {
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('3%')
  },
  submittedLabel: {
    fontSize: wp('3.6%'),
    fontWeight: '700',
    color: '#fff'
  },
  userContent: {
    padding: wp('4%'),
  },
  adminContent: {
    borderRadius: wp('3%'),
    padding: wp('4%')
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#C8C8C8',
    padding: wp('2%'),
    borderTopRightRadius: wp('4%'),
  },
  adminName: {
    fontSize: wp('3.8%'),
    fontWeight: '600',
    color: '#222'
  },
  statusBadge: {
    backgroundColor: '#97FF9E',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: wp('1%'),
  },
  statusText: {
    fontSize: wp('3.2%'),
    fontWeight: '600',
    color: '#167020'
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp('0.8%'),
  },
  messageTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    flex: 1,
    marginRight: wp('2%'),
  },
  messageDate: {
    fontSize: wp('3.3%'),
    color: '#888'
  },
  messageText: {
    fontSize: wp('3.5%'),
    marginVertical: hp('1%'),
    lineHeight: wp('5%'),
  },
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  imagePlaceholder: {
    width: wp('14%'),
    height: wp('14%'),
    backgroundColor: '#CFE3F7',
    borderRadius: wp('1.5%'),
    marginRight: wp('2%'),
    marginBottom: wp('2%'),
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('0.5%'),
  },
  viewDetails: {
    fontSize: wp('3.5%'),
    color: '#044B85',
    fontWeight: '600'
  },
  timestamp: {
    fontSize: wp('3%'),
    color: '#666'
  },
  replyContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: wp('2%'),
    marginBottom: hp('5%'),
    // elevation: 3,
    shadowColor: '#000',
    // shadowOffset: { width: 0, height: -2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
  },
  replyInput: {
    borderWidth: 1,
    borderRadius: wp('2%'),
    padding: wp('3%'),
    fontSize: wp('3.8%'),
    minHeight: hp('8%'),
    maxHeight: hp('15%'),
  },
  attachmentPreview: {
    marginTop: hp('1%'),
    marginBottom: hp('0.5%'),
  },
  attachmentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: wp('2%'),
    borderRadius: wp('1%'),
  },
  attachmentText: {
    fontSize: wp('3.2%'),
    flex: 1,
  },
  removeAttachment: {
    fontSize: wp('4%'),
    color: '#ff4444',
    fontWeight: 'bold',
    paddingHorizontal: wp('2%'),
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  attachButton: {
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('2%'),
  },
  attachButtonText: {
    color: '#044B85',
    fontSize: wp('3.5%'),
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: '#044B85',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('6%'),
    borderRadius: wp('5%'),
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp('3.8%'),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
  },
  errorText: {
    fontSize: wp('4%'),
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  retryButton: {
    backgroundColor: '#044B85',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('8%'),
    borderRadius: wp('5%'),
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp('3.8%'),
  },
});

export default ViewTicketScreen;