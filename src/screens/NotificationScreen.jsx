import React, { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { DetailsHeader } from "../components/DetailsHeader";
import { logowhite } from "../../public_assets/media";
import { SafeAreaView } from "react-native-safe-area-context";
import DeleteAccountModal from "../components/DeleteAccountModal";
import AppText from "../components/AppText";
import apiClient from "../utils/apiClient";
import { showToast } from "../utils/toastService";
import Loader from "../components/Loader";
import { useNavigation } from "@react-navigation/native";

const NotificationScreen = () => {
  const { theme } = useContext(AuthContext);
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const handleDelete = (description) => {
    Alert.alert("Account deleted", `Reason: ${description}`);
  };

  const fetchNotifications = async (pageNumber = 1, isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else if (pageNumber === 1) setLoading(true);
      else setIsLoadingMore(true);

      const response = await apiClient.get(
        `api/notificationroute/delaernotificationRoutes/notifications?page=${pageNumber}&limit=20`
      );

      const data = response?.data?.data?.notifications || [];

      // Keep full item to use metadata/path for navigation
      if (isRefreshing || pageNumber === 1) {
        setNotifications(data);
      } else {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n._id));
          const newItems = data.filter((n) => !existingIds.has(n._id));
          return [...prev, ...newItems];
        });
      }

      setHasMore(data.length >= 10); // True if there may be more pages
      setPage(pageNumber);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showToast("error", "", "Failed to load notifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const onRefresh = () => {
    fetchNotifications(1, true);
  };

  const loadMoreNotifications = () => {
    if (!isLoadingMore && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(
        `api/notificationroute/delaernotificationRoutes/read-receipt/${notificationId}`
      );
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.warn("Error marking notification as read:", error);
    }
  };

  const handleNotificationNavigation = (notification) => {
    if (!notification) return;
    console.log('Navigating to notification:', notification);

    const { path, metadata = {} } = notification;

    const navigationMap = {
      support_ticket_raised: {
        screen: "TicketListScreen",
        params: { ticketId: metadata.ticketId },
      },
      issue_resolved: {
        screen: "TicketListScreen",
        params: { ticketId: metadata.ticketId },
      },
      support_ticket_update: {
        screen: "TicketListScreen",
        params: { ticketId: metadata.ticketId },
      },
      onboarding_successful: {
        screen: "ProfileDetailsScreen",
        params: { userId: metadata.userId },
      },
      mark_as_sold_bike: {
        screen: "AssetsPreviewScreen",
        params: { id: metadata.bike_id, selectedCategory: "bikes" },
      },
      mark_as_sold_car: {
        screen: "AssetsPreviewScreen",
        params: { id: metadata.car_id, selectedCategory: "cars" },
      },
      mark_as_sold_spare: {
        screen: "AssetsPreviewScreen",
        params: { spareId: metadata.spare_id, selectedCategory: "spares" },
      },
      quota_usage_updated: {
        screen: "SubscriptionScreen",
        params: { id: metadata.bike_id, selectedCategory: "bikes" },
      },
      listing_draft_car: {
        screen: "PreviewScreen",
        params: { carandBikeId: metadata.spare_id, vehicleType: "car" },
      },
      listing_draft_bike: {
        screen: "PreviewScreen",
        params: { carandBikeId: metadata.bike_id, vehicleType: "bike" },
      },
      listing_draft_sapre: {
        screen: "SparePreviewScreen",
        params: { spareId: metadata.spare_id, vehicleType: "bike" },
      },
      listing_published_car: {
        screen: "AssetsPreviewScreen",
        params: { id: metadata.spare_id, selectedCategory: "cars" },
      },
      listing_published_bike: {
        screen: "AssetsPreviewScreen",
        params: { id: metadata.spare_id, selectedCategory: "bikes" },
      },
      listing_published_spare: {
        screen: "AssetsPreviewScreen",
        params: { id: metadata.spare_id, selectedCategory: "spares" },
      },
      subscription_activated: {
        screen: "SubscriptionScreen",
        params: { spareId: metadata.spare_id, vehicleType: "bike" },
      },
      lead_alert_on_car: {
        screen: "LeadsScreen",
        params: { spareId: metadata.spare_id, vehicleType: "car" },
      },
      lead_alert: {
        screen: "LeadsScreen",
        params: { spareId: metadata.spare_id, vehicleType: "car" },
      },
      lead_alert_on_bike: {
        screen: "LeadsScreen",
        params: { spareId: metadata.spare_id, vehicleType: "car" },
      },
      lead_alert_on_product: {
        screen: "LeadsScreen",
        params: { spareId: metadata.spare_id, vehicleType: "car" },
      },
      subscription_expiry_reminder: {
        screen: "SubscriptionScreen",
        params: { spareId: metadata.spare_id, vehicleType: "car" },
      },
      weekly_top_viewed_car: {
        screen: "AssetsPreviewScreen",
        params: { id: metadata.listingId, selectedCategory: "cars" },
      },
     
    };

    if (navigationMap.hasOwnProperty(path)) {
      const { screen, params } = navigationMap[path];
      navigation.navigate(screen, params || {});
    } else {
      console.warn(`No navigation mapping found for path: ${path}`);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        markAsRead(item._id);
        handleNotificationNavigation(item);
      }}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.notificationItem,
          {
            backgroundColor: item.isRead
              ? theme.colors.background
              : theme.colors.card,
          },
        ]}
      >
        <View style={[styles.logo, { backgroundColor: theme.colors.themeIcon }]}>
          <Image
            source={logowhite}
            style={{ width: "100%", height: "100%" ,}}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <AppText style={[styles.title, { color: theme.colors.text }]}>
            {item?.title || "GADILO Bharat"}
          </AppText>
          <AppText
            style={[styles.message, { color: theme.colors.placeholder }]}
            numberOfLines={2}
          >
            {item?.message || ""}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <DetailsHeader title="Notification" />
      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: hp("5%") }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={loadMoreNotifications}
          onEndReachedThreshold={0.1}
          ListFooterComponent={isLoadingMore ? <Loader size="small" /> : null}
        />
      )}
      <DeleteAccountModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onDelete={handleDelete}
        productTitle="User Account"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp("4%"),
    borderBottomWidth: 0.6,
    borderBottomColor: "#ccc",
  },
  logo: {
    width: wp("16%"),
    height: wp("16%"),
    marginRight: wp("4%"),
    borderRadius: wp("9%"),
    padding: wp("2%"),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: wp("4.2%"),
    fontWeight: "bold",
    marginBottom: hp("0.5%"),
  },
  message: {
    fontSize: wp("3.5%"),
    lineHeight: hp("2.5%"),
  },
});

export default NotificationScreen;
