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
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleWhatsAppContact = () => {
    // Открыть WhatsApp
    const message = `Здравствуйте! Я хочу записаться на курс "${courseTitle}" стоимостью ₸${price.toLocaleString(
      "ru-RU"
    )}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/77775934615?text=${encodedMessage}`, "_blank");
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="bg-linear-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Запись на курс
              </h2>
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
                  ₸{price.toLocaleString("ru-RU")}
                </div>
                <p className="text-gray-600 text-sm">
                  Для записи на курс свяжитесь с нами через WhatsApp. После
                  подтверждения оплаты администратор откроет вам доступ к
                  материалам.
                </p>
              </div>

              {/* WhatsApp Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 text-white fill-current"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-green-800">
                      Связаться через WhatsApp
                    </p>
                    <p className="text-sm text-green-600">+7 707 593 46 15</p>
                  </div>
                </div>
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
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleWhatsAppContact}
                >
                  Написать в WhatsApp
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                🔒 Мы отвечаем в течение 15 минут в рабочее время
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
                Заявка отправлена!
              </h3>
              <p className="text-gray-600 mb-6">
                Наши менеджеры свяжутся с вами в WhatsApp в течение 15 минут.
                После подтверждения оплаты администратор откроет доступ к курсу.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-900">
                  ✓ Доступ ко всем материалам курса
                </p>
                <p className="text-sm text-blue-900">
                  ✓ Сертификат по завершении
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={onPay}
              >
                Закрыть
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
