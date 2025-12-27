"use client";

import { Footer } from "@/src/components/layout/Footer";
import { HeroSection } from "@/src/components/sections/HeroSection";
import { ReviewsSection } from "@/src/components/sections/ReviewsSection";
import { FAQSection } from "@/src/components/sections/FAQSection";
import dynamic from "next/dynamic";

// FAQ items - can be fetched from API later
const faqItems = [
  {
    question: "Как проходит обучение?",
    answer:
      "Обучение проходит в онлайн-формате. Вы получаете доступ к видеолекциям, материалам и тестам. Можете учиться в удобное время.",
  },
  {
    question: "Какой срок доступа к курсам?",
    answer:
      "После покупки курса вы получаете бессрочный доступ ко всем материалам курса.",
  },
  {
    question: "Выдаётся ли сертификат?",
    answer:
      "Да, после успешного прохождения курса вы получаете сертификат, подтверждающий ваши знания.",
  },
  {
    question: "Можно ли вернуть деньги?",
    answer:
      "Да, вы можете вернуть деньги в течение 14 дней после покупки, если прошли менее 30% курса.",
  },
];

// Reviews - can be fetched from API later
const reviews = [
  {
    id: "1",
    name: "Анна К.",
    title: "Студент",
    text: "Отличный курс! Много практических заданий и понятные объяснения.",
    rating: 5,
  },
  {
    id: "2",
    name: "Михаил С.",
    title: "Врач",
    text: "Рекомендую всем, кто хочет углубить свои знания в медицине.",
    rating: 5,
  },
  {
    id: "3",
    name: "Елена В.",
    title: "Студент",
    text: "Качественный материал, удобная платформа, отзывчивая поддержка.",
    rating: 4,
  },
];

const HomeContent = dynamic(
  () => import("@/src/components/sections/HomeContent"),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header is provided by ResponsiveLayout - no need to render here */}
      <main className="flex-1">
        <HomeContent
          heroComponent={<HeroSection />}
          reviewsComponent={<ReviewsSection reviews={reviews} />}
          faqComponent={<FAQSection items={faqItems} />}
        />
      </main>
      <Footer />
    </div>
  );
}
