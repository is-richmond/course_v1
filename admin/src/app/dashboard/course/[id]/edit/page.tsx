"use client";
import React, { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/text-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  FileText,
} from 'lucide-react';

import { courseApi, moduleApi, lessonApi, mediaApi } from '@/lib/api/api';
import { 
  CourseFormData, 
  ModuleFormData, 
  LessonFormData, 
  MediaFormData,
  CourseStatus,
  LessonType,
  MediaType 
} from '@/app/dashboard/course/types';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = parseInt(resolvedParams.id);
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    author_id: null,
    status: CourseStatus.DRAFT,
    price: 0,
    modules: []
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const course = await courseApi.getCourseWithModules(courseId);
      
      const modulesWithDetails = await Promise.all(
        course.modules.map(async (module: any) => {
          const moduleDetails = await moduleApi.getModuleWithLessons(module.id);
          
          const lessonsWithMedia = await Promise.all(
            moduleDetails.lessons.map(async (lesson: any) => {
              const lessonDetails = await lessonApi.getLessonWithMedia(lesson.id);
              return {
                id: lesson.id,
                title: lesson.title,
                content: lesson.content || '',
                lesson_type: lesson.lesson_type as LessonType,
                order_index: lesson.order_index,
                media: lessonDetails.media.map((m: any) => ({
                  id: m.id,
                  media_url: m.media_url,
                  media_type: m.media_type as MediaType,
                  order_index: m.order_index
                })),
                isExpanded: false
              };
            })
          );

          return {
            id: module.id,
            title: module.title,
            order_index: module.order_index,
            lessons: lessonsWithMedia,
            isExpanded: false
          };
        })
      );

      setFormData({
        title: course.title,
        description: course.description || '',
        author_id: course.author_id,
        status: course.status as CourseStatus,
        price: course.price,
        modules: modulesWithDetails
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch course details'
      });
    } finally {
      setLoading(false);
    }
  };

  const addToast = (toast: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await courseApi.updateCourse(courseId, {
        title: formData.title,
        description: formData.description,
        author_id: formData.author_id || undefined,
        status: formData.status,
        price: formData.price
      });

      for (const module of formData.modules) {
        let moduleId = module.id;

        if (!moduleId) {
          const createdModule = await moduleApi.createModule({
            title: module.title,
            order_index: module.order_index,
            course_id: courseId
          });
          moduleId = createdModule.id;
        } else {
          await moduleApi.updateModule(moduleId, {
            title: module.title,
            order_index: module.order_index
          });
        }

        for (const lesson of module.lessons) {
          let lessonId = lesson.id;

          if (!lessonId) {
            const createdLesson = await lessonApi.createLesson({
              title: lesson.title,
              content: lesson.content,
              lesson_type: lesson.lesson_type,
              order_index: lesson.order_index,
              module_id: moduleId
            });
            lessonId = createdLesson.id;
          } else {
            await lessonApi.updateLesson(lessonId, {
              title: lesson.title,
              content: lesson.content,
              lesson_type: lesson.lesson_type,
              order_index: lesson.order_index
            });
          }

          for (const media of lesson.media) {
            if (!media.id) {
              await mediaApi.createMedia({
                media_url: media.media_url,
                media_type: media.media_type,
                order_index: media.order_index,
                lesson_id: lessonId
              });
            } else {
              await mediaApi.updateMedia(media.id, {
                media_url: media.media_url,
                media_type: media.media_type,
                order_index: media.order_index
              });
            }
          }
        }
      }

      addToast({
        type: 'success',
        title: 'Success',
        message: 'Course updated successfully'
      });

      setTimeout(() => {
        window.location.href = `/dashboard/course/${courseId}`;
      }, 1500);
    } catch (error) {
      console.error('Error saving course:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save course'
      });
    } finally {
      setSaving(false);
    }
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          title: '',
          order_index: prev.modules.length,
          lessons: [],
          isExpanded: true
        }
      ]
    }));
  };

  const removeModule = (moduleIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== moduleIndex)
    }));
  };

  const updateModule = (moduleIndex: number, field: keyof ModuleFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => 
        i === moduleIndex ? { ...m, [field]: value } : m
      )
    }));
  };

  const toggleModule = (moduleIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => 
        i === moduleIndex ? { ...m, isExpanded: !m.isExpanded } : m
      )
    }));
  };

  const addLesson = (moduleIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => 
        i === moduleIndex ? {
          ...m,
          lessons: [
            ...m.lessons,
            {
              title: '',
              content: '',
              lesson_type: LessonType.THEORY,
              order_index: m.lessons.length,
              media: [],
              isExpanded: true
            }
          ]
        } : m
      )
    }));
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => 
        i === moduleIndex ? {
          ...m,
          lessons: m.lessons.filter((_, li) => li !== lessonIndex)
        } : m
      )
    }));
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, field: keyof LessonFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => 
        i === moduleIndex ? {
          ...m,
          lessons: m.lessons.map((l, li) => 
            li === lessonIndex ? { ...l, [field]: value } : l
          )
        } : m
      )
    }));
  };

  const toggleLesson = (moduleIndex: number, lessonIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => 
        i === moduleIndex ? {
          ...m,
          lessons: m.lessons.map((l, li) => 
            li === lessonIndex ? { ...l, isExpanded: !l.isExpanded } : l
          )
        } : m
      )
    }));
  };

  const addMedia = (moduleIndex: number, lessonIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => 
        i === moduleIndex ? {
          ...m,
          lessons: m.lessons.map((l, li) => 
            li === lessonIndex ? {
              ...l,
              media: [
                ...l.media,
                {
                  media_url: '',
                  media_type: MediaType.IMAGE,
                  order_index: l.media.length
                }
              ]
            } : l
          )
        } : m
      )
    }));
  };

  const removeMedia = (moduleIndex: number, lessonIndex: number, mediaIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => 
        i === moduleIndex ? {
          ...m,
          lessons: m.lessons.map((l, li) => 
            li === lessonIndex ? {
              ...l,
              media: l.media.filter((_, mi) => mi !== mediaIndex)
            } : l
          )
        } : m
      )
    }));
  };

  const updateMedia = (moduleIndex: number, lessonIndex: number, mediaIndex: number, field: keyof MediaFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => 
        i === moduleIndex ? {
          ...m,
          lessons: m.lessons.map((l, li) => 
            li === lessonIndex ? {
              ...l,
              media: l.media.map((media, mi) => 
                mi === mediaIndex ? { ...media, [field]: value } : media
              )
            } : l
          )
        } : m
      )
    }));
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="w-full h-full">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => window.location.href = '/dashboard/course'}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
                <p className="text-gray-600">Update course details (ID: {courseId})</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = '/dashboard/course'}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Course title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as CourseStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Course description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author_id">Author ID (Optional)</Label>
                  <Input
                    id="author_id"
                    type="number"
                    value={formData.author_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, author_id: parseInt(e.target.value) || null }))}
                    placeholder="Leave empty for no author"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Modules</CardTitle>
              <Button
                type="button"
                onClick={addModule}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </CardHeader>
            <CardContent>
              {formData.modules.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No modules yet. Click "Add Module" to create one.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.modules.map((module, moduleIndex) => (
                    <Card key={moduleIndex} className="border-2">
                      {/* Module Header */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => toggleModule(moduleIndex)}
                          className="flex items-center gap-2 flex-1"
                        >
                          {module.isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                          <span className="font-semibold">
                            Module {moduleIndex + 1}: {module.title || 'Untitled Module'}
                          </span>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeModule(moduleIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Module Content */}
                      {module.isExpanded && (
                        <CardContent className="pt-4 space-y-4">
                          <div className="space-y-2">
                            <Label>Module Title *</Label>
                            <Input
                              value={module.title}
                              onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                              placeholder="Module title"
                              required
                            />
                          </div>

                          {/* Lessons */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>Lessons</Label>
                              <Button
                                type="button"
                                onClick={() => addLesson(moduleIndex)}
                                variant="outline"
                                size="sm"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Lesson
                              </Button>
                            </div>

                            {module.lessons.length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-4">
                                No lessons in this module
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {module.lessons.map((lesson, lessonIndex) => (
                                  <Card key={lessonIndex} className="border">
                                    {/* Lesson Header */}
                                    <div className="flex items-center justify-between p-3 bg-gray-100">
                                      <button
                                        type="button"
                                        onClick={() => toggleLesson(moduleIndex, lessonIndex)}
                                        className="flex items-center gap-2 flex-1"
                                      >
                                        {lesson.isExpanded ? (
                                          <ChevronDown className="w-4 h-4" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4" />
                                        )}
                                        <span className="text-sm font-medium">
                                          Lesson {lessonIndex + 1}: {lesson.title || 'Untitled Lesson'}
                                        </span>
                                      </button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>

                                    {/* Lesson Content */}
                                    {lesson.isExpanded && (
                                      <CardContent className="pt-3 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-2">
                                            <Label className="text-sm">Lesson Title *</Label>
                                            <Input
                                              value={lesson.title}
                                              onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                                              placeholder="Lesson title"
                                              required
                                              className="text-sm"
                                            />
                                          </div>

                                          <div className="space-y-2">
                                            <Label className="text-sm">Type</Label>
                                            <Select
                                              value={lesson.lesson_type}
                                              onValueChange={(value) => updateLesson(moduleIndex, lessonIndex, 'lesson_type', value)}
                                            >
                                              <SelectTrigger className="text-sm">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="theory">Theory</SelectItem>
                                                <SelectItem value="test">Test</SelectItem>
                                                <SelectItem value="practice">Practice</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <Label className="text-sm">Content</Label>
                                          <Textarea
                                            value={lesson.content}
                                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'content', e.target.value)}
                                            placeholder="Lesson content"
                                            rows={3}
                                            className="text-sm"
                                          />
                                        </div>

                                        {/* Media */}
                                        <div className="space-y-2">
                                          <div className="flex justify-between items-center">
                                            <Label className="text-sm">Media (Optional)</Label>
                                            <Button
                                              type="button"
                                              onClick={() => addMedia(moduleIndex, lessonIndex)}
                                              variant="outline"
                                              size="sm"
                                            >
                                              <Plus className="w-3 h-3 mr-1" />
                                              Add Media
                                            </Button>
                                          </div>

                                          {lesson.media.length > 0 && (
                                            <div className="space-y-2">
                                              {lesson.media.map((media, mediaIndex) => (
                                                <div key={mediaIndex} className="flex gap-2 items-start p-2 bg-gray-50 rounded">
                                                  <Select
                                                    value={media.media_type}
                                                    onValueChange={(value) => updateMedia(moduleIndex, lessonIndex, mediaIndex, 'media_type', value)}
                                                  >
                                                    <SelectTrigger className="w-32 text-xs">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="image">Image</SelectItem>
                                                      <SelectItem value="video">Video</SelectItem>
                                                      <SelectItem value="document">Document</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                  
                                                  <Input
                                                    value={media.media_url}
                                                    onChange={(e) => updateMedia(moduleIndex, lessonIndex, mediaIndex, 'media_url', e.target.value)}
                                                    placeholder="Media URL"
                                                    className="flex-1 text-sm"
                                                  />
                                                  
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeMedia(moduleIndex, lessonIndex, mediaIndex)}
                                                    className="text-red-600"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                    )}
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Toasts */}
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-lg shadow-lg max-w-sm ${
                toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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
}