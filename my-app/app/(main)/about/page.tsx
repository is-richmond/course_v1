import React from "react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { ReviewsSection } from "@/src/components/sections/ReviewsSection";

// Reviews - can be fetched from API later
const reviews = [
  {
    id: "1",
    name: "Анна К.",
    title: "Студент",
    text: "Отличный курс! Много практических заданий.",
    rating: 5,
  },
  {
    id: "2",
    name: "Михаил С.",
    title: "Врач",
    text: "Рекомендую всем, кто хочет углубить свои знания.",
    rating: 5,
  },
  {
    id: "3",
    name: "Елена В.",
    title: "Студент",
    text: "Качественный материал, удобная платформа.",
    rating: 4,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-100 py-16">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">О нас</h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Plexus — платформа профессионального развития. Мы создаем
              высококачественные онлайн-курсы с экспертами в различных сферах.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Mission */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              Наша миссия
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Мы верим, что качественное образование — это ключ к
              профессиональному развитию. Наша миссия — предоставить доступные,
              практические и актуальные курсы повышения квалификации для
              медицинских работников.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Каждый курс разработан практикующими специалистами и обновляется в
              соответствии с последними медицинскими стандартами.
            </p>
          </section>

          {/* Values */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-12">
              Наши ценности
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 256 256"
                    className="text-blue-600 mb-4"
                  >
                    <path
                      fill="currentColor"
                      d="M232,64H208V48a24,24,0,0,0-24-24H72A24,24,0,0,0,48,48V64H24A8,8,0,0,0,16,72V96a48,48,0,0,0,48,48h8.2A48,48,0,0,0,120,177.92V200H96a24,24,0,0,0-24,24v8a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8v-8a24,24,0,0,0-24-24H136V177.92A48,48,0,0,0,183.8,144H192a48,48,0,0,0,48-48V72A8,8,0,0,0,232,64ZM64,128A32,32,0,0,1,32,96V80H48v48Zm160-32a32,32,0,0,1-32,32V80h32Z"
                    />
                  </svg>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Качество
                  </h3>
                  <p className="text-gray-700">
                    Все курсы разработаны экспертами с многолетним опытом
                    практической работы в медицине.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 256 256"
                    className="text-blue-600 mb-4"
                  >
                    <path
                      fill="currentColor"
                      d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1,0-16,24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219.83,124a67.94,67.94,0,0,1,26.57,24.8A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,41.76-30.52A48,48,0,1,1,176,136a47.59,47.59,0,0,1-13.08,32.76A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176Z"
                    />
                  </svg>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Доступность
                  </h3>
                  <p className="text-gray-700">
                    Гибкое расписание обучения, доступные цены и возможность
                    учиться в удобном темпе.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 256 256"
                    className="text-blue-600 mb-4"
                  >
                    <path
                      fill="currentColor"
                      d="M215.79,118.17a8,8,0,0,0-5-5.66L153.18,90.9l14.66-73.33a8,8,0,0,0-13.69-7l-112,120a8,8,0,0,0,3,13.05l57.63,21.61L88.16,238.43a8,8,0,0,0,13.69,7l112-120A8,8,0,0,0,215.79,118.17Z"
                    />
                  </svg>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Практичность
                  </h3>
                  <p className="text-gray-700">
                    Знания, которые можно сразу применить на практике в своей
                    работе.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Stats */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-12">
              Наши достижения
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { number: "1000+", label: "Студентов" },
                { number: "15+", label: "Курсов" },
                { number: "50+", label: "Преподавателей" },
                { number: "4.8/5", label: "Рейтинг" },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-linear-to-br from-blue-50 to-indigo-100 p-8 rounded-xl text-center"
                >
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </p>
                  <p className="text-gray-700 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-12">
              Наша команда
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Др. Иван Петров",
                  role: "Основатель, кардиолог",
                  image: "👨‍⚕️",
                },
                {
                  name: "Мария Сидорова",
                  role: "Директор образования, методист",
                  image: "👩‍⚕️",
                },
                {
                  name: "Алексей Смирнов",
                  role: "Технический директор",
                  image: "👨‍💻",
                },
              ].map((member, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-24 h-24 bg-linear-to-br from-blue-300 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">{member.image}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-gray-600">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Licenses */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              Лицензии и сертификации
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Badge variant="success">✓</Badge>
                <span className="text-gray-900">
                  Лицензия на образовательную деятельность
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Badge variant="success">✓</Badge>
                <span className="text-gray-900">
                  Признание Министерством здравоохранения
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Badge variant="success">✓</Badge>
                <span className="text-gray-900">
                  Система управления качеством ISO
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Badge variant="success">✓</Badge>
                <span className="text-gray-900">
                  Сертификация курсов международными стандартами
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Reviews */}

      </main>
      <Footer />
    </div>
  );
}
