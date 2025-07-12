import { TabState, tabStateSchema } from "./schemas";

const STORAGE_KEY = "aus-address-locator-state";

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === "undefined") return defaultValue;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn("Failed to parse localStorage item:", error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to remove localStorage item:", error);
    }
  },
};

export const getPersistedTabState = (): TabState => {
  const defaultState: TabState = {
    activeTab: "verifier",
    verifierData: {
      postcode: "",
      suburb: "",
      state: undefined,
      lastResult: undefined,
    },
    sourceData: {
      query: "",
      category: undefined,
      results: undefined,
      selectedLocation: undefined,
    },
  };

  const savedState = storage.get(STORAGE_KEY, defaultState);

  try {
    return tabStateSchema.parse(savedState);
  } catch (error) {
    console.warn("Invalid saved state, using defaults:", error);
    return defaultState;
  }
};

export const persistTabState = (state: TabState): void => {
  storage.set(STORAGE_KEY, state);
};

export const clearPersistedState = (): void => {
  storage.remove(STORAGE_KEY);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const debouncedPersistTabState = debounce(persistTabState, 500);
