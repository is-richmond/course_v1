"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Rating } from "@/src/components/ui/Rating";
import { Button } from "@/src/components/ui/Button";
import { coursesAPI } from "@/src/lib/api";
import type { CourseResponse } from "@/src/types/api";

interface DisplayCourse {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  status: string;
}

export const CoursesGrid: React.FC = () => {
  const [courses, setCourses] = useState<DisplayCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const apiCourses = await coursesAPI.list();

        // Filter only published courses
        const publishedCourses = apiCourses.filter(
          (c: CourseResponse) => c.status === "published"
        );

        setCourses(publishedCourses);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Не удалось загрузить курсы. Попробуйте позже.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="h-7 sm:h-8 w-40 sm:w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 sm:h-5 w-56 sm:w-72 bg-gray-200 rounded animate-pulse" />
        </div>
        {/* Responsive skeleton grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 animate-pulse"
            >
              <div className="h-5 sm:h-6 w-3/4 bg-gray-200 rounded mb-3 sm:mb-4" />
              <div className="h-3 sm:h-4 w-1/2 bg-gray-200 rounded mb-3 sm:mb-4" />
              <div className="h-16 sm:h-20 bg-gray-200 rounded mb-3 sm:mb-4" />
              <div className="flex justify-between">
                <div className="h-7 sm:h-8 w-20 sm:w-24 bg-gray-200 rounded" />
                <div className="h-9 sm:h-10 w-24 sm:w-28 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 sm:py-8 text-center px-4">
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

  if (courses.length === 0) {
    return (
      <div className="py-6 sm:py-8 text-center px-4">
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
              d="M232,64H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48V64H24A8,8,0,0,0,16,72V200a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V72A8,8,0,0,0,232,64ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V64H96ZM224,200H32V80H224Z"
            />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          Курсы не найдены
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          Пока нет доступных курсов
        </p>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Все курсы
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Выберите курс для начала обучения
        </p>
      </div>

      {/* Responsive grid: 1 col mobile, 2 cols sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card className="h-full hover:shadow-lg transition cursor-pointer group">
              <CardContent className="p-4 sm:pt-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 pr-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 256 256"
                    className="text-blue-600 shrink-0 group-hover:translate-x-1 transition-transform"
                  >
                    <path
                      fill="currentColor"
                      d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z"
                    />
                  </svg>
                </div>

                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                  {course.description || "Описание курса будет добавлено позже"}
                </p>

                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-600">Цена</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                      {course.price > 0
                        ? `₸${course.price.toLocaleString("ru-RU")}`
                        : "Бесплатно"}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="min-h-[40px] sm:min-h-[36px] text-xs sm:text-sm"
                  >
                    Подробнее
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
