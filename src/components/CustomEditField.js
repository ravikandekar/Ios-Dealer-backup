import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, 

  View, 
  TextInput, 
  TouchableOpacity 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AppText from './AppText';
const CustomEditField = ({
  header,
  placeholder,
  value,
  onChangeText,
  iconName,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  keyboardType = 'default',
  errorMessage = '',
  multiline = false,
  editable = true,
  minLength, 
  maxLength, 
  containerStyle,
  inputStyle
}) => {
  const [showPassword, setShowPassword] = useState(secureTextEntry);
  const [localError, setLocalError] = useState('');
  const { theme } = useContext(AuthContext);

  useEffect(() => {
    if (value) {
      if (minLength !== undefined && value.length < minLength) {
        setLocalError(`Must be at least ${minLength} characters`);
      } else if (maxLength !== undefined && value.length > maxLength) {
        setLocalError(`Cannot exceed ${maxLength} characters`);
      } else {
        setLocalError('');
      }
    } else {
      setLocalError('');
    }
  }, [value, minLength, maxLength]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const clearText = () => {
    onChangeText('');
    setLocalError('');
  };

  const combinedError = errorMessage || localError;

  const handleTextChange = (text) => {
    if (maxLength !== undefined && text.length > maxLength) {
      return;
    }
    onChangeText(text);
  };

  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      {header && (
        <AppText style={[styles.fieldHeader, { color: theme.colors.placeholder }]}>
          {header}
        </AppText>
      )}

      <View
        style={[
          styles.inputContainer,
          { 
            borderColor: combinedError ? theme.colors.danger : theme.colors.border,
            backgroundColor: editable ? theme.colors.inputBackground : theme.colors.card
          },
         combinedError ? styles.errorInput : null,
          !editable ? styles.disabledInput : null,
          { backgroundColor: containerStyle?.backgroundColor || theme.colors.inputBackground }
        ]}
      >
        {iconName && (
          <Icon 
            name={iconName} 
            size={wp('6%')} 
            color={theme.colors.placeholder} 
            style={styles.icon} 
          />
        )}

        <TextInput
          style={[
            styles.input,
            multiline ? styles.multilineInput : null,
            { color: theme.colors.text, },
            inputStyle
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          value={value}
          onChangeText={handleTextChange}
          secureTextEntry={secureTextEntry && showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={editable}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          autoCorrect={keyboardType !== 'email-address' && keyboardType !== 'password'}
          maxLength={maxLength}
          textTransform={keyboardType === 'email-address' ? 'none' : 'capitalize'}
        />

        <View style={styles.actionsContainer}>
          {secureTextEntry && (
            <TouchableOpacity 
              onPress={togglePasswordVisibility}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={wp('4.5%')} 
                color={theme.colors.placeholder} 
              />
            </TouchableOpacity>
          )}

          {!secureTextEntry && (
            <>
              {value && editable && (
                <TouchableOpacity 
                  onPress={clearText}
                  style={styles.iconButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={wp('4.5%')} color={theme.colors.placeholder} />
                </TouchableOpacity>
              )}
              {!value && rightIcon && (
                <TouchableOpacity 
                  onPress={onRightIconPress}
                  style={styles.iconButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name={rightIcon} size={wp('4.5%')} color={theme.colors.placeholder} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      {combinedError ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={wp('3.5%')} color={theme.colors.error} />
          <AppText style={[styles.errorText, { color: theme.colors.error }]}>
            {combinedError}
          </AppText>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: hp('2%'),
  },
  fieldHeader: {
    fontSize: wp('4.2%'),
    fontWeight: '500',
    marginBottom: hp('0.6%'),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    minHeight: hp('5.5%'),
  },
  errorInput: {
    borderColor: '#e53e3e',
  },
  disabledInput: {
    backgroundColor: '#F7FAFC',
  },
  icon: {
    marginRight: wp('3%'),
  },
  input: {
    flex: 1,
    fontSize: wp('4.5%'),
    padding: 0,
    minHeight: hp('3%'),
  },
  multilineInput: {
    minHeight: hp('10%'),
    textAlignVertical: 'top',
    paddingVertical: hp('1.2%'),
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: wp('2%'),
  },
  iconButton: {
    padding: wp('1%'),
    marginLeft: wp('1%'),
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.8%'),
  },
  errorText: {
    fontSize: wp('3.5%'),
    marginLeft: wp('2%'),
  },
});

export default CustomEditField;