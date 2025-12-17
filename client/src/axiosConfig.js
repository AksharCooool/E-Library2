import axios from 'axios';
import toast from 'react-hot-toast';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure this matches your backend port
});

// Flag to prevent multiple redirects/toasts happening at once
let isSessionExpired = false;

// 1. REQUEST INTERCEPTOR (Sends the Token)
instance.interceptors.request.use(
  (config) => {
    // Read user info from Local Storage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // If token exists, add it to the header
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. RESPONSE INTERCEPTOR (The "Eject Button") ⏏️
instance.interceptors.response.use(
  (response) => {
    // If response is good, just pass it through
    return response;
  },
  (error) => {
    // 👇 CHECK FOR BLOCKED USER ERROR (403)
    if (error.response && error.response.status === 403) {
      
      // 👇 PREVENT DUPLICATE TOASTS
      // Only run this logic if we haven't already started the logout process
      if (!isSessionExpired) {
        isSessionExpired = true; // Lock it immediately

        // 1. Clear the stored data
        localStorage.removeItem('userInfo');
        
        // 2. Show the "Access Denied" message ONCE
        toast.error("Session Expired: Your account has been suspended.");

        // 3. Force Redirect to Login (after small delay)
        setTimeout(() => {
          window.location.href = '/login';
          // We don't reset isSessionExpired here because the page reload will reset it anyway
        }, 2000);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;