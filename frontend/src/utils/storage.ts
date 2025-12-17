// LocalStorage keys
const STORAGE_KEYS = {
  TOKEN: 'siuno_token',
  USER: 'siuno_user',
  CURRENT_TEAM_ID: 'siuno_current_team_id',
} as const;

// Get item from localStorage
export function getStorageItem<T>(key: keyof typeof STORAGE_KEYS): T | null {
  try {
    const item = localStorage.getItem(STORAGE_KEYS[key]);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return null;
  }
}

// Set item in localStorage
export function setStorageItem<T>(key: keyof typeof STORAGE_KEYS, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
  }
}

// Remove item from localStorage
export function removeStorageItem(key: keyof typeof STORAGE_KEYS): void {
  try {
    localStorage.removeItem(STORAGE_KEYS[key]);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
}

// Clear all storage
export function clearStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
