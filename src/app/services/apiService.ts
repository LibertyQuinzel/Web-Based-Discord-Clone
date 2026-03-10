const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: string;
  };
  token: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: string;
  };
  token: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('jwtToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('jwtToken', token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('jwtToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response.data!;
  }

  async register(username: string, email: string, password: string): Promise<RegisterResponse> {
    const response = await this.request<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response.data!;
  }

  async getCurrentUser(): Promise<any> {
    return this.request<any>('/api/auth/me');
  }

  async testProtected(): Promise<any> {
    return this.request<any>('/api/auth/test-protected');
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request<any>('/health');
  }

  // API info
  async getApiInfo(): Promise<any> {
    return this.request<any>('/api');
  }

  // Utility method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Logout method
  logout() {
    this.clearToken();
  }
}

export const apiService = new ApiService();
