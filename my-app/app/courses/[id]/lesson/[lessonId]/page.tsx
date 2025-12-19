"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LessonContentRenderer } from "@/src/components/course/LessonContentRenderer";
import { CourseProgressBar } from "@/src/components/course/CourseProgressBar";
import { Button } from "@/src/components/ui/Button";
import { coursesAPI, modulesAPI, lessonsAPI, progressAPI } from "@/src/lib/api";
import { useAuth } from "@/src/contexts/AuthContext";
import type { LessonWithAllMedia, CourseModuleResponse } from "@/src/types/api";

interface PageProps {
  params: Promise<{
    id: string;
    lessonId: string;
  }>;
}

interface LessonNavigation {
  prevLesson: { id: number; moduleId: number } | null;
  nextLesson: { id: number; moduleId: number } | null;
  isLastLessonInModule: boolean;
  isLastLessonInCourse: boolean;
  currentModuleIndex: number;
  currentLessonIndex: number;
  totalModules: number;
  totalLessons: number;
}

export default function LessonPage({ params: paramsPromise }: PageProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [courseId, setCourseId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [lesson, setLesson] = useState<LessonWithAllMedia | null>(null);
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [moduleTitle, setModuleTitle] = useState<string>("");
  const [navigation, setNavigation] = useState<LessonNavigation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Progress tracking
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(
    new Set()
  );
  const [totalLessons, setTotalLessons] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  // Build navigation map for the course
  const buildNavigationMap = useCallback(
    async (
      cId: number,
      currentLessonId: number
    ): Promise<{ nav: LessonNavigation; modules: CourseModuleResponse[] }> => {
      const course = await coursesAPI.getWithModules(cId);
      setCourseTitle(course.title);

      // Fetch all modules with lessons
      const modulesWithLessons = await Promise.all(
        course.modules.map(async (m) => {
          const moduleData = await modulesAPI.getWithLessons(m.id);
          return {
            ...m,
            lessons: [...(moduleData.lessons || [])].sort(
              (a, b) => a.id - b.id
            ),
          };
        })
      );

      // Count total lessons
      let total = 0;
      modulesWithLessons.forEach((m) => {
        total += m.lessons.length;
      });
      setTotalLessons(total);

      // Find current position and navigation
      let prevLesson: { id: number; moduleId: number } | null = null;
      let nextLesson: { id: number; moduleId: number } | null = null;
      let currentModuleIndex = 0;
      let currentLessonIndex = 0;
      let found = false;
      let isLastInModule = false;
      let isLastInCourse = false;

      for (let mi = 0; mi < modulesWithLessons.length; mi++) {
        const mod = modulesWithLessons[mi];
        for (let li = 0; li < mod.lessons.length; li++) {
          const les = mod.lessons[li];

          if (found && !nextLesson) {
            nextLesson = { id: les.id, moduleId: mod.id };
            break;
          }

          if (les.id === currentLessonId) {
            found = true;
            currentModuleIndex = mi;
            currentLessonIndex = li;
            isLastInModule = li === mod.lessons.length - 1;
            isLastInCourse =
              mi === modulesWithLessons.length - 1 && isLastInModule;
            setModuleTitle(mod.title);
          }

          if (!found) {
            prevLesson = { id: les.id, moduleId: mod.id };
          }
        }
        if (nextLesson) break;
      }

      return {
        nav: {
          prevLesson,
          nextLesson,
          isLastLessonInModule: isLastInModule,
          isLastLessonInCourse: isLastInCourse,
          currentModuleIndex,
          currentLessonIndex,
          totalModules: modulesWithLessons.length,
          totalLessons: total,
        },
        modules: course.modules,
      };
    },
    []
  );

  // Load lesson data
  useEffect(() => {
    (async () => {
      try {
        const params = await paramsPromise;
        const cId = params.id;
        const lId = parseInt(params.lessonId);

        setCourseId(cId);
        setLessonId(lId);

        // Load lesson content
        const lessonData = await lessonsAPI.getWithAllMedia(lId);
        setLesson(lessonData);

        // Build navigation
        const { nav } = await buildNavigationMap(parseInt(cId), lId);
        setNavigation(nav);

        // Load completed lessons from localStorage
        const savedCompleted = localStorage.getItem(`course_${cId}_progress`);
        if (savedCompleted) {
          try {
            const completedArray = JSON.parse(savedCompleted);
            setCompletedLessons(new Set(completedArray));
          } catch (e) {
            console.error("Failed to parse progress:", e);
          }
        }

        // Save current lesson as last accessed
        localStorage.setItem(`course_${cId}_lastLesson`, lId.toString());

        setError(null);
      } catch (err) {
        console.error("Failed to load lesson:", err);
        setError("Не удалось загрузить урок");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [paramsPromise, buildNavigationMap]);

  // Mark current lesson as completed and navigate
  const handleNextLesson = async () => {
    if (!lessonId || !courseId || !navigation || isNavigating) return;

    setIsNavigating(true);

    try {
      // Mark current lesson as completed (only if not already completed)
      if (!completedLessons.has(lessonId)) {
        const newCompleted = new Set(completedLessons);
        newCompleted.add(lessonId);
        setCompletedLessons(newCompleted);

        // Save to localStorage
        localStorage.setItem(
          `course_${courseId}_progress`,
          JSON.stringify([...newCompleted])
        );

        // Sync with backend if user is logged in
        if (user) {
          try {
            await progressAPI.create({
              user_id: parseInt(user.id),
              course_id: parseInt(courseId),
              lesson_id: lessonId,
              completed: true,
            });
          } catch (err) {
            console.error("Failed to sync progress with backend:", err);
          }
        }
      }

      // Navigate to next lesson
      if (navigation.nextLesson) {
        router.push(`/courses/${courseId}/lesson/${navigation.nextLesson.id}`);
      } else if (navigation.isLastLessonInCourse) {
        // Course completed - redirect to course page
        router.push(`/courses/${courseId}`);
      }
    } finally {
      setIsNavigating(false);
    }
  };

  // Navigate to previous lesson
  const handlePrevLesson = () => {
    if (!navigation?.prevLesson || !courseId) return;
    router.push(`/courses/${courseId}/lesson/${navigation.prevLesson.id}`);
  };

  // Back to course list
  const handleBackToCourse = () => {
    router.push("/");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center animate-fadeIn">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка урока...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center animate-fadeIn">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 256 256"
              className="text-red-500"
            >
              <path
                fill="currentColor"
                d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {error || "Урок не найден"}
          </h1>
          <Button
            variant="outline"
            onClick={handleBackToCourse}
            className="mt-4"
          >
            Вернуться к курсам
          </Button>
        </div>
      </div>
    );
  }

  const progressPercent =
    totalLessons > 0
      ? Math.round((completedLessons.size / totalLessons) * 100)
      : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Course info */}
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-xs text-gray-500 truncate">{courseTitle}</p>
            <p className="text-sm font-medium text-gray-700 truncate">
              {moduleTitle}
            </p>
          </div>

          {/* Center: Progress */}
          <div className="hidden sm:block w-48 mx-4">
            <div className="text-xs text-gray-500 text-center mb-1">
              Прогресс: {progressPercent}%
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right: Back button */}
          <button
            onClick={handleBackToCourse}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 256 256"
            >
              <path
                fill="currentColor"
                d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"
              />
            </svg>
            <span className="hidden sm:inline">К курсам</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          {/* Lesson Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                {navigation ? navigation.currentLessonIndex + 1 : 1}
              </div>
              {lesson.lesson_type && (
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    lesson.lesson_type === "theory"
                      ? "bg-blue-100 text-blue-700"
                      : lesson.lesson_type === "practice"
                      ? "bg-green-100 text-green-700"
                      : lesson.lesson_type === "test"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {lesson.lesson_type === "theory"
                    ? "Теория"
                    : lesson.lesson_type === "practice"
                    ? "Практика"
                    : lesson.lesson_type === "test"
                    ? "Тест"
                    : lesson.lesson_type}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {lesson.title}
            </h1>
          </div>

          {/* Lesson Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <LessonContentRenderer
              content={lesson.content || ""}
              lessonMedia={lesson.lesson_media || []}
              urlMedia={lesson.media || []}
            />
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <footer className="sticky bottom-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {/* Previous button */}
          <Button
            variant="outline"
            onClick={handlePrevLesson}
            disabled={!navigation?.prevLesson}
            className="flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 256 256"
            >
              <path
                fill="currentColor"
                d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"
              />
            </svg>
            <span className="hidden sm:inline">Назад</span>
          </Button>

          {/* Progress indicator (mobile) */}
          <div className="sm:hidden text-xs text-gray-500">
            {navigation && (
              <>
                Урок {navigation.currentLessonIndex + 1} из{" "}
                {navigation.totalLessons}
              </>
            )}
          </div>

          {/* Next button */}
          <Button
            variant="primary"
            onClick={handleNextLesson}
            disabled={isNavigating}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            {isNavigating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Загрузка...</span>
              </>
            ) : navigation?.isLastLessonInCourse ? (
              <>
                <span>Завершить курс</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 256 256"
                >
                  <path
                    fill="currentColor"
                    d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"
                  />
                </svg>
              </>
            ) : navigation?.isLastLessonInModule ? (
              <>
                <span>Следующий модуль</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 256 256"
                >
                  <path
                    fill="currentColor"
                    d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"
                  />
                </svg>
              </>
            ) : (
              <>
                <span>Следующий урок</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 256 256"
                >
                  <path
                    fill="currentColor"
                    d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"
                  />
                </svg>
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
