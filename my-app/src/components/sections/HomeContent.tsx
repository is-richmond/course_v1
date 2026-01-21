"use client";

import React from "react";
import Image from "next/image";
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
        {/* Сделал фо�� чуть голубее, чтобы соответствовать макету */}
        <section className="py-12 sm:py-16 md:py-20 bg-[#eef8ff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                <span className="text-[#29416D]">Почему выбирают</span>{" "}
                <span className="text-[#59A9CC]">нас ?</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
                Современная платформа для медицинного образования с лучшими
                преподавателями
              </p>
            </div>

            {/* Images: background (full width of the block) + overlay (sits over the background) */}
            <div className="w-full flex justify-center mb-2">
              {/* Родитель relative с overflow-visible — позволяет оверлею выходить за границы фонового блока */}
              <div className="relative w-full max-w-6xl overflow-visible">
                {/* Контейнер с соотношением сторон для фонового изображения */}
                <div className="relative w-full" style={{ paddingTop: "48.208333%" }}>
                  {/* Фоновый блок — закруглённый, обрезающий содержимое */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <Image
                      src="/why1.png"
                      alt="Фон"
                      fill
                      className="object-cover object-center"
                      priority
                    />
                  </div>
                </div>

                {/* Оверлей — находится на уровне родителя (не внутри overflow-hidden), поэтому не будет обрезан */}
                {/* -left/-top и width заданы в процентах/классах, подгоняйте под макет */}
                <div className="absolute z-20 left-[17.97%] -top-12 w-[64%]">
                  <Image
                    src="/why3.png"
                    alt="Оверлей"
                    width={1232}
                    height={862}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
            {/* Поднял грид вверх -mt-20 и поставил z-10 чтобы карточки были поверх фоновой картинки */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 -mt-20 relative z-10">
              {[
                {
                  img: "/Ellipse 9.png",
                  title: "Качественное образование",
                  description:
                    "Курсы разработаны ведущими специалистами в области медицины",
                },
                {
                  img: "/Ellipse 9.png",
                  title: "Гибкий график",
                  description:
                    "Учитесь в удобное время, материалы доступны 24/7",
                },
                {
                  img: "/Ellipse 9.png",
                  title: "Сертификаты",
                  description:
                    "Получите подтверждение квалификации после прохождения курса",
                },
              ].map((feature, idx) => (
                // Карточка становится relative чтобы иконка могла позиционироваться абсолютно относительно неё
                <div
                  key={idx}
                  className="relative bg-white rounded-2xl p-6 sm:p-8 pt-12 shadow-sm hover:shadow-lg transition-all text-center"
                >
                  {/* Иконка позиционируется абсолютной и перекрывает верхнюю грань карточки */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                    <div className="w-14 h-14 sm:w-16 sm:h-16">
                      <Image
                        src={feature.img}
                        alt={feature.title}
                        width={64}
                        height={64}
                        className="w-14 h-14 sm:w-16 sm:h-16"
                        priority
                      />
                    </div>
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
        {/* <-- REPLACED: new dark variant matching the provided mockup (uses photos instead of svg icons) --> */}
        <section className="py-16 bg-[#0e2540]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
              Как это <span className="text-[#85b8ff]">работает?</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-3">
              Простой путь к новым знаниям
            </p>

            {/* Desktop: horizontal flow with arrows.
                Mobile: 2 columns grid without arrows */}
            <div className="mt-12">
              <div className="hidden md:flex items-center justify-between gap-8">
                {[
                  {
                    img: "/ноут.png",
                    title: "Регистрация",
                    description: "Создайте аккаунт за 1 минуту",
                  },
                  {
                    img: "/экран.png",
                    title: "Выбор курса",
                    description: "Выберите интересующий вас курс",
                  },
                  {
                    img: "/док.png",
                    title: "Обучение",
                    description: "Изучайте материалы и проходите тесты",
                  },
                  {
                    img: "/спектр1.png",
                    title: "Сертификат",
                    description: "Получите сертификат по окончании",
                  },
                ].map((item, i, arr) => (
                  <React.Fragment key={i}>
                    <div className="flex-1 flex flex-col items-center text-center">
                      <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
                        <Image
                          src={item.img}
                          alt={item.title}
                          width={90}
                          height={90}
                          className="object-cover w-full h-full"
                          priority
                        />
                      </div>
                      <h3 className="mt-6 text-white font-semibold text-lg">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-300 max-w-xs">{item.description}</p>
                    </div>

                    {i < arr.length - 1 && (
                      <div className="flex items-center justify-center w-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10M13 6l6 6-6 6" />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Mobile / tablet layout (2 columns grid) — photos above titles */}
              <div className="mt-8 grid grid-cols-2 gap-6 md:hidden">
                {[
                  {
                    img: "/ноут.png",
                    title: "Регистрация",
                    description: "Создайте аккаунт за 1 минуту",
                  },
                  {
                    img: "/экран.png",
                    title: "Выбор курса",
                    description: "Выберите интересующий вас курс",
                  },
                  {
                    img: "/док.png",
                    title: "Обучение",
                    description: "Изучайте материалы и проходите тесты",
                  },
                  {
                    img: "/спектр1.png",
                    title: "Сертификат",
                    description: "Получите сертификат по окончании",
                  },
                ].map((it, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center bg-transparent">
                    <div className="w-14 h-14 flex items-center justify-center overflow-hidden">
                      <Image
                        src={it.img}
                        alt={it.title}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                        priority
                      />
                    </div>
                    <h4 className="mt-4 text-white font-semibold text-sm">{it.title}</h4>
                    <p className="mt-2 text-xs text-slate-300">{it.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Responsive */}
        <section className="py-12 sm:py-16 md:py-20 bg-[#1468C2]">
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
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4 sm:px-0">
                  <Button
                    className="
                      w-full max-w-[461px]
                      h-[64px]
                      bg-transparent
                      border-[2px] sm:border-[3px] border-white
                      rounded-[16px] sm:rounded-[24px]
                      text-white text-base sm:text-lg
                      hover:bg-white/10
                      transition
                    "
                  >

                    Зарегистрироваться бесплатно
                  </Button>
                </div>
              </Link>
              <Link href="/auth/register" className="w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4 sm:px-0">
                  <Button
                    className="
                      w-full max-w-[4610000px]
                      h-[64px]
                      bg-transparent
                      border-[2px] sm:border-[3px] border-white
                      rounded-[16px] sm:rounded-[24px]
                      text-white text-base sm:text-lg
                      px-12 sm:px-20
                      hover:bg-white/10
                      transition
                    "
                  >

                    Войти
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </section>
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
          <div className="mb-6 sm:mb-8 px-2 sm:px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Мои курсы
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Ваши активные курсы и прогресс обучения
            </p>
          </div>
          <div className="px-2 sm:px-4">
            <ContinueLearning />
          </div>
          <div className="mt-8 sm:mt-10 md:mt-12 px-2 sm:px-4">
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
          <div className="mb-6 sm:mb-8 px-2 sm:px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Доступные тесты
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Проверьте свои знания с помощью наших тестов
            </p>
          </div>
          <div className="px-2 sm:px-4">
            <TestsGrid />
          </div>
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