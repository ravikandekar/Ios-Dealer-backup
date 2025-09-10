import React, { useContext, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import { useRoute } from '@react-navigation/native';
import { DetailsHeader } from '../components/DetailsHeader';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { AuthContext } from '../context/AuthContext';

const CMSWebViewScreen = () => {
  const route = useRoute();
  const { title, htmlContent } = route.params;
  const [loading, setLoading] = useState(true);
  const { theme, userID } = useContext(AuthContext);
  return (
    <BackgroundWrapper>
      <DetailsHeader title={title} />
      <View style={{ flex: 1 }}>
        <WebView
          originWhitelist={['*']}
          source={{ html: `<html><body style="padding: 16px;">${htmlContent}</body></html>` }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      </View>
    </BackgroundWrapper>
  );
};

export default CMSWebViewScreen;

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
