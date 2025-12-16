import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure this matches your backend port
});

// 👇 THIS IS THE CRITICAL FIX
// Automatically add the Token to every single request
instance.interceptors.request.use(
  (config) => {
    // 1. Read user info from Local Storage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // 2. If token exists, add it to the header
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;