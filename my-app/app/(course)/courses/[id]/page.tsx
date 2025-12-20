"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { PaymentModal } from "@/src/components/PaymentModal";
import { LessonContentRenderer } from "@/src/components/course/LessonContentRenderer";
import { CourseProgressBar } from "@/src/components/course/CourseProgressBar";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Rating } from "@/src/components/ui/Rating";
import { coursesAPI, modulesAPI, lessonsAPI, progressAPI } from "@/src/lib/api";
import type {
  CourseWithModules,
  ModuleWithLessons,
  LessonWithAllMedia,
} from "@/src/types/api";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CoursePage({ params: paramsPromise }: PageProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Store modules with their lessons loaded
  const [modulesWithLessons, setModulesWithLessons] = useState<
    Map<number, any>
  >(new Map());
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  // Store lessons with all media for content rendering
  const [lessonsWithMedia, setLessonsWithMedia] = useState<
    Map<number, LessonWithAllMedia>
  >(new Map());
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [isLoadingLessonMedia, setIsLoadingLessonMedia] = useState(false);
  // Track completed lessons for progress
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(
    new Set()
  );
  // Mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Navigation state
  const [isNavigating, setIsNavigating] = useState(false);

  // Check if user has access to the course:
  // 1. User must be authenticated
  // 2. User must be verified by admin (is_verified: true)
  // 3. User must be enrolled in this course
  const isEnrolled = courseId
    ? user?.enrolled_courses?.includes(courseId)
    : false;
  const isVerified = user?.is_verified === true;
  const hasAccess = isAuthenticated && isVerified && isEnrolled;

  // Get all lessons in correct order for navigation
  const getAllLessonsFlat = useCallback(() => {
    const modules = course?.modules || [];
    const allLessons: { id: number; moduleId: number; title: string }[] = [];

    modules.forEach((module: any) => {
      const moduleLessons = modulesWithLessons.get(module.id)?.lessons || [];
      const sortedLessons = [...moduleLessons].sort(
        (a: any, b: any) => a.id - b.id
      );
      sortedLessons.forEach((lesson: any) => {
        allLessons.push({
          id: lesson.id,
          moduleId: module.id,
          title: lesson.title,
        });
      });
    });

    return allLessons;
  }, [course, modulesWithLessons]);

  // Get navigation info for current lesson
  const getNavigationInfo = useCallback(() => {
    const allLessons = getAllLessonsFlat();
    const currentIndex = allLessons.findIndex((l) => l.id === selectedLessonId);

    return {
      prevLesson: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      nextLesson:
        currentIndex < allLessons.length - 1
          ? allLessons[currentIndex + 1]
          : null,
      currentIndex,
      totalLessons: allLessons.length,
      isLastLesson: currentIndex === allLessons.length - 1,
    };
  }, [getAllLessonsFlat, selectedLessonId]);

  // Select a lesson and load its content
  const selectLesson = useCallback(
    async (lessonId: number, moduleId?: number) => {
      // Close sidebar on mobile after selection
      setIsSidebarOpen(false);

      // Update module selection if provided
      if (moduleId) {
        setSelectedModuleId(String(moduleId));
        setExpandedModules((prev) => new Set([...prev, String(moduleId)]));
      }

      // Check cache first
      if (lessonsWithMedia.has(lessonId)) {
        setSelectedLessonId(lessonId);
        return;
      }

      setIsLoadingLessonMedia(true);
      try {
        const lessonWithMedia = await lessonsAPI.getWithAllMedia(lessonId);
        setLessonsWithMedia((prev) =>
          new Map(prev).set(lessonId, lessonWithMedia)
        );
        setSelectedLessonId(lessonId);
      } catch (err) {
        console.error(
          `Failed to fetch lesson media for lesson ${lessonId}:`,
          err
        );
      } finally {
        setIsLoadingLessonMedia(false);
      }
    },
    [lessonsWithMedia]
  );

  // Fetch all modules with their lessons
  const fetchModulesWithLessons = async (moduleIds: number[]) => {
    setIsLoadingLessons(true);
    try {
      const modulesData = await Promise.all(
        moduleIds.map(async (moduleId) => {
          try {
            const moduleWithLessons = await modulesAPI.getWithLessons(moduleId);
            return { id: moduleId, data: moduleWithLessons };
          } catch (err) {
            console.error(
              `Failed to fetch lessons for module ${moduleId}:`,
              err
            );
            return { id: moduleId, data: null };
          }
        })
      );

      const newMap = new Map<number, any>();
      modulesData.forEach(({ id, data }) => {
        if (data) {
          newMap.set(id, data);
        }
      });
      setModulesWithLessons(newMap);
      return newMap;
    } catch (err) {
      console.error("Failed to fetch modules with lessons:", err);
      return new Map();
    } finally {
      setIsLoadingLessons(false);
    }
  };

  // Mark lesson as completed and navigate to next
  const handleNextLesson = async () => {
    if (!selectedLessonId || !courseId || isNavigating) return;

    setIsNavigating(true);

    try {
      // Mark current lesson as completed (only if not already completed)
      if (!completedLessons.has(selectedLessonId)) {
        const newCompleted = new Set(completedLessons);
        newCompleted.add(selectedLessonId);
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
              lesson_id: selectedLessonId,
              completed: true,
            });
          } catch (err) {
            console.error("Failed to sync progress with backend:", err);
          }
        }
      }

      // Navigate to next lesson
      const { nextLesson, isLastLesson } = getNavigationInfo();
      if (nextLesson) {
        await selectLesson(nextLesson.id, nextLesson.moduleId);
      } else if (isLastLesson) {
        // Course completed - show congratulations or stay on last lesson
        // For now, just stay on last lesson
      }
    } finally {
      setIsNavigating(false);
    }
  };

  // Navigate to previous lesson
  const handlePrevLesson = async () => {
    const { prevLesson } = getNavigationInfo();
    if (prevLesson) {
      await selectLesson(prevLesson.id, prevLesson.moduleId);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const params = await paramsPromise;
        setCourseId(params.id);

        // Fetch course from API
        const fetchedCourse = await coursesAPI.getWithModules(
          parseInt(params.id)
        );
        setCourse(fetchedCourse);

        // If user has access, fetch lessons for all modules
        let loadedModules = new Map();
        if (fetchedCourse.modules && fetchedCourse.modules.length > 0) {
          const moduleIds = fetchedCourse.modules.map((m: any) => m.id);
          loadedModules = await fetchModulesWithLessons(moduleIds);
        }

        // Load completed lessons from localStorage
        const savedCompleted = localStorage.getItem(
          `course_${params.id}_progress`
        );
        if (savedCompleted) {
          try {
            const completedArray = JSON.parse(savedCompleted);
            setCompletedLessons(new Set(completedArray));
          } catch (e) {
            console.error("Failed to parse completed lessons:", e);
          }
        }

        // Restore last position or auto-select first lesson
        const lastLesson = localStorage.getItem(
          `course_${params.id}_lastLesson`
        );
        const lastModule = localStorage.getItem(
          `course_${params.id}_lastModule`
        );

        if (lastLesson && lastModule) {
          // Restore last position
          const lessonId = parseInt(lastLesson);
          const moduleIdx = parseInt(lastModule);
          if (moduleIdx >= 0 && moduleIdx < fetchedCourse.modules.length) {
            const moduleId = fetchedCourse.modules[moduleIdx].id;
            setSelectedModuleId(String(moduleId));
            setExpandedModules(new Set([String(moduleId)]));
            // Load lesson content
            setTimeout(() => selectLesson(lessonId, moduleId), 100);
          }
        } else if (fetchedCourse.modules.length > 0 && loadedModules.size > 0) {
          // Auto-select first module and first lesson
          const firstModule = fetchedCourse.modules[0];
          const firstModuleData = loadedModules.get(firstModule.id);
          if (firstModuleData?.lessons?.length > 0) {
            const sortedLessons = [...firstModuleData.lessons].sort(
              (a: any, b: any) => a.id - b.id
            );
            const firstLesson = sortedLessons[0];
            setSelectedModuleId(String(firstModule.id));
            setExpandedModules(new Set([String(firstModule.id)]));
            setTimeout(() => selectLesson(firstLesson.id, firstModule.id), 100);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Failed to fetch course:", err);
        setError("Не удалось загрузить курс");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [paramsPromise]);

  // Save current lesson position
  useEffect(() => {
    if (courseId && selectedLessonId && selectedModuleId) {
      localStorage.setItem(
        `course_${courseId}_lastLesson`,
        String(selectedLessonId)
      );
      const modules = course?.modules || [];
      const moduleIdx = modules.findIndex(
        (m: any) => String(m.id) === selectedModuleId
      );
      if (moduleIdx >= 0) {
        localStorage.setItem(
          `course_${courseId}_lastModule`,
          String(moduleIdx)
        );
      }
    }
  }, [courseId, selectedLessonId, selectedModuleId, course]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">
            Загрузка курса...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (!course || !courseId) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-fadeIn">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 256 256"
              className="text-red-500 sm:w-10 sm:h-10"
            >
              <path
                fill="currentColor"
                d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
              />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Курс не найден
          </h1>
        </div>
      </div>
    );
  }

  const handleEnrollmentRequest = () => {
    // User requested enrollment - close modal and inform them
    setIsPaymentOpen(false);
    // The enrollment will be handled by the PaymentModal
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // Use modules from API
  const modules = course.modules || [];

  // Helper to get lessons for a module from loaded data - SORTED BY ID
  const getModuleLessons = (moduleId: number) => {
    const moduleData = modulesWithLessons.get(moduleId);
    const lessons = moduleData?.lessons || [];
    // Sort lessons by id ascending to ensure correct order
    return [...lessons].sort((a: any, b: any) => a.id - b.id);
  };

  // Get total lessons count
  const getTotalLessons = () => {
    let total = 0;
    modules.forEach((m: any) => {
      total += getModuleLessons(m.id).length;
    });
    return total;
  };

  // Default values for optional fields from API
  const coursePrice = course.price ?? 0;
  const courseRating = course.rating ?? 4.5;
  const courseLevel = course.level ?? "beginner";
  const courseDuration = course.duration ?? "4 недели";
  const whatYouWillLearn = course.whatYouWillLearn ?? [
    "Основные концепции курса",
    "Практические навыки",
    "Сертификация по окончании",
  ];

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    toggleModule(moduleId);

    // Auto-select first lesson of this module
    const lessons = getModuleLessons(parseInt(moduleId));
    if (lessons.length > 0) {
      selectLesson(lessons[0].id, parseInt(moduleId));
    }
  };

  const selectedModule = modules.find(
    (m: any) => String(m.id) === selectedModuleId
  );

  // Get current lesson data
  const currentLesson = selectedLessonId
    ? lessonsWithMedia.get(selectedLessonId)
    : null;
  const navInfo = getNavigationInfo();

  // ========== ACCESS DENIED STATE ==========
  // User needs: 1) to be authenticated, 2) to be verified by admin, 3) to be enrolled in course
  if (!hasAccess) {
    // Determine the reason for access denial
    const accessDeniedReason = !isAuthenticated
      ? "login"
      : !isEnrolled
      ? "not_enrolled"
      : !isVerified
      ? "not_verified"
      : "unknown";

    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main className="pt-16 sm:pt-20">
          {/* Hero Section with Course Image - RESPONSIVE */}
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-24">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left: Course Image */}
                <div className="animate-slideInLeft order-2 lg:order-1">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                    <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden shadow-2xl">
                      <img
                        src={`https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=450&fit=crop`}
                        alt={course.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-2">
                        <Badge variant="primary">
                          {courseLevel === "beginner"
                            ? "Начинающий"
                            : courseLevel === "intermediate"
                            ? "Средний"
                            : "Продвинутый"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Course Info */}
                <div className="animate-slideInRight order-1 lg:order-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                    {course.title}
                  </h1>

                  <p className="text-sm sm:text-base lg:text-lg text-blue-100 mb-4 sm:mb-6 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="flex items-center gap-2">
                      <Rating rating={courseRating} />
                      <span className="text-white font-medium text-sm sm:text-base">
                        {courseRating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200 text-sm sm:text-base">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 256 256"
                        className="sm:w-[18px] sm:h-[18px]"
                      >
                        <path
                          fill="currentColor"
                          d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"
                        />
                      </svg>
                      <span>{courseDuration}</span>
                    </div>
                  </div>

                  {/* Price Card */}
                  <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                    <div className="flex items-baseline gap-2 mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                        ₸{coursePrice.toLocaleString("ru-RU")}
                      </span>
                    </div>

                    <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {[
                        `${modules.length} модулей`,
                        "Пожизненный доступ",
                        "Сертификат по окончании",
                      ].map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 sm:gap-3 text-white text-sm sm:text-base"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 256 256"
                            className="text-green-400 shrink-0 sm:w-5 sm:h-5"
                          >
                            <path
                              fill="currentColor"
                              d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                            />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Show appropriate message and button based on access status */}
                    {accessDeniedReason === "login" ? (
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 text-sm sm:text-base py-3 sm:py-4"
                        onClick={() => router.push("/auth/login")}
                      >
                        Войти для записи на курс
                      </Button>
                    ) : accessDeniedReason === "not_enrolled" ? (
                      <div className="space-y-3">
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 text-sm sm:text-base py-3 sm:py-4"
                          onClick={() => setIsPaymentOpen(true)}
                        >
                          Записаться на курс
                        </Button>
                        <p className="text-blue-100 text-xs sm:text-sm text-center">
                          После записи администратор подтвердит ваш доступ
                        </p>
                      </div>
                    ) : accessDeniedReason === "not_verified" ? (
                      <div className="space-y-3">
                        <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 256 256"
                              className="text-yellow-400"
                            >
                              <path
                                fill="currentColor"
                                d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
                              />
                            </svg>
                            <span className="font-semibold text-yellow-400 text-sm sm:text-base">
                              Ожидание подтверждения
                            </span>
                          </div>
                          <p className="text-blue-100 text-xs sm:text-sm">
                            Вы записаны на курс. Ожидайте подтверждения от
                            администратора для получения доступа к материалам.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 text-sm sm:text-base py-3 sm:py-4"
                        onClick={() => setIsPaymentOpen(true)}
                      >
                        Оплатить и начать обучение
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Details - RESPONSIVE */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* What you'll learn */}
              <div className="animate-fadeInUp">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Чему вы научитесь
                </h2>
                <div className="grid gap-3 sm:gap-4">
                  {whatYouWillLearn.map((item: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 256 256"
                          className="text-green-600 sm:w-[18px] sm:h-[18px]"
                        >
                          <path
                            fill="currentColor"
                            d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm sm:text-base">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Syllabus Preview */}
              <div
                className="animate-fadeInUp"
                style={{ animationDelay: "100ms" }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Программа курса
                </h2>
                <div className="grid gap-3 sm:gap-4">
                  {modules.map((module: any, idx: number) => (
                    <div
                      key={module.id}
                      className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md text-sm sm:text-base">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {module.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {(module.lessons || []).length} уроков
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <PaymentModal
            isOpen={isPaymentOpen}
            courseTitle={course.title}
            price={coursePrice}
            onPay={handleEnrollmentRequest}
            onClose={() => setIsPaymentOpen(false)}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // ========== HAS ACCESS STATE - User is verified and enrolled ==========
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-14 sm:pt-16 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 256 256"
            >
              <path
                fill="currentColor"
                d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"
              />
            </svg>
            <span className="font-medium text-sm">Модули</span>
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar - Course Modules */}
        <aside
          className={`
            fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
            w-[280px] sm:w-80 lg:w-80
            bg-white border-r border-gray-200 
            transform transition-transform duration-300 ease-in-out
            ${
              isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
            flex flex-col
            lg:animate-slideInLeft
          `}
        >
          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 256 256"
            >
              <path
                fill="currentColor"
                d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
              />
            </svg>
          </button>

          {/* Course Title */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 sm:p-6">
            <h2 className="font-bold text-base sm:text-lg text-white mb-2 pr-8 lg:pr-0">
              {course.title}
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mb-3">
              {modules.length} модулей • {getTotalLessons()} уроков
            </p>
            {/* Progress Bar */}
            <div className="bg-white/10 rounded-lg p-2 sm:p-3">
              <CourseProgressBar
                completedLessons={completedLessons.size}
                totalLessons={getTotalLessons()}
                variant="dark"
              />
            </div>
          </div>

          {/* Modules List */}
          <div className="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto">
            {modules.map((module: any, idx: number) => (
              <div
                key={module.id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <button
                  onClick={() => handleSelectModule(String(module.id))}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 ${
                    selectedModuleId === String(module.id)
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span
                      className={`text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center shrink-0 ${
                        selectedModuleId === String(module.id)
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm truncate">
                        {module.title.replace(/^Модуль \d+:\s*/i, "")}
                      </h4>
                      <p
                        className={`text-[10px] sm:text-xs mt-1 ${
                          selectedModuleId === String(module.id)
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {getModuleLessons(module.id).length} уроков
                      </p>
                    </div>
                  </div>
                </button>

                {/* Expanded lessons list */}
                {expandedModules.has(String(module.id)) && (
                  <div className="ml-3 sm:ml-4 mt-2 space-y-1 border-l-2 border-blue-200 pl-3 sm:pl-4">
                    {getModuleLessons(module.id).map(
                      (lesson: any, lessonIdx: number) => (
                        <button
                          key={lesson.id || lessonIdx}
                          onClick={() => selectLesson(lesson.id, module.id)}
                          className={`w-full text-left text-[11px] sm:text-xs py-2 px-2 sm:px-3 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                            selectedLessonId === lesson.id
                              ? "bg-blue-500 text-white shadow-md"
                              : "text-gray-600 hover:bg-blue-50"
                          }`}
                        >
                          {/* Completed check */}
                          {completedLessons.has(lesson.id) ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 256 256"
                              className={`shrink-0 sm:w-[14px] sm:h-[14px] ${
                                selectedLessonId === lesson.id
                                  ? "text-white"
                                  : "text-green-500"
                              }`}
                            >
                              <path
                                fill="currentColor"
                                d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 256 256"
                              className={`shrink-0 sm:w-[14px] sm:h-[14px] ${
                                selectedLessonId === lesson.id
                                  ? "text-white/70"
                                  : "text-gray-400"
                              }`}
                            >
                              <path
                                fill="currentColor"
                                d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"
                              />
                            </svg>
                          )}
                          <span className="line-clamp-1 flex-1">
                            {lesson.title || lesson}
                          </span>
                          {/* Lesson type badge */}
                          {lesson.lesson_type && (
                            <span
                              className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium ${
                                selectedLessonId === lesson.id
                                  ? "bg-white/20 text-white"
                                  : lesson.lesson_type === "theory"
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
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Back to Home */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-3 sm:p-4">
            <a
              href="/"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-600 hover:text-blue-600 transition rounded-lg sm:rounded-xl hover:bg-blue-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 256 256"
                className="sm:w-4 sm:h-4"
              >
                <path
                  fill="currentColor"
                  d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"
                />
              </svg>
              К главной
            </a>
          </div>
        </aside>

        {/* Main Content Area - Lesson Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
            {currentLesson ? (
              <div className="animate-fadeIn" key={selectedLessonId}>
                {/* Lesson Header */}
                <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-sm">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold shadow-md text-sm sm:text-base">
                      {navInfo.currentIndex + 1}
                    </div>
                    {currentLesson.lesson_type && (
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          currentLesson.lesson_type === "theory"
                            ? "bg-blue-100 text-blue-700"
                            : currentLesson.lesson_type === "practice"
                            ? "bg-green-100 text-green-700"
                            : currentLesson.lesson_type === "test"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {currentLesson.lesson_type === "theory"
                          ? "Теория"
                          : currentLesson.lesson_type === "practice"
                          ? "Практика"
                          : currentLesson.lesson_type === "test"
                          ? "Тест"
                          : currentLesson.lesson_type}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Урок {navInfo.currentIndex + 1} из {navInfo.totalLessons}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {currentLesson.title}
                  </h1>
                </div>

                {/* Lesson Content */}
                <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-sm">
                  {isLoadingLessonMedia ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                      <span className="ml-3 text-gray-500">
                        Загрузка контента...
                      </span>
                    </div>
                  ) : (
                    <LessonContentRenderer
                      content={currentLesson.content || ""}
                      lessonMedia={currentLesson.lesson_media || []}
                      urlMedia={currentLesson.media || []}
                    />
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    {/* Previous button */}
                    <Button
                      variant="outline"
                      onClick={handlePrevLesson}
                      disabled={!navInfo.prevLesson}
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

                    {/* Progress indicator */}
                    <div className="text-xs sm:text-sm text-gray-500 text-center">
                      {completedLessons.has(selectedLessonId!) ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 256 256"
                          >
                            <path
                              fill="currentColor"
                              d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"
                            />
                          </svg>
                          Пройдено
                        </span>
                      ) : (
                        <span>В процессе</span>
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
                      ) : navInfo.isLastLesson ? (
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
                      ) : (
                        <>
                          <span className="hidden sm:inline">
                            Следующий урок
                          </span>
                          <span className="sm:hidden">Далее</span>
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
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 lg:p-16 text-center animate-fadeIn">
                {isLoadingLessonMedia ? (
                  <>
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Загрузка урока...</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 256 256"
                        className="text-blue-600 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
                      >
                        <path
                          fill="currentColor"
                          d="M232,64H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48V64H24A8,8,0,0,0,16,72V200a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V72A8,8,0,0,0,232,64ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V64H96ZM224,200H32V80H224Z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                      Выберите урок для начала
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                      <span className="hidden lg:inline">
                        Нажмите на урок в левой панели, чтобы начать обучение
                      </span>
                      <span className="lg:hidden">
                        Нажмите "Модули" чтобы выбрать урок для обучения
                      </span>
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
