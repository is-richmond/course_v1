// admin/src/lib/types/test-types.ts

export type QuestionType = 'single_choice' | 'multiple_choice' | 'text';
export type TestType = 'weekly' | 'course_test' | 'for_combined';

// Course Media Response
export interface CourseMediaResponse {
  id: string;
  filename: string;
  original_filename: string;
  custom_name: string | null;
  size: number;
  content_type: string;
  media_type: 'image' | 'video';
  s3_key: string;
  course_id: number | null;
  lesson_id: number | null;
  question_option_id: number | null;
  test_question_id: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  download_url: string | null;
}

export interface Test {
  id: number;
  title: string;
  description: string | null;
  passing_score: number;
  test_type: TestType;
  created_at: string;
  updated_at: string | null;
}

export interface TestQuestion {
  id: number;
  test_id: number;
  question_text: string;
  description: string | null;
  description_media: CourseMediaResponse[];
  question_type: QuestionType;
  points: number;
  order_index: number;
}

export interface TestQuestionWithMedia extends TestQuestion {
  description_media: CourseMediaResponse[];
}

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  description_media: CourseMediaResponse[];
  description: string | null;
  is_correct: boolean;
}

export interface QuestionOptionWithMedia extends QuestionOption {
  description_media: CourseMediaResponse[];
}

export interface QuestionWithOptions extends TestQuestion {
  options: QuestionOption[];
}

export interface TestWithQuestions extends Test {
  questions: QuestionWithOptions[];
}

export interface TestAttempt {
  id: number;
  user_id: string;
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
  test_type?: TestType;
}

export interface TestUpdate {
  title?: string | null;
  description?: string | null;
  passing_score?: number | null;
  test_type?: TestType | null;
}

export interface TestQuestionCreate {
  test_id: number;
  question_text: string;
  description?: string | null;
  question_type?: QuestionType;
  points?: number;
  order_index?: number;
}

export interface TestQuestionUpdate {
  question_text?: string | null;
  description?: string | null;
  question_type?: QuestionType | null;
  points?: number | null;
  order_index?: number | null;
}

export interface QuestionOptionCreate {
  question_id: number;
  option_text: string;
  description?: string | null;
  is_correct?: boolean;
}

export interface QuestionOptionUpdate {
  option_text?: string | null;
  description?: string | null;
  is_correct?: boolean | null;
}