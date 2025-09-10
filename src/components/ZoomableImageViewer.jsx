import React, { useState } from 'react';
import { Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/Ionicons';

const ZoomableImageViewer = ({ uri, onClose }) => {
  const [visible, setVisible] = useState(true); // open by default

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  return (
    <Modal visible={visible} transparent={true} statusBarTranslucent={true}>
      <ImageViewer
        imageUrls={[{ url: uri }]} // single image
        enableSwipeDown={true}
        onSwipeDown={handleClose}
        onCancel={handleClose}
        saveToLocalByLongPress={true}
      />

      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
        <Icon name="close" size={28} color="#fff" />
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
});

export default ZoomableImageViewer;
