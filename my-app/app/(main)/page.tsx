"use client";

import { Footer } from "@/src/components/layout/Footer";
import { HeroSection } from "@/src/components/sections/HeroSection";
import { ReviewsSection } from "@/src/components/sections/ReviewsSection";
import { FAQSection } from "@/src/components/sections/FAQSection";
import dynamic from "next/dynamic";

// FAQ items - can be fetched from API later
const faqItems = [
  {
    question: "Что такое Plexus?",
    answer:
      "Plexus — это единая образовательная платформа для подготовки к НЦНЭ, созданная студентами и врачами для студентов медицинских вузов.",
  },
  {
    question: "Чем отличаются видео-уроки Plexus?",
    answer:
      "Мы не читаем конспекты и не пересказываем учебники. Наши видео:объясняют логику процессов а не набор фактов,показывают как именно темы выглядят в тестах НЦНЭ, наполнены схемами, таблицами, клиническими связками и примерами. После каждого видео ты сразу проверяешь понимание, а не «откладываешь повтор на потом».",
  },
  {
    question: "Есть ли гарантия результата?",
    answer:
      "Да. Мы уверены в продукте и даём гарантию минимального результата при соблюдении условий обучения.",
  },
  {
    question: "Как связаться с командой Plexus?",
    answer:
      "Ты всегда можешь: написать в онлайн-чат в WhatsApp: +7 777 593 4615, связаться с поддержкой по электронной почте: info@plexus.kz, задать вопрос напрямую команде: Артём: +7 707 593 4615, Романас: +7 778 436 2029. Мы реально отвечаем, а не прячемся за формальными автоответами.",
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
