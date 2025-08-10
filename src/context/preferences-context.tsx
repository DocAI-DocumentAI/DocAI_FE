"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { 
  getUserPreferences, 
  updateUserPreferences, 
  UserPreferences, 
  UpdateUserPreferencesRequest 
} from '../lib/api/chat';

interface PreferencesContextType {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  loadPreferences: () => Promise<void>;
  updatePreferences: (data: UpdateUserPreferencesRequest) => Promise<void>;
  hasPreferences: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

interface PreferencesProviderProps {
  children: ReactNode;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserPreferences();
      setPreferences(data);
    } catch (err) {
      console.error('Failed to load preferences:', err);
      setError('Failed to load preferences');
      // Set default preferences if loading fails
      setPreferences(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (data: UpdateUserPreferencesRequest) => {
    try {
      setLoading(true);
      setError(null);
      const updatedPreferences = await updateUserPreferences(data);
      setPreferences(updatedPreferences);
    } catch (err) {
      console.error('Failed to update preferences:', err);
      setError('Failed to update preferences');
      throw err; // Re-throw so the component can handle it
    } finally {
      setLoading(false);
    }
  }, []);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const hasPreferences = preferences?.hasAnyPreferences ?? false;

  const contextValue: PreferencesContextType = {
    preferences,
    loading,
    error,
    loadPreferences,
    updatePreferences,
    hasPreferences
  };

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
