// Which shell the app runs in: the iOS app (Capacitor's WKWebView) or a browser.
import { Capacitor } from '@capacitor/core';

export const isNative = (): boolean => Capacitor.isNativePlatform();
