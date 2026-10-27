import type { CapacitorConfig } from '@capacitor/cli';

// The iOS app wraps the same web build (dist/, built with base '/').
const config: CapacitorConfig = {
  appId: 'com.selimsaukkomaa.tennisdb',
  appName: 'Strung',
  webDir: 'dist',
  ios: {
    // WKWebView insets the page below the status bar and above the home indicator, so the
    // sticky topbar sits below the notch without any CSS change. BridgeViewController in
    // ios/App/App/SceneDelegate.swift covers the status-bar strip so nothing scrolls under it.
    contentInset: 'automatic',
    // Shown behind the page while it loads and when scrolling past its ends.
    backgroundColor: '#f0efeb',
  },
};

export default config;
