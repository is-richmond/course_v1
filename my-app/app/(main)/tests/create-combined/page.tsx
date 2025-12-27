"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { combinedTestsAPI } from "@/src/lib/api";
import type { AvailableTestForCombining } from "@/src/types/api";

export default function CreateCombinedTestPage() {
  const router = useRouter();
  const [availableTests, setAvailableTests] = useState<
    AvailableTestForCombining[]
  >([]);
  const [selectedTests, setSelectedTests] = useState<Map<number, number>>(
    new Map()
  );
  const [testTitle, setTestTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableTests();
  }, []);

  const fetchAvailableTests = async () => {
    try {
      const data = await combinedTestsAPI.getAvailableTests();
      setAvailableTests(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch available tests:", err);
      setError("Не удалось загрузить доступные тесты");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSelection = (testId: number, questionCount: number) => {
    const newSelection = new Map(selectedTests);
    if (newSelection.has(testId) && questionCount === 0) {
      newSelection.delete(testId);
    } else if (questionCount > 0) {
      newSelection.set(testId, questionCount);
    }
    setSelectedTests(newSelection);
  };

  const getTotalQuestions = () => {
    return Array.from(selectedTests.values()).reduce(
      (sum, count) => sum + count,
      0
    );
  };

  const handleCreate = async () => {
    if (selectedTests.size === 0) {
      alert("Выберите хотя бы один тест");
      return;
    }

    if (!testTitle.trim()) {
      alert("Введите название теста");
      return;
    }

    const totalQuestions = getTotalQuestions();
    if (totalQuestions === 0) {
      alert("Выберите хотя бы один вопрос");
      return;
    }

    try {
      setIsCreating(true);
      const result = await combinedTestsAPI.generate({
        source_test_ids: Array.from(selectedTests.keys()),
        questions_count: totalQuestions,
      });

      router.push("/tests");
    } catch (err: any) {
      console.error("Failed to create combined test:", err);
      alert(err?.response?.data?.detail || "Не удалось создать тест");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-12 sm:pt-16 md:pt-20">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
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
                  d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"
                />
              </svg>
              Назад
            </button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Создать комбинированный тест
            </h1>
            <p className="text-gray-600">
              Выберите тесты и количество вопросов из каждого
            </p>
          </div>

          {error && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="text-red-600">{error}</div>
              </CardContent>
            </Card>
          )}

          {/* Title Input */}
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название теста
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Введите название комбинированного теста"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </CardContent>
          </Card>

          {/* Available Tests */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Загрузка...</p>
            </div>
          ) : availableTests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Нет доступных тестов
                </h3>
                <p className="text-gray-600">
                  Пока нет тестов типа &quot;для комбинирования&quot;
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {availableTests.map((test) => {
                  const selectedCount = selectedTests.get(test.id) || 0;
                  const isSelected = selectedCount > 0;

                  return (
                    <Card
                      key={test.id}
                      className={`transition ${
                        isSelected ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {test.title}
                            </h3>
                            {test.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {test.description}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">
                              Всего вопросов: {test.total_questions}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex-1">
                            <span className="text-sm font-medium text-gray-700 mb-2 block">
                              Количество вопросов
                            </span>
                            <input
                              type="number"
                              min="0"
                              max={test.total_questions}
                              value={selectedCount}
                              onChange={(e) =>
                                handleTestSelection(
                                  test.id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </label>
                          {isSelected && (
                            <div className="text-blue-600 font-medium pt-6">
                              ✓ Выбрано
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Summary */}
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Выбрано тестов: {selectedTests.size}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        Всего вопросов: {getTotalQuestions()}
                      </p>
                    </div>
                    <Button
                      onClick={handleCreate}
                      disabled={isCreating || selectedTests.size === 0}
                      className="min-h-[44px]"
                    >
                      {isCreating ? "Создание..." : "Создать тест"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
