import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export const HeroSection: React.FC = () => (
  <section className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
    {/* Responsive container with adaptive padding */}
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
      {/* Responsive typography: mobile → tablet → desktop */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
        Медицинские курсы для врачей и студентов
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
        Повысьте квалификацию с помощью практических онлайн-курсов от экспертов
        медицины. Получите сертификат и применяйте знания сразу же на практике.
      </p>

      {/* Responsive button layout: stack on mobile, row on sm+ */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4 sm:px-0">
        <Button
          size="lg"
          variant="primary"
          className="w-full sm:w-auto min-h-[48px]"
        >
          Посмотреть курсы
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full sm:w-auto min-h-[48px]"
        >
          Узнать больше
        </Button>
      </div>

      {/* Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16 md:mt-20">
        {[
          {
            icon: "✓",
            title: "Сертификация",
            desc: "Официальные сертификаты признаны в сфере здравоохранения",
          },
          {
            icon: "✓",
            title: "Практики",
            desc: "Преподаватели с 15+ годами опыта работают с реальными пациентами",
          },
          {
            icon: "✓",
            title: "Доступ навсегда",
            desc: "Учитесь в удобном темпе с пожизненным доступом к материалам",
          },
        ].map((benefit, idx) => (
          <div
            key={idx}
            className="bg-white p-6 sm:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-blue-600">
              {benefit.icon}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              {benefit.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-700">{benefit.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
