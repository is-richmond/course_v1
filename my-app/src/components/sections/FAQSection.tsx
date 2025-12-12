"use client";

import React, { useState } from "react";
import { Accordion } from "@/src/components/ui/Accordion";
import { FAQItem } from "@/src/types";

interface FAQSectionProps {
  items: FAQItem[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ items }) => (
  <section className="py-20 bg-white">
    <div className="max-w-4xl mx-auto px-6">
      <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
        Часто задаваемые вопросы
      </h2>
      <p className="text-gray-600 text-center mb-12">
        Найдите ответы на самые популярные вопросы о наших курсах
      </p>

      <Accordion
        items={items.map((item) => ({
          title: item.question,
          content: <p className="text-gray-700 leading-relaxed">{item.answer}</p>,
          defaultOpen: false
        }))}
      />
    </div>
  </section>
);
