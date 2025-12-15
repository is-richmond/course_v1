"use client";

import React from "react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Tabs } from "@/src/components/ui/Tabs";
import { courses } from "@/src/data/courses";
import { BookOpen, BarChart3, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Rating } from "@/src/components/ui/Rating";

export default function MyCoursesPage() {
  const inProgressCourses = courses.slice(0, 2);
  const completedCourses = courses.slice(2, 3);
  const wishlistCourses = courses.slice(1, 2);

  const renderCourseCard = (course: any) => (
    <Card key={course.id} className="hover:shadow-lg transition">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          {/* Course Image Placeholder */}
          <div className="w-32 h-24 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen size={32} className="text-white" />
          </div>

          {/* Course Info */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
            <div className="flex items-center gap-4 mb-3">
              <Rating rating={course.rating} />
              <span className="text-sm text-gray-600">{course.duration}</span>
            </div>

            {/* Progress Bar for In Progress */}
            {course.id === "1" && (
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-600">Прогресс</span>
                  <span className="text-sm font-semibold text-blue-600">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
            )}

            {/* Status Badge */}
            <div className="flex gap-2">
              {course.id === "1" && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  В процессе
                </span>
              )}
              {course.id === "3" && (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                  <CheckCircle size={12} /> Завершён
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-right flex flex-col justify-between">
            <div className="text-2xl font-bold text-blue-600">
              T{course.price.toLocaleString("ru-RU")}
            </div>
            {course.id === "1" && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                Продолжить
              </button>
            )}
            {course.id === "3" && (
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                Сертификат
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const tabItems = [
    {
      id: "in-progress",
      label: `В процессе (${inProgressCourses.length})`,
      content: (
        <div className="p-6 space-y-4">
          {inProgressCourses.length > 0 ? (
            inProgressCourses.map(renderCourseCard)
          ) : (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">У вас нет активных курсов</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "completed",
      label: `Завершённые (${completedCourses.length})`,
      content: (
        <div className="p-6 space-y-4">
          {completedCourses.length > 0 ? (
            completedCourses.map(renderCourseCard)
          ) : (
            <div className="text-center py-12">
              <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">У вас нет завершённых курсов</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "wishlist",
      label: `Избранные (${wishlistCourses.length})`,
      content: (
        <div className="p-6 space-y-4">
          {wishlistCourses.length > 0 ? (
            wishlistCourses.map(renderCourseCard)
          ) : (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">У вас нет избранных курсов</p>
            </div>
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
