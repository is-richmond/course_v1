"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { enrollmentAPI, coursesAPI } from "@/src/lib/api";
import type { CourseWithModules } from "@/src/types/api";

interface ActiveCourse extends CourseWithModules {
  lastModuleIndex: number;
}

export const ContinueLearning: React.FC = () => {
  const [activeCourses, setActiveCourses] = useState<ActiveCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        // Get enrolled course IDs from API
        const enrollmentData = await enrollmentAPI.getEnrolledCourses();
        const enrolledIds: string[] = enrollmentData.enrolled_courses || [];

        if (enrolledIds.length === 0) {
          setActiveCourses([]);
          setIsLoading(false);
          return;
        }

        // Fetch full course data with modules for each enrolled course
        const coursePromises = enrolledIds.map(async (courseId) => {
          try {
            const course = await coursesAPI.getWithModules(parseInt(courseId));
            const lastModule = localStorage.getItem(
              `course_${courseId}_lastModule`
            );
            return {
              ...course,
              lastModuleIndex: lastModule ? parseInt(lastModule) : 0,
            };
          } catch {
            return null;
          }
        });

        const courses = await Promise.all(coursePromises);
        setActiveCourses(courses.filter((c): c is ActiveCourse => c !== null));
        setError(null);
      } catch (err) {
        console.error("Failed to fetch enrolled courses:", err);
        // Fallback: check localStorage for any started courses
        const localCourses: ActiveCourse[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith("course_") && key.endsWith("_lastModule")) {
            const courseId = key
              .replace("course_", "")
              .replace("_lastModule", "");
            try {
              const course = await coursesAPI.getWithModules(
                parseInt(courseId)
              );
              const lastModule = localStorage.getItem(key);
              localCourses.push({
                ...course,
                lastModuleIndex: lastModule ? parseInt(lastModule) : 0,
              });
            } catch {
              // Course not found, skip
            }
          }
        }
        setActiveCourses(localCourses);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
              <div className="h-2 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeCourses.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 256 256"
            className="text-blue-600"
          >
            <path
              fill="currentColor"
              d="M232,64H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48V64H24A8,8,0,0,0,16,72V200a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V72A8,8,0,0,0,232,64ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V64H96ZM224,200H32V80H224Z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Нет активных курсов
        </h3>
        <p className="text-gray-600 mb-4">
          Выберите курс, чтобы начать обучение
        </p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Продолжить обучение
        </h2>
        <p className="text-gray-600">Ваши активные курсы</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeCourses.map((course) => {
          const moduleNum = course.lastModuleIndex;
          const currentModule = course.modules[moduleNum] || course.modules[0];
          const progress =
            course.modules.length > 0
              ? Math.round(((moduleNum + 1) / course.modules.length) * 100)
              : 0;

          return (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="h-full hover:shadow-lg transition group">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      {currentModule && (
                        <p className="text-sm text-blue-600 font-semibold">
                          {currentModule.title}
                        </p>
                      )}
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

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Прогресс</span>
                      <span className="text-sm font-bold text-gray-900">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-600">
                      Модуль {moduleNum + 1} из {course.modules.length}
                    </p>
                    <Button variant="primary" size="sm">
                      Продолжить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
