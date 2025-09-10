import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { logo } from "../../public_assets/media";
import { AuthContext } from "../context/AuthContext";

const AccountStatusScreen = () => {
 const { theme, selectedCategory, userID } = useContext(AuthContext);
 const colors= theme.colors
  const navigation = useNavigation();

  const supportEmail = "support@gadilobharat.com"; // replace with your support email

  const handleContactSupport = () => {
    Linking.openURL(
      `mailto:${supportEmail}?subject=Account Assistance&body=Hello Support,`
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={hp("3%")} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image source={logo} style={styles.logo} resizeMode="contain" />

        {/* User Icon */}
        <View style={styles.iconContainer}>
          <Icon name="account-off" size={hp("12%")} color={colors.primary} />
        </View>

        {/* Text Content */}
        <Text style={[styles.title, { color: colors.text }]}>
          Account Unavailable
        </Text>

        <Text style={[styles.subtitle, { color: colors.text }]}>
          Your account is currently unavailable (deactivated, suspended, or
          deleted). Please reach out to our support team for further assistance.
        </Text>

        <Text style={[styles.emailText, { color: colors.primary }]}>
          {supportEmail}
        </Text>

        {/* Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleContactSupport}
        >
          <Text style={styles.buttonText}>Contact Support</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountStatusScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    marginBottom: hp("1%"),
  },
  backButton: {
    padding: wp("1%"),
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp("8%"),
    paddingBottom: hp("4%"),
  },
  logo: {
    height: hp("10%"),
    marginBottom: hp("2%"),
  },
  iconContainer: {
    marginBottom: hp("3%"),
  },
  title: {
    fontSize: hp("3%"),
    fontWeight: "700",
    marginBottom: hp("1.5%"),
    textAlign: "center",
  },
  subtitle: {
    fontSize: hp("2%"),
    textAlign: "center",
    marginBottom: hp("2%"),
    opacity: 0.8,
  },
  emailText: {
    fontSize: hp("2%"),
    fontWeight: "600",
    marginBottom: hp("3%"),
    textAlign: "center",
  },
  button: {
    width: "100%",
    paddingVertical: hp("1.8%"),
    borderRadius: wp("3%"),
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: hp("2.2%"),
    fontWeight: "600",
  },
});