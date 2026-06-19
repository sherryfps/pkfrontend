import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pkcorporate.app',
  appName: 'Pk Corporate',
  webDir: 'dist',
  server: {
    // Allow the WebView to navigate to the backend API
    allowNavigation: ['pk-corporate-backend.onrender.com'],
  },
  plugins: {
    CapacitorHttp: {
      // Route all fetch/XMLHttpRequest through native HTTP layer,
      // bypassing WebView CORS restrictions entirely
      enabled: true,
    },
  },
};

export default config;
