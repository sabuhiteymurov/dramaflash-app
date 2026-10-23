import type { ConfigContext, ExpoConfig } from 'expo/config';

// GitHub Pages serves the web build from /dramaflash-prototype. Only the deploy export sets the
// base path, so `npx expo start` keeps working at the root.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  experiments: { ...config.experiments, baseUrl: process.env.DEPLOY_BASE_URL ?? '' },
});
