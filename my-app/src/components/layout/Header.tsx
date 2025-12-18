"use client";

import React, { useState, useEffect } from "react";
import { Settings, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-30">
        <div className="px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/plexus-logo.png"
              alt="Plexus"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="font-bold text-gray-900 text-sm sm:text-base">
              Plexus
            </span>
          </Link>
          <div className="text-gray-600 text-xs sm:text-sm">Загрузка...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-30">
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between">
        {/* Left Section - Logo & Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <Image
            src="/plexus-logo.png"
            alt="Plexus"
            width={24}
            height={24}
            className="w-6 h-6 sm:w-7 sm:h-7"
          />
          <span className="font-bold text-gray-900 text-sm sm:text-base">
            Plexus
          </span>
        </Link>

        {/* Right Section - User Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Settings - hidden on very small screens */}
          <Link href="/profile" className="hidden sm:block">
            <button
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition"
              aria-label="Настройки профиля"
            >
              <Settings size={16} />
            </button>
          </Link>

          {/* User Avatar / Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 sm:pl-3 sm:border-l border-gray-200 hover:bg-gray-50 py-1 px-1.5 rounded-md transition"
              aria-expanded={showDropdown}
              aria-haspopup="true"
            >
              {/* User info - hidden on mobile, shown on sm+ */}
              <div className="text-right hidden sm:block">
                <p className="font-medium text-gray-900 text-xs">
                  {user?.first_name || "Пользователь"}
                </p>
                <p className="text-[10px] text-gray-500">
                  {user?.is_superuser ? "Админ" : "Студент"}
                </p>
              </div>
              {/* Avatar - always visible */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                {getInitials(user?.first_name, user?.last_name)}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                {/* Backdrop for closing on mobile */}
                <div
                  className="fixed inset-0 z-40 sm:hidden"
                  onClick={() => setShowDropdown(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-medium text-xs text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                    >
                      <button className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 transition flex items-center gap-2">
                        <Settings size={14} />
                        Профиль
                      </button>
                    </Link>

                    <Link
                      href="/auth/change-password"
                      onClick={() => setShowDropdown(false)}
                    >
                      <button className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 transition flex items-center gap-2">
                        <Settings size={14} />
                        Смена пароля
                      </button>
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Выход
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
