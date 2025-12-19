"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onClose) {
      onClose();
    }
  }, [pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  // Navigation items for authenticated users
  const authNavItems: NavItem[] = [
    {
      label: "Главная",
      href: "/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 256 256"
        >
          <path
            fill="currentColor"
            d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48a16,16,0,0,1,21.66,0l80,75.48A16,16,0,0,1,224,115.55Z"
          />
        </svg>
      ),
    },
    {
      label: "Все курсы",
      href: "/my-courses",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 256 256"
        >
          <path
            fill="currentColor"
            d="M232,64H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48V64H24A8,8,0,0,0,16,72V200a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V72A8,8,0,0,0,232,64ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V64H96ZM224,200H32V80H224Z"
          />
        </svg>
      ),
    },
    {
      label: "Тесты",
      href: "/tests",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 256 256"
        >
          <path
            fill="currentColor"
            d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
          />
        </svg>
      ),
    },
    {
      label: "Профиль",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 256 256"
        >
          <path
            fill="currentColor"
            d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"
          />
        </svg>
      ),
      children: [
        { label: "Мой профиль", href: "/profile" },
        { label: "Смена пароля", href: "/auth/change-password" },
      ],
    },
    {
      label: "Помощь",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 256 256"
        >
          <path
            fill="currentColor"
            d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
          />
        </svg>
      ),
      children: [
        { label: "FAQ", href: "/faq" },
        { label: "О платформе", href: "/about" },
      ],
    },
  ];

  // Navigation items for non-authenticated users
  const guestNavItems: NavItem[] = [
    {
      label: "Главная",
      href: "/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 256 256"
        >
          <path
            fill="currentColor"
            d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48a16,16,0,0,1,21.66,0l80,75.48A16,16,0,0,1,224,115.55Z"
          />
        </svg>
      ),
    },
    {
      label: "О платформе",
      href: "/about",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 256 256"
        >
          <path
            fill="currentColor"
            d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
          />
        </svg>
      ),
    },

    {
      label: "FAQ",
      href: "/faq",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 256 256"
        >
          <path
            fill="currentColor"
            d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
          />
        </svg>
      ),
    },
  ];

  const navItems = mounted && user ? authNavItems : guestNavItems;

  const isActive = (href?: string) => href && pathname === href;

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  // Determine if this is being rendered as mobile drawer
  const isMobileMode = typeof isOpen !== "undefined";

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileMode && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 
          text-white shadow-2xl z-50 overflow-y-auto
          transition-all duration-300 ease-out
          ${
            isMobileMode
              ? isOpen
                ? "translate-x-0 opacity-100"
                : "-translate-x-full opacity-0"
              : "hidden lg:block lg:w-64"
          }
        `}
      >
        {/* Close button for mobile - positioned in header area */}
        {isMobileMode && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 lg:hidden z-10"
            aria-label="Закрыть меню"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 256 256"
            >
              <path
                fill="currentColor"
                d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
              />
            </svg>
          </button>
        )}

        {/* Logo - sticky header */}
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md px-4 py-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <img
              src="/upscalemedia-transformed.png"
              alt="Plexus"
              className="w-10 h-10"
            />
            <span className="font-bold text-lg tracking-tight">Plexus</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-5 space-y-1">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-blue-100 hover:bg-blue-700/60"
                  }`}
                >
                  {item.icon}
                  <span className="font-semibold">{item.label}</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-blue-100 hover:bg-blue-700/60 hover:text-white"
                  >
                    {item.icon}
                    <span className="font-semibold flex-1 text-left">
                      {item.label}
                    </span>
                    {item.children && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 256 256"
                        className={`transition-transform duration-300 ${
                          expandedItems.includes(item.label) ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          fill="currentColor"
                          d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Submenu */}
                  {item.children && expandedItems.includes(item.label) && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-500">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href || "#"}
                          onClick={onClose}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                            isActive(child.href)
                              ? "bg-blue-600 text-white shadow-md translate-x-1"
                              : "text-blue-200 hover:text-white hover:bg-blue-700/50"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 256 256"
                          >
                            <path
                              fill="currentColor"
                              d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z"
                            />
                          </svg>
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
          {mounted && user ? (
            <>
              <Link href="/profile" onClick={onClose}>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-blue-100 hover:bg-blue-700 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 256 256"
                  >
                    <path
                      fill="currentColor"
                      d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Z"
                    />
                  </svg>
                  <span className="font-semibold">Настройки</span>
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-blue-100 hover:bg-red-700 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 256 256"
                >
                  <path
                    fill="currentColor"
                    d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z"
                  />
                </svg>
                <span className="font-semibold">Выход</span>
              </button>
            </>
          ) : mounted ? (
            <>
              <Link href="/auth/login" className="w-full" onClick={onClose}>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-white bg-blue-600 hover:bg-blue-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 256 256"
                  >
                    <path
                      fill="currentColor"
                      d="M141.66,133.66l-40,40a8,8,0,0,1-11.32-11.32L116.69,136H24a8,8,0,0,1,0-16h92.69L90.34,93.66a8,8,0,0,1,11.32-11.32l40,40A8,8,0,0,1,141.66,133.66ZM192,32H136a8,8,0,0,0,0,16h56V208H136a8,8,0,0,0,0,16h56a16,16,0,0,0,16-16V48A16,16,0,0,0,192,32Z"
                    />
                  </svg>
                  <span className="font-semibold">Войти</span>
                </button>
              </Link>
              <Link href="/auth/register" className="w-full" onClick={onClose}>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-blue-100 hover:bg-blue-700 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 256 256"
                  >
                    <path
                      fill="currentColor"
                      d="M256,136a8,8,0,0,1-8,8H232v16a8,8,0,0,1-16,0V144H200a8,8,0,0,1,0-16h16V112a8,8,0,0,1,16,0v16h16A8,8,0,0,1,256,136Zm-57.87,58.85a8,8,0,0,1-12.26,10.3C165.75,181.19,138.09,168,108,168s-57.75,13.19-77.87,37.15a8,8,0,0,1-12.25-10.3c14.94-17.78,33.52-30.41,54.17-37.17a68,68,0,1,1,71.9,0C164.6,164.44,183.18,177.07,198.13,194.85ZM108,152a52,52,0,1,0-52-52A52.06,52.06,0,0,0,108,152Z"
                    />
                  </svg>
                  <span className="font-semibold">Регистрация</span>
                </button>
              </Link>
            </>
          ) : null}
        </div>
      </aside>
    </>
  );
};
