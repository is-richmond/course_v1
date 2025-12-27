// admin/src/lib/api/test-api.ts

import { 
  Test, 
  TestWithQuestions, 
  TestCreate, 
  TestUpdate,
  TestQuestion,
  TestQuestionCreate,
  TestQuestionUpdate,
  QuestionOption,
  QuestionOptionCreate,
  QuestionOptionUpdate,
  QuestionWithOptions,
  TestAttempt,
  TestSubmission,
  TestResult,
  TestType,
  QuestionOptionWithMedia,
  TestQuestionWithMedia,
  CourseMediaResponse
} from '../types/test-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Helper function for file uploads
async function uploadFile<T>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, string>
): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Test API
export const testApi = {
  // Get all tests
  getAllTests: async (testType?: TestType): Promise<Test[]> => {
    const params = testType ? `?test_type=${testType}` : '';
    return apiCall<Test[]>(`/tests/${params}`);
  },

  // Get tests by type
  getTestsByType: async (testType: TestType): Promise<Test[]> => {
    return apiCall<Test[]>(`/tests/by-type/${testType}`);
  },

  // Get test by ID
  getTest: async (testId: number): Promise<Test> => {
    return apiCall<Test>(`/tests/${testId}`);
  },

  // Get test with questions and options
  getTestWithQuestions: async (testId: number): Promise<TestWithQuestions> => {
    return apiCall<TestWithQuestions>(`/tests/${testId}/with-questions`);
  },

  // Create test
  createTest: async (data: TestCreate): Promise<Test> => {
    return apiCall<Test>('/tests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update test
  updateTest: async (testId: number, data: TestUpdate): Promise<Test> => {
    return apiCall<Test>(`/tests/${testId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete test
  deleteTest: async (testId: number): Promise<void> => {
    return apiCall<void>(`/tests/${testId}`, {
      method: 'DELETE',
    });
  },

  // Start test attempt
  startTest: async (testId: number, token: string): Promise<TestAttempt> => {
    return apiCall<TestAttempt>(`/tests/${testId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Submit test
  submitTest: async (testId: number, data: TestSubmission, token: string): Promise<TestResult> => {
    return apiCall<TestResult>(`/tests/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Get test attempts
  getTestAttempts: async (testId: number, token: string): Promise<TestAttempt[]> => {
    return apiCall<TestAttempt[]>(`/tests/${testId}/attempts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Get test result
  getTestResult: async (testId: number, attemptId: number, token: string): Promise<TestResult> => {
    return apiCall<TestResult>(`/tests/${testId}/result/${attemptId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// Question API
export const questionApi = {
  // Get questions by test
  getQuestionsByTest: async (testId: number): Promise<TestQuestion[]> => {
    return apiCall<TestQuestion[]>(`/questions/test/${testId}`);
  },

  // Get questions by test with media
  getQuestionsByTestWithMedia: async (testId: number): Promise<TestQuestionWithMedia[]> => {
    return apiCall<TestQuestionWithMedia[]>(`/questions/test/${testId}/with-media`);
  },

  // Get question by ID
  getQuestion: async (questionId: number): Promise<TestQuestion> => {
    return apiCall<TestQuestion>(`/questions/${questionId}`);
  },

  // Get question with media
  getQuestionWithMedia: async (questionId: number): Promise<TestQuestionWithMedia> => {
    return apiCall<TestQuestionWithMedia>(`/questions/${questionId}/with-media`);
  },

  // Get question with options
  getQuestionWithOptions: async (questionId: number): Promise<QuestionWithOptions> => {
    return apiCall<QuestionWithOptions>(`/questions/${questionId}/with-options`);
  },

  // Create question
  createQuestion: async (data: TestQuestionCreate): Promise<TestQuestion> => {
    return apiCall<TestQuestion>('/questions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update question
  updateQuestion: async (questionId: number, data: TestQuestionUpdate): Promise<TestQuestion> => {
    return apiCall<TestQuestion>(`/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete question
  deleteQuestion: async (questionId: number): Promise<void> => {
    return apiCall<void>(`/questions/${questionId}`, {
      method: 'DELETE',
    });
  },

  // Upload description image for question
  uploadDescriptionImage: async (
    questionId: number, 
    file: File, 
    customName?: string
  ): Promise<CourseMediaResponse> => {
    return uploadFile<CourseMediaResponse>(
      `/questions/${questionId}/upload-description-image`,
      file,
      customName ? { custom_name: customName } : undefined
    );
  },

  // Delete description image
  deleteDescriptionImage: async (questionId: number, mediaId: string): Promise<void> => {
    return apiCall<void>(`/questions/${questionId}/description-image/${mediaId}`, {
      method: 'DELETE',
    });
  },
};

// Option API
export const optionApi = {
  // Get options by question
  getOptionsByQuestion: async (questionId: number): Promise<QuestionOption[]> => {
    return apiCall<QuestionOption[]>(`/options/question/${questionId}`);
  },

  // Get options by question with media
  getOptionsByQuestionWithMedia: async (questionId: number): Promise<QuestionOptionWithMedia[]> => {
    return apiCall<QuestionOptionWithMedia[]>(`/options/question/${questionId}/with-media`);
  },

  // Get option by ID
  getOption: async (optionId: number): Promise<QuestionOption> => {
    return apiCall<QuestionOption>(`/options/${optionId}`);
  },

  // Get option with media
  getOptionWithMedia: async (optionId: number): Promise<QuestionOptionWithMedia> => {
    return apiCall<QuestionOptionWithMedia>(`/options/${optionId}/with-media`);
  },

  // Create option
  createOption: async (data: QuestionOptionCreate): Promise<QuestionOption> => {
    return apiCall<QuestionOption>('/options/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update option
  updateOption: async (optionId: number, data: QuestionOptionUpdate): Promise<QuestionOption> => {
    return apiCall<QuestionOption>(`/options/${optionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete option
  deleteOption: async (optionId: number): Promise<void> => {
    return apiCall<void>(`/options/${optionId}`, {
      method: 'DELETE',
    });
  },

  // Upload description image for option
  uploadDescriptionImage: async (
    optionId: number, 
    file: File, 
    customName?: string
  ): Promise<CourseMediaResponse> => {
    return uploadFile<CourseMediaResponse>(
      `/options/${optionId}/upload-description-image`,
      file,
      customName ? { custom_name: customName } : undefined
    );
  },

  // Delete description image
  deleteDescriptionImage: async (optionId: number, mediaId: string): Promise<void> => {
    return apiCall<void>(`/options/${optionId}/description-image/${mediaId}`, {
      method: 'DELETE',
    });
  },
};