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
        {/* <Button
          size="lg"
          variant="primary"
          className="w-full sm:w-auto min-h-[48px]"
        >
          Посмотреть курсы
        </Button> */}
        <Button
          size="lg"
          variant="outline"
          className="w-full sm:w-auto min-h-[48px]"
          onClick={() => {
            window.open(
              'https://wa.me/77075934615?text=' + encodeURIComponent('Здравствуйте! Хочу узнать больше о ваших курсах'),
              '_blank',
              'noopener,noreferrer'
            );
          }}
        >
          <svg 
            className="w-5 h-5 mr-2" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
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
