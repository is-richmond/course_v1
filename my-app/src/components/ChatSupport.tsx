"use client";

import React from "react";
import { MessageCircle, X } from "lucide-react";

export const ChatSupport: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center hover:scale-110 z-40"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <MessageCircle size={24} />
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-xl z-40 flex flex-col">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-bold">Служба поддержки</h3>
            <p className="text-sm text-blue-100">Мы онлайн сейчас</p>
          </div>

          <div className="flex-1 p-4 bg-gray-50 h-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-700 mb-4">Здравствуйте! 👋</p>
              <p className="text-sm text-gray-600">
                Есть вопросы? Напишите нам, мы ответим в течение 5 минут
              </p>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <input
              type="text"
              placeholder="Ваше сообщение..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </>
  );
};
