import axios from 'axios';
import { auth } from './firebase';

// Sends the Firebase ID token with every request to our API, so protected routes (orders, reviews,
// admin) keep working even when the browser refuses the session cookie.
let apiOrigin = '';
try { apiOrigin = new URL(import.meta.env.VITE_API).origin; } catch (e) { /* ignore */ }

axios.interceptors.request.use(async (config) => {
  try {
    const url = String(config.url || '');
    if (auth && auth.currentUser && apiOrigin && url.startsWith(apiOrigin)) {
      const idToken = await auth.currentUser.getIdToken();
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${idToken}`;
    }
  } catch (e) { /* send the request without it */ }
  return config;
});
