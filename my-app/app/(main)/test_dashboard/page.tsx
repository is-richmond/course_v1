"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Footer } from "@/src/components/layout/Footer";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { tests } from "@/src/lib/api";
import {
  calculateDashboardStats,
  getAttemptInfo,
  type TestDashboardStats,
} from "@/src/lib/testDashboardUtils";
import type { TestAttemptResponse, TestResponse } from "@/src/types/api";

export default function TestsDashboardPage() {
  const [attempts, setAttempts] = useState<TestAttemptResponse[]>([]);
  const [testsMap, setTestsMap] = useState<Map<number, TestResponse>>(new Map());
  const [stats, setStats] = useState<TestDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Получаем user_id из localStorage (или из контекста авторизации)
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Необходима авторизация");
          setIsLoading(false);
          return;
        }

        // Декодируем токен чтобы получить user_id
        const payload = JSON.parse(atob(token.split(". ")[1]));
        const userId = payload.sub || payload.user_id;

        // Загружаем попытки пользователя
        const attemptsData = await tests.getUserAllAttempts(userId);
        setAttempts(attemptsData);

        // Загружаем информацию о тестах
        const uniqueTestIds = [... new Set(attemptsData. map((a) => a.test_id))];
        const testsData = await Promise.all(
          uniqueTestIds.map((id) => tests.get(id))
        );

        const testsMapData = new Map<number, TestResponse>();
        testsData.forEach((test) => {
          testsMapData. set(test.id, test);
        });
        setTestsMap(testsMapData);

        // Рассчитываем статистику
        const calculatedStats = calculateDashboardStats(attemptsData, testsMapData);
        setStats(calculatedStats);

        setError(null);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Не удалось загрузить данные");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100";
    if (percentage >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Дашборд тестов
            </h1>
            <p className="text-gray-600">
              Статистика и история прохождения тестов
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <>
              <div className="grid grid-cols-1 md: grid-cols-2 lg: grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                  >
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                    <div className="h-8 w-16 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Error State */}
          {error && ! isLoading && (
            <div className="text-center py-12">
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ошибка загрузки
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Попробовать снова
              </Button>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && stats && (
            <>
              {/* Overall Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Attempts */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Всего попыток</p>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 256 256"
                          className="text-blue-600"
                        >
                          <path
                            fill="currentColor"
                            d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,160Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats. total_attempts}
                    </p>
                  </CardContent>
                </Card>

                {/* Average Score */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Средний балл</p>
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 256 256"
                          className="text-purple-600"
                        >
                          <path
                            fill="currentColor"
                            d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34l13.49-58.54L21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.average_score.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                {/* Best Score */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Лучший результат</p>
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 256 256"
                          className="text-green-600"
                        >
                          <path
                            fill="currentColor"
                            d="M232,64H208V56a16,16,0,0,0-16-16H64A16,16,0,0,0,48,56v8H24A8,8,0,0,0,16,72V96a40,40,0,0,0,40,40h3.65A80. 13,80.13,0,0,0,120,191.61V216H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V191.58c31.94-3.23,58.44-25.64,68.08-55.58H208a40,40,0,0,0,40-40V72A8,8,0,0,0,232,64Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.best_score.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                {/* Total Questions */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Всего вопросов</p>
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 256 256"
                          className="text-orange-600"
                        >
                          <path
                            fill="currentColor"
                            d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-. 72c18.24-3.35,32-17.9,32-35. 28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.total_questions_answered}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {stats.total_correct_answers} правильных
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Tests Statistics */}
              {stats.tests. length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Статистика по тестам
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.tests.map((test) => (
                      <Card key={test.test_id}>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            {test.test_title}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Попыток:</span>
                              <span className="font-medium">
                                {test.total_attempts}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Лучший балл:</span>
                              <span className="font-medium text-green-600">
                                {test.best_percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="pt-2 border-t">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600">
                                  Средний балл:
                                </span>
                                <span
                                  className={`text-lg font-bold ${getScoreColor(
                                    test.average_percentage
                                  )}`}
                                >
                                  {test.average_percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    test.average_percentage >= 80
                                      ? "bg-green-600"
                                      : test. average_percentage >= 60
                                      ? "bg-yellow-600"
                                      : "bg-red-600"
                                  }`}
                                  style={{
                                    width: `${test.average_percentage}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Attempts */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  История попыток
                </h2>

                {/* Empty State */}
                {attempts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 256 256"
                        className="text-gray-400"
                      >
                        <path
                          fill="currentColor"
                          d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Нет попыток
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Вы еще не проходили тесты
                    </p>
                    <Link href="/tests">
                      <Button variant="primary">Перейти к тестам</Button>
                    </Link>
                  </div>
                )}

                {/* Attempts Grid */}
                {attempts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attempts.map((attempt) => {
                      const attemptInfo = getAttemptInfo(attempt);
                      const test = testsMap.get(attempt.test_id);
                      const isPassed =
                        test &&
                        attemptInfo. percentage >= test.passing_score;

                      return (
                        <Link
                          key={attempt.id}
                          href={`/tests-dashboard/attempts/${attempt.test_id}/${attempt.id}`}
                        >
                          <Card className="h-full hover:shadow-lg transition cursor-pointer group">
                            <div
                              className={`h-2 ${getScoreBgColor(
                                attemptInfo.percentage
                              )} rounded-t-xl`}
                            />
                            <CardContent className="pt-4">
                              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {test?. title || `Тест #${attempt.test_id}`}
                              </h3>

                              <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Результат:
                                  </span>
                                  <span
                                    className={`font-bold ${getScoreColor(
                                      attemptInfo.percentage
                                    )}`}
                                  >
                                    {attempt.score}/{attempt.total_points} (
                                    {attemptInfo.percentage.toFixed(1)}%)
                                  </span>
                                </div>
                                {test && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Статус:
                                    </span>
                                    <span
                                      className={`font-medium ${
                                        isPassed
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {isPassed ? "Сдан" : "Не сдан"}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Дата:</span>
                                  <span className="font-medium">
                                    {formatDate(attempt.started_at)}
                                  </span>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-gray-200">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="w-full"
                                >
                                  Посмотреть детали
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}