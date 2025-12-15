"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Search,
  User,
  BarChart3,
  HelpCircle,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
  isActive?: boolean;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["courses"]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const navItems: NavItem[] = [
    {
      label: "Главная",
      href: "/",
      icon: <Home size={20} />,
    },
    {
      label: "Мои курсы",
      href: "/my-courses",
      icon: <BookOpen size={20} />,
    },
    {
      label: "Все курсы",
      icon: <BarChart3 size={20} />,
      children: [
        { label: "Каталог курсов", href: "/#courses" },
        { label: "Избранные", href: "/favorites" },
        { label: "Рекомендуемые", href: "/recommended" },
      ],
    },
    {
      label: "Поиск",
      href: "/search",
      icon: <Search size={20} />,
    },
    {
      label: "Профиль",
      icon: <User size={20} />,
      children: [
        { label: "Мой профиль", href: "/profile" },
        { label: "Мои сертификаты", href: "/certificates" },
        { label: "История", href: "/history" },
      ],
    },
    {
      label: "Помощь",
      icon: <HelpCircle size={20} />,
      children: [
        { label: "FAQ", href: "/faq" },
        { label: "Контакты", href: "/contact" },
        { label: "О платформе", href: "/about" },
      ],
    },
  ];

  const isActive = (href?: string) => href && pathname === href;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl z-40 overflow-y-auto">
      {/* Logo */}
      <div className="sticky top-0 bg-blue-950 bg-opacity-60 backdrop-blur px-6 py-6 border-b border-blue-700">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-blue-900 font-bold text-lg">M</span>
          </div>
          <div>
            <div className="font-bold text-lg">MediCourse</div>
            <div className="text-xs text-blue-300">Обучение</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-6 space-y-1">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.href ? (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "text-blue-100 hover:bg-blue-700 hover:bg-opacity-60"
                }`}
              >
                {item.icon}
                <span className="font-semibold">{item.label}</span>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-blue-100 hover:bg-blue-700 hover:bg-opacity-60 hover:text-white"
                >
                  {item.icon}
                  <span className="font-semibold flex-1 text-left">{item.label}</span>
                  {item.children && (
                    <div
                      className={`transition-transform duration-300 ${
                        expandedItems.includes(item.label) ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown size={16} />
                    </div>
                  )}
                </button>

                {/* Submenu */}
                {item.children && expandedItems.includes(item.label) && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-500">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href || "#"}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                          isActive(child.href)
                            ? "bg-blue-600 text-white shadow-md translate-x-1"
                            : "text-blue-200 hover:text-white hover:bg-blue-700 hover:bg-opacity-50"
                        }`}
                      >
                        <ChevronRight size={14} />
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-950 to-blue-900 border-t border-blue-700 px-3 py-4 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-lg">
          <Settings size={20} />
          <span className="font-semibold">Настройки</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-lg">
          <LogOut size={20} />
          <span className="font-semibold">Выход</span>
        </button>
      </div>
    </aside>
  );
};
