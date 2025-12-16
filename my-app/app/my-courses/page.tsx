"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { coursesAPI } from "@/src/lib/api";
import type { CourseResponse } from "@/src/types/api";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await coursesAPI.list();
        // Show only published courses
        const publishedCourses = response.filter(
          (c) => c.status === "published"
        );
        setCourses(publishedCourses);
        setError(null);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError("Не удалось загрузить курсы");
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Все курсы</h1>
            <p className="text-gray-600">Выберите курс для начала обучения</p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-40 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-full bg-gray-200 rounded mb-4" />
                  <div className="flex justify-between">
                    <div className="h-8 w-24 bg-gray-200 rounded" />
                    <div className="h-10 w-28 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
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

          {/* Empty State */}
          {!isLoading && !error && courses.length === 0 && (
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
                    d="M232,64H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48V64H24A8,8,0,0,0,16,72V200a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V72A8,8,0,0,0,232,64ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V64H96ZM224,200H32V80H224Z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Курсы не найдены
              </h3>
              <p className="text-gray-600">Пока нет доступных курсов</p>
            </div>
          )}

          {/* Courses Grid */}
          {!isLoading && !error && courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="h-full hover:shadow-lg transition cursor-pointer group">
                    {/* Course Image */}
                    <div className="h-40 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-t-xl flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 256 256"
                        className="text-white/80"
                      >
                        <path
                          fill="currentColor"
                          d="M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a130,130,0,0,0,48-8.76V240a8,8,0,0,0,16,0V199.51a115.63,115.63,0,0,0,27.94-22.57A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12Z"
                        />
                      </svg>
                    </div>

                    <CardContent className="pt-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.description ||
                          "Описание курса будет добавлено позже"}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Цена</p>
                          <p className="text-xl font-bold text-blue-600">
                            {course.price > 0
                              ? `₽${course.price.toLocaleString("ru-RU")}`
                              : "Бесплатно"}
                          </p>
                        </div>
                        <Button variant="primary" size="sm">
                          Подробнее
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
