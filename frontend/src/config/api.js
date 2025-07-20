// API Configuration
const config = {
  development: {
    API_URL: 'http://localhost:3001/api',
    SOCKET_URL: 'http://localhost:3001'
  },
  production: {
    API_URL: process.env.REACT_APP_API_URL || '/api',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || window.location.origin
  }
};

const environment = process.env.NODE_ENV || 'development';
const API_CONFIG = config[environment];

export const API_URL = API_CONFIG.API_URL;
export const SOCKET_URL = API_CONFIG.SOCKET_URL;

export default API_CONFIG;