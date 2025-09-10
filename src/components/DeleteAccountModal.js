import React, { useState, useContext } from 'react';
import {
  Modal,
  View,

  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import ActionButton from './ActionButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from './AppText';
const DeleteAccountModal = ({
  visible,
  onClose,
  onDelete,
  productTitle,
}) => {
  const { theme } = useContext(AuthContext);
  const [description, setDescription] = useState('');

  const handleFinalDelete = () => {
    onDelete(description);
    resetModal();
  };

  const resetModal = () => {
    onClose();
    setDescription('');
  };

  const colors = theme?.colors;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={resetModal}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
              <View style={styles.headerRow}>
                <AppText style={[styles.title, { color: colors.text }]}>
                  Are you sure you want to Remove?
                </AppText>
                <TouchableWithoutFeedback onPress={resetModal}>
                  <Icon name="close" size={wp('6.4%')} color={colors.text} />
                </TouchableWithoutFeedback>
              </View>

              <AppText style={[styles.productName, { color: colors.text }]}>
                Why you want to delete this account?
              </AppText>

              <View style={{ marginTop: hp('2%') }}>
                <AppText style={[styles.label, { color: colors.placeholder }]}>
                  Description:
                </AppText>
                <TextInput
                  placeholder="Description here"
                  placeholderTextColor={colors.placeholder}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  style={[
                    styles.input,
                    {
                      borderColor: colors.placeholder,
                      color: colors.text,
                    },
                  ]}
                />

                <ActionButton
                  label="Delete"
                  onPress={handleFinalDelete}
                  style={[
                    styles.fullWidthButton,
                    { backgroundColor: colors.danger },
                  ]}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    padding: wp('5%'),
    paddingBottom: hp('5%'),
  },
  title: {
    fontSize: wp('4.8%'),
    fontWeight: '500',
    marginBottom: hp('1%'),
  },
  productName: {
    fontSize: wp('5%'),
    fontWeight: '700',
    marginBottom: hp('2%'),
  },
  label: {
    fontSize: wp('3.8%'),
    marginBottom: hp('1%'),
  },
  input: {
    borderWidth: 1,
    borderRadius: wp('3%'),
    padding: wp('3%'),
    minHeight: hp('15%'),
    textAlignVertical: 'top',
    fontSize: wp('3.8%'),
    marginBottom: hp('2%'),
  },
  fullWidthButton: {
    width: '100%',
    marginTop: hp('2%'),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
});

export default DeleteAccountModal;
