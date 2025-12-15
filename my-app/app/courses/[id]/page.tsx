"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { PaymentModal } from "@/src/components/PaymentModal";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Rating } from "@/src/components/ui/Rating";
import { courses } from "@/src/data/courses";
import { ChevronDown, PlayCircle } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CoursePage({ params: paramsPromise }: PageProps) {
  const [course, setCourse] = useState<any>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Распаковываем params и инициализируем данные
  useEffect(() => {
    (async () => {
      const params = await paramsPromise;
      setCourseId(params.id);
      const foundCourse = courses.find((c) => c.id === params.id);
      setCourse(foundCourse);
      
      const paid = localStorage.getItem(`course_paid_${params.id}`);
      if (paid === "true") {
        setIsPaid(true);
      }
      setIsLoading(false);
    })();
  }, [paramsPromise]);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Загрузка курса...</p>
        </div>
      </div>
    );
  }

  if (!course || !courseId) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900">Курс не найден</h1>
        </div>
      </div>
    );
  }

  const handlePaymentComplete = () => {
    localStorage.setItem(`course_paid_${courseId}`, "true");
    setIsPaid(true);
    setIsPaymentOpen(false);
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

  const selectedModule = course.syllabus.find((m: any) => m.id === selectedModuleId);

  const levelLabels: Record<string, string> = {
    beginner: "Начинающий",
    intermediate: "Средний",
    advanced: "Продвинутый",
  };

  const formatLabels: Record<string, string> = {
    online: "Онлайн",
    offline: "Офлайн",
    hybrid: "Гибридный",
  };

  if (!isPaid) {
    return (
      <div className="bg-white">
        <Header />
        <main className="pt-20">
          <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {course.title}
                </h2>
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  T{course.price.toLocaleString("ru-RU")}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-lg">✓</span>
                  <span className="text-gray-700">
                    {course.duration} обучения
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-lg">✓</span>
                  <span className="text-gray-700">
                    {course.syllabus.length} модулей
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-lg">✓</span>
                  <span className="text-gray-700">Пожизненный доступ</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mb-3"
                onClick={() => setIsPaymentOpen(true)}
              >
                Оплатить и получить доступ
              </Button>

              <p className="text-xs text-gray-500 text-center">
                После оплаты вы сразу получите полный доступ к курсу
              </p>

              <PaymentModal
                isOpen={isPaymentOpen}
                courseTitle={course.title}
                price={course.price}
                onPay={handlePaymentComplete}
                onClose={() => setIsPaymentOpen(false)}
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Left Sidebar - Course Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl sticky top-24">
            {/* Course Info */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                {course.title}
              </h2>
              <div className="flex items-center gap-2 mb-3">
                <Rating rating={course.rating} />
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Уровень:</span> {levelLabels[course.level]}
                </p>
                <p>
                  <span className="font-medium">Формат:</span> {formatLabels[course.format]}
                </p>
                <p>
                  <span className="font-medium">Время:</span> {course.duration}
                </p>
              </div>
            </div>

            {/* Modules List */}
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Программа курса</h3>
              <div className="space-y-2">
                {course.syllabus.map((module: any) => (
                  <div key={module.id}>
                    <button
                      onClick={() => {
                        setSelectedModuleId(module.id);
                        toggleModule(module.id);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                        selectedModuleId === module.id
                          ? "bg-blue-100 text-blue-900 font-semibold"
                          : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <PlayCircle size={16} />
                        <span className="text-sm">{module.title}</span>
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          expandedModules.has(module.id) ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Lessons */}
                    {expandedModules.has(module.id) && (
                      <div className="mt-2 ml-3 space-y-1 border-l-2 border-gray-200 pl-3">
                        {module.lessons.map((lesson: string, idx: number) => (
                          <div
                            key={idx}
                            className="text-xs text-gray-600 py-1 hover:text-blue-600 cursor-pointer"
                          >
                            ▸ {lesson}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="p-6 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-900 mb-2">
                Прогресс
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "0%" }}></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">0 из {course.syllabus.length} модулей</p>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          {selectedModule ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              {/* Module Header */}
              <div className="mb-8">
                <Badge variant="primary" className="mb-4">
                  {selectedModule.title}
                </Badge>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {selectedModule.title}
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span>⏱️ {selectedModule.duration}</span>
                  <span>📚 {selectedModule.lessons.length} уроков</span>
                </div>
              </div>

              {/* Module Description */}
              <div className="prose max-w-none mb-8">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  В этом модуле вы изучите {selectedModule.lessons.length} важных
                  тем, необходимых для полного понимания дисциплины. Каждый урок
                  включает видео-материалы, практические упражнения и проверку
                  знаний.
                </p>

                {/* Lessons List */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Содержание модуля
                  </h2>
                  <ul className="space-y-4">
                    {selectedModule.lessons.map((lesson: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {lesson}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Видео (45 мин) • Материалы (20 страниц) • Тест
                          </p>
                        </div>
                        <PlayCircle className="text-gray-400 flex-shrink-0" size={20} />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructor */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Преподаватель
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-linear-to-br from-blue-300 to-indigo-400 rounded-full flex items-center justify-center text-2xl">
                      👨‍🏫
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {course.instructors[0]?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {course.instructors[0]?.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {course.instructors[0]?.bio}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
              <div className="text-6xl mb-4">📖</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Выберите модуль для начала
              </h2>
              <p className="text-gray-600">
                Нажмите на модуль в левой панели, чтобы начать обучение
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

