"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Label } from "@/src/components/ui/Label";
import { Card, CardContent } from "@/src/components/ui/Card";
import { useAuth } from "@/src/contexts/AuthContext";
import { User, Mail, Phone, MapPin, Calendar, Award, Edit2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone_number: user?.phone_number || "",
  });

  if (isLoading) {
    return (
      <>
        <Header />
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
        <Header />
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
      });
      setMessage({ type: "success", text: "Профиль успешно обновлен" });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-300px)] bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="mb-6">
            <CardContent>
              <div className="p-6 space-y-6">
                {/* Profile Header */}
                <div className="flex items-start gap-6 pb-6 border-b border-gray-200">
                  <div className="w-24 h-24 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {getInitials(user.first_name, user.last_name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {user.first_name} {user.last_name}
                      </h2>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (isEditing) {
                            handleSave();
                          } else {
                            setIsEditing(true);
                          }
                        }}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          <>
                            <Edit2 size={16} />
                            {isEditing ? "Сохранить" : "Редактировать"}
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {user.is_superuser ? "Администратор" : "Студент"} платформы MediCourse
                    </p>

                    {message && (
                      <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                        message.type === "success"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}>
                        {message.type === "success" ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <AlertCircle size={16} />
                        )}
                        {message.text}
                      </div>
                    )}

                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="first_name" className="text-sm">
                              Имя
                            </Label>
                            <Input
                              id="first_name"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleChange}
                              disabled={isSaving}
                            />
                          </div>
                          <div>
                            <Label htmlFor="last_name" className="text-sm">
                              Фамилия
                            </Label>
                            <Input
                              id="last_name"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleChange}
                              disabled={isSaving}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="phone_number" className="text-sm">
                            Номер телефона
                          </Label>
                          <Input
                            id="phone_number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setIsEditing(false)}
                            disabled={isSaving}
                            variant="outline"
                          >
                            Отменить
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail size={16} className="text-gray-400" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone size={16} className="text-gray-400" />
                          <span>{user.phone_number || "Не указан"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar size={16} className="text-gray-400" />
                          <span>
                            Зарегистрирован:
                            {new Date(user.created_at).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Award size={16} className="text-gray-400" />
                          <span>
                            {user.enrolled_courses?.length || 0} курсов записано
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Links */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
            <Link href="/auth/change-password" className="w-full">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Смена пароля</h3>
                  <p className="text-sm text-gray-600">Обновите пароль для большей безопасности</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/my-courses" className="w-full">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Мои курсы</h3>
                  <p className="text-sm text-gray-600">
                    {user.enrolled_courses?.length || 0} активных курсов
                  </p>
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
