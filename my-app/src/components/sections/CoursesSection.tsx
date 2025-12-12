"use client";

import React, { useState } from "react";
import { CourseCard } from "@/src/components/sections/CourseCard";
import { Button } from "@/src/components/ui/Button";
import { courses } from "@/src/data/courses";
import { CourseLevel, CourseFormat, CourseSpecialty } from "@/src/types";
import { Filter } from "lucide-react";

export const CoursesSection: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | "all">("all");
  const [selectedFormat, setSelectedFormat] = useState<CourseFormat | "all">("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<CourseSpecialty | "all">("all");

  const filteredCourses = courses.filter((course) => {
    const levelMatch = selectedLevel === "all" || course.level === selectedLevel;
    const formatMatch = selectedFormat === "all" || course.format === selectedFormat;
    const specialtyMatch = selectedSpecialty === "all" || course.specialty === selectedSpecialty;
    return levelMatch && formatMatch && specialtyMatch;
  });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          Каталог курсов
        </h2>

        {/* Filters */}
        <div className="bg-gray-50 p-6 rounded-xl mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Filter size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Уровень
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as CourseLevel | "all")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все уровни</option>
                <option value="beginner">Начинающий</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </div>

            {/* Format Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Формат
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as CourseFormat | "all")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все форматы</option>
                <option value="online">Онлайн</option>
                <option value="offline">Офлайн</option>
                <option value="hybrid">Гибридный</option>
              </select>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Специальность
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value as CourseSpecialty | "all")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все специальности</option>
                <option value="surgery">Хирургия</option>
                <option value="therapy">Терапия</option>
                <option value="cardiology">Кардиология</option>
                <option value="pediatrics">Педиатрия</option>
                <option value="nursing">Сестринское дело</option>
                <option value="psychiatry">Психиатрия</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Курсы по вашим критериям не найдены</p>
          </div>
        )}
      </div>
    </section>
  );
};
