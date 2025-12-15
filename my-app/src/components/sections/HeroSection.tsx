import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export const HeroSection: React.FC = () => (
  <section className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
    <div className="max-w-6xl mx-auto px-6 py-20 text-center">
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
        Медицинские курсы для врачей и студентов
      </h1>
      <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
        Повысьте квалификацию с помощью практических онлайн-курсов от экспертов медицины. Получите сертификат и применяйте знания сразу же на практике.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Button size="lg" variant="primary">
          Посмотреть курсы
        </Button>
        <Button size="lg" variant="outline">
          Узнать больше
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
        {[
          { icon: "✓", title: "Сертификация", desc: "Официальные сертификаты признаны в сфере здравоохранения" },
          { icon: "✓", title: "Практики", desc: "Преподаватели с 15+ годами опыта работают с реальными пациентами" },
          { icon: "✓", title: "Доступ навсегда", desc: "Учитесь в удобном темпе с пожизненным доступом к материалам" }
        ].map((benefit, idx) => (
          <div key={idx} className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4 text-blue-600">{benefit.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
            <p className="text-gray-700">{benefit.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
