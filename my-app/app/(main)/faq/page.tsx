"use client";

import React from "react";
import { Footer } from "@/src/components/layout/Footer";
import { Tabs } from "@/src/components/ui/Tabs";
import { FAQSection } from "@/src/components/sections/FAQSection";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";

// FAQ items - can be fetched from API later
const faqItems = [
  {
    question: "Как проходит обучение?",
    answer:
      "Обучение проходит в онлайн-формате. Вы получаете доступ к видеолекциям, материалам и тестам.",
  },
  {
    question: "Какой срок доступа к курсам?",
    answer:
      "Срок доступа: на  весь период прохождения программы.",
  },
];

export default function FAQPage() {
  const tabItems = [
    {
      id: "general",
      label: "Общие вопросы",
      content: (
        <div className="p-6">
          <FAQSection items={faqItems} />
        </div>
      ),
    },
    {
      id: "courses",
      label: "О курсах",
      content: (
        <div className="p-6 space-y-4">
          {[
            {
              q: "Какова длительность курсов?",
              a: "Уточняйте в описании программы или у ментора",
            },
            {
              q: "На кого рассчитаны курсы?",
              a: "Курсы рассчитаны на студентов мед. вузов, учащихся колледжей и практикующих специалистов.",
            },
            {
              q: "Какой формат у курсов?",
              a: "Онлайн на нашей платформе.",
            },
          ].map((item, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-700">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
    },
    {
      id: "payment",
      label: "Оплата и сертификаты",
      content: (
        <div className="p-6 space-y-4">
          {[
            {
              q: "Какие способы оплаты принимаются?",
              a: "Мы принимаем карты (Visa, Mastercard), переводы и платежи через популярные платёжные системы.",
            },
            {
              q: "Есть ли гарантия возврата денег?",
              a: "Да, мы предлагаем 14-дневную гарантию возврата денег, если вам не понравится курс.",
            },
          ].map((item, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-700">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header provided by ResponsiveLayout */}

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Часто задаваемые вопросы
            </h1>
            <p className="text-gray-600">
              Найдите ответы на популярные вопросы или свяжитесь с нашей
              поддержкой
            </p>
          </div>

          {/* Tabs */}
          <Tabs items={tabItems} defaultTab="general" />

          {/* Contact Section */}
          <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 256 256"
              className="mx-auto mb-4 text-blue-600"
            >
              <path
                fill="currentColor"
                d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-4-1.08,7.85,7.85,0,0,0-2.53.42L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Не нашли ответ?
            </h2>
            <p className="text-gray-700 mb-6">
              Наша команда поддержки готова помочь вам в любое время
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="primary">Написать в поддержку</Button>
              <Button variant="outline">Позвонить</Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
