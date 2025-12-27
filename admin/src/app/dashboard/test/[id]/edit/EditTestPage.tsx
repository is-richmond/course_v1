// admin/src/app/dashboard/test/[id]/edit/EditTestPage.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/text-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

import { testApi } from '@/lib/api/test-api';
import { Test, TestUpdate, TestType } from '@/lib/types/test-types';

interface EditTestPageProps {
  testId: number;
}

const EditTestPage = ({ testId }: EditTestPageProps) => {
  const router = useRouter();
  const [originalTest, setOriginalTest] = useState<Test | null>(null);
  const [formData, setFormData] = useState<TestUpdate>({
    title: '',
    description: '',
    passing_score: 0,
    test_type: undefined
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState({
    fetch: true,
    save: false
  });
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = useCallback((toast: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  const fetchTest = useCallback(async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const test = await testApi.getTest(testId);
      setOriginalTest(test);
      setFormData({
        title: test.title,
        description: test.description,
        passing_score: test.passing_score,
        test_type: test.test_type
      });
    } catch (error) {
      console.error('Error fetching test:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch test details'
      });
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [testId, addToast]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.title !== null && formData.title !== undefined && !formData.title.trim()) {
      newErrors.title = 'Title cannot be empty';
    }

    if (formData.passing_score !== null && formData.passing_score !== undefined && formData.passing_score < 0) {
      newErrors.passing_score = 'Passing score must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form'
      });
      return;
    }

    setLoading(prev => ({ ...prev, save: true }));
    try {
      await testApi.updateTest(testId, formData);
      addToast({
        type: 'success',
        title: 'Test Updated',
        message: 'Test updated successfully'
      });
      
      setTimeout(() => {
        router.push(`/dashboard/test/${testId}`);
      }, 1000);
    } catch (error) {
      console.error('Error updating test:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update test'
      });
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleChange = (field: keyof TestUpdate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getTestTypeDescription = (type?: TestType | null) => {
    if (!type) return '';
    const descriptions = {
      weekly: 'Tests that are given on a weekly basis',
      course_test: 'Tests associated with specific courses',
      for_combined: 'Tests that can be used in combined test generation'
    };
    return descriptions[type];
  };

  if (loading.fetch) {
    return (
      <div className="w-full min-h-full bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-900 mb-4" />
          <p className="text-gray-500">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!originalTest) {
    return (
      <div className="w-full min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Test not found</p>
          <Button 
            onClick={() => router.push('/dashboard/test')}
            className="mt-4"
          >
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="w-full h-full">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/dashboard/test/${testId}`)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Test</h1>
              <p className="text-gray-600">Update test information</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Test Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="required">
                      Test Title
                    </Label>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Enter test title"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Enter test description (optional)"
                      rows={4}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Test Type */}
                    <div className="space-y-2">
                      <Label htmlFor="test_type">Test Type</Label>
                      <Select
                        value={formData.test_type || ''}
                        onValueChange={(value) => handleChange('test_type', value as TestType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="course_test">Course Test</SelectItem>
                          <SelectItem value="for_combined">For Combined</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.test_type && (
                        <p className="text-sm text-gray-500">
                          {getTestTypeDescription(formData.test_type)}
                        </p>
                      )}
                    </div>

                    {/* Passing Score */}
                    <div className="space-y-2">
                      <Label htmlFor="passing_score">Passing Score</Label>
                      <Input
                        id="passing_score"
                        type="number"
                        min="0"
                        value={formData.passing_score ?? ''}
                        onChange={(e) => handleChange('passing_score', parseInt(e.target.value) || 0)}
                        placeholder="Enter minimum passing score"
                        className={errors.passing_score ? 'border-red-500' : ''}
                      />
                      {errors.passing_score && (
                        <p className="text-sm text-red-600">{errors.passing_score}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        The minimum score required to pass this test
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {new Date(originalTest.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {originalTest.updated_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">
                          {new Date(originalTest.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/test/${testId}`)}
                      disabled={loading.save}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading.save}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading.save ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>

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

export default EditTestPage;