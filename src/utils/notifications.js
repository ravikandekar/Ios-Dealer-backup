// src/notifications/notificationService.js
import { Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { navigate } from './NavigationService';

export function handleNotificationData(data) {
  if (!data?.notificationType) return;

  switch (data.notificationType) {
    case 'bike_listing':
      console.log('🎯 Bike Listing:', data);
      navigate('AssetsPreviewScreen', {
        id: data?.Id,
        selectedCategory: 'bikes',
      });
      break;
 
    case 'onboarding_successful':
      console.log('💬 Onboarding Successful:', data);
      navigate('ProfileDetailsScreen');
      break;

    case 'lead_alert_on_product':
      console.log('💬 Lead Alert on Product:', data);
      navigate('LeadsScreen');
      break;
    case 'lead_alert':
      console.log('💬 Lead Alert:', data);
      navigate('LeadsScreen');
      break;

    case 'lead_alert_on_car':
      console.log('💬 Lead Alert on Car:', data);
      navigate('AssetsPreviewScreen', { id: data.listingId, selectedCategory: "cars" });
      break;
    case 'lead_alert_on_bike':
      console.log('💬 Lead Alert on Bike:', data);
      navigate('AssetsPreviewScreen', { id: data.listingId, selectedCategory: "bikes" });
      break;
    case 'lead_alert_on_spare':
      console.log('💬 Lead Alert on Spare:', data);
      navigate('AssetsPreviewScreen', { id: data.listingId, selectedCategory: "spares" });
      break;
    case 'views_alert_milestone':
      console.log('💬 Views Alert Milestone:', data);
      navigate('AssetsPreviewScreen', { id: data.listingId, selectedCategory: "spares" });
      break;
    case 'weekly_top_viewed_car':
      console.log('💬 Weekly Top Viewed Car:', data);
      navigate('AssetsPreviewScreen', { id: data.listingId, selectedCategory: "cars" });
      break;
    case 'weekly_top_viewed_bike':
      console.log('💬 Weekly Top Viewed Bike:', data);
      navigate('AssetsPreviewScreen', { id: data.listingId, selectedCategory: "bikes" });
      break;
    case 'weekly_top_viewed_spare':
      console.log('💬 Weekly Top Viewed Spare:', data);
      navigate('AssetsPreviewScreen', { id: data.listingId, selectedCategory: "spares" });
      break;
    case 'subscription_expiry_reminder':
      console.log('💬 Subscription Expiry Reminder:', data);
      navigate('SubscriptionScreen');
      break;
    case 'support_ticket_update':
      console.log('💬 Support Ticket Update:', data);
      navigate('TicketListScreen',{ ticketId: data.ticketId });
      break;
    case 'draft_listing_bike':
      console.log('💬 Draft Listing Reminder:', data);
      navigate('PreviewScreen', { carandBikeId: data.listingId, vehicleType: "bike" });
      break;
    case 'draft_listing_car':
      console.log('💬 Draft Listing Reminder:', data);
      navigate('PreviewScreen', { carandBikeId: data.listingId, vehicleType: "car" });
      break;
    case 'draft_listing_spare':
      console.log('💬 Draft Listing Reminder:', data);
      navigate('SparePreviewScreen', { spareId: data.listingId, vehicleType: "spare" });
      break;
























    default:
      console.log('⚠️ Unknown notification type:', data.notificationType);
  }
}

export function listenForegroundNotifications() {
  messaging().onMessage(async remoteMessage => {
    console.log('📩 Foreground DATA message:', remoteMessage.data);
    handleNotificationData(remoteMessage.data);
  });
}

export function listenBackgroundNotifications() {
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('📩 Background tap DATA message:', remoteMessage?.data);
    handleNotificationData(remoteMessage.data);
  });
}

// export async function checkInitialNotification() {
//   const remoteMessage = await messaging().getInitialNotification();
//   if (remoteMessage?.data) {
//     console.log('📩 Killed state DATA message:', remoteMessage.data);
//     handleNotificationData(remoteMessage.data);
//   }
// }

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Background/Kill mode DATA message:', remoteMessage.data);
  handleNotificationData(remoteMessage.data);
});
