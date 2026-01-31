'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  UserFilters, 
  PaginationState, 
  UserFormData, 
  ToastMessage,
  UserTableColumn 
} from '@/lib/types/types';
import { userApi, authApi, enrollmentApi, courseApi } from '@/lib/api/api';

// Import UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Icons
import { 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Plus,
  X
} from 'lucide-react';

// Types
interface UserLoadingState {
  users: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  grantAdmin: boolean;
  courses: boolean;
  enrollment: boolean;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  author_id?: string;
}

interface UserWithCourses extends User {
  enrolledCoursesList?: Course[];
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserWithCourses[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithCourses[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [loading, setLoading] = useState<UserLoadingState>({
    users: false,
    create: false,
    update: false,
    delete: false,
    grantAdmin: false,
    courses: false,
    enrollment: false,
  });
  const [selectedUser, setSelectedUser] = useState<UserWithCourses | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Form states
  const [createForm, setCreateForm] = useState<UserFormData>({
    email: '',
    password: '',
    is_active: true,
    is_superuser: false,
    is_verified: false,
  });

  const [editForm, setEditForm] = useState<Partial<UserFormData>>({
    email: '',
    is_active: true,
    is_superuser: false,
    is_verified: false,
  });

  const tableColumns: UserTableColumn[] = [
    { key: 'first_name', label: 'Full Name', sortable: true, width: '120px' },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true, width: '120px' },
    { key: 'is_superuser', label: 'Role', sortable: true, width: '120px' },
    { key: 'is_verified', label: 'Verified', sortable: true, width: '100px' },
    { key: 'enrolled_courses', label: 'Enrolled Courses', sortable: true, width: '150px' },
    { key: 'created_at', label: 'Created', sortable: true, width: '140px' },
    { key: 'actions', label: 'Actions', width: '250px' },
  ];

  // Toast management
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setLoading(prev => ({ ...prev, courses: true }));
    try {
      const data = await courseApi.getAllCourses(0, 1000);
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch courses',
      });
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  }, [addToast]);

  // Fetch users with course details - ИСПРАВЛЕНО: загружает всех пользователей
  const fetchUsers = useCallback(async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      // API принимает: skip (от 0), limit (от 1 до 1000)
      // getUsers(skip, limit) - skip должен быть >= 0
      const skip = 0;  // начинаем с первого пользователя
      const limit = 1000;  // максимальный лимит API
      const data = await userApi.getUsers(skip, limit);
      
      // Fetch course details for each user
      const usersWithCourses = await Promise.all(
        data.map(async (user) => {
          if (user.enrolled_courses && user.enrolled_courses.length > 0) {
            try {
              const courseDetails = await Promise.all(
                user.enrolled_courses.map(courseId => 
                  courseApi.getCourse(parseInt(courseId)).catch(() => null)
                )
              );
              return {
                ...user,
                enrolledCoursesList: courseDetails.filter(c => c !== null)
              };
            } catch {
              return { ...user, enrolledCoursesList: [] };
            }
          }
          return { ...user, enrolledCoursesList: [] };
        })
      );
      
      setUsers(usersWithCourses);
      setPagination(prev => ({ ...prev, total: data.length }));
    } catch (error) {
      console.error('Error fetching users:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch users',
      });
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [addToast]);

  // Apply filters
  useEffect(() => {
    let filtered = users;

    if (filters.search) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.is_active !== undefined) {
      filtered = filtered.filter(user => user.is_active === filters.is_active);
    }

    if (filters.is_superuser !== undefined) {
      filtered = filtered.filter(user => user.is_superuser === filters.is_superuser);
    }

    if (filters.is_verified !== undefined) {
      filtered = filtered.filter(user => user.is_verified === filters.is_verified);
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

  // Load data on mount
  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, [fetchUsers, fetchCourses]);

  // Enroll user in course
  const handleEnrollUser = async (userId: string, courseId: string) => {
    setLoading(prev => ({ ...prev, enrollment: true }));
    try {
      await enrollmentApi.enrollInCourse(courseId, userId);
      addToast({
        type: 'success',
        title: 'Enrollment Success',
        message: 'User enrolled in course successfully',
      });
      fetchUsers();
      setIsEnrollModalOpen(false);
    } catch (error) {
      console.error('Error enrolling user:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to enroll user in course',
      });
    } finally {
      setLoading(prev => ({ ...prev, enrollment: false }));
    }
  };


  // Unenroll user from course
  const handleUnenrollUser = async (userId: string, courseId: string) => {
    setLoading(prev => ({ ...prev, enrollment: true }));
    try {
      await enrollmentApi.unenrollFromCourse(courseId, userId);
      addToast({
        type: 'success',
        title: 'Unenrollment Success',
        message: 'User unenrolled from course successfully',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error unenrolling user:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to unenroll user from course',
      });
    } finally {
      setLoading(prev => ({ ...prev, enrollment: false }));
    }
  };

  // Open enrollment modal
  const openEnrollModal = (user: UserWithCourses) => {
    setSelectedUser(user);
    setSelectedCourseId('');
    setIsEnrollModalOpen(true);
  };

  // Create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, create: true }));
    try {
      await authApi.register({
        email: createForm.email,
        password: createForm.password!,
      });
      addToast({
        type: 'success',
        title: 'User Created',
        message: `User ${createForm.email} created successfully`,
      });
      setIsCreateModalOpen(false);
      setCreateForm({
        email: '',
        password: '',
        is_active: true,
        is_superuser: false,
        is_verified: false,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create user',
      });
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Update user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(prev => ({ ...prev, update: true }));
    try {
      await userApi.updateUserById(selectedUser.id, editForm);
      addToast({
        type: 'success',
        title: 'User Updated',
        message: 'User updated successfully',
      });
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user',
      });
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      await userApi.deleteUserById(selectedUser.id);
      addToast({
        type: 'success',
        title: 'User Deleted',
        message: 'User deleted successfully',
      });
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete user',
      });
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Grant admin role
  const handleGrantAdmin = async (userId: string) => {
    setLoading(prev => ({ ...prev, grantAdmin: true }));
    try {
      await authApi.grantAdminRole({ user_id: userId });
      addToast({
        type: 'success',
        title: 'Admin Role Granted',
        message: 'Admin role granted successfully',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error granting admin role:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to grant admin role',
      });
    } finally {
      setLoading(prev => ({ ...prev, grantAdmin: false }));
    }
  };

  // Open edit modal
  const openEditModal = (user: UserWithCourses) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      is_active: user.is_active,
      is_superuser: user.is_superuser,
      is_verified: user.is_verified,
    });
    setIsEditModalOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get available courses for user (not enrolled)
  const getAvailableCourses = (user: UserWithCourses) => {
    const enrolledIds = user.enrolled_courses || [];
    return courses.filter(course => !enrolledIds.includes(course.id));
  };

  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="w-full h-full">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage users, roles, permissions and course enrollments</p>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-100">Total Users</p>
                    <p className="text-3xl font-bold">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-100">Active Users</p>
                    <p className="text-3xl font-bold">
                      {users.filter(u => u.is_active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-100">Admins</p>
                    <p className="text-3xl font-bold">
                      {users.filter(u => u.is_superuser).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-100">Total Courses</p>
                    <p className="text-3xl font-bold">{courses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-80">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users by email..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select 
                  value={filters.is_active?.toString() || 'all'}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      is_active: value === 'all' ? undefined : value === 'true' 
                    }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={filters.is_superuser?.toString() || 'all'}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      is_superuser: value === 'all' ? undefined : value === 'true' 
                    }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="true">Admin</SelectItem>
                    <SelectItem value="false">User</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({ search: '' });
                  }}
                  className="px-4"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Users ({filteredUsers.length})</CardTitle>
              <Button
                variant="outline"
                onClick={fetchUsers}
                disabled={loading.users}
              >
                {loading.users ? 'Loading...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      {tableColumns.map((column) => (
                        <TableHead 
                          key={column.key} 
                          style={{ width: column.width }}
                          className="font-semibold text-gray-900"
                        >
                          {column.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading.users ? (
                      <TableRow>
                        <TableCell colSpan={tableColumns.length} className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                            <p className="text-gray-500">Loading users...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={tableColumns.length} className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <UserPlus className="h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-gray-500">No users found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.is_active ? "default" : "secondary"}
                              className={user.is_active ? "bg-green-100 text-green-800" : ""}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.is_superuser ? "destructive" : "outline"}
                              className={user.is_superuser ? "bg-red-100 text-red-800" : ""}
                            >
                              {user.is_superuser ? 'Admin' : 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.is_verified ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {user.enrolled_courses?.length || 0}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEnrollModal(user)}
                                className="h-6 px-2 text-xs"
                                title="Manage Enrollments"
                              >
                                <BookOpen className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(user.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsViewModalOpen(true);
                                }}
                                className="h-8 w-8 p-0"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(user)}
                                className="h-8 w-8 p-0"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {!user.is_superuser && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleGrantAdmin(user.id)}
                                  disabled={loading.grantAdmin}
                                  className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700"
                                  title="Grant Admin"
                                >
                                  <Shield className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, filteredUsers.length)} of{' '}
                  {filteredUsers.length} results
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page * pagination.limit >= filteredUsers.length}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrollment Management Modal */}
        <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Course Enrollments</DialogTitle>
              {selectedUser && (
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              )}
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6">
                {/* Enrolled Courses */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Enrolled Courses ({selectedUser.enrolledCoursesList?.length || 0})
                  </h3>
                  {selectedUser.enrolledCoursesList && selectedUser.enrolledCoursesList.length > 0 ? (
                    <div className="space-y-2">
                      {selectedUser.enrolledCoursesList.map((course) => (
                        <div 
                          key={course.id} 
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{course.title}</p>
                            {course.description && (
                              <p className="text-sm text-gray-600">{course.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnenrollUser(selectedUser.id, course.id)}
                            disabled={loading.enrollment}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No enrolled courses</p>
                  )}
                </div>

                {/* Enroll in New Course */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Enroll in New Course
                  </h3>
                  <div className="space-y-3">
                    <Select 
                      value={selectedCourseId}
                      onValueChange={setSelectedCourseId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableCourses(selectedUser).length === 0 ? (
                          <SelectItem value="none" disabled>No available courses</SelectItem>
                        ) : (
                          getAvailableCourses(selectedUser).map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => {
                        if (selectedCourseId) {
                          handleEnrollUser(selectedUser.id, selectedCourseId);
                          setSelectedCourseId('');
                        }
                      }}
                      disabled={!selectedCourseId || loading.enrollment}
                      className="w-full"
                    >
                      {loading.enrollment ? 'Enrolling...' : 'Enroll in Course'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={() => setIsEnrollModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="create-password">Password</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading.create}>
                  {loading.create ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-verified"
                  checked={editForm.is_verified}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_verified: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit-verified">Verified</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-superuser"
                  checked={editForm.is_superuser}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_superuser: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit-superuser">Admin</Label>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading.update}>
                  {loading.update ? 'Updating...' : 'Update User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View User Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div> 
                  <Label className="text-gray-500">Full Name</Label>
                  <p className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Number</Label>
                  <p className="font-medium">{selectedUser.phone_number}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedUser.is_active ? "default" : "secondary"}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Role</Label>
                  <div className="mt-1">
                    <Badge variant={selectedUser.is_superuser ? "destructive" : "outline"}>
                      {selectedUser.is_superuser ? 'Admin' : 'User'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Verified</Label>
                  <p className="font-medium">{selectedUser.is_verified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Created At</Label>
                  <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Enrolled Courses</Label>
                  <p className="font-medium">{selectedUser.enrolled_courses?.length || 0}</p>
                  {selectedUser.enrolledCoursesList && selectedUser.enrolledCoursesList.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {selectedUser.enrolledCoursesList.map((course) => (
                        <Badge key={course.id} variant="outline" className="mr-1">
                          {course.title}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this user?</p>
              {selectedUser && (
                <p className="mt-2 font-semibold">{selectedUser.email}</p>
              )}
              <p className="mt-2 text-sm text-red-600">This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={loading.delete}
              >
                {loading.delete ? 'Deleting...' : 'Delete User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Toast Notifications */}
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right ${
                toast.type === 'success' ? 'bg-green-500 text-white' : 
                toast.type === 'error' ? 'bg-red-500 text-white' : 
                toast.type === 'warning' ? 'bg-yellow-500 text-white' : 
                'bg-blue-500 text-white'
              }`}
            >
              <div className="font-semibold">{toast.title}</div>
              <div className="text-sm opacity-90">{toast.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
