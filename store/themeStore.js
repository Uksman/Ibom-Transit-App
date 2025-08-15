import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const useThemeStore = create(
  persist(
    (set, get) => ({
      // Theme state
      isDarkMode: false,
      isSystemTheme: true,
      
      // Actions
      setDarkMode: (isDark) => set({ isDarkMode: isDark, isSystemTheme: false }),
      setLightMode: () => set({ isDarkMode: false, isSystemTheme: false }),
      setSystemTheme: () => {
        const systemTheme = Appearance.getColorScheme();
        set({ 
          isDarkMode: systemTheme === 'dark', 
          isSystemTheme: true 
        });
      },
      toggleTheme: () => {
        const { isDarkMode } = get();
        set({ isDarkMode: !isDarkMode, isSystemTheme: false });
      },
      
      // Initialize theme based on system preference
      initializeTheme: () => {
        const { isSystemTheme } = get();
        if (isSystemTheme) {
          const systemTheme = Appearance.getColorScheme();
          set({ isDarkMode: systemTheme === 'dark' });
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Listen to system theme changes
Appearance.addChangeListener(({ colorScheme }) => {
  const { isSystemTheme, setDarkMode } = useThemeStore.getState();
  if (isSystemTheme) {
    useThemeStore.getState().setDarkMode(colorScheme === 'dark');
  }
});

export default useThemeStore;
