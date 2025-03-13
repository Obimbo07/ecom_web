import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/', // Your FastAPI backend URL
  withCredentials: true, // Include cookies in requests (optional, depending on your auth strategy)
});

// Add request interceptor to include the bearer token
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    console.log(token, 'token in header');
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Add response interceptor for handling token-related errors (optional)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post('http://localhost:8000/users/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        return api(originalRequest); // Retry the original request
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        // Logout user or redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login'; // Adjust based on your route
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;