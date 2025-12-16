"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { testsAPI } from "@/src/lib/api";
import type { TestResponse } from "@/src/types/api";

interface DisplayTest extends TestResponse {
  passed?: boolean;
  score?: number;
}

export default function TestsPage() {
  const [tests, setTests] = useState<DisplayTest[]>([]);
  const [completedTests, setCompletedTests] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const apiTests = await testsAPI.list();

        const completed = new Set<number>();
        const enrichedTests = apiTests.map((test) => {
          const passed =
            localStorage.getItem(`test_${test.id}_passed`) === "true";
          const score = parseInt(
            localStorage.getItem(`test_${test.id}_score`) || "0"
          );
          if (passed) {
            completed.add(test.id);
          }
          return { ...test, passed, score };
        });

        setTests(enrichedTests);
        setCompletedTests(completed);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch tests:", err);
        setError("Не удалось загрузить тесты");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Загрузка тестов...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
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
            <p className="text-2xl font-bold text-gray-900 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
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
      <Header />

      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto w-full px-6 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Доступные тесты
            </h1>
            <p className="text-gray-600">
              Проверьте свои знания с помощью наших интерактивных тестов
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 256 256"
                    className="mx-auto text-blue-600 mb-3"
                  >
                    <path
                      fill="currentColor"
                      d="M232,64H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48V64H24A8,8,0,0,0,16,72V200a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V72A8,8,0,0,0,232,64ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V64H96ZM224,200H32V80H224Z"
                    />
                  </svg>
                  <p className="text-sm text-gray-600 mb-1">Всего тестов</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {tests.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 256 256"
                    className="mx-auto text-green-600 mb-3"
                  >
                    <path
                      fill="currentColor"
                      d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                    />
                  </svg>
                  <p className="text-sm text-gray-600 mb-1">Пройдено</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {completedTests.size}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 256 256"
                    className="mx-auto text-orange-600 mb-3"
                  >
                    <path
                      fill="currentColor"
                      d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"
                    />
                  </svg>
                  <p className="text-sm text-gray-600 mb-1">Осталось</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {tests.length - completedTests.size}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tests Grid */}
          {tests.length === 0 ? (
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
                    d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Тесты не найдены
              </h3>
              <p className="text-gray-600">Пока нет доступных тестов</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tests.map((test) => (
                <Card
                  key={test.id}
                  className="hover:shadow-lg transition group"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {test.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {test.description}
                        </p>
                      </div>
                      {test.passed && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold ml-2">
                          ✓ Пройден
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-gray-200">
                      <div className="text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 256 256"
                          className="mx-auto text-blue-600 mb-1"
                        >
                          <path
                            fill="currentColor"
                            d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                          />
                        </svg>
                        <p className="text-sm font-semibold text-gray-900">
                          {test.passing_score}%
                        </p>
                        <p className="text-xs text-gray-600">проходной</p>
                      </div>
                      <div className="text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 256 256"
                          className="mx-auto text-blue-600 mb-1"
                        >
                          <path
                            fill="currentColor"
                            d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"
                          />
                        </svg>
                        <p className="text-sm font-semibold text-gray-900">
                          30 мин
                        </p>
                        <p className="text-xs text-gray-600">время</p>
                      </div>
                    </div>

                    {test.passed ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Ваш результат
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {test.score}%
                          </p>
                        </div>
                        <Link href={`/tests/${test.id}`}>
                          <Button variant="secondary" size="sm">
                            Переделать
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Link href={`/tests/${test.id}`} className="w-full">
                        <Button
                          variant="primary"
                          className="w-full flex items-center justify-center gap-2"
                        >
                          Начать тест
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
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
