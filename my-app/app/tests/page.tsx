"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { tests as allTests } from "@/src/data/tests";
import { BookOpen, Clock, BarChart3, ChevronRight } from "lucide-react";

interface Test {
  id: string;
  title: string;
  description: string;
  questions: number;
  duration: string;
  difficulty: string;
  passed?: boolean;
  score?: number;
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [completedTests, setCompletedTests] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const formattedTests: Test[] = allTests.map((test) => ({
      id: test.id,
      title: test.title,
      description: test.description,
      questions: test.questions,
      duration: test.duration,
      difficulty: test.difficulty,
    }));

    const completed = new Set<string>();
    formattedTests.forEach((test) => {
      const passed = localStorage.getItem(`test_${test.id}_passed`);
      if (passed === "true") {
        completed.add(test.id);
      }
    });

    const enrichedTests = formattedTests.map((test) => ({
      ...test,
      passed: completed.has(test.id),
      score: parseInt(localStorage.getItem(`test_${test.id}_score`) || "0"),
    }));

    setTests(enrichedTests);
    setCompletedTests(completed);
    setIsLoading(false);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Легкий":
        return "text-green-600";
      case "Средний":
        return "text-yellow-600";
      case "Сложный":
        return "text-red-600";
      case "Продвинутый":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Загрузка...</p>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Доступные тесты</h1>
            <p className="text-gray-600">
              Проверьте свои знания с помощью наших интерактивных тестов
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BookOpen size={32} className="mx-auto text-blue-600 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Всего тестов</p>
                  <p className="text-3xl font-bold text-gray-900">{tests.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BarChart3 size={32} className="mx-auto text-green-600 mb-3" />
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
                  <BarChart3 size={32} className="mx-auto text-orange-600 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Осталось</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {tests.length - completedTests.size}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tests.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {test.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{test.description}</p>
                    </div>
                    {test.passed && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold ml-2">
                        ✓ Пройден
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-gray-200">
                    <div className="text-center">
                      <BookOpen size={20} className="mx-auto text-blue-600 mb-1" />
                      <p className="text-sm font-semibold text-gray-900">
                        {test.questions}
                      </p>
                      <p className="text-xs text-gray-600">вопросов</p>
                    </div>
                    <div className="text-center">
                      <Clock size={20} className="mx-auto text-blue-600 mb-1" />
                      <p className="text-sm font-semibold text-gray-900">
                        {test.duration}
                      </p>
                      <p className="text-xs text-gray-600">время</p>
                    </div>
                    <div className="text-center">
                      <BarChart3 size={20} className="mx-auto mb-1" />
                      <p
                        className={`text-sm font-semibold ${getDifficultyColor(
                          test.difficulty
                        )}`}
                      >
                        {test.difficulty}
                      </p>
                      <p className="text-xs text-gray-600">сложность</p>
                    </div>
                  </div>

                  {test.passed ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Ваш результат</p>
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
                        <ChevronRight size={16} />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
