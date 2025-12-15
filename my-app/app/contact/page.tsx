import React from "react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-100 py-16">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Свяжитесь с нами
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Есть вопросы? Хотите узнать больше о наших курсах? Мы здесь для вас!
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Форма обратной связи
              </h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Иван Петров"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ivan@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+7 (999) 999-99-99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тема
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Выберите тему</option>
                    <option>Информация о курсе</option>
                    <option>Техническая поддержка</option>
                    <option>Партнерство</option>
                    <option>Другое</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сообщение
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ваше сообщение..."
                  />
                </div>

                <Button size="lg" variant="primary" className="w-full">
                  Отправить
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Информация для связи
              </h2>

              <div className="space-y-6 mb-12">
                {/* Phone */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Phone className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Телефон</h3>
                        <p className="text-gray-700 mb-2">+7 (999) 999-99-99</p>
                        <p className="text-gray-600 text-sm">
                          Пн-пт: 9:00-18:00 МСК
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Mail className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                        <p className="text-gray-700">hello@medicourse.ru</p>
                        <p className="text-gray-600 text-sm mt-2">
                          Ответим в течение 24 часов
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Адрес</h3>
                        <p className="text-gray-700">
                          Казахстан, Алматы
                          <br />
                          ул.Медицинская
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Working Hours */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Clock className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Режим работы</h3>
                        <p className="text-gray-700">
                          Пн-пт: 9:00-18:00
                          <br />
                          Сб-вс: выходной
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Social */}
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Следите за нами
              </h3>
              <div className="space-y-3 mb-8">
                <a href="#" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <MessageCircle className="text-blue-600" size={20} />
                  <span className="text-gray-700">WhatsApp: +7 (999) 999-99-99</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <MessageCircle className="text-blue-400" size={20} />
                  <span className="text-gray-700">Telegram: @medicourse</span>
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 pt-20 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Часто задаваемые вопросы
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  q: "Как я могу получить информацию о конкретном курсе?",
                  a: "Напишите нам на hello@medicourse.ru или позвоните по телефону. Наши специалисты предоставят полную информацию."
                },
                {
                  q: "Какой способ оплаты вы принимаете?",
                  a: "Мы принимаем карты Visa, MasterCard, яндекс.касса и банковские переводы."
                },
                {
                  q: "Есть ли скидки для групп?",
                  a: "Да! Для групп от 5 человек предусмотрены специальные скидки. Свяжитесь с нами для уточнения."
                },
                {
                  q: "Могу ли я получить отсрочку платежа?",
                  a: "Возможны варианты рассрочки. Обсудите детали с нашей командой через форму обратной связи."
                }
              ].map((item, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-3">{item.q}</h4>
                  <p className="text-gray-700">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
