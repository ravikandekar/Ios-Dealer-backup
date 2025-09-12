# Billing client
-keep class com.android.billingclient.** { *; }
-dontwarn com.android.billingclient.**

# Google Play billing service
-keep class com.android.vending.billing.** { *; }
-dontwarn com.android.vending.billing.**

# React Native
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# RNIap (very important!)
-keep class com.dooboolab.RNIap.** { *; }
-dontwarn com.dooboolab.RNIap.**

# Hermes (if enabled)
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

# Optional Firebase rules
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Keep Firebase Crashlytics
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
