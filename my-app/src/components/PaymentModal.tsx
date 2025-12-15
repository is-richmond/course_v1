"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

interface PaymentModalProps {
  isOpen: boolean;
  courseTitle: string;
  price: number;
  onPay: () => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  courseTitle,
  price,
  onPay,
  onClose,
}) => {
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "whatsapp">("card");

  if (!isOpen) return null;

  const handlePayment = () => {
    if (paymentMethod === "whatsapp") {
      // Открыть WhatsApp
      const message = `Здравствуйте! Я хочу записаться на курс "${courseTitle}" стоимостью ₽${price.toLocaleString("ru-RU")}`;
      const encodedMessage = encodeURIComponent(message);
      window.open(
        `https://wa.me/79999999999?text=${encodedMessage}`,
        "_blank"
      );
    }
    setIsPaid(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {!isPaid ? (
          <>
            {/* Header */}
            <div className="bg-linear-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Оплата курса</h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {courseTitle}
                </h3>
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  T{price.toLocaleString("ru-RU")}
                </div>
                <p className="text-gray-600 text-sm">
                  После оплаты вы получите полный доступ ко всем материалам
                  курса и сертификат по завершении.
                </p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 mb-8">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition"
                  style={{borderColor: paymentMethod === "card" ? "#2563EB" : undefined}}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value as "card")}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 font-medium text-gray-900">
                    Карта (Visa, Mastercard)
                  </span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition"
                  style={{borderColor: paymentMethod === "whatsapp" ? "#2563EB" : undefined}}>
                  <input
                    type="radio"
                    name="payment"
                    value="whatsapp"
                    checked={paymentMethod === "whatsapp"}
                    onChange={(e) => setPaymentMethod(e.target.value as "whatsapp")}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 font-medium text-gray-900">
                    WhatsApp (+7 999 999-99-99)
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={onClose}
                >
                  Отмена
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={handlePayment}
                >
                  {paymentMethod === "whatsapp" ? "Написать в WhatsApp" : "Оплатить"}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                🔒 Ваши данные защищены и не передаются третьим лицам
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Спасибо за заказ!
              </h3>
              <p className="text-gray-600 mb-6">
                {paymentMethod === "whatsapp"
                  ? "Наши менеджеры свяжутся с вами в WhatsApp в течение 15 минут"
                  : "Платеж успешно обработан. Вы получили доступ к курсу!"}
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-900">
                  ✓ Доступ ко всем материалам курса
                </p>
                <p className="text-sm text-blue-900">
                  ✓ Сертификат по завершении
                </p>
                <p className="text-sm text-blue-900">
                  ✓ Пожизненный доступ
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={onPay}
              >
                Начать учиться
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
