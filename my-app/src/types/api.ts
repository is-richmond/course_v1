/**
 * API Types based on Core Service OpenAPI Schema
 */

// =============================================================================
// ENUMS
// =============================================================================

export type CourseStatus = "draft" | "published" | "archived";
export type LessonType = "theory" | "test" | "practice";
export type MediaType = "image" | "video" | "document";
export type QuestionType = "single_choice" | "multiple_choice" | "text";
export type TestType = "weekly" | "course_test" | "for_combined";

// =============================================================================
// COURSES
// =============================================================================

export interface CourseCreate {
  title: string;
  description?:  string | null;
  author_id?:  number | null;
  status?:  CourseStatus;
  price?: number | null;
}

export interface CourseUpdate {
  title?: string | null;
  description?: string | null;
  author_id?:  number | null;
  status?:  CourseStatus | null;
  price?: number | null;
}

export interface CourseResponse {
  id: number;
  title: string;
  description?: string | null;
  author_id?:  number | null;
  status:  CourseStatus;
  price?:  number | null;
  created_at: string;
  updated_at?:  string | null;
}

export interface CourseWithModules extends CourseResponse {
  modules:  CourseModuleResponse[];
}

// =============================================================================
// MODULES
// =============================================================================

export interface CourseModuleCreate {
  title: string;
  order_index?:  number;
  course_id: number;
}

export interface CourseModuleUpdate {
  title?: string | null;
  order_index?: number | null;
}

export interface CourseModuleResponse {
  id: number;
  title: string;
  order_index: number;
  course_id: number;
}

export interface ModuleWithLessons extends CourseModuleResponse {
  lessons: LessonResponse[];
}

// =============================================================================
// LESSONS
// =============================================================================

export interface LessonCreate {
  title:  string;
  content?:  string | null;
  lesson_type?:  LessonType;
  order_index?: number;
  module_id: number;
}

export interface LessonUpdate {
  title?: string | null;
  content?: string | null;
  lesson_type?: LessonType | null;
  order_index?:  number | null;
}

export interface LessonResponse {
  id: number;
  title: string;
  content?:  string | null;
  lesson_type: LessonType;
  order_index: number;
  module_id: number;
}

export interface LessonWithMedia extends LessonResponse {
  media:  LessonMediaResponse[];
}

export interface LessonWithAllMedia extends LessonResponse {
  media: LessonMediaResponse[];
  lesson_media: CourseMediaResponse[];
}

// =============================================================================
// MEDIA
// =============================================================================

export interface LessonMediaCreate {
  media_url:  string;
  media_type?:  MediaType;
  order_index?: number;
  lesson_id: number;
}

export interface LessonMediaUpdate {
  media_url?: string | null;
  media_type?: MediaType | null;
  order_index?: number | null;
}

export interface LessonMediaResponse {
  id: number;
  media_url: string;
  media_type: MediaType;
  order_index:  number;
  lesson_id:  number;
}

export interface CourseMediaResponse {
  id: string;
  filename: string;
  original_filename:  string;
  custom_name?: string | null;
  size:  number;
  content_type: string;
  media_type: "image" | "video";
  s3_key:  string;
  course_id?:  number | null;
  lesson_id?:  number | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  uploaded_by?: string | null;
  created_at: string;
  updated_at:  string;
  download_url?: string | null;
}

// =============================================================================
// TESTS
// =============================================================================

export interface TestCreate {
  title: string;
  description?: string | null;
  passing_score?: number;
  test_type?: TestType;
  course_id?:  number | null;
}

export interface TestUpdate {
  title?: string | null;
  description?: string | null;
  passing_score?:  number | null;
  test_type?: TestType | null;
  course_id?: number | null;
}

export interface TestResponse {
  id: number;
  title: string;
  description?: string | null;
  passing_score:  number;
  test_type:  TestType;
  course_id?:  number | null;
  created_at: string;
  updated_at?:  string | null;
}

export interface TestWithQuestions extends TestResponse {
  questions: QuestionWithOptions[];
  media?:  CourseMediaResponse[]; // ✅ Added:  S3 media files (images/videos for test content)
}

// =============================================================================
// QUESTIONS & OPTIONS
// =============================================================================

export interface TestQuestionCreate {
  question_text: string;
  description?: string | null;
  question_type?: QuestionType;
  points?: number;
  order_index?: number;
  test_id: number;
}

export interface TestQuestionUpdate {
  question_text?: string | null;
  description?: string | null;
  question_type?: QuestionType | null;
  points?: number | null;
  order_index?: number | null;
}

export interface TestQuestionResponse {
  id: number;
  question_text: string;
  description?: string | null;
  description_media?: CourseMediaResponse[];
  question_type: QuestionType;
  points: number;
  order_index: number;
  test_id: number;
}

export interface QuestionOptionCreate {
  option_text:  string;
  description?: string | null;
  is_correct?: boolean;
  question_id: number;
}

export interface QuestionOptionUpdate {
  option_text?: string | null;
  description?: string | null;
  is_correct?: boolean | null;
}

export interface QuestionOptionResponse {
  id: number;
  option_text: string;
  description?: string | null;
  description_media?: CourseMediaResponse[];
  is_correct: boolean;
  question_id: number;
}

export interface QuestionWithOptions extends TestQuestionResponse {
  options: QuestionOptionResponse[];
}

// =============================================================================
// TEST ATTEMPTS & RESULTS
// =============================================================================

export interface TestAttemptResponse {
  id: number;
  user_id: number;
  test_id: number;
  score: number;
  total_points: number;
  passed:  boolean;
  started_at: string;
  completed_at?:  string | null;
}

export interface TestAnswerSubmit {
  question_id: number;
  selected_option_ids?:  number[] | null;
  text_answer?: string | null;
}

export interface TestSubmission {
  answers: TestAnswerSubmit[];
}

export interface TestAnswerResult {
  question_id: number;
  question_text: string;
  selected_option_ids?:  number[] | null;
  text_answer?: string | null;
  is_correct?:  boolean | null;
  points_earned:  number;
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
  completed_at?: string | null;
  answers: TestAnswerResult[];
}

// =============================================================================
// PROGRESS
// =============================================================================

export interface UserProgressCreate {
  user_id: number;
  course_id: number;
  lesson_id?: number | null;
  completed?:  boolean;
}

export interface UserProgressUpdate {
  completed?: boolean | null;
  completed_at?: string | null;
}

export interface UserProgressResponse {
  id: number;
  user_id: number;
  course_id: number;
  lesson_id?: number | null;
  completed: boolean;
  completed_at?:  string | null;
}

// =============================================================================
// S3 MEDIA
// =============================================================================

export interface MediaUploadResponse {
  media:  CourseMediaResponse;
  message: string;
}

export interface MediaListResponse {
  media: CourseMediaResponse[];
  total: number;
}

export interface MediaConfigResponse {
  endpoint: string;
  bucket:  string;
  region: string;
  max_image_size: number;
  max_video_size: number;
  allowed_image_types: string[];
  allowed_video_types:  string[];
  connection_status: boolean;
}

// =============================================================================
// COMBINED TESTS
// =============================================================================

export interface CombinedTestSourceResponse {
  source_test_id: number;
  source_test_title: string;
  questions_count: number;
}

export interface CombinedTestResponse {
  id: number;
  user_id: string;
  title: string;
  total_questions: number;
  created_at: string;
  source_tests: CombinedTestSourceResponse[];
}

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  description?: string | null;
  is_correct:  boolean;
}

export interface CombinedTestQuestionResponse {
  id: number;
  question_id: number;
  order_index: number;
  question_text: string;
  description?: string | null;
  description_media?: CourseMediaResponse[];
  question_type: string;
  points: number;
  source_test_title: string;
  options: QuestionOption[];
}

export interface CombinedTestDetailResponse extends CombinedTestResponse {
  questions: CombinedTestQuestionResponse[];
  media?:  CourseMediaResponse[]; // ✅ Added:  S3 media files (images/videos for test content)
}

export interface CombinedTestGenerateRequest {
  source_test_ids: number[];
  questions_count: number;
}

export interface CombinedTestAnswerSubmit {
  question_id: number;
  selected_option_ids?: number[] | null;
  text_answer?: string | null;
}

export interface CombinedTestSubmission {
  answers: CombinedTestAnswerSubmit[];
}

export interface CombinedTestAnswerResult {
  question_id: number;
  question_text: string;
  description?: string | null;
  description_media?: CourseMediaResponse[];
  source_test_title: string;
  selected_option_ids?: number[] | null;
  options: QuestionOptionResponse[];
  text_answer?: string | null;
  is_correct:  boolean;
  points_earned:  number;
  points_possible:  number;
}

export interface CombinedTestResult {
  attempt_id: number;
  combined_test_id: number;
  score: number;
  total_questions: number;
  percentage: number;
  started_at: string;
  completed_at:  string;
  answers: CombinedTestAnswerResult[];
}

export interface CombinedTestAttemptResponse {
  id:  number;
  combined_test_id: number;
  combined_test_title: string;
  user_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  started_at: string;
  completed_at: string | null;
}

export interface CombinedTestAttemptDetailResponse
  extends CombinedTestAttemptResponse {
  answers: CombinedTestAnswerResult[];
  source_tests: CombinedTestSourceResponse[];
}

export interface TopicStatistics {
  test_id: number;
  test_title: string;
  total_questions_answered: number;
  correct_answers: number;
  percentage: number;
}

export interface AttemptTopicStatistics {
  attempt_id: number;
  combined_test_title: string;
  started_at: string;
  completed_at: string | null;
  topics: TopicStatistics[];
}

export interface OverallStatistics {
  total_attempts: number;
  total_questions_answered: number;
  total_correct_answers: number;
  overall_percentage: number;
  best_attempt_score: number | null;
  worst_attempt_score: number | null;
  average_score: number;
  topics: TopicStatistics[];
}

export interface AvailableTestForCombining {
  id: number;
  title: string;
  description:  string | null;
  total_questions: number;
  test_type: string;
}

export interface TestAttemptWithTestInfo extends TestAttemptResponse {
  test_title?:  string;
  passing_score?: number;
}