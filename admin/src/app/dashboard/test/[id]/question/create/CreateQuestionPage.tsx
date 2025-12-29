// admin/src/app/dashboard/test/[id]/question/create/CreateQuestionPage.tsx
"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Plus, Trash2, Upload, X } from 'lucide-react';

import { questionApi, optionApi } from '@/lib/api/test-api';
import ContentEditor from '@/components/ContentEditor';
import { TestQuestionCreate, QuestionType, QuestionOptionCreate } from '@/lib/types/test-types';

interface CreateQuestionPageProps {
  testId: number;
}

interface OptionData {
  tempId: string;
  option_text: string;
  description?: string;
  is_correct: boolean;
  imageFile?: File | null;
  imagePreview?: string | null;
}

const CreateQuestionPage = ({ testId }: CreateQuestionPageProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<TestQuestionCreate>({
    test_id: testId,
    question_text: '',
    description: '',
    question_type: 'single_choice',
    points: 1,
    order_index: 0
  });
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(null);
  const questionImageInputRef = useRef<HTMLInputElement>(null);
  
  const [options, setOptions] = useState<OptionData[]>([
    { tempId: '1', option_text: '', description: '', is_correct: false, imageFile: null, imagePreview: null },
    { tempId: '2', option_text: '', description: '', is_correct: false, imageFile: null, imagePreview: null }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (toast: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  };

  const handleQuestionImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast({
          type: 'error',
          title: 'Invalid File',
          message: 'Please select an image file'
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        addToast({
          type: 'error',
          title: 'File Too Large',
          message: 'Image must be less than 10MB'
        });
        return;
      }
      
      setQuestionImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestionImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeQuestionImage = () => {
    setQuestionImageFile(null);
    setQuestionImagePreview(null);
    if (questionImageInputRef.current) {
      questionImageInputRef.current.value = '';
    }
  };

  const handleOptionImageSelect = (tempId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast({
          type: 'error',
          title: 'Invalid File',
          message: 'Please select an image file'
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        addToast({
          type: 'error',
          title: 'File Too Large',
          message: 'Image must be less than 10MB'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setOptions(prev => prev.map(opt => 
          opt.tempId === tempId 
            ? { ...opt, imageFile: file, imagePreview: reader.result as string }
            : opt
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeOptionImage = (tempId: string) => {
    setOptions(prev => prev.map(opt => 
      opt.tempId === tempId 
        ? { ...opt, imageFile: null, imagePreview: null }
        : opt
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.question_text.trim()) {
      newErrors.question_text = 'Question text is required';
    }

    if (formData.points !== undefined && formData.points < 0) {
      newErrors.points = 'Points must be positive';
    }

    if (formData.order_index !== undefined && formData.order_index < 0) {
      newErrors.order_index = 'Order index must be positive';
    }

    if (formData.question_type === 'single_choice' || formData.question_type === 'multiple_choice') {
      const validOptions = options.filter(opt => opt.option_text.trim());
      
      if (validOptions.length < 2) {
        newErrors.options = 'At least 2 options are required';
      }

      const correctOptions = validOptions.filter(opt => opt.is_correct);
      
      if (formData.question_type === 'single_choice' && correctOptions.length !== 1) {
        newErrors.options = 'Exactly 1 option must be marked as correct for single choice';
      }

      if (formData.question_type === 'multiple_choice' && correctOptions.length === 0) {
        newErrors.options = 'At least 1 option must be marked as correct for multiple choice';
      }
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

    setLoading(true);
    try {
      const question = await questionApi.createQuestion(formData);

      if (questionImageFile) {
        try {
          await questionApi.uploadDescriptionImage(
            question.id, 
            questionImageFile,
            'Question description image'
          );
        } catch (error) {
          console.error('Error uploading question image:', error);
          addToast({
            type: 'warning',
            title: 'Image Upload Failed',
            message: 'Question created but image upload failed'
          });
        }
      }

      if (formData.question_type === 'single_choice' || formData.question_type === 'multiple_choice') {
        const validOptions = options.filter(opt => opt.option_text.trim());
        
        for (const option of validOptions) {
          const optionData: QuestionOptionCreate = {
            question_id: question.id,
            description: option.description,
            option_text: option.option_text,
            is_correct: option.is_correct
          };
          
          const createdOption = await optionApi.createOption(optionData);
          
          if (option.imageFile) {
            try {
              await optionApi.uploadDescriptionImage(
                createdOption.id,
                option.imageFile,
                `Option ${option.option_text} image`
              );
            } catch (error) {
              console.error('Error uploading option image:', error);
            }
          }
        }
      }

      addToast({
        type: 'success',
        title: 'Question Created',
        message: 'Question created successfully'
      });
      
      setTimeout(() => {
        router.push(`/dashboard/test/${testId}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating question:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create question'
      });
      setLoading(false);
    }
  };

  const handleChange = (field: keyof TestQuestionCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleQuestionTypeChange = (type: QuestionType) => {
    handleChange('question_type', type);
    
    if (type === 'text') {
      setOptions([]);
    } else if (options.length === 0) {
      setOptions([
        { tempId: '1', option_text: '', description: '', is_correct: false, imageFile: null, imagePreview: null },
        { tempId: '2', option_text: '', description: '', is_correct: false, imageFile: null, imagePreview: null }
      ]);
    }
  };

  const addOption = () => {
    setOptions(prev => [
      ...prev,
      { 
        tempId: Math.random().toString(36).substr(2, 9), 
        option_text: '', 
        description: '',
        is_correct: false,
        imageFile: null,
        imagePreview: null
      }
    ]);
  };

  const removeOption = (tempId: string) => {
    setOptions(prev => prev.filter(opt => opt.tempId !== tempId));
  };

  const updateOption = (tempId: string, field: keyof OptionData, value: any) => {
    setOptions(prev => prev.map(opt => 
      opt.tempId === tempId ? { ...opt, [field]: value } : opt
    ));
    
    if (field === 'is_correct' && value && formData.question_type === 'single_choice') {
      setOptions(prev => prev.map(opt => 
        opt.tempId === tempId ? { ...opt, is_correct: true } : { ...opt, is_correct: false }
      ));
    }

    if (errors.options) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.options;
        return newErrors;
      });
    }
  };

  const showOptions = formData.question_type === 'single_choice' || formData.question_type === 'multiple_choice';

  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="w-full h-full">
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/dashboard/test/${testId}`)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Question</h1>
              <p className="text-gray-600">Add a new question to the test</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Question Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ContentEditor
                    value={formData.question_text}
                    onChange={(value) => handleChange('question_text', value)}
                    placeholder="Enter your question with formatting..."
                    label="Question Text"
                    rows={4}
                  />
                  {errors.question_text && (
                    <p className="text-sm text-red-600">{errors.question_text}</p>
                  )}

                  <ContentEditor
                    value={formData.description || ''}
                    onChange={(value) => handleChange('description', value)}
                    placeholder="Add additional context or explanation..."
                    label="Description (Optional)"
                    rows={6}
                  />

                  {/* Question Image Upload */}
                  <div className="space-y-2">
                    <Label>Question Image (Optional)</Label>
                    <div className="flex items-start space-x-4">
                      {questionImagePreview ? (
                        <div className="relative">
                          <img 
                            src={questionImagePreview} 
                            alt="Question" 
                            className="w-40 h-40 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2"
                            onClick={removeQuestionImage}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <input
                            ref={questionImageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleQuestionImageSelect}
                            className="hidden"
                            id="question-image-upload"
                          />
                          <label htmlFor="question-image-upload">
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() => questionImageInputRef.current?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Question Image
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="question_type">Question Type</Label>
                      <Select
                        value={formData.question_type}
                        onValueChange={(value) => handleQuestionTypeChange(value as QuestionType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single_choice">Single Choice</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="text">Text Answer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="points">Points</Label>
                      <Input
                        id="points"
                        type="number"
                        min="0"
                        value={formData.points}
                        onChange={(e) => handleChange('points', parseInt(e.target.value) || 0)}
                        className={errors.points ? 'border-red-500' : ''}
                      />
                      {errors.points && (
                        <p className="text-sm text-red-600">{errors.points}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="order_index">Order</Label>
                      <Input
                        id="order_index"
                        type="number"
                        min="0"
                        value={formData.order_index}
                        onChange={(e) => handleChange('order_index', parseInt(e.target.value) || 0)}
                        className={errors.order_index ? 'border-red-500' : ''}
                      />
                      {errors.order_index && (
                        <p className="text-sm text-red-600">{errors.order_index}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {showOptions && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Answer Options</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.question_type === 'single_choice' 
                          ? 'Mark exactly one option as correct'
                          : 'Mark one or more options as correct'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {errors.options && (
                      <p className="text-sm text-red-600">{errors.options}</p>
                    )}
                    
                    {options.map((option, index) => (
                      <div key={option.tempId} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="flex items-center pt-2">
                            <Checkbox
                              checked={option.is_correct}
                              onCheckedChange={(checked) => 
                                updateOption(option.tempId, 'is_correct', checked)
                              }
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Input
                              value={option.option_text}
                              onChange={(e) => updateOption(option.tempId, 'option_text', e.target.value)}
                              placeholder={`Option ${index + 1}`}
                            />
                            <ContentEditor
                              value={option.description || ''}
                              onChange={(value) => updateOption(option.tempId, 'description', value)}
                              placeholder={`Description for Option ${index + 1} (optional)`}
                              label=""
                              rows={4}
                            />
                          </div>
                          {options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(option.tempId)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {/* Option Image */}
                        <div className="ml-9">
                          {option.imagePreview ? (
                            <div className="relative inline-block">
                              <img 
                                src={option.imagePreview} 
                                alt={`Option ${index + 1}`}
                                className="w-32 h-32 object-cover rounded border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2"
                                onClick={() => removeOptionImage(option.tempId)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleOptionImageSelect(option.tempId, e)}
                                className="hidden"
                                id={`option-image-${option.tempId}`}
                              />
                              <label htmlFor={`option-image-${option.tempId}`}>
                                <div className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer text-sm">
                                  <Upload className="w-4 h-4" />
                                  <span>Add Image</span>
                                </div>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/test/${testId}`)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Create Question
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>

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

export default CreateQuestionPage;