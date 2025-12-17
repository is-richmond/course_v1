"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { PaymentModal } from "@/src/components/PaymentModal";
import { ModuleContent } from "@/src/components/course/ModuleContent";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Rating } from "@/src/components/ui/Rating";
import { coursesAPI, modulesAPI } from "@/src/lib/api";
import type { CourseWithModules, ModuleWithLessons } from "@/src/types/api";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Demo content for modules with image references
const moduleContents: {
  [key: string]: {
    content: string;
    images: { [key: string]: { url: string; alt: string } };
    zoomLink?: string;
    testId?: string;
  };
} = {
  "1": {
    content: `Сердце — это полый мышечный орган, расположенный в грудной клетке между легкими. (figure1) показывает общую анатомию сердца человека.

Сердце состоит из четырех камер: двух предсердий и двух желудочков. Правая сторона сердца получает венозную кровь и направляет ее в легкие для обогащения кислородом. (image1) демонстрирует схему кровообращения.

Стенка сердца состоит из трех слоев: эндокарда (внутренний слой), миокарда (мышечный слой) и эпикарда (наружный слой). Миокард — самый толстый слой, обеспечивающий сократительную функцию сердца.

На (figure2) представлена электрическая проводящая система сердца, которая координирует сердечные сокращения.`,
    images: {
      figure1: {
        url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800",
        alt: "Анатомия сердца человека",
      },
      image1: {
        url: "https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=800",
        alt: "Схема кровообращения",
      },
      figure2: {
        url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
        alt: "Проводящая система сердца",
      },
    },
    zoomLink: "https://zoom.us/j/1234567890",
    testId: "1",
  },
  "2": {
    content: `Электрокардиография (ЭКГ) — это метод графической регистрации электрической активности сердца. (figure1) показывает нормальную ЭКГ-кривую.

Стандартная ЭКГ включает 12 отведений: 6 отведений от конечностей и 6 грудных отведений. Каждое отведение "смотрит" на сердце под определённым углом.

Основные элементы ЭКГ: зубец P (деполяризация предсердий), комплекс QRS (деполяризация желудочков), зубец T (реполяризация желудочков). (image1) демонстрирует расположение электродов.

При анализе ЭКГ важно оценить ритм, частоту, проводимость, а также морфологию зубцов и интервалов.`,
    images: {
      figure1: {
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
        alt: "Нормальная ЭКГ-кривая",
      },
      image1: {
        url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800",
        alt: "Расположение электродов ЭКГ",
      },
    },
    zoomLink: "https://zoom.us/j/0987654321",
    testId: "2",
  },
};

export default function CoursePage({ params: paramsPromise }: PageProps) {
  const [course, setCourse] = useState<any>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "materials">(
    "content"
  );
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
    } catch (err) {
      console.error("Failed to fetch modules with lessons:", err);
    } finally {
      setIsLoadingLessons(false);
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

        const paid = localStorage.getItem(`course_paid_${params.id}`);
        if (paid === "true") {
          setIsPaid(true);
          // Fetch lessons for all modules if already paid
          if (fetchedCourse.modules && fetchedCourse.modules.length > 0) {
            const moduleIds = fetchedCourse.modules.map((m: any) => m.id);
            fetchModulesWithLessons(moduleIds);
          }
        }

        const lastModule = localStorage.getItem(
          `course_${params.id}_lastModule`
        );
        if (lastModule && fetchedCourse.modules.length > 0) {
          const moduleIdx = parseInt(lastModule);
          if (moduleIdx >= 0 && moduleIdx < fetchedCourse.modules.length) {
            const moduleId = String(fetchedCourse.modules[moduleIdx].id);
            setSelectedModuleId(moduleId);
            setExpandedModules(new Set([moduleId]));
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

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка курса...</p>
        </div>
      </div>
    );
  }

  if (!course || !courseId) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 256 256"
              className="text-red-500"
            >
              <path
                fill="currentColor"
                d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Курс не найден</h1>
        </div>
      </div>
    );
  }

  const handlePaymentComplete = () => {
    localStorage.setItem(`course_paid_${courseId}`, "true");
    setIsPaid(true);
    setIsPaymentOpen(false);

    // Fetch lessons for all modules after payment
    if (modules.length > 0) {
      const moduleIds = modules.map((m: any) => m.id);
      fetchModulesWithLessons(moduleIds);
    }
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

  // Use modules from API (not syllabus which doesn't exist)
  const modules = course.modules || [];

  // Helper to get lessons for a module from loaded data
  const getModuleLessons = (moduleId: number) => {
    const moduleData = modulesWithLessons.get(moduleId);
    return moduleData?.lessons || [];
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
    if (courseId) {
      const moduleIdx = modules.findIndex(
        (m: any) => String(m.id) === moduleId
      );
      localStorage.setItem(
        `course_${courseId}_lastModule`,
        moduleIdx.toString()
      );
    }
  };

  const selectedModule = modules.find(
    (m: any) => String(m.id) === selectedModuleId
  );
  const moduleContent = selectedModuleId
    ? moduleContents[selectedModuleId]
    : null;

  // ========== UNPAID STATE ==========
  if (!isPaid) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main className="pt-20">
          {/* Hero Section with Course Image */}
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: Course Image */}
                <div className="animate-slideInLeft">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                      <img
                        src={`https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=450&fit=crop`}
                        alt={course.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
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
                <div className="animate-slideInRight">
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    {course.title}
                  </h1>

                  <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <Rating rating={courseRating} />
                      <span className="text-white font-medium">
                        {courseRating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 256 256"
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
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold text-white">
                        ₸{coursePrice.toLocaleString("ru-RU")}
                      </span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {[
                        `${modules.length} модулей`,
                        "Пожизненный доступ",
                        "Сертификат по окончании",
                      ].map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-3 text-white"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 256 256"
                            className="text-green-400 shrink-0"
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

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 animate-pulseGlow"
                      onClick={() => setIsPaymentOpen(true)}
                    >
                      Оплатить и начать обучение
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* What you'll learn */}
              <div className="animate-fadeInUp">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Чему вы научитесь
                </h2>
                <div className="grid gap-4">
                  {whatYouWillLearn.map((item: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 256 256"
                          className="text-green-600"
                        >
                          <path
                            fill="currentColor"
                            d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Syllabus Preview */}
              <div
                className="animate-fadeInUp"
                style={{ animationDelay: "100ms" }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Программа курса
                </h2>
                <div className="grid gap-4">
                  {modules.map((module: any, idx: number) => (
                    <div
                      key={module.id}
                      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {module.title}
                          </h3>
                          <p className="text-sm text-gray-500">
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
            onPay={handlePaymentComplete}
            onClose={() => setIsPaymentOpen(false)}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // ========== PAID STATE ==========
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16 flex overflow-hidden">
        {/* Left Sidebar - Course Modules */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex flex-col animate-slideInLeft">
          {/* Course Title */}
          <div className="sticky top-0 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 z-10">
            <h2 className="font-bold text-lg text-white mb-2">
              {course.title}
            </h2>
            <p className="text-blue-100 text-sm">{modules.length} модулей</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "content"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Содержание
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "materials"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Материалы
            </button>
          </div>

          {/* Content Tab - Modules List */}
          {activeTab === "content" && (
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              {modules.map((module: any, idx: number) => (
                <div
                  key={module.id}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <button
                    onClick={() => {
                      handleSelectModule(String(module.id));
                      toggleModule(String(module.id));
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                      selectedModuleId === String(module.id)
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-md flex items-center justify-center ${
                          selectedModuleId === String(module.id)
                            ? "bg-white/20 text-white"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {module.title.replace(/^Модуль \d+:\s*/i, "")}
                        </h4>
                        <p
                          className={`text-xs mt-1 ${
                            selectedModuleId === String(module.id)
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {getModuleLessons(module.id).length} уроков •{" "}
                          {module.duration || ""}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Expanded lessons list */}
                  {expandedModules.has(String(module.id)) && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-blue-200 pl-4">
                      {getModuleLessons(module.id).map(
                        (lesson: any, lessonIdx: number) => (
                          <div
                            key={lesson.id || lessonIdx}
                            className="text-xs text-gray-600 py-2 px-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-all flex items-center gap-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 256 256"
                              className="text-gray-400 shrink-0"
                            >
                              <path
                                fill="currentColor"
                                d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm48.49,102.83-48,32A8,8,0,0,1,116,152V88a8,8,0,0,1,12.49-6.62l48,32a8,8,0,0,1,0,13.24Z"
                              />
                            </svg>
                            <span className="line-clamp-1 flex-1">
                              {lesson.title || lesson}
                            </span>
                            {/* Lesson type badge */}
                            {lesson.lesson_type && (
                              <span
                                className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${
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
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Materials Tab - Zoom & Tests */}
          {activeTab === "materials" && (
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 256 256"
                    className="text-blue-600"
                  >
                    <path
                      fill="currentColor"
                      d="M164.44,105.34l-48-32A8,8,0,0,0,104,80v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,129.05V95l25.58,17ZM216,40H40A16,16,0,0,0,24,56V168a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,128H40V56H216V168Zm16,40a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16H224A8,8,0,0,1,232,208Z"
                    />
                  </svg>
                  Zoom-занятия
                </h3>
                {modules.map((module: any, idx: number) => (
                  <a
                    key={module.id}
                    href={moduleContents[module.id]?.zoomLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-white rounded-lg border border-blue-200 mb-2 hover:border-blue-400 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      Модуль {idx + 1}
                    </p>
                    <p className="text-xs text-blue-600">
                      Присоединиться к занятию →
                    </p>
                  </a>
                ))}
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 256 256"
                    className="text-green-600"
                  >
                    <path
                      fill="currentColor"
                      d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
                    />
                  </svg>
                  Тесты
                </h3>
                {modules.map((module: any, idx: number) => (
                  <a
                    key={module.id}
                    href={
                      moduleContents[module.id]?.testId
                        ? `/tests/${moduleContents[module.id].testId}`
                        : "#"
                    }
                    className="block p-3 bg-white rounded-lg border border-green-200 mb-2 hover:border-green-400 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      Тест к модулю {idx + 1}
                    </p>
                    <p className="text-xs text-green-600">Пройти тест →</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Back to Home */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 transition rounded-xl hover:bg-blue-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 256 256"
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

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {selectedModule ? (
              <div className="animate-fadeIn" key={selectedModuleId}>
                {/* Module Header */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                      {modules.findIndex(
                        (m: any) => String(m.id) === selectedModuleId
                      ) + 1}
                    </div>
                    <Badge variant="primary">Модуль</Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {selectedModule.title}
                  </h1>
                  <div className="flex items-center gap-6 text-gray-600">
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 256 256"
                        className="text-blue-500"
                      >
                        <path
                          fill="currentColor"
                          d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"
                        />
                      </svg>
                      {selectedModule.duration}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 256 256"
                        className="text-blue-500"
                      >
                        <path
                          fill="currentColor"
                          d="M232,64H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48V64H24A8,8,0,0,0,16,72V200a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V72A8,8,0,0,0,232,64ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V64H96ZM224,200H32V80H224Z"
                        />
                      </svg>
                      {selectedModuleId
                        ? getModuleLessons(parseInt(selectedModuleId)).length
                        : 0}{" "}
                      уроков
                    </span>
                  </div>
                </div>

                {/* Module Content */}
                {moduleContent ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Материал модуля
                    </h2>
                    <ModuleContent
                      content={moduleContent.content}
                      images={moduleContent.images}
                    />
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      В этом модуле вы изучите{" "}
                      {selectedModuleId
                        ? getModuleLessons(parseInt(selectedModuleId)).length
                        : 0}{" "}
                      важных тем.
                    </p>
                  </div>
                )}

                {/* Lessons List with Content */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Уроки модуля
                  </h2>
                  <div className="space-y-4">
                    {(selectedModuleId
                      ? getModuleLessons(parseInt(selectedModuleId))
                      : []
                    ).map((lesson: any, idx: number) => (
                      <div
                        key={lesson.id || idx}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                      >
                        {/* Lesson Header */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {lesson.title || lesson}
                            </h3>
                            {lesson.lesson_type && (
                              <span className="text-xs text-gray-500 capitalize">
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
                        </div>

                        {/* Lesson Content */}
                        {lesson.content && (
                          <div className="p-4 border-t border-gray-200 bg-white">
                            <div
                              className="prose prose-sm max-w-none text-gray-700"
                              dangerouslySetInnerHTML={{
                                __html: lesson.content.replace(/\n/g, "<br/>"),
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Empty state */}
                    {selectedModuleId &&
                      getModuleLessons(parseInt(selectedModuleId)).length ===
                        0 &&
                      !isLoadingLessons && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Уроки для этого модуля пока не добавлены</p>
                        </div>
                      )}

                    {/* Loading state */}
                    {isLoadingLessons && (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          Загрузка уроков...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Module Actions */}
                {moduleContent && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {moduleContent.zoomLink && (
                      <a
                        href={moduleContent.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-6 bg-blue-50 rounded-2xl border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 256 256"
                            className="text-white"
                          >
                            <path
                              fill="currentColor"
                              d="M164.44,105.34l-48-32A8,8,0,0,0,104,80v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,129.05V95l25.58,17ZM216,40H40A16,16,0,0,0,24,56V168a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,128H40V56H216V168Z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Zoom-занятие
                          </p>
                          <p className="text-sm text-blue-600">
                            Присоединиться к занятию →
                          </p>
                        </div>
                      </a>
                    )}
                    {moduleContent.testId && (
                      <a
                        href={`/tests/${moduleContent.testId}`}
                        className="flex items-center gap-4 p-6 bg-green-50 rounded-2xl border border-green-200 hover:bg-green-100 transition-colors"
                      >
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 256 256"
                            className="text-white"
                          >
                            <path
                              fill="currentColor"
                              d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Тест по модулю
                          </p>
                          <p className="text-sm text-green-600">
                            Пройти тест →
                          </p>
                        </div>
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center animate-fadeIn">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 256 256"
                    className="text-blue-600"
                  >
                    <path
                      fill="currentColor"
                      d="M232,64H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48V64H24A8,8,0,0,0,16,72V200a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V72A8,8,0,0,0,232,64ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V64H96ZM224,200H32V80H224Z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Выберите модуль для начала
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Нажмите на модуль в левой панели, чтобы начать обучение
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
