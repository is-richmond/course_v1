"use client";
import React, { useState, useEffect, useCallback, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  BookOpen,
  List,
  FileText,
  Image,
  Video,
  File,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

import { courseApi, moduleApi, lessonApi } from '@/lib/api/api';
import { CourseWithModules, ModuleWithLessons, LessonWithMedia } from '../types';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  // Используем React.use() для unwrap промиса params
  const resolvedParams = use(params);
  const courseId = parseInt(resolvedParams.id);
  
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());
  const [modulesDetails, setModulesDetails] = useState<Map<number, ModuleWithLessons>>(new Map());
  const [lessonsDetails, setLessonsDetails] = useState<Map<number, LessonWithMedia>>(new Map());
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = useCallback((toast: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const data = await courseApi.getCourseWithModules(courseId);
      setCourse(data);
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

  const toggleModule = async (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
      
      if (!modulesDetails.has(moduleId)) {
        try {
          const moduleData = await moduleApi.getModuleWithLessons(moduleId);
          setModulesDetails(prev => new Map(prev).set(moduleId, moduleData));
        } catch (error) {
          console.error('Error fetching module details:', error);
          addToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to fetch module details'
          });
        }
      }
    }
    
    setExpandedModules(newExpanded);
  };

  const toggleLesson = async (lessonId: number) => {
    const newExpanded = new Set(expandedLessons);
    
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
      
      if (!lessonsDetails.has(lessonId)) {
        try {
          const lessonData = await lessonApi.getLessonWithMedia(lessonId);
          setLessonsDetails(prev => new Map(prev).set(lessonId, lessonData));
        } catch (error) {
          console.error('Error fetching lesson details:', error);
          addToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to fetch lesson details'
          });
        }
      }
    }
    
    setExpandedLessons(newExpanded);
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      published: { color: 'bg-green-100 text-green-800', label: 'Published' },
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Archived' }
    };
    const variant = variants[status] || variants.draft;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getLessonTypeBadge = (type: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      theory: { color: 'bg-blue-100 text-blue-800', label: 'Theory' },
      test: { color: 'bg-purple-100 text-purple-800', label: 'Test' },
      practice: { color: 'bg-orange-100 text-orange-800', label: 'Practice' }
    };
    const variant = variants[type] || variants.theory;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <File className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Course not found</p>
          <Button
            onClick={() => window.location.href = '/dashboard/course'}
            className="mt-4"
          >
            Back to Courses
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
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/dashboard/course'}
                className="mt-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                  {getStatusBadge(course.status)}
                </div>
                <p className="text-gray-600">{course.description || 'No description'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.href = `/dashboard/course/${courseId}/edit`}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Course
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Course Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Price</div>
                <div className="text-2xl font-bold text-gray-900">${course.price.toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Modules</div>
                <div className="text-2xl font-bold text-gray-900">{course.modules.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Created</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(course.created_at)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Last Updated</div>
                <div className="text-sm font-medium text-gray-900">
                  {course.updated_at ? formatDate(course.updated_at) : 'Never'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Course Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {course.modules.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No modules yet</p>
                  <Button
                    onClick={() => window.location.href = `/dashboard/course/create-edit/${courseId}?mode=edit`}
                    className="mt-4"
                  >
                    Add Module
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {course.modules.map((module, moduleIndex) => {
                    const isExpanded = expandedModules.has(module.id);
                    const moduleDetails = modulesDetails.get(module.id);

                    return (
                      <div key={module.id} className="border rounded-lg">
                        {/* Module Header */}
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                            <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded">
                              <span className="text-sm font-semibold text-gray-700">
                                Module {moduleIndex + 1}
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">{module.title}</span>
                          </div>
                          {moduleDetails && (
                            <span className="text-sm text-gray-600">
                              {moduleDetails.lessons.length} lessons
                            </span>
                          )}
                        </button>

                        {/* Module Content */}
                        {isExpanded && moduleDetails && (
                          <div className="border-t bg-gray-50 p-4">
                            {moduleDetails.lessons.length === 0 ? (
                              <p className="text-gray-600 text-center py-4">No lessons in this module</p>
                            ) : (
                              <div className="space-y-2">
                                {moduleDetails.lessons.map((lesson, lessonIndex) => {
                                  const isLessonExpanded = expandedLessons.has(lesson.id);
                                  const lessonDetails = lessonsDetails.get(lesson.id);

                                  return (
                                    <div key={lesson.id} className="bg-white border rounded-lg">
                                      {/* Lesson Header */}
                                      <button
                                        onClick={() => toggleLesson(lesson.id)}
                                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                                      >
                                        <div className="flex items-center gap-3">
                                          {isLessonExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                          )}
                                          <FileText className="w-4 h-4 text-gray-600" />
                                          <span className="font-medium text-gray-900">{lesson.title}</span>
                                          {getLessonTypeBadge(lesson.lesson_type)}
                                        </div>
                                      </button>

                                      {/* Lesson Content */}
                                      {isLessonExpanded && lessonDetails && (
                                        <div className="border-t p-4 bg-gray-50">
                                          {lessonDetails.content && (
                                            <div className="mb-4">
                                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Content:</h4>
                                              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                                {lessonDetails.content}
                                              </p>
                                            </div>
                                          )}

                                          {lessonDetails.media.length > 0 && (
                                            <div>
                                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Media:</h4>
                                              <div className="space-y-2">
                                                {lessonDetails.media.map((media) => (
                                                  <div
                                                    key={media.id}
                                                    className="flex items-center gap-2 p-2 bg-white border rounded"
                                                  >
                                                    {getMediaIcon(media.media_type)}
                                                    <a
                                                      href={media.media_url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-sm text-blue-600 hover:underline flex-1 truncate"
                                                    >
                                                      {media.media_url}
                                                    </a>
                                                    <Badge variant="outline" className="text-xs">
                                                      {media.media_type}
                                                    </Badge>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {!lessonDetails.content && lessonDetails.media.length === 0 && (
                                            <p className="text-sm text-gray-500 text-center py-2">
                                              No content or media in this lesson
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
}