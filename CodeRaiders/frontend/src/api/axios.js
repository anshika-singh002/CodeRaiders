// src/api/axios.js
import axios from 'axios';

const BASE_URL = 'http://localhost:4000'; // Make sure this is your backend's URL

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true // IMPORTANT: This allows cookies (like our refresh token) to be sent with requests
});

export default api;