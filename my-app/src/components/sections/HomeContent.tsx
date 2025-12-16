"use client";

import React from "react";
import Link from "next/link";
import { Tabs } from "@/src/components/ui/Tabs";
import { CoursesGrid } from "./CoursesGrid";
import { TestsGrid } from "./TestsGrid";
import { ContinueLearning } from "./ContinueLearning";
import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/contexts/AuthContext";

interface HomeContentProps {
  heroComponent: React.ReactNode;
  reviewsComponent: React.ReactNode;
  faqComponent: React.ReactNode;
}

export default function HomeContent({
  heroComponent,
  reviewsComponent,
  faqComponent,
}: HomeContentProps) {
  const { user } = useAuth();

  // For non-authenticated users - show landing page
  if (!user) {
    return (
      <div>
        {heroComponent}

        {/* Features Section - Responsive */}
        <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Почему выбирают нас
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
                Современная платформа для медицинского образования с лучшими
                преподавателями
              </p>
            </div>

            {/* Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 256 256"
                      className="text-blue-600 sm:w-8 sm:h-8"
                    >
                      <path
                        fill="currentColor"
                        d="M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a130,130,0,0,0,48-8.76V240a8,8,0,0,0,16,0V199.51a115.63,115.63,0,0,0,27.94-22.57A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12Z"
                      />
                    </svg>
                  ),
                  title: "Качественное образование",
                  description:
                    "Курсы разработаны ведущими специалистами в области медицины",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 256 256"
                      className="text-blue-600 sm:w-8 sm:h-8"
                    >
                      <path
                        fill="currentColor"
                        d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"
                      />
                    </svg>
                  ),
                  title: "Гибкий график",
                  description:
                    "Учитесь в удобное время, материалы доступны 24/7",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 256 256"
                      className="text-blue-600 sm:w-8 sm:h-8"
                    >
                      <path
                        fill="currentColor"
                        d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,144H32V64H224V192ZM48,104a8,8,0,0,1,8-8H200a8,8,0,0,1,0,16H56A8,8,0,0,1,48,104Zm0,32a8,8,0,0,1,8-8H200a8,8,0,0,1,0,16H56A8,8,0,0,1,48,136Zm0,32a8,8,0,0,1,8-8H136a8,8,0,0,1,0,16H56A8,8,0,0,1,48,168Z"
                      />
                    </svg>
                  ),
                  title: "Сертификаты",
                  description:
                    "Получите подтверждение квалификации после прохождения курса",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all text-center"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Responsive */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Как это работает
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Простой путь к новым знаниям
              </p>
            </div>

            {/* Responsive grid: 2 cols mobile, 4 cols desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[
                {
                  step: "1",
                  title: "Регистрация",
                  description: "Создайте аккаунт за 1 минуту",
                },
                {
                  step: "2",
                  title: "Выбор курса",
                  description: "Выберите интересующий вас курс",
                },
                {
                  step: "3",
                  title: "Обучение",
                  description: "Изучайте материалы и проходите тесты",
                },
                {
                  step: "4",
                  title: "Сертификат",
                  description: "Получите сертификат по окончании",
                },
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white text-xl sm:text-2xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Responsive */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Готовы начать обучение?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 px-2">
              Присоединяйтесь к тысячам медицинских специалистов, повышающих
              свою квалификацию
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 min-h-[48px]"
                >
                  Зарегистрироваться бесплатно
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto border-white text-white hover:bg-white/10 min-h-[48px]"
                >
                  Войти
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {reviewsComponent}
        {faqComponent}
      </div>
    );
  }

  // For authenticated users - show dashboard with tabs
  const tabItems = [
    {
      id: "courses",
      label: "Мои курсы",
      content: (
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Мои курсы
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Ваши активные курсы и прогресс обучения
            </p>
          </div>
          <ContinueLearning />
          <div className="mt-8 sm:mt-10 md:mt-12">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              Все доступные курсы
            </h3>
            <CoursesGrid />
          </div>
        </div>
      ),
    },
    {
      id: "tests",
      label: "Тесты",
      content: (
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Доступные тесты
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Проверьте свои знания с помощью наших тестов
            </p>
          </div>
          <TestsGrid />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 md:py-8">
      <Tabs items={tabItems} defaultTab="courses" />
    </div>
  );
}
