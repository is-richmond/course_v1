"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { courses } from "@/src/data/courses";
import { ArrowRight, BookOpen } from "lucide-react";

export const ContinueLearning: React.FC = () => {
  const [activeCourses, setActiveCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Получить активные курсы из localStorage
    const active = courses.filter((course) => {
      const lastModule = localStorage.getItem(`course_${course.id}_lastModule`);
      return lastModule !== null;
    });
    setActiveCourses(active);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  if (activeCourses.length === 0) {
    return (
      <div className="p-8 text-center">
        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Нет активных курсов
        </h3>
        <p className="text-gray-600 mb-4">
          Выберите курс, чтобы начать обучение
        </p>
        <Link href="/#courses">
          <Button variant="primary">Выбрать курс</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Продолжить обучение</h2>
        <p className="text-gray-600">Ваши активные курсы</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeCourses.map((course) => {
          const lastModule = localStorage.getItem(`course_${course.id}_lastModule`);
          const moduleNum = parseInt(lastModule || "0");
          const currentModule = course.syllabus[moduleNum] || course.syllabus[0];
          const progress = Math.round(((moduleNum + 1) / course.syllabus.length) * 100);

          return (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="h-full hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-blue-600 font-semibold">
                        {currentModule?.title}
                      </p>
                    </div>
                    <ArrowRight size={20} className="text-blue-600 shrink-0" />
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
                      Модуль {moduleNum + 1} из {course.syllabus.length}
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
