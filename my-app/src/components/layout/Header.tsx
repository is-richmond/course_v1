"use client";

import React, { useState, useEffect } from "react";
import { Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "next/navigation";

export const Header: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (isLoading || !mounted) {
    return (
      <header className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-30">
        <div className="px-6 py-4 flex items-center justify-end">
          <div className="text-gray-600">Загрузка...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-30">
      <div className="px-6 py-4 flex items-center justify-end">
        {/* Right Section - User Controls */}
        <div className="flex items-center gap-6">
          {/* Settings */}
          <Link href="/profile">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <Settings size={20} />
            </button>
          </Link>

          {/* User Avatar / Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 pl-6 border-l border-gray-200 hover:bg-gray-50 py-2 px-2 rounded-lg transition"
            >
              <div className="text-right">
                <p className="font-medium text-gray-900 text-sm">
                  {user?.first_name || "Пользователь"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.is_superuser ? "Администратор" : "Студент"}
                </p>
              </div>
              <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {getInitials(user?.first_name, user?.last_name)}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-100">
                  <p className="font-medium text-sm text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <div className="py-2">
                  <Link href="/profile">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-2">
                      <Settings size={16} />
                      Профиль
                    </button>
                  </Link>

                  <Link href="/auth/change-password">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-2">
                      <Settings size={16} />
                      Смена пароля
                    </button>
                  </Link>
                </div>

                <div className="border-t border-gray-100 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Выход
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
