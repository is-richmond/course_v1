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

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Почему выбирают нас
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Современная платформа для медицинского образования с лучшими
                преподавателями
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 256 256"
                      className="text-blue-600"
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
                      width="32"
                      height="32"
                      viewBox="0 0 256 256"
                      className="text-blue-600"
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
                      width="32"
                      height="32"
                      viewBox="0 0 256 256"
                      className="text-blue-600"
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
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all text-center"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Как это работает
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Простой путь к новым знаниям
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
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
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Готовы начать обучение?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Присоединяйтесь к тысячам медицинских специалистов, повышающих
              свою квалификацию
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Зарегистрироваться бесплатно
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
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
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Мои курсы</h2>
            <p className="text-gray-600">
              Ваши активные курсы и прогресс обучения
            </p>
          </div>
          <ContinueLearning />
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
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
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Доступные тесты
            </h2>
            <p className="text-gray-600">
              Проверьте свои знания с помощью наших тестов
            </p>
          </div>
          <TestsGrid />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-8">
      <Tabs items={tabItems} defaultTab="courses" />
    </div>
  );
}
