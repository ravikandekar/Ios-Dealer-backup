// import React, { useContext } from 'react';
// import { Modal, View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
// import { AuthContext } from '../context/AuthContext';

// export default function PermissionSettingsModal({ visible, title, message }) {
//   const { theme } = useContext(AuthContext);

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="fade"
//       // 🔒 Prevent back button dismiss on Android
//       onRequestClose={() => {}}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
//           <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{title}</Text>
//           <Text style={[styles.modalSubTitle, { color: theme.colors.placeholder }]}>{message}</Text>

//           <TouchableOpacity
//             style={[styles.modalOption, { backgroundColor: theme.colors.primary }]}
//             onPress={() => {
//               Linking.openSettings(); // 👉 Send user to settings
//               // ❌ do not close here — wait until permission is rechecked outside
//             }}
//           >
//             <Text style={styles.modalButtonText}>Open Settings</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modalContainer: {
//     borderRadius: 12,
//     padding: 20,
//     width: '90%',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   modalSubTitle: {
//     fontSize: 14,
//     marginVertical: 12,
//   },
//   modalOption: {
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   modalButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });



import React, { useContext } from 'react';
import { Modal, View, Text, TouchableOpacity, Linking, StyleSheet, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function PermissionSettingsModal({ visible, title, message }) {
  const { theme } = useContext(AuthContext);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // 🔒 Prevent back button dismiss on Android
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.modalSubTitle, { color: theme.colors.placeholder }]}>{message}</Text>

          <TouchableOpacity
            style={[styles.modalOption, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:'); // iOS specific
              } else {
                Linking.openSettings(); // Android
              }
              // ❌ do not close here — wait until permission is rechecked outside
            }}
          >
            <Text style={styles.modalButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 12,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubTitle: {
    fontSize: 14,
    marginVertical: 12,
  },
  modalOption: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
