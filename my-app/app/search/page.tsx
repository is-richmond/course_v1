"use client";

import React, { useState } from "react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { CourseCard } from "@/src/components/sections/CourseCard";
import { courses } from "@/src/data/courses";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [filterFormat, setFilterFormat] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = !filterLevel || course.level === filterLevel;
    const matchesFormat = !filterFormat || course.format === filterFormat;

    return matchesSearch && matchesLevel && matchesFormat;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setFilterLevel("");
    setFilterFormat("");
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Search Bar */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Поиск курсов</h1>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Введите название или тему курса..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter size={20} />
                Фильтры
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Уровень</label>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Все уровни</option>
                    <option value="beginner">Начинающий</option>
                    <option value="intermediate">Средний</option>
                    <option value="advanced">Продвинутый</option>
                  </select>
                </div>

                {/* Format Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Формат</label>
                  <select
                    value={filterFormat}
                    onChange={(e) => setFilterFormat(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Все форматы</option>
                    <option value="online">Онлайн</option>
                    <option value="offline">Офлайн</option>
                    <option value="hybrid">Гибридный</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Очистить фильтры
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="mb-6">
            <p className="text-gray-600">
              Найдено <strong className="text-gray-900">{filteredCourses.length}</strong> курс
              {filteredCourses.length === 1
                ? ""
                : filteredCourses.length > 1 && filteredCourses.length < 5
                ? "а"
                : "ов"}
            </p>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Курсы не найдены</h3>
              <p className="text-gray-600">Попробуйте изменить критерии поиска или фильтры</p>
              <Button variant="primary" onClick={clearFilters} className="mt-6">
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
