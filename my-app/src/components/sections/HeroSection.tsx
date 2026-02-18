import React from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export const HeroSection: React.FC = () => (
  <section className="relative min-h-screen">
    {/* Background image (Next/Image) */}
    <Image
      src="/backgr1.jpg"              // положите файл public/hero-bg.jpg
      alt="Лекарства и обучение"     // важный alt для доступности
      fill                           // занять весь блок (требует position:relative у родителя)
      className="object-cover object-center"
      priority                       // загрузить быстро
    />

    {/* Overlay — затемняет фон для контраста текста */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#122240]/70 to-[#0f3050]/40" />

    {/* Контент поверх фона */}
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
        Медицинские курсы для врачей и студентов
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
        Повысьте квалификацию с помощью практических онлайн-курсов от экспертов
        медицины. Получите сертификат и применяйте знания сразу же на практике.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4 sm:px-0">
        <Button
          className="
            w-full max-w-[461px]
            h-[64px] sm:h-[107px]
            bg-transparent
            border-[4px] sm:border-[8px] border-white
            rounded-[32px] sm:rounded-[50px]
            text-white text-base sm:text-lg
            hover:bg-white/10
            transition
          "
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16 md:mt-20">
        {[
          {
            src: "/11.png",
            alt: "Сертификация",
            title: "Сертификация",
            desc: "Официальные сертификаты признаны в сфере здравоохранения",
          },
          {
            src: "/22.png",
            alt: "Практики",
            title: "Практики",
            desc: "Преподаватели с 15+ годами опыта работают с реальными пациентами",
          },
          {
            src: "/44.png",
            alt: "Доступ навсегда",
            title: "Доступ навсегда",
            desc: "Учитесь в удобном темпе",
          },
        ].map((benefit, idx) => (
          <div
            key={idx}
            className="bg-white p-6 sm:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center"
          >
            {/* Фото вместо иконки */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-lg overflow-hidden">
              <Image
                src={benefit.src}
                alt={benefit.alt}
                width={96}      // указываем реальные размеры для оптимизации next/image
                height={96}
                className="object-cover w-full h-full"
                priority={false}
              />
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