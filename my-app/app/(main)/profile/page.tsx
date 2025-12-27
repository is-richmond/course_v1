"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/src/components/layout/Footer";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { useAuth } from "@/src/contexts/AuthContext";
import { Mail, Phone, Calendar, Award, Lock, BookOpen } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <>
        {/* Header provided by ResponsiveLayout */}
        <div className="min-h-[calc(100vh-300px)] flex items-center justify-center">
          <div className="text-gray-600">Загрузка...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        {/* Header provided by ResponsiveLayout */}
        <div className="min-h-[calc(100vh-300px)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Требуется авторизация</p>
            <Button onClick={() => router.push("/auth/login")}>
              Перейти к входу
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <>
      {/* Header provided by ResponsiveLayout */}
      <div className="min-h-[calc(100vh-300px)] bg-gray-50">
        {/* Gradient Header Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-8 md:py-12">
          <div className="max-w-4xl mx-auto px-3 sm:px-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              {/* Avatar with shadow */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shrink-0 shadow-lg ring-4 ring-white">
                {getInitials(user.first_name, user.last_name)}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {user.first_name} {user.last_name}
                </h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {user.is_superuser ? (
                    <>
                      <Award size={14} />
                      Администратор
                    </>
                  ) : (
                    <>
                      <BookOpen size={14} />
                      Студент
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 -mt-4">
          {/* Info Card */}
          <Card className="mb-4 sm:mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {/* Email */}
                <div className="flex items-center gap-4 p-4 sm:p-5 border-b sm:border-r border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={20} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 mb-0.5">
                      Email
                    </p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 p-4 sm:p-5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 mb-0.5">
                      Телефон
                    </p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {user.phone_number || "Не указан"}
                    </p>
                  </div>
                </div>

                {/* Registration Date */}
                <div className="flex items-center gap-4 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar size={20} className="text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 mb-0.5">
                      Зарегистрирован
                    </p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {new Date(user.created_at).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Courses */}
                <div className="flex items-center gap-4 p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <Award size={20} className="text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 mb-0.5">
                      Курсы
                    </p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {user.enrolled_courses?.length || 0} записано
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Link href="/auth/change-password" className="w-full group">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 h-full border-2 border-transparent hover:border-blue-200">
                <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Lock size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-0.5 text-sm sm:text-base">
                      Смена пароля
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Обновите пароль для безопасности
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/my-courses" className="w-full group">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 h-full border-2 border-transparent hover:border-green-200">
                <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-0.5 text-sm sm:text-base">
                      Мои курсы
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {user.enrolled_courses?.length || 0} активных курсов
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
