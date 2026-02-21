// src/hooks/useAxiosPrivate.js
import { useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const useAxiosPrivate = () => {
  const { auth, setAuth } = useAuth();

  useEffect(() => {
    // Interceptor to add the token to requests
    const requestIntercept = api.interceptors.request.use(
      (config) => {
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor to handle expired tokens
    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true; // Mark as retried to prevent infinite loops

          try {
            const refreshResponse = await api.post('/refresh-token');
            const newAccessToken = refreshResponse.data.accessToken;

            // Update the auth context and the original request's header
            setAuth(prev => ({ ...prev, accessToken: newAccessToken }));
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            // Retry the original request
            return api(prevRequest);
          } catch (refreshError) {
            console.error('Refresh token failed', refreshError);
            // If refresh fails, log the user out
            // logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup function to remove interceptors when component unmounts
    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [auth, setAuth]);

  return api; // Return the configured axios instance
};

export default useAxiosPrivate;