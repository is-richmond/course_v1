import { 
  User, 
  UserCreate, 
  UserUpdate, 
  TokenResponse, 
  LoginRequest, 
  RefreshTokenRequest,
  PasswordChangeRequest,
  PasswordResetRequest,
  GrantAdminRequest,
  EnrollmentResponse,
  MyCoursesResponse 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ... ((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ... options,
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  removeToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // Authentication endpoints
  async register(userData: UserCreate): Promise<TokenResponse> {
    return this.request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginRequest): Promise<TokenResponse> {
    return this.request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON. stringify(credentials),
    });
  }

  async refreshToken(refreshData: RefreshTokenRequest): Promise<TokenResponse> {
    return this.request<TokenResponse>('/auth/refresh', {
      method:  'POST',
      body:  JSON.stringify(refreshData),
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON. stringify({ token, new_password: newPassword }),
    });
  }

  async changePassword(passwordData: PasswordChangeRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async grantAdminRole(grantData: GrantAdminRequest): Promise<User> {
    return this.request<User>('/auth/admin', {
      method: 'POST',
      body: JSON.stringify(grantData),
    });
  }

  // User management endpoints
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  async updateCurrentUser(userData: UserUpdate): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PATCH',
      body: JSON. stringify(userData),
    });
  }

  async getAllUsers(skip:  number = 0, limit: number = 100): Promise<User[]> {
    return this. request<User[]>(`/users/all?skip=${skip}&limit=${limit}`);
  }

  async getUserById(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUserById(userId: string, userData:  UserUpdate): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUserById(userId: string): Promise<void> {
    return this.request<void>(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Enrollment endpoints
  async enrollInCourse(courseId: string): Promise<EnrollmentResponse> {
    return this.request<EnrollmentResponse>(`/enrollment/courses/${courseId}`, {
      method: 'POST',
    });
  }

  async unenrollFromCourse(courseId: string): Promise<EnrollmentResponse> {
    return this. request<EnrollmentResponse>(`/enrollment/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  async getMyCourses(): Promise<MyCoursesResponse> {
    return this.request<MyCoursesResponse>('/enrollment/my-courses');
  }

  async getMyCoursesDetails(): Promise<MyCoursesResponse> {
    return this.request<MyCoursesResponse>('/enrollment/my-courses/details');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Utility functions for common operations
export const authApi = {
  login: async (credentials: LoginRequest) => {
    const response = await apiClient.login(credentials);
    apiClient.setToken(response.access_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', response.refresh_token);
    }
    return response;
  },
  
  logout: () => {
    apiClient.removeToken();
  },
  
  refreshAuth: async () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await apiClient.refreshToken({ refresh_token: refreshToken });
    apiClient.setToken(response.access_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', response.refresh_token);
    }
    return response;
  },
};

export const userApi = {
  getUsers: (page: number = 1, limit:  number = 20) => {
    const skip = (page - 1) * limit;
    return apiClient. getAllUsers(skip, limit);
  },
  
  createUser: apiClient.register. bind(apiClient),
  updateUser: apiClient.updateUserById.bind(apiClient),
  deleteUser: apiClient.deleteUserById.bind(apiClient),
  getUser: apiClient.getUserById.bind(apiClient),
  grantAdmin: apiClient.grantAdminRole.bind(apiClient),
};

export const enrollmentApi = {
  enroll: apiClient.enrollInCourse.bind(apiClient),
  unenroll: apiClient. unenrollFromCourse.bind(apiClient),
  getUserCourses: apiClient.getMyCourses.bind(apiClient),
  getUserCoursesDetails: apiClient. getMyCoursesDetails.bind(apiClient),
};