"use client";

import React, { useState, useEffect } from "react";
import { Settings, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useSidebar } from "./ResponsiveLayout";

interface HeaderProps {
  showUserMenu?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showUserMenu = true }) => {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Try to get sidebar context - will be null if not in ResponsiveLayout
  let sidebarContext: { toggle: () => void } | null = null;
  try {
    sidebarContext = useSidebar();
  } catch {
    // Not wrapped in ResponsiveLayout context
  }

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

  // Hamburger button component - integrated into the header
  const HamburgerButton = () => (
    <button
      onClick={() => sidebarContext?.toggle()}
      className="lg:hidden p-2 -ml-2 mr-1 text-white hover:bg-white/10 rounded-lg transition-colors"
      aria-label="Открыть меню"
    >
      <Menu size={22} />
    </button>
  );

  if (isLoading || !mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 bg-[#122240] border-b border-[#0f2438] shadow-sm z-30">
        <div className="px-3 sm:px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            {/* Hamburger placeholder for layout consistency - only for authenticated */}
            {showUserMenu && <div className="lg:hidden w-10 h-10 mr-1" />}
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo1.png"
                alt="Plexus"
                width={48}
                height={48}
                className="w-10 h-10"
              />
              <span className="font-bold text-white text-base">Plexus</span>
            </Link>
          </div>
          <div className="text-gray-200 text-xs sm:text-sm">Загрузка...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#122240] border-b border-[#0f2438] shadow-sm z-30">
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between">
        {/* Left Section - Hamburger, Logo & Brand */}
        <div className="flex items-center">
          {/* Hamburger Menu - mobile only, only for authenticated users */}
          {showUserMenu && sidebarContext && <HamburgerButton />}

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition"
          >
            <Image
              src="/logo1.png"
              alt="Plexus"
              width={48}
              height={48}
              className="w-10 h-10 sm:w-10 sm:h-10"
            />
            <span className="font-bold text-white text-base sm:text-lg tracking-tight">
              Plexus
            </span>
          </Link>
        </div>

        {/* Right Section - User Controls OR Guest Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {showUserMenu ? (
            <>
              {/* Settings - hidden on very small screens */}
              <Link href="/profile" className="hidden sm:block">
                <button
                  className="p-2 text-white/90 hover:bg-white/10 rounded-lg transition"
                  aria-label="Настройки профиля"
                >
                  <Settings size={18} />
                </button>
              </Link>

              {/* User Avatar / Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 sm:pl-3 sm:border-l border-white/10 hover:bg-white/5 py-1.5 px-2 rounded-lg transition"
                  aria-expanded={showDropdown}
                  aria-haspopup="true"
                >
                  {/* User info - hidden on mobile, shown on sm+ */}
                  <div className="text-right hidden sm:block">
                    <p className="font-medium text-white text-sm">
                      {user?.first_name || "Пользователь"}
                    </p>
                    <p className="text-xs text-white/80">
                      {user?.is_superuser ? "Админ" : "Студент"}
                    </p>
                  </div>
                  {/* Avatar - always visible */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-linear-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {getInitials(user?.first_name, user?.last_name)}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop for closing on mobile */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDropdown(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info Section */}
                      <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {getInitials(user?.first_name, user?.last_name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setShowDropdown(false)}
                        >
                          <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-3">
                            <Settings size={16} className="text-gray-400" />
                            Профиль
                          </button>
                        </Link>

                        <Link
                          href="/auth/change-password"
                          onClick={() => setShowDropdown(false)}
                        >
                          <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 256 256"
                              className="text-gray-400"
                            >
                              <path
                                fill="currentColor"
                                d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-80-36a12,12,0,1,1,12-12A12,12,0,0,1,128,172Z"
                              />
                            </svg>
                            Смена пароля
                          </button>
                        </Link>
                      </div>

                      {/* Logout Section */}
                      <div className="border-t border-gray-100 p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-3 font-medium"
                        >
                          <LogOut size={16} />
                          Выход
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            // GUEST BUTTONS
            <>
              <button
                onClick={() => router.push("/auth/login")}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                Войти
              </button>
              <button
                onClick={() => router.push("/auth/register")}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-white bg-gradient-to-r from-[#83B4FF] to-[#1468C2] hover:from-[#6AA1FF] hover:to-[#1257A6] rounded-lg shadow-md hover:shadow-lg transition"
              >
                Регистрация
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};