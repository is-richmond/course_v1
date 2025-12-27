// admin/src/app/dashboard/test/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  Target,
  BarChart3
} from 'lucide-react';

import { testApi } from '@/lib/api/test-api';
import { Test, TestType } from '@/lib/types/test-types';

const TestsListPage = () => {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TestType | 'all'>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  const [loading, setLoading] = useState({
    tests: false,
    delete: false
  });
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
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

  const fetchTests = useCallback(async () => {
    setLoading(prev => ({ ...prev, tests: true }));
    try {
      const data = await testApi.getAllTests();
      setTests(data);
      setPagination(prev => ({ ...prev, total: data.length }));
    } catch (error) {
      console.error('Error fetching tests:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch tests'
      });
    } finally {
      setLoading(prev => ({ ...prev, tests: false }));
    }
  }, [addToast]);

  useEffect(() => {
    let filtered = tests;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(test => test.test_type === typeFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredTests(filtered);
    setPagination(prev => ({ ...prev, page: 1, total: filtered.length }));
  }, [tests, searchQuery, typeFilter]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleDeleteTest = async (testId: number) => {
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      await testApi.deleteTest(testId);
      addToast({
        type: 'success',
        title: 'Test Deleted',
        message: 'Test deleted successfully'
      });
      setIsDeleteModalOpen(false);
      fetchTests();
    } catch (error) {
      console.error('Error deleting test:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete test'
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

  const getTestTypeBadge = (type: TestType) => {
    const badges = {
      weekly: { color: 'bg-purple-100 text-purple-800', label: 'Weekly' },
      course_test: { color: 'bg-blue-100 text-blue-800', label: 'Course Test' },
      for_combined: { color: 'bg-green-100 text-green-800', label: 'For Combined' }
    };
    const badge = badges[type];
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const paginatedTests = filteredTests.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const testsByType = {
    weekly: tests.filter(t => t.test_type === 'weekly').length,
    course_test: tests.filter(t => t.test_type === 'course_test').length,
    for_combined: tests.filter(t => t.test_type === 'for_combined').length
  };

  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="w-full h-full">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Management</h1>
              <p className="text-gray-600">Manage tests, questions, and options</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/test/create')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-100">Total Tests</p>
                    <p className="text-3xl font-bold">{tests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <FileQuestion className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-100">Weekly Tests</p>
                    <p className="text-3xl font-bold">{testsByType.weekly}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Target className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-100">Course Tests</p>
                    <p className="text-3xl font-bold">{testsByType.course_test}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-100">For Combined</p>
                    <p className="text-3xl font-bold">{testsByType.for_combined}</p>
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
                      placeholder="Search tests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TestType | 'all')}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="course_test">Course Test</SelectItem>
                    <SelectItem value="for_combined">For Combined</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tests Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Tests ({filteredTests.length})</CardTitle>
              <Button
                variant="outline"
                onClick={fetchTests}
                disabled={loading.tests}
              >
                {loading.tests ? 'Loading...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-32">Passing Score</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-40">Created</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-48">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading.tests ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                            <p className="text-gray-500">Loading tests...</p>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedTests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <ClipboardList className="h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-gray-500">No tests found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedTests.map((test) => (
                        <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{test.title}</td>
                          <td className="px-6 py-4">
                            {getTestTypeBadge(test.test_type)}
                          </td>
                          <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                            {test.description || 'No description'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-blue-100 text-blue-800">
                              {test.passing_score} pts
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(test.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/dashboard/test/${test.id}`)}
                                className="h-8 px-3"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/dashboard/test/${test.id}/edit`)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTest(test);
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
                  {Math.min(pagination.page * pagination.limit, filteredTests.length)} of{' '}
                  {filteredTests.length} results
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
                    disabled={pagination.page * pagination.limit >= filteredTests.length}
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
              <DialogTitle>Delete Test</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Are you sure you want to delete "{selectedTest?.title}"? This action cannot be undone and will delete all associated questions and options.
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
                onClick={() => selectedTest && handleDeleteTest(selectedTest.id)}
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

export default TestsListPage;