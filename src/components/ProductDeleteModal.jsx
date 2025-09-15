import React, { useState, useContext } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import ActionButton from './ActionButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from './AppText';

const ProductDeleteModal = ({
  visible,
  onClose,
  onDelete,
  onSold,
  productTitle,
  isDraft = false,
}) => {
  const { theme } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');

  const handleDeletePress = () => setStep(2);

  const handleFinalDelete = () => {
    onDelete(description);
    resetModal();
  };

  const resetModal = () => {
    onClose();
    setStep(1);
    setDescription('');
  };

  const colors = theme?.colors;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, justifyContent: 'flex-end' }}
          >
            <View style={[styles.container, { backgroundColor: colors.card }]}>
              {/* Header */}
              <View style={styles.headerRow}>
                <AppText style={[styles.title, { color: colors.text }]}>
                  Are you sure you want to Remove?
                </AppText>
                <Icon
                  name="close"
                  size={wp('6.4%')}
                  color={colors.text}
                  onPress={resetModal}
                />
              </View>

              <AppText style={[styles.productName, { color: colors.text }]}>
                “{productTitle}”
              </AppText>

              {/* Step 1 */}
              {step === 1 && (
                <>
                  <View style={styles.bulletList}>
                    {[
                      'You can mark this product as “sold” instead of deleting it.',
                      'If you delete, you will lose all related data.',
                      'This action cannot be undone.',
                      'Please choose an action below.',
                    ].map((text, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <AppText
                          style={[styles.bulletSymbol, { color: colors.text }]}
                        >
                          •
                        </AppText>
                        <AppText
                          style={[styles.bulletText, { color: colors.text }]}
                        >
                          {text}
                        </AppText>
                      </View>
                    ))}
                  </View>

                  <View style={styles.buttonRow}>
                    <ActionButton
                      label="Delete"
                      onPress={handleDeletePress}
                      style={[styles.button, { backgroundColor: colors.danger }]}
                    />
                    {!isDraft && (
                      <ActionButton
                        label="Mark as Sold"
                        onPress={() => {
                          onSold();
                          resetModal();
                        }}
                        style={[
                          styles.button,
                          { backgroundColor: colors.success },
                        ]}
                      />
                    )}
                  </View>
                </>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <View style={{ marginTop: hp('2%') }}>
                  <AppText
                    style={[styles.label, { color: colors.placeholder }]}
                  >
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
                    returnKeyType="done"
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
              )}
            </View>
          </KeyboardAvoidingView>
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
  bulletList: {
    marginBottom: hp('2%'),
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp('1%'),
  },
  bulletSymbol: {
    fontSize: wp('5%'),
    marginRight: wp('2%'),
    top: 2,
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
    fontSize: wp('4%'),
    lineHeight: hp('2.8%'),
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
  buttonRow: {
    flexDirection: 'row',
    gap: wp('3%'),
    marginTop: hp('2%'),
  },
  button: {
    flex: 1,
  },
  fullWidthButton: {
    width: '100%',
    marginTop: hp('2%'),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
    alignItems: 'center',
  },
});

export default ProductDeleteModal;
