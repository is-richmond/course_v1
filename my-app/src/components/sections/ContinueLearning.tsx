"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { enrollmentAPI, coursesAPI } from "@/src/lib/api";
import type { CourseWithModules } from "@/src/types/api";

interface ActiveCourse extends CourseWithModules {
  lastModuleIndex: number;
  completedLessons: number;
  totalLessons: number;
}

export const ContinueLearning: React.FC = () => {
  const [activeCourses, setActiveCourses] = useState<ActiveCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        // Get enrolled course IDs from API only
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

            // Calculate completed lessons from localStorage
            let completedLessons = 0;
            const savedCompleted = localStorage.getItem(
              `course_${courseId}_completed`
            );
            if (savedCompleted) {
              try {
                const completedArray = JSON.parse(savedCompleted);
                completedLessons = completedArray.length;
              } catch {
                // Ignore parse errors
              }
            }

            // Use modules count as estimation for total lessons
            const totalLessons = course.modules.length;

            return {
              ...course,
              lastModuleIndex: lastModule ? parseInt(lastModule) : 0,
              completedLessons,
              totalLessons: totalLessons || course.modules.length,
            };
          } catch {
            return null;
          }
        });

        const courses = await Promise.all(coursePromises);
        setActiveCourses(courses.filter((c): c is ActiveCourse => c !== null));
      } catch (err) {
        console.error("Failed to fetch enrolled courses:", err);
        // If API fails, show empty state
        setActiveCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="py-6 sm:py-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4 sm:mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="h-24 sm:h-32 bg-gradient-to-br from-gray-200 to-gray-300" />
              <div className="p-4 sm:p-6">
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
                <div className="h-2 w-full bg-gray-200 rounded mb-4" />
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-8 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeCourses.length === 0) {
    return (
      <div className="py-8 sm:py-12 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 256 256"
            className="text-blue-600 sm:w-10 sm:h-10"
          >
            <path
              fill="currentColor"
              d="M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a130,130,0,0,0,48-8.76V240a8,8,0,0,0,16,0V199.51a115.63,115.63,0,0,0,27.94-22.57A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12Z"
            />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
          Нет активных курсов
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md mx-auto">
          Вы пока не записаны ни на один курс. Выберите курс из каталога, чтобы
          начать обучение
        </p>
        <Link href="/my-courses">
          <Button variant="primary" size="lg">
            Перейти к каталогу курсов
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {activeCourses.map((course) => {
        const moduleNum = course.lastModuleIndex;
        const currentModule = course.modules[moduleNum] || course.modules[0];

        // Calculate progress based on completed lessons or modules
        const progress =
          course.totalLessons > 0 && course.completedLessons > 0
            ? Math.round((course.completedLessons / course.totalLessons) * 100)
            : course.modules.length > 0
            ? Math.round(((moduleNum + 1) / course.modules.length) * 100)
            : 0;

        return (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card className="h-full hover:shadow-xl transition-all duration-300 group border-2 border-transparent hover:border-green-200 overflow-hidden">
              {/* Course Header with Gradient */}
              <div className="h-24 sm:h-32 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 relative overflow-hidden">
                {/* Decorative overlay */}
                <div className="absolute inset-0 bg-white/5" />

                {/* Course icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 0 256 256"
                    className="text-white/80 sm:w-10 sm:h-10"
                  >
                    <path
                      fill="currentColor"
                      d="M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a130,130,0,0,0,48-8.76V240a8,8,0,0,0,16,0V199.51a115.63,115.63,0,0,0,27.94-22.57A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12Z"
                    />
                  </svg>
                </div>

                {/* Completed lessons badge */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-sm text-green-700 text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full shadow-sm flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 256 256"
                    className="sm:w-3.5 sm:h-3.5"
                  >
                    <path
                      fill="currentColor"
                      d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"
                    />
                  </svg>
                  {course.completedLessons} уроков пройдено
                </div>
              </div>

              <CardContent className="pt-4 sm:pt-5">
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  {currentModule && (
                    <p className="text-xs sm:text-sm text-green-600 font-medium flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 256 256"
                        className="shrink-0"
                      >
                        <path
                          fill="currentColor"
                          d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z"
                        />
                      </svg>
                      <span className="truncate">{currentModule.title}</span>
                    </p>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Модуль {moduleNum + 1} из {course.modules.length}
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 group-hover:shadow-lg transition-all"
                  >
                    Продолжить
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 256 256"
                      className="ml-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <path
                        fill="currentColor"
                        d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z"
                      />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
