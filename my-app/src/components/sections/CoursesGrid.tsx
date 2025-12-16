"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Rating } from "@/src/components/ui/Rating";
import { Button } from "@/src/components/ui/Button";
import { courses } from "@/src/data/courses";
import { ArrowRight } from "lucide-react";

export const CoursesGrid: React.FC = () => {
  return (
    <div className="py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Все курсы</h2>
        <p className="text-gray-600">Выберите курс для начала обучения</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card className="h-full hover:shadow-lg transition cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Rating rating={course.rating} />
                      <span className="text-xs text-gray-600">
                        ({course.reviews} отзывов)
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-blue-600 shrink-0" />
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.forWhom}
                </p>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Модулей</p>
                    <p className="text-lg font-bold text-gray-900">
                      {course.syllabus.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Длительность</p>
                    <p className="text-lg font-bold text-gray-900">
                      {course.duration}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Цена</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₽{course.price.toLocaleString("ru-RU")}
                    </p>
                  </div>
                  <Button variant="primary" size="sm">
                    Подробнее
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
