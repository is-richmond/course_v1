"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { testsAPI } from "@/src/lib/api";
import type { TestResponse } from "@/src/types/api";

export const TestsGrid: React.FC = () => {
  const [tests, setTests] = useState<TestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const apiTests = await testsAPI.list();
        setTests(apiTests);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
            <div className="h-4 w-full bg-gray-200 rounded mb-4" />
            <div className="grid grid-cols-2 gap-4 py-4 mb-4">
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
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
        <Button variant="primary" onClick={() => window.location.reload()}>
          Попробовать снова
        </Button>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="text-center py-8">
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tests.map((test) => (
        <Card key={test.id} className="hover:shadow-lg transition group">
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {test.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {test.description || "Описание теста"}
              </p>
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
                <p className="text-xs text-gray-600">проходной балл</p>
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
                <p className="text-sm font-semibold text-gray-900">30 мин</p>
                <p className="text-xs text-gray-600">время</p>
              </div>
            </div>

            <Link href={`/tests/${test.id}`} className="block">
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
