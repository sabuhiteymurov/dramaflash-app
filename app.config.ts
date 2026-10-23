import type { ConfigContext, ExpoConfig } from 'expo/config';

// Only the GitHub Pages export sets a base path; `npx expo start` serves from the root.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  experiments: { ...config.experiments, baseUrl: process.env.DEPLOY_BASE_URL ?? '' },
});
