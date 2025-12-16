"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Award, Download, Share2 } from "lucide-react";
import { courses } from "@/src/data/courses";

interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  date: string;
  grade: number;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Загрузить сертификаты из localStorage
    const completedCourses = courses.filter((course) => {
      const completed = localStorage.getItem(`course_${course.id}_completed`);
      return completed === "true";
    });

    const certs = completedCourses.map((course) => ({
      id: `cert_${course.id}`,
      courseId: course.id,
      courseName: course.title,
      date: localStorage.getItem(`course_${course.id}_completedDate`) || new Date().toISOString().split('T')[0],
      grade: parseInt(localStorage.getItem(`course_${course.id}_grade`) || "0"),
    }));

    setCertificates(certs);
    setIsLoading(false);
  }, []);

  const handleDownload = (cert: Certificate) => {
    // Симуляция скачивания сертификата
    alert(`Сертификат по курсу "${cert.courseName}" скачан!`);
  };

  const handleShare = (cert: Certificate) => {
    // Симуляция поделиться сертификатом
    alert(`Поделился сертификатом по курсу "${cert.courseName}"`);
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Загрузка...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto w-full px-6 py-12">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Award size={32} className="text-blue-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Мои сертификаты</h1>
                <p className="text-gray-600 mt-1">
                  Сертификаты, полученные за прохождение курсов
                </p>
              </div>
            </div>
          </div>

          {certificates.length === 0 ? (
            <Card>
              <CardContent className="pt-16 pb-16 text-center">
                <Award size={64} className="mx-auto text-gray-300 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  У вас пока нет сертификатов
                </h2>
                <p className="text-gray-600 mb-8">
                  Завершите курсы, чтобы получить сертификаты
                </p>
                <a href="/">
                  <Button variant="primary">Выбрать курс</Button>
                </a>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition">
                  <CardContent className="pt-8">
                    <div className="text-center mb-6">
                      <Award size={48} className="mx-auto text-yellow-500 mb-4" />
                      <h3 className="text-xl font-bold text-gray-900">
                        {cert.courseName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2">
                        Получен: {new Date(cert.date).toLocaleDateString('ru-RU')}
                      </p>
                    </div>

                    <div className="border-y border-gray-200 py-4 mb-6">
                      <div className="text-center mb-4">
                        <span className="text-3xl font-bold text-blue-600">
                          {cert.grade}%
                        </span>
                        <p className="text-sm text-gray-600 mt-1">Оценка</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${cert.grade}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-2"
                        onClick={() => handleDownload(cert)}
                      >
                        <Download size={16} />
                        Скачать
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-2"
                        onClick={() => handleShare(cert)}
                      >
                        <Share2 size={16} />
                        Поделиться
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
