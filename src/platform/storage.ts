// Storage backends for the stringing log, behind one KeyValueBackend. Web: localStorage.
// iOS: Capacitor Preferences (UserDefaults), which iOS does not purge the way it can purge a
// WKWebView's website data.
import { Preferences } from '@capacitor/preferences';
import { KeyValueLogStore, type KeyValueBackend, type LogStore } from '../core/log/store';
import { isNative } from './native';

export const localStorageBackend: KeyValueBackend = {
  async get(key) {
    return localStorage.getItem(key);
  },
  async set(key, value) {
    localStorage.setItem(key, value);
  },
};

export const preferencesBackend: KeyValueBackend = {
  async get(key) {
    return (await Preferences.get({ key })).value;
  },
  async set(key, value) {
    await Preferences.set({ key, value });
  },
};

export function createLogStore(): LogStore {
  return new KeyValueLogStore(isNative() ? preferencesBackend : localStorageBackend);
}
