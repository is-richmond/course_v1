"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="font-bold text-gray-900 hidden sm:inline">MediCourse</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
            Главная
          </Link>
          <Link href="#courses" className="text-gray-700 hover:text-blue-600 transition">
            Курсы
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-blue-600 transition">
            О нас
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition">
            Контакты
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* CTA Button */}
        <div className="hidden sm:block">
          <Button size="sm" variant="primary">
            Записаться
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4">
          <nav className="flex flex-col gap-4">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Главная
            </Link>
            <Link href="#courses" className="text-gray-700 hover:text-blue-600">
              Курсы
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600">
              О нас
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">
              Контакты
            </Link>
            <Button size="sm" variant="primary" className="w-full">
              Записаться
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};
