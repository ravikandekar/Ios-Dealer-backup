// import React from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Linking,
//   BackHandler,
//   Platform,
// } from 'react-native';

// const ForceUpdateModal = ({
//   visible,
//   version = 'v2.0.1',
//   notes = '',
//   storeUrl,
//   onClose,
//   force = false, // set true for no close button
// }) => {
//   React.useEffect(() => {
//     const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
//       return force; // if force is true, block back button
//     });
//     return () => backHandler.remove();
//   }, [force]);

//   const handleUpdate = () => {
//     if (storeUrl) Linking.openURL(storeUrl);
//   };

//   return (
//     <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
//       <View style={styles.overlay}>
//         <View style={styles.container}>
//           <Text style={styles.title}>Update Available</Text>
//           <Text style={styles.version}>Latest Version: {version}</Text>
//           {notes ? (
//             <Text style={styles.notes}>{notes}</Text>
//           ) : (
//             <Text style={styles.notes}>
//               A new version of the app is available. Please update to continue.
//             </Text>
//           )}

//           <TouchableOpacity style={styles.button} onPress={handleUpdate}>
//             <Text style={styles.buttonText}>Update Now</Text>
//           </TouchableOpacity>

//           {!force && (
//             <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//               <Text style={styles.closeText}>Maybe Later</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default ForceUpdateModal;

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     width: '85%',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 24,
//     alignItems: 'center',
//     elevation: 8,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 12,
//     color: '#333',
//   },
//   version: {
//     fontSize: 16,
//     color: '#555',
//     marginBottom: 8,
//   },
//   notes: {
//     fontSize: 14,
//     color: '#444',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: '#007AFF',
//     paddingHorizontal: 30,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   closeButton: {
//     paddingVertical: 8,
//   },
//   closeText: {
//     color: '#007AFF',
//     fontWeight: '500',
//     fontSize: 15,
//   },
// });

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  BackHandler,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const ForceUpdateModal = ({
  visible,
  version = 'v2.0.1',
  notes = '',
  storeUrl,
  onClose,
  force = false,
  theme, // Pass LightTheme or DarkTheme here
}) => {
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => force
    );
    return () => backHandler.remove();
  }, [force]);

  const handleUpdate = () => {
    if (storeUrl) Linking.openURL(storeUrl);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme?.colors?.background || '#fff' },
          ]}
        >
          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: theme?.colors?.text || '#000' },
            ]}
          >
            🚀 Update Available
          </Text>

          {/* Version */}
          <Text
            style={[
              styles.version,
              { color: theme?.colors?.placeholder || '#555' },
            ]}
          >
            Latest Version: {version}
          </Text>

          {/* Notes */}
          <Text
            style={[
              styles.notes,
              { color: theme?.colors?.placeholder || '#555' },
            ]}
          >
            {notes ||
              'A new version of the app is available. Please update to continue.'}
          </Text>

          {/* Update Button */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme?.colors?.primary || '#007AFF' },
            ]}
            activeOpacity={0.8}
            onPress={handleUpdate}
          >
            <Text
              style={[
                styles.buttonText,
                { color: theme?.colors?.buttonText || '#fff' },
              ]}
            >
              Update Now
            </Text>
          </TouchableOpacity>

          {/* Close Button */}
          {!force && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.closeText,
                  { color: theme?.colors?.primary || '#007AFF' },
                ]}
              >
                Maybe Later
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ForceUpdateModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
  },
  container: {
    width: '100%',
    borderRadius: wp('3%'),
    paddingVertical: hp('3%'),
    paddingHorizontal: wp('5%'),
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    fontSize: wp('5.2%'),
    fontWeight: '700',
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  version: {
    fontSize: wp('4%'),
    marginBottom: hp('1.5%'),
  },
  notes: {
    fontSize: wp('3.8%'),
    textAlign: 'center',
    marginBottom: hp('3%'),
    lineHeight: hp('2.5%'),
  },
  button: {
    paddingHorizontal: wp('10%'),
    paddingVertical: hp('1.6%'),
    borderRadius: wp('2.5%'),
    elevation: 3,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: wp('4.2%'),
  },
  closeButton: {
    marginTop: hp('1.5%'),
  },
  closeText: {
    fontWeight: '500',
    fontSize: wp('4%'),
  },
});
