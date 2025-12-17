"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { testsAPI } from "@/src/lib/api";
import {
  loadTestStatusFromStorage,
  getStatusColorClass,
  formatPercentage,
} from "@/src/lib/testUtils";
import type { TestResponse } from "@/src/types/api";

interface TestWithStatus extends TestResponse {
  hasEverPassed: boolean;
  lastPercentage: number | null;
  attemptCount: number;
}

export const TestsGrid: React.FC = () => {
  const [tests, setTests] = useState<TestWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const apiTests = await testsAPI.list();

        // Enrich tests with status from localStorage (cached attempts data)
        const enrichedTests: TestWithStatus[] = apiTests.map((test) => {
          const stored = loadTestStatusFromStorage(test.id);
          return {
            ...test,
            hasEverPassed: stored?.hasEverPassed ?? false,
            lastPercentage: stored?.lastPercentage ?? null,
            attemptCount: stored?.attemptCount ?? 0,
          };
        });

        setTests(enrichedTests);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch tests:", err);
        setError("Не удалось загрузить тесты. Попробуйте позже.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 animate-pulse"
          >
            <div className="h-5 sm:h-6 w-3/4 bg-gray-200 rounded mb-3 sm:mb-4" />
            <div className="h-3 sm:h-4 w-full bg-gray-200 rounded mb-3 sm:mb-4" />
            <div className="grid grid-cols-2 gap-4 py-4 mb-4">
              <div className="h-10 sm:h-12 bg-gray-200 rounded" />
              <div className="h-10 sm:h-12 bg-gray-200 rounded" />
            </div>
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 sm:py-8 px-4">
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
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          Ошибка загрузки
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          className="min-h-[44px]"
        >
          Попробовать снова
        </Button>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 px-4">
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
          Пока нет доступных тестов
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {tests.map((test) => {
        const statusColors = getStatusColorClass(test.hasEverPassed);

        return (
          <Card key={test.id} className="hover:shadow-lg transition group">
            <CardContent className="p-4 sm:pt-6">
              {/* Header with title and status badge */}
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                  {test.title}
                </h3>

                {/* Pass status badge - shows only if test was ever attempted */}
                {test.attemptCount > 0 && (
                  <div
                    className={`shrink-0 flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${statusColors.bg} ${statusColors.text}`}
                  >
                    {test.hasEverPassed ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 256 256"
                        >
                          <path
                            fill="currentColor"
                            d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"
                          />
                        </svg>
                        <span className="hidden sm:inline">Пройден</span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 256 256"
                        >
                          <path
                            fill="currentColor"
                            d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
                          />
                        </svg>
                        <span className="hidden sm:inline">Не пройден</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                {test.description || "Описание теста"}
              </p>

              {/* Stats row */}
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

              {/* Action button - always show "Retake" option */}
              <div className="flex items-center gap-3">
                {test.hasEverPassed ? (
                  <>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-0.5">
                        Лучший результат
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        ✓ Пройден
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
                  </>
                ) : (
                  <Link href={`/tests/${test.id}`} className="block w-full">
                    <Button
                      variant="primary"
                      className="w-full flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[40px]"
                    >
                      {test.attemptCount > 0 ? "Пройти снова" : "Начать тест"}
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
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
