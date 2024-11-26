export const BACK4APP_CONFIG = {
  APP_ID: import.meta.env.VITE_BACK4APP_APP_ID,
  JS_KEY: import.meta.env.VITE_BACK4APP_JS_KEY,
  SERVER_URL: 'https://parseapi.back4app.com/'
};

// Para debug em produção
console.log('Back4App Config:', {
  hasAppId: !!BACK4APP_CONFIG.APP_ID,
  hasJsKey: !!BACK4APP_CONFIG.JS_KEY
});
