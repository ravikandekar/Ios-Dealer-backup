// import React from 'react';
// import {
//   Modal,
//   View,
 
//   StyleSheet,
//   TouchableWithoutFeedback,
//   Pressable,
// } from 'react-native';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import AppText from './AppText';
// const IssueDetailsModal = ({visible, onClose, ticket}) => {
//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent
//       onRequestClose={onClose}>
//       <TouchableWithoutFeedback onPress={onClose}>
//         <View style={styles.overlay} />
//       </TouchableWithoutFeedback>

//       <View style={styles.sheetContainer}>
//         <AppText style={styles.title}>Issue details</AppText>
//         <View style={styles.divider} />

//         {/* Your Issue */}
//         <AppText style={styles.label}>Your Issue</AppText>
//         <AppText style={styles.value}>{ticket.title}</AppText>

//         {/* Description */}
//         <AppText style={styles.label}>Description</AppText>
//         <AppText style={styles.value}>{ticket.description}</AppText>

//         {/* Uploaded Images */}
//         <AppText style={styles.label}>Uploaded Images</AppText>
//         <View style={styles.imageRow}>
//           {[1, 2, 3].map(index => (
//             <View key={index} style={styles.imagePlaceholder} />
//           ))}
//         </View>

//         <Pressable onPress={onClose} style={styles.closeBtn}>
//           <AppText style={styles.closeText}>Close</AppText>
//         </Pressable>
//       </View>
//     </Modal>
//   );
// };

// export default IssueDetailsModal;

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//   },
//   sheetContainer: {
//     position: 'absolute',
//     bottom: 0,
//     width: '100%',
//     backgroundColor: '#fff',
//     borderTopLeftRadius: wp('5%'),
//     borderTopRightRadius: wp('5%'),
//     padding: wp('5%'),
//   },
//   title: {
//     fontSize: wp('4.6%'),
//     fontWeight: '700',
//     color: '#000',
//     marginBottom: hp('1%'),
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E2E2E2',
//     marginBottom: hp('2%'),
//   },
//   label: {
//     fontSize: wp('3.6%'),
//     fontWeight: '600',
//     color: '#333',
//     marginTop: hp('1.5%'),
//   },
//   value: {
//     fontSize: wp('3.5%'),
//     color: '#444',
//     marginTop: hp('0.5%'),
//   },
//   imageRow: {
//     flexDirection: 'row',
//     marginTop: hp('1.2%'),
//   },
//   imagePlaceholder: {
//     width: wp('20%'),
//     height: wp('20%'),
//     backgroundColor: '#E0EFFF',
//     borderRadius: wp('2%'),
//     marginRight: wp('2%'),
//   },
//   closeBtn: {
//     marginTop: hp('3%'),
//     alignSelf: 'center',
//     backgroundColor: '#044B85',
//     paddingVertical: hp('1%'),
//     paddingHorizontal: wp('6%'),
//     borderRadius: wp('2%'),
//   },
//   closeText: {
//     color: '#fff',
//     fontSize: wp('3.6%'),
//     fontWeight: '600',
//   },
// });

import React, { useContext } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AppText from './AppText';
import { AuthContext } from '../context/AuthContext';

const IssueDetailsModal = ({ visible, onClose, ticket ,imagePreview}) => {
  const { theme } = useContext(AuthContext);
  console.log('ticket111:', ticket);
const stripHtmlTags = (str) => {
  if (!str) return "";

  return str
    .replace(/<[^>]*>?/gm, "")     // remove all HTML tags
    .replace(/&nbsp;/gi, " ")      // replace &nbsp; with space
    .replace(/\s+/g, " ")          // collapse multiple spaces/newlines/tabs
    .trim();                       // trim leading/trailing spaces
};


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheetContainer, {backgroundColor : theme.colors.card}]}>
        <AppText style={[styles.title, {color: theme.colors.text}]}>Issue Details</AppText>
        <View style={styles.divider} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Subject */}
          <AppText style={[styles.label, {color: theme.colors.text}]}>Your Issue</AppText>
          <AppText style={[styles.value, {color: theme.colors.text}]}>{ticket?.subject || 'N/A'}</AppText>

          {/* Description */}
          <AppText style={[styles.label, {color: theme.colors.text}]}>Description</AppText>
          <AppText style={[styles.value, {color: theme.colors.text}]}> {stripHtmlTags(ticket?.description || ticket?.message || 'No description provided.')}</AppText>

          {/* Uploaded Images */}
          {ticket?.attachments?.length > 0 && (
            <>
              <AppText style={[styles.label, {color: theme.colors.text}]}>Uploaded Images</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                {ticket.attachments.map((img, index) => (
                  <Pressable key={index} onPress={() => imagePreview(img)}>
                    <Image
                      source={{ uri: img }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}
        </ScrollView>

        <Pressable onPress={onClose} style={styles.closeBtn}>
          <AppText style={styles.closeText}>Close</AppText>
        </Pressable>
      </View>
    </Modal>
  );
};

export default IssueDetailsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxHeight: hp('70%'),
    backgroundColor: '#fff',
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    padding: wp('5%'),
  },
  title: {
    fontSize: wp('4.6%'),
    fontWeight: '700',
    color: '#000',
    marginBottom: hp('1%'),
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E2E2',
    marginBottom: hp('2%'),
  },
  label: {
    fontSize: wp('4%'),
    fontWeight: '700',
    color: '#333',
    marginTop: hp('1.5%'),
  },
  value: {
    fontSize: wp('3.5%'),
    color: '#444',
    marginTop: hp('0.5%'),
  },
  imageRow: {
    flexDirection: 'row',
    marginTop: hp('1.2%'),
  },
  imagePreview: {
    width: wp('20%'),
    height: wp('20%'),
    backgroundColor: '#E0EFFF',
    borderRadius: wp('2%'),
    marginRight: wp('2%'),
  },
  closeBtn: {
    marginTop: hp('3%'),
    alignSelf: 'center',
    backgroundColor: '#044B85',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('6%'),
    borderRadius: wp('2%'),
  },
  closeText: {
    color: '#fff',
    fontSize: wp('3.6%'),
    fontWeight: '600',
  },
});