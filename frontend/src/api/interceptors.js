import { toast } from 'react-toastify';

/**
 * Request interceptor - adds auth token to headers
 */
export const requestInterceptor = (config) => {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add timestamp to GET requests to prevent caching
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
  }
  
  return config;
};

/**
 * Request error handler
 */
export const requestErrorHandler = (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
};

/**
 * Response success handler
 */
export const responseSuccessHandler = (response) => {
  // Return the data directly for convenience
  return response.data || response;
};

/**
 * Response error handler
 */
export const responseErrorHandler = (error) => {
  const { response, config } = error;
  
  // Network error
  if (!response) {
    toast.error('Network error. Please check your connection.');
    return Promise.reject(error);
  }
  
  // Handle specific status codes
  switch (response.status) {
    case 400:
      toast.error(response.data?.message || 'Bad request');
      break;
      
    case 401:
      // Unauthorized - clear session and redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      // Dispatch logout action if store is available
      if (window.__REDUX_STORE__) {
        window.__REDUX_STORE__.dispatch({ type: 'auth/logout/fulfilled' });
      }
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
      break;
      
    case 403:
      toast.error(response.data?.message || 'Access forbidden');
      break;
      
    case 404:
      toast.error(response.data?.message || 'Resource not found');
      break;
      
    case 422:
      // Validation errors - display field-specific messages
      if (response.data?.details) {
        const errors = response.data.details;
        if (Array.isArray(errors)) {
          errors.forEach((err) => {
            toast.error(err.message || 'Validation error');
          });
        } else {
          Object.values(errors).forEach((errorMsg) => {
            toast.error(errorMsg);
          });
        }
      } else {
        toast.error(response.data?.message || 'Validation error');
      }
      break;
      
    case 429:
      toast.error('Too many requests. Please try again later.');
      break;
      
    case 500:
      toast.error('Server error. Please try again later.');
      break;
      
    default:
      toast.error(response.data?.message || 'An unexpected error occurred');
  }
  
  return Promise.reject(error);
};