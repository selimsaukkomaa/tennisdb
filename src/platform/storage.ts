// Storage backends for the stringing log. Web: localStorage. iOS (step 5): Capacitor
// Preferences, behind the same KeyValueBackend.
import { KeyValueLogStore, type KeyValueBackend, type LogStore } from '../core/log/store';

export const localStorageBackend: KeyValueBackend = {
  async get(key) {
    return localStorage.getItem(key);
  },
  async set(key, value) {
    localStorage.setItem(key, value);
  },
};

export function createLogStore(): LogStore {
  return new KeyValueLogStore(localStorageBackend);
}
