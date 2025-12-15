"use client";

import React from "react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { CourseCard } from "@/src/components/sections/CourseCard";
import { courses } from "@/src/data/courses";
import { Sparkles } from "lucide-react";

export default function RecommendedPage() {
  const recommendedCourses = courses;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-yellow-500" size={32} />
            <h1 className="text-4xl font-bold text-gray-900">Рекомендуемые для вас</h1>
          </div>
          <p className="text-gray-600 mb-8">Курсы, подобранные специально на основе ваших интересов</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
