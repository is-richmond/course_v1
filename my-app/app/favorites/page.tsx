"use client";

import React from "react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { CourseCard } from "@/src/components/sections/CourseCard";
import { courses } from "@/src/data/courses";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const favoriteCourses = courses.slice(0, 2);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Избранные курсы</h1>
          <p className="text-gray-600 mb-8">Курсы, которые вы сохранили для последующего обучения</p>

          {favoriteCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет избранных курсов</h3>
              <p className="text-gray-600">Добавьте интересующие вас курсы в избранное</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
