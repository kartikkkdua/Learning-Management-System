const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // Set authentication headers
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  // Handle API responses
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    
    return data;
  }

  // Register new user
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await this.handleResponse(response);

      if (data.success && data.token) {
        this.setAuthData(data.token, data.user);
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Login user (step 1)
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(credentials)
      });

      const data = await this.handleResponse(response);

      // If 2FA is required, return the temp token
      if (data.requires2FA) {
        return data;
      }

      // Complete login without 2FA
      if (data.success && data.token) {
        this.setAuthData(data.token, data.user);
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Verify 2FA code (step 2)
  async verify2FA(tempToken, code) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ tempToken, code })
      });

      const data = await this.handleResponse(response);

      if (data.success && data.token) {
        this.setAuthData(data.token, data.user);
      }

      return data;
    } catch (error) {
      throw new Error(error.message || '2FA verification failed');
    }
  }

  // Resend 2FA code
  async resend2FA(tempToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-2fa`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ tempToken })
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to resend 2FA code');
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email })
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ token, newPassword })
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Password change failed');
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch profile');
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      const data = await this.handleResponse(response);
      
      if (data) {
        this.user = data;
        localStorage.setItem('user', JSON.stringify(data));
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  // Toggle 2FA
  async toggle2FA(enable, method = 'email') {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/toggle-2fa`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ enable, method })
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to toggle 2FA');
    }
  }

  // Set authentication data
  setAuthData(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Clear authentication data
  clearAuthData() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Logout
  logout() {
    this.clearAuthData();
    window.location.href = '/login';
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get token
  getToken() {
    return this.token;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user && this.user.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    return this.user && roles.includes(this.user.role);
  }
}

export default new AuthService();