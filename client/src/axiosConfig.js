import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true // <--- THIS IS CRITICAL FOR SESSIONS
});

export default instance;