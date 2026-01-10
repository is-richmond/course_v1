import axios from "@/config/axiosConfig";
import {
  User,
  UserCreate,
  UserUpdate,
  UserProfileUpdate,
  TokenResponse,
  LoginRequest,
  RefreshTokenRequest,
  PasswordChangeRequest,
  PasswordResetRequest,
  GrantAdminRequest,
  EnrollmentResponse,
  MyCoursesResponse,
  MediaListResponse
} from "../types/types";

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const authApi = {
  // Register new user
  register: async (userData: UserCreate): Promise<TokenResponse> => {
    const response = await axios.post("/auth/register", userData);
    return response.data;
  },

  // Login
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const response = await axios.post("/auth/login", credentials);
    const { access_token, refresh_token } = response.data;

    // Store tokens
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    return response.data;
  },

  // Refresh token
  refreshToken: async (
    refreshData: RefreshTokenRequest
  ): Promise<TokenResponse> => {
    const response = await axios.post("/auth/refresh", refreshData);
    const { access_token, refresh_token } = response.data;

    // Update tokens
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");
    window.location.href = "/auth/login";
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await axios.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await axios.post("/auth/reset-password", null, {
      params: { token, new_password: newPassword },
    });
    return response.data;
  },

  // Change password (authenticated)
  changePassword: async (
    passwordData: PasswordChangeRequest
  ): Promise<{ message: string }> => {
    const response = await axios.post("/auth/change-password", passwordData);
    return response.data;
  },

  // Grant admin role (superuser only)
  grantAdminRole: async (grantData: GrantAdminRequest): Promise<User> => {
    const response = await axios.post("/auth/admin", grantData);
    return response.data;
  },
};

// ============================================================================
// USER API
// ============================================================================

export const userApi = {
  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await axios.get("/user/me");
    return response.data;
  },

  // Update current user
  updateCurrentUser: async (userData: UserUpdate): Promise<User> => {
    const response = await axios.patch("/user/me", userData);
    return response.data;
  },

  // Update current user profile (with detailed info)
  updateMyProfile: async (
    userId: string,
    userData: UserProfileUpdate
  ): Promise<User> => {
    const response = await axios.patch(`/user/${userId}`, userData);
    return response.data;
  },

  // Get all users (admin only)
  getAllUsers: async (
    skip: number = 0,
    limit: number = 100
  ): Promise<User[]> => {
    const response = await axios.get("/user/all", {
      params: { skip, limit },
    });
    return response.data;
  },

  // Get user by ID (admin only)
  getUserById: async (userId: string): Promise<User> => {
    const response = await axios.get(`/user/${userId}`);
    return response.data;
  },

  // Update user by ID (admin only)
  updateUserById: async (
    userId: string,
    userData: UserUpdate
  ): Promise<User> => {
    const response = await axios.patch(`/user/${userId}`, userData);
    return response.data;
  },

  // Delete user by ID (admin only)
  deleteUserById: async (userId: string): Promise<void> => {
    await axios.delete(`/user/${userId}`);
  },

  // Helper: Get users with pagination
  getUsers: (page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;
    return userApi.getAllUsers(skip, limit);
  },
};

// ============================================================================
// ENROLLMENT API
// ============================================================================
export const enrollmentApi = {
  // Enroll user in course (admin only - requires user_id)
  enrollInCourse: async (
    courseId: string,
    userId: string
  ): Promise<EnrollmentResponse> => {
    const response = await axios.post(`/enrollment/courses/${courseId}`, null, {
      params: { user_id: userId },
    });
    return response.data;
  },

  // Unenroll user from course (admin only - requires user_id)
  unenrollFromCourse: async (
    courseId: string,
    userId: string
  ): Promise<EnrollmentResponse> => {
    const response = await axios.delete(`/enrollment/courses/${courseId}`, {
      params: { user_id: userId },
    });
    return response.data;
  },

  // Get my courses
  getMyCourses: async (): Promise<MyCoursesResponse> => {
    const response = await axios.get("/enrollment/my-courses");
    return response.data;
  },

  // Get my courses with details
  getMyCoursesDetails: async (): Promise<MyCoursesResponse> => {
    const response = await axios.get("/enrollment/my-courses/details");
    return response.data;
  },
};

// ============================================================================
// COURSE API
// ============================================================================

export const courseApi = {
  // Get all courses
  getAllCourses: async (skip: number = 0, limit: number = 100) => {
    const response = await axios.get("/courses/", {
      params: { skip, limit },
    });
    return response.data;
  },

  // Get course by ID
  getCourse: async (courseId: number) => {
    const response = await axios.get(`/courses/${courseId}`);
    return response.data;
  },

  // Get course with modules
  getCourseWithModules: async (courseId: number) => {
    const response = await axios.get(`/courses/${courseId}/with-modules`);
    return response.data;
  },

  // Get courses by author
  getCoursesByAuthor: async (authorId: number) => {
    const response = await axios.get(`/courses/author/${authorId}`);
    return response.data;
  },

  // Create course
  createCourse: async (data: any) => {
    const response = await axios.post("/courses/", data);
    return response.data;
  },

  // Update course
  updateCourse: async (courseId: number, data: any) => {
    const response = await axios.put(`/courses/${courseId}`, data);
    return response.data;
  },

  // Delete course
  deleteCourse: async (courseId: number) => {
    await axios.delete(`/courses/${courseId}`);
  },
};

// ============================================================================
// MODULE API
// ============================================================================

export const moduleApi = {
  // Get module by ID
  getModule: async (moduleId: number) => {
    const response = await axios.get(`/modules/${moduleId}`);
    return response.data;
  },

  // Get module with lessons
  getModuleWithLessons: async (moduleId: number) => {
    const response = await axios.get(`/modules/${moduleId}/with-lessons`);
    return response.data;
  },

  // Get modules by course
  getModulesByCourse: async (courseId: number) => {
    const response = await axios.get(`/modules/course/${courseId}`);
    return response.data;
  },

  // Create module
  createModule: async (data: any) => {
    const response = await axios.post("/modules/", data);
    return response.data;
  },

  // Update module
  updateModule: async (moduleId: number, data: any) => {
    const response = await axios.put(`/modules/${moduleId}`, data);
    return response.data;
  },

  // Delete module
  deleteModule: async (moduleId: number) => {
    await axios.delete(`/modules/${moduleId}`);
  },
};

// ============================================================================
// LESSON API
// ============================================================================

export const lessonApi = {
  // Get lesson by ID
  getLesson: async (lessonId: number) => {
    const response = await axios.get(`/lessons/${lessonId}`);
    return response.data;
  },

  // Get lesson with media
  getLessonWithMedia: async (lessonId: number) => {
    const response = await axios.get(`/lessons/${lessonId}/with-media`);
    return response.data;
  },

  // Get lessons by module
  getLessonsByModule: async (moduleId: number) => {
    const response = await axios.get(`/lessons/module/${moduleId}`);
    return response.data;
  },

  // Create lesson
  createLesson: async (data: any) => {
    const response = await axios.post("/lessons/", data);
    return response.data;
  },

  // Update lesson
  updateLesson: async (lessonId: number, data: any) => {
    const response = await axios.put(`/lessons/${lessonId}`, data);
    return response.data;
  },

  // Delete lesson
  deleteLesson: async (lessonId: number) => {
    await axios.delete(`/lessons/${lessonId}`);
  },
};

// ============================================================================
// MEDIA API
// ============================================================================

export const mediaApi = {
  // Get media by ID
  getMedia: async (mediaId: number) => {
    const response = await axios.get(`/media/${mediaId}`);
    return response.data;
  },

  // Get media by lesson
  getMediaByLesson: async (lessonId: number) => {
    const response = await axios.get(`/media/lesson/${lessonId}`);
    return response.data;
  },

  // Create media
  createMedia: async (data: any) => {
    const response = await axios.post("/media/", data);
    return response.data;
  },

  // Update media
  updateMedia: async (mediaId: number, data: any) => {
    const response = await axios.put(`/media/${mediaId}`, data);
    return response.data;
  },

  // Delete media
  deleteMedia: async (mediaId: number) => {
    await axios.delete(`/media/${mediaId}`);
  },
};

// ============================================================================
// TEST API
// ============================================================================

export const testApi = {
  // Get all tests
  getAllTests: async () => {
    const response = await axios.get("/tests/");
    return response.data;
  },

  // Get test by ID
  getTest: async (testId: number) => {
    const response = await axios.get(`/tests/${testId}`);
    return response.data;
  },

  // Get test with questions
  getTestWithQuestions: async (testId: number) => {
    const response = await axios.get(`/tests/${testId}/with-questions`);
    return response.data;
  },

  // Create test
  createTest: async (data: any) => {
    const response = await axios.post("/tests/", data);
    return response.data;
  },

  // Update test
  updateTest: async (testId: number, data: any) => {
    const response = await axios.put(`/tests/${testId}`, data);
    return response.data;
  },

  // Delete test
  deleteTest: async (testId: number) => {
    await axios.delete(`/tests/${testId}`);
  },

  // Start test (authenticated)
  startTest: async (testId: number) => {
    const response = await axios.post(`/tests/${testId}/start`);
    return response.data;
  },

  // Submit test (authenticated)
  submitTest: async (testId: number, answers: any) => {
    const response = await axios.post(`/tests/${testId}/submit`, { answers });
    return response.data;
  },

  // Get test attempts (authenticated)
  getTestAttempts: async (testId: number) => {
    const response = await axios.get(`/tests/${testId}/attempts`);
    return response.data;
  },

  // Get test result (authenticated)
  getTestResult: async (testId: number, attemptId: number) => {
    const response = await axios.get(`/tests/${testId}/result/${attemptId}`);
    return response.data;
  },

  // Get tests by course
  getCourseTests: async (courseId: number) => {
    const response = await axios.get(`/tests/course/${courseId}`);
    return response.data;
  },

  // Assign test to course (by updating test's course_id)
  assignTestToCourse: async (testId: number, courseId: number) => {
    const response = await axios.put(`/tests/${testId}`, {
      course_id: courseId,
    });
    return response.data;
  },

  // Unassign test from course
  unassignTestFromCourse: async (testId: number) => {
    const response = await axios.put(`/tests/${testId}`, { course_id: null });
    return response.data;
  },
};

// ============================================================================
// QUESTION API
// ============================================================================

export const questionApi = {
  // Get question by ID
  getQuestion: async (questionId: number) => {
    const response = await axios.get(`/questions/${questionId}`);
    return response.data;
  },

  // Get question with options
  getQuestionWithOptions: async (questionId: number) => {
    const response = await axios.get(`/questions/${questionId}/with-options`);
    return response.data;
  },

  // Get questions by test
  getQuestionsByTest: async (testId: number) => {
    const response = await axios.get(`/questions/test/${testId}`);
    return response.data;
  },

  // Create question
  createQuestion: async (data: any) => {
    const response = await axios.post("/questions/", data);
    return response.data;
  },

  // Update question
  updateQuestion: async (questionId: number, data: any) => {
    const response = await axios.put(`/questions/${questionId}`, data);
    return response.data;
  },

  // Delete question
  deleteQuestion: async (questionId: number) => {
    await axios.delete(`/questions/${questionId}`);
  },
};

// ============================================================================
// OPTION API
// ============================================================================

export const optionApi = {
  // Get option by ID
  getOption: async (optionId: number) => {
    const response = await axios.get(`/options/${optionId}`);
    return response.data;
  },

  // Get options by question
  getOptionsByQuestion: async (questionId: number) => {
    const response = await axios.get(`/options/question/${questionId}`);
    return response.data;
  },

  // Create option
  createOption: async (data: any) => {
    const response = await axios.post("/options/", data);
    return response.data;
  },

  // Update option
  updateOption: async (optionId: number, data: any) => {
    const response = await axios.put(`/options/${optionId}`, data);
    return response.data;
  },

  // Delete option
  deleteOption: async (optionId: number) => {
    await axios.delete(`/options/${optionId}`);
  },
};

// ============================================================================
// PROGRESS API
// ============================================================================

export const progressApi = {
  // Get progress by ID
  getProgress: async (progressId: number) => {
    const response = await axios.get(`/progress/${progressId}`);
    return response.data;
  },

  // Get progress by user and course
  getProgressByUserAndCourse: async (userId: number, courseId: number) => {
    const response = await axios.get(
      `/progress/user/${userId}/course/${courseId}`
    );
    return response.data;
  },

  // Create progress
  createProgress: async (data: any) => {
    const response = await axios.post("/progress/", data);
    return response.data;
  },

  // Update progress
  updateProgress: async (progressId: number, data: any) => {
    const response = await axios.put(`/progress/${progressId}`, data);
    return response.data;
  },

  // Delete progress
  deleteProgress: async (progressId: number) => {
    await axios.delete(`/progress/${progressId}`);
  },
};

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

export const apiClient = {
  setToken: (token: string) => {
    localStorage.setItem("access_token", token);
  },
  removeToken: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
  getCurrentUser: userApi.getCurrentUser,
  request: async (endpoint: string, options?: any) => {
    const method = options?.method || "GET";
    const response = await axios({
      method,
      url: endpoint,
      data: options?.body ? JSON.parse(options.body) : undefined,
      ...options,
    });
    return response.data;
  },
};

// ============================================================================
// S3 / MEDIA API
// ============================================================================

export const s3Api = {
  // Upload media file (image or video)
  uploadMedia: async (
    file: File,
    mediaType: "image" | "video",
    courseId?: number,
    lessonId?: number,
    customName?: string
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("media_type", mediaType);

    if (courseId) formData.append("course_id", courseId.toString());
    if (lessonId) formData.append("lesson_id", lessonId.toString());
    if (customName) formData.append("custom_name", customName);

    const response = await axios.post("/s3/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get all media files
  getAllMedia: async (
    skip: number = 0,
    limit: number = 100,
    mediaType?: "image" | "video",
    courseId?: number,
    lessonId?: number
  ) => {
    const params: any = { skip, limit };
    if (mediaType) params.media_type = mediaType;
    if (courseId) params.course_id = courseId;
    if (lessonId) params.lesson_id = lessonId;

    const response = await axios.get("/s3/media", { params });
    return response.data;
  },

  // Delete media file
  deleteMedia: async (mediaId: string) => {
    const response = await axios.delete(`/s3/media/${mediaId}`);
    return response.data;
  },

  // Get media configuration
  getMediaConfig: async () => {
    const response = await axios.get("/s3/config");
    return response.data;
  },
};



export const photosApi = {
  // Get user photos
  getUserPhotos: async (
    userId: string,
    skip: number = 0,
    limit: number = 100
  ): Promise<MediaListResponse> => {
    const response = await axios.get(`/photos/user/${userId}`, {
      params: { skip, limit },
    });
    return response.data;
  },
};