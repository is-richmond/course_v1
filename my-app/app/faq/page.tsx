"use client";

import React from "react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Tabs } from "@/src/components/ui/Tabs";
import { FAQSection } from "@/src/components/sections/FAQSection";
import { faqItems } from "@/src/data/courses";
import { HelpCircle, MessageCircle, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";

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
              a: "Курсы варьируются от 4 до 8 недель в зависимости от уровня сложности. Вы можете учиться в собственном темпе с пожизненным доступом.",
            },
            {
              q: "Нужны ли предварительные знания?",
              a: "Для курсов уровня 'Начинающий' не требуются предварительные знания. Для промежуточных и продвинутых курсов рекомендуется базовое понимание медицинских концепций.",
            },
            {
              q: "Какой формат у курсов?",
              a: "Мы предлагаем онлайн, офлайн и гибридные формы обучения. Выберите то, что подходит вам лучше всего.",
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
              q: "Как получить сертификат?",
              a: "После завершения всех модулей курса и успешного прохождения итогового тестирования вы получите электронный сертификат.",
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
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Часто задаваемые вопросы</h1>
            <p className="text-gray-600">Найдите ответы на популярные вопросы или свяжитесь с нашей поддержкой</p>
          </div>

          {/* Tabs */}
          <Tabs items={tabItems} defaultTab="general" />

          {/* Contact Section */}
          <div className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 text-center">
            <MessageCircle size={48} className="mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Не нашли ответ?</h2>
            <p className="text-gray-700 mb-6">Наша команда поддержки готова помочь вам в любое время</p>
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
