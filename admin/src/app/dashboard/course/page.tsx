"use client";


import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Book, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  Archive
} from 'lucide-react';

// Import API functions
import { courseApi } from '@/lib/api/api';
import { Course, CourseStatus } from './types';

const CoursesListPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: undefined as CourseStatus | undefined
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  const [loading, setLoading] = useState({
    courses: false,
    delete: false
  });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = useCallback((toast: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  const fetchCourses = useCallback(async () => {
    setLoading(prev => ({ ...prev, courses: true }));
    try {
      const skip = (pagination.page - 1) * pagination.limit;
      const data = await courseApi.getAllCourses(skip, pagination.limit);
      setCourses(data);
      setPagination(prev => ({ ...prev, total: data.length }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch courses'
      });
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  }, [pagination.page, pagination.limit, addToast]);

  useEffect(() => {
    let filtered = courses;

    if (filters.search) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    if (filters.status) {
      filtered = filtered.filter(course => course.status === filters.status);
    }

    setFilteredCourses(filtered);
  }, [courses, filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDeleteCourse = async (courseId: number) => {
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      await courseApi.deleteCourse(courseId);
      addToast({
        type: 'success',
        title: 'Course Deleted',
        message: 'Course deleted successfully'
      });
      setIsDeleteModalOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete course'
      });
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      published: { color: 'bg-green-100 text-green-800', label: 'Published' },
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Archived' }
    };
    const variant = variants[status] || variants.draft;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="w-full h-full">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
              <p className="text-gray-600">Manage courses, modules, and lessons</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/dashboard/course/create'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Book className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-100">Total Courses</p>
                    <p className="text-3xl font-bold">{courses.length}</p>
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
                    <p className="text-sm font-medium text-green-100">Published</p>
                    <p className="text-3xl font-bold">
                      {courses.filter(c => c.status === 'published').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-100">Drafts</p>
                    <p className="text-3xl font-bold">
                      {courses.filter(c => c.status === 'draft').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Archive className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-100">Archived</p>
                    <p className="text-3xl font-bold">
                      {courses.filter(c => c.status === 'archived').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-80">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search courses..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select 
                  value={filters.status || 'all'}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      status: value === 'all' ? undefined : value as CourseStatus
                    }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setFilters({ search: '', status: undefined })}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Courses Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Courses ({filteredCourses.length})</CardTitle>
              <Button
                variant="outline"
                onClick={fetchCourses}
                disabled={loading.courses}
              >
                {loading.courses ? 'Loading...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-32">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-32">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-40">Created</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-48">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading.courses ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                            <p className="text-gray-500">Loading courses...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <Book className="h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-gray-500">No courses found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{course.title}</td>
                          <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                            {course.description || 'No description'}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(course.status)}
                          </td>
                          <td className="px-6 py-4 font-semibold">
                            ${course.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(course.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.location.href = `/dashboard/course/${course.id}`}
                                className="h-8 px-3"
                               >
                                <Eye className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.location.href = `/dashboard/course/${course.id}/edit`}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCourse(course);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, filteredCourses.length)} of{' '}
                  {filteredCourses.length} results
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
                    disabled={pagination.page * pagination.limit >= filteredCourses.length}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delete Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Course</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Are you sure you want to delete "{selectedCourse?.title}"? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={loading.delete}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedCourse && handleDeleteCourse(selectedCourse.id)}
                disabled={loading.delete}
              >
                {loading.delete ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Toasts */}
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right ${
                toast.type === 'success' ? 'bg-green-500 text-white' : 
                toast.type === 'error' ? 'bg-red-500 text-white' :  
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

export default CoursesListPage;