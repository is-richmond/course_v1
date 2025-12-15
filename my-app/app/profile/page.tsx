"use client";

import React, { useState } from "react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Tabs } from "@/src/components/ui/Tabs";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { User, Mail, Phone, MapPin, Calendar, Award, Edit2, Download } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const tabItems = [
    {
      id: "profile",
      label: "Профиль",
      content: (
        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-6 pb-6 border-b border-gray-200">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              ИП
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Иван Петров</h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  {isEditing ? "Сохранить" : "Редактировать"}
                </Button>
              </div>
              <p className="text-gray-600 mb-4">Студент платформы MediCourse</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail size={16} className="text-gray-400" />
                  <span>ivan.petrov@example.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone size={16} className="text-gray-400" />
                  <span>+7 (999) 999-99-99</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={16} className="text-gray-400" />
                  <span>Казахстан, Алматы</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Член с декабря 2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">4</div>
                <p className="text-gray-600 text-sm">Активных курсов</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">2</div>
                <p className="text-gray-600 text-sm">Завершённых</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">2</div>
                <p className="text-gray-600 text-sm">Сертификатов</p>
              </CardContent>
            </Card>
          </div>

          {/* Bio */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">О себе</h3>
              {isEditing ? (
                <textarea
                  defaultValue="Врач-кардиолог с 10-летним опытом. Занимаюсь повышением квалификации и изучением новых методик в кардиологии."
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 resize-none"
                  rows={4}
                />
              ) : (
                <p className="text-gray-700">
                  Врач-кардиолог с 10-летним опытом. Занимаюсь повышением квалификации и
                  изучением новых методик в кардиологии.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "certificates",
      label: "Сертификаты",
      content: (
        <div className="p-6 space-y-4">
          {/* Certificate 1 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-lg flex items-center justify-center">
                    <Award size={32} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Кардиология для практикующих врачей</h3>
                    <p className="text-sm text-gray-600 mb-2">Выдан 15 ноября 2024</p>
                    <p className="text-xs text-gray-500">Учебный часов: 40</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <Download size={16} />
                  Скачать
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Certificate 2 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-lg flex items-center justify-center">
                    <Award size={32} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Основы скорой медицинской помощи</h3>
                    <p className="text-sm text-gray-600 mb-2">Выдан 10 октября 2024</p>
                    <p className="text-xs text-gray-500">Учебный часов: 32</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <Download size={16} />
                  Скачать
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "history",
      label: "История обучения",
      content: (
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {[
              { action: "Завершил курс", course: "Кардиология для практикующих врачей", date: "15 ноября 2024" },
              { action: "Начал курс", course: "Современная диагностика", date: "1 ноября 2024" },
              { action: "Завершил модуль", course: "Основы скорой медицинской помощи", date: "25 октября 2024" },
              { action: "Зарегистрировался на платформе", course: "", date: "20 октября 2024" },
            ].map((item, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.action}</p>
                      {item.course && <p className="text-sm text-gray-600">{item.course}</p>}
                    </div>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Tabs items={tabItems} defaultTab="profile" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
