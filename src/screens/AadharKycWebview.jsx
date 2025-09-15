import React, {
    useEffect,
    useState,
    useCallback,
    useContext,
    useRef,
} from "react";
import {
    View,
    StyleSheet,
    Text,
    BackHandler,
    Alert,
    TouchableOpacity,
    Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { DetailsHeader } from "../components/DetailsHeader";
import BackgroundWrapper from "../components/BackgroundWrapper";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Loader from "../components/Loader";
import apiClient from "../utils/apiClient";
import { AuthContext } from "../context/AuthContext";
import Icon from "react-native-vector-icons/MaterialIcons";
import { CommonActions } from "@react-navigation/native";

const AadharKycWebview = ({ route, navigation }) => {
    const { url, requestId } = route.params ?? {};
    const { userID } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);

    // handle hardware back press
    useEffect(() => {
        const backAction = () => {
            Alert.alert("Exit KYC?", "Are you sure you want to exit the Aadhaar KYC process?", [
                { text: "Cancel", style: "cancel" },
                { text: "Exit", style: "destructive", onPress: () => navigation.goBack() },
            ]);
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [navigation]);

    // check transaction status
    const checkTransactionStatus = useCallback(async () => {
        if (!requestId) return;
        try {
            const response = await apiClient.get(
                `/api/dealer/digilockerresponseRoute/transaction-status/${requestId}`
            );

            const { success, appCode, data } = response.data ?? {};

            if (success && appCode === 1000 && data?.transaction_status) {
                const status = data.transaction_status;
                if (status === "SUCCESS") {
                    showToast('success', '', 'Aadhaar KYC completed successfully.');
                    // navigation.replace("KycSuccessScreen", { requestId });
                //    navigation.dispatch(
                //                 CommonActions.reset({
                //                     index: 0,
                //                     routes: [
                //                         { name: "RegistrationBDScreen", params: { requestId } },
                //                     ],
                //                 })
                //             );
                } else if (status === "DIGILOCKER_FAILURE") {
                    Alert.alert("KYC Failed", "Please retry using the reload button.");
                }
            }
        } catch (err) {
            console.warn("Transaction status check failed:", err?.message ?? err);
        }
    }, [requestId, navigation]);

    useEffect(() => {
        if (!requestId) return;
        checkTransactionStatus();
        const interval = setInterval(() => {
            checkTransactionStatus();
        }, 10000);
        return () => clearInterval(interval);
    }, [requestId, checkTransactionStatus]);

    // Retry flow: call init API and navigate to new sdk_url session
    const retryKyc = async () => {
        if (loading) return;
        try {
            setLoading(true);
            const resp = await apiClient.post("api/dealer/aadhaarRoutes/digilocker/init", {
                dealerId: userID,
            });

            const newUrl = resp?.data?.data?.sdk_url;
            const newRequestId = resp?.data?.data?.request_id;

            if (newUrl && newRequestId) {
                navigation.replace("AadharKycWebview", {
                    url: newUrl,
                    requestId: newRequestId,
                });
            } else {
                // Alert.alert("Retry Failed", "Please try again later.");
            }
        } catch (err) {
            console.warn("Retry error:", err?.message ?? err);
            Alert.alert("Network Error", "Retry failed. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    if (!url) {
        return (
            <BackgroundWrapper style={styles.container}>
                <DetailsHeader title="Aadhaar KYC" divider={true} onBack={() => navigation.goBack()} rightType='action' actionIcon='refresh' onActionPress={retryKyc}

                />
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>KYC URL is missing. Please try again.</Text>
                </View>
            </BackgroundWrapper>
        );
    }

    return (
        <BackgroundWrapper style={styles.container}>
            <DetailsHeader
                title="Aadhaar KYC"
                divider={true}
                onBack={() => {
                    Alert.alert("Exit KYC?", "Are you sure you want to exit the Aadhaar KYC process?", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Exit", style: "destructive", onPress: () => navigation.goBack() },
                    ]);
                }}
                rightType='action' actionIcon='refresh' onActionPress={retryKyc}
            />

            <View style={styles.webviewWrapper}>
                <WebView
                    source={{ uri: url }}
                    style={{ flex: 1 }}
                    startInLoadingState={true}
                    onMessage={(e) => {
                        const msg = e.nativeEvent.data;
                        if (msg === "closeWebView") {
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [
                                        { name: "RegistrationBDScreen", params: { requestId } },
                                    ],
                                })
                            );
                        } else if (msg === "RetryWebView") {
                            retryKyc();
                        }
                    }}
                    renderLoading={() => (
                        <View style={styles.loaderContainer}>
                            <Loader />
                            <Text style={styles.loadingText}>Loading Aadhaar KYC...</Text>
                        </View>
                    )}
                    onNavigationStateChange={(navState) => {
                        const u = navState.url ?? "";
                        if (u.includes("callback-success") || u.includes("success")) {
                           navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [
                                        { name: "RegistrationBDScreen", params: { requestId } },
                                    ],
                                })
                            );
                        } else if (u.includes("callback-failed") || u.includes("failed")) {
                            // Alert.alert("KYC Failed", "Please retry using the reload button.");
                        }
                    }}
                />

                {/* Floating Reload Button */}
                {/* <TouchableOpacity
                    style={styles.reloadButton}
                    activeOpacity={0.8}
                    onPress={retryKyc}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader size={20} />
                    ) : (
                        <Icon name="refresh" size={28} color="#fff" />
                    )}
                </TouchableOpacity> */}
            </View>
        </BackgroundWrapper>
    );
};

export default AadharKycWebview;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: Platform.OS === "ios" ? wp("6%") : wp("14%"),
        paddingTop: wp("4%"),
    },
    webviewWrapper: {
        flex: 1,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#fff",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fafafa",
    },
    loadingText: {
        marginTop: hp("1.5%"),
        fontSize: hp("1.9%"),
        color: "#444",
        fontWeight: "500",
    },
    errorBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: wp("5%"),
    },
    errorText: {
        fontSize: hp("2%"),
        color: "red",
        textAlign: "center",
        fontWeight: "500",
    },

    /* Floating reload button */
    reloadButton: {
        position: "absolute",
        bottom: hp("3%"),
        right: wp("4%"),
        backgroundColor: "#0284c7",
        borderRadius: 30,
        padding: 14,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
});
