"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus,
  FileQuestion,
  CheckCircle,
  XCircle,
  Target,
  Calendar
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import { testApi, questionApi } from '@/lib/api/test-api';
import { TestWithQuestions, QuestionType } from '@/lib/types/test-types';

interface TestDetailsPageProps {
  testId: number;
}

const TestDetailsPage = ({ testId }: TestDetailsPageProps) => {
  const [test, setTest] = useState<TestWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'test' | 'question', id: number } | null>(null);
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = useCallback((toast: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  const fetchTestDetails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await testApi.getTestWithQuestions(testId);
      setTest(data);
    } catch (error) {
      console.error('Error fetching test details:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch test details'
      });
    } finally {
      setLoading(false);
    }
  }, [testId, addToast]);

  useEffect(() => {
    fetchTestDetails();
  }, [fetchTestDetails]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'test') {
        await testApi.deleteTest(deleteTarget.id);
        addToast({
          type: 'success',
          title: 'Test Deleted',
          message: 'Test deleted successfully'
        });
        window.location.href = '/dashboard/tests';
      } else {
        await questionApi.deleteQuestion(deleteTarget.id);
        addToast({
          type: 'success',
          title: 'Question Deleted',
          message: 'Question deleted successfully'
        });
        fetchTestDetails();
      }
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: `Failed to delete ${deleteTarget.type}`
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    const labels = {
      single_choice: 'Single Choice',
      multiple_choice: 'Multiple Choice',
      text: 'Text Answer'
    };
    return labels[type] || type;
  };

  const getQuestionTypeBadge = (type: QuestionType) => {
    const variants = {
      single_choice: 'bg-blue-100 text-blue-800',
      multiple_choice: 'bg-purple-100 text-purple-800',
      text: 'bg-green-100 text-green-800'
    };
    return (
      <Badge className={variants[type] || 'bg-gray-100 text-gray-800'}>
        {getQuestionTypeLabel(type)}
      </Badge>
    );
  };

  const totalPoints = test?.questions.reduce((sum, q) => sum + q.points, 0) || 0;

  if (loading) {
    return (
      <div className="w-full min-h-full bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-500">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="w-full min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Test not found</p>
          <Button 
            onClick={() => window.location.href = '/dashboard/tests'}
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
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/dashboard/tests'}
                className="mt-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
                <p className="text-gray-600 mt-1">{test.description || 'No description'}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => window.location.href = `/dashboard/test/${testId}/edit`}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Test
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setDeleteTarget({ type: 'test', id: testId });
                  setIsDeleteModalOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Test
              </Button>
            </div>
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
                    <FileQuestion className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-100">Questions</p>
                    <p className="text-3xl font-bold">{test.questions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Target className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-100">Total Points</p>
                    <p className="text-3xl font-bold">{totalPoints}</p>
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
                    <p className="text-sm font-medium text-green-100">Passing Score</p>
                    <p className="text-3xl font-bold">{test.passing_score}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-100">Created</p>
                    <p className="text-sm font-bold">{formatDate(test.created_at).split(',')[0]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Info */}
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">{formatDate(test.created_at)}</p>
                </div>
                {test.updated_at && (
                  <div>
                    <p className="text-sm text-gray-500">Updated At</p>
                    <p className="font-medium">{formatDate(test.updated_at)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Questions ({test.questions.length})</CardTitle>
              <Button
                onClick={() => window.location.href = `/dashboard/test/${testId}/question/create`}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {test.questions.length === 0 ? (
                <div className="text-center py-12">
                  <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No questions yet</p>
                  <Button
                    onClick={() => window.location.href = `/dashboard/test/${testId}/question/create`}
                    className="mt-4"
                  >
                    Add First Question
                  </Button>
                </div>
              ) : (
                test.questions
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((question, index) => (
                    <Card key={question.id} className="border-2">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-bold text-lg">Q{index + 1}.</span>
                              {getQuestionTypeBadge(question.question_type)}
                              <Badge className="bg-gray-100 text-gray-800">
                                {question.points} {question.points === 1 ? 'point' : 'points'}
                              </Badge>
                            </div>
                            <p className="text-lg font-medium mb-4">{question.question_text}</p>

                            {/* Options */}
                            {(question.question_type === 'single_choice' || 
                              question.question_type === 'multiple_choice') && (
                              <div className="space-y-2 ml-6">
                                {question.options.map((option) => (
                                  <div 
                                    key={option.id} 
                                    className={`flex items-center space-x-2 p-3 rounded-lg ${
                                      option.is_correct 
                                        ? 'bg-green-50 border border-green-200' 
                                        : 'bg-gray-50'
                                    }`}
                                  >
                                    {option.is_correct ? (
                                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    ) : (
                                      <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    )}
                                    <span className={option.is_correct ? 'font-medium text-green-900' : ''}>
                                      {option.option_text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {question.question_type === 'text' && (
                              <div className="ml-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">Text answer required</p>
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.location.href = `/dashboard/test/${testId}/question/${question.id}/edit`}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteTarget({ type: 'question', id: question.id });
                                setIsDeleteModalOpen(true);
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Delete {deleteTarget?.type === 'test' ? 'Test' : 'Question'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
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

export default TestDetailsPage;