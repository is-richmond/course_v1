import axios from "axios";
import type {
  CourseResponse,
  CourseWithModules,
  CourseModuleResponse,
  ModuleWithLessons,
  LessonResponse,
  LessonWithMedia,
  LessonWithAllMedia,
  TestResponse,
  TestWithQuestions,
  TestAttemptResponse,
  TestSubmission,
  TestResult,
  UserProgressResponse,
  UserProgressCreate,
  MediaListResponse,
  CourseMediaResponse,
  TestType,
  AvailableTestForCombining,
  CombinedTestResponse,
  CombinedTestDetailResponse,
  CombinedTestGenerateRequest,
  CombinedTestSubmission,
  CombinedTestResult,
  CombinedTestAttemptResponse,
  CombinedTestAttemptDetailResponse,
  AttemptTopicStatistics,
  OverallStatistics,
  TestAttemptDetailResponse,
  TestOverallStatistics,
  TestAttemptWithTestInfo,
} from "@/src/types/api";

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

// Core API clients - use same base URL (nginx proxies to core service)
const coreBaseURL = API_BASE_URL;

const coursesClient = axios.create({
  baseURL: `${coreBaseURL}/courses`,
  headers: { "Content-Type": "application/json" },
});

const modulesClient = axios.create({
  baseURL: `${coreBaseURL}/modules`,
  headers: { "Content-Type": "application/json" },
});

const lessonsClient = axios.create({
  baseURL: `${coreBaseURL}/lessons`,
  headers: { "Content-Type": "application/json" },
});

const testsClient = axios.create({
  baseURL: `${coreBaseURL}/tests`,
  headers: { "Content-Type": "application/json" },
});

const progressClient = axios.create({
  baseURL: `${coreBaseURL}/progress`,
  headers: { "Content-Type": "application/json" },
});

const s3Client = axios.create({
  baseURL: `${coreBaseURL}/s3`,
  headers: { "Content-Type": "application/json" },
});

const combinedTestsClient = axios.create({
  baseURL: `${coreBaseURL}/combined-tests`,
  headers: { "Content-Type": "application/json" },
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
setupInterceptors(coursesClient);
setupInterceptors(modulesClient);
setupInterceptors(lessonsClient);
setupInterceptors(testsClient);
setupInterceptors(progressClient);
setupInterceptors(s3Client);
setupInterceptors(combinedTestsClient);

// =============================================================================
// AUTH API
// =============================================================================
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

  forgotPassword: async (email: string) => {
    const response = await apiClient.post("/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.post("/reset-password", {
      token,
      new_password: newPassword,
    });
    return response.data;
  },
};

// =============================================================================
// USER API
// =============================================================================
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

// =============================================================================
// ENROLLMENT API
// =============================================================================
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

// =============================================================================
// COURSES API
// =============================================================================
export const coursesAPI = {
  list: async (skip = 0, limit = 100): Promise<CourseResponse[]> => {
    const response = await coursesClient.get("/", { params: { skip, limit } });
    return response.data;
  },

  get: async (courseId: number): Promise<CourseResponse> => {
    const response = await coursesClient.get(`/${courseId}`);
    return response.data;
  },

  getWithModules: async (courseId: number): Promise<CourseWithModules> => {
    const response = await coursesClient.get(`/${courseId}/with-modules`);
    return response.data;
  },

  getByAuthor: async (authorId: number): Promise<CourseResponse[]> => {
    const response = await coursesClient.get(`/author/${authorId}`);
    return response.data;
  },
};

// =============================================================================
// MODULES API
// =============================================================================
export const modulesAPI = {
  getByCourse: async (courseId: number): Promise<CourseModuleResponse[]> => {
    const response = await modulesClient.get(`/course/${courseId}`);
    return response.data;
  },

  get: async (moduleId: number): Promise<CourseModuleResponse> => {
    const response = await modulesClient.get(`/${moduleId}`);
    return response.data;
  },

  getWithLessons: async (moduleId: number): Promise<ModuleWithLessons> => {
    const response = await modulesClient.get(`/${moduleId}/with-lessons`);
    return response.data;
  },
};

// =============================================================================
// LESSONS API
// =============================================================================
export const lessonsAPI = {
  getByModule: async (moduleId: number): Promise<LessonResponse[]> => {
    const response = await lessonsClient.get(`/module/${moduleId}`);
    return response.data;
  },

  get: async (lessonId: number): Promise<LessonResponse> => {
    const response = await lessonsClient.get(`/${lessonId}`);
    return response.data;
  },

  getWithMedia: async (lessonId: number): Promise<LessonWithMedia> => {
    const response = await lessonsClient.get(`/${lessonId}/with-media`);
    return response.data;
  },

  getWithAllMedia: async (lessonId: number): Promise<LessonWithAllMedia> => {
    const response = await lessonsClient.get(`/${lessonId}/with-all-media`);
    return response.data;
  },
};

// =============================================================================
// TESTS API
// =============================================================================
export const testsAPI = {
  list: async (): Promise<TestResponse[]> => {
    const response = await testsClient.get("/");
    return response.data;
  },

  get: async (testId: number): Promise<TestResponse> => {
    const response = await testsClient.get(`/${testId}`);
    return response.data;
  },

  getWithQuestions: async (testId: number): Promise<TestWithQuestions> => {
    const response = await testsClient.get(`/${testId}/with-questions`);
    return response.data;
  },

  start: async (testId: number): Promise<TestAttemptResponse> => {
    const response = await testsClient.post(`/${testId}/start`);
    return response.data;
  },

  submit: async (
    testId: number,
    submission: TestSubmission
  ): Promise<TestResult> => {
    const response = await testsClient.post(`/${testId}/submit`, submission);
    return response.data;
  },

  getAttempts: async (testId: number): Promise<TestAttemptResponse[]> => {
    const response = await testsClient.get(`/${testId}/attempts`);
    return response.data;
  },

  getResult: async (testId: number, attemptId: number): Promise<TestResult> => {
    const response = await testsClient.get(`/${testId}/result/${attemptId}`);
    return response.data;
  },


  getAllUserAttempts: async (): Promise<TestAttemptWithTestInfo[]> => {
    const response = await testsClient.get(`/attempts/user/${userId}`);
    return response.data;
  },

  // Получить детальную информацию о попытке
  getAttemptDetail: async (attemptId: number): Promise<TestAttemptDetailResponse> => {
    const response = await testsClient.get(`/attempts/${attemptId}/detail`);
    return response.data;
  },

  // Получить общую статистику по всем тестам пользователя
  getOverallStatistics: async (): Promise<TestOverallStatistics> => {
    const response = await testsClient.get('/statistics/overall');
    return response.data;
  },


  getCourseTests: async (courseId: number): Promise<TestResponse[]> => {
    const response = await testsClient.get(`/course/${courseId}`);
    return response.data;
  },
};

// =============================================================================
// PROGRESS API
// =============================================================================
export const progressAPI = {
  create: async (data: UserProgressCreate): Promise<UserProgressResponse> => {
    const response = await progressClient.post("/", data);
    return response.data;
  },

  getByUserAndCourse: async (
    userId: number,
    courseId: number
  ): Promise<UserProgressResponse[]> => {
    const response = await progressClient.get(
      `/user/${userId}/course/${courseId}`
    );
    return response.data;
  },

  get: async (progressId: number): Promise<UserProgressResponse> => {
    const response = await progressClient.get(`/${progressId}`);
    return response.data;
  },

  update: async (
    progressId: number,
    data: { completed?: boolean; completed_at?: string }
  ): Promise<UserProgressResponse> => {
    const response = await progressClient.put(`/${progressId}`, data);
    return response.data;
  },
};

// =============================================================================
// S3 MEDIA API
// =============================================================================
export const mediaAPI = {
  upload: async (
    file: File,
    mediaType: "image" | "video",
    courseId?: number,
    lessonId?: number,
    customName?: string
  ): Promise<CourseMediaResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("media_type", mediaType);
    if (courseId) formData.append("course_id", courseId.toString());
    if (lessonId) formData.append("lesson_id", lessonId.toString());
    if (customName) formData.append("custom_name", customName);

    const response = await s3Client.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.media;
  },

  list: async (params?: {
    skip?: number;
    limit?: number;
    media_type?: "image" | "video";
    course_id?: number;
    lesson_id?: number;
  }): Promise<MediaListResponse> => {
    const response = await s3Client.get("/media", { params });
    return response.data;
  },

  delete: async (mediaId: string): Promise<void> => {
    await s3Client.delete(`/media/${mediaId}`);
  },
};

// =============================================================================
// COMBINED TESTS API
// =============================================================================
export const combinedTestsAPI = {
  // Get available tests for combining (FOR_COMBINED type only)
  getAvailableTests: async (): Promise<AvailableTestForCombining[]> => {
    const response = await combinedTestsClient.get("/available-tests");
    return response.data;
  },

  // Generate a new combined test
  generate: async (
    data: CombinedTestGenerateRequest
  ): Promise<CombinedTestResponse> => {
    const response = await combinedTestsClient.post("/generate", data);
    return response.data;
  },

  // Get user's combined tests
  getMyTests: async (): Promise<CombinedTestResponse[]> => {
    const response = await combinedTestsClient.get("/my-tests");
    return response.data;
  },

  // Get specific combined test with questions
  get: async (testId: number): Promise<CombinedTestDetailResponse> => {
    const response = await combinedTestsClient.get(`/${testId}`);
    return response.data;
  },

  // Submit combined test answers
  submit: async (
    testId: number,
    submission: CombinedTestSubmission
  ): Promise<CombinedTestResult> => {
    const response = await combinedTestsClient.post(
      `/${testId}/submit`,
      submission
    );
    return response.data;
  },

  // Get attempts history
  getAttemptsHistory: async (
    skip = 0,
    limit = 100
  ): Promise<CombinedTestAttemptResponse[]> => {
    const response = await combinedTestsClient.get("/attempts/history", {
      params: { skip, limit },
    });
    return response.data;
  },

  // Get specific attempt details
  getAttempt: async (
    attemptId: number
  ): Promise<CombinedTestAttemptDetailResponse> => {
    const response = await combinedTestsClient.get(`/attempts/${attemptId}`);
    return response.data;
  },

  // Get attempt statistics (topic breakdown)
  getAttemptStatistics: async (
    attemptId: number
  ): Promise<AttemptTopicStatistics> => {
    const response = await combinedTestsClient.get(
      `/statistics/attempt/${attemptId}`
    );
    return response.data;
  },

  // Get overall statistics for user
  getOverallStatistics: async (): Promise<OverallStatistics> => {
    const response = await combinedTestsClient.get("/statistics/overall");
    return response.data;
  },

  // Delete combined test
  delete: async (testId: number): Promise<void> => {
    await combinedTestsClient.delete(`/${testId}`);
  },
};
