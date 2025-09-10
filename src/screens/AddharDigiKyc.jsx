import React, { useContext, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/MaterialIcons";
import { DetailsHeader } from "../components/DetailsHeader";
import { AuthContext } from "../context/AuthContext";
import BackgroundWrapper from "../components/BackgroundWrapper";
import axios from "axios";
import apiClient from "../utils/apiClient";
import { showToast } from "../utils/toastService";

const AadhaarKycScreen = ({ navigation }) => {
    const { theme, userID } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

const handleStartKyc = async () => {
  try {
    setLoading(true);

    // 🔹 Call your Aadhaar init API
    const response = await apiClient.post(
      "/api/dealer/aadhaarRoutes/digilocker/init",
      {
        dealerId: userID, 
      }
    );

    const { success, appCode, message, data } = response.data;

    if (success && appCode === 1000) {
      // ✅ KYC init success
      const kycUrl = data?.sdk_url; // use sdk_url here
      const requestId = data?.request_id;

      if (kycUrl) {
        showToast("success", "", "Redirecting to Aadhaar KYC...");
        navigation.navigate("AadharKycWebview", { url: kycUrl, requestId });
      } else {
        showToast("error", "", "KYC URL not received from server.");
      }
    } else {
      // ❌ API responded but failed
      showToast("error", "", message || "Something went wrong while starting KYC.");
    }
  } catch (error) {
    // 🚨 Network/API error
    showToast(
      "error",
      "",
      error.response?.data?.message || "Network error, please try again."
    );
  } finally {
    setLoading(false);
  }
};



    return (
        <BackgroundWrapper style={{ padding: wp("1%") }}>
            {/* Old DetailsHeader */}
            <DetailsHeader
                title="Aadhar KYC"
                rightType="steps"
                stepText="2/4"
                stepTextColor="#999"
                stepTextBg={theme.colors.background}
                divider={false}
            />

            <View style={styles.content}>
                {/* Fingerprint Circle */}
                <View style={styles.iconOuter}>
                    <View style={styles.iconInner}>
                        <Icon
                            name="fingerprint"
                            size={hp("7%")}
                            color={theme.colors.primary}
                        />
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>Verify Your Identity</Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>
                    To ensure the security of your account, please complete the KYC (Know
                    Your Customer) process using your Aadhaar card.
                </Text>

                {/* Button */}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={handleStartKyc}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Start KYC Verification</Text>
                    )}
                </TouchableOpacity>
            </View>
        </BackgroundWrapper>
    );
};

export default AadhaarKycScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingHorizontal: wp('4%'),
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: wp("6%"),
        textAlign: "center",
        marginTop: -hp("5%"), // matches design negative margin
    },
    iconOuter: {
        backgroundColor: "#e0f2fe",
        borderRadius: wp("30%"),
        padding: hp("2.5%"),
        marginBottom: hp("3%"),
    },
    iconInner: {
        backgroundColor: "#bae6fd",
        borderRadius: wp("25%"),
        padding: hp("2%"),
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: hp("3%"),
        fontWeight: "700",
        color: "#111",
        textAlign: "center",
    },
    subtitle: {
        fontSize: hp("1.9%"),
        color: "#555",
        textAlign: "center",
        marginTop: hp("1.5%"),
        marginHorizontal: wp("5%"),
    },
    button: {
        width: wp("85%"),
        height: hp("6.5%"),
        backgroundColor: "#0284c7",
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: hp("5%"),
    },
    buttonText: {
        fontSize: hp("2.2%"),
        fontWeight: "600",
        color: "#fff",
    },
    link: {
        fontSize: hp("1.9%"),
        color: "#0284c7",
        fontWeight: "500",
        marginTop: hp("2%"),
    },

});
