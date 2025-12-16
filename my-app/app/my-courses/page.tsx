"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Tabs } from "@/src/components/ui/Tabs";
import { Button } from "@/src/components/ui/Button";
import { courses } from "@/src/data/courses";
import { BookOpen, BarChart3, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Rating } from "@/src/components/ui/Rating";
import { useAuth } from "@/src/contexts/AuthContext";
import { enrollmentAPI } from "@/src/lib/api";

export default function MyCoursesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch enrolled courses from backend
        const response = await enrollmentAPI.getEnrolledCourses();
        const enrolledCourseIds = response.enrolled_courses || [];

        const enrolled: any[] = [];
        const completed: any[] = [];

        courses.forEach((course) => {
          const isEnrolled = enrolledCourseIds.includes(course.id.toString());
          const isCompleted =
            localStorage.getItem(`course_${course.id}_completed`) === "true";

          if (isEnrolled) {
            if (isCompleted) {
              completed.push(course);
            } else {
              enrolled.push(course);
            }
          }
        });

        setEnrolledCourses(enrolled);
        setCompletedCourses(completed);
      } catch (error) {
        console.error("Failed to load courses:", error);
        // Fallback to localStorage
        const enrolled: any[] = [];
        const completed: any[] = [];

        courses.forEach((course) => {
          const isPaid = localStorage.getItem(`course_paid_${course.id}`) === "true";
          const isCompleted =
            localStorage.getItem(`course_${course.id}_completed`) === "true";

          if (isPaid) {
            if (isCompleted) {
              completed.push(course);
            } else {
              enrolled.push(course);
            }
          }
        });

        setEnrolledCourses(enrolled);
        setCompletedCourses(completed);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadCourses();
    }
  }, [user, authLoading]);

  const renderCourseCard = (course: any, isCompleted: boolean = false) => {
    const lastModuleIdx = parseInt(
      localStorage.getItem(`course_${course.id}_lastModule`) || "0"
    );
    const progress = Math.round(
      ((lastModuleIdx + 1) / course.syllabus.length) * 100
    );

    return (
      <Card key={course.id} className="hover:shadow-lg transition">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {/* Course Image Placeholder */}
            <div className="w-32 h-24 bg-linear-to-br from-blue-300 to-indigo-400 rounded-lg flex items-center justify-center shrink-0">
              <BookOpen size={32} className="text-white" />
            </div>

            {/* Course Info */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {course.title}
              </h3>
              <div className="flex items-center gap-4 mb-3">
                <Rating rating={course.rating} />
                <span className="text-sm text-gray-600">{course.duration}</span>
              </div>

              {/* Progress Bar for In Progress */}
              {!isCompleted && (
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">
                      Прогресс
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex gap-2">
                {isCompleted ? (
                  <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full items-center gap-1">
                    <CheckCircle size={12} /> Завершён
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    В процессе
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="text-right flex flex-col justify-between">
              <div className="text-2xl font-bold text-blue-600">
                T{course.price.toLocaleString("ru-RU")}
              </div>
              {isCompleted ? (
                <Link href="/certificates">
                  <Button variant="secondary" size="sm">
                    Сертификат
                  </Button>
                </Link>
              ) : (
                <Link href={`/courses/${course.id}`}>
                  <Button variant="primary" size="sm">
                    Продолжить
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const tabItems = [
    {
      id: "in-progress",
      label: `В процессе (${enrolledCourses.length})`,
      content: (
        <div className="p-6 space-y-4">
          {!isLoading && enrolledCourses.length > 0 ? (
            enrolledCourses.map((course) => renderCourseCard(course, false))
          ) : !isLoading ? (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">У вас нет активных курсов</p>
            </div>
          ) : (
            <p className="text-center text-gray-600">Загрузка...</p>
          )}
        </div>
      ),
    },
    {
      id: "completed",
      label: `Завершённые (${completedCourses.length})`,
      content: (
        <div className="p-6 space-y-4">
          {!isLoading && completedCourses.length > 0 ? (
            completedCourses.map((course) => renderCourseCard(course, true))
          ) : !isLoading ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">У вас нет завершённых курсов</p>
            </div>
          ) : (
            <p className="text-center text-gray-600">Загрузка...</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Мои курсы</h1>
            <p className="text-gray-600">Управляйте своим обучением и отслеживайте прогресс</p>
          </div>

          {/* Tabs */}
          <Tabs items={tabItems} defaultTab="in-progress" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
