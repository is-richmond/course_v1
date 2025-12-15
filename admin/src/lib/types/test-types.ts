// Test Types
export type QuestionType = 'single_choice' | 'multiple_choice' | 'text';

export interface Test {
  id: number;
  title: string;
  description: string | null;
  passing_score: number;
  created_at: string;
  updated_at: string | null;
}

export interface TestQuestion {
  id: number;
  test_id: number;
  question_text: string;
  question_type: QuestionType;
  points: number;
  order_index: number;
}

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
}

export interface QuestionWithOptions extends TestQuestion {
  options: QuestionOption[];
}

export interface TestWithQuestions extends Test {
  questions: QuestionWithOptions[];
}

export interface TestAttempt {
  id: number;
  user_id: number;
  test_id: number;
  score: number;
  total_points: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface TestAnswerSubmit {
  question_id: number;
  selected_option_ids?: number[] | null;
  text_answer?: string | null;
}

export interface TestSubmission {
  answers: TestAnswerSubmit[];
}

export interface TestAnswerResult {
  question_id: number;
  question_text: string;
  selected_option_ids?: number[] | null;
  text_answer?: string | null;
  is_correct?: boolean | null;
  points_earned: number;
  points_possible: number;
}

export interface TestResult {
  attempt_id: number;
  test_id: number;
  test_title: string;
  score: number;
  total_points: number;
  passing_score: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
  answers: TestAnswerResult[];
}

// Create/Update Schemas
export interface TestCreate {
  title: string;
  description?: string | null;
  passing_score?: number;
}

export interface TestUpdate {
  title?: string | null;
  description?: string | null;
  passing_score?: number | null;
}

export interface TestQuestionCreate {
  test_id: number;
  question_text: string;
  question_type?: QuestionType;
  points?: number;
  order_index?: number;
}

export interface TestQuestionUpdate {
  question_text?: string | null;
  question_type?: QuestionType | null;
  points?: number | null;
  order_index?: number | null;
}

export interface QuestionOptionCreate {
  question_id: number;
  option_text: string;
  is_correct?: boolean;
}

export interface QuestionOptionUpdate {
  option_text?: string | null;
  is_correct?: boolean | null;
}