import axios from "axios";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/v1";

// Auth service client - for /auth endpoints
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

// User API client - for /user endpoints
const userClient = axios.create({
  baseURL: `${API_BASE_URL}/user`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Enrollment API client - for /enrollment endpoints
const enrollmentClient = axios.create({
  baseURL: `${API_BASE_URL}/enrollment`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to setup interceptors
const setupInterceptors = (client: typeof apiClient) => {
  // Add token to requests
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return client(originalRequest);
        } catch (refreshError) {
          // Clear tokens and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("current_user");
          window.location.href = "/auth/login";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// Setup interceptors for all clients
setupInterceptors(apiClient);
setupInterceptors(userClient);
setupInterceptors(enrollmentClient);

// Auth API calls
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  }) => {
    const response = await apiClient.post("/register", data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post("/login", {
      email,
      password,
    });
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await apiClient.post("/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await apiClient.post("/change-password", {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

// User API calls
export const userAPI = {
  getCurrentUser: async () => {
    const response = await userClient.get("/me");
    return response.data;
  },

  updateProfile: async (data: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  }) => {
    const response = await userClient.patch("/me", data);
    return response.data;
  },
};

// Enrollment API calls
export const enrollmentAPI = {
  getEnrolledCourses: async () => {
    const response = await enrollmentClient.get("/my-courses");
    return response.data;
  },

  enrollCourse: async (courseId: string) => {
    const response = await enrollmentClient.post(`/courses/${courseId}`);
    return response.data;
  },

  unenrollCourse: async (courseId: string) => {
    const response = await enrollmentClient.delete(`/courses/${courseId}`);
    return response.data;
  },
};
