import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import UserNotifications

@main 
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  
  var window: UIWindow?
  
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?
  
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    
    // Configure Firebase
    FirebaseApp.configure()
    
    // Set notification delegate - THIS IS CRITICAL FOR FOREGROUND NOTIFICATIONS
    UNUserNotificationCenter.current().delegate = self
    
    // Request notification permissions
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      if granted {
        print("🍎 [iOS] Notification permission granted")
      } else {
        print("🍎 [iOS] Notification permission denied: \(String(describing: error))")
      }
    }
    
    // Register for remote notifications
    application.registerForRemoteNotifications()
    
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()
    
    reactNativeDelegate = delegate
    reactNativeFactory = factory
    
    window = UIWindow(frame: UIScreen.main.bounds)
    
    factory.startReactNative(
      withModuleName: "GadiloBharatNew",
      in: window,
      launchOptions: launchOptions
    )
    
    return true
  }
  
  // CRITICAL: This method makes notifications appear in foreground
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    print("🍎 [iOS] Foreground notification received: \(notification.request.content.title)")
    
    // This is what makes the notification show in foreground
    if #available(iOS 14.0, *) {
      completionHandler([.alert, .sound, .badge, .banner, .list])
    } else {
      completionHandler([.alert, .sound, .badge])
    }
  }
  
  // Handle notification tap
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    print("🍎 [iOS] Notification tapped: \(response.notification.request.content.title)")
    
    // Extract user info and handle the action
    let userInfo = response.notification.request.content.userInfo
    print("🍎 [iOS] Notification data: \(userInfo)")
    
    completionHandler()
  }
  
  // Remote notification registration success
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    print("🍎 [iOS] Successfully registered for remote notifications")
    // Firebase will automatically handle the token
  }
  
  // Remote notification registration failure
  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    print("🍎 [iOS] Failed to register for remote notifications: \(error)")
  }
  
  // Handle remote notification when app is in background/foreground
  func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    print("🍎 [iOS] Remote notification received: \(userInfo)")
    completionHandler(.newData)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }
  
  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}