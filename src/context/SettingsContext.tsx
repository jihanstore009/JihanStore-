import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings, Category, Banner, Advertisement } from '../types';
import { 
  DEFAULT_SETTINGS, 
  INITIAL_CATEGORIES, 
  INITIAL_BANNERS,
  INITIAL_ADS,
  subscribeToSettings, 
  subscribeToCategories,
  subscribeToBanners,
  subscribeToAds,
  updateStoreSettings,
  initializeStoreData
} from '../services/storeService';

interface SettingsContextType {
  settings: StoreSettings;
  categories: Category[];
  banners: Banner[];
  ads: Advertisement[];
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<StoreSettings>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [ads, setAds] = useState<Advertisement[]>(INITIAL_ADS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Run initialization in background
    initializeStoreData();

    // Listen to real-time changes
    const unsubSettings = subscribeToSettings((s) => {
      setSettings(s);
      setLoading(false);
    });

    const unsubCategories = subscribeToCategories((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    });

    const unsubBanners = subscribeToBanners((bans) => {
      if (bans && bans.length > 0) setBanners(bans);
    });

    const unsubAds = subscribeToAds((adList) => {
      if (adList) setAds(adList);
    });

    return () => {
      unsubSettings();
      unsubCategories();
      unsubBanners();
      unsubAds();
    };
  }, []);

  const handleUpdateSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = await updateStoreSettings(newSettings);
    setSettings(updated);
    return updated;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        categories,
        banners,
        ads,
        updateSettings: handleUpdateSettings,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

