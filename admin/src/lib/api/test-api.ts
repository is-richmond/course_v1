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
  TestResult
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

// Test API
export const testApi = {
  // Get all tests
  getAllTests: async (): Promise<Test[]> => {
    return apiCall<Test[]>('/tests/');
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

  // Get question by ID
  getQuestion: async (questionId: number): Promise<TestQuestion> => {
    return apiCall<TestQuestion>(`/questions/${questionId}`);
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
};

// Option API
export const optionApi = {
  // Get options by question
  getOptionsByQuestion: async (questionId: number): Promise<QuestionOption[]> => {
    return apiCall<QuestionOption[]>(`/options/question/${questionId}`);
  },

  // Get option by ID
  getOption: async (optionId: number): Promise<QuestionOption> => {
    return apiCall<QuestionOption>(`/options/${optionId}`);
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
};