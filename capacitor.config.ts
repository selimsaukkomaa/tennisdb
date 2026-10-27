import type { CapacitorConfig } from '@capacitor/cli';

// The iOS app wraps the same web build (dist/, built with base '/').
const config: CapacitorConfig = {
  appId: 'com.selimsaukkomaa.tennisdb',
  appName: 'EquipDB',
  webDir: 'dist',
  ios: {
    // WKWebView insets the content for the status bar and home indicator, so the sticky
    // topbar sits below the notch without any CSS change.
    contentInset: 'automatic',
    // Shown behind the page while it loads and when scrolling past its ends.
    backgroundColor: '#f0efeb',
  },
};

export default config;
