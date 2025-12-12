import React from "react";
import Link from "next/link";
import { Course } from "@/src/types";
import { Card, CardContent, CardFooter } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Rating } from "@/src/components/ui/Rating";
import { Badge } from "@/src/components/ui/Badge";
import { Users, Clock, Award } from "lucide-react";

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const specialtyLabels: Record<string, string> = {
    surgery: "Хирургия",
    therapy: "Терапия",
    cardiology: "Кардиология",
    pediatrics: "Педиатрия",
    nursing: "Сестринское дело",
    psychiatry: "Психиатрия"
  };

  const levelLabels: Record<string, string> = {
    beginner: "Начинающий",
    intermediate: "Средний",
    advanced: "Продвинутый"
  };

  return (
    <Card className="overflow-hidden">
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-linear-to-br from-blue-300 to-indigo-400 flex items-center justify-center">
        <span className="text-white text-3xl">📚</span>
      </div>

      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-3">
          <Badge variant="primary">{specialtyLabels[course.specialty]}</Badge>
          {course.featured && <Badge variant="success">Популярный</Badge>}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.shortDescription}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Users size={16} />
            <span>{course.students} студентов</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Clock size={16} />
            <span>{course.duration}</span>
          </div>
          {course.certificate && (
            <div className="flex items-center gap-2 text-gray-700 text-sm">
              <Award size={16} />
              <span>С сертификатом</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <Rating rating={course.rating} reviews={course.reviews} />
        </div>

        <div className="text-3xl font-bold text-blue-600 mb-4">
          T{course.price.toLocaleString('ru-RU')}
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-3">
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button variant="primary" className="w-full">
            Подробнее
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
