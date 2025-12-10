export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  enrolled_courses: string[];
}

export interface UserCreate {
  email:  string;
  password: string;
}

export interface UserUpdate {
  email?:  string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token:  string;
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
  is_active?:  boolean;
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

export interface LoadingState {
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
  duration?:  number;
}