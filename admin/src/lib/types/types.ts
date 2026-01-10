export interface User {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  enrolled_courses: string[];
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
}

export interface UserProfileUpdate {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface GrantAdminRequest {
  user_id: string;
}

export interface EnrollmentResponse {
  message: string;
  enrolled_courses: string[];
}

export interface MyCoursesResponse {
  enrolled_courses: string[];
}

// UI State types
export interface UserFilters {
  search: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface UserFormData {
  email: string;
  password?: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

export interface UserTableColumn {
  key: keyof User | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface UserLoadingState {
  users: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  grantAdmin: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Course Management Types
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum LessonType {
  THEORY = 'theory',
  TEST = 'test',
  PRACTICE = 'practice'
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document'
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  author_id: number | null;
  status: CourseStatus;
  price: number;
  created_at: string;
  updated_at: string | null;
}

export interface CourseCreate {
  title: string;
  description?: string;
  author_id?: number;
  status?: CourseStatus;
  price?: number;
}

export interface CourseUpdate {
  title?: string;
  description?: string;
  author_id?: number;
  status?: CourseStatus;
  price?: number;
}

export interface CourseWithModules extends Course {
  modules: CourseModule[];
}

export interface CourseModule {
  id: number;
  title: string;
  order_index: number;
  course_id: number;
}

export interface CourseModuleCreate {
  title: string;
  order_index?: number;
  course_id: number;
}

export interface CourseModuleUpdate {
  title?: string;
  order_index?: number;
}

export interface ModuleWithLessons extends CourseModule {
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  title: string;
  content: string | null;
  lesson_type: LessonType;
  order_index: number;
  module_id: number;
}

export interface LessonCreate {
  title: string;
  content?: string;
  lesson_type?: LessonType;
  order_index?: number;
  module_id: number;
}

export interface LessonUpdate {
  title?: string;
  content?: string;
  lesson_type?: LessonType;
  order_index?: number;
}

export interface LessonWithMedia extends Lesson {
  media: LessonMedia[];
}

export interface LessonMedia {
  id: number;
  media_url: string;
  media_type: MediaType;
  order_index: number;
  lesson_id: number;
}

export interface LessonMediaCreate {
  media_url: string;
  media_type?: MediaType;
  order_index?: number;
  lesson_id: number;
}

export interface LessonMediaUpdate {
  media_url?: string;
  media_type?: MediaType;
  order_index?: number;
}

export interface CourseFilters {
  search: string;
  status?: CourseStatus;
  author_id?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface CourseTableColumn {
  key: keyof Course | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface CourseLoadingState {
  courses: boolean;
  modules: boolean;
  lessons: boolean;
  media: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface CourseFormData {
  title: string;
  description: string;
  author_id: number | null;
  status: CourseStatus;
  price: number;
  modules: ModuleFormData[];
}

export interface ModuleFormData {
  id?: number;
  title: string;
  order_index: number;
  lessons: LessonFormData[];
  isExpanded?: boolean;
}

export interface LessonFormData {
  id?: number;
  title: string;
  content: string;
  lesson_type: LessonType;
  order_index: number;
  media: MediaFormData[];
  isExpanded?: boolean;
}

export interface MediaFormData {
  id?: number;
  media_url: string;
  media_type: MediaType;
  order_index: number;
}

export interface UserProgress {
  id: number;
  user_id: number;
  course_id: number;
  lesson_id: number | null;
  completed: boolean;
  completed_at: string | null;
}

export interface UserProgressCreate {
  user_id: number;
  course_id: number;
  lesson_id?: number;
  completed?: boolean;
}

export interface UserProgressUpdate {
  completed?: boolean;
  completed_at?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  totalModules: number;
  totalLessons: number;
}

export interface DashboardStats {
  courses: CourseStats;
  recentCourses: Course[];
  popularCourses: Course[];
}




export interface Photo {
  id: number;
  user_id: string;
  file_name: string;
  file_path: string;
  upload_date: string;
  file_size?: number;
  mime_type?: string;
}

export interface MediaListResponse {
  items: Photo[];
  total: number;
  skip: number;
  limit: number;
}

export interface PhotosByDate {
  [date: string]: Photo[];
}

export interface PhotosLoadingState {
  users: boolean;
  photos: boolean;
}