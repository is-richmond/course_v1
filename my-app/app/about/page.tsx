import React from "react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { ReviewsSection } from "@/src/components/sections/ReviewsSection";
import { reviews } from "@/src/data/courses";
import { Award, Users, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-white">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              О нас
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              MediCourse — платформа профессионального развития медицинских работников. Мы создаем высококачественные онлайн-курсы с экспертами в сфере здравоохранения.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Mission */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Наша миссия</h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Мы верим, что качественное образование — это ключ к профессиональному развитию. Наша миссия — предоставить доступные, практические и актуальные курсы повышения квалификации для медицинских работников.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Каждый курс разработан практикующими специалистами и обновляется в соответствии с последними медицинскими стандартами.
            </p>
          </section>

          {/* Values */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-12">Наши ценности</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <Award className="text-blue-600 mb-4" size={32} />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Качество</h3>
                  <p className="text-gray-700">
                    Все курсы разработаны экспертами с многолетним опытом практической работы в медицине.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Users className="text-blue-600 mb-4" size={32} />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Доступность</h3>
                  <p className="text-gray-700">
                    Гибкое расписание обучения, доступные цены и возможность учиться в удобном темпе.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Zap className="text-blue-600 mb-4" size={32} />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Практичность</h3>
                  <p className="text-gray-700">
                    Знания, которые можно сразу применить на практике в своей работе.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Stats */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-12">Наши достижения</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { number: "1000+", label: "Студентов" },
                { number: "15+", label: "Курсов" },
                { number: "50+", label: "Преподавателей" },
                { number: "4.8/5", label: "Рейтинг" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-linear-to-br from-blue-50 to-indigo-100 p-8 rounded-xl text-center">
                  <p className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</p>
                  <p className="text-gray-700 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-12">Наша команда</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Др. Иван Петров", role: "Основатель, кардиолог", image: "👨‍⚕️" },
                { name: "Мария Сидорова", role: "Директор образования, методист", image: "👩‍⚕️" },
                { name: "Алексей Смирнов", role: "Технический директор", image: "👨‍💻" }
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
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Лицензии и сертификации</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Badge variant="success">✓</Badge>
                <span className="text-gray-900">Лицензия на образовательную деятельность</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Badge variant="success">✓</Badge>
                <span className="text-gray-900">Признание Министерством здравоохранения</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Badge variant="success">✓</Badge>
                <span className="text-gray-900">Система управления качеством ISO</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Badge variant="success">✓</Badge>
                <span className="text-gray-900">Сертификация курсов международными стандартами</span>
              </div>
            </div>
          </section>
        </div>

        {/* Reviews */}
        <ReviewsSection reviews={reviews} />
      </main>
      <Footer />
    </div>
  );
}
