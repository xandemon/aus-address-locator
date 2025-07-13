"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { TabState, Location, ValidationResult } from "@/lib/schemas";
import {
  getPersistedTabState,
  debouncedPersistTabState,
} from "@/lib/persistence";

interface AppContextType {
  activeTab: "verifier" | "source";
  setActiveTab: (tab: "verifier" | "source") => void;

  verifierData: {
    postcode: string;
    suburb: string;
    state?: string;
    lastResult?: ValidationResult;
  };
  updateVerifierData: (data: Partial<AppContextType["verifierData"]>) => void;

  sourceData: {
    query: string;
    category?: string;
    results?: Location[];
    selectedLocation?: Location;
  };
  updateSourceData: (data: Partial<AppContextType["sourceData"]>) => void;

  isVerifying: boolean;
  setIsVerifying: (loading: boolean) => void;
  isSearching: boolean;
  setIsSearching: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<TabState>(() => {
    return {
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
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const persistedState = getPersistedTabState();
    setState(persistedState);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      debouncedPersistTabState(state);
      console.log(state);
    }
  }, [state, isHydrated]);

  const setActiveTab = (tab: "verifier" | "source") => {
    setState((prev) => ({
      ...prev,
      activeTab: tab,
    }));
  };

  const updateVerifierData = (
    data: Partial<AppContextType["verifierData"]>
  ) => {
    setState((prev) => ({
      ...prev,
      verifierData: {
        postcode: prev.verifierData?.postcode || "",
        suburb: prev.verifierData?.suburb || "",
        state: prev.verifierData?.state as any,
        lastResult: prev.verifierData?.lastResult,
        ...data,
      } as any,
    }));
  };

  const updateSourceData = (data: Partial<AppContextType["sourceData"]>) => {
    setState((prev) => ({
      ...prev,
      sourceData: {
        query: prev.sourceData?.query || "",
        category: prev.sourceData?.category,
        results: prev.sourceData?.results,
        selectedLocation: prev.sourceData?.selectedLocation,
        ...data,
      },
    }));
  };

  const contextValue: AppContextType = {
    activeTab: state.activeTab,
    setActiveTab,

    verifierData: state.verifierData || {
      postcode: "",
      suburb: "",
      state: undefined,
      lastResult: undefined,
    },
    updateVerifierData,

    sourceData: state.sourceData || {
      query: "",
      category: undefined,
      results: undefined,
      selectedLocation: undefined,
    },
    updateSourceData,

    isVerifying,
    setIsVerifying,
    isSearching,
    setIsSearching,
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
