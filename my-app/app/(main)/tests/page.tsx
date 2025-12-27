"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/src/components/layout/Footer";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { testsAPI, combinedTestsAPI } from "@/src/lib/api";
import {
  loadTestStatusFromStorage,
  getStatusColorClass,
  formatPercentage,
} from "@/src/lib/testUtils";
import type {
  TestResponse,
  TestType,
  CombinedTestResponse,
} from "@/src/types/api";

interface TestWithStatus extends TestResponse {
  hasEverPassed: boolean;
  lastPercentage: number | null;
  bestPercentage: number | null;
  attemptCount: number;
}

export default function TestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestWithStatus[]>([]);
  const [combinedTests, setCombinedTests] = useState<CombinedTestResponse[]>(
    []
  );
  const [filteredTests, setFilteredTests] = useState<TestWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | TestType>("all");

  const completedCount = filteredTests.filter((t) => t.hasEverPassed).length;
  const remainingCount = filteredTests.length - completedCount;

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const apiTests = await testsAPI.list();

        // Filter out course_test - those are shown in courses only
        const publicTests = apiTests.filter(
          (test) => test.test_type !== "course_test"
        );

        const enrichedTests: TestWithStatus[] = publicTests.map((test) => {
          const stored = loadTestStatusFromStorage(test.id);
          return {
            ...test,
            hasEverPassed: stored?.hasEverPassed ?? false,
            lastPercentage: stored?.lastPercentage ?? null,
            bestPercentage: stored?.bestPercentage ?? null,
            attemptCount: stored?.attemptCount ?? 0,
          };
        });

        setTests(enrichedTests);
        setFilteredTests(enrichedTests);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch tests:", err);
        setError("Не удалось загрузить тесты");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCombinedTests = async () => {
      try {
        const data = await combinedTestsAPI.getMyTests();
        setCombinedTests(data);
      } catch (err) {
        console.error("Failed to fetch combined tests:", err);
      }
    };

    fetchTests();
    fetchCombinedTests();
  }, []);

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredTests(tests);
    } else {
      setFilteredTests(tests.filter((t) => t.test_type === activeFilter));
    }
  }, [activeFilter, tests]);

  const getTestTypeBadge = (testType: TestType) => {
    switch (testType) {
      case "weekly":
        return (
          <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded font-medium">
            Недельный тест
          </span>
        );
      case "for_combined":
        return (
          <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">
            По темам
          </span>
        );
      case "course_test":
        return (
          <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded font-medium">
            Тест курса
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        {/* Header provided by ResponsiveLayout */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">
              Загрузка тестов...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        {/* Header provided by ResponsiveLayout */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
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
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="min-h-[44px]"
            >
              Попробовать снова
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header provided by ResponsiveLayout */}

      <main className="flex-1 pt-12 sm:pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
          {/* Page title */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Доступные тесты
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Проверьте свои знания с помощью наших интерактивных тестов
            </p>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Все тесты
              </button>
              <button
                onClick={() => setActiveFilter("weekly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === "weekly"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Недельные
              </button>
              <button
                onClick={() => setActiveFilter("for_combined")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === "for_combined"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                По темам
              </button>
            </div>
          </div>

          {/* Stats cards - responsive grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12">
            <Card>
              <CardContent className="p-3 sm:pt-6">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 256 256"
                    className="mx-auto text-blue-600 mb-2 sm:mb-3 sm:w-8 sm:h-8"
                  >
                    <path
                      fill="currentColor"
                      d="M232,64H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48V64H24A8,8,0,0,0,16,72V200a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V72A8,8,0,0,0,232,64ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V64H96ZM224,200H32V80H224Z"
                    />
                  </svg>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
                    Всего
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    {filteredTests.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:pt-6">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 256 256"
                    className="mx-auto text-green-600 mb-2 sm:mb-3 sm:w-8 sm:h-8"
                  >
                    <path
                      fill="currentColor"
                      d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                    />
                  </svg>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
                    Пройдено
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    {completedCount}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:pt-6">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 256 256"
                    className="mx-auto text-orange-600 mb-2 sm:mb-3 sm:w-8 sm:h-8"
                  >
                    <path
                      fill="currentColor"
                      d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"
                    />
                  </svg>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
                    Осталось
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    {remainingCount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tests Grid */}
          {filteredTests.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 256 256"
                  className="text-gray-400 sm:w-10 sm:h-10"
                >
                  <path
                    fill="currentColor"
                    d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Тесты не найдены
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {activeFilter === "all"
                  ? "Пока нет доступных тестов"
                  : "Нет тестов данного типа"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredTests.map((test) => {
                const statusColors = getStatusColorClass(test.hasEverPassed);

                return (
                  <Card
                    key={test.id}
                    className="hover:shadow-lg transition group"
                  >
                    <CardContent className="p-4 sm:pt-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            {getTestTypeBadge(test.test_type)}
                            {test.attemptCount > 0 && (
                              <div
                                className={`shrink-0 flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${statusColors.bg} ${statusColors.text}`}
                              >
                                {test.hasEverPassed ? "✓" : "✗"}
                                <span className="hidden sm:inline">
                                  {test.hasEverPassed
                                    ? "Пройден"
                                    : "Не пройден"}
                                </span>
                              </div>
                            )}
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {test.title}
                          </h3>
                          {test.description && (
                            <p
                              className={`text-xs sm:text-sm text-gray-600 ${
                                test.test_type === "weekly"
                                  ? "line-clamp-3"
                                  : "line-clamp-2"
                              }`}
                            >
                              {test.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 sm:mb-6 py-3 sm:py-4 border-y border-gray-200">
                        <div className="text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 256 256"
                            className="mx-auto text-blue-600 mb-1"
                          >
                            <path
                              fill="currentColor"
                              d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                            />
                          </svg>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900">
                            {test.passing_score}%
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600">
                            проходной
                          </p>
                        </div>
                        <div className="text-center">
                          {test.lastPercentage !== null ? (
                            <>
                              <p
                                className={`text-lg sm:text-xl font-bold ${
                                  test.hasEverPassed
                                    ? "text-green-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {formatPercentage(test.lastPercentage)}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-600">
                                ваш результат
                              </p>
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 256 256"
                                className="mx-auto text-blue-600 mb-1"
                              >
                                <path
                                  fill="currentColor"
                                  d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"
                                />
                              </svg>
                              <p className="text-xs sm:text-sm font-semibold text-gray-900">
                                30 мин
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-600">
                                время
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action - always show retake button */}
                      {test.hasEverPassed ? (
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">
                              Лучший результат
                            </p>
                            <p className="text-lg sm:text-xl font-bold text-green-600">
                              {test.bestPercentage !== null
                                ? formatPercentage(test.bestPercentage)
                                : "✓ Пройден"}
                            </p>
                          </div>
                          <Link href={`/tests/${test.id}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="min-h-[40px] sm:min-h-[36px]"
                            >
                              Пройти снова
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <Link href={`/tests/${test.id}`} className="w-full">
                          <Button
                            variant="primary"
                            className="w-full flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[40px]"
                          >
                            {test.attemptCount > 0
                              ? "Пройти снова"
                              : "Начать тест"}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 256 256"
                            >
                              <path
                                fill="currentColor"
                                d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z"
                              />
                            </svg>
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Combined Tests Section */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Мои комбинированные тесты
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Создавайте собственные тесты из вопросов по темам
                </p>
              </div>
              <Button
                onClick={() => router.push("/tests/create-combined")}
                className="min-h-[44px]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 256 256"
                  className="mr-2"
                >
                  <path
                    fill="currentColor"
                    d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"
                  />
                </svg>
                <span className="hidden sm:inline">Создать тест</span>
                <span className="sm:hidden">Создать</span>
              </Button>
            </div>

            {combinedTests.length === 0 ? (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 256 256"
                      className="text-blue-600"
                    >
                      <path
                        fill="currentColor"
                        d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200Z M176,88a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,88Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,120Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,152Z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    У вас пока нет комбинированных тестов
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-6">
                    Создайте свой первый тест, комбинируя вопросы из тестов по
                    темам
                  </p>
                  <Button
                    onClick={() => router.push("/tests/create-combined")}
                    className="min-h-[44px]"
                  >
                    Создать комбинированный тест
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {combinedTests.map((test) => (
                  <Card
                    key={test.id}
                    className="hover:shadow-lg transition group"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                            {test.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 256 256"
                          >
                            <path
                              fill="currentColor"
                              d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"
                            />
                          </svg>
                          {test.total_questions} вопросов
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          {new Date(test.created_at).toLocaleDateString(
                            "ru-RU"
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Темы:</p>
                        <div className="flex flex-wrap gap-2">
                          {test.source_tests.map((source) => (
                            <span
                              key={source.source_test_id}
                              className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                            >
                              {source.source_test_title} (
                              {source.questions_count})
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() =>
                          router.push(`/tests/combined/${test.id}`)
                        }
                        className="w-full min-h-[40px]"
                      >
                        Пройти тест
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
