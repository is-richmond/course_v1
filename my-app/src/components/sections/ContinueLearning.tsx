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
              className="bg-white border border-gray-200 overflow-hidden animate-pulse"
              style={{ aspectRatio: "1.5" }}
            >
              <div className="h-full bg-gradient-to-br from-gray-200 to-gray-300" />
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

  // Background images for different courses (you can replace these with actual course images)
  const courseBackgrounds = [
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80", // Medical clinic
    "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800&q=80", // Infectious disease
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80", // Evidence-based medicine
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {activeCourses.map((course, index) => {
        const moduleNum = course.lastModuleIndex;
        const currentModule = course.modules[moduleNum] || course.modules[0];

        // Calculate progress based on completed lessons or modules
        const progress =
          course.totalLessons > 0 && course.completedLessons > 0
            ? Math.round((course.completedLessons / course.totalLessons) * 100)
            : course.modules.length > 0
            ? Math.round(((moduleNum + 1) / course.modules.length) * 100)
            : 0;

        // Use background image based on index
        const backgroundImage = courseBackgrounds[index % courseBackgrounds.length];

        return (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card className="h-full hover:shadow-xl transition-all duration-300 group border border-gray-300 overflow-hidden p-0">
              {/* Course Card with Background Image */}
              <div
                className="relative h-48 sm:h-56 flex flex-col items-center justify-center text-center p-6"
                style={{
                  backgroundImage: `linear-gradient(rgba(97, 99, 103, 0), rgba(32, 32, 46, 0.85)), url(${backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Course Title */}
                <h3 className="text-white text-lg sm:text-xl font-bold mb-2 px-4 leading-tight">
                  {course.title}
                </h3>

                {/* Course Subtitle/Description */}
                {currentModule && (
                  <p className="text-white/90 text-xs sm:text-sm mb-6 px-4">
                    {currentModule.title}
                  </p>
                )}

                {/* Button */}
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 text-sm font-medium rounded-lg"
                >
                  Доступно
                </Button>

                {/* Progress Indicator (Optional - small badge in corner) */}
                {/* {progress > 0 && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-bold px-3 py-1 shadow-sm">
                    {progress}% завершено
                  </div>
                )} */}
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};